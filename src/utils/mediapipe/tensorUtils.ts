export const totalElements = (shape: number[]) =>
  shape.reduce((acc, n) => acc * Math.max(n, 1), 1);

export const toNumericArray = (buffer: ArrayBuffer, dataType: string) => {
  switch (dataType) {
    case 'uint8':
      return new Uint8Array(buffer);
    case 'int8':
      return new Int8Array(buffer);
    default:
      return new Float32Array(buffer);
  }
};

export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
