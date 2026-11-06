export interface ResizedImage {
  dataUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  sizeKb: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The file could not be read as an image.'));
    image.src = src;
  });
}

function drawScaled(image: HTMLImageElement, maxSize: number, quality: number): { dataUrl: string; width: number; height: number } {
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported in this browser.');
  context.drawImage(image, 0, 0, width, height);
  return { dataUrl: canvas.toDataURL('image/jpeg', quality), width, height };
}

/**
 * Downscales an uploaded image in the browser so it can be stored in localStorage.
 * Produces a full-size version (max 1600 px) and a thumbnail (max 480 px).
 */
export async function resizeImage(file: File, maxSize = 1600): Promise<ResizedImage> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const full = drawScaled(image, maxSize, 0.82);
    const thumb = drawScaled(image, 480, 0.75);
    return {
      dataUrl: full.dataUrl,
      thumbnailUrl: thumb.dataUrl,
      width: full.width,
      height: full.height,
      sizeKb: Math.round((full.dataUrl.length * 3) / 4 / 1024),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Turns a file name such as `city_skyline-2024.jpg` into a readable title. */
export function titleFromFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Untitled photo';
}
