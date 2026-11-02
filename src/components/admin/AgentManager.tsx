"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserPlus,
  Phone,
  Mail,
  Edit2,
  Users,
  UserCheck,
  UserX,
  Home,
  Search,
  Power,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { formatCurrency } from "@/lib/utils/format";
import { toggleAgentStatusAction } from "@/app/admin/actions";
import { AgentModal, AgentFormData } from "@/components/admin/AgentModal";

export interface AgentItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  instagram: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt?: string;
  propertiesCount: number;
  activePropertiesCount: number;
  portfolioValue: number;
}

// Gestor interactivo enriquecido de asesores inmobiliarios con metricas y control de estado
export function AgentManager({ agents }: { agents: AgentItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentFormData | null>(null);
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);

  // Metricas globales para las tarjetas de resumen
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.isActive).length;
  const inactiveAgents = totalAgents - activeAgents;
  const totalPropertiesAssigned = agents.reduce((sum, a) => sum + a.propertiesCount, 0);

  // Filtrado reactivo en tiempo real
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.phone && agent.phone.includes(searchQuery));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && agent.isActive) ||
      (statusFilter === "INACTIVE" && !agent.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (agent: AgentItem) => {
    const actionText = agent.isActive ? "inactivar (pausar)" : "reactivar";
    if (!confirm(`¿Estás seguro de que deseas ${actionText} a ${agent.name}?`)) {
      return;
    }

    setLoadingAgentId(agent.id);
    try {
      await toggleAgentStatusAction(agent.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cambiar el estado del asesor.";
      alert(message);
    } finally {
      setLoadingAgentId(null);
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
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas de Metricas Ejecutivas del Equipo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Asesores */}
        <div className="group relative bg-ui-surface p-6 rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-brand-primary/30 transition-all duration-200 overflow-hidden">
          <Users className="absolute -right-3 -bottom-3 w-20 h-20 text-brand-primary/[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Total Asesores
            </span>
            <div className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-md shadow-brand-primary/20 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-brand-primary font-heading tracking-tight block">
              {totalAgents}
            </span>
          </div>
        </div>

        {/* Asesores Activos */}
        <div className="group relative bg-ui-surface p-6 rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-200 overflow-hidden">
          <UserCheck className="absolute -right-3 -bottom-3 w-20 h-20 text-emerald-600/[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Asesores Activos
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-heading tracking-tight block">
              {activeAgents}
            </span>
          </div>
        </div>

        {/* Asesores Inactivos */}
        <div className="group relative bg-ui-surface p-6 rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-neutral-300 transition-all duration-200 overflow-hidden">
          <UserX className="absolute -right-3 -bottom-3 w-20 h-20 text-neutral-500/[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Asesores Inactivos
            </span>
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-neutral-600 border border-neutral-200/60 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserX className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-neutral-500 font-heading tracking-tight block">
              {inactiveAgents}
            </span>
          </div>
        </div>

        {/* Inmuebles en Cartera */}
        <div className="group relative bg-ui-surface p-6 rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-brand-accent/30 transition-all duration-200 overflow-hidden">
          <Home className="absolute -right-3 -bottom-3 w-20 h-20 text-brand-accent/[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-brand-accent">
              Inmuebles en Cartera
            </span>
            <div className="w-10 h-10 rounded-2xl bg-brand-accent text-white flex items-center justify-center shadow-md shadow-brand-accent/20 group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-brand-accent font-heading tracking-tight block">
              {totalPropertiesAssigned}
            </span>
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
            placeholder="Buscar por nombre, correo o cargo..."
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
          {filteredAgents.map((agent) => {
            const cleanPhone = agent.phone ? agent.phone.replace(/[^0-9]/g, "") : null;
            const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
            const isToggling = loadingAgentId === agent.id;

            return (
              <div
                key={agent.id}
                className={`bg-ui-surface rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  agent.isActive
                    ? "border-neutral-200/80"
                    : "border-neutral-200 bg-neutral-50/50 opacity-90"
                }`}
              >
                <div className="p-6 space-y-5">
                  {/* Fila superior: Avatar, Estado y Switch de Inactivar */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-accent/20 bg-neutral-100 shadow-sm shrink-0">
                      <Image
                        src={
                          agent.avatarUrl ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                        }
                        alt={agent.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          agent.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-neutral-100 text-neutral-600 border border-neutral-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            agent.isActive ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                          }`}
                        />
                        {agent.isActive ? "Activo" : "Inactivo"}
                      </span>

                      {/* Boton rapido de activacion sin borrar */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(agent)}
                        disabled={isToggling}
                        title={agent.isActive ? "Inactivar asesor (pausar)" : "Reactivar asesor"}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          agent.isActive
                            ? "text-neutral-500 hover:text-red-600 border-neutral-200 hover:bg-red-50"
                            : "text-emerald-700 hover:text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Power className="w-3 h-3" />
                        )}
                        <span>{agent.isActive ? "Pausar" : "Reactivar"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Nombre y Cargo */}
                  <div>
                    <h3 className="text-lg font-black text-brand-primary font-heading leading-snug">
                      {agent.name}
                    </h3>
                    <p className="text-xs font-semibold text-brand-accent mt-0.5">{agent.position}</p>
                  </div>

                  {/* Chips con Metricas del Asesor */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
                    <div>
                      <span className="text-xs font-black text-brand-primary block">
                        {agent.propertiesCount}
                      </span>
                      <span className="text-[10px] text-text-secondary font-medium block">
                        Inmuebles a cargo
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-brand-accent block truncate">
                        {formatCurrency(agent.portfolioValue)}
                      </span>
                      <span className="text-[10px] text-text-secondary font-medium block">
                        Cartera activa
                      </span>
                    </div>
                  </div>

                  {/* Datos de Contacto */}
                  <div className="space-y-2 text-xs text-text-secondary pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <a
                        href={`mailto:${agent.email}`}
                        className="truncate hover:text-brand-primary transition-colors"
                      >
                        {agent.email}
                      </a>
                    </div>

                    {agent.phone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-text-primary">{agent.phone}</span>
                        </div>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    )}

                    {agent.instagram && (
                      <div className="flex items-center gap-2">
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                        <a
                          href={`https://instagram.com/${agent.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-brand-primary transition-colors truncate"
                        >
                          @{agent.instagram.replace("@", "")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pie de Tarjeta con Navegacion a Detalle y Edicion */}
                <div className="p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => openEditModal(agent)}
                    className="text-xs font-bold text-text-secondary hover:text-brand-primary flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <Link
                    href={`/admin/asesores/${agent.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors"
                  >
                    <span>Ver Perfil & Inmuebles</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Reutilizable de Creacion / Edicion */}
      <AgentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        agent={editingAgent}
      />
    </div>
  );
}
