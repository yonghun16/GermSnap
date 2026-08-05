import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
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

  if (!appState.photoUri) {
    return (
      <>
        <CameraScreen
          washMode={appState.washMode}
          onWashModeChange={(washMode) => setAppState((prev) => ({ ...prev, washMode }))}
          onScanComplete={handleScanComplete}
        />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <ResultScreen
        photoUri={appState.photoUri}
        washMode={appState.washMode}
        handLandmarks={appState.handLandmarks}
        isCleanMode={appState.isCleanMode}
        onToggleCleanMode={handleToggleCleanMode}
        onRetake={handleRetake}
      />
      <StatusBar style="light" />
    </>
  );
}
