# 02. 카메라 및 AI 손 인식 로직 (Camera & On-Device AI)

## 🔗 연관 문서
- [[01_Architecture_Flow]]
- [[03_Germ_and_Clean_Rendering]]

---

## 📸 1. 카메라 촬영 로직

- `CameraScreen`에서 사용자가 손을 구도에 맞출 수 있도록 화면 중앙에 손 모양 점선 가이드라인을 표시합니다.
- [촬영] 버튼 탭 시 현재 프레임을 높은 화질의 정지 이미지 파일(JPG/PNG)로 저장하고 URI를 획득합니다.

---

## 🤖 2. MediaPipe Hand Landmarker 연동

- **기능**: 정지 이미지 URI를 입력받아 손의 21개 3D Keypoint 좌표 배열을 반환합니다.
- **실행 환경**: On-Device (오프라인 TFLite 기반 모듈 사용)
- **입력**: `photoUri` (Local File Path)
- **출력**: `Landmark[]` (x, y, z 비례 좌표 값 21개)

```typescript
// 손 좌표 분석 헬퍼 예시
import { HandLandmarker } from 'react-native-mediapipe';

export const analyzeHandImage = async (uri: string) => {
  const result = await HandLandmarker.detect(uri);
  if (!result || result.landmarks.length === 0) {
    return null; // 손 인식 실패
  }
  return result.landmarks[0]; // 첫 번째 인식된 손의 21개 좌표 반환
};

```

## ⚠️ 3. 예외 처리 (Exception Handling)

1. **손이 인식되지 않은 경우 (`landmarks === null`)**:
    
    - Alert/Toast 메시지 출력: `"손이 잘 보이지 않아요. 손바닥이 화면 중앙에 오도록 다시 찍어주세요!"`
        
    - 스캔 스피너를 중단하고 즉시 `CameraScreen`으로 전환합니다.
        
2. **손이 여러 개 인식된 경우**:
    
    - 가장 면적이 크고 중앙에 가까운 첫 번째 손(`landmarks[0]`) 좌표 정보만 채택합니다.
        
