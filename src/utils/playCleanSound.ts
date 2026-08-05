/**
 * 손 씻은 후(AFTER) 모드에서 재생하는 "뽀득" 효과음.
 * (docs/content/03_Germ_and_Clean_Rendering.md, docs/content/04_Asset_and_Development_Guide.md:
 *  assets/sounds/clean.mp3)
 *
 * 팀에서 준비할 실제 사운드 에셋(assets/sounds/clean.mp3)이 아직 없어
 * 에셋 이원화 원칙에 따라 현재는 안전하게 no-op으로 동작한다.
 * 파일이 assets/sounds/clean.mp3 경로에 추가되면 아래 주석을 해제해서 교체한다:
 *
 * ```ts
 * import { Audio } from 'expo-av';
 *
 * export const playCleanSound = async (): Promise<void> => {
 *   const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/clean.mp3'));
 *   sound.setOnPlaybackStatusUpdate((status) => {
 *     if (status.isLoaded && status.didJustFinish) {
 *       sound.unloadAsync();
 *     }
 *   });
 *   await sound.playAsync();
 * };
 * ```
 */
export const playCleanSound = async (): Promise<void> => {
  // assets/sounds/clean.mp3 준비 전까지는 의도적으로 아무 것도 하지 않는다.
};
