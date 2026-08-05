import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraScreen } from './src/screens/CameraScreen';
import type { AppState } from './src/types';

const initialState: AppState = {
  washMode: 'BEFORE',
  photoUri: null,
  handLandmarks: [],
  isCleanMode: false,
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(initialState);

  const handleScanComplete: React.ComponentProps<typeof CameraScreen>['onScanComplete'] = (
    photoUri,
    landmarks
  ) => {
    setAppState((prev) => ({ ...prev, photoUri, handLandmarks: landmarks }));
  };

  const handleRetake = () => {
    setAppState((prev) => ({ ...prev, photoUri: null, handLandmarks: [] }));
  };

  if (!appState.photoUri) {
    return (
      <CameraScreen
        washMode={appState.washMode}
        onWashModeChange={(washMode) => setAppState((prev) => ({ ...prev, washMode }))}
        onScanComplete={handleScanComplete}
      />
    );
  }

  // Phase 4에서 Skia 기반 ResultScreen(세균/반짝이 오버레이)으로 교체될 임시 화면
  return (
    <View style={styles.resultPlaceholder}>
      <Image source={{ uri: appState.photoUri }} style={styles.resultImage} />
      <Text style={styles.resultText}>
        손 좌표 {appState.handLandmarks.length}개 인식됨 ({appState.washMode})
      </Text>
      <Pressable style={styles.retakeButton} onPress={handleRetake}>
        <Text style={styles.retakeButtonText}>다시 찍기 🔄</Text>
      </Pressable>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  resultPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  resultImage: {
    width: '90%',
    height: '60%',
    borderRadius: 12,
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
  },
  retakeButton: {
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retakeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
