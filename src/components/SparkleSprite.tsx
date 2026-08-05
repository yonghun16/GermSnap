import React from 'react';
import { Image } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';
import { DummySparkle } from './DummySparkle';

interface SparkleSpriteProps {
  x: number;
  y: number;
  size: number;
  opacity: number;
  pngAsset?: SkImage | null;
}

/**
 * 반짝이 컴포넌트 이원화 구조: 실제 PNG 에셋이 있으면 사용하고,
 * 없으면 DummySparkle(Skia 벡터 도형)으로 대체한다.
 * (docs/content/04_Asset_and_Development_Guide.md)
 */
export const SparkleSprite = ({ x, y, size, opacity, pngAsset }: SparkleSpriteProps) => {
  if (pngAsset) {
    return <Image image={pngAsset} x={x} y={y} width={size} height={size} opacity={opacity} />;
  }
  return <DummySparkle x={x} y={y} size={size} opacity={opacity} />;
};
