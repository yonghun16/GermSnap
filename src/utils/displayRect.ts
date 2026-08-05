export interface DisplayRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * resizeMode="contain"으로 표시되는 이미지가 컨테이너 안에서 실제로 차지하는
 * 사각형(letterbox 포함)을 계산한다. 사진과 화면의 종횡비가 다를 때
 * MediaPipe 정규화 좌표를 화면 픽셀로 정확히 변환하려면 이 사각형 기준으로
 * 계산해야 한다 (CLAUDE.md의 x * canvasWidth 규칙은 사진=화면 종횡비가
 * 같다는 전제이므로, 다를 경우 letterbox 오프셋을 더해 보정한다).
 */
export const computeContainRect = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
): DisplayRect => {
  const imageRatio = imageWidth / imageHeight;
  const containerRatio = containerWidth / containerHeight;

  let width: number;
  let height: number;

  if (imageRatio > containerRatio) {
    width = containerWidth;
    height = width / imageRatio;
  } else {
    height = containerHeight;
    width = height * imageRatio;
  }

  return {
    x: (containerWidth - width) / 2,
    y: (containerHeight - height) / 2,
    width,
    height,
  };
};
