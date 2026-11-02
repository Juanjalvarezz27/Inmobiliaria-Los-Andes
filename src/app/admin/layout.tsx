import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMainContent } from "@/components/admin/AdminMainContent";

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
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-neutral-100 flex flex-col md:flex-row relative">
      <AdminSidebar user={user} />

      {/* Contenedor principal de vistas con scroll independiente y reset automatico al tope */}
      <AdminMainContent>{children}</AdminMainContent>
    </div>
  );
}
