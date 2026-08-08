import React from 'react';
import { Group, Image, FilterMode, MipmapMode } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { DummyGerm } from './DummyGerm';

// 세균이 살아서 숨을 쉬는 듯 보이도록, 크기와 불투명도가 천천히 늘었다
// 줄었다 하는 정현파(sin) 애니메이션을 준다. phaseOffset을 세균마다 다르게
// 줘서 모두 같은 박자로 숨쉬지 않고 제각각 살아있는 것처럼 보이게 한다.
const BREATHE_SCALE_AMPLITUDE = 0.08;
const BREATHE_OPACITY_AMPLITUDE = 0.18;

interface GermSpriteProps {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number; // degrees
  scale: number;
  /** 확대 정도에 따라 세균이 커지는 배율(1이면 원래 scale 그대로). */
  zoomFactor: SharedValue<number>;
  /** 계속 흐르는 공유 "시계" 값(라디안) — 숨쉬기 애니메이션용. */
  breatheClock: SharedValue<number>;
  /** 세균마다 다른 위상(라디안) — 제각각 숨쉬는 것처럼 보이게 한다. */
  phaseOffset: number;
  /** pngAsset이 없을 때(캐릭터 모드) DummyGerm이 어떤 캐릭터 표정을 쓸지 고르는 값. */
  typeIndex: number;
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
  breatheClock,
  phaseOffset,
  typeIndex,
  pngAsset,
}: GermSpriteProps) => {
  const origin = { x: x + size / 2, y: y + size / 2 };
  // zoomFactor(핀치 확대에 따라 변하는 공유값)를 곱해, 확대할수록 세균 각자의
  // 위치(origin)는 그대로 두고 크기만 커지도록 한다. 숨쉬기 배율도 함께 곱한다.
  const transform = useDerivedValue(() => {
    const breatheScale = 1 + Math.sin(breatheClock.value + phaseOffset) * BREATHE_SCALE_AMPLITUDE;
    return [
      { rotate: (rotation * Math.PI) / 180 },
      { scale: scale * zoomFactor.value * breatheScale },
    ];
  });
  // 숨쉬기에 맞춰 불투명도도 함께 살짝 오르내린다 — Group의 opacity는
  // 안쪽 Image/DummyGerm의 opacity와 곱해지므로 원래 세균 opacity는 그대로 두고
  // 이 레이어에서만 숨쉬기 배율을 곱한다.
  const breatheOpacity = useDerivedValue(
    () => 1 - BREATHE_OPACITY_AMPLITUDE / 2 + (Math.sin(breatheClock.value + phaseOffset) * BREATHE_OPACITY_AMPLITUDE) / 2
  );

  if (pngAsset) {
    // 실제 세균 이미지는 정사각형이 아니므로, 비율이 깨지지 않도록 size 박스
    // 안에 중앙 정렬해서 그린다 (긴 변을 size에 맞춤).
    const aspectRatio = pngAsset.width() / pngAsset.height();
    const displayWidth = aspectRatio >= 1 ? size : size * aspectRatio;
    const displayHeight = aspectRatio >= 1 ? size / aspectRatio : size;
    const imageX = x + (size - displayWidth) / 2;
    const imageY = y + (size - displayHeight) / 2;

    return (
      <Group origin={origin} transform={transform} opacity={breatheOpacity}>
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
    <Group origin={origin} transform={transform} opacity={breatheOpacity}>
      <DummyGerm x={x} y={y} size={size} opacity={opacity} typeIndex={typeIndex} />
    </Group>
  );
};
