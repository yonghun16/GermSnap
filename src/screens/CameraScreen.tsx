import React, { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions, type CameraRatio } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { analyzeHandImage } from '../utils/analyzeHandImage';
import { computeContainRect } from '../utils/displayRect';
import { playScanSound, playErrorSound } from '../utils/sound';
import type { WashMode, Point3D } from '../types';

// Scan Loading Overlay 진동 + "스캔 중..." 연출 지속 시간
const SCAN_OVERLAY_DURATION_MS = 800;

// 가이드라인 영역 (카메라 화면 기준 정규화 좌표, 0~1) — 순수 시각적 안내용
const GUIDE_RECT = { x: 0.08, y: 0.16, width: 0.84, height: 0.58 };

// 가장자리 버튼에 safe-area inset 위로 추가하는 여백 (TV 미러링 오버스캔 대응)
const EDGE_SAFE_MARGIN = 24;

// ratio를 지정하면 미리보기가 FIT(레터박스 있음, 화각 넓음)이 된다. 폴더블
// 접힘/펼침 비율에 맞춰 16:9 / 4:3을 고르고, 앱 창이 가로로 더 넓은 경우
// (DeX 등)는 세로 콘텐츠와 비율 차이가 너무 커서 ratio를 생략해 기본
// FILL(레터박스 없이 꽉 채움)로 되돌린다.
const TALL_ASPECT_THRESHOLD = 1.8;

const getCameraRatioForAspect = (width: number, height: number): CameraRatio | undefined => {
  if (width <= 0 || height <= 0) {
    return '16:9';
  }
  if (width > height) {
    return undefined;
  }
  const aspect = height / width;
  return aspect >= TALL_ASPECT_THRESHOLD ? '16:9' : '4:3';
};

// CameraRatio 문자열("16:9" 등, 가로 기준)을 세로 미리보기 width:height로 변환
const getPortraitAspectSize = (ratio: CameraRatio): { width: number; height: number } => {
  const [a, b] = ratio.split(':').map(Number);
  return { width: b, height: a };
};

interface CameraScreenProps {
  washMode: WashMode;
  onWashModeChange: (mode: WashMode) => void;
  onScanComplete: (photoUri: string, landmarks: Point3D[]) => void;
  onBack: () => void;
}

export const CameraScreen = ({
  washMode,
  onWashModeChange,
  onScanComplete,
  onBack,
}: CameraScreenProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const cameraRatio = getCameraRatioForAspect(windowWidth, windowHeight);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isHandNotDetectedVisible, setIsHandNotDetectedVisible] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  // FIT 모드(ratio 지정)일 때는 컨테이너 안 일부 사각형에만 카메라가 보이므로,
  // 가이드라인을 그 영역 기준으로 그린다. FILL 모드(ratio 없음)는 컨테이너 전체.
  const visibleCameraRect =
    containerSize.width > 0 && containerSize.height > 0
      ? cameraRatio == null
        ? { x: 0, y: 0, width: containerSize.width, height: containerSize.height }
        : computeContainRect(
            getPortraitAspectSize(cameraRatio).width,
            getPortraitAspectSize(cameraRatio).height,
            containerSize.width,
            containerSize.height
          )
      : null;

  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady || isScanning) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) {
        return;
      }

      setIsScanning(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      playScanSound();

      await new Promise((resolve) => setTimeout(resolve, SCAN_OVERLAY_DURATION_MS));

      const landmarks = await analyzeHandImage(photo.uri);
      if (!landmarks || landmarks.length === 0) {
        throw new Error('no-hand-detected');
      }

      onScanComplete(photo.uri, landmarks);
    } catch (error) {
      // 손 미인식과 실제 오류(모델 로드 실패 등)를 사용자에게는 동일하게 안내하되,
      // 콘솔에는 실제 에러를 남긴다.
      console.error('analyzeHandImage failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playErrorSound();
      setIsHandNotDetectedVisible(true);
    } finally {
      setIsScanning(false);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Text style={styles.permissionText}>{t('camera.permissionMessage')}</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>{t('camera.permissionButton')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      <CameraView
        key={cameraRatio}
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        zoom={0}
        ratio={cameraRatio}
        onCameraReady={() => setIsCameraReady(true)}
      />

      {/* 뒤로가기: 앱 종료 대신 메인(시작) 화면으로 돌아간다 */}
      <Pressable
        style={[
          styles.backButton,
          { top: insets.top + EDGE_SAFE_MARGIN, left: insets.left + EDGE_SAFE_MARGIN },
        ]}
        onPress={onBack}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={18} color="#fff" />
        <Text style={styles.backButtonText}>{t('common.back')}</Text>
      </Pressable>

      {/* washMode 토글: 보건교사가 눈에 덜 띄게 누를 수 있도록 아이콘만 있는 버튼 */}
      <Pressable
        style={[
          styles.washModeToggle,
          washMode === 'BEFORE' ? styles.washModeToggleBefore : styles.washModeToggleAfter,
          { bottom: insets.bottom + EDGE_SAFE_MARGIN, right: insets.right + EDGE_SAFE_MARGIN },
        ]}
        onPress={() => onWashModeChange(washMode === 'BEFORE' ? 'AFTER' : 'BEFORE')}
        hitSlop={8}
      >
        <Text style={styles.washModeToggleIcon}>{washMode === 'BEFORE' ? '🧼' : '✨'}</Text>
      </Pressable>

      {/* 손 모양 가이드라인: 화면 전체가 아니라 실제로 카메라가 보이는
          영역(레터박스 제외) 기준으로 GUIDE_RECT 비율만큼 그린다. */}
      {visibleCameraRect && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View
            style={[
              styles.guideShape,
              {
                left: visibleCameraRect.x + GUIDE_RECT.x * visibleCameraRect.width,
                top: visibleCameraRect.y + GUIDE_RECT.y * visibleCameraRect.height,
                width: GUIDE_RECT.width * visibleCameraRect.width,
                height: GUIDE_RECT.height * visibleCameraRect.height,
              },
            ]}
          />
          <View
            style={[
              styles.guideTextRow,
              {
                left: visibleCameraRect.x,
                width: visibleCameraRect.width,
                top:
                  visibleCameraRect.y +
                  (GUIDE_RECT.y + GUIDE_RECT.height) * visibleCameraRect.height,
              },
            ]}
          >
            <Text style={styles.guideText}>{t('camera.guideText')}</Text>
          </View>
        </View>
      )}

      {/* 촬영 버튼 */}
      <View style={styles.captureBar}>
        <Pressable
          style={styles.captureButton}
          onPress={handleCapture}
          disabled={!isCameraReady || isScanning}
        >
          <View style={styles.captureButtonInner} />
        </Pressable>
      </View>

      {/* 스캔 로딩 오버레이 */}
      {isScanning && (
        <View style={styles.scanOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.scanOverlayText}>{t('camera.scanning')}</Text>
        </View>
      )}

      {/* 손 미인식 모달: 기본 Alert 대신 앱 톤에 맞는 둥글고 부드러운 카드로 표시 */}
      <Modal
        visible={isHandNotDetectedVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsHandNotDetectedVisible(false)}
      >
        <View style={styles.handModalBackdrop}>
          <View style={styles.handModalCard}>
            <View style={styles.handModalIconCircle}>
              <Ionicons name="hand-left-outline" size={32} color="#FF7043" />
            </View>
            <Text style={styles.handModalTitle}>{t('camera.handNotDetectedTitle')}</Text>
            <Text style={styles.handModalMessage}>{t('camera.handNotDetectedMessage')}</Text>
            <Pressable
              style={styles.handModalButton}
              onPress={() => setIsHandNotDetectedVisible(false)}
            >
              <Text style={styles.handModalButtonText}>{t('common.retake')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  washModeToggle: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  washModeToggleBefore: {
    backgroundColor: 'rgba(244,143,177,0.4)', // 분홍 (손 씻기 전)
  },
  washModeToggleAfter: {
    backgroundColor: 'rgba(255,255,255,0.4)', // 하양 (손 씻은 후)
  },
  washModeToggleIcon: {
    fontSize: 24,
  },
  backButton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(20,20,20,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  guideShape: {
    position: 'absolute',
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    borderStyle: 'dashed',
  },
  guideTextRow: {
    position: 'absolute',
    marginTop: 12,
    alignItems: 'center',
  },
  guideText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  captureBar: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  scanOverlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  handModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  handModalCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  handModalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  handModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#263238',
    textAlign: 'center',
    marginBottom: 8,
  },
  handModalMessage: {
    fontSize: 14,
    color: '#607D8B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  handModalButton: {
    width: '100%',
    backgroundColor: '#4FC3F7',
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: 'center',
  },
  handModalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
