import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Mapa de sitio XML dinámico generado con todas las propiedades activas
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://inmobiliarialosandes.com");

  let propertyEntries: MetadataRoute.Sitemap = [];

  try {
    const properties = await prisma.property.findMany({
      where: {
        status: { in: ["AVAILABLE", "RESERVED"] },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    propertyEntries = properties.map((p) => ({
      url: `${baseUrl}/propiedades/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    propertyEntries = [];
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...propertyEntries,
  ];
}

