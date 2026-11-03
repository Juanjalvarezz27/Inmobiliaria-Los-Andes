"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
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
} from "lucide-react";
import { transferPropertiesAction } from "@/app/admin/actions";
import { CustomSelect, CustomSelectOption } from "@/components/admin/CustomSelect";
import { formatCurrency } from "@/lib/utils/format";

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
}

// Modal interactivo para reasignar y transferir cartera inmobiliaria entre asesores
export function TransferPropertiesModal({
  isOpen,
  onClose,
  sourceAgent,
  properties,
  availableAgents,
  onSuccess,
}: TransferPropertiesModalProps) {
  const router = useRouter();
  const [targetAgentId, setTargetAgentId] = useState<string>("");
  const [transferMode, setTransferMode] = useState<"ALL" | "SELECTED">("ALL");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [propertySearchQuery, setPropertySearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Opciones de asesores de destino excluyendo al asesor de origen
  const targetAgentOptions: CustomSelectOption[] = useMemo(() => {
    return availableAgents
      .filter((agent) => agent.id !== sourceAgent.id)
      .map((agent) => ({
        value: agent.id,
        label: agent.name,
        description: agent.position || "Asesor Inmobiliario",
        icon: agent.avatarUrl ? (
          <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-neutral-200">
            <Image src={agent.avatarUrl} alt="" fill sizes="24px" className="object-cover" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-neutral-500" />
          </div>
        ),
      }));
  }, [availableAgents, sourceAgent.id]);

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

  // Toggle de seleccion individual
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
    transferMode === "ALL" ? properties.length : selectedPropertyIds.length;

  const targetAgent = availableAgents.find((a) => a.id === targetAgentId);

  // Ejecucion de la transferencia en base de datos
  const handleTransfer = async () => {
    setErrorMessage(null);

    if (!targetAgentId) {
      setErrorMessage("Por favor selecciona el asesor que recibirá las propiedades.");
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Encabezado del Modal */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-orange-50/60 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-brand-primary font-heading">
                Transferir Cartera de Inmuebles
              </h2>
              <p className="text-xs text-text-secondary">
                Reasigna inmuebles de un asesor a otro de forma masiva o selectiva.
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Mensaje de error si ocurre alguno */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Comparativa visual: Asesor Origen y Asesor Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Asesor Origen (Fijo) */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
                Asesor de Origen (Actual)
              </span>
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-neutral-200 shrink-0 border border-neutral-300">
                  {sourceAgent.avatarUrl ? (
                    <Image
                      src={sourceAgent.avatarUrl}
                      alt={sourceAgent.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 m-auto text-neutral-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-text-primary truncate">{sourceAgent.name}</h3>
                  <p className="text-xs text-text-secondary truncate">
                    {sourceAgent.position || "Asesor Inmobiliario"}
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-bold text-brand-accent">
                    {properties.length} inmuebles en cartera
                  </span>
                </div>
              </div>
            </div>

            {/* Asesor Destino (Selector) */}
            <div className="p-4 rounded-2xl bg-orange-50/40 border border-brand-accent/20 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent block">
                Nuevo Asesor Receptor (Destino)
              </span>
              <CustomSelect
                value={targetAgentId}
                onChange={(val) => setTargetAgentId(val)}
                options={targetAgentOptions}
                placeholder="Seleccionar asesor receptor..."
                searchable
                searchPlaceholder="Buscar por nombre o cargo..."
                emptySearchMessage="No hay otros asesores disponibles"
                size="sm"
                dropdownClassName="w-full sm:w-80 shadow-2xl"
              />
            </div>
          </div>

          {/* Selector de Modo de Transferencia */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-text-primary block">
              ¿Qué inmuebles deseas transferir?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opcion: Toda la cartera */}
              <button
                type="button"
                onClick={() => setTransferMode("ALL")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  transferMode === "ALL"
                    ? "bg-brand-primary/5 border-brand-primary ring-2 ring-brand-primary/20"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    transferMode === "ALL"
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-neutral-300"
                  }`}
                >
                  {transferMode === "ALL" && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-brand-primary">
                    Toda la cartera completa
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Transfiere todos los {properties.length} inmuebles asignados a este asesor de una sola vez.
                  </p>
                </div>
              </button>

              {/* Opcion: Inmuebles seleccionados */}
              <button
                type="button"
                onClick={() => setTransferMode("SELECTED")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  transferMode === "SELECTED"
                    ? "bg-brand-primary/5 border-brand-primary ring-2 ring-brand-primary/20"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    transferMode === "SELECTED"
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-neutral-300"
                  }`}
                >
                  {transferMode === "SELECTED" && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-brand-primary">
                    Seleccionar específicos
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Elige individualmente cuáles inmuebles transferir y cuáles conservar.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Lista interactiva con checkboxes si se eligio modo especifico */}
          {transferMode === "SELECTED" && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Buscador interno de propiedades */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-brand-accent hover:underline font-bold cursor-pointer"
                  >
                    Seleccionar todos
                  </button>
                  <span className="text-neutral-300">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-text-secondary hover:text-text-primary font-semibold cursor-pointer"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Contenedor con scroll para los inmuebles */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-neutral-200/90 rounded-2xl p-2 bg-neutral-50/50">
                {filteredProperties.length === 0 ? (
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

                          {/* Imagen Miniatura */}
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                            {prop.coverImage ? (
                              <Image src={prop.coverImage} alt="" fill sizes="48px" className="object-cover" />
                            ) : (
                              <Building2 className="w-5 h-5 m-auto text-neutral-400" />
                            )}
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
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Al confirmar, los <strong>{countToTransfer} inmuebles</strong> pasarán inmediatamente a estar a nombre de{" "}
              <strong>{targetAgent?.name || "el asesor seleccionado"}</strong>. Los enlaces públicos y los datos de contacto se actualizarán al instante.
            </p>
          </div>
        </div>

        {/* Pie de Accion del Modal */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-text-secondary font-semibold text-center sm:text-left">
            Total a transferir:{" "}
            <span className="font-extrabold text-brand-primary">
              {countToTransfer} de {properties.length} inmuebles
            </span>
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
              disabled={isLoading || !targetAgentId || countToTransfer === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-[#c94b21] hover:shadow-lg hover:shadow-brand-accent/25 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transfiriendo...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Transferir {countToTransfer} Inmuebles</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

