import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { AgentManager, AgentItem } from "@/components/admin/AgentManager";

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
    <div className="space-y-6">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/15 flex items-center justify-center text-brand-primary shrink-0 shadow-xs">
          <Users className="w-6 h-6 text-brand-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight font-heading">
          Equipo de Asesores Inmobiliarios
        </h1>
      </div>

      <AgentManager agents={serializedAgents} />
    </div>
  );
}
