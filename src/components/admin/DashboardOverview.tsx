"use client";

import { Fragment, useState, useTransition, useMemo } from "react";
import Image from "next/image";
import {
  Building2,
  Tag,
  Key,
  Users,
  Star,
  Search,
  CheckCircle2,
  AlertCircle,
  Home as HomeIcon,
  Hash,
  X,
  Info,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import {
  toggleAgentFeaturedAction,
  togglePropertyFeaturedAction,
  reorderPropertiesAction,
} from "@/app/admin/actions";
import { MovePositionModal, type MoveModalItem } from "@/components/admin/dashboard/MovePositionModal";
import { FeaturedAgentsTab } from "@/components/admin/dashboard/FeaturedAgentsTab";

export interface DashboardMetricData {
  totalProperties: number;
  saleProperties: number;
  rentProperties: number;
  availableProperties: number;
  reservedProperties: number;
  soldRentedProperties: number;
  totalAgents: number;
  featuredPropertiesCount: number;
  featuredAgentsCount: number;
}

export interface DashboardPropertyItem {
  id: string;
  title: string;
  slug: string;
  operationType: "SALE" | "RENT";
  propertyType: string;
  customPropertyType?: string | null;
  status: string;
  price: number;
  currency: string;
  featured: boolean;
  displayOrder?: number;
  city: string;
  sector?: string | null;
  coverUrl?: string | null;
  agentName: string;
  agentAvatar?: string | null;
  agentIsActive?: boolean;
  createdAt: string;
}

export interface DashboardAgentItem {
  id: string;
  name: string;
  position: string;
  avatarUrl?: string | null;
  phone?: string | null;
  featured: boolean;
  displayOrder?: number;
  propertiesCount: number;
}

interface DashboardOverviewProps {
  metrics: DashboardMetricData;
  properties: DashboardPropertyItem[];
  agents: DashboardAgentItem[];
}

// Tamaño de pagina del catalogo publico
const PUBLIC_PAGE_SIZE = 16;

export function DashboardOverview({
  metrics,
  properties: initialProperties,
  agents: initialAgents,
}: DashboardOverviewProps) {
  const [activeTab, setActiveTab] = useState<"properties" | "agents">("properties");
  const [properties, setProperties] = useState<DashboardPropertyItem[]>(initialProperties);
  const [agents, setAgents] = useState<DashboardAgentItem[]>(initialAgents);

  const [searchTerm, setSearchTerm] = useState("");
  const [pageFilter, setPageFilter] = useState<"ALL" | "PAGE_1" | "PAGE_2_PLUS">("ALL");
  const [agentFilter, setAgentFilter] = useState<"ALL" | "FEATURED" | "UNFEATURED">("ALL");

  // Conteo reactivo de asesores en inicio (límite máximo permitido: 8)
  const featuredAgentsCount = useMemo(() => agents.filter((a) => a.featured).length, [agents]);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    description?: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Estados para Drag and Drop de Inmuebles
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Estado para el modal rápido de "Mover a posición..." (solo inmuebles)
  const [moveModalItem, setMoveModalItem] = useState<MoveModalItem | null>(null);

  const showNotification = (
    title: string,
    description?: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ type, title, description });
    setTimeout(() => {
      setNotification((curr) => (curr?.title === title ? null : curr));
    }, 3800);
  };

  // Reordenar array maestro y sincronizar en base de datos
  const applyNewOrder = (
    newProperties: DashboardPropertyItem[],
    title: string = "Orden actualizado",
    description: string = "Los cambios se guardaron correctamente."
  ) => {
    const normalized = newProperties.map((p, idx) => ({ ...p, displayOrder: idx + 1 }));
    setProperties(normalized);

    startTransition(async () => {
      const res = await reorderPropertiesAction(normalized.map((p) => p.id));
      if (res.success) {
        showNotification(title, description);
      } else {
        setProperties(properties);
        showNotification("No se pudo guardar", res.error || "Error al actualizar el orden.", "error");
      }
    });
  };

  // Mover propiedad a una posicion absoluta (1-based)
  const handleMoveToPosition = (propertyId: string, targetPosition: number) => {
    const currentIndex = properties.findIndex((p) => p.id === propertyId);
    if (currentIndex === -1) return;

    const clampedTarget = Math.max(1, Math.min(targetPosition, properties.length));
    const targetIndex = clampedTarget - 1;

    if (currentIndex === targetIndex) {
      setMoveModalItem(null);
      return;
    }

    const updated = [...properties];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);

    const targetPage = Math.ceil(clampedTarget / PUBLIC_PAGE_SIZE);
    setMoveModalItem(null);

    if (clampedTarget === 1) {
      applyNewOrder(
        updated,
        "Inmueble al inicio",
        "Ahora encabeza la portada principal."
      );
    } else {
      applyNewOrder(
        updated,
        "Posición actualizada",
        targetPage === 1
          ? `Inmueble reubicado en el puesto #${clampedTarget} de la portada.`
          : `Inmueble reubicado en el puesto #${clampedTarget} (Página ${targetPage}).`
      );
    }
  };

  // Mover inmediatamente al 1er lugar (Posicion #1 de la Pagina 1)
  const handleSendToTop = (propertyId: string) => {
    handleMoveToPosition(propertyId, 1);
  };

  // Mover 1 paso arriba o abajo
  const handleStepMove = (propertyId: string, direction: "UP" | "DOWN") => {
    const idx = properties.findIndex((p) => p.id === propertyId);
    if (idx === -1) return;
    const targetIdx = direction === "UP" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= properties.length) return;

    const updated = [...properties];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    const newPos = targetIdx + 1;
    const targetPage = Math.ceil(newPos / PUBLIC_PAGE_SIZE);
    applyNewOrder(
      updated,
      "Posición actualizada",
      targetPage === 1
        ? `Inmueble desplazado al puesto #${newPos} de la portada.`
        : `Inmueble desplazado al puesto #${newPos} (Página ${targetPage}).`
    );
  };

  // Drag and Drop: Inicio del arrastre
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  // Drag and Drop: Pasa por encima
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  // Drag and Drop: Soltar en la nueva posicion
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...properties];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setDraggedIndex(null);
    setDragOverIndex(null);
    applyNewOrder(
      updated,
      "Secuencia guardada",
      "El nuevo orden se aplicó correctamente en la portada."
    );
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Conmutar asesor en vitrina principal
  const handleToggleAgentFeatured = (agentId: string) => {
    const target = agents.find((a) => a.id === agentId);
    if (!target) return;

    // Validación preventiva en cliente: tope máximo de 8 asesores en portada
    if (!target.featured && featuredAgentsCount >= 8) {
      showNotification(
        "Límite de 8 alcanzado",
        "Desmarca un asesor antes de agregar a otro.",
        "error"
      );
      return;
    }

    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, featured: !a.featured } : a))
    );

    startTransition(async () => {
      const res = await toggleAgentFeaturedAction(agentId);
      if (res.success && typeof res.featured === "boolean") {
        setAgents((prev) =>
          prev.map((a) => (a.id === agentId ? { ...a, featured: res.featured! } : a))
        );
        showNotification(
          "Asesores en Inicio",
          res.featured
            ? "El asesor ahora se muestra en la página de inicio."
            : "El asesor se retiró de la página de inicio."
        );
      } else {
        setAgents((prev) =>
          prev.map((a) => (a.id === agentId ? { ...a, featured: !a.featured } : a))
        );
        showNotification(
          "No se pudo actualizar",
          res.error || "Ocurrió un error al guardar los cambios.",
          "error"
        );
      }
    });
  };

  // Conmutar propiedad destacada
  const handleTogglePropertyFeatured = (propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, featured: !p.featured } : p))
    );

    startTransition(async () => {
      const res = await togglePropertyFeaturedAction(propertyId);
      if (res.success && typeof res.featured === "boolean") {
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, featured: res.featured! } : p))
        );
        showNotification(
          "Visibilidad actualizada",
          res.featured
            ? "El inmueble ahora tiene distintivo destacado."
            : "El inmueble volvió a visualización estándar."
        );
      } else {
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, featured: !p.featured } : p))
        );
        showNotification("No se pudo actualizar", res.error || "Ocurrió un error inesperado.", "error");
      }
    });
  };

  // Filtrado de inmuebles conservando su posicion absoluta
  const indexedProperties = useMemo(() => {
    return properties.map((p, absoluteIndex) => ({
      ...p,
      absoluteIndex,
      absolutePosition: absoluteIndex + 1,
      targetPage: Math.ceil((absoluteIndex + 1) / PUBLIC_PAGE_SIZE),
    }));
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return indexedProperties.filter((item) => {
      // Filtro por pagina
      if (pageFilter === "PAGE_1" && item.targetPage !== 1) return false;
      if (pageFilter === "PAGE_2_PLUS" && item.targetPage === 1) return false;

      // Buscador
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSector = (item.sector || "").toLowerCase().includes(q);
        const matchCity = item.city.toLowerCase().includes(q);
        const matchAgent = item.agentName.toLowerCase().includes(q);
        if (!matchTitle && !matchSector && !matchCity && !matchAgent) return false;
      }
      return true;
    });
  }, [indexedProperties, searchTerm, pageFilter]);

  // Filtrado de asesores
  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      if (agentFilter === "FEATURED" && !a.featured) return false;
      if (agentFilter === "UNFEATURED" && a.featured) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = a.name.toLowerCase().includes(q);
        const matchPos = a.position.toLowerCase().includes(q);
        if (!matchName && !matchPos) return false;
      }
      return true;
    });
  }, [agents, searchTerm, agentFilter]);

  return (
    <div className="space-y-6">
      {/* Toast de notificacion flotante en la esquina superior derecha */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] sm:w-auto bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-200/90 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.04)] p-3.5 flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/70"
                : "bg-red-50 text-red-600 border border-red-200/70"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <h5 className="text-xs font-bold text-brand-primary leading-tight">
              {notification.title}
            </h5>
            {notification.description && (
              <p className="text-[11px] text-text-secondary mt-0.5 leading-normal">
                {notification.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
            title="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Tarjetas de Metricas Ejecutivas Simetricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Inventario Total */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-100/40 via-amber-50/20 to-transparent rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <span className="text-xs uppercase font-black text-brand-primary tracking-wider">
              Inventario Total
            </span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/70 border border-orange-200/80 text-brand-accent flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl sm:text-4xl font-black text-brand-primary font-heading tracking-tight">
              {metrics.totalProperties}
            </span>
            <span className="text-xs text-text-secondary font-bold">inmuebles</span>
          </div>
        </div>

        {/* En Venta */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/40 via-emerald-50/20 to-transparent rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <span className="text-xs uppercase font-black text-brand-primary tracking-wider">
              En Venta
            </span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Tag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl sm:text-4xl font-black text-brand-primary font-heading tracking-tight">
              {metrics.saleProperties}
            </span>
            <span className="text-xs text-text-secondary font-bold">inmuebles</span>
          </div>
        </div>

        {/* En Alquiler */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100/40 via-blue-50/20 to-transparent rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <span className="text-xs uppercase font-black text-brand-primary tracking-wider">
              En Alquiler
            </span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/70 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Key className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl sm:text-4xl font-black text-brand-primary font-heading tracking-tight">
              {metrics.rentProperties}
            </span>
            <span className="text-xs text-text-secondary font-bold">inmuebles</span>
          </div>
        </div>

        {/* Asesores Activos */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100/40 via-purple-50/20 to-transparent rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <span className="text-xs uppercase font-black text-brand-primary tracking-wider">
              Asesores Activos
            </span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/70 border border-purple-200/80 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl sm:text-4xl font-black text-brand-primary font-heading tracking-tight">
              {metrics.totalAgents}
            </span>
            <span className="text-xs text-text-secondary font-bold">asesores</span>
          </div>
        </div>
      </div>

      {/* Contenedor Principal: 2 Pestañas (Orden de Inmuebles y Asesores) */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Pestañas de Navegacion */}
        <div className="flex items-center gap-2 px-3 sm:px-7 border-b border-neutral-200/80 bg-neutral-50/60 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => {
              setActiveTab("properties");
              setSearchTerm("");
              setPageFilter("ALL");
            }}
            className={`py-3.5 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "properties"
                ? "border-brand-accent text-brand-primary bg-white shadow-2xs rounded-t-xl"
                : "border-transparent text-text-secondary hover:text-brand-primary"
            }`}
          >
            <Building2 className="w-4 h-4 text-brand-accent shrink-0" />
            <span className="hidden sm:inline">Orden de Inmuebles en la Portada</span>
            <span className="sm:hidden">Inmuebles Portada</span>
            <span className="text-[11px] font-black bg-orange-100 text-brand-accent px-2 py-0.5 rounded-full">
              {properties.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("agents");
              setSearchTerm("");
            }}
            className={`py-3.5 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "agents"
                ? "border-brand-accent text-brand-primary bg-white shadow-2xs rounded-t-xl"
                : "border-transparent text-text-secondary hover:text-brand-primary"
            }`}
          >
            <Users className="w-4 h-4 text-brand-accent shrink-0" />
            <span className="hidden sm:inline">Sección de Asesores</span>
            <span className="sm:hidden">Asesores</span>
            <span className="text-[11px] font-black bg-orange-100 text-brand-accent px-2 py-0.5 rounded-full">
              {agents.length}
            </span>
          </button>
        </div>

        {/* Barra de Filtros y Busqueda */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 bg-white">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={
                  activeTab === "properties"
                    ? "Buscar por título, sector o asesor..."
                    : "Buscar asesor por nombre o cargo..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-50/70 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {activeTab === "properties" && (
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setPageFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    pageFilter === "ALL"
                      ? "bg-brand-primary text-white shadow-2xs"
                      : "bg-white text-text-secondary border border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setPageFilter("PAGE_1")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    pageFilter === "PAGE_1"
                      ? "bg-emerald-700 text-white shadow-2xs"
                      : "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50/60"
                  }`}
                >
                  Página 1
                </button>
                {properties.length > PUBLIC_PAGE_SIZE && (
                  <button
                    type="button"
                    onClick={() => setPageFilter("PAGE_2_PLUS")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      pageFilter === "PAGE_2_PLUS"
                        ? "bg-blue-700 text-white shadow-2xs"
                        : "bg-white text-blue-800 border border-blue-200 hover:bg-blue-50/60"
                    }`}
                  >
                    Página 2+
                  </button>
                )}
              </div>
            )}

            {activeTab === "agents" && (
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setAgentFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    agentFilter === "ALL"
                      ? "bg-brand-primary text-white shadow-2xs"
                      : "bg-white text-text-secondary border border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setAgentFilter("FEATURED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    agentFilter === "FEATURED"
                      ? featuredAgentsCount >= 8
                        ? "bg-amber-600 text-white shadow-2xs"
                        : "bg-emerald-700 text-white shadow-2xs"
                      : featuredAgentsCount >= 8
                      ? "bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                      : "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50/60"
                  }`}
                >
                  <span>En Inicio</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                      agentFilter === "FEATURED"
                        ? "bg-black/20 text-white"
                        : featuredAgentsCount >= 8
                        ? "bg-amber-200/90 text-amber-900"
                        : "bg-emerald-100 text-emerald-900"
                    }`}
                  >
                    {featuredAgentsCount}/8
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAgentFilter("UNFEATURED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    agentFilter === "UNFEATURED"
                      ? "bg-neutral-700 text-white shadow-2xs"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  No en Inicio
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenido de la Sección Activa */}
        <div className="p-5 sm:p-6">
          {/* SECCIÓN 1: ORDEN DE INMUEBLES - SIMULACIÓN EN CUADRÍCULA DE 4 EN 4 */}
          {activeTab === "properties" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredProperties.map((property) => {
                const isDragging = draggedIndex === property.absoluteIndex;
                const isDragOver = dragOverIndex === property.absoluteIndex;
                const isPage1 = property.targetPage === 1;

                return (
                  <Fragment key={property.id}>
                    {/* Divisor Visual de Paginación: Aparece entre la posición 16 y 17 */}
                    {pageFilter === "ALL" && property.absoluteIndex === PUBLIC_PAGE_SIZE && (
                      <div className="col-span-full my-3 py-2 relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-neutral-300" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-neutral-800 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm flex items-center gap-2">
                            <span>Fin de Página 1 (16 inmuebles en portada)</span>
                            <span className="text-neutral-400">•</span>
                            <span>Inicio de Página 2</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tarjeta de Inmueble Ligera en Cuadrícula 4x4 */}
                    <div
                      draggable={!isPending}
                      onDragStart={(e) => handleDragStart(e, property.absoluteIndex)}
                      onDragOver={(e) => handleDragOver(e, property.absoluteIndex)}
                      onDrop={(e) => handleDrop(e, property.absoluteIndex)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden select-none cursor-grab active:cursor-grabbing group relative ${
                        isDragging
                          ? "opacity-30 border-dashed border-brand-accent ring-2 ring-brand-accent/30 scale-[0.98]"
                          : isDragOver
                          ? "border-brand-accent ring-4 ring-brand-accent/40 bg-orange-50/30 scale-[1.03] shadow-lg"
                          : "border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-brand-accent/40"
                      }`}
                    >
                      {/* Banner explicativo visual al soltar encima */}
                      {isDragOver && draggedIndex !== null && (
                        <div className="absolute inset-x-0 top-0 z-30 bg-brand-accent text-white py-1 px-2 text-center text-xs font-black tracking-wide shadow-md animate-in fade-in duration-100 flex items-center justify-center pointer-events-none">
                          <span>Mover a #{property.absolutePosition}</span>
                        </div>
                      )}
                      {/* Portada con renderizado directo de CDN y placeholder visual */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200 flex items-center justify-center">
                        <HomeIcon className="w-8 h-8 text-neutral-300 pointer-events-none absolute" />
                        {property.coverUrl ? (
                          <Image
                            src={property.coverUrl}
                            alt={property.title}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none relative z-1"
                          />
                        ) : null}

                        {/* Insignia de Posición Naranja y Página */}
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                          <span className="bg-brand-accent text-white px-2.5 py-0.5 rounded-lg text-xs font-black shadow-md shadow-brand-accent/30 font-heading tracking-tight">
                            #{property.absolutePosition}
                          </span>
                          <span className="bg-neutral-900/80 text-white backdrop-blur-md px-2 py-0.5 rounded-lg text-xs font-bold shadow-xs">
                            Pág. {property.targetPage}
                          </span>
                        </div>

                        {/* Barra Inferior sobre la foto: Operación y Precio */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-6 flex items-center justify-between text-white pointer-events-none">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                            {property.operationType === "SALE" ? "Venta" : "Alquiler"}
                          </span>
                          <span className="text-xs font-black drop-shadow-xs font-heading">
                            {formatCurrency(property.price.toString(), property.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Cuerpo de la tarjeta: Título y Ubicación */}
                      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-brand-primary line-clamp-1 group-hover:text-brand-accent transition-colors">
                            {property.title}
                          </h4>
                          <p className="text-[11px] text-text-secondary truncate mt-0.5">
                            {property.sector || property.city}
                          </p>
                        </div>

                        {/* Botón de acción */}
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMoveModalItem({
                                property,
                                currentPosition: property.absolutePosition,
                              });
                            }}
                            disabled={isPending}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200/90 hover:text-neutral-900 border border-neutral-200/60 transition-colors cursor-pointer"
                            title="Mover a posición específica"
                          >
                            <Hash className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Mover a...</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                );
              })}

              {filteredProperties.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-secondary text-xs bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                  No se encontraron inmuebles que coincidan con la búsqueda.
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 2: CONTROL DE ASESORES */}
          {activeTab === "agents" && (
            <FeaturedAgentsTab
              agents={filteredAgents}
              featuredAgentsCount={featuredAgentsCount}
              isPending={isPending}
              onToggleFeatured={handleToggleAgentFeatured}
            />
          )}
        </div>
      </div>

      {/* Modal Interactivo de Reubicación Rápida a Posición Específica (Inmuebles) */}
      <MovePositionModal
        item={moveModalItem}
        totalProperties={properties.length}
        pageSize={PUBLIC_PAGE_SIZE}
        isPending={isPending}
        onClose={() => setMoveModalItem(null)}
        onConfirm={handleMoveToPosition}
      />
    </div>
  );
}
