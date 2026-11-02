import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Car, Maximize2, MapPin } from "lucide-react";
import { formatCurrency, formatArea } from "@/lib/utils/format";

export interface PropertyCardData {
  id: string;
  title: string;
  slug: string;
  operationType: "SALE" | "RENT";
  propertyType: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED" | "HIDDEN" | "ARCHIVED";
  price: number | string | { toString: () => string };
  currency: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpots?: number | null;
  areaSquareMeters?: number | string | { toString: () => string } | null;
  city: string;
  sector?: string | null;
  images: { url: string; caption?: string | null; isMain: boolean }[];
}

// Tarjeta interactiva de propiedad para el catalogo publico
export function PropertyCard({ property }: { property: PropertyCardData }) {
  const mainImage =
    property.images.find((img) => img.isMain)?.url ||
    property.images[0]?.url ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

  const isSoldOrRented = property.status === "SOLD" || property.status === "RENTED";

  return (
    <article className="group bg-ui-surface rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      <Link href={`/propiedades/${property.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-neutral-100">
        <Image
          src={mainImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
            isSoldOrRented ? "grayscale" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="bg-brand-accent text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            {property.operationType === "SALE" ? "En Venta" : "En Alquiler"}
          </span>
          {property.status === "SOLD" && (
            <span className="bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Vendido
            </span>
          )}
          {property.status === "RENTED" && (
            <span className="bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Alquilado
            </span>
          )}
        </div>

        {/* Precio destacado */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
            {formatCurrency(property.price, property.currency)}
            {property.operationType === "RENT" && (
              <span className="text-xs font-normal text-white/90"> / mes</span>
            )}
          </span>
        </div>
      </Link>

      {/* Contenido descriptivo */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-text-secondary text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span className="truncate">
              {property.sector ? `${property.sector}, ` : ""}
              {property.city}
            </span>
          </div>

          <Link href={`/propiedades/${property.slug}`} className="block">
            <h3 className="font-bold text-text-primary text-base line-clamp-2 group-hover:text-brand-accent transition-colors">
              {property.title}
            </h3>
          </Link>
        </div>

        {/* Barra cuantitativa de iconos */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-text-secondary text-xs font-medium">
          {property.bedrooms !== null && property.bedrooms !== undefined && (
            <div className="flex items-center gap-1.5" title={`${property.bedrooms} Habitaciones`}>
              <Bed className="w-4 h-4 text-brand-primary" />
              <span>{property.bedrooms} Hab</span>
            </div>
          )}

          {property.bathrooms !== null && property.bathrooms !== undefined && (
            <div className="flex items-center gap-1.5" title={`${property.bathrooms} Baños`}>
              <Bath className="w-4 h-4 text-brand-primary" />
              <span>{property.bathrooms} Baños</span>
            </div>
          )}

          {property.parkingSpots !== null && property.parkingSpots !== undefined && (
            <div className="flex items-center gap-1.5" title={`${property.parkingSpots} Estacionamientos`}>
              <Car className="w-4 h-4 text-brand-primary" />
              <span>{property.parkingSpots} Est</span>
            </div>
          )}

          {property.areaSquareMeters && (
            <div className="flex items-center gap-1.5" title="Superficie construida">
              <Maximize2 className="w-4 h-4 text-brand-primary" />
              <span>{formatArea(property.areaSquareMeters)}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

