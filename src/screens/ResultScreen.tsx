import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Canvas,
  Group,
  Image,
  Rect,
  Circle,
  RadialGradient,
  useImage,
  FilterMode,
  MipmapMode,
} from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useDerivedValue,
  useSharedValue,
  interpolate,
  Extrapolation,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { GermSprite } from '../components/GermSprite';
import { SparkleSprite } from '../components/SparkleSprite';
import { generateGerms, GERM_TYPE_COUNT } from '../utils/generateGerms';
import { generateSparkles } from '../utils/generateSparkles';
import { computeContainRect, computeCoverRect } from '../utils/displayRect';
import { playCleanSound } from '../utils/sound';
import { GERM_ASSET_MODULES, GERM_ASSET_COUNT } from '../utils/germAssets';
import type { GermDisplayMode, Point3D, WashMode } from '../types';

interface ResultScreenProps {
  photoUri: string;
  washMode: WashMode;
  handLandmarks: Point3D[];
  isCleanMode: boolean;
  germDisplayMode: GermDisplayMode;
  onToggleCleanMode: () => void;
  onRetake: () => void;
}

const MIN_SCALE = 1;
// 현미경 모드는 피부 표면까지 파고들어 보이도록 10배까지, 캐릭터 모드는
// 사실적인 사진이 아니라 벡터 도형이라 4배로 제한한다.
const MICROSCOPE_MAX_SCALE = 10;
const CHARACTER_MAX_SCALE = 4;

// 세균이 처음엔 잘 안 보일 만큼 작고 투명하다가, 확대(pinch zoom)할수록
// 또렷해지는 리빌(reveal) 효과.
const MIN_GERM_OPACITY_FACTOR = 0.08;
const MIN_GERM_ZOOM_FACTOR = 0.35;
const MAX_GERM_ZOOM_FACTOR = 1.0;

// 고배율 확대 시 사진 해상도 한계와 세균 이미지의 선명함 사이 이질감을
// 가리기 위한 현미경 조명(뿌연 백라이트) 효과.
const HAZE_COLOR = '#EAF4FF';
const MIN_HAZE_OPACITY = 0;
const MAX_HAZE_OPACITY = 0.55;

// AFTER 모드 등장 연출: 화면이 밝아졌다 퍼지며 사라지는 플래시 + 반짝이 트윙클
const FLASH_DURATION_MS = 900;
const FLASH_DELAY_MS = 150;
const TWINKLE_PERIOD_MS = 1600;

// 세균 숨쉬기 애니메이션 주기 (BEFORE 모드에서 계속 반복)
const BREATHE_PERIOD_MS = 2400;

// 가장자리 버튼/배너에 safe-area inset 위로 추가하는 여백 (TV 미러링 오버스캔 대응)
const EDGE_SAFE_MARGIN = 24;

export const ResultScreen = ({
  photoUri,
  washMode,
  handLandmarks,
  isCleanMode,
  germDisplayMode,
  onToggleCleanMode,
  onRetake,
}: ResultScreenProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const maxScale = germDisplayMode === 'CHARACTER' ? CHARACTER_MAX_SCALE : MICROSCOPE_MAX_SCALE;

  // Skia 내부 Group transform으로 확대를 처리해 몇 배를 확대해도 선명하게
  // 유지한다 (RN CSS 트랜스폼은 래스터화된 결과물을 늘리기만 해서 흐려짐).
  const photoImage = useImage(photoUri);

  // 세균 사진 10종을 미리 로드해두고, 촬영마다 그중 6종을 무작위로 골라 쓴다.
  const germImage0 = useImage(GERM_ASSET_MODULES[0]);
  const germImage1 = useImage(GERM_ASSET_MODULES[1]);
  const germImage2 = useImage(GERM_ASSET_MODULES[2]);
  const germImage3 = useImage(GERM_ASSET_MODULES[3]);
  const germImage4 = useImage(GERM_ASSET_MODULES[4]);
  const germImage5 = useImage(GERM_ASSET_MODULES[5]);
  const germImage6 = useImage(GERM_ASSET_MODULES[6]);
  const germImage7 = useImage(GERM_ASSET_MODULES[7]);
  const germImage8 = useImage(GERM_ASSET_MODULES[8]);
  const germImage9 = useImage(GERM_ASSET_MODULES[9]);
  const allGermImages = [
    germImage0,
    germImage1,
    germImage2,
    germImage3,
    germImage4,
    germImage5,
    germImage6,
    germImage7,
    germImage8,
    germImage9,
  ];

  // 이번 사진에서 실제로 사용할 세균 종류(10개 중 6개)를 무작위로 뽑는다.
  const selectedGermAssetIndices = useMemo(() => {
    const indices = Array.from({ length: GERM_ASSET_COUNT }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, GERM_TYPE_COUNT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUri]);

  // Pinch(확대) + Pan(이동) 상태 — 사진과 세균/반짝이를 같은 Skia Group에서
  // 함께 확대/이동한다.
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // 플래시 진행도(0~1, 한 번만 재생)와 반짝이 트윙클 시계(계속 흐름).
  const flashProgress = useSharedValue(0);
  const twinkleClock = useSharedValue(0);
  // 세균 숨쉬기 시계(계속 흐름) — BEFORE 모드에서 세균이 표시되는 동안 계속 돈다.
  const breatheClock = useSharedValue(0);

  useEffect(() => {
    // 새 사진을 받으면 이전 확대/이동 상태를 초기화한다.
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;

    // 세균 숨쉬기 애니메이션: 계속 0→2π를 반복하는 "시계".
    breatheClock.value = 0;
    breatheClock.value = withRepeat(
      withTiming(Math.PI * 2, { duration: BREATHE_PERIOD_MS, easing: Easing.linear }),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUri]);

  useEffect(() => {
    if (washMode !== 'AFTER') {
      return;
    }
    // 03_Germ_and_Clean_Rendering.md: 뽀득거리는 상쾌한 효과음 + 칭찬 진동 연출
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playCleanSound();

    // 화면 전체 플래시: 0→1로 확 밝아졌다 퍼지며 사라진다
    flashProgress.value = 0;
    flashProgress.value = withDelay(
      FLASH_DELAY_MS,
      withTiming(1, { duration: FLASH_DURATION_MS, easing: Easing.out(Easing.cubic) })
    );

    // 반짝이 트윙클: 계속 0→2π를 반복하는 시계 (sin 주기라 반복 지점이 안 끊김)
    twinkleClock.value = 0;
    twinkleClock.value = withRepeat(
      withTiming(Math.PI * 2, { duration: TWINKLE_PERIOD_MS, easing: Easing.linear }),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [washMode, photoUri]);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  // 제스처 콜백(.onUpdate/.onEnd)은 UI 스레드 워클릿으로 실행되므로, 그 안에서
  // 호출하는 헬퍼 함수도 반드시 'worklet' 지시어가 있어야 한다.
  const clamp = (value: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
  };

  const clampTranslation = (value: number, dimension: number, currentScale: number) => {
    'worklet';
    const maxOffset = (dimension * (currentScale - 1)) / 2;
    return Math.min(Math.max(value, -maxOffset), maxOffset);
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, MIN_SCALE, maxScale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      translateX.value = clampTranslation(translateX.value, containerSize.width, scale.value);
      translateY.value = clampTranslation(translateY.value, containerSize.height, scale.value);
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (savedScale.value <= MIN_SCALE) {
        return;
      }
      translateX.value = clampTranslation(
        savedTranslateX.value + event.translationX,
        containerSize.width,
        scale.value
      );
      translateY.value = clampTranslation(
        savedTranslateY.value + event.translationY,
        containerSize.height,
        scale.value
      );
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Skia Group에 적용할 확대/이동 트랜스폼. origin을 컨테이너 중앙으로 둬서
  // 기존 RN CSS 트랜스폼과 동일하게 중앙 기준으로 확대되도록 한다.
  const contentTransform = useDerivedValue(() => [
    { translateX: translateX.value },
    { translateY: translateY.value },
    { scale: scale.value },
  ]);
  const contentOrigin = { x: containerSize.width / 2, y: containerSize.height / 2 };

  // 세균 리빌 효과: 확대 배율(scale)을 세균 레이어의 투명도/크기로 매핑한다.
  // maxScale은 germDisplayMode에서 파생되는 JS 값이라 바뀔 수 있으므로,
  // useDerivedValue에 의존성 배열을 꼭 넘겨야 한다(안 그러면 최초 값에 고정됨).
  const germOpacityFactor = useDerivedValue(
    () => interpolate(scale.value, [MIN_SCALE, maxScale], [MIN_GERM_OPACITY_FACTOR, 1], Extrapolation.CLAMP),
    [maxScale]
  );
  const germZoomFactor = useDerivedValue(
    () =>
      interpolate(
        scale.value,
        [MIN_SCALE, maxScale],
        [MIN_GERM_ZOOM_FACTOR, MAX_GERM_ZOOM_FACTOR],
        Extrapolation.CLAMP
      ),
    [maxScale]
  );
  // 현미경 뿌연 조명 효과 (사진 위, 세균 아래 레이어의 불투명도) — 캐릭터
  // 모드에서는 사용하지 않는다.
  const hazeOpacity = useDerivedValue(
    () => interpolate(scale.value, [MIN_SCALE, maxScale], [MIN_HAZE_OPACITY, MAX_HAZE_OPACITY], Extrapolation.CLAMP),
    [maxScale]
  );

  // 사진과 화면의 종횡비가 다를 수 있어(letterbox), 실제 표시 영역 기준으로
  // 좌표를 변환한다. 창이 가로로 넓은 경우(DeX 등)는 레터박스가 심해지므로
  // cover 방식(꽉 채움)을 쓴다.
  const displayRect = useMemo(() => {
    if (!photoImage || containerSize.width === 0 || containerSize.height === 0) {
      return null;
    }
    const isWideContainer = containerSize.width > containerSize.height;
    const computeRect = isWideContainer ? computeCoverRect : computeContainRect;
    return computeRect(
      photoImage.width(),
      photoImage.height(),
      containerSize.width,
      containerSize.height
    );
  }, [photoImage, containerSize]);

  // 화면 중앙에서 원형으로 밝아졌다 퍼지며 사라지는 플래시. containerSize는
  // JS state(공유값 아님)라 useDerivedValue에 의존성 배열을 넘겨야 최신 값을
  // 반영한다(안 그러면 레이아웃 계산 전 크기 0에 고정됨).
  const flashOpacity = useDerivedValue(
    () => interpolate(flashProgress.value, [0, 0.12, 1], [0, 1, 0], Extrapolation.CLAMP),
    []
  );
  const flashRadius = useDerivedValue(() => {
    const maxDim = Math.max(containerSize.width, containerSize.height);
    return interpolate(flashProgress.value, [0, 1], [maxDim * 0.05, maxDim * 0.85], Extrapolation.CLAMP);
  }, [containerSize]);
  const flashCenter = { x: containerSize.width / 2, y: containerSize.height / 2 };

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
      <GestureDetector gesture={composedGesture}>
        <View style={StyleSheet.absoluteFill}>
          {containerSize.width > 0 && containerSize.height > 0 && photoImage && displayRect && (
            <Canvas style={StyleSheet.absoluteFill}>
              <Group transform={contentTransform} origin={contentOrigin}>
                <Image
                  image={photoImage}
                  x={displayRect.x}
                  y={displayRect.y}
                  width={displayRect.width}
                  height={displayRect.height}
                  sampling={{ filter: FilterMode.Linear, mipmap: MipmapMode.Linear }}
                />

                {/* 현미경 조명 효과 — 캐릭터 모드는 벡터 도형이라 필요 없음 */}
                {germDisplayMode === 'MICROSCOPE' && (
                  <Rect
                    x={displayRect.x}
                    y={displayRect.y}
                    width={displayRect.width}
                    height={displayRect.height}
                    color={HAZE_COLOR}
                    opacity={hazeOpacity}
                  />
                )}

                {germs.length > 0 && (
                  <Group opacity={isCleanMode ? 0 : 1}>
                    {/* 확대할수록 또렷하고 커지는 리빌 효과 (히든 버튼의 on/off와는 별개 레이어) */}
                    <Group opacity={germOpacityFactor}>
                      {germs.map((germ) => (
                        <GermSprite
                          key={germ.id}
                          x={germ.x}
                          y={germ.y}
                          size={germ.size}
                          opacity={germ.opacity}
                          rotation={germ.rotation}
                          scale={germ.scale}
                          zoomFactor={germZoomFactor}
                          breatheClock={breatheClock}
                          phaseOffset={germ.phaseOffset}
                          typeIndex={germ.typeIndex}
                          pngAsset={
                            germDisplayMode === 'CHARACTER'
                              ? null
                              : allGermImages[selectedGermAssetIndices[germ.typeIndex]]
                          }
                        />
                      ))}
                    </Group>
                  </Group>
                )}

                {sparkles.map((sparkle) => (
                  <SparkleSprite
                    key={sparkle.id}
                    x={sparkle.x}
                    y={sparkle.y}
                    size={sparkle.size}
                    rotation={sparkle.rotation}
                    baseOpacity={0.9}
                    twinkleClock={twinkleClock}
                    phaseOffset={sparkle.phaseOffset}
                  />
                ))}
              </Group>

              {/* 화면 전체 플래시 — 확대/이동과 무관한 좌표계라 Group 바깥에 그린다 */}
              {washMode === 'AFTER' && (
                <Group opacity={flashOpacity}>
                  <Circle cx={flashCenter.x} cy={flashCenter.y} r={flashRadius}>
                    <RadialGradient
                      c={flashCenter}
                      r={flashRadius}
                      colors={[
                        'rgba(255,255,255,1)',
                        'rgba(255,255,255,0.6)',
                        'rgba(255,255,255,0)',
                      ]}
                      positions={[0, 0.4, 1]}
                    />
                  </Circle>
                </Group>
              )}
            </Canvas>
          )}
        </View>
      </GestureDetector>

      {/* 확대/이동의 영향을 받지 않는 고정 UI */}
      {washMode === 'AFTER' && (
        <View
          style={[styles.praiseBanner, { top: insets.top + 60 + EDGE_SAFE_MARGIN }]}
          pointerEvents="none"
        >
          <Text style={styles.praiseText}>{t('result.praise')}</Text>
        </View>
      )}

      <Pressable
        style={[
          styles.retakeButton,
          { top: insets.top + EDGE_SAFE_MARGIN, left: insets.left + EDGE_SAFE_MARGIN },
        ]}
        onPress={onRetake}
      >
        <Ionicons name="refresh" size={16} color="#fff" />
        <Text style={styles.retakeButtonText}>{t('common.retake')}</Text>
      </Pressable>

      {/* 우하단 히든 버튼: 보건교사용 Clean Mode 강제 토글 (거의 안 보이는 opacity) */}
      <Pressable
        style={[
          styles.hiddenButton,
          { bottom: insets.bottom + EDGE_SAFE_MARGIN, right: insets.right + EDGE_SAFE_MARGIN },
        ]}
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
    overflow: 'hidden',
  },
  praiseBanner: {
    position: 'absolute',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20,20,20,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  hiddenButton: {
    position: 'absolute',
    width: 30,
    height: 30,
    opacity: 0.03,
    backgroundColor: '#000',
  },
});
