# Germ Snap - AI Agent Guideline

## 📌 Project Overview & Architecture Specs
이 프로젝트는 초등학교 보건교육용 On-Device AI 손 세균 시각화 앱입니다.
모든 기획 및 상세 로직은 `docs/content/` 폴더 내의 마크다운(Obsidian) 문서에 정의되어 있습니다.


- **프로젝트 개요 및 기술 스택**: `docs/content/00_Overview.md`
- **화면 흐름 및 상태 구조**: docs/content/01_Architecture_Flow.md`
- **카메라 & MediaPipe AI 로직**: `docs/content/02_Camera_and_AI.md`
- **Skia 세균 렌더링 & 제스처**: `docs/content/03_Germ_and_Clean_Rendering.md`
- **에셋 및 개발 로드맵**: `docs/content/04_Asset_and_Development_Guide.md`

> ⚠️ **중요 규칙**: 코드를 작성하거나 수정할 때는 반드시 위 `docs/content/` 폴더 내의 해당 명세 문서를 먼저 참조하여 기획 의도에 맞게 코딩하세요.

---

## 🛠️ Core Principles & Tech Stack
- **Framework**: React Native (Expo Bare Workflow) + TypeScript
- **Graphics & AI**: `@shopify/react-native-skia`, Google MediaPipe Hand Landmarker (오프라인 TFLite)
- **100% Offline**: 외부 서버 통신 코드는 절대 금지 (학교 현장 오프라인 동작 필수)
- **Single Frame Scan**: 실시간 비디오 스트리밍 방식이 아닌, 정지 이미지 캡처 후 분석 방식 유지
- **Coordinate Conversion**: MediaPipe의 정규화 좌표(0.0~1.0)를 Skia Canvas에 그릴 때는 반드시 `x * canvasWidth`, `y * canvasHeight`로 픽셀 변환할 것

---

## 🚀 Execution Roadmap Workflow
코드는 `docs/content/04_Asset_and_Development_Guide.md`의 **Phase 1 ~ Phase 5** 순서에 맞춰 단계별로 구현합니다.

- **Phase 1**: 프로젝트 초기 세팅, 의존성 설치, `DummyGerm.tsx` 구성
- **Phase 2**: `CameraScreen` UI 및 washMode (`BEFORE` / `AFTER`) 상단 탭 구현
- **Phase 3**: MediaPipe 손 좌표 추출 헬퍼 및 예외 처리 구현
- **Phase 4**: Skia Canvas 렌더링 (세균 산출 알고리즘 & 히든 버튼 구현)
- **Phase 5**: Pinch Zoom 및 효과음/진동 연출 최종 통합

---

## 💻 Commands
- **Install**: `npm install` 또는 `npx expo install <package>`
- **Start**: `npx expo start`
- **iOS Run**: `npx expo run:ios`
- **Android Run**: `npx expo run:android`
