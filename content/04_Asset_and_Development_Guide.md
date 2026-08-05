# 04. 에셋 관리 및 개발 로드맵 (Assets & Execution Roadmap)

## 🔗 연관 문서
- [[00_Overview]]
- [[01_Architecture_Flow]]
- [[03_Germ_and_Clean_Rendering]]

---

## 📁 1. 에셋 폴더 구조 (Asset Structure)

```text
assets/
 ├── germs/             # 세균 이미지 (PNG, 투명 배경)
 │    ├── germ1.png
 │    ├── germ2.png
 │    └── germ3.png
 ├── effects/           # 손씻은 후 반짝이/비눗방울 이미지
 │    └── sparkle.png
 └── sounds/            # 효과음
      ├─ scan.mp3       # 스캔 소리
      ├─ clean.mp3      # 뽀득 소리
      └─ error.mp3      # 손 미인식 에러음
```

## 🎨 2. 세균 컴포넌트 이원화 구조 (Dummy Fallback)

실제 PNG 파일이 없는 초기 개발 단계에서도 앱이 구동되도록 `GermSprite.tsx`를 아래와 같이 분기 구현합니다.
```TypeScript
// src/components/GermSprite.tsx
import React from 'react';
import { Image } from '@shopify/react-native-skia';
import { DummyGerm } from './DummyGerm'; // Skia Circle 기반 임시 도형

export const GermSprite = ({ x, y, size, opacity, pngAsset }) => {
  if (pngAsset) {
    return <Image height="{size}" image="{pngAsset}" opacity="{opacity}" width="{size}" x="{x}" y="{y}"/>;
  }
  // PNG 파일이 준비되지 않은 경우 백업용 벡터 도형 대체
  return <DummyGerm opacity="{opacity}" size="{size}" x="{x}" y="{y}"/>;
};
```

## 🚀 3. Claude 실행 로드맵 (Phase 1 ~ 5)

Claude 또는 AI 에이전트에 지시 시 아래 단계 순서로 코드 생성을 진행하도록 합니다.

- **Phase 1**: 프로젝트 초기 세팅, 패키지 의존성 설치, 에셋 이원화 컴포넌트(`DummyGerm.tsx`) 구성
    
- **Phase 2**: `CameraScreen` 구현 및 상단 모드 선택 탭(`washMode`) UI 구성
    
- **Phase 3**: MediaPipe Hand Landmarker 연동, 단일 사진 분석 헬퍼 함수 및 예외 처리 구현
    
- **Phase 4**: Skia Canvas 구현, 세균 오버레이/반짝이 이펙트 분기 및 우하단 히든 버튼 구현
    
- **Phase 5**: Pinch Zoom 제스처 연동 및 효과음/진동 연출 최종 결합