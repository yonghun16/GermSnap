import type { Point3D } from '../types';
import type { DisplayRect } from './displayRect';

export interface GermObject {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number; // degrees
  scale: number;
  /** assets/germs/의 실제 세균 이미지 중 어떤 종류를 쓸지 (0 ~ GERM_TYPE_COUNT-1) */
  typeIndex: number;
}

// 실제로 쓰는 세균 이미지 종류 수. 한 손에 10종류가 다 보이면 너무 산만해서
// 모양/색이 겹치지 않는 6종만 골라 씀 (ResultScreen의 germImages 배열과 개수를 맞출 것).
export const GERM_TYPE_COUNT = 6;

const GERM_BASE_SIZE = 24;
// 03_Germ_and_Clean_Rendering.md 원안은 15~30개였지만, 실사용 피드백에 따라
// 좀 더 북적이게 늘렸다.
const MIN_GERM_COUNT = 35;
const MAX_GERM_COUNT = 60;
// 원래 03_Germ_and_Clean_Rendering.md 스펙은 ±20~40px였지만, 실기기 테스트에서
// 손가락 끝 등 가장자리 랜드마크 기준으로 이 정도 반경이면 세균이 손 밖으로
// 튀어나가는 경우가 있어 더 촘촘하게 좁혔다.
const MIN_OFFSET_RADIUS = 8;
const MAX_OFFSET_RADIUS = 18;
const MIN_OPACITY = 0.4;
const MAX_OPACITY = 0.7;
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.3;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * 21개 손 좌표를 기준으로 세균 35~60개를 무작위 배치한다.
 * (docs/content/03_Germ_and_Clean_Rendering.md - 세균 좌표 분산 알고리즘)
 *
 * MediaPipe 정규화 좌표(0.0~1.0)를 화면 픽셀 좌표로 변환한 뒤
 * (rect.x + x * rect.width, rect.y + y * rect.height) 각 세균마다 ±20~40px
 * 랜덤 오프셋을 적용한다. rect는 사진이 실제로 표시되는 영역(letterbox 보정 포함)이다.
 */
export const generateGerms = (landmarks: Point3D[], rect: DisplayRect): GermObject[] => {
  if (landmarks.length === 0) {
    return [];
  }

  const count = Math.round(randomBetween(MIN_GERM_COUNT, MAX_GERM_COUNT));
  const germs: GermObject[] = [];

  for (let i = 0; i < count; i++) {
    const landmark = landmarks[Math.floor(Math.random() * landmarks.length)];
    const centerX = rect.x + landmark.x * rect.width;
    const centerY = rect.y + landmark.y * rect.height;
    const angle = randomBetween(0, Math.PI * 2);
    const offsetRadius = randomBetween(MIN_OFFSET_RADIUS, MAX_OFFSET_RADIUS);
    // GermSprite/DummyGerm은 (x, y)를 바운딩 박스 좌상단으로 취급하므로,
    // 세균의 시각적 중심이 오프셋 지점에 오도록 절반 크기만큼 보정한다.
    const halfSize = GERM_BASE_SIZE / 2;

    germs.push({
      id: `germ-${i}`,
      x: centerX + Math.cos(angle) * offsetRadius - halfSize,
      y: centerY + Math.sin(angle) * offsetRadius - halfSize,
      size: GERM_BASE_SIZE,
      opacity: randomBetween(MIN_OPACITY, MAX_OPACITY),
      rotation: randomBetween(0, 360),
      scale: randomBetween(MIN_SCALE, MAX_SCALE),
      typeIndex: Math.floor(Math.random() * GERM_TYPE_COUNT),
    });
  }

  return germs;
};
