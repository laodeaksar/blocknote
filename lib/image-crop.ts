export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export interface CropState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Hitung base scale agar gambar cover container (mirip object-fit: cover).
 */
export function getBaseScale(
  imgW: number,
  imgH: number,
  containerSize: number,
): number {
  return Math.max(containerSize / imgW, containerSize / imgH);
}

/**
 * Clamp offset agar gambar selalu menutupi crop area.
 */
export function clampOffset(
  offsetX: number,
  offsetY: number,
  imgW: number,
  imgH: number,
  containerSize: number,
  zoom: number,
): { x: number; y: number } {
  const base = getBaseScale(imgW, imgH, containerSize);
  const scale = base * zoom;
  const rendW = imgW * scale;
  const rendH = imgH * scale;

  const maxX = (rendW - containerSize) / 2;
  const maxY = (rendH - containerSize) / 2;

  return {
    x: Math.min(maxX, Math.max(-maxX, offsetX)),
    y: Math.min(maxY, Math.max(-maxY, offsetY)),
  };
}

/**
 * Crop gambar ke blob square berdasarkan CropState.
 * outputSize = ukuran output dalam piksel (default 512).
 */
export async function cropImageToBlob(
  img: HTMLImageElement,
  state: CropState,
  containerSize: number,
  outputSize = 512,
): Promise<Blob> {
  const base = getBaseScale(img.naturalWidth, img.naturalHeight, containerSize);
  const scale = base * state.zoom;

  const left = containerSize / 2 - (img.naturalWidth * scale) / 2 + state.offsetX;
  const top = containerSize / 2 - (img.naturalHeight * scale) / 2 + state.offsetY;

  const srcX = (0 - left) / scale;
  const srcY = (0 - top) / scale;
  const srcW = containerSize / scale;
  const srcH = containerSize / scale;

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outputSize, outputSize);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/jpeg",
      0.88,
    );
  });
}
