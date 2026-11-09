import React from "react";

// Fondo atmosferico andino optimizado con gradientes CSS nativos (0% impacto de GPU, sin mascaras ni desenfoques pesados)
export function AdminAtmosphereBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F3ECE0] to-[#EBE0D2]"
    >
      {/* Resplandores ambientales calidos nativos sin filtros de desenfoque */}
      <div className="absolute -top-32 -right-32 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(242,116,65,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 -left-32 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(217,179,130,0.10)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(242,116,65,0.06)_0%,transparent_70%)] pointer-events-none" />
    </div>
  );
}
