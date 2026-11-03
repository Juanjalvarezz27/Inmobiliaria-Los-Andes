"use server";

import { prisma } from "@/lib/prisma";
import { loginUser, logoutUser, getCurrentUser } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
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

// Accion para editar propiedad
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

  await prisma.property.update({
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
  });

  revalidatePath("/");
  revalidatePath("/admin/propiedades");
  revalidatePath("/admin/asesores");
  if (data.agentId) {
    revalidatePath(`/admin/asesores/${data.agentId}`);
  }
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

// Accion para crear un nuevo Asesor Inmobiliario (solo perfil de contacto, sin acceso al panel)
export async function createAgentAction(data: {
  name: string;
  email: string;
  phone: string;
  position?: string;
  instagram?: string;
  avatarUrl?: string;
  isActive: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  // Los asesores son perfiles de contacto y no tienen credenciales de acceso al sistema
  const passwordHash = await bcrypt.hash(crypto.randomUUID() + "-" + Date.now(), 10);

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
    position?: string;
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
      ...(data.position ? { position: data.position } : {}),
      instagram: data.instagram,
      avatarUrl: data.avatarUrl,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/asesores");
  return { success: true };
}

// Accion para alternar el estado activo o inactivo de un asesor
export async function toggleAgentStatusAction(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  const agent = await prisma.user.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });

  if (!agent) throw new Error("Asesor no encontrado");

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !agent.isActive },
  });

  revalidatePath("/admin/asesores");
  revalidatePath(`/admin/asesores/${id}`);
  revalidatePath("/admin/propiedades");
  revalidatePath("/admin/propiedades/nueva");

  return { success: true, isActive: updated.isActive };
}

// Accion para subir fotografia de asesor al servidor
export async function uploadAvatarAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No se seleccionó ningún archivo." };

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "El archivo debe ser una imagen válida (PNG, JPG, WEBP)." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "La imagen no debe superar los 5MB." };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const uniqueName = `agent-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "agents");

  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDir, uniqueName), buffer);

  return { success: true, url: `/uploads/agents/${uniqueName}` };
}

// Accion para subir fotografia de inmueble al servidor
export async function uploadPropertyImageAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No se seleccionó ningún archivo." };

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "El archivo debe ser una imagen válida (PNG, JPG, WEBP)." };
  }

  if (file.size > 15 * 1024 * 1024) {
    return { success: false, error: "La imagen no debe superar los 15MB." };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const uniqueName = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");

  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDir, uniqueName), buffer);

  return { success: true, url: `/uploads/properties/${uniqueName}` };
}
