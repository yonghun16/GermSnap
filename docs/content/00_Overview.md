# 00. 프로젝트 개요 (Overview)

## 📌 프로젝트 정보
- **앱 이름**: 보건교육용 손 세균 스캐너 (Hand Germ Scanner)
- **목적**: 초등학교 어린이 보건교육을 위한 100% 오프라인 On-Device AI 손 세균 시각화 모바일 앱
- **타겟 사용자**: 초등학생 및 보건교사

## 🔗 연관 문서 (Obsidian Links)
- 시스템 구조 및 상태 관리: [[01_Architecture_Flow]]
- 카메라 및 AI 손 인식 로직: [[02_Camera_and_AI]]
- 세균/이펙트 렌더링 & 제스처: [[03_Germ_and_Clean_Rendering]]
- 에셋 관리 및 개발 로드맵: [[04_Asset_and_Development_Guide]]

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 / 라이브러리 | 용도 |
| :--- | :--- | :--- |
| **Framework** | React Native (Expo Bare Workflow / RN CLI) | Cross-platform 모바일 앱 |
| **Language** | TypeScript | 타입 안전성 확보 |
| **On-Device AI** | Google MediaPipe Hand Landmarker | 21개 손 좌표 추출 (오프라인) |
| **2D Graphics** | `@shopify/react-native-skia` | 캔버스 마스킹 및 세균/이펙트 오버레이 |
| **Gesture** | `react-native-gesture-handler`, `reanimated` | 두 손가락 꼬집기(Pinch Zoom) 확대 |
| **Camera** | `react-native-vision-camera` 또는 `expo-camera` | 카메라 피드 및 사진 캡처 |
| **Feedback** | `expo-haptics`, `expo-av` | 스캔 진동 및 뽀득/스캔 효과음 |

---

## 💡 개발 핵심 원칙
1. **100% 오프라인 동작**: 서버 통신 금지 (학교 현장의 Wi-Fi 불안정 고려)
2. **단일 정지 이미지 분석**: 실시간 동영상 분석 대신 캡처된 정지 이미지 분석을 통한 안정성 및 저사양 단말 가속 확보
3. **인간 검토 중심 개발**: 옵시디언 문서의 요구사항 변경 시 에이전트(Claude)에 개정된 명세 전달
