import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TfliteModel } from 'react-native-fast-tflite';

// Google MediaPipe 공식 모델 (Apache-2.0), storage.googleapis.com/mediapipe-assets/
const HAND_LANDMARK_MODEL = require('../../assets/models/hand_landmark_lite.tflite');
const PALM_DETECTION_MODEL = require('../../assets/models/palm_detection_lite.tflite');

let handLandmarkPromise: Promise<TfliteModel> | null = null;
let palmDetectorPromise: Promise<TfliteModel> | null = null;

/** hand_landmark_lite 모델을 최초 1회만 로드하고 이후 호출에서는 캐시된 인스턴스를 재사용한다. */
export const getHandLandmarkModel = (): Promise<TfliteModel> => {
  if (!handLandmarkPromise) {
    handLandmarkPromise = loadTensorflowModel(HAND_LANDMARK_MODEL, []).catch((error) => {
      handLandmarkPromise = null; // 실패 시 다음 호출에서 재시도할 수 있도록 캐시를 비운다.
      throw error;
    });
  }
  return handLandmarkPromise;
};

/** palm_detection_lite 모델을 최초 1회만 로드하고 이후 호출에서는 캐시된 인스턴스를 재사용한다. */
export const getPalmDetectorModel = (): Promise<TfliteModel> => {
  if (!palmDetectorPromise) {
    palmDetectorPromise = loadTensorflowModel(PALM_DETECTION_MODEL, []).catch((error) => {
      palmDetectorPromise = null;
      throw error;
    });
  }
  return palmDetectorPromise;
};
