# 다국어 지원 (Localization)

## 🔗 상위 문서
[[00_Overview]]

## 관련 노드
[[Settings_and_Persistence]]

---

기기 언어 설정에 따라 앱 안의 모든 화면 문구가 자동으로 번역되어 보이도록
`i18next` + `react-i18next` + `expo-localization`을 사용한다.

## 지원 언어
- 영어(`en`, 기본값/폴백) · 한국어(`ko`) · 일본어(`ja`) · 중국어 간체(`zh`)
- 지원하지 않는 기기 언어(예: 프랑스어, 독일어)는 영어로 표시된다.

## 구현
- `src/i18n/locales/{ko,en,ja,zh}.json` — 화면별로 중첩된 번역 리소스
  (`common`, `home`, `settings`, `help`, `camera`, `result` 네임스페이스)
- `src/i18n/index.ts` — `expo-localization`의 `Localization.getLocales()[0]`으로
  기기의 1순위 언어 코드를 읽어, 지원 언어 목록에 있으면 그 언어로,
  없으면 영어(`DEFAULT_LANGUAGE`)로 `i18next`를 초기화한다. `App.tsx`가
  최상단에서 `import './src/i18n'`로 부팅 시점에 한 번 초기화한다.
- 각 화면(`HomeScreen`, `SettingsScreen`, `HelpScreen`, `CameraScreen`,
  `ResultScreen`)은 `useTranslation()`의 `t('namespace.key')`로 문자열을
  가져온다. 하드코딩된 한국어 문자열은 남기지 않는 것이 원칙이다.

## ⚠️ 알려진 범위 제한
아래 두 가지는 JS 번들 밖의 네이티브/스토어 영역이라 이번 구현 범위에
포함되지 않았다 — 필요해지면 Expo의 `app.json` `"locales"` 필드로
Info.plist/strings.xml을 언어별로 오버라이드하는 별도 작업이 필요하다.
- 앱 런처(홈 화면) 표시 이름 — 여전히 한국어 "손 세균 스캐너" 고정
- OS 카메라 권한 요청 팝업의 안내 문구(`app.json`의 `cameraPermission`) — 여전히
  한국어 고정. (앱 안의 카메라 권한 유도 화면 문구는 번역됨, [[Localization]] 대상)

## 새 문구를 추가할 때
새 화면/문구를 추가할 때는 `t('...')` 없이 문자열을 하드코딩하지 말고, 반드시
4개 로케일 파일 모두에 키를 추가할 것 — 한 언어만 추가하면 다른 언어에서는
`i18next`의 `fallbackLng: 'en'`에 의해 영어로 대체 표시된다(깨지진 않지만
번역 누락 상태로 남는다).
