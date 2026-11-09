import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Users } from "lucide-react";
import { AgentManager, AgentItem } from "@/components/admin/AgentManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

// Vista principal para la gestion de Asesores Inmobiliarios
export default async function AdminAgentsPage() {
  await requireAuth();

  // Query liviana: solo conteos agregados, sin payload de propiedades completas
  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      position: true,
      instagram: true,
      avatarUrl: true,
      isActive: true,
      featured: true,
      createdAt: true,
      _count: {
        select: { properties: true },
      },
      // Solo propiedades activas con campos minimos para estadisticas y valor de cartera
      properties: {
        where: { status: { in: ["AVAILABLE", "RESERVED"] } },
        select: { operationType: true, price: true },
      },
    },
  });

  // Mapeo seguro para Client Components — propertiesList se carga lazy al abrir modal
  const serializedAgents: AgentItem[] = agents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email,
    phone: agent.phone,
    position: agent.position,
    instagram: agent.instagram,
    avatarUrl: agent.avatarUrl,
    isActive: agent.isActive,
    featured: agent.featured,
    createdAt: agent.createdAt.toISOString(),
    propertiesCount: agent._count.properties,
    activePropertiesCount: agent.properties.length,
    forSaleCount: agent.properties.filter((p) => p.operationType === "SALE").length,
    forRentCount: agent.properties.filter((p) => p.operationType === "RENT").length,
    portfolioValue: agent.properties.reduce((sum, p) => sum + Number(p.price || 0), 0),
    // Sin propertiesList — se obtiene lazy via getAgentPropertiesForTransferAction
  }));

  return (
    <div className="space-y-7">
      <AdminPageHeader
        icon={Users}
        title="Equipo de"
        titleHighlight="Asesores Inmobiliarios"
        description="Supervisa la disponibilidad, rendimiento y carteras de captación asignadas al equipo de ventas."
      />

      <AgentManager agents={serializedAgents} />
    </div>
  );
}
