import React from 'react';
import { Circle, Group } from '@shopify/react-native-skia';

interface DummySparkleProps {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

/**
 * 실제 반짝이(sparkle.png) 에셋이 준비되기 전 사용하는 Skia Circle 기반 임시 트윙클 도형.
 * (docs/content/04_Asset_and_Development_Guide.md - 에셋 이원화 구조를 반짝이 이펙트에도 동일 적용)
 */
export const DummySparkle = ({ x, y, size, opacity }: DummySparkleProps) => {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;
  const armLength = r * 0.9;
  const dotRadius = r * 0.18;

  return (
    <Group opacity={opacity}>
      <Circle cx={cx} cy={cy} r={r * 0.35} color="#FFF9C4" />
      <Circle cx={cx} cy={cy - armLength} r={dotRadius} color="#FFFFFF" />
      <Circle cx={cx} cy={cy + armLength} r={dotRadius} color="#FFFFFF" />
      <Circle cx={cx - armLength} cy={cy} r={dotRadius} color="#FFFFFF" />
      <Circle cx={cx + armLength} cy={cy} r={dotRadius} color="#FFFFFF" />
    </Group>
  );
};
