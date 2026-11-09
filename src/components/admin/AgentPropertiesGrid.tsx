"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Edit3,
  PlusCircle,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Maximize2,
  Home,
} from "lucide-react";
import { formatCurrency, formatArea } from "@/lib/utils/format";
import { PropertyModal, AgentOption } from "./PropertyModal";
import { Pagination } from "@/components/admin/Pagination";
import type { InitialPropertyData } from "./PropertyForm";
import type { OperationType, PropertyType, PropertyStatus } from "@/generated/prisma/client";

export interface SerializedProperty {
  id: string;
  title: string;
  slug: string;
  description: string;
  operationType: OperationType;
  propertyType: PropertyType;
  customPropertyType?: string | null;
  status: PropertyStatus;
  price: number;
  currency: string;
  featured: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpots: number | null;
  areaSquareMeters: number | null;
  lotSquareMeters: number | null;
  yearBuilt: number | null;
  city: string;
  sector: string | null;
  address: string;
  googleMapsUrl: string | null;
  amenities: string[];
  agentId: string;
  images: {
    id?: string;
    url: string;
    caption?: string | null;
    isMain: boolean;
    order?: number;
  }[];
}

interface AgentPropertiesGridProps {
  properties: SerializedProperty[];
  agentId: string;
  agents: AgentOption[];
}

// Cuadrícula interactiva de propiedades del asesor con modal de edición integrado
export function AgentPropertiesGrid({
  properties,
  agentId,
  agents,
}: AgentPropertiesGridProps) {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState<InitialPropertyData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Paginacion de inmuebles del asesor (6 propiedades por pagina)
  const [currentPage, setCurrentPage] = useState(1);
  const PROPERTIES_PER_PAGE = 6;

  const totalPages = Math.max(1, Math.ceil(properties.length / PROPERTIES_PER_PAGE));

  // Inmuebles visibles en la pagina actual
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * PROPERTIES_PER_PAGE;
    return properties.slice(start, start + PROPERTIES_PER_PAGE);
  }, [properties, currentPage]);

  const handleEdit = (property: SerializedProperty) => {
    setSelectedProperty({
      id: property.id,
      title: property.title,
      operationType: property.operationType,
      propertyType: property.propertyType,
      customPropertyType: property.customPropertyType,
      status: property.status,
      price: property.price,
      currency: property.currency,
      featured: property.featured,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parkingSpots: property.parkingSpots,
      areaSquareMeters: property.areaSquareMeters,
      city: property.city,
      sector: property.sector,
      address: property.address,
      googleMapsUrl: property.googleMapsUrl,
      description: property.description,
      amenities: property.amenities,
      agentId: property.agentId,
      images: property.images.map((img) => ({
        url: img.url,
        caption: img.caption,
        isMain: img.isMain,
      })),
    });
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedProperty(null);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    router.refresh();
  };

  return (
    <>
      {/* Seccion de Cartera con separador sutil */}
      <div className="space-y-6 pt-6 border-t border-neutral-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 sm:h-7 rounded-full bg-gradient-to-b from-[#e85d30] via-brand-accent to-[#c4441b] shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-brand-primary font-heading tracking-tight">
              Cartera de Inmuebles a Cargo
            </h2>
          </div>

          <button
            type="button"
            onClick={handleNew}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e85d30] via-brand-accent to-[#c4441b] hover:shadow-lg hover:shadow-brand-accent/30 hover:-translate-y-0.5 text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-brand-accent/20 transition-all self-start sm:self-auto active:scale-95"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Asignar Nuevo Inmueble</span>
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-neutral-200/90 shadow-sm p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 shadow-inner">
              <Home className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-brand-primary font-heading">
                Sin propiedades asignadas actualmente
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Este asesor no tiene inmuebles vinculados a su cartera comercial. Puedes publicar una nueva propiedad o asignarle una existente.
              </p>
            </div>
            <button
              type="button"
              onClick={handleNew}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-accent to-[#c94b21] hover:shadow-lg hover:shadow-brand-accent/25 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Asignar Primera Propiedad</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProperties.map((property) => {
              const coverImage =
                property.images[0]?.url ||
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

              return (
                <div
                  key={property.id}
                  className="bg-white rounded-[26px] border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_14px_32px_-8px_rgba(26,59,38,0.14)] hover:-translate-y-1 hover:border-brand-primary/30 transition-[transform,box-shadow,border-color] duration-200 ease-out overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Imagen de Portada y Badges flotantes */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                      <Image
                        src={coverImage}
                        alt={property.title}
                        fill
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-xl text-white shadow-md ${
                            property.operationType === "SALE"
                              ? "bg-brand-primary/95 border border-emerald-500/30"
                              : "bg-brand-accent/95 border border-orange-400/30"
                          }`}
                        >
                          {property.operationType === "SALE" ? "Venta" : "Alquiler"}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-xl text-white shadow-md ${
                            property.status === "AVAILABLE"
                              ? "bg-emerald-600/95 border border-emerald-400/30"
                              : property.status === "RESERVED"
                              ? "bg-amber-600/95 border border-amber-400/30"
                              : property.status === "SOLD"
                              ? "bg-red-600/95 border border-red-400/30"
                              : property.status === "RENTED"
                              ? "bg-blue-600/95 border border-blue-400/30"
                              : "bg-neutral-700/95 border border-neutral-500/30"
                          }`}
                        >
                          {property.status === "AVAILABLE"
                            ? "Disponible"
                            : property.status === "RESERVED"
                            ? "Reservado"
                            : property.status === "SOLD"
                            ? "Vendido"
                            : property.status === "RENTED"
                            ? "Alquilado"
                            : property.status}
                        </span>
                      </div>
                    </div>

                    {/* Informacion de la propiedad */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div>
                        <span className="text-xl sm:text-2xl font-black text-brand-primary font-heading tracking-tight block group-hover:text-brand-accent transition-colors">
                          {formatCurrency(property.price, property.currency)}
                          {property.operationType === "RENT" && (
                            <span className="text-xs sm:text-sm font-semibold text-text-secondary tracking-normal">
                              {" "}/ mes
                            </span>
                          )}
                        </span>
                        <h3 className="font-bold text-text-primary text-sm sm:text-base mt-1.5 leading-snug line-clamp-2 min-h-[2.5rem]">
                          {property.title}
                        </h3>

                        {/* Direccion escrita descriptiva */}
                        <div className="flex items-start gap-1.5 text-xs text-text-secondary mt-1.5 min-h-[1.25rem]">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                          <span className="truncate">
                            {property.sector ? `${property.sector}, ` : ""}
                            {property.city}
                          </span>
                        </div>

                        {/* Boton de Google Maps alineado a la izquierda con preservacion de espacio */}
                        <div className="pt-2.5 flex items-center justify-start min-h-[40px]">
                          {property.googleMapsUrl ? (
                            <a
                              href={property.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-neutral-50/80 hover:bg-white text-text-primary hover:text-brand-accent border border-neutral-200/80 hover:border-brand-accent/40 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-150 group/map"
                              title="Abrir ubicación en Google Maps"
                            >
                              <span className="w-5 h-5 rounded-lg bg-white border border-neutral-200/70 flex items-center justify-center text-brand-accent shadow-2xs group-hover/map:border-brand-accent/30 group-hover/map:scale-105 transition-all shrink-0">
                                <MapPin className="w-3 h-3 text-brand-accent" />
                              </span>
                              <span>Ver en Google Maps</span>
                              <ExternalLink className="w-3 h-3 text-neutral-400 group-hover/map:text-brand-accent group-hover/map:translate-x-0.5 group-hover/map:-translate-y-0.5 transition-transform shrink-0 ml-0.5" />
                            </a>
                          ) : (
                            <div className="h-[30px] invisible" aria-hidden="true" />
                          )}
                        </div>
                      </div>

                      {/* Iconos de distribucion */}
                      <div className="grid grid-cols-4 gap-1 py-3 px-2 bg-gradient-to-b from-orange-50/50 to-orange-50/20 rounded-2xl text-center border border-orange-200/70 shadow-xs">
                        {/* Habitaciones */}
                        <div
                          className="flex flex-col items-center justify-center min-w-0"
                          title={`${property.bedrooms ?? "-"} Habitaciones`}
                        >
                          <div className="flex items-center gap-1 text-text-primary">
                            <BedDouble className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                            <span className="text-xs font-black">{property.bedrooms ?? "-"}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-text-secondary truncate w-full mt-0.5">
                            Habitaciones
                          </span>
                        </div>

                        {/* Baños */}
                        <div
                          className="flex flex-col items-center justify-center min-w-0 border-l border-orange-200/60"
                          title={`${property.bathrooms ?? "-"} Baños`}
                        >
                          <div className="flex items-center gap-1 text-text-primary">
                            <Bath className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                            <span className="text-xs font-black">{property.bathrooms ?? "-"}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-text-secondary truncate w-full mt-0.5">
                            Baños
                          </span>
                        </div>

                        {/* Estacionamiento / Puestos */}
                        <div
                          className="flex flex-col items-center justify-center min-w-0 border-l border-orange-200/60"
                          title={`${property.parkingSpots ?? "-"} Puestos de estacionamiento`}
                        >
                          <div className="flex items-center gap-1 text-text-primary">
                            <Car className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                            <span className="text-xs font-black">{property.parkingSpots ?? "-"}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-text-secondary truncate w-full mt-0.5">
                            Puestos
                          </span>
                        </div>

                        {/* Superficie */}
                        <div
                          className="flex flex-col items-center justify-center min-w-0 border-l border-orange-200/60"
                          title={`Superficie: ${property.areaSquareMeters ? formatArea(property.areaSquareMeters) : "-"}`}
                        >
                          <div className="flex items-center gap-1 text-text-primary">
                            <Maximize2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                            <span className="text-xs font-black truncate">
                              {property.areaSquareMeters ? formatArea(property.areaSquareMeters) : "-"}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-text-secondary truncate w-full mt-0.5">
                            Superficie
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de la propiedad: Ficha pública y Editar Inmueble (Abre modal) */}
                  <div className="p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-xs font-bold">
                    <Link
                      href={`/propiedades/${property.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-text-secondary hover:text-brand-primary transition-colors"
                      title="Ver ficha pública del inmueble"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ficha pública</span>
                    </Link>

                    {/* Boton para abrir modal de edicion */}
                    <button
                      type="button"
                      onClick={() => handleEdit(property)}
                      className="inline-flex items-center gap-1.5 text-brand-primary hover:text-brand-accent transition-colors"
                      title="Editar información de la propiedad en un modal"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Inmueble</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginacion ejecutiva de propiedades del asesor */}
        {properties.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={properties.length}
            itemsPerPage={PROPERTIES_PER_PAGE}
            itemLabel="inmuebles asignados"
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </div>

      {/* Modal reactivo de creacion / edicion de propiedades */}
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
        agents={agents}
        defaultAgentId={agentId}
        onSuccess={handleSuccess}
      />
    </>
  );
}
