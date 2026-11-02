// Utilidades para la generacion de enlaces directos a WhatsApp

// Sanitiza el numero telefonico dejando solo digitos
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

// Construye la URL de WhatsApp con mensaje personalizado prellenado
export function buildWhatsAppPropertyLink({
  phone,
  propertyTitle,
  propertyUrl,
  agentName,
}: {
  phone: string;
  propertyTitle: string;
  propertyUrl?: string;
  agentName?: string;
}): string {
  const sanitizedPhone = cleanPhoneNumber(phone);
  const greeting = agentName ? `Hola ${agentName}, ` : "Hola, ";
  const linkText = propertyUrl ? ` Enlace: ${propertyUrl}` : "";
  const message = `${greeting}estoy interesado(a) en la propiedad "${propertyTitle}".${linkText} ¿Podría darme más información?`;

  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`;
}

