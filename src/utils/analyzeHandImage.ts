import type { Point3D } from '../types';

/**
 * MediaPipe Hand Landmarker 연동 지점.
 * 정지 이미지 URI를 받아 21개 손 좌표(정규화된 x/y/z)를 반환한다.
 * 실제 On-Device MediaPipe 연동은 Phase 3에서 구현 예정이며,
 * 현재는 CameraScreen의 촬영→스캔→예외처리 흐름을 검증하기 위한 인터페이스 스텁이다.
 */
export const analyzeHandImage = async (uri: string): Promise<Point3D[] | null> => {
  throw new Error(`analyzeHandImage not implemented yet (Phase 3): ${uri}`);
};
