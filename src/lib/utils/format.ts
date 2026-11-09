// Utilidades de formateo para precios, areas y textos

// Formatea un valor numerico a formato de moneda (ej. $72,000 USD)
export function formatCurrency(
  amount: number | string | { toString: () => string },
  currency: string = "USD"
): string {
  const numericValue = typeof amount === "number" ? amount : Number(amount.toString());
  if (isNaN(numericValue)) return "$0";

  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: currency === "USD" ? "USD" : currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

// Formatea la superficie en metros cuadrados (ej. 250 m²)
export function formatArea(areaM2?: number | string | { toString: () => string } | null): string {
  if (!areaM2) return "";
  const numericValue = typeof areaM2 === "number" ? areaM2 : Number(areaM2.toString());
  if (isNaN(numericValue)) return "";
  return `${numericValue.toLocaleString("es-VE")} m²`;
}

// Generador de iniciales en texto para avatar (ej. "Carlos Mendoza" -> "CM")
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "AS";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

