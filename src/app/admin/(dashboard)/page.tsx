import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

export const dynamic = "force-dynamic";

// Pagina principal de metricas, resumen y centro de control de la vista inicial (Home)
export default async function AdminDashboardPage() {
  await requireAuth();

  let allProperties: any[] = [];
  let allAgents: any[] = [];
  let fetchError: string | null = null;

  try {
    // Consulta optimizada: solo 2 peticiones con campos estrictos (ahorro de latencia y payload)
    const results = await Promise.all([
      prisma.property.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          operationType: true,
          propertyType: true,
          customPropertyType: true,
          status: true,
          price: true,
          currency: true,
          featured: true,
          displayOrder: true,
          city: true,
          sector: true,
          createdAt: true,
          agent: {
            select: {
              name: true,
            },
          },
          images: {
            orderBy: [{ isMain: "desc" }, { order: "asc" }],
            take: 1,
            select: { url: true },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: "AGENT", isActive: true },
        select: {
          id: true,
          name: true,
          position: true,
          avatarUrl: true,
          phone: true,
          featured: true,
          displayOrder: true,
          _count: {
            select: { properties: true },
          },
        },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      }),
    ]);
    allProperties = results[0];
    allAgents = results[1];
  } catch (error) {
    console.error("Error al obtener datos en /admin:", error);
    fetchError = "No se pudieron obtener los datos actualizados de la base de datos. Por favor recarga.";
  }

  // Metricas calculadas en memoria al instante (0 roundtrips adicionales)
  const metrics = {
    totalProperties: allProperties.length,
    saleProperties: allProperties.filter((p) => p.operationType === "SALE").length,
    rentProperties: allProperties.filter((p) => p.operationType === "RENT").length,
    availableProperties: allProperties.filter((p) => p.status === "AVAILABLE").length,
    reservedProperties: allProperties.filter((p) => p.status === "RESERVED").length,
    soldRentedProperties: allProperties.filter((p) => p.status === "SOLD" || p.status === "RENTED").length,
    totalAgents: allAgents.length,
    featuredPropertiesCount: allProperties.filter((p) => p.featured).length,
    featuredAgentsCount: allAgents.filter((a) => a.featured).length,
  };

  const serializedProperties = allProperties.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    operationType: p.operationType as "SALE" | "RENT",
    propertyType: p.propertyType,
    customPropertyType: p.customPropertyType,
    status: p.status,
    price: Number(p.price),
    currency: p.currency,
    featured: p.featured,
    displayOrder: p.displayOrder,
    city: p.city,
    sector: p.sector,
    coverUrl: p.images[0]?.url || null,
    agentName: p.agent?.name || "Inmobiliaria Los Andes",
    createdAt: p.createdAt.toISOString(),
  }));

  const serializedAgents = allAgents.map((a) => ({
    id: a.id,
    name: a.name,
    position: a.position,
    avatarUrl: a.avatarUrl,
    phone: a.phone,
    featured: a.featured,
    displayOrder: a.displayOrder,
    propertiesCount: a._count.properties,
  }));

  return (
    <div className="space-y-8 max-w-7xl pb-10">
      {/* Encabezado Ejecutivo con diseño andino */}
      <AdminPageHeader
        icon={LayoutDashboard}
        title="Panel de"
        titleHighlight="Control General"
        description="Supervisa el rendimiento de tu inventario inmobiliario y administra los elementos destacados del catálogo."
      />

      {/* Gestor Interactivo del Dashboard y Home Showcase */}
      <DashboardOverview
        metrics={metrics}
        properties={serializedProperties}
        agents={serializedAgents}
      />
    </div>
  );
}
