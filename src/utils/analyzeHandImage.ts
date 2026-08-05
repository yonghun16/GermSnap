import type { Point3D } from '../types';
import { getHandLandmarkModel } from './tfliteModel';
import { imageToTensor } from './imageToTensor';

const NUM_LANDMARKS = 21;
const LANDMARK_TENSOR_LENGTH = NUM_LANDMARKS * 3; // x, y, z

// hand_landmark_lite 모델의 "손이 실제로 존재하는가" 신뢰도 임계값.
// MediaPipe 공식 그래프의 기본 권장값(0.5)을 사용하되, 실기기 테스트 후 보정이 필요할 수 있다.
const PRESENCE_THRESHOLD = 0.5;

const resolveDim = (value: number | undefined, fallback: number) =>
  value && value > 0 ? value : fallback;

const totalElements = (shape: number[]) =>
  shape.reduce((acc, n) => acc * Math.max(n, 1), 1);

const toNumericArray = (buffer: ArrayBuffer, dataType: string) => {
  switch (dataType) {
    case 'uint8':
      return new Uint8Array(buffer);
    case 'int8':
      return new Int8Array(buffer);
    default:
      return new Float32Array(buffer);
  }
};

/**
 * MediaPipe Hand Landmarker(hand_landmark_lite, 온디바이스 TFLite) 연동.
 * 정지 이미지 URI를 받아 21개 손 좌표(정규화된 x/y/z, 0.0~1.0)를 반환한다.
 * 손이 인식되지 않으면 null을 반환한다. (docs/content/02_Camera_and_AI.md)
 *
 * 팔 검출기(palm detector) 단계 없이 hand_landmark 모델만 단독으로 사용한다.
 * CameraScreen의 손 모양 가이드라인 UX가 팔 검출기 역할(위치/크기 정렬)을 대신하므로,
 * 손이 가이드라인 밖에 있거나 화면에서 너무 작게 찍히면 인식률이 떨어질 수 있다.
 */
export const analyzeHandImage = async (uri: string): Promise<Point3D[] | null> => {
  const model = await getHandLandmarkModel();

  const inputTensor = model.inputs[0];
  const [, rawHeight, rawWidth] = inputTensor.shape; // NHWC: [batch, height, width, channels]
  const modelHeight = resolveDim(rawHeight, 224);
  const modelWidth = resolveDim(rawWidth, 224);

  const inputBuffer = await imageToTensor(uri, {
    width: modelWidth,
    height: modelHeight,
    dataType: inputTensor.dataType,
  });

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

  const landmarks: Point3D[] = [];
  for (let i = 0; i < NUM_LANDMARKS; i++) {
    landmarks.push({
      x: Number(landmarkValues[i * 3]) / modelWidth,
      y: Number(landmarkValues[i * 3 + 1]) / modelHeight,
      z: Number(landmarkValues[i * 3 + 2]) / modelWidth,
    });
  }

  return landmarks;
};
