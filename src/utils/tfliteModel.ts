import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TfliteModel } from 'react-native-fast-tflite';

// Google MediaPipe 공식 hand_landmark_lite 모델 (Apache-2.0)
// https://storage.googleapis.com/mediapipe-assets/hand_landmark_lite.tflite
// 입력: 손이 화면 중앙에 위치한 정사각형 크롭 이미지 1장 (팔 검출기 없이 단일 모델로 추론)
const HAND_LANDMARK_MODEL = require('../../assets/models/hand_landmark_lite.tflite');

let modelPromise: Promise<TfliteModel> | null = null;

/** 모델을 최초 1회만 로드하고 이후 호출에서는 캐시된 인스턴스를 재사용한다. */
export const getHandLandmarkModel = (): Promise<TfliteModel> => {
  if (!modelPromise) {
    modelPromise = loadTensorflowModel(HAND_LANDMARK_MODEL, []).catch((error) => {
      modelPromise = null; // 실패 시 다음 호출에서 재시도할 수 있도록 캐시를 비운다.
      throw error;
    });
  }
  return modelPromise;
};
