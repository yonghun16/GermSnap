import React from 'react';
import { Circle, Group } from '@shopify/react-native-skia';

interface DummyGermProps {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

/**
 * 실제 세균 PNG 에셋이 준비되기 전 사용하는 Skia Circle 기반 임시 도형.
 * (docs/content/04_Asset_and_Development_Guide.md - 세균 컴포넌트 이원화 구조)
 */
export const DummyGerm = ({ x, y, size, opacity }: DummyGermProps) => {
  const radius = size / 2;
  const center = { x: x + radius, y: y + radius };

  return (
    <Group opacity={opacity}>
      <Circle cx={center.x} cy={center.y} r={radius} color="#7CB342" />
      <Circle
        cx={center.x - radius * 0.3}
        cy={center.y - radius * 0.3}
        r={radius * 0.25}
        color="#33691E"
      />
      <Circle
        cx={center.x + radius * 0.35}
        cy={center.y + radius * 0.2}
        r={radius * 0.18}
        color="#33691E"
      />
    </Group>
  );
};
