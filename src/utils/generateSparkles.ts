import type { Point3D } from '../types';
import type { DisplayRect } from './displayRect';

export interface SparkleObject {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number; // degrees
  /** 트윙클(깜빡임) 애니메이션의 위상 오프셋(라디안) — 반짝이마다 달라서
   * 다 같이 반짝이지 않고 제각각 반짝이는 것처럼 보이게 한다. */
  phaseOffset: number;
}

const MIN_SPARKLE_COUNT = 18;
const MAX_SPARKLE_COUNT = 28;
const MIN_SPARKLE_SIZE = 14;
const MAX_SPARKLE_SIZE = 26;
// 손 좌표에 정확히 겹치지 않고, 세균처럼 살짝 흩뿌려진 자연스러운 위치가
// 되도록 랜덤 오프셋을 준다 (generateGerms.ts와 같은 방식).
const MIN_OFFSET_RADIUS = 6;
const MAX_OFFSET_RADIUS = 24;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * 21개 손 좌표를 기준점 삼아 반짝이를 무작위 개수·위치·크기·회전으로
 * 흩뿌린다. (docs/content/03_Germ_and_Clean_Rendering.md - 깨끗해진 손 이펙트)
 * 이전에는 21개 좌표마다 정확히 하나씩 배치해서 손가락 마디에 일렬로
 * 늘어선 것처럼 부자연스러워 보였다 — generateGerms.ts와 동일하게 무작위
 * 랜드마크를 기준점 삼아 각도/반경을 무작위로 흩어서 자연스럽게 만든다.
 * rect는 사진이 실제로 표시되는 영역(letterbox 보정 포함)이다.
 */
export const generateSparkles = (landmarks: Point3D[], rect: DisplayRect): SparkleObject[] => {
  if (landmarks.length === 0) {
    return [];
  }

  const count = Math.round(randomBetween(MIN_SPARKLE_COUNT, MAX_SPARKLE_COUNT));
  const sparkles: SparkleObject[] = [];

  for (let i = 0; i < count; i++) {
    const landmark = landmarks[Math.floor(Math.random() * landmarks.length)];
    const centerX = rect.x + landmark.x * rect.width;
    const centerY = rect.y + landmark.y * rect.height;
    const angle = randomBetween(0, Math.PI * 2);
    const offsetRadius = randomBetween(MIN_OFFSET_RADIUS, MAX_OFFSET_RADIUS);
    const size = randomBetween(MIN_SPARKLE_SIZE, MAX_SPARKLE_SIZE);
    // SparkleSprite/DummySparkle은 (x, y)를 바운딩 박스 좌상단으로 취급하므로
    // 반짝이의 시각적 중심이 오프셋 지점에 오도록 절반 크기만큼 보정한다.
    const halfSize = size / 2;

    sparkles.push({
      id: `sparkle-${i}`,
      x: centerX + Math.cos(angle) * offsetRadius - halfSize,
      y: centerY + Math.sin(angle) * offsetRadius - halfSize,
      size,
      rotation: randomBetween(0, 360),
      phaseOffset: randomBetween(0, Math.PI * 2),
    });
  }

  return sparkles;
};
