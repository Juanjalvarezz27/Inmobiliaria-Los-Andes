import Link from "next/link";
import Image from "next/image";
import {
  Bed,
  Bath,
  Car,
  Maximize2,
  MapPin,
  Camera,
  MessageCircle,
  Building2,
} from "lucide-react";
import { formatCurrency, formatArea } from "@/lib/utils/format";
import { buildWhatsAppPropertyLink } from "@/lib/utils/whatsapp";

export interface PropertyCardData {
  id: string;
  title: string;
  slug: string;
  operationType: "SALE" | "RENT";
  propertyType: string;
  customPropertyType?: string | null;
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED" | "HIDDEN" | "ARCHIVED";
  price: number | string | { toString: () => string };
  currency: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpots?: number | null;
  areaSquareMeters?: number | string | { toString: () => string } | null;
  city: string;
  sector?: string | null;
  googleMapsUrl?: string | null;
  images: { url: string; caption?: string | null; isMain: boolean }[];
  agent?: {
    name: string;
    phone?: string | null;
    avatarUrl?: string | null;
  } | null;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  TOWNHOUSE: "Townhouse",
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  COMMERCIAL: "Local Comercial",
  LAND: "Terreno",
  OFFICE: "Oficina",
  OTHER: "Inmueble",
};

// Generador de iniciales en texto para el avatar del asesor
function getInitials(name: string): string {
  if (!name) return "AS";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Tarjeta ejecutiva de propiedad para el catalogo publico con contacto directo por WhatsApp
export function PropertyCard({
  property,
  eager = false,
}: {
  property: PropertyCardData;
  // Carga inmediata para la primera tarjeta visible cerca del pliegue
  eager?: boolean;
}) {
  const mainImage =
    property.images.find((img) => img.isMain)?.url ||
    property.images[0]?.url ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

  const isSoldOrRented = property.status === "SOLD" || property.status === "RENTED";

  const propertyTypeLabel =
    property.propertyType === "OTHER" && property.customPropertyType
      ? property.customPropertyType
      : PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType;

  // Enlace directo de consulta para WhatsApp
  const whatsappUrl = buildWhatsAppPropertyLink({
    phone: property.agent?.phone || "584140000000",
    propertyTitle: property.title,
    agentName: property.agent?.name,
    propertyUrl: `https://inmobiliarialosandes.com/propiedades/${property.slug}`,
  });

  return (
    <article className="group bg-white rounded-3xl overflow-hidden border border-neutral-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Contenedor Fotográfico con Enlace */}
      <Link
        href={`/propiedades/${property.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-neutral-900"
      >
        <Image
          src={mainImage}
          alt={property.title}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${
            isSoldOrRented ? "grayscale opacity-80" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges Superiores Flotantes */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md backdrop-blur-md ${
                property.operationType === "SALE"
                  ? "bg-brand-accent/90 border border-brand-accent/30"
                  : "bg-emerald-600/90 border border-emerald-400/30"
              }`}
            >
              {property.operationType === "SALE" ? "En Venta" : "En Alquiler"}
            </span>

            <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
              {propertyTypeLabel}
            </span>
          </div>

          {/* Contador de Fotografias */}
          {property.images.length > 0 && (
            <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
              <Camera className="w-3 h-3 text-brand-accent" />
              <span>{property.images.length}</span>
            </div>
          )}
        </div>

        {/* Badges de Estado Operativo */}
        {property.status === "SOLD" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-red-400">
              Inmueble Vendido
            </span>
          </div>
        )}
        {property.status === "RENTED" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-neutral-800 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-neutral-600">
              Inmueble Alquilado
            </span>
          </div>
        )}

        {/* Precio Destacado con Sombra de Alto Contraste */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-baseline justify-between text-white drop-shadow-md">
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-heading tracking-tight">
              {formatCurrency(property.price, property.currency)}
            </span>
            {property.operationType === "RENT" && (
              <span className="text-xs font-medium text-emerald-200">/ mes</span>
            )}
          </div>
        </div>
      </Link>

      {/* Cuerpo Descriptivo y Caracteristicas */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Ubicacion */}
          <div className="flex items-center gap-1.5 text-text-secondary text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span className="truncate">
              {property.sector ? `${property.sector}, ` : ""}
              {property.city}
            </span>
          </div>

          {/* Titulo con enlace */}
          <Link href={`/propiedades/${property.slug}`} className="block">
            <h3 className="font-extrabold text-brand-primary text-base line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors font-heading">
              {property.title}
            </h3>
          </Link>
        </div>

        {/* Barra de Especificaciones Cuantitativas */}
        <div className="pt-3 border-t border-neutral-100 grid grid-cols-4 gap-2 text-text-secondary text-xs font-bold text-center">
          {property.bedrooms !== null && property.bedrooms !== undefined ? (
            <div className="bg-neutral-50 rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5">
              <div className="flex items-center gap-1 text-brand-primary">
                <Bed className="w-3.5 h-3.5 text-brand-accent" />
                <span>{property.bedrooms}</span>
              </div>
              <span className="text-[10px] text-text-secondary font-medium">Hab</span>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5 opacity-40">
              <span className="text-xs">-</span>
              <span className="text-[10px]">Hab</span>
            </div>
          )}

          {property.bathrooms !== null && property.bathrooms !== undefined ? (
            <div className="bg-neutral-50 rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5">
              <div className="flex items-center gap-1 text-brand-primary">
                <Bath className="w-3.5 h-3.5 text-brand-accent" />
                <span>{property.bathrooms}</span>
              </div>
              <span className="text-[10px] text-text-secondary font-medium">Baños</span>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5 opacity-40">
              <span className="text-xs">-</span>
              <span className="text-[10px]">Baños</span>
            </div>
          )}

          {property.parkingSpots !== null && property.parkingSpots !== undefined ? (
            <div className="bg-neutral-50 rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5">
              <div className="flex items-center gap-1 text-brand-primary">
                <Car className="w-3.5 h-3.5 text-brand-accent" />
                <span>{property.parkingSpots}</span>
              </div>
              <span className="text-[10px] text-text-secondary font-medium">Estac.</span>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5 opacity-40">
              <span className="text-xs">-</span>
              <span className="text-[10px]">Estac.</span>
            </div>
          )}

          {property.areaSquareMeters ? (
            <div className="bg-neutral-50 rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5">
              <div className="flex items-center gap-1 text-brand-primary">
                <Maximize2 className="w-3.5 h-3.5 text-brand-accent" />
                <span className="truncate">{Number(property.areaSquareMeters)}</span>
              </div>
              <span className="text-[10px] text-text-secondary font-medium">m²</span>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5 opacity-40">
              <span className="text-xs">-</span>
              <span className="text-[10px]">m²</span>
            </div>
          )}
        </div>

        {/* Pie con Asesor Asignado y Boton de WhatsApp */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          {property.agent ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-[10px] flex items-center justify-center shrink-0 border border-brand-primary/20">
                {getInitials(property.agent.name)}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-text-secondary block font-medium">Asesor</span>
                <span className="text-xs font-bold text-text-primary block truncate">
                  {property.agent.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold">
              <Building2 className="w-4 h-4 text-brand-primary" />
              <span>Inmobiliaria Los Andes</span>
            </div>
          )}

          {/* Boton Directo WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all active:scale-95 shrink-0 cursor-pointer group/wa"
            title="Consultar disponibilidad por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover/wa:scale-110 transition-transform" />
            <span>Consultar</span>
          </a>
        </div>
      </div>
    </article>
  );
}
