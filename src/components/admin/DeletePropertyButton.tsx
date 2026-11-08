"use client";

import { useState, useTransition } from "react";
import { deletePropertyAction } from "@/app/admin/actions";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "sonner";

// Boton de eliminacion con modal de confirmacion y soporte para eliminacion optimista
export function DeletePropertyButton({
  id,
  title,
  onDeleted,
}: {
  id: string;
  title: string;
  onDeleted?: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // Si hay callback optimista, cierra modal y remueve de la lista al instante (0ms)
    if (onDeleted) {
      onDeleted(id);
      setShowConfirm(false);
    }
    startTransition(async () => {
      try {
        await deletePropertyAction(id);
        if (!onDeleted) {
          toast.success("Inmueble eliminado correctamente");
          setShowConfirm(false);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al eliminar el inmueble.";
        toast.error("Error al eliminar", { description: msg });
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        title="Eliminar Inmueble"
        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isPending}
        variant="danger"
        title="Eliminar Inmueble"
        description="¿Estás seguro de que deseas eliminar permanentemente esta propiedad? Esta acción no se puede deshacer."
        itemHighlight={title}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}

