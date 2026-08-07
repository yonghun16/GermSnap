import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GermDisplayMode } from '../types';

const STORAGE_KEY = 'handGermScanner.germDisplayMode';

// 기본값은 캐릭터 모드 — 저장된 값이 없거나(최초 실행) 읽기에 실패하면
// 항상 캐릭터 모드로 시작한다. 현미경 모드는 사용자가 설정에서 명시적으로
// 고른 경우에만 적용된다.
export const loadGermDisplayMode = async (): Promise<GermDisplayMode> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored === 'MICROSCOPE' ? 'MICROSCOPE' : 'CHARACTER';
  } catch {
    return 'CHARACTER';
  }
};

export const saveGermDisplayMode = async (mode: GermDisplayMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // 저장에 실패해도 현재 세션의 동작에는 지장이 없으므로 조용히 무시한다.
  }
};
