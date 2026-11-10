"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Power, Edit2, PlusCircle, Loader2, ArrowRightLeft } from "lucide-react";
import { toggleAgentStatusAction } from "@/app/admin/actions";
import { AgentModal, AgentFormData } from "@/components/admin/AgentModal";
import { PropertyModal, AgentOption } from "@/components/admin/PropertyModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  TransferPropertiesModal,
  TransferableProperty,
} from "@/components/admin/TransferPropertiesModal";

interface AgentDetailActionsProps {
  agent: AgentFormData;
  agents: (AgentOption & { propertiesCount?: number })[];
  properties?: TransferableProperty[];
}

// Botones de accion y cambio de estado para la vista de detalle del asesor
export function AgentDetailActions({ agent, agents, properties = [] }: AgentDetailActionsProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(agent.isActive);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const res = await toggleAgentStatusAction(agent.id);
      setIsActive(res.isActive);
      setShowConfirmModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cambiar el estado del asesor.";
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 w-full sm:w-56 shrink-0 lg:border-l lg:border-neutral-200/80 lg:pl-6 justify-center">
        {/* Asignar nueva propiedad mediante modal integrado */}
        <button
          type="button"
          onClick={() => setShowPropertyModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-accent/20 transition-all active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>Asignar Propiedad</span>
        </button>

        {/* Abrir modal de edicion */}
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200/80 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Edit2 className="w-4 h-4 text-brand-accent shrink-0" />
          <span>Editar Datos</span>
        </button>

        {/* Accion para transferir cartera a otro asesor */}
        {properties.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            title="Transferir cartera a otro asesor"
          >
            <ArrowRightLeft className="w-4 h-4 text-white shrink-0" />
            <span>Transferir Cartera</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-white text-[11px] font-black shrink-0">
              {properties.length}
            </span>
          </button>
        )}

        {/* Accion para alternar el estado (Inactivar / Reactivar Asesor) */}
        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          disabled={isLoading}
          title={isActive ? "Pausar actividad del asesor" : "Reactivar asesor en el equipo"}
          className={`w-full group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 border ${
            isActive
              ? "bg-neutral-50 hover:bg-red-50 text-neutral-600 hover:text-red-700 border-neutral-200/80 hover:border-red-200"
              : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-950/40"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <Power className="w-4 h-4 shrink-0 text-neutral-500 group-hover:text-red-600 transition-colors" />
          )}
          <span>{isActive ? "Inactivar Asesor" : "Reactivar Asesor"}</span>
        </button>
      </div>

      {/* Modal de confirmacion de cambio de estado */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleToggle}
        isLoading={isLoading}
        variant={isActive ? "warning" : "info"}
        title={isActive ? "Pausar Asesor Inmobiliario" : "Reactivar Asesor Inmobiliario"}
        description={
          isActive
            ? `¿Estás seguro de que deseas pausar a ${agent.name}? Sus inmuebles asignados seguirán registrados, pero el asesor no figurará en estado activo.`
            : `¿Estás seguro de que deseas reactivar a ${agent.name}? El asesor volverá a figurar como activo en el equipo.`
        }
        itemHighlight={agent.name}
        confirmText={isActive ? "Pausar Asesor" : "Reactivar Asesor"}
        cancelText="Volver"
      />

      <AgentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        agent={{ ...agent, isActive }}
      />

      {/* Modal para registrar y asignar una propiedad a este asesor */}
      <PropertyModal
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        agents={agents}
        defaultAgentId={agent.id}
        onSuccess={() => {
          setShowPropertyModal(false);
          router.refresh();
        }}
      />

      {/* Modal para transferir cartera a otro asesor */}
      {showTransferModal && (
        <TransferPropertiesModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          sourceAgent={{
            id: agent.id,
            name: agent.name,
            position: agent.position,
            avatarUrl: agent.avatarUrl,
          }}
          properties={properties}
          availableAgents={agents}
          onSuccess={() => {
            setShowTransferModal(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

