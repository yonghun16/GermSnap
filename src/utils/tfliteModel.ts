import { Asset } from 'expo-asset';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TfliteModel } from 'react-native-fast-tflite';

// Google MediaPipe 공식 모델 (Apache-2.0), storage.googleapis.com/mediapipe-assets/
const HAND_LANDMARK_MODULE = require('../../assets/models/hand_landmark_lite.tflite');
const PALM_DETECTION_MODULE = require('../../assets/models/palm_detection_lite.tflite');

let handLandmarkPromise: Promise<TfliteModel> | null = null;
let palmDetectorPromise: Promise<TfliteModel> | null = null;

/**
 * require()로 번들된 애셋을 react-native-fast-tflite에 바로 넘기면(loadTensorflowModel(require(...)))
 * 디버그(Metro가 HTTP로 서빙)에서는 우연히 동작하지만, release APK에서는
 * "MalformedURLException: no protocol" 에러로 실패한다 (실기기에서 확인됨) —
 * Expo가 release 번들에서 애셋을 참조하는 방식이 이 라이브러리가 기대하는
 * URL 형식과 다르기 때문. expo-asset으로 실제 로컬 file:// 경로를 받아
 * { url } 형태로 넘기면 디버그/release 모두 안전하게 동작한다.
 */
const resolveModelUri = async (assetModule: number): Promise<string> => {
  const asset = await Asset.fromModule(assetModule).downloadAsync();
  if (!asset.localUri) {
    throw new Error('모델 애셋의 로컬 경로를 확인할 수 없습니다.');
  }
  return asset.localUri;
};

/** hand_landmark_lite 모델을 최초 1회만 로드하고 이후 호출에서는 캐시된 인스턴스를 재사용한다. */
export const getHandLandmarkModel = (): Promise<TfliteModel> => {
  if (!handLandmarkPromise) {
    handLandmarkPromise = resolveModelUri(HAND_LANDMARK_MODULE)
      .then((url) => loadTensorflowModel({ url }, []))
      .catch((error) => {
        handLandmarkPromise = null; // 실패 시 다음 호출에서 재시도할 수 있도록 캐시를 비운다.
        throw error;
      });
  }
  return handLandmarkPromise;
};

/** palm_detection_lite 모델을 최초 1회만 로드하고 이후 호출에서는 캐시된 인스턴스를 재사용한다. */
export const getPalmDetectorModel = (): Promise<TfliteModel> => {
  if (!palmDetectorPromise) {
    palmDetectorPromise = resolveModelUri(PALM_DETECTION_MODULE)
      .then((url) => loadTensorflowModel({ url }, []))
      .catch((error) => {
        palmDetectorPromise = null;
        throw error;
      });
  }
  return palmDetectorPromise;
};
