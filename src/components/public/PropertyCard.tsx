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
  coverImageUrl?: string | null;
  imagesCount?: number;
  images?: { url: string; caption?: string | null; isMain?: boolean }[];
  agent?: {
    name: string;
    phone?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
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

// Tarjeta ejecutiva de propiedad para el catalogo publico con diseno editorial y contacto directo
export function PropertyCard({
  property,
  eager = false,
}: {
  property: PropertyCardData;
  eager?: boolean;
}) {
  const mainImage =
    property.coverImageUrl ||
    property.images?.find((img) => img.isMain)?.url ||
    property.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

  const totalPhotos = property.imagesCount ?? property.images?.length ?? 0;

  const isSoldOrRented = property.status === "SOLD" || property.status === "RENTED";

  const propertyTypeLabel =
    property.propertyType === "OTHER" && property.customPropertyType
      ? property.customPropertyType
      : PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType;

  const isAgentActive = property.agent ? property.agent.isActive !== false : false;

  // Enlace directo de consulta para WhatsApp (con redireccion automatica a Central si el asesor esta inactivo)
  const whatsappUrl = buildWhatsAppPropertyLink({
    phone: property.agent?.phone,
    propertyTitle: property.title,
    agentName: property.agent?.name,
    propertyUrl: `https://inmobiliarialosandes.com/propiedades/${property.slug}`,
    isAgentActive,
  });

  return (
    <article className="group relative flex flex-col bg-white rounded-[26px] overflow-hidden border border-neutral-200/90 shadow-[0_4px_20px_-4px_rgba(20,35,25,0.07),0_2px_6px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.03] hover:shadow-[0_22px_45px_-12px_rgba(18,46,31,0.22),0_8px_20px_-6px_rgba(242,90,43,0.12)] hover:border-brand-accent/40 hover:-translate-y-2 transition-all duration-300 ease-out will-change-transform">
      {/* Contenedor Fotografico con Enlace y Proporcion Editorial */}
      <Link
        href={`/propiedades/${property.slug}`}
        className="relative block aspect-[16/11] overflow-hidden bg-neutral-900"
      >
        <Image
          src={mainImage}
          alt={property.title}
          fill
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className={`object-cover group-hover:scale-108 transition-transform duration-500 ease-out will-change-transform ${
            isSoldOrRented ? "grayscale opacity-80" : ""
          }`}
        />
        {/* Velo degradado sutil para legibilidad de insignias */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

        {/* Badges Superiores Flotantes */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md ${
                property.operationType === "SALE"
                  ? "bg-gradient-to-r from-brand-accent via-[#ea5a2a] to-[#d64516] border border-white/20 shadow-brand-accent/30"
                  : "bg-gradient-to-r from-brand-primary to-[#255236] border border-white/20 shadow-brand-primary/30"
              }`}
            >
              {property.operationType === "SALE" ? "En Venta" : "En Alquiler"}
            </span>

            <span className="bg-white/95 text-brand-primary text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/80 shadow-xs">
              {propertyTypeLabel}
            </span>
          </div>

          {/* Contador de Fotografias */}
          {totalPhotos > 0 && (
            <div className="bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-sm">
              <Camera className="w-3 h-3 text-orange-300" />
              <span>{totalPhotos}</span>
            </div>
          )}
        </div>

        {/* Badges de Estado Operativo */}
        {property.status === "SOLD" && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-red-400">
              Inmueble Vendido
            </span>
          </div>
        )}
        {property.status === "RENTED" && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="bg-neutral-800 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-neutral-600">
              Inmueble Alquilado
            </span>
          </div>
        )}

        {/* Capsula Flotante de Precio con Mayor Relieve y Profundidad */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <div className="inline-flex items-baseline gap-1.5 px-3 py-1 rounded-2xl bg-neutral-950/85 backdrop-blur-md border border-white/20 text-white shadow-[0_8px_20px_-4px_rgba(0,0,0,0.5)]">
            <span className="text-base sm:text-lg font-black font-heading tracking-tight text-white drop-shadow-sm">
              {formatCurrency(property.price, property.currency)}
            </span>
            {property.operationType === "RENT" && (
              <span className="text-[10.5px] font-extrabold text-orange-300">/ mes</span>
            )}
          </div>
        </div>
      </Link>

      {/* Cuerpo Descriptivo y Caracteristicas */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between gap-3.5">
        <div className="space-y-1">
          {/* Ubicacion con icono terracota */}
          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span className="truncate">
              {property.sector ? `${property.sector}, ` : ""}
              {property.city}
            </span>
          </div>

          {/* Titulo con enlace de altura uniforme */}
          <Link href={`/propiedades/${property.slug}`} className="block group/title">
            <h3 className="font-extrabold text-brand-primary text-[15px] sm:text-base line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors font-heading min-h-[2.5rem]">
              {property.title}
            </h3>
          </Link>
        </div>

        {/* Tira Unificada de Especificaciones con Profundidad Inset */}
        <div className="py-2 px-1 bg-gradient-to-b from-[#FBF8F3] to-[#F3EDE2] rounded-2xl border border-[#E8DEC9] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] grid grid-cols-4 divide-x divide-[#E5DCCB] text-center">
          {/* Habitaciones */}
          <div className="flex flex-col items-center justify-center px-0.5">
            <div className="flex items-center gap-1 text-brand-primary">
              <Bed className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span className="font-black text-xs text-neutral-900">
                {property.bedrooms ?? "-"}
              </span>
            </div>
            <span className="text-[9.5px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Hab</span>
          </div>

          {/* Baños */}
          <div className="flex flex-col items-center justify-center px-0.5">
            <div className="flex items-center gap-1 text-brand-primary">
              <Bath className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span className="font-black text-xs text-neutral-900">
                {property.bathrooms ?? "-"}
              </span>
            </div>
            <span className="text-[9.5px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Baños</span>
          </div>

          {/* Estacionamientos */}
          <div className="flex flex-col items-center justify-center px-0.5">
            <div className="flex items-center gap-1 text-brand-primary">
              <Car className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span className="font-black text-xs text-neutral-900">
                {property.parkingSpots ?? "-"}
              </span>
            </div>
            <span className="text-[9.5px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Estac.</span>
          </div>

          {/* Superficie m2 */}
          <div className="flex flex-col items-center justify-center px-0.5">
            <div className="flex items-center gap-1 text-brand-primary">
              <Maximize2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span className="font-black text-xs text-neutral-900 truncate max-w-full">
                {property.areaSquareMeters ? Number(property.areaSquareMeters) : "-"}
              </span>
            </div>
            <span className="text-[9.5px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">m²</span>
          </div>
        </div>

        {/* Pie: Asesor Asignado o Atencion Central y Boton WhatsApp de Alta Conversion */}
        <div className="pt-3 border-t border-[#ECE4D8]/80 flex items-center justify-between gap-2.5">
          {property.agent && isAgentActive ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-brand-primary text-white font-black text-xs flex items-center justify-center shrink-0 ring-2 ring-emerald-600/20 shadow-xs">
                {property.agent.avatarUrl ? (
                  <Image
                    src={property.agent.avatarUrl}
                    alt={property.agent.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <span>{getInitials(property.agent.name)}</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-extrabold block leading-none">
                  Asesor
                </span>
                <span className="text-xs font-black text-brand-primary block truncate max-w-[105px] mt-0.5 group-hover:text-neutral-900 transition-colors">
                  {property.agent.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-brand-primary font-bold min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-brand-accent/30 shadow-2xs bg-white">
                <Image
                  src="/Logo redondo.png"
                  alt="Inmobiliaria Los Andes"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-widest text-brand-accent font-extrabold block leading-none">
                  Central
                </span>
                <span className="text-xs font-black text-brand-primary block truncate max-w-[110px] mt-0.5">
                  Los Andes
                </span>
              </div>
            </div>
          )}

          {/* Boton Directo WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-xs hover:shadow-md hover:shadow-emerald-600/25 transition-all active:scale-95 shrink-0 cursor-pointer group/wa"
            title="Consultar disponibilidad por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600 group-hover/wa:scale-110 transition-transform" />
            <span>Consultar</span>
          </a>
        </div>
      </div>
    </article>
  );
}
