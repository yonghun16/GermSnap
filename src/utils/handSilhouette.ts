import type { Point3D } from '../types';
import type { DisplayRect } from './displayRect';
import { distanceToSegment, isPointInPolygon } from './geometry';
import type { Point2D } from './geometry';

// MediaPipe 21개 손 랜드마크 인덱스 기준, 손가락별 뼈대 체인(밑동→끝)과
// 손바닥 밑동을 잇는 다각형. 볼록 껍질(convex hull)은 손가락 사이 빈 공간까지
// 채워버리고(손가락 밖으로 균이 튀어나가는 원인), 실제 손 모양과 다르게 뭉치는
// 문제가 있어 이 방식으로 교체했다.
const FINGER_CHAINS = [
  [1, 2, 3, 4], // 엄지 (CMC-MCP-IP-TIP)
  [5, 6, 7, 8], // 검지
  [9, 10, 11, 12], // 중지
  [13, 14, 15, 16], // 약지
  [17, 18, 19, 20], // 소지
];
const PALM_POLYGON_INDICES = [0, 1, 5, 9, 13, 17]; // 손목 → 엄지 밑동 → (검지~소지 밑동) → 손목

export interface HandSilhouette {
  /** 손가락 각 마디를 잇는 선분들 — 점이 이 선분에서 fingerHalfWidth 이내면 손가락 위. */
  fingerSegments: { a: Point2D; b: Point2D }[];
  /** 손가락 두께의 절반(px). 손 크기에 비례해서 계산한다. */
  fingerHalfWidth: number;
  /** 손바닥 밑동(손목 + 각 손가락 MCP)을 잇는 다각형. */
  palmPolygon: Point2D[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

/**
 * 21개 손 좌표로 "손가락 캡슐 + 손바닥 다각형"으로 구성된 손 실루엣을 만든다.
 * 세균/반짝이를 실제 손 모양(손가락 폭 안, 손가락 사이 제외) 안에서만
 * 무작위로 배치하기 위한 판정 기준이다.
 */
export const buildHandSilhouette = (landmarks: Point3D[], rect: DisplayRect): HandSilhouette | null => {
  if (landmarks.length < 21) {
    return null; // 21개 랜드마크가 모두 있어야 손가락 체인을 구성할 수 있다.
  }

  const points: Point2D[] = landmarks.map((p) => ({
    x: rect.x + p.x * rect.width,
    y: rect.y + p.y * rect.height,
  }));

  // 손목~중지 MCP 거리를 손 크기의 기준 척도로 삼아, 손가락 폭도 그에 비례하게
  // 정한다 — 사진 프레임을 꽉 채운 손이든 멀리서 작게 찍힌 손이든 자연스러운
  // 비율을 유지하기 위함. 극단적인 인식 오차에 대비해 10~40px로 클램프한다.
  const wrist = points[0];
  const middleMcp = points[9];
  const referenceLength = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y);
  const fingerHalfWidth = Math.min(Math.max(referenceLength * 0.09, 10), 40);

  const fingerSegments = FINGER_CHAINS.flatMap((chain) =>
    chain.slice(0, -1).map((idx, i) => ({ a: points[idx], b: points[chain[i + 1]] }))
  );

  const palmPolygon = PALM_POLYGON_INDICES.map((idx) => points[idx]);

  const margin = fingerHalfWidth;
  const bounds = {
    minX: Math.min(...points.map((p) => p.x)) - margin,
    maxX: Math.max(...points.map((p) => p.x)) + margin,
    minY: Math.min(...points.map((p) => p.y)) - margin,
    maxY: Math.max(...points.map((p) => p.y)) + margin,
  };

  return { fingerSegments, fingerHalfWidth, palmPolygon, bounds };
};

/** 점이 손 실루엣(손바닥 다각형 또는 손가락 캡슐) 위에 있는지 판정한다. */
export const isPointOnHand = (point: Point2D, silhouette: HandSilhouette): boolean => {
  if (isPointInPolygon(point, silhouette.palmPolygon)) {
    return true;
  }
  return silhouette.fingerSegments.some(
    (segment) => distanceToSegment(point, segment.a, segment.b) <= silhouette.fingerHalfWidth
  );
};
