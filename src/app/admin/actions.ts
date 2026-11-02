"use server";

import { prisma } from "@/lib/prisma";
import { loginUser, logoutUser, getCurrentUser } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { OperationType, PropertyType, PropertyStatus } from "@/generated/prisma/client";

// Accion de inicio de sesion
export async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | never> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor ingrese su correo y contraseña." };
  }

  const result = await loginUser(email, password);
  if (!result.success) {
    return { error: result.error || "Error al autenticar." };
  }

  redirect("/admin");
}

// Accion de cierre de sesion
export async function logoutAction() {
  await logoutUser();
  redirect("/admin/login");
}

// Accion para crear propiedad
export async function createPropertyAction(data: {
  title: string;
  description: string;
  operationType: OperationType;
  propertyType: PropertyType;
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
  amenities: string[];
  agentId: string;
  images: { url: string; caption?: string; isMain: boolean; order: number }[];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

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
  return { success: true };
}

// Accion para editar propiedad
export async function updatePropertyAction(
  id: string,
  data: {
    title: string;
    description: string;
    operationType: OperationType;
    propertyType: PropertyType;
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
    amenities: string[];
    agentId: string;
    images: { url: string; caption?: string; isMain: boolean; order: number }[];
  }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  await prisma.propertyImage.deleteMany({
    where: { propertyId: id },
  });

  await prisma.property.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      operationType: data.operationType,
      propertyType: data.propertyType,
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
  });

  revalidatePath("/");
  revalidatePath("/admin/propiedades");
  return { success: true };
}

// Accion para eliminar propiedad
export async function deletePropertyAction(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
  await prisma.inquiry.deleteMany({ where: { propertyId: id } });
  await prisma.property.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/propiedades");
  return { success: true };
}

// Accion para crear un nuevo Asesor Inmobiliario
export async function createAgentAction(data: {
  name: string;
  email: string;
  password?: string;
  phone: string;
  position: string;
  instagram?: string;
  avatarUrl?: string;
  isActive: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  const passwordHash = await bcrypt.hash(data.password || "Asesor123*", 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash,
      phone: data.phone,
      position: data.position || "Asesor Inmobiliario",
      instagram: data.instagram,
      avatarUrl:
        data.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      role: "AGENT",
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/asesores");
  return { success: true };
}

// Accion para actualizar un Asesor Inmobiliario
export async function updateAgentAction(
  id: string,
  data: {
    name: string;
    email: string;
    phone: string;
    position: string;
    instagram?: string;
    avatarUrl?: string;
    isActive: boolean;
  }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      position: data.position,
      instagram: data.instagram,
      avatarUrl: data.avatarUrl,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/asesores");
  return { success: true };
}
