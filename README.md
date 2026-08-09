# 🧼 보건교육용 Germ Snap (세균 카메라)

> **On-Device AI 기반 초등학교 보건교육용 손 세균 시각화 모바일 앱**  
> 아이들이 손 씻기의 중요성을 눈으로 직접 확인하고 즐겁게 습관화할 수 있도록 돕는 오프라인 교육 도구입니다.

[![Quartz Docs](https://img.shields.io/badge/Docs-Quartz_v5-84a59d?style=flat-square)](https://yonghun16.github.io/GermSnap)
[![React Native](https://img.shields.io/badge/React_Native-Expo-61dafb?style=flat-square&logo=react)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 📌 프로젝트 개요 (Overview)

학교 현장의 인터넷 환경이 불안정하거나 Wi-Fi 연결이 어려운 상황을 고려하여 **100% On-Device 오프라인**으로 작동합니다.  
단일 정지 이미지 분석을 통해 저사양 스마트폰/태블릿에서도 빠르게 손 위치를 추적하고, 손 씻기 전/후 모드에 따라 맞춤형 그래픽 이펙트를 합성합니다.

- **타겟 사용자**: 초등학생 및 보건교사
- **핵심 목표**: 손 씻기 전 세균 시각화 및 손 씻은 후 칭찬 이펙트를 통한 보건교육 효과 극대화
- **웹 명세서**: 🔗 [온라인 개발 명세서 바로가기](https://yonghun16.github.io/GermSnap)

---

## ✨ 주요 기능 (Key Features)

- 📸 **카메라 가이드라인 & 촬영**: 손 모양 오버레이 가이드에 맞춰 안정적인 스캔 지원
- 🤖 **On-Device AI 손 인식**: MediaPipe Hand Landmarker 기반 21개 손 관절 좌표 추출 (서버 통신 없음)
- 🦠 **손 씻기 전 모드 (`BEFORE`)**: 손 좌표 주변에 무작위 세균 그래픽(15~30개) 자동 오버레이
- ✨ **손 씻은 후 모드 (`AFTER`)**: 세균 제거 및 반짝이/비눗방울 이펙트 + 칭찬 팝업 연출
- 🔍 **Pinch Zoom 관절 밀착 관찰**: 최대 4배 확대하여 손톱 밑이나 손가락 마디 세균 상세 관찰
- 🤫 **보건교사용 히든 버튼**: 화면 우하단 스텔스 버튼을 통해 즉시 깨끗해진 손으로 모드 전환 가능

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 / 라이브러리 | 용도 |
| :--- | :--- | :--- |
| **Framework** | React Native (Expo) | Cross-platform 모바일 앱 |
| **Language** | TypeScript | 타입 안정성 및 명세서 일치성 확보 |
| **AI / ML** | Google MediaPipe Hand Landmarker | 오프라인 손 21개 Keypoint 좌표 추출 |
| **Graphics** | `@shopify/react-native-skia` | 고성능 2D 세균 및 이펙트 캔버스 렌더링 |
| **Gestures** | `react-native-gesture-handler`, `reanimated` | 1:1 동시 확대/축소 (Pinch Zoom) |
| **Feedback** | `expo-haptics`, `expo-av` | 스캔 진동 및 뽀득거리는 효과음 제공 |
| **Docs Engine**| Quartz v5 | 옵시디언 기반 정적 웹사이트 자동 배포 |

---

## 📁 프로젝트 구조 (Directory Structure)

```text
GermSnap/
 ├── CLAUDE.md                   # AI 에이전트 개발 지침서
 ├── README.md                   # 프로젝트 메인 안내 문서
 ├── content/                    # 옵시디언 기획/명세 문서 (Quartz 배포용)
 │    ├── index.md
 │    ├── 00_Overview.md
 │    ├── 01_Architecture_Flow.md
 │    ├── 02_Camera_and_AI.md
 │    ├── 03_Germ_and_Clean_Rendering.md
 │    └── 04_Asset_and_Development_Guide.md
 ├── assets/                     # 세균 PNG, 이펙트, 효과음 에셋
 ├── src/
 │    ├── components/            # DummyGerm, GermSprite 등 UI 컴포넌트
 │    ├── screens/               # CameraScreen, ResultScreen
 │    ├── utils/                 # MediaPipe 좌표 분석 및 변환 헬퍼
 │    └── types/                 # AppState, WashMode 타입 정의
 └── quartz.config.default.yaml  # Quartz 설정 파일
