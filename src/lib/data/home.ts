import { prisma } from "@/lib/prisma";

// Obtiene la lista de sectores y ciudades disponibles directamente de la base de datos
export async function getCachedAvailableLocations(): Promise<string[]> {
  const locationRecords = await prisma.property.findMany({
    where: { status: "AVAILABLE" },
    select: { sector: true, city: true },
    distinct: ["sector", "city"],
  });

  const uniqueLocationsSet = new Set<string>();
  for (const item of locationRecords) {
    if (item.sector && item.sector.trim()) {
      uniqueLocationsSet.add(item.sector.trim());
    }
  }
  for (const item of locationRecords) {
    if (item.city && item.city.trim()) {
      uniqueLocationsSet.add(item.city.trim());
    }
  }
  return Array.from(uniqueLocationsSet);
}

// Obtiene el conteo total de asesores activos y los destacados para la portada
export async function getCachedHomeAgents(): Promise<{
  totalAgentsCount: number;
  activeAgents: Array<{
    id: string;
    name: string;
    phone: string | null;
    avatarUrl: string | null;
    position: string | null;
    _count: { properties: number };
  }>;
}> {
  const [totalAgentsCount, activeAgents] = await Promise.all([
    prisma.user.count({ where: { role: "AGENT", isActive: true } }),
    prisma.user.findMany({
      where: { role: "AGENT", isActive: true, featured: true },
      select: {
        id: true,
        name: true,
        phone: true,
        avatarUrl: true,
        position: true,
        _count: {
          select: { properties: true },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      take: 8,
    }),
  ]);

  return { totalAgentsCount, activeAgents };
}
