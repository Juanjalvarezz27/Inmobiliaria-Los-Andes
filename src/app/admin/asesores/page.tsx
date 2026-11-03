import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Users } from "lucide-react";
import { AgentManager, AgentItem } from "@/components/admin/AgentManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

// Vista principal para la gestion de Asesores Inmobiliarios
export default async function AdminAgentsPage() {
  await requireAuth();

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
          title: true,
          price: true,
          currency: true,
          status: true,
          operationType: true,
          city: true,
          sector: true,
          images: {
            orderBy: { order: "asc" },
            take: 1,
            select: { url: true },
          },
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
    propertiesList: agent.properties.map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      currency: p.currency,
      status: p.status,
      operationType: p.operationType,
      city: p.city,
      sector: p.sector,
      coverImage: p.images[0]?.url || null,
    })),
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
