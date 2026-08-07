# 세균/반짝이 컴포넌트 이원화 구조 (Dummy Fallback)

## 🔗 상위 문서
[[04_Asset_and_Development_Guide]]

## 관련 노드
[[Germ_Display_Mode]] · [[After_Mode_Effects]] · [[Asset_Folder_Structure]]

---

실제 PNG가 없거나(반짝이), 사용자가 [[Germ_Display_Mode|캐릭터 모드]]를 선택해
일부러 PNG를 쓰지 않을 때도 동일한 컴포넌트가 자연스럽게 벡터 도형으로 대체되도록
`pngAsset`이 없거나 `null`이면 Dummy 컴포넌트로 폴백하는 구조를 유지한다. 원래는
개발 초기 단계(에셋이 아직 준비되지 않았을 때)를 위한 설계였는데, 지금은 캐릭터
모드라는 정식 기능의 기반으로도 재사용되고 있다.

```typescript
// src/components/GermSprite.tsx (개념 요약 — 실제로는 rotation/scale/breatheClock까지 반영)
export const GermSprite = ({ x, y, size, opacity, pngAsset, zoomFactor, breatheClock, phaseOffset }) => {
  if (pngAsset) {
    // 실제 세균 사진 (현미경 모드) — 원본 비율 유지, 확대 배율과 숨쉬기 애니메이션 반영
    return <Image image={pngAsset} x={x} y={y} width={size} height={size} opacity={opacity} />;
  }
  // pngAsset이 null이면 캐릭터 모드/미준비 상태 모두 동일하게 벡터 도형으로 대체
  return <DummyGerm x={x} y={y} size={size} opacity={opacity} />;
};
```

`ResultScreen.tsx`는 `germDisplayMode === 'CHARACTER'`일 때 `pngAsset`에 항상 `null`을
넘겨서 이 폴백 경로를 그대로 "캐릭터 모드"로 재사용한다.

## 반짝이도 동일한 구조
`SparkleSprite.tsx` → `pngAsset` 없으면 `DummySparkle.tsx`. 현재는
[[Asset_Folder_Structure|반짝이 PNG 에셋 자체가 없어]] 항상 `DummySparkle`(4방향
별 벡터 도형, [[After_Mode_Effects]] 참고)로 그려진다.
