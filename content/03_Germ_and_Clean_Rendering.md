# 03. 세균/이펙트 렌더링 & 제스처 (Germ Rendering & Interaction)

## 🔗 연관 문서
- [[01_Architecture_Flow]]
- [[02_Camera_and_AI]]
- [[04_Asset_and_Development_Guide]]

---

## 🦠 1. 세균 그래픽 오버레이 (washMode === 'BEFORE')

MediaPipe가 추출한 21개 손 좌표를 기준으로 세균을 자연스럽게 산출하여 `@shopify/react-native-skia` Canvas 위에 그립니다.

### 세균 좌표 분산 알고리즘 및 픽셀 변환
> ⚠️ **좌표 변환 필수 규칙**:  
> MediaPipe의 x, y 좌표는 `0.0 ~ 1.0` 사이의 정규화(Normalized) 값이므로, Skia Canvas에 배치할 때는 반드시 **`x * canvasWidth`**, **`y * canvasHeight`**를 곱해 실제 화면 픽셀 좌표로 변환해야 합니다.

1. 21개 픽셀 좌표 중심점 주변에 Random Offset Radius (±20px ~ 40px)를 적용합니다.
2. 총 15 ~ 30개의 세균 객체(`GermObject`)를 무작위로 생성합니다.
3. 각 세균마다 무작위 회전각(`0~360°`), 무작위 스케일(`0.8~1.3`), 투명도(`opacity: 0.4~0.7`)를 부여합니다.

---

## ✨ 2. 깨끗해진 손 이펙트 (washMode === 'AFTER')

1. 세균 그래픽을 전혀 생성하지 않습니다 (`0개`).
2. 손 좌표 21개 위치 주변에 반짝이(Sparkle) 스티커 또는 비눗방울 스티커 애니메이션을 생성합니다.
3. 상단에 칭찬 메시지 팝업 연출: `"✨ 참 잘했어요! 세균이 깨끗하게 사라졌어요!"`
4. 뽀득거리는 상쾌한 효과음 재생 (`expo-av`).

---

## 🔍 3. 확대/축소 제스처 (Pinch Zoom)

- `react-native-gesture-handler`의 `PinchGestureHandler`를 사용합니다.
- 원본 손 사진과 Skia 세균/이펙트 레이어를 하나의 `Reanimated.View` 래퍼로 감싸 **1:1 동시 확대/축소**가 이뤄지도록 구현합니다.
- **최대 확대율**: 4.0x (손톱 밑 세균 밀착 관찰용)

---

## 🤫 4. 우하단 히든 버튼 (Clean Mode Toggle)

- **위치**: `ResultScreen` 우하단 구석 (가로 30px x 세로 30px)
- **스타일**: 거의 안 보이는 투명도 (`opacity: 0.03`)
- **기능**: 탭 시 `isCleanMode` 상태를 `true`로 토글 ➔ [손 씻기 전] 모드로 찍힌 사진이라도 세균 레이어의 `opacity`를 `0`으로 전환해 깨끗해진 손으로 보임.