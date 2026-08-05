import type { Point3D } from '../types';
import { getHandLandmarkModel } from './tfliteModel';
import { decodeImage, rotatedCropToTensor, inverseRotatedPoint } from './mediapipe/tensorRender';
import { detectPalm } from './mediapipe/palmDetector';
import { computeHandRoi } from './mediapipe/handRoi';
import { totalElements, toNumericArray } from './mediapipe/tensorUtils';

const NUM_LANDMARKS = 21;
const LANDMARK_TENSOR_LENGTH = NUM_LANDMARKS * 3; // x, y, z

// hand_landmark_lite 모델의 "손이 실제로 존재하는가" 신뢰도 임계값.
// MediaPipe 공식 그래프의 기본 권장값(0.5)을 사용하되, 실기기 테스트 후 보정이 필요할 수 있다.
const PRESENCE_THRESHOLD = 0.5;

const resolveDim = (value: number | undefined, fallback: number) =>
  value && value > 0 ? value : fallback;

/**
 * MediaPipe Hand Landmarker 2단계 파이프라인(온디바이스 TFLite):
 *   1) palm detector로 손바닥 위치 + 회전 정렬용 키포인트를 찾고
 *   2) 손목→중지 MCP 벡터가 수직이 되도록 회전 정렬한 정사각 영역을 크롭해
 *      hand_landmark 모델에 넣는다.
 * 정지 이미지 URI를 받아 21개 손 좌표(정규화된 x/y/z, 0.0~1.0, 원본 사진 전체 기준)를
 * 반환한다. 손이 인식되지 않으면 null을 반환한다. (docs/content/02_Camera_and_AI.md)
 */
export const analyzeHandImage = async (uri: string): Promise<Point3D[] | null> => {
  const image = await decodeImage(uri);
  const imageWidth = image.width();
  const imageHeight = image.height();

  const palm = await detectPalm(image);
  if (!palm) {
    return null; // 02_Camera_and_AI.md: 손이 인식되지 않은 경우
  }

  const roi = computeHandRoi(palm, imageWidth, imageHeight);

  const model = await getHandLandmarkModel();
  const inputTensor = model.inputs[0];
  const [, rawHeight, rawWidth] = inputTensor.shape; // NHWC: [batch, height, width, channels]
  const modelHeight = resolveDim(rawHeight, 224);
  const modelWidth = resolveDim(rawWidth, 224);
  // 정사각(square_long) crop이므로 폭/높이 중 하나만 destSize로 사용해도 된다.
  const destSize = Math.max(modelWidth, modelHeight);

  const inputBuffer = rotatedCropToTensor(image, roi, destSize, inputTensor.dataType);
  const outputs = await model.run([inputBuffer]);

  // hand_landmark_lite는 [landmarks(63), presence(1), handedness(1), world_landmarks(63)]
  // 순서로 출력한다 (MediaPipe 공식 그래프 구성 기준). world_landmarks도 길이가 63으로
  // 동일하므로, 텐서 배열에서 "가장 먼저 등장하는" 63-길이 출력을 이미지 좌표계
  // landmarks로 채택한다.
  const landmarksIndex = model.outputs.findIndex(
    (tensor) => totalElements(tensor.shape) === LANDMARK_TENSOR_LENGTH
  );
  const presenceIndex = model.outputs.findIndex(
    (tensor) => totalElements(tensor.shape) === 1
  );

  if (landmarksIndex === -1 || presenceIndex === -1) {
    throw new Error('예상하지 못한 모델 출력 형식입니다.');
  }

  const presenceValues = toNumericArray(
    outputs[presenceIndex],
    model.outputs[presenceIndex].dataType
  );
  const presenceScore = Number(presenceValues[0]);

  if (!Number.isFinite(presenceScore) || presenceScore < PRESENCE_THRESHOLD) {
    return null; // 02_Camera_and_AI.md: 손이 인식되지 않은 경우
  }

  const landmarkValues = toNumericArray(
    outputs[landmarksIndex],
    model.outputs[landmarksIndex].dataType
  );

  // 모델 출력은 회전 정렬된 crop 영역 기준 좌표이므로, 원본 사진 전체 기준
  // 정규화 좌표로 역변환한다 (ResultScreen은 원본 사진 위에 그리므로).
  const landmarks: Point3D[] = [];
  for (let i = 0; i < NUM_LANDMARKS; i++) {
    const xInCrop = Number(landmarkValues[i * 3]) / modelWidth;
    const yInCrop = Number(landmarkValues[i * 3 + 1]) / modelHeight;
    const z = Number(landmarkValues[i * 3 + 2]) / modelWidth;

    const { x, y } = inverseRotatedPoint(xInCrop, yInCrop, roi, destSize, imageWidth, imageHeight);
    landmarks.push({ x, y, z });
  }

  return landmarks;
};
