"use server";

import { getCurrentUser } from "@/lib/auth";
import { uploadToUploadThing } from "@/lib/uploadthing";

// Accion para subir fotografia de asesor al CDN de UploadThing
export async function uploadAvatarAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No se seleccionó ningún archivo." };

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "El archivo debe ser una imagen válida (PNG, JPG, WEBP)." };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "El avatar no debe superar los 2MB tras compresión." };
  }

  // Envio directo a UploadThing (cuenta de asesores)
  return await uploadToUploadThing(file, "agent");
}

// Accion para subir fotografia de inmueble al CDN de UploadThing con failover
export async function uploadPropertyImageAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No se seleccionó ningún archivo." };

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "El archivo debe ser una imagen válida (PNG, JPG, WEBP)." };
  }

  if (file.size > 4 * 1024 * 1024) {
    return { success: false, error: "La fotografía no debe superar los 4MB tras compresión." };
  }

  // Envio balanceado entre cuentas de UploadThing con failover automatico
  return await uploadToUploadThing(file, "property");
}

