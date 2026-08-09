import React, { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { analyzeHandImage } from '../utils/analyzeHandImage';
import { cropPhotoToAspectRatio } from '../utils/cropToAspectRatio';
import { playScanSound, playErrorSound } from '../utils/sound';
import type { WashMode, Point3D } from '../types';

// 01_Architecture_Flow.md: Scan Loading Overlay 약 0.8초간 진동 + "스캔 중..." 연출
const SCAN_OVERLAY_DURATION_MS = 800;

// 가이드라인 영역 (미리보기 화면 기준 정규화 좌표, 0~1) — 순수 시각적 안내용.
// 2단계 파이프라인(palm detector가 손 위치/크기/회전을 자동으로 찾음)이 되면서
// 더 이상 이 영역으로 크롭하지는 않지만, 사용자가 손을 화면 안에 적당히 크게
// 담도록 유도하는 역할은 여전히 유효하다.
const GUIDE_RECT = { x: 0.08, y: 0.16, width: 0.84, height: 0.58 };

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
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const [isHandNotDetectedVisible, setIsHandNotDetectedVisible] = useState(false);

  const handlePreviewLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPreviewSize({ width, height });
  };

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

      // expo-camera 미리보기는 화면을 꽉 채우려고 사진을 잘라서 보여주므로(cover),
      // 실제 촬영된 사진은 센서 원본 비율 그대로라 미리보기보다 화각이 넓다.
      // 미리보기와 동일한 비율로 중앙 크롭해 "본 대로 찍힌다"를 보장한다.
      const photoUri =
        previewSize.width > 0 && previewSize.height > 0
          ? await cropPhotoToAspectRatio(
              photo.uri,
              photo.width,
              photo.height,
              previewSize.width / previewSize.height
            )
          : photo.uri;

      await new Promise((resolve) => setTimeout(resolve, SCAN_OVERLAY_DURATION_MS));

      const landmarks = await analyzeHandImage(photoUri);
      if (!landmarks || landmarks.length === 0) {
        throw new Error('no-hand-detected');
      }

      onScanComplete(photoUri, landmarks);
    } catch (error) {
      // 02_Camera_and_AI.md: 손이 인식되지 않은 경우 예외 처리.
      // "손 미인식"과 실제 오류(모델 로드 실패 등)를 사용자에게는 동일한 메시지로
      // 보여주지만, 원인 파악을 위해 콘솔에는 실제 에러를 남긴다.
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
    <View style={styles.container} onLayout={handlePreviewLayout}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setIsCameraReady(true)}
      />

      {/* 뒤로가기 버튼: 앱을 종료하는 대신 메인(시작) 화면으로 돌아간다 — 요즘
          앱은 별도 종료 버튼을 두지 않는 것이 일반적이라, 앱 종료 대신 이전
          화면으로의 이동으로 대체. */}
      <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
        <Ionicons name="chevron-back" size={18} color="#fff" />
        <Text style={styles.backButtonText}>{t('common.back')}</Text>
      </Pressable>

      {/* washMode 토글: 화면 우하단의 작고 반투명한 원형 버튼 하나로 BEFORE/AFTER를
          전환한다. 보건교사가 손이나 몸으로 살짝 가려서 아이들에게는 안 보이게
          누를 수 있도록, 설명 텍스트 없이 아이콘만 있는 눈에 덜 띄는 형태로 둔다. */}
      <Pressable
        style={[
          styles.washModeToggle,
          washMode === 'BEFORE' ? styles.washModeToggleBefore : styles.washModeToggleAfter,
        ]}
        onPress={() => onWashModeChange(washMode === 'BEFORE' ? 'AFTER' : 'BEFORE')}
        hitSlop={8}
      >
        <Text style={styles.washModeToggleIcon}>{washMode === 'BEFORE' ? '🧼' : '✨'}</Text>
      </Pressable>

      {/* 손 모양 가이드라인: GUIDE_RECT와 동일한 비율로 그려서 실제 크롭 영역과 일치시킨다 */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View
          style={[
            styles.guideShape,
            {
              left: `${GUIDE_RECT.x * 100}%`,
              top: `${GUIDE_RECT.y * 100}%`,
              width: `${GUIDE_RECT.width * 100}%`,
              height: `${GUIDE_RECT.height * 100}%`,
            },
          ]}
        />
        <View
          style={[
            styles.guideTextRow,
            { top: `${(GUIDE_RECT.y + GUIDE_RECT.height) * 100}%` },
          ]}
        >
          <Text style={styles.guideText}>{t('camera.guideText')}</Text>
        </View>
      </View>

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
    bottom: 56,
    right: 24,
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
    top: 56,
    left: 20,
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
    left: 0,
    right: 0,
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
