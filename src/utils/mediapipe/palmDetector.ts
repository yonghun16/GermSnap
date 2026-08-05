import type { SkImage } from '@shopify/react-native-skia';
import { getPalmDetectorModel } from '../tfliteModel';
import { letterboxImageToTensor } from './tensorRender';
import type { LetterboxInfo } from './tensorRender';
import { generatePalmDetectorAnchors, PALM_DETECTOR_NUM_ANCHORS } from './anchors';
import { totalElements, toNumericArray, sigmoid } from './tensorUtils';

// MediaPipe palm_detection_cpu.pbtxt (TensorsToDetectionsCalculatorOptions) 기준.
const NUM_COORDS = 18; // 4(box) + 7*2(keypoints)
const KEYPOINT_COORD_OFFSET = 4;
const NUM_KEYPOINTS = 7;
const BOX_SCALE = 192; // x_scale=y_scale=w_scale=h_scale=192
const SCORE_CLIP = 100;
const MIN_SCORE_THRESH = 0.5;

export const WRIST_KEYPOINT_INDEX = 0;
export const MIDDLE_FINGER_MCP_KEYPOINT_INDEX = 2;

export interface PalmDetection {
  /** 원본 사진 전체 기준 정규화 좌표 (0~1) */
  bbox: { xCenter: number; yCenter: number; width: number; height: number };
  keypoints: { x: number; y: number }[];
  score: number;
}

const anchors = generatePalmDetectorAnchors();

const removeLetterboxPoint = (xNorm: number, yNorm: number, lb: LetterboxInfo, destSize: number) => {
  const xPx = xNorm * destSize;
  const yPx = yNorm * destSize;
  return {
    x: (xPx - lb.offsetX) / lb.scaledWidth,
    y: (yPx - lb.offsetY) / lb.scaledHeight,
  };
};

const removeLetterboxLength = (lenNorm: number, destSize: number, scaledDim: number) =>
  (lenNorm * destSize) / scaledDim;

/**
 * MediaPipe 팔바닥(palm) 탐지 1단계. 사진 전체에서 손바닥 위치/크기와
 * 회전 정렬용 키포인트 7개를 찾는다. 손이 없거나 신뢰도가 낮으면 null.
 */
export const detectPalm = async (image: SkImage): Promise<PalmDetection | null> => {
  const model = await getPalmDetectorModel();

  const inputTensor = model.inputs[0];
  const destSize = inputTensor.shape[1] && inputTensor.shape[1] > 0 ? inputTensor.shape[1] : 192;

  const { buffer, letterbox } = letterboxImageToTensor(image, destSize, inputTensor.dataType);
  const outputs = await model.run([buffer]);

  const boxesIndex = model.outputs.findIndex(
    (t) => totalElements(t.shape) === PALM_DETECTOR_NUM_ANCHORS * NUM_COORDS
  );
  const scoresIndex = model.outputs.findIndex(
    (t) => totalElements(t.shape) === PALM_DETECTOR_NUM_ANCHORS
  );

  if (boxesIndex === -1 || scoresIndex === -1) {
    throw new Error('예상하지 못한 palm detector 출력 형식입니다.');
  }

  const rawBoxes = toNumericArray(outputs[boxesIndex], model.outputs[boxesIndex].dataType);
  const rawScores = toNumericArray(outputs[scoresIndex], model.outputs[scoresIndex].dataType);

  let bestIndex = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < PALM_DETECTOR_NUM_ANCHORS; i++) {
    const clipped = Math.max(-SCORE_CLIP, Math.min(SCORE_CLIP, Number(rawScores[i])));
    const score = sigmoid(clipped);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex === -1 || bestScore < MIN_SCORE_THRESH) {
    return null;
  }

  const anchor = anchors[bestIndex];
  const offset = bestIndex * NUM_COORDS;

  // reverse_output_order: true -> XYWH 순서 (docs: tensors_to_detections_calculator.cc)
  const xCenterTensor = Number(rawBoxes[offset]) / BOX_SCALE + anchor.xCenter;
  const yCenterTensor = Number(rawBoxes[offset + 1]) / BOX_SCALE + anchor.yCenter;
  const widthTensor = Number(rawBoxes[offset + 2]) / BOX_SCALE;
  const heightTensor = Number(rawBoxes[offset + 3]) / BOX_SCALE;

  const center = removeLetterboxPoint(xCenterTensor, yCenterTensor, letterbox, destSize);
  const width = removeLetterboxLength(widthTensor, destSize, letterbox.scaledWidth);
  const height = removeLetterboxLength(heightTensor, destSize, letterbox.scaledHeight);

  const keypoints: { x: number; y: number }[] = [];
  for (let k = 0; k < NUM_KEYPOINTS; k++) {
    const kpOffset = offset + KEYPOINT_COORD_OFFSET + k * 2;
    const kpXTensor = Number(rawBoxes[kpOffset]) / BOX_SCALE + anchor.xCenter;
    const kpYTensor = Number(rawBoxes[kpOffset + 1]) / BOX_SCALE + anchor.yCenter;
    keypoints.push(removeLetterboxPoint(kpXTensor, kpYTensor, letterbox, destSize));
  }

  return {
    bbox: { xCenter: center.x, yCenter: center.y, width, height },
    keypoints,
    score: bestScore,
  };
};
