import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GermDisplayMode } from '../types';

const STORAGE_KEY = 'handGermScanner.germDisplayMode';

export const loadGermDisplayMode = async (): Promise<GermDisplayMode> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored === 'CHARACTER' ? 'CHARACTER' : 'MICROSCOPE';
  } catch {
    return 'MICROSCOPE';
  }
};

export const saveGermDisplayMode = async (mode: GermDisplayMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // 저장에 실패해도 현재 세션의 동작에는 지장이 없으므로 조용히 무시한다.
  }
};
