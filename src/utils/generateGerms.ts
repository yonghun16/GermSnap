import type { Point3D } from '../types';
import type { DisplayRect } from './displayRect';
import { buildHandSilhouette, isPointOnHand } from './handSilhouette';
import type { HandSilhouette } from './handSilhouette';
import type { Point2D } from './geometry';

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
  /** 숨쉬기(breathing) 애니메이션의 위상 오프셋(라디안) — 세균마다 달라서
   * 다 같이 숨쉬지 않고 제각각 살아있는 것처럼 보이게 한다. */
  phaseOffset: number;
}

// 실제로 쓰는 세균 이미지 종류 수. 한 손에 10종류가 다 보이면 너무 산만해서
// 모양/색이 겹치지 않는 6종만 골라 씀 (ResultScreen의 germImages 배열과 개수를 맞출 것).
export const GERM_TYPE_COUNT = 6;

const GERM_BASE_SIZE = 24;
// 03_Germ_and_Clean_Rendering.md 원안은 15~30개였지만, 실사용 피드백에 따라
// 좀 더 북적이게 늘렸다.
const MIN_GERM_COUNT = 55;
const MAX_GERM_COUNT = 90;
const MAX_SAMPLE_ATTEMPTS = 30;
const MIN_OPACITY = 0.4;
const MAX_OPACITY = 0.7;
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.3;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/** 손 실루엣(손가락 캡슐 + 손바닥 다각형) 위에서 균일 분포로 무작위 점을 뽑는다
 * (rejection sampling). */
const samplePointOnHand = (silhouette: HandSilhouette): Point2D => {
  for (let attempt = 0; attempt < MAX_SAMPLE_ATTEMPTS; attempt++) {
    const candidate = {
      x: randomBetween(silhouette.bounds.minX, silhouette.bounds.maxX),
      y: randomBetween(silhouette.bounds.minY, silhouette.bounds.maxY),
    };
    if (isPointOnHand(candidate, silhouette)) {
      return candidate;
    }
  }
  // 계속 실패하면(거의 없는 경우) 무작위 손가락 마디 위 점으로 폴백한다 —
  // 완전히 사라지는 것보다 낫다.
  const segment = silhouette.fingerSegments[Math.floor(Math.random() * silhouette.fingerSegments.length)];
  return { x: (segment.a.x + segment.b.x) / 2, y: (segment.a.y + segment.b.y) / 2 };
};

/**
 * 21개 손 좌표로 손 실루엣(손가락 캡슐 + 손바닥 다각형)을 만들고, 그 위에
 * 세균 55~90개를 균일하고 무작위로 배치한다. (docs/content/03_Germ_and_Clean_Rendering.md)
 *
 * 볼록 껍질(convex hull) 기반 배치는 손가락 사이 빈 공간까지 다각형에
 * 포함시켜버리고, 중심점 기준 확대(expand) 방식이 손가락 끝처럼 중심에서 먼
 * 지점을 과도하게 밀어내 손가락 폭을 벗어난 위치에 균이 놓이는 문제가 있었다
 * (실사용 피드백으로 확인됨). 손가락 뼈대를 따라 일정 두께를 갖는 "캡슐"
 * 모양과 손바닥 다각형의 합집합 위에서만 표본을 뽑아 이 문제를 해결한다.
 * rect는 사진이 실제로 표시되는 영역(letterbox 보정 포함)이다.
 */
export const generateGerms = (landmarks: Point3D[], rect: DisplayRect): GermObject[] => {
  const silhouette = buildHandSilhouette(landmarks, rect);
  if (!silhouette) {
    return [];
  }

  const count = Math.round(randomBetween(MIN_GERM_COUNT, MAX_GERM_COUNT));
  const germs: GermObject[] = [];
  // GermSprite/DummyGerm은 (x, y)를 바운딩 박스 좌상단으로 취급하므로,
  // 세균의 시각적 중심이 뽑힌 지점에 오도록 절반 크기만큼 보정한다.
  const halfSize = GERM_BASE_SIZE / 2;

  for (let i = 0; i < count; i++) {
    const { x, y } = samplePointOnHand(silhouette);

    germs.push({
      id: `germ-${i}`,
      x: x - halfSize,
      y: y - halfSize,
      size: GERM_BASE_SIZE,
      opacity: randomBetween(MIN_OPACITY, MAX_OPACITY),
      rotation: randomBetween(0, 360),
      scale: randomBetween(MIN_SCALE, MAX_SCALE),
      typeIndex: Math.floor(Math.random() * GERM_TYPE_COUNT),
      phaseOffset: randomBetween(0, Math.PI * 2),
    });
  }

  return germs;
};
