// Utilidad de compresion de imagenes del lado del cliente con HTML5 Canvas y WebP
export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetFormat?: "image/webp" | "image/jpeg";
}

// Perfiles de calibracion optima para maxima reduccion de peso sin perdida de nitidez
export const COMPRESSION_PRESETS = {
  PROPERTY: {
    maxWidth: 1440,
    maxHeight: 1080,
    quality: 0.80,
    targetFormat: "image/webp" as const,
  },
  AVATAR: {
    maxWidth: 640,
    maxHeight: 640,
    quality: 0.80,
    targetFormat: "image/webp" as const,
  },
} as const;

export interface CompressedImageResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  width: number;
  height: number;
}

// Formatea bytes a una cadena legible (ej: 2.4 MB, 142 KB)
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Carga un archivo File en un elemento Image HTML
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer la imagen seleccionada."));
    };

    img.src = objectUrl;
  });
}

// Comprime y escala proporcionalmente una imagen para reducir peso conservando nitidez
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1440,
    maxHeight = 1080,
    quality = 0.80,
    targetFormat = "image/webp",
  } = options;

  // Si no es un archivo de imagen, devolver error
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo seleccionado no es una imagen válida.");
  }

  const img = await loadImage(file);
  let { width, height } = img;

  // Calcular dimensiones proporcionales sin distorsionar
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Dibujar en un canvas con suavizado de alta calidad
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo inicializar el contexto de procesamiento gráfico.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // Convertir a Blob WebP o JPEG
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          // Fallback a JPEG si WebP no fuera soportado en este entorno
          canvas.toBlob(
            (fallbackBlob) => {
              if (fallbackBlob) resolve(fallbackBlob);
              else reject(new Error("Error al codificar la imagen comprimida."));
            },
            "image/jpeg",
            quality
          );
        }
      },
      targetFormat,
      quality
    );
  });

  // Generar nuevo nombre con extension correspondiente
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const originalBaseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
  const compressedFileName = `${originalBaseName}.${ext}`;

  const compressedFile = new File([blob], compressedFileName, {
    type: blob.type,
    lastModified: Date.now(),
  });

  const originalSize = file.size;
  const compressedSize = compressedFile.size;
  const reductionPercentage =
    originalSize > compressedSize
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

  const previewUrl = URL.createObjectURL(compressedFile);

  return {
    file: compressedFile,
    previewUrl,
    originalSize,
    compressedSize,
    reductionPercentage,
    width,
    height,
  };
}

