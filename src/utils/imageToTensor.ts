import { Skia, ColorType, AlphaType } from '@shopify/react-native-skia';
import type { Tensor } from 'react-native-fast-tflite';

type TensorDataType = Tensor['dataType'];

interface ImageToTensorOptions {
  width: number;
  height: number;
  /** 모델 입력 텐서의 dtype. 'uint8'이면 0~255 그대로, 그 외(float 계열)면 0~1로 정규화한다. */
  dataType: TensorDataType;
}

/**
 * 정지 이미지 URI를 디코딩해 모델 입력 크기로 리사이즈하고,
 * RGB 픽셀 버퍼(ArrayBuffer)로 변환한다.
 * (docs/content/02_Camera_and_AI.md - 정지 이미지 캡처 후 분석)
 */
export const imageToTensor = async (
  uri: string,
  { width, height, dataType }: ImageToTensorOptions
): Promise<ArrayBuffer> => {
  const data = await Skia.Data.fromURI(uri);
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) {
    throw new Error(`이미지를 디코딩할 수 없습니다: ${uri}`);
  }

  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (!surface) {
    throw new Error('오프스크린 Surface 생성에 실패했습니다.');
  }

  const canvas = surface.getCanvas();
  const srcRect = Skia.XYWHRect(0, 0, image.width(), image.height());
  const destRect = Skia.XYWHRect(0, 0, width, height);
  const paint = Skia.Paint();
  canvas.drawImageRect(image, srcRect, destRect, paint);
  surface.flush();

  const resized = surface.makeImageSnapshot();
  const rgba = resized.readPixels(0, 0, {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  }) as Uint8Array | null;

  if (!rgba) {
    throw new Error('리사이즈된 이미지의 픽셀을 읽을 수 없습니다.');
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
