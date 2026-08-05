// react-native-gesture-handler는 다른 모든 import보다 먼저 평가되어야 한다.
// (Phase 5에서 GestureDetector/GestureHandlerRootView를 쓰기 시작하면서 필요해짐)
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
