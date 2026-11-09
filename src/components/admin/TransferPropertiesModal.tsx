"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  X,
  Check,
  Loader2,
  AlertCircle,
  Building2,
  Search,
  CheckSquare,
  Square,
  User,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import { transferPropertiesAction } from "@/app/admin/actions";
import { formatCurrency, getInitials } from "@/lib/utils/format";

export interface TransferableProperty {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  operationType: string;
  city?: string;
  sector?: string | null;
  coverImage?: string | null;
}

export interface TransferAgentOption {
  id: string;
  name: string;
  position?: string | null;
  avatarUrl?: string | null;
  propertiesCount?: number;
}

interface TransferPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceAgent: {
    id: string;
    name: string;
    position?: string | null;
    avatarUrl?: string | null;
  };
  properties: TransferableProperty[];
  availableAgents: TransferAgentOption[];
  onSuccess?: () => void;
  isLoadingProperties?: boolean;
}

// Modal ultra-ligero para transferir cartera comercial entre asesores sin carga de imagenes
export function TransferPropertiesModal({
  isOpen,
  onClose,
  sourceAgent,
  properties,
  availableAgents,
  onSuccess,
  isLoadingProperties = false,
}: TransferPropertiesModalProps) {
  const router = useRouter();
  const [targetAgentId, setTargetAgentId] = useState<string>("");
  // Ningun modo seleccionado por defecto
  const [transferMode, setTransferMode] = useState<"ALL" | "SELECTED" | null>(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [agentSearchQuery, setAgentSearchQuery] = useState("");
  const [propertySearchQuery, setPropertySearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cierre inmediato con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Filtro de asesores receptores: NO muestra opciones predefinidas si el buscador esta vacio
  const filteredTargetAgents = useMemo(() => {
    if (!agentSearchQuery.trim()) return [];
    const others = availableAgents.filter((agent) => agent.id !== sourceAgent.id);
    const q = agentSearchQuery.toLowerCase().trim();
    return others.filter((a) => a.name.toLowerCase().includes(q));
  }, [availableAgents, sourceAgent.id, agentSearchQuery]);

  // Asesor destino seleccionado actualmente
  const targetAgent = useMemo(
    () => availableAgents.find((a) => a.id === targetAgentId),
    [availableAgents, targetAgentId]
  );

  // Filtrado de propiedades por busqueda local
  const filteredProperties = useMemo(() => {
    if (!propertySearchQuery.trim()) return properties;
    const q = propertySearchQuery.toLowerCase().trim();
    return properties.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSector = p.sector ? p.sector.toLowerCase().includes(q) : false;
      const matchCity = p.city ? p.city.toLowerCase().includes(q) : false;
      return matchTitle || matchSector || matchCity;
    });
  }, [properties, propertySearchQuery]);

  if (!isOpen) return null;

  // Toggle de seleccion individual de propiedad
  const toggleSelectProperty = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Seleccionar todas las propiedades visibles
  const handleSelectAll = () => {
    const allVisibleIds = filteredProperties.map((p) => p.id);
    setSelectedPropertyIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
  };

  // Deseleccionar todas las propiedades
  const handleDeselectAll = () => {
    setSelectedPropertyIds([]);
  };

  // Cantidad efectiva a transferir
  const countToTransfer =
    transferMode === "ALL"
      ? properties.length
      : transferMode === "SELECTED"
      ? selectedPropertyIds.length
      : 0;

  // Validacion de boton de accion
  const canSubmit =
    Boolean(targetAgentId) &&
    transferMode !== null &&
    (transferMode === "ALL" || (transferMode === "SELECTED" && selectedPropertyIds.length > 0)) &&
    !isLoading;

  // Ejecucion de la transferencia en base de datos
  const handleTransfer = async () => {
    setErrorMessage(null);

    if (!targetAgentId) {
      setErrorMessage("Por favor busca y selecciona el asesor que recibirá las propiedades.");
      return;
    }

    if (!transferMode) {
      setErrorMessage("Por favor selecciona qué inmuebles deseas transferir.");
      return;
    }

    if (transferMode === "SELECTED" && selectedPropertyIds.length === 0) {
      setErrorMessage("Debes seleccionar al menos un inmueble para transferir.");
      return;
    }

    setIsLoading(true);
    try {
      await transferPropertiesAction({
        sourceAgentId: sourceAgent.id,
        targetAgentId,
        propertyIds: transferMode === "SELECTED" ? selectedPropertyIds : undefined,
      });

      router.refresh();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al transferir las propiedades.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 animate-in fade-in duration-100"
    >
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-[0.98] duration-100 ease-out transform-gpu">
        {/* Encabezado del Modal */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-orange-50/60 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-brand-primary font-heading">
                Transferir Cartera de Inmuebles
              </h2>
              <p className="text-xs text-text-secondary">
                Reasigna la titularidad comercial entre miembros del equipo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Mensaje de error si ocurre alguno */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bloques de Asesores dispuestos uno debajo del otro de forma independiente */}
          <div className="space-y-3.5">
            {/* 1. ASESOR DE ORIGEN (ACTUAL) */}
            <div className="p-4 rounded-2xl bg-neutral-50/90 border border-neutral-200/90 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                1. Asesor de Origen (Actual)
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0 border border-brand-primary/20 shadow-2xs">
                    {getInitials(sourceAgent.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-text-primary truncate">{sourceAgent.name}</h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-brand-accent block">
                    {properties.length} {properties.length === 1 ? "inmueble" : "inmuebles"}
                  </span>
                  {countToTransfer > 0 && (
                    <span className="text-[10px] text-text-secondary block">
                      Quedará con {properties.length - countToTransfer}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. ASESOR RECEPTOR (DESTINO) CON BUSCADOR DINÁMICO */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                targetAgent
                  ? "bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-500/20"
                  : "bg-orange-50/30 border-neutral-200/90"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block ${
                    targetAgent ? "text-emerald-800" : "text-brand-accent"
                  }`}
                >
                  2. Asesor Receptor (Destino)
                </span>

                {targetAgent && (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAgentId("");
                      setAgentSearchQuery("");
                    }}
                    className="text-[11px] font-extrabold text-brand-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
                    title="Buscar otro asesor"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Cambiar asesor</span>
                  </button>
                )}
              </div>

              {/* Si ya hay un asesor seleccionado: Tarjeta limpia con sus datos */}
              {targetAgent ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-300 shadow-2xs">
                      {getInitials(targetAgent.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-text-primary truncate">{targetAgent.name}</h3>
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-700 block">
                      {targetAgent.propertiesCount ?? 0} actuales
                    </span>
                    {countToTransfer > 0 && (
                      <span className="text-[10px] font-extrabold text-emerald-800 block">
                        ➔ Tendrá {(targetAgent.propertiesCount ?? 0) + countToTransfer} (+{countToTransfer})
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Si no hay asesor seleccionado: Buscador puro sin opciones predefinidas */
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={agentSearchQuery}
                      onChange={(e) => setAgentSearchQuery(e.target.value)}
                      placeholder="Escribe el nombre del asesor para buscar..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-text-primary placeholder:text-neutral-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all shadow-2xs"
                      autoFocus
                    />
                  </div>

                  {/* Resultados de búsqueda (Solo aparecen al escribir) */}
                  {!agentSearchQuery.trim() ? (
                    <p className="text-[11px] text-text-secondary px-1">
                      Comienza a escribir para buscar al asesor que recibirá los inmuebles.
                    </p>
                  ) : filteredTargetAgents.length === 0 ? (
                    <div className="py-3 px-3 text-center text-xs text-text-secondary bg-white rounded-xl border border-neutral-200/80">
                      No se encontró ningún asesor que coincida con &quot;{agentSearchQuery}&quot;.
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-0.5 border border-neutral-200/80 rounded-xl p-1 bg-white">
                      {filteredTargetAgents.map((candidate) => (
                        <button
                          key={candidate.id}
                          type="button"
                          onClick={() => {
                            setTargetAgentId(candidate.id);
                            setAgentSearchQuery("");
                          }}
                          className="w-full p-2.5 rounded-lg bg-neutral-50/60 hover:bg-orange-50/80 border border-transparent hover:border-brand-accent/40 flex items-center justify-between gap-2.5 transition-all cursor-pointer text-left group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-[11px] shrink-0 border border-brand-primary/20">
                              {getInitials(candidate.name)}
                            </div>
                            <div className="min-w-0 truncate">
                              <span className="font-bold text-xs text-text-primary group-hover:text-brand-accent block truncate">
                                {candidate.name}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-200/70 px-2 py-0.5 rounded-md shrink-0">
                            {candidate.propertiesCount ?? 0} inm. actuales
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selector de Modo de Transferencia (Ninguno seleccionado por defecto) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary block">
                ¿Qué inmuebles deseas transferir? <span className="text-red-500">*</span>
              </span>
              {transferMode === null && (
                <span className="text-[11px] font-bold text-brand-accent">
                  (Elige una opción)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opcion 1: Toda la cartera completa */}
              <button
                type="button"
                onClick={() => setTransferMode("ALL")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  transferMode === "ALL"
                    ? "bg-brand-primary/5 border-brand-primary ring-2 ring-brand-primary/20 shadow-xs"
                    : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    transferMode === "ALL"
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {transferMode === "ALL" && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-brand-primary">
                    Toda la cartera completa
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Transfiere todos los {properties.length} inmuebles asignados a este asesor.
                  </p>
                </div>
              </button>

              {/* Opcion 2: Inmuebles seleccionados */}
              <button
                type="button"
                onClick={() => setTransferMode("SELECTED")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  transferMode === "SELECTED"
                    ? "bg-brand-primary/5 border-brand-primary ring-2 ring-brand-primary/20 shadow-xs"
                    : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    transferMode === "SELECTED"
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {transferMode === "SELECTED" && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-brand-primary">
                    Seleccionar específicos
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Elige individualmente cuáles inmuebles transferir con casillas.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Lista interactiva con checkboxes sin sobrecarga de imagenes */}
          {transferMode === "SELECTED" && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Buscador interno de propiedades */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={propertySearchQuery}
                    onChange={(e) => setPropertySearchQuery(e.target.value)}
                    placeholder="Filtrar por título o sector..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-accent transition-all"
                  />
                </div>

                {/* Botones rapidos de seleccion */}
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="font-bold text-brand-primary">
                    {selectedPropertyIds.length} seleccionados
                  </span>
                  <span className="text-neutral-300">•</span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-brand-accent hover:underline font-bold cursor-pointer"
                  >
                    Todos
                  </button>
                  <span className="text-neutral-300">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-text-secondary hover:text-text-primary font-semibold cursor-pointer"
                  >
                    Ninguno
                  </button>
                </div>
              </div>

              {/* Contenedor con scroll para los inmuebles */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-neutral-200/90 rounded-2xl p-2 bg-neutral-50/50">
                {isLoadingProperties ? (
                  <div className="py-8 text-center flex items-center justify-center gap-2 text-xs text-text-secondary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cargando propiedades...
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-secondary">
                    No se encontraron inmuebles que coincidan con la búsqueda.
                  </div>
                ) : (
                  filteredProperties.map((prop) => {
                    const isSelected = selectedPropertyIds.includes(prop.id);
                    return (
                      <div
                        key={prop.id}
                        onClick={() => toggleSelectProperty(prop.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-white border-brand-accent shadow-xs ring-1 ring-brand-accent/20"
                            : "bg-white border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox Icon */}
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-brand-accent text-white"
                                : "text-neutral-300 hover:text-neutral-500"
                            }`}
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </div>

                          {/* Icono de Inmueble en lugar de imagen pesada */}
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand-accent flex items-center justify-center shrink-0 border border-orange-100/80">
                            <Building2 className="w-4 h-4" />
                          </div>

                          {/* Datos del Inmueble */}
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-text-primary truncate max-w-xs sm:max-w-md">
                              {prop.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-secondary">
                              <span className="font-extrabold text-brand-primary">
                                {formatCurrency(prop.price, prop.currency)}
                              </span>
                              <span>•</span>
                              <span className="capitalize">{prop.operationType === "SALE" ? "Venta" : "Alquiler"}</span>
                              {prop.sector && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{prop.sector}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Aviso informativo de confirmacion */}
          {targetAgent && transferMode !== null && countToTransfer > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in duration-100">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                Al confirmar, <strong>{countToTransfer} inmuebles</strong> pasarán inmediatamente a la cartera de{" "}
                <strong>{targetAgent.name}</strong>. En la web pública y en el panel administrativo se actualizará el contacto de forma instantánea.
              </p>
            </div>
          )}
        </div>

        {/* Pie de Accion del Modal */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-text-secondary font-semibold text-center sm:text-left">
            {transferMode === null ? (
              <span className="text-neutral-500">Paso 1: Busca al asesor receptor y elige modalidad</span>
            ) : (
              <>
                Total a transferir:{" "}
                <span className="font-extrabold text-brand-primary">
                  {countToTransfer} de {properties.length} inmuebles
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-text-primary text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleTransfer}
              disabled={!canSubmit}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-[#c94b21] hover:shadow-lg hover:shadow-brand-accent/25 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transfiriendo...</span>
                </>
              ) : !targetAgentId ? (
                <span>Busca Asesor Receptor</span>
              ) : transferMode === null ? (
                <span>Elige Modalidad</span>
              ) : transferMode === "SELECTED" && selectedPropertyIds.length === 0 ? (
                <span>Selecciona Inmuebles</span>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Confirmar Transferencia ({countToTransfer})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
