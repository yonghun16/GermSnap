import { Skia, ColorType, AlphaType } from '@shopify/react-native-skia';
import type { SkImage, SkSurface } from '@shopify/react-native-skia';
import type { Tensor } from 'react-native-fast-tflite';

export type TensorDataType = Tensor['dataType'];

export interface LetterboxInfo {
  /** 원본 픽셀 -> destSize 픽셀 스케일 */
  scale: number;
  /** destSize 캔버스 안에서 실제 이미지가 시작하는 픽셀 오프셋 */
  offsetX: number;
  offsetY: number;
  /** destSize 캔버스 안에서 실제 이미지가 차지하는 픽셀 크기 */
  scaledWidth: number;
  scaledHeight: number;
}

export const decodeImage = async (uri: string): Promise<SkImage> => {
  const data = await Skia.Data.fromURI(uri);
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) {
    throw new Error(`이미지를 디코딩할 수 없습니다: ${uri}`);
  }
  return image;
};

/** 오프스크린 Surface의 픽셀을 읽어 모델 dtype에 맞는 RGB ArrayBuffer로 변환한다. */
const surfaceToTensorBuffer = (
  surface: SkSurface,
  width: number,
  height: number,
  dataType: TensorDataType
): ArrayBuffer => {
  surface.flush();
  const snapshot = surface.makeImageSnapshot();
  const rgba = snapshot.readPixels(0, 0, {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  }) as Uint8Array | null;

  if (!rgba) {
    throw new Error('이미지 픽셀을 읽을 수 없습니다.');
  }

  const pixelCount = width * height;
  const isFloat = dataType !== 'uint8' && dataType !== 'int8';

  if (isFloat) {
    const rgb = new Float32Array(pixelCount * 3);
    for (let i = 0; i < pixelCount; i++) {
      rgb[i * 3] = rgba[i * 4] / 255;
      rgb[i * 3 + 1] = rgba[i * 4 + 1] / 255;
      rgb[i * 3 + 2] = rgba[i * 4 + 2] / 255;
    }
    return rgb.buffer;
  }

  const rgb = new Uint8Array(pixelCount * 3);
  for (let i = 0; i < pixelCount; i++) {
    rgb[i * 3] = rgba[i * 4];
    rgb[i * 3 + 1] = rgba[i * 4 + 1];
    rgb[i * 3 + 2] = rgba[i * 4 + 2];
  }
  return rgb.buffer;
};

/**
 * 이미지 전체를 정사각형(destSize x destSize) 안에 종횡비를 유지한 채 맞춘다
 * (letterbox, 여백은 투명/검정). MediaPipe의 ImageToTensorCalculator
 * (keep_aspect_ratio: true, border_mode: BORDER_ZERO)와 동일한 방식 —
 * palm detector 입력 전처리에 사용.
 */
export const letterboxImageToTensor = (
  image: SkImage,
  destSize: number,
  dataType: TensorDataType
): { buffer: ArrayBuffer; letterbox: LetterboxInfo } => {
  const imgW = image.width();
  const imgH = image.height();
  const scale = Math.min(destSize / imgW, destSize / imgH);
  const scaledWidth = imgW * scale;
  const scaledHeight = imgH * scale;
  const offsetX = (destSize - scaledWidth) / 2;
  const offsetY = (destSize - scaledHeight) / 2;

  const surface = Skia.Surface.MakeOffscreen(destSize, destSize);
  if (!surface) {
    throw new Error('오프스크린 Surface 생성에 실패했습니다.');
  }
  const canvas = surface.getCanvas();
  const srcRect = Skia.XYWHRect(0, 0, imgW, imgH);
  const destRect = Skia.XYWHRect(offsetX, offsetY, scaledWidth, scaledHeight);
  canvas.drawImageRect(image, srcRect, destRect, Skia.Paint());

  const buffer = surfaceToTensorBuffer(surface, destSize, destSize, dataType);
  return { buffer, letterbox: { scale, offsetX, offsetY, scaledWidth, scaledHeight } };
};

export interface RotatedRoi {
  /** 원본 이미지 기준 정규화 좌표 (0~1) */
  centerX: number;
  centerY: number;
  /** 원본 이미지 기준 정규화 크기 (0~1) */
  width: number;
  height: number;
  /** 라디안 */
  rotation: number;
}

// canvas.rotate()로 적용하는 회전 방향. 실기기에서 손 방향이 뒤집혀 보이면
// 가장 먼저 이 부호를 뒤집어서 확인할 것 (수학적으로 유도했지만 Skia의 실제
// 회전 방향 규약은 기기 렌더링으로만 100% 검증 가능).
const ROTATE_SIGN = -1;

const rotateVec = (x: number, y: number, angle: number) => ({
  x: x * Math.cos(angle) - y * Math.sin(angle),
  y: x * Math.sin(angle) + y * Math.cos(angle),
});

/**
 * 회전 정렬된 사각 영역을 잘라 destSize x destSize 정사각형 텐서로 렌더링한다.
 * MediaPipe의 ImageToTensorCalculator(ROI 기반, 회전 지원)와 동일한 역할 —
 * hand landmark 모델 입력 전처리에 사용.
 */
export const rotatedCropToTensor = (
  image: SkImage,
  roi: RotatedRoi,
  destSize: number,
  dataType: TensorDataType
): ArrayBuffer => {
  const imgW = image.width();
  const imgH = image.height();
  const cropCenterXPx = roi.centerX * imgW;
  const cropCenterYPx = roi.centerY * imgH;
  const cropWidthPx = roi.width * imgW;
  const cropHeightPx = roi.height * imgH;

  const surface = Skia.Surface.MakeOffscreen(destSize, destSize);
  if (!surface) {
    throw new Error('오프스크린 Surface 생성에 실패했습니다.');
  }
  const canvas = surface.getCanvas();
  const rotationDegrees = (ROTATE_SIGN * roi.rotation * 180) / Math.PI;

  canvas.save();
  canvas.translate(destSize / 2, destSize / 2);
  canvas.rotate(rotationDegrees, 0, 0);
  canvas.scale(destSize / cropWidthPx, destSize / cropHeightPx);
  canvas.translate(-cropCenterXPx, -cropCenterYPx);
  canvas.drawImage(image, 0, 0, Skia.Paint());
  canvas.restore();

  return surfaceToTensorBuffer(surface, destSize, destSize, dataType);
};

/**
 * rotatedCropToTensor로 잘라낸 destSize 텐서 안의 정규화 좌표(0~1)를
 * 원본 이미지 전체 기준 정규화 좌표로 역변환한다 (위 함수의 역변환, 반드시
 * ROTATE_SIGN 및 변환 순서를 동일하게 유지해야 함).
 */
export const inverseRotatedPoint = (
  xInCrop: number,
  yInCrop: number,
  roi: RotatedRoi,
  destSize: number,
  imageWidth: number,
  imageHeight: number
): { x: number; y: number } => {
  const cropCenterXPx = roi.centerX * imageWidth;
  const cropCenterYPx = roi.centerY * imageHeight;
  const cropWidthPx = roi.width * imageWidth;
  const cropHeightPx = roi.height * imageHeight;

  const dx = xInCrop * destSize - destSize / 2;
  const dy = yInCrop * destSize - destSize / 2;

  const rotationDegrees = (ROTATE_SIGN * roi.rotation * 180) / Math.PI;
  const rotationRadians = (rotationDegrees * Math.PI) / 180;
  const unrotated = rotateVec(dx, dy, -rotationRadians);

  const srcX = unrotated.x / (destSize / cropWidthPx) + cropCenterXPx;
  const srcY = unrotated.y / (destSize / cropHeightPx) + cropCenterYPx;

  return { x: srcX / imageWidth, y: srcY / imageHeight };
};
