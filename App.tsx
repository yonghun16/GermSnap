import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import './src/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HelpScreen } from './src/screens/HelpScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { loadGermDisplayMode, saveGermDisplayMode } from './src/utils/germDisplayModeStorage';
import type { AppState, GermDisplayMode } from './src/types';

const initialState: AppState = {
  washMode: 'BEFORE',
  photoUri: null,
  handLandmarks: [],
  isCleanMode: false,
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [hasStarted, setHasStarted] = useState(false);
  // Home 화면 위에 보여줄 하위 화면 — 셋 중 하나는 항상 배타적으로만 열린다.
  const [homeView, setHomeView] = useState<'main' | 'settings' | 'help'>('main');
  const [germDisplayMode, setGermDisplayMode] = useState<GermDisplayMode>('CHARACTER');

  useEffect(() => {
    loadGermDisplayMode().then(setGermDisplayMode);
  }, []);

  const handleChangeGermDisplayMode = (mode: GermDisplayMode) => {
    setGermDisplayMode(mode);
    saveGermDisplayMode(mode);
  };

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
        homeView === 'settings' ? (
          <SettingsScreen
            germDisplayMode={germDisplayMode}
            onChangeGermDisplayMode={handleChangeGermDisplayMode}
            onBack={() => setHomeView('main')}
          />
        ) : homeView === 'help' ? (
          <HelpScreen onBack={() => setHomeView('main')} />
        ) : (
          <HomeScreen
            onStart={() => setHasStarted(true)}
            onOpenSettings={() => setHomeView('settings')}
            onOpenHelp={() => setHomeView('help')}
          />
        )
      ) : appState.photoUri ? (
        <ResultScreen
          photoUri={appState.photoUri}
          washMode={appState.washMode}
          handLandmarks={appState.handLandmarks}
          isCleanMode={appState.isCleanMode}
          germDisplayMode={germDisplayMode}
          onToggleCleanMode={handleToggleCleanMode}
          onRetake={handleRetake}
        />
      ) : (
        <CameraScreen
          washMode={appState.washMode}
          onWashModeChange={(washMode) => setAppState((prev) => ({ ...prev, washMode }))}
          onScanComplete={handleScanComplete}
          onBack={() => setHasStarted(false)}
        />
      )}
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
