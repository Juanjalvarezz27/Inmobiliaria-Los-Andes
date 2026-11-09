import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { PropertiesManager, SerializedAdminProperty } from "@/components/admin/PropertiesManager";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ nuevo?: string; crear?: string }>;
}

// Vista de gestion y listado de propiedades con modal integrado
export default async function AdminPropertiesPage({ searchParams }: PageProps) {
  await requireAuth();

  const resolvedParams = await searchParams;
  const initialOpenModal = resolvedParams.nuevo === "true" || resolvedParams.crear === "true";

  const [properties, agents] = await Promise.all([
    prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        agent: {
          select: { id: true, name: true, position: true, avatarUrl: true, isActive: true },
        },
        images: {
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "AGENT", isActive: true },
      select: { id: true, name: true, position: true, avatarUrl: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serializacion para Client Components eliminando instancias de Prisma Decimal
  const serializedProperties: SerializedAdminProperty[] = properties.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    operationType: p.operationType,
    propertyType: p.propertyType,
    customPropertyType: p.customPropertyType,
    status: p.status,
    price: Number(p.price),
    currency: p.currency,
    featured: p.featured,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    parkingSpots: p.parkingSpots,
    areaSquareMeters: p.areaSquareMeters ? Number(p.areaSquareMeters) : null,
    lotSquareMeters: p.lotSquareMeters ? Number(p.lotSquareMeters) : null,
    yearBuilt: p.yearBuilt,
    city: p.city,
    sector: p.sector,
    address: p.address,
    googleMapsUrl: p.googleMapsUrl,
    amenities: p.amenities,
    agentId: p.agentId,
    agent: p.agent
      ? {
          id: p.agent.id,
          name: p.agent.name,
          position: p.agent.position,
          avatarUrl: p.agent.avatarUrl,
        }
      : null,
    images: p.images.map((img) => ({
      id: img.id,
      url: img.url,
      caption: img.caption,
      isMain: img.isMain,
      order: img.order,
    })),
  }));

  return (
    <PropertiesManager
      properties={serializedProperties}
      agents={agents}
      initialOpenModal={initialOpenModal}
    />
  );
}
