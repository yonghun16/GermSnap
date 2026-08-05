import type { PalmDetection } from './palmDetector';
import { WRIST_KEYPOINT_INDEX, MIDDLE_FINGER_MCP_KEYPOINT_INDEX } from './palmDetector';
import type { RotatedRoi } from './tensorRender';

// MediaPipe modules/hand_landmark/palm_detection_detection_to_roi.pbtxt 기준
const TARGET_ANGLE = Math.PI / 2; // rotation_vector_target_angle_degrees: 90
const RECT_SCALE = 2.6; // scale_x, scale_y
const RECT_SHIFT_Y = -0.5; // shift_y (shift_x는 0)

const normalizeRadians = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

/**
 * palm 탐지 결과(bbox + 회전 정렬용 키포인트)로부터 손 전체를 덮는 회전된
 * 정사각 crop 영역(ROI)을 계산한다.
 * (docs 없음 — MediaPipe 공식 소스 detections_to_rects_calculator.cc,
 *  rect_transformation_calculator.cc 그대로 이식)
 */
export const computeHandRoi = (
  detection: PalmDetection,
  imageWidth: number,
  imageHeight: number
): RotatedRoi => {
  const wrist = detection.keypoints[WRIST_KEYPOINT_INDEX];
  const middleMcp = detection.keypoints[MIDDLE_FINGER_MCP_KEYPOINT_INDEX];

  const x0 = wrist.x * imageWidth;
  const y0 = wrist.y * imageHeight;
  const x1 = middleMcp.x * imageWidth;
  const y1 = middleMcp.y * imageHeight;

  const rotation = normalizeRadians(TARGET_ANGLE - Math.atan2(-(y1 - y0), x1 - x0));

  const { xCenter, yCenter, width: rawWidth, height: rawHeight } = detection.bbox;

  // RectTransformationCalculator: shift_x=0 이므로 x_shift 식에서 그 항은 사라진다.
  const xShift = -(imageHeight * rawHeight * RECT_SHIFT_Y * Math.sin(rotation)) / imageWidth;
  const yShift = rawHeight * RECT_SHIFT_Y * Math.cos(rotation);

  const shiftedCenterX = xCenter + xShift;
  const shiftedCenterY = yCenter + yShift;

  // square_long: 픽셀 기준 더 긴 변으로 정사각형화
  const longSidePx = Math.max(rawWidth * imageWidth, rawHeight * imageHeight);
  const squaredWidth = longSidePx / imageWidth;
  const squaredHeight = longSidePx / imageHeight;

  return {
    centerX: shiftedCenterX,
    centerY: shiftedCenterY,
    width: squaredWidth * RECT_SCALE,
    height: squaredHeight * RECT_SCALE,
    rotation,
  };
};
