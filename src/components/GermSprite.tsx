import React from 'react';
import { Group, Image, FilterMode, MipmapMode } from '@shopify/react-native-skia';
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

  if (pngAsset) {
    // 실제 세균 이미지는 정사각형이 아니므로, 비율이 깨지지 않도록 size 박스
    // 안에 중앙 정렬해서 그린다 (긴 변을 size에 맞춤).
    const aspectRatio = pngAsset.width() / pngAsset.height();
    const displayWidth = aspectRatio >= 1 ? size : size * aspectRatio;
    const displayHeight = aspectRatio >= 1 ? size / aspectRatio : size;
    const imageX = x + (size - displayWidth) / 2;
    const imageY = y + (size - displayHeight) / 2;

    return (
      <Group origin={origin} transform={transform}>
        <Image
          image={pngAsset}
          x={imageX}
          y={imageY}
          width={displayWidth}
          height={displayHeight}
          opacity={opacity}
          sampling={{ filter: FilterMode.Linear, mipmap: MipmapMode.Linear }}
        />
      </Group>
    );
  }

  return (
    <Group origin={origin} transform={transform}>
      <DummyGerm x={x} y={y} size={size} opacity={opacity} />
    </Group>
  );
};
