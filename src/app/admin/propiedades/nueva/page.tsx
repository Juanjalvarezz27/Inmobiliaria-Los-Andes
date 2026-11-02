import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/admin/PropertyForm";

// Pagina para crear una nueva propiedad en el panel administrativo
export default async function NewPropertyPage() {
  const agents = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, position: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="py-2">
      <PropertyForm agents={agents} />
    </div>
  );
}

