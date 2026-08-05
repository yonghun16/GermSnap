/**
 * 효과음 재생 헬퍼 모음.
 * (docs/content/04_Asset_and_Development_Guide.md - assets/sounds/{scan,clean,error}.mp3)
 *
 * 팀에서 준비할 실제 mp3 에셋이 아직 없어(assets/sounds/는 .gitkeep만 존재) 에셋
 * 이원화 원칙에 따라 현재는 안전하게 no-op으로 동작한다. 각 파일이 추가되면
 * 아래 주석을 해제해서 교체한다:
 *
 * ```ts
 * import { Audio } from 'expo-av';
 *
 * const play = async (asset: number) => {
 *   const { sound } = await Audio.Sound.createAsync(asset);
 *   sound.setOnPlaybackStatusUpdate((status) => {
 *     if (status.isLoaded && status.didJustFinish) {
 *       sound.unloadAsync();
 *     }
 *   });
 *   await sound.playAsync();
 * };
 *
 * export const playScanSound = () => play(require('../../assets/sounds/scan.mp3'));
 * export const playCleanSound = () => play(require('../../assets/sounds/clean.mp3'));
 * export const playErrorSound = () => play(require('../../assets/sounds/error.mp3'));
 * ```
 */

/** 촬영 직후 스캔 연출 중 재생하는 효과음. (assets/sounds/scan.mp3) */
export const playScanSound = async (): Promise<void> => {};

/** AFTER 모드(손 씻은 후) 결과 화면에서 재생하는 뽀득 효과음. (assets/sounds/clean.mp3) */
export const playCleanSound = async (): Promise<void> => {};

/** 손 미인식 예외 상황에서 재생하는 에러 효과음. (assets/sounds/error.mp3) */
export const playErrorSound = async (): Promise<void> => {};
