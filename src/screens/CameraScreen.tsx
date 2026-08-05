import React, { useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { analyzeHandImage } from '../utils/analyzeHandImage';
import { playScanSound, playErrorSound } from '../utils/sound';
import type { WashMode, Point3D } from '../types';

// 01_Architecture_Flow.md: Scan Loading Overlay 약 0.8초간 진동 + "스캔 중..." 연출
const SCAN_OVERLAY_DURATION_MS = 800;

interface CameraScreenProps {
  washMode: WashMode;
  onWashModeChange: (mode: WashMode) => void;
  onScanComplete: (photoUri: string, landmarks: Point3D[]) => void;
}

export const CameraScreen = ({
  washMode,
  onWashModeChange,
  onScanComplete,
}: CameraScreenProps) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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
    } catch {
      // 02_Camera_and_AI.md: 손이 인식되지 않은 경우 예외 처리
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playErrorSound();
      Alert.alert(
        '손이 보이지 않아요!',
        '손이 잘 보이지 않아요. 손바닥이 화면 중앙에 오도록 다시 찍어주세요!'
      );
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
        <Text style={styles.permissionText}>
          손 세균을 스캔하려면 카메라 권한이 필요해요.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>카메라 권한 허용하기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setIsCameraReady(true)}
      />

      {/* 상단 washMode 탭 */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tabButton, washMode === 'BEFORE' && styles.tabButtonActive]}
          onPress={() => onWashModeChange('BEFORE')}
        >
          <Text style={[styles.tabText, washMode === 'BEFORE' && styles.tabTextActive]}>
            🧼 손 씻기 전
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, washMode === 'AFTER' && styles.tabButtonActive]}
          onPress={() => onWashModeChange('AFTER')}
        >
          <Text style={[styles.tabText, washMode === 'AFTER' && styles.tabTextActive]}>
            ✨ 손 씻은 후
          </Text>
        </Pressable>
      </View>

      {/* 손 모양 가이드라인 */}
      <View pointerEvents="none" style={styles.guideWrapper}>
        <View style={styles.guideShape} />
        <Text style={styles.guideText}>손바닥을 가이드라인 안에 맞춰주세요</Text>
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
          <Text style={styles.scanOverlayText}>스캔 중...</Text>
        </View>
      )}
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
  tabBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  tabButtonActive: {
    backgroundColor: '#4FC3F7',
  },
  tabText: {
    color: '#eee',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  guideWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideShape: {
    width: 220,
    height: 260,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    borderStyle: 'dashed',
  },
  guideText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 13,
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
});
