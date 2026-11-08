"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserPlus,
  Phone,
  Edit2,
  Users,
  UserCheck,
  UserX,
  Home,
  Search,
  Power,
  ChevronRight,
  Loader2,
  ArrowRightLeft,
  Star,
} from "lucide-react";
import { toggleAgentStatusAction, toggleAgentFeaturedAction, getAgentPropertiesForTransferAction } from "@/app/admin/actions";
import { AgentModal, AgentFormData } from "@/components/admin/AgentModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import { Pagination } from "@/components/admin/Pagination";
import {
  TransferPropertiesModal,
  TransferableProperty,
  TransferAgentOption,
} from "@/components/admin/TransferPropertiesModal";

export interface AgentItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  instagram: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  featured: boolean;
  createdAt?: string;
  propertiesCount: number;
  activePropertiesCount: number;
  forSaleCount?: number;
  forRentCount?: number;
  portfolioValue?: number;
  propertiesList?: TransferableProperty[];
}

// Gestor interactivo enriquecido de asesores inmobiliarios con metricas y control de estado
export function AgentManager({ agents }: { agents: AgentItem[] }) {
  // Estado local sincronizado para actualizaciones optimistas instantaneas (0ms de latencia)
  const [agentsList, setAgentsList] = useState<AgentItem[]>(agents);

  // Sincroniza estado cuando el servidor refresca props
  useEffect(() => {
    setAgentsList(agents);
  }, [agents]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "FEATURED" | "INACTIVE">("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentFormData | null>(null);
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
  const [agentToToggle, setAgentToToggle] = useState<AgentItem | null>(null);
  const [agentToTransfer, setAgentToTransfer] = useState<AgentItem | null>(null);
  // Propiedades cargadas lazy al abrir el modal de transferencia
  const [transferProperties, setTransferProperties] = useState<TransferableProperty[]>([]);
  const [loadingTransferProps, setLoadingTransferProps] = useState(false);

  // Carga lazy de propiedades al abrir modal de transferencia
  const handleOpenTransferModal = async (agent: AgentItem) => {
    setAgentToTransfer(agent);
    setLoadingTransferProps(true);
    try {
      const props = await getAgentPropertiesForTransferAction(agent.id);
      setTransferProperties(props);
    } catch {
      toast.error("No se pudieron cargar las propiedades");
      setTransferProperties([]);
    } finally {
      setLoadingTransferProps(false);
    }
  };

  // Lista de asesores activos disponibles como destino de transferencia
  const availableAgentsForTransfer: TransferAgentOption[] = useMemo(() => {
    return agentsList
      .filter((a) => a.isActive)
      .map((a) => ({
        id: a.id,
        name: a.name,
        position: a.position,
        avatarUrl: a.avatarUrl,
        propertiesCount: a.propertiesCount,
      }));
  }, [agentsList]);

  // Metricas globales para las tarjetas de resumen
  const totalAgents = agentsList.length;
  const activeAgents = agentsList.filter((a) => a.isActive).length;
  const featuredAgents = agentsList.filter((a) => a.isActive && a.featured).length;
  const inactiveAgents = totalAgents - activeAgents;
  const totalPropertiesAssigned = agentsList.reduce((sum, a) => sum + a.propertiesCount, 0);

  // Filtrado reactivo en tiempo real
  const filteredAgents = agentsList.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.phone && agent.phone.includes(searchQuery));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && agent.isActive) ||
      (statusFilter === "FEATURED" && agent.isActive && agent.featured) ||
      (statusFilter === "INACTIVE" && !agent.isActive);

    return matchesSearch && matchesStatus;
  });

  // Alternar si un asesor esta destacado en el Home con actualizacion optimista instantanea
  const handleToggleFeatured = async (agent: AgentItem) => {
    // 1. Validacion reactiva de tope maximo en cliente (8 asesores)
    const currentFeaturedCount = agentsList.filter((a) => a.isActive && a.featured).length;
    if (!agent.featured && currentFeaturedCount >= 8) {
      toast.warning("Máximo 8 en el Home", {
        description: "Desmarca un asesor antes de agregar otro.",
        duration: 3500,
      });
      return;
    }

    const nextFeatured = !agent.featured;

    // 2. Actualizacion optimista inmediata (0ms percibidos en interfaz)
    setAgentsList((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, featured: nextFeatured } : a))
    );

    toast.success(
      nextFeatured
        ? `${agent.name} agregado al Home`
        : `${agent.name} retirado del Home`,
      { duration: 2500 }
    );

    // 3. Sincronizacion en segundo plano con la base de datos
    try {
      const res = await toggleAgentFeaturedAction(agent.id);
      if (!res.success && res.error) {
        // Revertir estado si el servidor rechaza
        setAgentsList((prev) =>
          prev.map((a) => (a.id === agent.id ? { ...a, featured: !nextFeatured } : a))
        );
        toast.warning("Máximo 8 en el Home", {
          description: res.error,
          duration: 4000,
        });
      }
    } catch (err: unknown) {
      // Revertir estado ante error de red
      setAgentsList((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, featured: !nextFeatured } : a))
      );
      const msg = err instanceof Error ? err.message : "Error al actualizar estado destacado.";
      toast.error("Error al actualizar", { description: msg, duration: 4000 });
    }
  };

  // Paginacion reactiva de asesores (15 tarjetas por pagina)
  const [currentPage, setCurrentPage] = useState(1);
  const AGENTS_PER_PAGE = 15;

  // Reset de pagina al aplicar filtros de busqueda o estado
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / AGENTS_PER_PAGE));

  // Asesores correspondientes a la pagina activa
  const paginatedAgents = useMemo(() => {
    const start = (currentPage - 1) * AGENTS_PER_PAGE;
    return filteredAgents.slice(start, start + AGENTS_PER_PAGE);
  }, [filteredAgents, currentPage]);

  const executeToggleStatus = async () => {
    if (!agentToToggle) return;
    const targetAgent = agentToToggle;
    const nextStatus = !targetAgent.isActive;

    // Actualizacion optimista inmediata en interfaz (0ms)
    setAgentsList((prev) =>
      prev.map((a) => (a.id === targetAgent.id ? { ...a, isActive: nextStatus } : a))
    );
    setAgentToToggle(null);

    toast.success(
      nextStatus
        ? `Asesor ${targetAgent.name} reactivado correctamente`
        : `Asesor ${targetAgent.name} pausado correctamente`,
      { duration: 3000 }
    );

    try {
      await toggleAgentStatusAction(targetAgent.id);
    } catch (err: unknown) {
      // Revertir optimismo si el servidor rechaza
      setAgentsList((prev) =>
        prev.map((a) => (a.id === targetAgent.id ? { ...a, isActive: !nextStatus } : a))
      );
      const message = err instanceof Error ? err.message : "Error al cambiar el estado del asesor.";
      toast.error("Error de operación", { description: message });
    }
  };

  const openCreateModal = () => {
    setEditingAgent(null);
    setShowModal(true);
  };

  const openEditModal = (agent: AgentItem) => {
    setEditingAgent({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      position: agent.position,
      instagram: agent.instagram,
      avatarUrl: agent.avatarUrl,
      isActive: agent.isActive,
      featured: agent.featured,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas de Metricas Ejecutivas del Equipo con Relieve y Profundidad Volumetrica */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Asesores */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(26,59,38,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(26,59,38,0.14),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-brand-primary/30 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          {/* Luz ambiental cenital organica (reemplaza la linea dura por iluminacion ambiental difusa) */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-primary/[0.05] to-transparent pointer-events-none group-hover:from-brand-primary/[0.09] transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-brand-primary/[0.05] rounded-full blur-xl pointer-events-none" />
          <Users className="absolute -right-3 -bottom-3 w-24 h-24 text-brand-primary/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/70" />
                Total Asesores
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-primary font-heading tracking-tight block mt-1.5">
                {totalAgents}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#122b1c] via-[#1a3b26] to-[#0d1f14] text-white border border-emerald-500/25 flex items-center justify-center shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <Users className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Asesores Activos */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(5,150,105,0.08),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(5,150,105,0.16),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-emerald-500/40 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          {/* Luz ambiental cenital organica */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-emerald-500/[0.07] to-transparent pointer-events-none group-hover:from-emerald-500/[0.12] transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/[0.07] rounded-full blur-xl pointer-events-none" />
          <UserCheck className="absolute -right-3 -bottom-3 w-24 h-24 text-emerald-600/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Asesores Activos
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 font-heading tracking-tight block mt-1.5">
                {activeAgents}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#059669] via-emerald-600 to-[#047857] text-white border border-emerald-400/35 flex items-center justify-center shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <UserCheck className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Asesores Pausados */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-neutral-400/30 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          {/* Luz ambiental cenital organica */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-neutral-200/40 to-transparent pointer-events-none group-hover:from-neutral-300/50 transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-neutral-400/[0.05] rounded-full blur-xl pointer-events-none" />
          <UserX className="absolute -right-3 -bottom-3 w-24 h-24 text-neutral-500/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                Asesores Pausados
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-400 font-heading tracking-tight block mt-1.5">
                {inactiveAgents}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300 text-neutral-600 border border-neutral-300/70 flex items-center justify-center shadow-sm shadow-neutral-400/15 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <UserX className="w-6 h-6 text-neutral-600" />
            </div>
          </div>
        </div>

        {/* Inmuebles en Cartera */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(222,88,42,0.09),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(222,88,42,0.18),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-brand-accent/40 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          {/* Luz ambiental cenital organica */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-accent/[0.07] to-transparent pointer-events-none group-hover:from-brand-accent/[0.12] transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-brand-accent/[0.08] rounded-full blur-xl pointer-events-none" />
          <Home className="absolute -right-3 -bottom-3 w-24 h-24 text-brand-accent/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/70" />
                Inmuebles en Cartera
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-accent font-heading tracking-tight block mt-1.5">
                {totalPropertiesAssigned}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e85d30] via-brand-accent to-[#c4441b] text-white border border-orange-300/35 flex items-center justify-center shadow-md shadow-brand-accent/25 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <Home className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Busqueda y Accion Principal */}
      <div className="bg-ui-surface p-4 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Buscador */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-3">
          {/* Pestanas de Estado */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === "ALL"
                  ? "bg-white text-brand-primary shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Todos ({totalAgents})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === "ACTIVE"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Activos ({activeAgents})
            </button>
            <button
              onClick={() => setStatusFilter("FEATURED")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                statusFilter === "FEATURED"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${statusFilter === "FEATURED" ? "fill-amber-500 text-amber-600" : "text-amber-500"}`} />
              <span>Destacados ({featuredAgents}/8)</span>
            </button>
            <button
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === "INACTIVE"
                  ? "bg-white text-neutral-700 shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Inactivos ({inactiveAgents})
            </button>
          </div>

          {/* Boton Agregar */}
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-brand-accent hover:bg-[#c94b21] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Asesor</span>
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas de Asesores */}
      {filteredAgents.length === 0 ? (
        <div className="bg-ui-surface rounded-3xl border border-neutral-200/80 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-base font-bold text-brand-primary font-heading">
            No se encontraron asesores
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            No hay asesores que coincidan con el criterio de búsqueda o filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAgents.map((agent) => {
            const cleanPhone = agent.phone ? agent.phone.replace(/[^0-9]/g, "") : null;
            const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
            const isToggling = loadingAgentId === agent.id;

            return (
              <div
                key={agent.id}
                className={`group relative bg-white text-neutral-900 rounded-[28px] p-3.5 border transition-[transform,box-shadow,border-color] duration-200 ease-out flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(26,59,38,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-brand-primary/30 hover:-translate-y-1 will-change-transform ${
                  agent.isActive
                    ? "border-neutral-200/90"
                    : "border-neutral-200/60 opacity-80"
                }`}
              >
                <div>
                  {/* Marco Superior de Retrato a Sangrado Completo (Full-Bleed Showcase) */}
                  <div className="relative w-full h-72 rounded-[22px] overflow-hidden select-none bg-neutral-100 group/photo isolate [transform:translateZ(0)]">
                    {/* Fotografia de Retrato a Cobertura Total */}
                    <Image
                      src={
                        agent.avatarUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={agent.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      loading="lazy"
                      decoding="async"
                      className="object-cover object-top rounded-[22px] group-hover:scale-105 transition-transform duration-300 ease-out will-change-transform"
                    />

                    {/* Degradados sutiles para legibilidad de badges */}
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Barra Superior con Estado y Boton de Pausa */}
                    <div className="relative z-20 w-full flex items-center justify-between p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border shadow-xs ${
                            agent.isActive
                              ? "bg-white/95 text-emerald-800 border-emerald-500/25"
                              : "bg-neutral-900/80 text-white border-white/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              agent.isActive ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                            }`}
                          />
                          {agent.isActive ? "Activo" : "Inactivo"}
                        </span>

                        {agent.isActive && agent.featured && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 bg-amber-500 text-white border border-amber-400 shadow-xs">
                            <Star className="w-2.5 h-2.5 fill-white text-white" />
                            <span>Home</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Boton para alternar destacado en el Home (maximo 8) */}
                        {agent.isActive && (
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(agent)}
                            title={
                              agent.featured
                                ? "Quitar de destacados en el Home"
                                : featuredAgents >= 8
                                ? "Límite de 8 asesores alcanzado en el Home"
                                : "Destacar en el carrusel del Home"
                            }
                            className={`p-1.5 rounded-xl border transition-all active:scale-90 cursor-pointer shadow-xs ${
                              agent.featured
                                ? "bg-amber-500 hover:bg-amber-600 border-amber-400 text-white"
                                : "bg-white/95 hover:bg-white border-white/80 text-neutral-700 hover:text-amber-600"
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                                agent.featured ? "fill-white text-white scale-110" : "scale-100"
                              }`}
                            />
                          </button>
                        )}

                        {/* Boton para transferir cartera comercial si tiene inmuebles asignados */}
                        {agent.propertiesCount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenTransferModal(agent)}
                            title={`Transferir cartera comercial (${agent.propertiesCount} inmuebles)`}
                            className="p-1.5 rounded-xl bg-white/95 hover:bg-amber-500 border border-white/80 hover:border-amber-400 text-neutral-700 hover:text-white transition-colors active:scale-95 cursor-pointer shadow-xs group/transfer"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600 group-hover/transfer:text-white" />
                          </button>
                        )}

                        {/* Boton para pausar o reactivar asesor */}
                        <button
                          type="button"
                          onClick={() => setAgentToToggle(agent)}
                          disabled={isToggling}
                          title={agent.isActive ? "Pausar asesor" : "Reactivar asesor"}
                          className="p-1.5 rounded-xl bg-white/95 hover:bg-white border border-white/80 text-neutral-700 hover:text-red-600 transition-colors active:scale-95 cursor-pointer shadow-xs"
                        >
                          {isToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-700" />
                          ) : (
                            <Power className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Notch Curvo Invertido en la Base */}
                    <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-end justify-center">
                      <svg
                        viewBox="0 0 180 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-40 h-[34px] text-white"
                      >
                        <path
                          d="M 0 38 C 16 36 20 18 32 6 C 38 0 46 0 54 0 L 126 0 C 134 0 142 0 148 6 C 160 18 164 36 180 38 L 180 40 L 0 40 Z"
                          fill="currentColor"
                        />
                      </svg>
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-center pointer-events-auto">
                        <span className="text-[11.5px] font-bold text-brand-primary font-heading tracking-wide block whitespace-nowrap">
                          {agent.propertiesCount} {agent.propertiesCount === 1 ? "Inmueble" : "Inmuebles"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo de la Tarjeta: Minimalista y sin sobrecarga */}
                  <div className="mt-3 px-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 font-heading truncate leading-snug group-hover:text-brand-accent transition-colors">
                        {agent.name}
                      </h3>

                      {agent.phone && whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Contactar por WhatsApp"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all active:scale-95 shadow-xs shrink-0"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pie de Tarjeta: Accion de Edicion y Link a Detalle */}
                <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-center justify-between px-1 text-xs">
                  <button
                    type="button"
                    onClick={() => openEditModal(agent)}
                    className="inline-flex items-center gap-1.5 font-semibold text-neutral-500 hover:text-brand-primary transition-colors py-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <Link
                    href={`/admin/asesores/${agent.id}`}
                    className="inline-flex items-center gap-1 font-bold text-brand-accent hover:text-[#c94b21] transition-colors py-1 group/btn"
                  >
                    <span>Ver Perfil & Cartera</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginacion ejecutiva de asesores */}
      {filteredAgents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAgents.length}
          itemsPerPage={AGENTS_PER_PAGE}
          itemLabel="asesores"
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {/* Modal Reutilizable de Creacion / Edicion */}
      <AgentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        agent={editingAgent}
      />

      {/* Modal Reutilizable de Confirmacion de Estado */}
      <ConfirmModal
        isOpen={Boolean(agentToToggle)}
        onClose={() => setAgentToToggle(null)}
        onConfirm={executeToggleStatus}
        isLoading={Boolean(loadingAgentId)}
        variant={agentToToggle?.isActive ? "warning" : "info"}
        title={
          agentToToggle?.isActive
            ? "Pausar Asesor Inmobiliario"
            : "Reactivar Asesor Inmobiliario"
        }
        description={
          agentToToggle?.isActive
            ? `¿Estás seguro de que deseas pausar a ${agentToToggle?.name}? Sus propiedades seguirán guardadas pero el asesor pasará a estado inactivo.`
            : `¿Estás seguro de que deseas reactivar a ${agentToToggle?.name}? El asesor volverá a estar disponible en el equipo comercial activo.`
        }
        itemHighlight={
          agentToToggle
            ? `${agentToToggle.name} • ${agentToToggle.propertiesCount} ${
                agentToToggle.propertiesCount === 1 ? "inmueble asignado" : "inmuebles asignados"
              }`
            : undefined
        }
        confirmText={agentToToggle?.isActive ? "Pausar Asesor" : "Reactivar Asesor"}
        cancelText="Volver"
      />

      {/* Modal Reutilizable de Transferencia de Cartera Inmobiliaria */}
      {agentToTransfer && (
        <TransferPropertiesModal
          isOpen={Boolean(agentToTransfer)}
          onClose={() => { setAgentToTransfer(null); setTransferProperties([]); }}
          sourceAgent={{
            id: agentToTransfer.id,
            name: agentToTransfer.name,
            position: agentToTransfer.position,
            avatarUrl: agentToTransfer.avatarUrl,
          }}
          properties={loadingTransferProps ? [] : transferProperties}
          isLoadingProperties={loadingTransferProps}
          availableAgents={availableAgentsForTransfer}
          onSuccess={() => { setAgentToTransfer(null); setTransferProperties([]); }}
        />
      )}
    </div>
  );
}
