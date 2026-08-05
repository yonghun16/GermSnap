import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { GermSprite } from '../components/GermSprite';
import { SparkleSprite } from '../components/SparkleSprite';
import { generateGerms } from '../utils/generateGerms';
import { generateSparkles } from '../utils/generateSparkles';
import { computeContainRect } from '../utils/displayRect';
import { playCleanSound } from '../utils/playCleanSound';
import type { Point3D, WashMode } from '../types';

interface ResultScreenProps {
  photoUri: string;
  washMode: WashMode;
  handLandmarks: Point3D[];
  isCleanMode: boolean;
  onToggleCleanMode: () => void;
  onRetake: () => void;
}

export const ResultScreen = ({
  photoUri,
  washMode,
  handLandmarks,
  isCleanMode,
  onToggleCleanMode,
  onRetake,
}: ResultScreenProps) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    setImageSize(null);
    Image.getSize(
      photoUri,
      (width, height) => setImageSize({ width, height }),
      () => setImageSize(null)
    );
  }, [photoUri]);

  useEffect(() => {
    if (washMode !== 'AFTER') {
      return;
    }
    // 03_Germ_and_Clean_Rendering.md: 뽀득거리는 상쾌한 효과음 + 칭찬 진동 연출
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playCleanSound();
  }, [washMode, photoUri]);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  // 사진과 화면의 종횡비가 다를 수 있으므로(letterbox), 실제 사진이 표시되는
  // 영역을 기준으로 정규화 좌표를 픽셀로 변환한다.
  const displayRect = useMemo(() => {
    if (!imageSize || containerSize.width === 0 || containerSize.height === 0) {
      return null;
    }
    return computeContainRect(
      imageSize.width,
      imageSize.height,
      containerSize.width,
      containerSize.height
    );
  }, [imageSize, containerSize]);

  const germs = useMemo(
    () => (washMode === 'BEFORE' && displayRect ? generateGerms(handLandmarks, displayRect) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [washMode, handLandmarks, displayRect]
  );

  const sparkles = useMemo(
    () => (washMode === 'AFTER' && displayRect ? generateSparkles(handLandmarks, displayRect) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [washMode, handLandmarks, displayRect]
  );

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      <Image source={{ uri: photoUri }} resizeMode="contain" style={StyleSheet.absoluteFill} />

      {containerSize.width > 0 && containerSize.height > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          {germs.length > 0 && (
            <Group opacity={isCleanMode ? 0 : 1}>
              {germs.map((germ) => (
                <GermSprite
                  key={germ.id}
                  x={germ.x}
                  y={germ.y}
                  size={germ.size}
                  opacity={germ.opacity}
                  rotation={germ.rotation}
                  scale={germ.scale}
                />
              ))}
            </Group>
          )}

          {sparkles.map((sparkle) => (
            <SparkleSprite
              key={sparkle.id}
              x={sparkle.x}
              y={sparkle.y}
              size={sparkle.size}
              opacity={0.9}
            />
          ))}
        </Canvas>
      )}

      {washMode === 'AFTER' && (
        <View style={styles.praiseBanner} pointerEvents="none">
          <Text style={styles.praiseText}>
            ✨ 참 잘했어요! 세균이 깨끗하게 사라졌어요!
          </Text>
        </View>
      )}

      <Pressable style={styles.retakeButton} onPress={onRetake}>
        <Text style={styles.retakeButtonText}>🔄 다시 찍기</Text>
      </Pressable>

      {/* 우하단 히든 버튼: 보건교사용 Clean Mode 강제 토글 (거의 안 보이는 opacity) */}
      <Pressable
        style={styles.hiddenButton}
        onPress={onToggleCleanMode}
        hitSlop={12}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  praiseBanner: {
    position: 'absolute',
    top: 116,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  praiseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
  },
  retakeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  hiddenButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 30,
    height: 30,
    opacity: 0.03,
    backgroundColor: '#000',
  },
});
