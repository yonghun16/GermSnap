import React from 'react';
import { Group, Path, Skia } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

interface DummySparkleProps {
  x: number;
  y: number;
  size: number;
  opacity: number | SharedValue<number>;
}

/**
 * 뾰족한 4방향 별(마름모 4개가 십자로 겹친 모양) 경로를 만든다.
 * outerR은 뾰족한 끝점까지, innerR은 안으로 파인 골까지의 반지름이다.
 * rotationOffset(라디안)을 주면 별 전체를 회전시킬 수 있다 — 큰 별과 작은
 * 별을 45도 어긋나게 겹쳐서 8방향으로 반짝이는 ✨ 모양을 만드는 데 쓴다.
 */
const buildSparkleStarPath = (
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  rotationOffset = 0
) => {
  const path = Skia.Path.Make();
  const points = 4;
  const vertexCount = points * 2;
  for (let i = 0; i < vertexCount; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2 + rotationOffset;
    const radius = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) {
      path.moveTo(px, py);
    } else {
      path.lineTo(px, py);
    }
  }
  path.close();
  return path;
};

/**
 * 실제 반짝이(sparkle.png) 에셋이 준비되기 전 사용하는 Skia 벡터 도형 기반
 * 임시 트윙클 모양. 동그란 점 대신, 날카로운 마름모 4개가 십자로 겹친
 * 별(✨) 모양의 큰 별 + 45도 어긋난 작은 별을 겹쳐서 그린다.
 * (docs/content/04_Asset_and_Development_Guide.md - 에셋 이원화 구조를 반짝이 이펙트에도 동일 적용)
 */
export const DummySparkle = ({ x, y, size, opacity }: DummySparkleProps) => {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;

  const bigStar = buildSparkleStarPath(cx, cy, r, r * 0.22);
  const smallStar = buildSparkleStarPath(cx, cy, r * 0.55, r * 0.15, Math.PI / 4);

  return (
    <Group opacity={opacity}>
      <Path path={bigStar} color="#FFFFFF" />
      <Path path={smallStar} color="#FFF9C4" />
    </Group>
  );
};
