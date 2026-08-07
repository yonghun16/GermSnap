import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HomeScreen } from './src/screens/HomeScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import type { AppState } from './src/types';

const initialState: AppState = {
  washMode: 'BEFORE',
  photoUri: null,
  handLandmarks: [],
  isCleanMode: false,
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [hasStarted, setHasStarted] = useState(false);

  const handleScanComplete: React.ComponentProps<typeof CameraScreen>['onScanComplete'] = (
    photoUri,
    landmarks
  ) => {
    setAppState((prev) => ({ ...prev, photoUri, handLandmarks: landmarks, isCleanMode: false }));
  };

  const handleRetake = () => {
    setAppState((prev) => ({ ...prev, photoUri: null, handLandmarks: [], isCleanMode: false }));
  };

  const handleToggleCleanMode = () => {
    setAppState((prev) => ({ ...prev, isCleanMode: !prev.isCleanMode }));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!hasStarted ? (
        <HomeScreen onStart={() => setHasStarted(true)} />
      ) : appState.photoUri ? (
        <ResultScreen
          photoUri={appState.photoUri}
          washMode={appState.washMode}
          handLandmarks={appState.handLandmarks}
          isCleanMode={appState.isCleanMode}
          onToggleCleanMode={handleToggleCleanMode}
          onRetake={handleRetake}
        />
      ) : (
        <CameraScreen
          washMode={appState.washMode}
          onWashModeChange={(washMode) => setAppState((prev) => ({ ...prev, washMode }))}
          onScanComplete={handleScanComplete}
        />
      )}
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
