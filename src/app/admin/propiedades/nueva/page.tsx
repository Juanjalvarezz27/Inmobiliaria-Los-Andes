import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/admin/PropertyForm";

interface PageProps {
  searchParams: Promise<{ agentId?: string }>;
}

// Pagina para crear una nueva propiedad en el panel administrativo
export default async function NewPropertyPage({ searchParams }: PageProps) {
  const { agentId } = await searchParams;

  const agents = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, position: true, avatarUrl: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="py-2">
      <PropertyForm agents={agents} defaultAgentId={agentId} />
    </div>
  );
}

