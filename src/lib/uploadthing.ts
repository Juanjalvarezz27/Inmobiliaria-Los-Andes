import { UTApi } from "uploadthing/server";

// Instancia de UploadThing para Cuenta 1 (Primaria)
const utapi1 = new UTApi({
  token: process.env.UPLOADTHING_TOKEN_1 || process.env.UPLOADTHING_TOKEN,
});

// Instancia de UploadThing para Cuenta 2 (Secundaria / Balanceo)
const utapi2 = process.env.UPLOADTHING_TOKEN_2
  ? new UTApi({ token: process.env.UPLOADTHING_TOKEN_2 })
  : null;

// Contador en memoria para balancear alternativamente las fotos de inmuebles
let propertyUploadCounter = 0;

// Sube una imagen a UploadThing con balanceo inteligente entre cuentas y failover automatico
export async function uploadToUploadThing(
  file: File,
  purpose: "property" | "agent" = "property"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    let primaryApi = utapi1;
    let fallbackApi = utapi2;

    if (purpose === "agent" && utapi2) {
      // Avatares de asesores dirigidos a la cuenta 2 para diversificar cuota
      primaryApi = utapi2;
      fallbackApi = utapi1;
    } else if (purpose === "property" && utapi2) {
      // Reparto balanceado 50/50 entre ambas cuentas para maximizar cuota gratuita
      propertyUploadCounter++;
      if (propertyUploadCounter % 2 === 0) {
        primaryApi = utapi2;
        fallbackApi = utapi1;
      }
    }

    // Intento con la instancia primaria
    const response = await primaryApi.uploadFiles(file);

    if (response?.data?.ufsUrl || response?.data?.url) {
      const url = response.data.ufsUrl || response.data.url;
      return { success: true, url };
    }

    // Failover automatico a la cuenta alterna si existe y la primera reporta fallo
    if (fallbackApi) {
      const fallbackResponse = await fallbackApi.uploadFiles(file);
      if (fallbackResponse?.data?.ufsUrl || fallbackResponse?.data?.url) {
        const url = fallbackResponse.data.ufsUrl || fallbackResponse.data.url;
        return { success: true, url };
      }
    }

    const errorMsg = response?.error?.message || "No se pudo procesar la subida en UploadThing.";
    return { success: false, error: errorMsg };
  } catch (err: unknown) {
    // Si la primaria arroja excepcion de red o cuota, intentar failover
    if (utapi2) {
      try {
        const altApi = purpose === "agent" ? utapi1 : utapi2;
        const altResponse = await altApi.uploadFiles(file);
        if (altResponse?.data?.ufsUrl || altResponse?.data?.url) {
          const url = altResponse.data.ufsUrl || altResponse.data.url;
          return { success: true, url };
        }
      } catch {
        // Ignorar error secundario y reportar el original
      }
    }

    const message = err instanceof Error ? err.message : "Error inesperado al conectar con UploadThing.";
    return { success: false, error: message };
  }
}

