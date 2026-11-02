import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { AgentManager, AgentItem } from "@/components/admin/AgentManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

// Vista principal para la gestion de Asesores Inmobiliarios
export default async function AdminAgentsPage() {
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
      createdAt: true,
      _count: {
        select: {
          properties: true,
        },
      },
      properties: {
        select: {
          id: true,
          price: true,
          status: true,
          operationType: true,
        },
      },
    },
  });

  // Mapeo seguro para Client Components evitando objetos complejos de base de datos
  const serializedAgents: AgentItem[] = agents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email,
    phone: agent.phone,
    position: agent.position,
    instagram: agent.instagram,
    avatarUrl: agent.avatarUrl,
    isActive: agent.isActive,
    createdAt: agent.createdAt.toISOString(),
    propertiesCount: agent._count.properties,
    activePropertiesCount: agent.properties.filter(
      (p) => p.status === "AVAILABLE" || p.status === "RESERVED"
    ).length,
    forSaleCount: agent.properties.filter(
      (p) => p.operationType === "SALE" && (p.status === "AVAILABLE" || p.status === "RESERVED")
    ).length,
    forRentCount: agent.properties.filter(
      (p) => p.operationType === "RENT" && (p.status === "AVAILABLE" || p.status === "RESERVED")
    ).length,
    portfolioValue: agent.properties.reduce(
      (sum, p) => sum + Number(p.price || 0),
      0
    ),
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
