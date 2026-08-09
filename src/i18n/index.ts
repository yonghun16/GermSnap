import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

// 지원 언어. 이 목록에 없는 기기 언어(예: 'fr', 'de')는 영어(fallback/기본값)로 표시된다.
const resources = { ko: { translation: ko }, en: { translation: en }, ja: { translation: ja }, zh: { translation: zh } };
type SupportedLanguage = keyof typeof resources;
const SUPPORTED_LANGUAGES = Object.keys(resources) as SupportedLanguage[];
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

const isSupportedLanguage = (code: string | null): code is SupportedLanguage =>
  code !== null && (SUPPORTED_LANGUAGES as string[]).includes(code);

// expo-localization의 getLocales()는 기기에 설정된 언어 우선순위 목록을 반환한다.
// 첫 번째 항목의 languageCode(예: 'ko', 'en', 'ja', 'zh')로 지원 언어 여부를 판단하고,
// 지원하지 않는 언어면 영어로 시작한다.
const deviceLanguageCode = Localization.getLocales()[0]?.languageCode ?? null;
const initialLanguage: SupportedLanguage = isSupportedLanguage(deviceLanguageCode)
  ? deviceLanguageCode
  : DEFAULT_LANGUAGE;

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18n;
