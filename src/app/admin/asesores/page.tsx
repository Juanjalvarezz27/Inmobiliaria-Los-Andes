import { prisma } from "@/lib/prisma";
import { AgentManager } from "@/components/admin/AgentManager";

// Vista CRUD para la gestion de Asesores Inmobiliarios
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
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-primary tracking-tight">
          Asesores Inmobiliarios
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Gestiona el equipo de ventas, contactos de WhatsApp y perfiles de asesores.
        </p>
      </div>

      <AgentManager agents={agents} />
    </div>
  );
}

