import React from 'react';
import { Circle, Group, Path, Skia } from '@shopify/react-native-skia';

type EyeStyle = 'round' | 'surprised' | 'sleepy' | 'wink' | 'angry';
type MouthStyle = 'smile' | 'open' | 'grin' | 'flat' | 'tongue' | 'smirk';

interface GermCharacterConfig {
  bodyColor: string;
  bumpColor: string;
  bumpCount: number;
  eyeStyle: EyeStyle;
  mouthStyle: MouthStyle;
}

// 캐릭터 모드 전용 세균 캐릭터 6종 — 몸 색깔/돌기 개수와 표정(눈·입 모양)을
// 서로 다르게 줘서 다양한 종류처럼 보이게 한다. GERM_TYPE_COUNT(generateGerms.ts)와
// 개수를 맞춰서, 세균마다 이미 갖고 있는 typeIndex(0~5)를 그대로 캐릭터 선택에 쓴다.
export const GERM_CHARACTERS: GermCharacterConfig[] = [
  { bodyColor: '#8BC34A', bumpColor: '#558B2F', bumpCount: 6, eyeStyle: 'round', mouthStyle: 'smile' }, // 명랑이
  { bodyColor: '#BA68C8', bumpColor: '#7B1FA2', bumpCount: 5, eyeStyle: 'surprised', mouthStyle: 'open' }, // 깜짝이
  { bodyColor: '#4FC3F7', bumpColor: '#0288D1', bumpCount: 7, eyeStyle: 'wink', mouthStyle: 'tongue' }, // 장난꾸러기
  { bodyColor: '#FFB74D', bumpColor: '#F57C00', bumpCount: 6, eyeStyle: 'sleepy', mouthStyle: 'flat' }, // 잠보
  { bodyColor: '#F06292', bumpColor: '#C2185B', bumpCount: 5, eyeStyle: 'round', mouthStyle: 'grin' }, // 능글이
  { bodyColor: '#4DB6AC', bumpColor: '#00796B', bumpCount: 8, eyeStyle: 'angry', mouthStyle: 'smirk' }, // 심술이
];

interface EyesProps {
  cx: number;
  eyeY: number;
  offsetX: number;
  radius: number;
  style: EyeStyle;
}

const EYE_DARK = '#2E2E2E';

const RoundEye = ({ x, y, radius }: { x: number; y: number; radius: number }) => (
  <Group>
    <Circle cx={x} cy={y} r={radius * 0.17} color="#fff" />
    <Circle cx={x + radius * 0.02} cy={y + radius * 0.02} r={radius * 0.09} color={EYE_DARK} />
  </Group>
);

const BigEye = ({ x, y, radius }: { x: number; y: number; radius: number }) => (
  <Group>
    <Circle cx={x} cy={y} r={radius * 0.24} color="#fff" />
    <Circle cx={x} cy={y + radius * 0.02} r={radius * 0.13} color={EYE_DARK} />
    <Circle cx={x - radius * 0.05} cy={y - radius * 0.06} r={radius * 0.04} color="#fff" />
  </Group>
);

const ClosedEye = ({ x, y, radius }: { x: number; y: number; radius: number }) => {
  const path = Skia.Path.Make();
  const w = radius * 0.16;
  path.moveTo(x - w, y);
  path.quadTo(x, y + radius * 0.08, x + w, y);
  return <Path path={path} style="stroke" strokeWidth={radius * 0.05} strokeCap="round" color={EYE_DARK} />;
};

const AngryBrow = ({ x, y, radius, mirror }: { x: number; y: number; radius: number; mirror: boolean }) => {
  const path = Skia.Path.Make();
  const w = radius * 0.16;
  const dir = mirror ? -1 : 1;
  path.moveTo(x - w * dir, y - radius * 0.02);
  path.lineTo(x + w * dir, y - radius * 0.14);
  return <Path path={path} style="stroke" strokeWidth={radius * 0.05} strokeCap="round" color={EYE_DARK} />;
};

const GermEyes = ({ cx, eyeY, offsetX, radius, style }: EyesProps) => {
  const leftX = cx - offsetX;
  const rightX = cx + offsetX;

  switch (style) {
    case 'surprised':
      return (
        <Group>
          <BigEye x={leftX} y={eyeY} radius={radius} />
          <BigEye x={rightX} y={eyeY} radius={radius} />
        </Group>
      );
    case 'sleepy':
      return (
        <Group>
          <ClosedEye x={leftX} y={eyeY} radius={radius} />
          <ClosedEye x={rightX} y={eyeY} radius={radius} />
        </Group>
      );
    case 'wink':
      return (
        <Group>
          <RoundEye x={leftX} y={eyeY} radius={radius} />
          <ClosedEye x={rightX} y={eyeY} radius={radius} />
        </Group>
      );
    case 'angry':
      return (
        <Group>
          <RoundEye x={leftX} y={eyeY} radius={radius} />
          <RoundEye x={rightX} y={eyeY} radius={radius} />
          <AngryBrow x={leftX} y={eyeY - radius * 0.16} radius={radius} mirror={false} />
          <AngryBrow x={rightX} y={eyeY - radius * 0.16} radius={radius} mirror />
        </Group>
      );
    case 'round':
    default:
      return (
        <Group>
          <RoundEye x={leftX} y={eyeY} radius={radius} />
          <RoundEye x={rightX} y={eyeY} radius={radius} />
        </Group>
      );
  }
};

interface MouthProps {
  cx: number;
  cy: number;
  radius: number;
  style: MouthStyle;
}

const GermMouth = ({ cx, cy, radius, style }: MouthProps) => {
  const w = radius * 0.28;

  switch (style) {
    case 'open': {
      return <Circle cx={cx} cy={cy} r={radius * 0.15} color={EYE_DARK} />;
    }
    case 'tongue': {
      const path = Skia.Path.Make();
      path.addOval({ x: cx - w * 0.6, y: cy - radius * 0.1, width: w * 1.2, height: radius * 0.24 });
      return (
        <Group>
          <Path path={path} color={EYE_DARK} />
          <Circle cx={cx} cy={cy + radius * 0.14} r={radius * 0.09} color="#EF9A9A" />
        </Group>
      );
    }
    case 'grin': {
      const path = Skia.Path.Make();
      path.moveTo(cx - w, cy);
      path.quadTo(cx + radius * 0.1, cy + radius * 0.28, cx + w, cy - radius * 0.02);
      return <Path path={path} style="stroke" strokeWidth={radius * 0.07} strokeCap="round" color={EYE_DARK} />;
    }
    case 'flat': {
      const path = Skia.Path.Make();
      path.moveTo(cx - w * 0.6, cy);
      path.lineTo(cx + w * 0.6, cy);
      return <Path path={path} style="stroke" strokeWidth={radius * 0.06} strokeCap="round" color={EYE_DARK} />;
    }
    case 'smirk': {
      const path = Skia.Path.Make();
      path.moveTo(cx - w * 0.7, cy - radius * 0.02);
      path.quadTo(cx + radius * 0.05, cy, cx + w, cy - radius * 0.16);
      return <Path path={path} style="stroke" strokeWidth={radius * 0.06} strokeCap="round" color={EYE_DARK} />;
    }
    case 'smile':
    default: {
      const path = Skia.Path.Make();
      path.moveTo(cx - w, cy);
      path.quadTo(cx, cy + radius * 0.22, cx + w, cy);
      return <Path path={path} style="stroke" strokeWidth={radius * 0.06} strokeCap="round" color={EYE_DARK} />;
    }
  }
};

interface DummyGermProps {
  x: number;
  y: number;
  size: number;
  opacity: number;
  /** 어떤 세균 캐릭터를 쓸지 (0 ~ GERM_CHARACTERS.length-1). 범위를 벗어나면 안전하게 보정한다. */
  typeIndex?: number;
}

/**
 * 캐릭터 모드에서 쓰는 표정 있는 세균 캐릭터 (Skia 벡터 도형).
 * 몸 색깔/돌기 + 눈/입 표정 조합으로 6종의 서로 다른 캐릭터를 표현한다.
 * (docs/content/04_Asset_and_Development_Guide.md - 세균 컴포넌트 이원화 구조)
 */
export const DummyGerm = ({ x, y, size, opacity, typeIndex = 0 }: DummyGermProps) => {
  const config = GERM_CHARACTERS[((typeIndex % GERM_CHARACTERS.length) + GERM_CHARACTERS.length) % GERM_CHARACTERS.length];
  const radius = size / 2;
  const cx = x + radius;
  const cy = y + radius;
  const bodyRadius = radius * 0.82;

  // 몸 주위에 오톨도톨한 돌기(bump)를 균일 간격으로 배치 — 균 특유의
  // 오돌토돌한 실루엣을 표현한다. 캐릭터마다 돌기 개수를 다르게 줘서 실루엣도 다양해진다.
  const bumps = Array.from({ length: config.bumpCount }, (_, i) => {
    const angle = (Math.PI * 2 * i) / config.bumpCount;
    return {
      cx: cx + Math.cos(angle) * bodyRadius * 0.95,
      cy: cy + Math.sin(angle) * bodyRadius * 0.95,
      r: bodyRadius * 0.16,
    };
  });

  const eyeOffsetX = bodyRadius * 0.34;
  const eyeY = cy - bodyRadius * 0.06;
  const mouthY = cy + bodyRadius * 0.36;

  return (
    <Group opacity={opacity}>
      {bumps.map((bump, i) => (
        <Circle key={i} cx={bump.cx} cy={bump.cy} r={bump.r} color={config.bumpColor} />
      ))}
      <Circle cx={cx} cy={cy} r={bodyRadius} color={config.bodyColor} />
      <GermEyes cx={cx} eyeY={eyeY} offsetX={eyeOffsetX} radius={bodyRadius} style={config.eyeStyle} />
      <GermMouth cx={cx} cy={mouthY} radius={bodyRadius} style={config.mouthStyle} />
    </Group>
  );
};
