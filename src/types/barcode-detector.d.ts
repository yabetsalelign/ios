// Minimal ambient type declaration for the BarcodeDetector Shape Detection API.
// Full spec: https://wicg.github.io/shape-detection-api/#barcode-detection-api
// This API is Baseline Newly Available (Chrome/Edge/Android); not in lib.dom yet.
// Runtime usage is always gated by: 'BarcodeDetector' in window

interface BarcodeDetectorOptions {
  formats?: string[];
}

interface DetectedBarcode {
  rawValue: string;
  format: string;
  boundingBox: DOMRectReadOnly;
  cornerPoints: ReadonlyArray<{ x: number; y: number }>;
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  static getSupportedFormats(): Promise<string[]>;
  detect(image: ImageBitmapSource | HTMLVideoElement): Promise<DetectedBarcode[]>;
}
