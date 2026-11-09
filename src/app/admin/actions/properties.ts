"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/slug";
import { revalidatePath } from "next/cache";
import type { OperationType, PropertyType, PropertyStatus } from "@/generated/prisma/client";

// Accion para crear propiedad con slug autogenerado y validacion de fotos
export async function createPropertyAction(data: {
  title: string;
  description: string;
  operationType: OperationType;
  propertyType: PropertyType;
  customPropertyType?: string | null;
  status: PropertyStatus;
  price: number;
  currency?: string;
  featured?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  areaSquareMeters?: number;
  lotSquareMeters?: number;
  yearBuilt?: number;
  address: string;
  city: string;
  sector?: string;
  googleMapsUrl?: string | null;
  amenities: string[];
  agentId: string;
  images: { url: string; caption?: string; isMain: boolean; order: number }[];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  if (data.images && data.images.length > 8) {
    throw new Error("No se permiten más de 8 fotografías por propiedad.");
  }

  const baseSlug = generateSlug(data.title);
  const uniqueSuffix = Math.random().toString(36).substring(2, 6);
  const slug = `${baseSlug}-${uniqueSuffix}`;

  await prisma.property.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      operationType: data.operationType,
      propertyType: data.propertyType,
      customPropertyType: data.propertyType === "OTHER" ? data.customPropertyType?.trim() || null : null,
      status: data.status || "AVAILABLE",
      price: data.price,
      currency: data.currency || "USD",
      featured: data.featured || false,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      parkingSpots: data.parkingSpots,
      areaSquareMeters: data.areaSquareMeters,
      lotSquareMeters: data.lotSquareMeters,
      yearBuilt: data.yearBuilt,
      address: data.address,
      city: data.city || "Trujillo Capital",
      sector: data.sector,
      googleMapsUrl: data.googleMapsUrl ? data.googleMapsUrl.trim() : null,
      amenities: data.amenities || [],
      agentId: data.agentId,
      images: {
        create: data.images.map((img, idx) => ({
          url: img.url,
          caption: img.caption,
          isMain: img.isMain ?? idx === 0,
          order: idx,
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/propiedades");
  revalidatePath("/admin/asesores");
  if (data.agentId) {
    revalidatePath(`/admin/asesores/${data.agentId}`);
  }
  return { success: true };
}

// Accion para editar propiedad existente y actualizar imagenes asociadas
export async function updatePropertyAction(
  id: string,
  data: {
    title: string;
    description: string;
    operationType: OperationType;
    propertyType: PropertyType;
    customPropertyType?: string | null;
    status: PropertyStatus;
    price: number;
    currency?: string;
    featured?: boolean;
    bedrooms?: number;
    bathrooms?: number;
    parkingSpots?: number;
    areaSquareMeters?: number;
    lotSquareMeters?: number;
    yearBuilt?: number;
    address: string;
    city: string;
    sector?: string;
    googleMapsUrl?: string | null;
    amenities: string[];
    agentId: string;
    images: { url: string; caption?: string; isMain: boolean; order: number }[];
  }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  if (data.images && data.images.length > 8) {
    throw new Error("No se permiten más de 8 fotografías por propiedad.");
  }

  await prisma.propertyImage.deleteMany({
    where: { propertyId: id },
  });

  const updatedProperty = await prisma.property.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      operationType: data.operationType,
      propertyType: data.propertyType,
      customPropertyType: data.propertyType === "OTHER" ? data.customPropertyType?.trim() || null : null,
      status: data.status,
      price: data.price,
      currency: data.currency || "USD",
      featured: data.featured,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      parkingSpots: data.parkingSpots,
      areaSquareMeters: data.areaSquareMeters,
      lotSquareMeters: data.lotSquareMeters,
      yearBuilt: data.yearBuilt,
      address: data.address,
      city: data.city,
      sector: data.sector,
      googleMapsUrl: data.googleMapsUrl ? data.googleMapsUrl.trim() : null,
      amenities: data.amenities,
      agentId: data.agentId,
      images: {
        create: data.images.map((img, idx) => ({
          url: img.url,
          caption: img.caption,
          isMain: img.isMain,
          order: idx,
        })),
      },
    },
    select: { slug: true },
  });

  revalidatePath("/");
  revalidatePath(`/propiedades/${updatedProperty.slug}`);
  revalidatePath("/admin/propiedades");
  revalidatePath("/admin/asesores");
  if (data.agentId) {
    revalidatePath(`/admin/asesores/${data.agentId}`);
  }
  return { success: true };
}

// Accion para eliminar propiedad con limpieza en cascada
export async function deletePropertyAction(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  const prop = await prisma.property.findUnique({
    where: { id },
    select: { slug: true },
  });

  await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
  await prisma.inquiry.deleteMany({ where: { propertyId: id } });
  await prisma.property.delete({ where: { id } });

  revalidatePath("/");
  if (prop?.slug) {
    revalidatePath(`/propiedades/${prop.slug}`);
  }
  revalidatePath("/admin/propiedades");
  return { success: true };
}

