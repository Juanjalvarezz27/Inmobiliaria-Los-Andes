import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMainContent } from "@/components/admin/AdminMainContent";
import { AdminAtmosphereBackground } from "@/components/admin/AdminAtmosphereBackground";

export const dynamic = "force-dynamic";

// Layout principal para el panel administrativo privado con proteccion estricta de rutas
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // Si es la ruta publica de login, renderiza el formulario standalone
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // En cualquier otra ruta administrativa, exige autenticacion estricta o redirige
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F4EDE2] to-[#EAE0D3] flex flex-col md:flex-row relative isolate">
      {/* Fondo atmosferico beige andino con destellos calidos naranja */}
      <AdminAtmosphereBackground />

      <AdminSidebar user={user} />

      {/* Contenedor principal de vistas con scroll independiente y reset automatico al tope */}
      <AdminMainContent>{children}</AdminMainContent>
    </div>
  );
}
