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

// Tarjeta ejecutiva de propiedad para el catalogo publico con diseno editorial y contacto directo
export function PropertyCard({
  property,
  eager = false,
}: {
  property: PropertyCardData;
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
    <article className="group relative flex flex-col bg-white/95 hover:bg-white rounded-[26px] overflow-hidden border border-[#E7DEC8]/80 shadow-[0_4px_20px_-4px_rgba(40,28,16,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_35px_-10px_rgba(40,28,16,0.12)] hover:border-brand-accent/40 hover:-translate-y-1.5 transition-[transform,box-shadow,border-color] duration-200 ease-out will-change-transform">
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
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover group-hover:scale-105 transition-transform duration-300 ease-out will-change-transform ${
            isSoldOrRented ? "grayscale opacity-80" : ""
          }`}
        />
        {/* Velo degradado sutil para legibilidad de insignias */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

        {/* Badges Superiores Flotantes */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md ${
                property.operationType === "SALE"
                  ? "bg-gradient-to-r from-brand-accent to-[#ea6738] border border-white/20"
                  : "bg-gradient-to-r from-brand-primary to-[#255236] border border-white/20"
              }`}
            >
              {property.operationType === "SALE" ? "En Venta" : "En Alquiler"}
            </span>

            <span className="bg-white/95 text-brand-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/60 shadow-xs">
              {propertyTypeLabel}
            </span>
          </div>

          {/* Contador de Fotografias */}
          {property.images.length > 0 && (
            <div className="bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
              <Camera className="w-3 h-3 text-orange-300" />
              <span>{property.images.length}</span>
            </div>
          )}
        </div>

        {/* Badges de Estado Operativo */}
        {property.status === "SOLD" && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-red-400">
              Inmueble Vendido
            </span>
          </div>
        )}
        {property.status === "RENTED" && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="bg-neutral-800 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-neutral-600">
              Inmueble Alquilado
            </span>
          </div>
        )}

        {/* Capsula Flotante de Precio */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <div className="inline-flex items-baseline gap-1.5 px-3.5 py-1 rounded-2xl bg-black/75 border border-white/20 text-white shadow-lg">
            <span className="text-lg sm:text-xl font-black font-heading tracking-tight">
              {formatCurrency(property.price, property.currency)}
            </span>
            {property.operationType === "RENT" && (
              <span className="text-[11px] font-bold text-orange-200">/ mes</span>
            )}
          </div>
        </div>
      </Link>

      {/* Cuerpo Descriptivo y Caracteristicas */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          {/* Ubicacion con icono terracota */}
          <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span className="truncate">
              {property.sector ? `${property.sector}, ` : ""}
              {property.city}
            </span>
          </div>

          {/* Titulo con enlace */}
          <Link href={`/propiedades/${property.slug}`} className="block group/title">
            <h3 className="font-extrabold text-brand-primary text-[17px] line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors font-heading">
              {property.title}
            </h3>
          </Link>
        </div>

        {/* Tira Unificada de Especificaciones Arquitectonicas */}
        <div className="py-2.5 px-3 bg-[#FAF7F2] rounded-2xl border border-[#ECE4D8]/80 grid grid-cols-4 divide-x divide-[#E5DCCB] text-center">
          {/* Habitaciones */}
          <div className="flex flex-col items-center justify-center px-1">
            <div className="flex items-center gap-1 text-brand-primary">
              <Bed className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span className="font-extrabold text-xs">
                {property.bedrooms ?? "-"}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-medium">Hab</span>
          </div>

          {/* Baños */}
          <div className="flex flex-col items-center justify-center px-1">
            <div className="flex items-center gap-1 text-brand-primary">
              <Bath className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span className="font-extrabold text-xs">
                {property.bathrooms ?? "-"}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-medium">Baños</span>
          </div>

          {/* Estacionamientos */}
          <div className="flex flex-col items-center justify-center px-1">
            <div className="flex items-center gap-1 text-brand-primary">
              <Car className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span className="font-extrabold text-xs">
                {property.parkingSpots ?? "-"}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-medium">Estac.</span>
          </div>

          {/* Superficie m2 */}
          <div className="flex flex-col items-center justify-center px-1">
            <div className="flex items-center gap-1 text-brand-primary">
              <Maximize2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span className="font-extrabold text-xs truncate max-w-full">
                {property.areaSquareMeters ? Number(property.areaSquareMeters) : "-"}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-medium">m²</span>
          </div>
        </div>

        {/* Pie: Asesor Asignado y Boton WhatsApp de Alta Conversion */}
        <div className="pt-3 border-t border-[#ECE4D8]/80 flex items-center justify-between gap-3">
          {property.agent ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-brand-primary text-white font-bold text-xs flex items-center justify-center shrink-0 ring-2 ring-[#E5DCCB]">
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
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block leading-none">
                  Asesor
                </span>
                <span className="text-xs font-bold text-brand-primary block truncate mt-0.5">
                  {property.agent.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-brand-primary font-bold">
              <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 text-brand-primary" />
              </div>
              <span className="truncate">Inmobiliaria Los Andes</span>
            </div>
          )}

          {/* Boton Directo WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0 cursor-pointer group/wa"
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
