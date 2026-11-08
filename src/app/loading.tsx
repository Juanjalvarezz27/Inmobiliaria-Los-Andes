import React from "react";

// Estado de carga instantaneo para navegacion publica
export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col justify-center items-center py-20 animate-pulse">
      <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center mb-4">
        <div className="w-8 h-8 rounded-full border-3 border-brand-accent border-t-transparent animate-spin" />
      </div>
      <div className="h-4 w-40 bg-neutral-200/80 rounded-md mb-2" />
      <div className="h-3 w-64 bg-neutral-200/50 rounded-md" />
    </div>
  );
}

