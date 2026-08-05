import React from 'react';
import { Group, Image } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { DummyGerm } from './DummyGerm';

interface GermSpriteProps {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number; // degrees
  scale: number;
  /** 확대 정도에 따라 세균이 커지는 배율(1이면 원래 scale 그대로). */
  zoomFactor: SharedValue<number>;
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
  zoomFactor,
  pngAsset,
}: GermSpriteProps) => {
  const origin = { x: x + size / 2, y: y + size / 2 };
  // zoomFactor(핀치 확대에 따라 변하는 공유값)를 곱해, 확대할수록 세균 각자의
  // 위치(origin)는 그대로 두고 크기만 커지도록 한다.
  const transform = useDerivedValue(() => [
    { rotate: (rotation * Math.PI) / 180 },
    { scale: scale * zoomFactor.value },
  ]);

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
