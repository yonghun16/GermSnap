export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type WashMode = 'BEFORE' | 'AFTER';

// 균 표시 방식: 현미경 모드(실제 세균 사진, 최대 10배 확대) vs
// 캐릭터 모드(귀여운 캐릭터 세균 도형, 최대 4배 확대). 저학년 등 사실적인
// 세균 사진을 무서워하는 아이들을 위해 두 모드로 나눠 달라는 피드백에 따라 도입.
export type GermDisplayMode = 'MICROSCOPE' | 'CHARACTER';

export interface AppState {
  washMode: WashMode; // 현재 촬영 모드
  photoUri: string | null; // 촬영된 정지 이미지 경로
  handLandmarks: Point3D[]; // MediaPipe가 반환한 21개 좌표
  isCleanMode: boolean; // 히든 버튼 클릭 시 토글되는 상태
}
