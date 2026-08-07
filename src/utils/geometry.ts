export interface Point2D {
  x: number;
  y: number;
}

/** 레이 캐스팅(ray casting) 알고리즘으로 점이 다각형 내부에 있는지 판정한다. */
export const isPointInPolygon = (point: Point2D, polygon: Point2D[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
};

/** 점과 선분(a-b) 사이의 최단 거리. 손가락처럼 두께가 있는 "캡슐" 모양의
 * 내부 판정(거리 <= 반지름)에 쓴다. */
export const distanceToSegment = (point: Point2D, a: Point2D, b: Point2D): number => {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lengthSq = abx * abx + aby * aby;
  const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - a.x) * abx + (point.y - a.y) * aby) / lengthSq));
  const closestX = a.x + t * abx;
  const closestY = a.y + t * aby;
  return Math.hypot(point.x - closestX, point.y - closestY);
};
