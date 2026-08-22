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

/**
 * resizeMode="cover"로 표시되는 이미지가 컨테이너 안에서 실제로 차지하는
 * 사각형을 계산한다 (컨테이너보다 커서 가장자리가 잘려나가는 쪽, 레터박스
 * 없이 꽉 채움). 삼성 DeX처럼 세로 콘텐츠가 가로로 아주 넓은 창 안에 놓여
 * computeContainRect로는 레터박스가 심하게 남는 상황에서, 화각을 좀
 * 잃더라도 화면을 꽉 채우고 싶을 때 사용한다.
 */
export const computeCoverRect = (
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
    height = containerHeight;
    width = height * imageRatio;
  } else {
    width = containerWidth;
    height = width / imageRatio;
  }

  return {
    x: (containerWidth - width) / 2,
    y: (containerHeight - height) / 2,
    width,
    height,
  };
};
