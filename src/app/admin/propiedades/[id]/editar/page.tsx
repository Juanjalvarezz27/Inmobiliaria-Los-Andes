import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/admin/PropertyForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Pagina para editar una propiedad existente
export default async function EditPropertyPage({ params }: PageProps) {
  await requireAuth();
  const { id } = await params;

  const [property, agents] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, position: true, avatarUrl: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <div className="py-2">
      <PropertyForm initialData={property} agents={agents} isEditing={true} />
    </div>
  );
}

