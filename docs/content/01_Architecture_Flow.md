# 01. 시스템 구조 및 화면 흐름 (Architecture & Flow)

## 🔗 연관 문서
- [[00_Overview]]
- [[02_Camera_and_AI]]
- [[03_Germ_and_Clean_Rendering]]

---

## 🔄 핵심 모드 상태 (Wash Mode)

앱은 항상 두 가지 교육 모드 중 하나를 유지합니다:
1. `washMode: 'BEFORE'` (손 씻기 전 모드) ➔ 사진 촬영 시 손에 세균 합성
2. `washMode: 'AFTER'` (손 씻은 후 모드) ➔ 세균 미생성, 반짝이 이펙트 & 칭찬 팝업

---

## 📱 화면 전환 흐름 (Screen Flow)

```text
[CameraScreen]
   ├─ 상단 탭: [🧼 손 씻기 전] | [✨ 손 씻은 후] 선택
   ├─ 카메라 가이드라인 오버레이
   └─ [촬영] 버튼 클릭
         │
         ▼ (Photo URI & washMode 전달)
[Scan Loading Overlay] (약 0.8초간 진동 + "스캔 중..." 연출)
         │
         ▼ ([[02_Camera_and_AI]] 손 좌표 분석)
┌─────────────────────────┴─────────────────────────┐
│ (손 인식 성공)                                    │ (손 미인식: landmarks === 0)
▼                                                   ▼
[ResultScreen]                                   [에러 팝업]
   ├─ Skia Canvas 오버레이                        "손이 보이지 않아요!"
   │   ├─ BEFORE 모드: 세균 합성                     └─► [CameraScreen] 복귀
   │   └─ AFTER 모드: 반짝이 + 칭찬 메시지
   ├─ Pinch Zoom 기능 (최대 4배)
   ├─ [다시 찍기 🔄] 버튼 (좌상단)
   └─ [히든 버튼 🤫] (우하단, opacity 0.03) ➔ Clean Mode 강제 토글
```

## 📊 중앙 데이터 상태 (State Management)

TypeScript

```
interface AppState {
  washMode: 'BEFORE' | 'AFTER';  // 현재 촬영 모드
  photoUri: string | null;         // 촬영된 정지 이미지 경로
  handLandmarks: Point3D[];        // MediaPipe가 반환한 21개 좌표
  isCleanMode: boolean;            // 히든 버튼 클릭 시 토글되는 상태
}
```
