import type { Point3D } from '../types';
import type { DisplayRect } from './displayRect';

export interface SparkleObject {
  id: string;
  x: number;
  y: number;
  size: number;
}

const SPARKLE_SIZE = 22;

/**
 * 손 좌표 21개 위치 주변에 반짝이 스티커를 배치한다.
 * (docs/content/03_Germ_and_Clean_Rendering.md - 깨끗해진 손 이펙트)
 * rect는 사진이 실제로 표시되는 영역(letterbox 보정 포함)이다.
 */
export const generateSparkles = (landmarks: Point3D[], rect: DisplayRect): SparkleObject[] =>
  landmarks.map((landmark, index) => ({
    id: `sparkle-${index}`,
    // SparkleSprite/DummySparkle은 (x, y)를 바운딩 박스 좌상단으로 취급하므로
    // 손 좌표가 스프라이트의 시각적 중심이 되도록 절반 크기만큼 보정한다.
    x: rect.x + landmark.x * rect.width - SPARKLE_SIZE / 2,
    y: rect.y + landmark.y * rect.height - SPARKLE_SIZE / 2,
    size: SPARKLE_SIZE,
  }));
