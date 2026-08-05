export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type WashMode = 'BEFORE' | 'AFTER';

export interface AppState {
  washMode: WashMode; // 현재 촬영 모드
  photoUri: string | null; // 촬영된 정지 이미지 경로
  handLandmarks: Point3D[]; // MediaPipe가 반환한 21개 좌표
  isCleanMode: boolean; // 히든 버튼 클릭 시 토글되는 상태
}
