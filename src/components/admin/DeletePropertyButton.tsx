"use client";

import { useTransition } from "react";
import { deletePropertyAction } from "@/app/admin/actions";
import { Trash2 } from "lucide-react";

// Boton de eliminacion con confirmacion y transicion optimista
export function DeletePropertyButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`¿Está seguro de eliminar la propiedad "${title}"? Esta acción no se puede deshacer.`)) {
      startTransition(async () => {
        await deletePropertyAction(id);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title="Eliminar Inmueble"
      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

