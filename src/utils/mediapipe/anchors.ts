export interface Anchor {
  xCenter: number;
  yCenter: number;
}

/**
 * palm_detection_lite.tflite의 SSD anchor 구조.
 *
 * MediaPipe 공식 그래프 설정(mediapipe/modules/palm_detection/palm_detection_cpu.pbtxt)에
 * 나온 SsdAnchorsCalculatorOptions 그대로 계산하면 앵커가 1008개가 나오는데,
 * 실제 다운로드한 palm_detection_lite.tflite의 출력 텐서는 [1, 2016, 18]이라
 * 개수가 맞지 않았다. 모델의 conv 레이어를 직접 열어(Netron 없이 flatbuffer
 * 파싱) 확인한 결과, stride-8 detection head(24x24 grid)의 classifier
 * 출력 채널이 2, stride-16 head(12x12 grid)는 6이었다 — 즉 그리드 셀당
 * 앵커가 각각 2개/6개라는 뜻이고, 이러면 24*24*2 + 12*12*6 = 2016으로
 * 정확히 맞는다. 이 값은 모델 가중치 자체에서 검증한 것이라 그래프 설정
 * 문서보다 신뢰도가 높다. fixed_anchor_size=true라 앵커의 w/h는 모두
 * 1.0(정규화)로 고정이고, 위치만 그리드 셀 중심(+0.5 오프셋)이다.
 */
const LAYERS = [
  { gridSize: 24, anchorsPerCell: 2 },
  { gridSize: 12, anchorsPerCell: 6 },
];

const ANCHOR_OFFSET = 0.5;

export const PALM_DETECTOR_NUM_ANCHORS = 2016;

export const generatePalmDetectorAnchors = (): Anchor[] => {
  const anchors: Anchor[] = [];
  for (const { gridSize, anchorsPerCell } of LAYERS) {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        for (let a = 0; a < anchorsPerCell; a++) {
          anchors.push({
            xCenter: (x + ANCHOR_OFFSET) / gridSize,
            yCenter: (y + ANCHOR_OFFSET) / gridSize,
          });
        }
      }
    }
  }
  return anchors;
};
