import React from 'react';
import { Group, Image } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';
import { DummyGerm } from './DummyGerm';

interface GermSpriteProps {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number; // degrees
  scale: number;
  pngAsset?: SkImage | null;
}

/**
 * 세균 컴포넌트 이원화 구조: 실제 PNG 에셋이 있으면 사용하고,
 * 없으면 DummyGerm(Skia 벡터 도형)으로 대체한다.
 * (docs/content/04_Asset_and_Development_Guide.md)
 */
export const GermSprite = ({
  x,
  y,
  size,
  opacity,
  rotation,
  scale,
  pngAsset,
}: GermSpriteProps) => {
  const origin = { x: x + size / 2, y: y + size / 2 };
  const transform = [{ rotate: (rotation * Math.PI) / 180 }, { scale }];

  return (
    <Group origin={origin} transform={transform}>
      {pngAsset ? (
        <Image image={pngAsset} x={x} y={y} width={size} height={size} opacity={opacity} />
      ) : (
        <DummyGerm x={x} y={y} size={size} opacity={opacity} />
      )}
    </Group>
  );
};
