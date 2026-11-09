"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  Edit3,
  ExternalLink,
  Search,
  CheckCircle2,
  Home,
  BedDouble,
  Bath,
  Car,
  Maximize2,
  MapPin,
  Star,
  User,
  RotateCcw,
  Tag,
  Camera,
  X,
  Key,
} from "lucide-react";
import { formatCurrency, formatArea } from "@/lib/utils/format";
import { DeletePropertyButton } from "@/components/admin/DeletePropertyButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PropertyModal, AgentOption } from "@/components/admin/PropertyModal";
import { CustomSelect, CustomSelectOption } from "@/components/admin/CustomSelect";
import { Pagination } from "@/components/admin/Pagination";
import type { InitialPropertyData } from "@/components/admin/PropertyForm";
import type { OperationType, PropertyType, PropertyStatus } from "@/generated/prisma/client";

export interface SerializedAdminProperty {
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
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpots?: number | null;
  areaSquareMeters?: number | null;
  lotSquareMeters?: number | null;
  yearBuilt?: number | null;
  city: string;
  sector?: string | null;
  address: string;
  googleMapsUrl?: string | null;
  amenities: string[];
  agentId: string;
  agent?: {
    id: string;
    name: string;
    position?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
  } | null;
  images: {
    id?: string;
    url: string;
    caption?: string | null;
    isMain: boolean;
    order: number;
  }[];
}

interface PropertiesManagerProps {
  properties: SerializedAdminProperty[];
  agents: AgentOption[];
  initialOpenModal?: boolean;
}

const statusBadgeMap: Record<string, { label: string; class: string; dot: string }> = {
  AVAILABLE: {
    label: "Disponible",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    dot: "bg-emerald-500",
  },
  RESERVED: {
    label: "Reservado",
    class: "bg-amber-50 text-amber-700 border-amber-200/90",
    dot: "bg-amber-500",
  },
  SOLD: {
    label: "Vendido",
    class: "bg-neutral-900 text-white border-neutral-900",
    dot: "bg-neutral-400",
  },
  RENTED: {
    label: "Alquilado",
    class: "bg-blue-50 text-blue-700 border-blue-200/90",
    dot: "bg-blue-500",
  },
  HIDDEN: {
    label: "Oculto",
    class: "bg-neutral-100 text-neutral-500 border-neutral-200",
    dot: "bg-neutral-400",
  },
  ARCHIVED: {
    label: "Archivado",
    class: "bg-neutral-100 text-neutral-500 border-neutral-200",
    dot: "bg-neutral-400",
  },
};

const propertyTypeLabels: Record<string, string> = {
  TOWNHOUSE: "Townhouse",
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  COMMERCIAL: "Local Comercial",
  LAND: "Terreno",
  OFFICE: "Oficina",
  OTHER: "Otro",
};

// Opciones estilizadas de estado para el filtro CustomSelect
const STATUS_FILTER_OPTIONS: CustomSelectOption[] = [
  { value: "ALL", label: "Todos los Estados" },
  { value: "AVAILABLE", label: "Disponible", dotColor: "bg-emerald-500" },
  { value: "RESERVED", label: "Reservado", dotColor: "bg-amber-500" },
  { value: "SOLD", label: "Vendido", dotColor: "bg-neutral-800" },
  { value: "RENTED", label: "Alquilado", dotColor: "bg-blue-500" },
  { value: "HIDDEN", label: "Oculto", dotColor: "bg-neutral-400" },
  { value: "ARCHIVED", label: "Archivado", dotColor: "bg-neutral-400" },
];

// Opciones estilizadas de tipos de propiedad para el filtro CustomSelect
const TYPE_FILTER_OPTIONS: CustomSelectOption[] = [
  { value: "ALL", label: "Todos los Tipos" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "HOUSE", label: "Casa" },
  { value: "APARTMENT", label: "Apartamento" },
  { value: "COMMERCIAL", label: "Local Comercial" },
  { value: "LAND", label: "Terreno" },
  { value: "OFFICE", label: "Oficina" },
  { value: "OTHER", label: "Otro" },
];

// Gestor de catalogo de inmuebles con tarjetas de alto nivel y filtros avanzados
export function PropertiesManager({
  properties,
  agents,
  initialOpenModal = false,
}: PropertiesManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(
    initialOpenModal || searchParams.get("nuevo") === "true" || searchParams.get("crear") === "true"
  );
  const [selectedProperty, setSelectedProperty] = useState<InitialPropertyData | null>(null);

  // Apertura automatica si se accede con parametro ?nuevo=true
  useEffect(() => {
    if (searchParams.get("nuevo") === "true" || searchParams.get("crear") === "true") {
      setSelectedProperty(null);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Estado reactivo sincronizado para mutaciones optimistas
  const [propertiesList, setPropertiesList] = useState<SerializedAdminProperty[]>(properties);

  // Sincroniza estado cuando el servidor actualiza props
  useEffect(() => {
    setPropertiesList(properties);
  }, [properties]);

  // Estados de filtrado y busqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [operationFilter, setOperationFilter] = useState<"ALL" | "SALE" | "RENT">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [agentFilter, setAgentFilter] = useState<string>("ALL");

  // Eliminacion optimista inmediata en interfaz (0ms)
  const handleOptimisticDelete = (id: string) => {
    setPropertiesList((prev) => prev.filter((p) => p.id !== id));
  };

  // Metricas resumidas calculadas en tiempo real
  const totalCount = propertiesList.length;
  const saleCount = propertiesList.filter((p) => p.operationType === "SALE").length;
  const rentCount = propertiesList.filter((p) => p.operationType === "RENT").length;
  const availableCount = propertiesList.filter((p) => p.status === "AVAILABLE").length;

  // Opciones dinamicas de asesores para el selector con fotos reales
  const agentFilterOptions: CustomSelectOption[] = useMemo(
    () => [
      {
        value: "ALL",
        label: "Todos los Asesores",
        description: "Mostrar todos los inmuebles",
      },
      {
        value: "central-los-andes",
        label: "Central Los Andes",
        description: "Inmuebles corporativos o de asesores pausados",
        icon: (
          <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-brand-accent/30 shadow-2xs bg-white">
            <Image src="/Logo redondo.png" alt="" fill sizes="24px" className="object-cover" />
          </div>
        ),
      },
      ...agents
        .filter((a) => a.id !== "central-los-andes")
        .map((agent) => ({
          value: agent.id,
          label: agent.name,
          description: agent.position || "Asesor Inmobiliario",
          icon: agent.avatarUrl ? (
            <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-neutral-200 shadow-2xs">
              <Image src={agent.avatarUrl} alt="" fill sizes="24px" className="object-cover" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-neutral-500" />
            </div>
          ),
        })),
    ],
    [agents]
  );

  // Apertura del modal en modo creacion
  const handleNew = () => {
    setSelectedProperty(null);
    setIsModalOpen(true);
  };

  // Apertura del modal en modo edicion con datos precargados
  const handleEdit = (p: SerializedAdminProperty) => {
    setSelectedProperty({
      id: p.id,
      title: p.title,
      operationType: p.operationType,
      propertyType: p.propertyType,
      customPropertyType: p.customPropertyType,
      status: p.status,
      price: p.price,
      currency: p.currency,
      featured: p.featured,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      parkingSpots: p.parkingSpots,
      areaSquareMeters: p.areaSquareMeters,
      city: p.city,
      sector: p.sector,
      address: p.address,
      googleMapsUrl: p.googleMapsUrl,
      description: p.description,
      amenities: p.amenities,
      agentId: p.agentId,
      images: p.images.map((img) => ({
        url: img.url,
        caption: img.caption,
        isMain: img.isMain,
      })),
    });
    setIsModalOpen(true);
  };

  // Cierre manual del modal y limpieza de parametros en URL
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    if (searchParams.get("nuevo") === "true" || searchParams.get("crear") === "true") {
      router.replace("/admin/propiedades");
    }
  };

  // Cierre y refresco tras guardar exitosamente
  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    if (searchParams.get("nuevo") === "true" || searchParams.get("crear") === "true") {
      router.replace("/admin/propiedades");
    }
    router.refresh();
  };

  // Limpieza total de filtros
  const handleResetFilters = () => {
    setSearchQuery("");
    setOperationFilter("ALL");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setAgentFilter("ALL");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    operationFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    agentFilter !== "ALL";

  // Inmuebles filtrados reactivamente
  const filteredProperties = useMemo(() => {
    return propertiesList.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.sector && p.sector.toLowerCase().includes(q)) ||
        p.address.toLowerCase().includes(q) ||
        (p.agent?.name && p.agent.name.toLowerCase().includes(q));

      const matchesOperation =
        operationFilter === "ALL" || p.operationType === operationFilter;

      const matchesStatus =
        statusFilter === "ALL" || p.status === statusFilter;

      const matchesType =
        typeFilter === "ALL" || p.propertyType === typeFilter;

      const matchesAgent =
        agentFilter === "ALL" ||
        (agentFilter === "central-los-andes"
          ? p.agentId === "central-los-andes" || !p.agent || p.agent.isActive === false
          : p.agentId === agentFilter);

      return matchesSearch && matchesOperation && matchesStatus && matchesType && matchesAgent;
    });
  }, [propertiesList, searchQuery, operationFilter, statusFilter, typeFilter, agentFilter]);

  // Paginacion reactiva de inmuebles (16 tarjetas por pagina)
  const [currentPage, setCurrentPage] = useState(1);
  const PROPERTIES_PER_PAGE = 16;

  // Reset de pagina al alterar cualquier criterio de filtrado
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, operationFilter, statusFilter, typeFilter, agentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE));

  // Segmento de propiedades visibles en la pagina activa
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * PROPERTIES_PER_PAGE;
    return filteredProperties.slice(start, start + PROPERTIES_PER_PAGE);
  }, [filteredProperties, currentPage]);

  return (
    <div className="space-y-7">
      {/* Encabezado Principal */}
      <AdminPageHeader
        icon={Building2}
        title="Gestión de"
        titleHighlight="Inmuebles"
        description="Supervisa, cataloga y gestiona la cartera de propiedades."
      >
        <button
          type="button"
          onClick={handleNew}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e85d30] via-brand-accent to-[#c4441b] hover:shadow-lg hover:shadow-brand-accent/30 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cargar Propiedad</span>
        </button>
      </AdminPageHeader>

      {/* Tarjetas de Metricas Ejecutivas del Catalogo con Relieve y Profundidad Volumetrica */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Catalogo */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(26,59,38,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(26,59,38,0.14),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-brand-primary/30 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          {/* Luz ambiental cenital organica */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-primary/[0.05] to-transparent pointer-events-none group-hover:from-brand-primary/[0.09] transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-brand-primary/[0.05] rounded-full pointer-events-none" />
          <Building2 className="absolute -right-3 -bottom-3 w-24 h-24 text-brand-primary/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/70" />
                Total Catálogo
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-primary font-heading tracking-tight block mt-1.5">
                {totalCount}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#122b1c] via-[#1a3b26] to-[#0d1f14] text-white border border-emerald-500/25 flex items-center justify-center shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <Building2 className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* En Venta */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(5,150,105,0.08),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(5,150,105,0.16),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-emerald-500/40 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          {/* Luz ambiental cenital organica */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-emerald-500/[0.07] to-transparent pointer-events-none group-hover:from-emerald-500/[0.12] transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/[0.07] rounded-full pointer-events-none" />
          <Tag className="absolute -right-3 -bottom-3 w-24 h-24 text-emerald-600/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En Venta
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 font-heading tracking-tight block mt-1.5">
                {saleCount}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#059669] via-emerald-600 to-[#047857] text-white border border-emerald-400/35 flex items-center justify-center shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <Tag className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* En Alquiler */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.08),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.16),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-blue-500/40 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          {/* Luz ambiental cenital organica */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-blue-500/[0.07] to-transparent pointer-events-none group-hover:from-blue-500/[0.12] transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/[0.07] rounded-full pointer-events-none" />
          <Key className="absolute -right-3 -bottom-3 w-24 h-24 text-blue-600/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                En Alquiler
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-600 font-heading tracking-tight block mt-1.5">
                {rentCount}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563eb] via-blue-600 to-[#1d4ed8] text-white border border-blue-400/35 flex items-center justify-center shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <Key className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Disponibles */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(222,88,42,0.09),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(222,88,42,0.18),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-brand-accent/40 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          {/* Luz ambiental cenital organica */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-accent/[0.07] to-transparent pointer-events-none group-hover:from-brand-accent/[0.12] transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-brand-accent/[0.08] rounded-full pointer-events-none" />
          <CheckCircle2 className="absolute -right-3 -bottom-3 w-24 h-24 text-brand-accent/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/70" />
                Disponibles
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-accent font-heading tracking-tight block mt-1.5">
                {availableCount}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e85d30] via-brand-accent to-[#c4441b] text-white border border-orange-300/35 flex items-center justify-center shadow-md shadow-brand-accent/25 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Busqueda y Selector de Vistas - Rediseño Ejecutivo con Color y Jerarquia */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_24px_-4px_rgba(26,59,38,0.06),0_2px_8px_-1px_rgba(0,0,0,0.03)] space-y-4">
        {/* Fila 1: Campo de Busqueda Amplio */}
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-orange-50 text-brand-accent flex items-center justify-center border border-orange-200/60 shadow-2xs">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, ciudad, sector, dirección o asesor asignado..."
            className="w-full pl-12 pr-10 py-2.5 bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-2xl text-xs sm:text-sm font-semibold text-text-primary placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Fila 2: Segmento de Operaciones y Filtros Avanzados con Identidad y Color */}
        <div className="pt-3.5 border-t border-neutral-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Pestanas de Operacion con Colores Tematicos */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 bg-neutral-100 rounded-2xl gap-1 border border-neutral-200/50 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setOperationFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  operationFilter === "ALL"
                    ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/60"
                }`}
              >
                Todos ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setOperationFilter("SALE")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  operationFilter === "SALE"
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/30"
                    : "text-emerald-700 hover:bg-emerald-50/80"
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>Venta ({saleCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setOperationFilter("RENT")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  operationFilter === "RENT"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm shadow-blue-600/30"
                    : "text-blue-700 hover:bg-blue-50/80"
                }`}
              >
                <Key className="w-3 h-3" />
                <span>Alquiler ({rentCount})</span>
              </button>
            </div>
          </div>

          {/* Desplegables con Iconos Tematicos y Destello de Estado Activo */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            {/* Filtro por Estado */}
            <div className="w-full sm:w-44 flex-1 min-w-[130px]">
              <CustomSelect
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={STATUS_FILTER_OPTIONS}
                triggerIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                size="sm"
              />
            </div>

            {/* Filtro por Tipo de Inmueble */}
            <div className="w-full sm:w-44 flex-1 min-w-[130px]">
              <CustomSelect
                value={typeFilter}
                onChange={(val) => setTypeFilter(val)}
                options={TYPE_FILTER_OPTIONS}
                triggerIcon={<Home className="w-3.5 h-3.5 text-brand-accent" />}
                size="sm"
              />
            </div>

            {/* Filtro por Asesor Asignado con Buscador, Paginacion y Desplegable Amplio */}
            <div className="w-full sm:w-64 flex-1 min-w-[170px]">
              <CustomSelect
                value={agentFilter}
                onChange={(val) => setAgentFilter(val)}
                options={agentFilterOptions}
                triggerIcon={<User className="w-3.5 h-3.5 text-brand-primary" />}
                size="sm"
                searchable
                searchPlaceholder="Buscar por nombre o cargo..."
                emptySearchMessage="No se encontraron asesores"
                pageSize={6}
                dropdownAlign="right"
                dropdownClassName="w-72 sm:w-80 max-w-[calc(100vw-2rem)] shadow-2xl"
              />
            </div>

            {/* Boton para resetear filtros activos con Color Destacado */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-brand-accent border border-brand-accent/30 text-xs font-extrabold shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                title="Limpiar filtros activos"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal: Cuadricula de Tarjetas o Tabla Compacta */}
      {filteredProperties.length === 0 ? (
        <div className="bg-ui-surface rounded-3xl border border-neutral-200/90 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-brand-accent flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <Home className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-brand-primary font-heading">
            No se encontraron inmuebles
          </h3>
          <p className="text-xs text-text-secondary mt-1.5 max-w-sm mx-auto">
            {hasActiveFilters
              ? "No hay propiedades que coincidan con los filtros aplicados. Prueba ajustando la búsqueda o limpiando los filtros."
              : "Aún no hay propiedades registradas en el catálogo inmobiliario."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Restablecer Filtros
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNew}
                className="px-5 py-2.5 bg-brand-accent hover:bg-[#c94b21] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Cargar Primer Inmueble
              </button>
            )}
          </div>
        </div>
      ) : (
        /* VISTA DE TARJETAS PROFESIONALES */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedProperties.map((p) => {
            const coverImage =
              p.images.find((img) => img.isMain)?.url ||
              p.images[0]?.url ||
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80";

            const badge = statusBadgeMap[p.status] || {
              label: p.status,
              class: "bg-neutral-100 text-neutral-700 border-neutral-200",
              dot: "bg-neutral-400",
            };

            const typeLabel =
              p.propertyType === "OTHER" && p.customPropertyType
                ? p.customPropertyType
                : propertyTypeLabels[p.propertyType] || p.propertyType;

            return (
              <div
                key={p.id}
                className="bg-ui-surface rounded-3xl border border-neutral-200/90 shadow-xs hover:shadow-xl hover:border-brand-accent/40 transition-[transform,box-shadow,border-color] duration-200 ease-out overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Portada del Inmueble y Badges Flotantes */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 select-none">
                    <Image
                      src={coverImage}
                      alt={p.title}
                      fill
                      unoptimized
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    />

                    {/* Gradiente sutil para legibilidad de badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

                    {/* Badges superiores izquierdos */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      {/* Operacion */}
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-xl text-white shadow-md ${
                          p.operationType === "SALE"
                            ? "bg-brand-primary/95 border border-emerald-500/30"
                            : "bg-brand-accent/95 border border-orange-400/30"
                        }`}
                      >
                        {p.operationType === "SALE" ? "Venta" : "Alquiler"}
                      </span>

                      {/* Estado */}
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-xl text-white shadow-md ${
                          p.status === "AVAILABLE"
                            ? "bg-emerald-600/95 border border-emerald-400/30"
                            : p.status === "RESERVED"
                            ? "bg-amber-600/95 border border-amber-400/30"
                            : p.status === "SOLD"
                            ? "bg-neutral-800/95 border border-neutral-600/30"
                            : p.status === "RENTED"
                            ? "bg-blue-600/95 border border-blue-400/30"
                            : "bg-neutral-700/95 border border-neutral-500/30"
                        }`}
                      >
                        {badge.label}
                      </span>

                      {/* Destacado */}
                      {p.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-amber-500 text-white shadow-md border border-amber-300/40">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Destacado</span>
                        </span>
                      )}
                    </div>

                    {/* Contador de fotos superior derecho */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/75 text-white text-[10px] font-bold shadow-xs">
                        <Camera className="w-3 h-3" />
                        <span>{p.images.length}</span>
                      </span>
                    </div>

                    {/* Tipo de Inmueble en la esquina inferior */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className="px-2.5 py-0.5 rounded-lg bg-white/95 text-brand-primary text-[11px] font-extrabold shadow-xs">
                        {typeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo Informativo */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Precio y Titulo */}
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-brand-primary font-heading tracking-tight block group-hover:text-brand-accent transition-colors">
                        {formatCurrency(p.price, p.currency)}
                        {p.operationType === "RENT" && (
                          <span className="text-xs sm:text-sm font-semibold text-text-secondary tracking-normal">
                            {" "}/ mes
                          </span>
                        )}
                      </span>
                      <h3 className="font-bold text-text-primary text-sm sm:text-base mt-1.5 leading-snug line-clamp-2 min-h-[2.5rem]">
                        {p.title}
                      </h3>

                      {/* Ubicacion descriptiva */}
                      <div className="flex items-start gap-1.5 text-xs text-text-secondary mt-1.5 min-h-[1.25rem]">
                        <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0 mt-0.5" />
                        <span className="truncate">
                          {p.sector ? `${p.sector}, ` : ""}
                          {p.city}
                        </span>
                      </div>

                      {/* Enlace opcional a Google Maps */}
                      <div className="pt-2 flex items-center justify-start min-h-[34px]">
                        {p.googleMapsUrl ? (
                          <a
                            href={p.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl bg-neutral-50 hover:bg-white text-text-primary hover:text-brand-accent border border-neutral-200/80 hover:border-brand-accent/40 text-[11px] font-semibold transition-all group/map"
                            title="Ver en Google Maps"
                          >
                            <span className="w-4 h-4 rounded-md bg-white border border-neutral-200/70 flex items-center justify-center text-brand-accent">
                              <MapPin className="w-2.5 h-2.5 text-brand-accent" />
                            </span>
                            <span>Google Maps</span>
                            <ExternalLink className="w-2.5 h-2.5 text-neutral-400 group-hover/map:text-brand-accent" />
                          </a>
                        ) : (
                          <div className="h-[28px] invisible" aria-hidden="true" />
                        )}
                      </div>
                    </div>

                    {/* Grilla de Distribucion de Ambientes */}
                    <div className="grid grid-cols-4 gap-1 py-3 px-2 bg-gradient-to-b from-orange-50/50 to-orange-50/20 rounded-2xl text-center border border-orange-200/70 shadow-2xs">
                      {/* Habitaciones */}
                      <div className="flex flex-col items-center justify-center min-w-0" title={`${p.bedrooms ?? "-"} Habitaciones`}>
                        <div className="flex items-center gap-1 text-text-primary">
                          <BedDouble className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                          <span className="text-xs font-black">{p.bedrooms ?? "-"}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-text-secondary truncate w-full mt-0.5">
                          Habitaciones
                        </span>
                      </div>

                      {/* Baños */}
                      <div className="flex flex-col items-center justify-center min-w-0 border-l border-orange-200/60" title={`${p.bathrooms ?? "-"} Baños`}>
                        <div className="flex items-center gap-1 text-text-primary">
                          <Bath className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                          <span className="text-xs font-black">{p.bathrooms ?? "-"}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-text-secondary truncate w-full mt-0.5">
                          Baños
                        </span>
                      </div>

                      {/* Estacionamiento */}
                      <div className="flex flex-col items-center justify-center min-w-0 border-l border-orange-200/60" title={`${p.parkingSpots ?? "-"} Puestos`}>
                        <div className="flex items-center gap-1 text-text-primary">
                          <Car className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                          <span className="text-xs font-black">{p.parkingSpots ?? "-"}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-text-secondary truncate w-full mt-0.5">
                          Puestos
                        </span>
                      </div>

                      {/* Superficie */}
                      <div className="flex flex-col items-center justify-center min-w-0 border-l border-orange-200/60" title={`Superficie: ${p.areaSquareMeters ? formatArea(p.areaSquareMeters) : "-"}`}>
                        <div className="flex items-center gap-1 text-text-primary">
                          <Maximize2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                          <span className="text-xs font-black truncate">
                            {p.areaSquareMeters ? formatArea(p.areaSquareMeters) : "-"}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-text-secondary truncate w-full mt-0.5">
                          Superficie
                        </span>
                      </div>
                    </div>

                    {/* Asesor Asignado */}
                    {(() => {
                      const isCentral = p.agentId === "central-los-andes" || !p.agent || p.agent.isActive === false;
                      return (
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
                          <div className={`relative w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs border ${
                            isCentral ? "border-brand-accent/30 bg-white" : "border-neutral-200/80 bg-brand-primary/10 text-brand-primary"
                          }`}>
                            {isCentral ? (
                              <Image
                                src="/Logo redondo.png"
                                alt="Central Los Andes"
                                fill
                                sizes="28px"
                                className="object-cover"
                              />
                            ) : p.agent?.avatarUrl ? (
                              <Image
                                src={p.agent.avatarUrl}
                                alt={p.agent.name}
                                fill
                                sizes="28px"
                                className="object-cover"
                              />
                            ) : (
                              <User className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-extrabold text-text-primary block truncate">
                              {isCentral ? "Inmobiliaria Los Andes" : p.agent?.name || "Sin Asesor Asignado"}
                            </span>
                            <span className="text-[10px] text-text-secondary block truncate">
                              {isCentral ? "Central Los Andes" : p.agent?.position || "Asesor Inmobiliario"}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="p-3.5 sm:p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-xs font-bold">
                  {/* Ficha publica */}
                  <Link
                    href={`/propiedades/${p.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-text-secondary hover:text-brand-primary transition-colors"
                    title="Ver ficha pública en el portal"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ficha pública</span>
                  </Link>

                  {/* Acciones de gestion: Editar y Eliminar */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-brand-primary hover:text-brand-accent border border-neutral-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
                      title="Editar propiedad en modal"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-brand-accent" />
                      <span>Editar</span>
                    </button>
                    <DeletePropertyButton
                      id={p.id}
                      title={p.title}
                      onDeleted={handleOptimisticDelete}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginacion ejecutiva del catalogo inmobiliario */}
      {filteredProperties.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProperties.length}
          itemsPerPage={PROPERTIES_PER_PAGE}
          itemLabel="inmuebles"
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {/* Modal reactivo de creacion / edicion de propiedades */}
      <PropertyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        property={selectedProperty}
        agents={agents}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
