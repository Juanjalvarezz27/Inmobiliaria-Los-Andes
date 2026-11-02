"use client";

import { useState, useTransition } from "react";
import { deletePropertyAction } from "@/app/admin/actions";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// Boton de eliminacion con modal de confirmacion y transicion de estado
export function DeletePropertyButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deletePropertyAction(id);
      setShowConfirm(false);
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

