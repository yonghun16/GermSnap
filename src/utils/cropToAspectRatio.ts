import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * expo-camera의 CameraView 미리보기는 화면을 꽉 채우도록 사진을 잘라서
 * 보여주지만(cover 방식), takePictureAsync()로 찍히는 실제 사진은 카메라
 * 센서의 원본 비율 그대로라 미리보기보다 화각이 더 넓게 나온다(더 멀리서
 * 찍은 것처럼 보임). 촬영 직후 미리보기와 동일한 비율로 중앙을 크롭해서
 * "본 대로 찍힌다"를 보장한다.
 *
 * expo-image-manipulator의 네이티브 크롭을 사용한다 — Skia로 원본 해상도
 * 전체를 디코드/재인코드(base64)하면 몇 초~그 이상 걸려 사실상 멈춘 것처럼
 * 보였다(실기기에서 확인됨).
 *
 * @param uri 원본 사진 URI
 * @param photoWidth 원본 사진 픽셀 너비 (takePictureAsync 결과의 width)
 * @param photoHeight 원본 사진 픽셀 높이
 * @param targetAspectRatio 미리보기 컨테이너의 width / height
 * @returns 크롭된 이미지의 file:// URI
 */
export const cropPhotoToAspectRatio = async (
  uri: string,
  photoWidth: number,
  photoHeight: number,
  targetAspectRatio: number
): Promise<string> => {
  const photoAspectRatio = photoWidth / photoHeight;

  let cropWidth = photoWidth;
  let cropHeight = photoHeight;

  if (photoAspectRatio > targetAspectRatio) {
    // 사진이 미리보기보다 옆으로 넓다 -> 좌우를 잘라낸다.
    cropWidth = photoHeight * targetAspectRatio;
  } else {
    // 사진이 미리보기보다 위아래로 길다 -> 위아래를 잘라낸다.
    cropHeight = photoWidth / targetAspectRatio;
  }

  const originX = (photoWidth - cropWidth) / 2;
  const originY = (photoHeight - cropHeight) / 2;

  const result = await manipulateAsync(
    uri,
    [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
    { compress: 0.9, format: SaveFormat.JPEG }
  );

  return result.uri;
};
