import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

// Layout principal para el panel administrativo privado
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Si no hay usuario autenticado (ej. en la ruta de login), renderiza solo el contenido
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row relative">
      <AdminSidebar user={user} />

      {/* Contenedor principal de vistas */}
      <main className="flex-1 min-w-0 p-6 sm:p-10 overflow-y-auto transition-all duration-300">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
