import React from 'react';
import { Group, Image } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { DummySparkle } from './DummySparkle';

interface SparkleSpriteProps {
  x: number;
  y: number;
  size: number;
  rotation: number; // degrees
  /** 반짝임이 가장 밝을 때의 불투명도 (트윙클 최고점) */
  baseOpacity: number;
  /** 계속 흐르는 공유 "시계" 값(라디안). 모든 반짝이가 같은 값을 보되, phaseOffset으로 어긋나게 반짝인다. */
  twinkleClock: SharedValue<number>;
  /** 반짝이마다 다른 위상(라디안) — 제각각 반짝이는 것처럼 보이게 한다. */
  phaseOffset: number;
  pngAsset?: SkImage | null;
}

/**
 * 반짝이 컴포넌트 이원화 구조: 실제 PNG 에셋이 있으면 사용하고,
 * 없으면 DummySparkle(Skia 벡터 도형)으로 대체한다.
 * (docs/content/04_Asset_and_Development_Guide.md)
 *
 * AFTER 모드 결과 화면에서 각 반짝이가 깜빡깜빡 빛나는(twinkle) 효과를 낸다 —
 * 손 씻은 후 화려한 이펙트로 아이들에게 쾌감을 주기 위한 연출.
 */
export const SparkleSprite = ({
  x,
  y,
  size,
  rotation,
  baseOpacity,
  twinkleClock,
  phaseOffset,
  pngAsset,
}: SparkleSpriteProps) => {
  const origin = { x: x + size / 2, y: y + size / 2 };

  // 0~1 사이를 오가는 트윙클 세기. 완전히 사라지지는 않도록 최소값을 둔다.
  const twinkleOpacity = useDerivedValue(() => {
    const wave = 0.5 + 0.5 * Math.sin(twinkleClock.value + phaseOffset);
    return baseOpacity * (0.35 + 0.65 * wave);
  });
  const twinkleScale = useDerivedValue(() => {
    const wave = 0.5 + 0.5 * Math.sin(twinkleClock.value + phaseOffset);
    return 0.8 + 0.35 * wave;
  });
  // rotation은 공유값이 아닌 일반 prop이라, useDerivedValue가 최신값을 계속
  // 반영하도록 반드시 의존성 배열을 넘겨야 한다 (라이트 스윕 때 겪었던 것과
  // 같은 종류의 클로저 고정 버그를 피하기 위함).
  const transform = useDerivedValue(
    () => [{ rotate: (rotation * Math.PI) / 180 }, { scale: twinkleScale.value }],
    [rotation]
  );

  return (
    <Group origin={origin} transform={transform}>
      {pngAsset ? (
        <Image
          image={pngAsset}
          x={x}
          y={y}
          width={size}
          height={size}
          opacity={twinkleOpacity}
        />
      ) : (
        <DummySparkle x={x} y={y} size={size} opacity={twinkleOpacity} />
      )}
    </Group>
  );
};
