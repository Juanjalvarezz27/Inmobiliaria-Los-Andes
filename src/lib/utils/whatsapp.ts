// Utilidades para la generacion de enlaces directos a WhatsApp
import { COMPANY_CONFIG } from "@/config/company";

// Numero telefonico y denominacion central de la inmobiliaria
export const COMPANY_CENTRAL_PHONE =
  process.env.NEXT_PUBLIC_CENTRAL_PHONE || COMPANY_CONFIG.contact.phoneRaw;
export const COMPANY_NAME = COMPANY_CONFIG.tradeName;

// Sanitiza el numero telefonico dejando solo digitos
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

// Construye la URL de WhatsApp con mensaje personalizado prellenado y redireccion central si el asesor esta pausado
export function buildWhatsAppPropertyLink({
  phone,
  propertyTitle,
  propertyUrl,
  agentName,
  isAgentActive = true,
  customMessage,
}: {
  phone?: string | null;
  propertyTitle: string;
  propertyUrl?: string;
  agentName?: string;
  isAgentActive?: boolean;
  customMessage?: string;
}): string {
  // Redireccion automatica al WhatsApp Central si el asesor esta pausado o no tiene telefono registrado
  const useCentral = !isAgentActive || !phone;
  const targetPhone = useCentral ? COMPANY_CENTRAL_PHONE : phone;
  const targetName = useCentral ? COMPANY_NAME : agentName;

  const sanitizedPhone = cleanPhoneNumber(targetPhone);
  const greeting = targetName ? `Hola ${targetName}, ` : "Hola, ";
  const linkText = propertyUrl ? ` Enlace: ${propertyUrl}` : "";
  const defaultMessage = `${greeting}estoy interesado(a) en la propiedad "${propertyTitle}".${linkText} ¿Podría darme más información?`;
  const message = customMessage || defaultMessage;

  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`;
}

