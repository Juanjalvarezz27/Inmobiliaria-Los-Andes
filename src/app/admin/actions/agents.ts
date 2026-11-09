"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Accion para crear un nuevo Asesor Inmobiliario
export async function createAgentAction(data: {
  name: string;
  email: string;
  phone: string;
  position?: string;
  instagram?: string;
  avatarUrl?: string;
  isActive: boolean;
  featured?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  // Validar limite de 8 destacados en el Home
  if (data.featured) {
    const currentFeatured = await prisma.user.count({
      where: { role: "AGENT", isActive: true, featured: true },
    });
    if (currentFeatured >= 8) {
      throw new Error("Máximo 8 asesores en el Home. Desmarca uno primero.");
    }
  }

  // Generar hash dummy porque los asesores son perfiles comerciales sin acceso directo
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
      featured: data.featured || false,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/asesores");
  return { success: true };
}

// Accion para actualizar un Asesor Inmobiliario existente
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
    featured?: boolean;
  }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  // Validar limite de 8 destacados excluyendo al asesor actual
  if (data.featured) {
    const currentFeatured = await prisma.user.count({
      where: { role: "AGENT", isActive: true, featured: true, NOT: { id } },
    });
    if (currentFeatured >= 8) {
      throw new Error("Máximo 8 asesores en el Home. Desmarca uno primero.");
    }
  }

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
      ...(typeof data.featured === "boolean" ? { featured: data.featured } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/asesores");
  revalidatePath(`/admin/asesores/${id}`);
  return { success: true };
}

// Accion para alternar si un asesor esta destacado en el Home publico (limite: 8)
export async function toggleAgentFeaturedAction(
  id: string
): Promise<{ success: boolean; featured?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  const agent = await prisma.user.findUnique({
    where: { id },
    select: { id: true, featured: true, isActive: true },
  });

  if (!agent) return { success: false, error: "Asesor no encontrado." };

  if (!agent.featured) {
    const currentFeatured = await prisma.user.count({
      where: { role: "AGENT", isActive: true, featured: true },
    });

    if (currentFeatured >= 8) {
      return {
        success: false,
        error: "Desmarca un asesor antes de agregar otro.",
      };
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { featured: !agent.featured },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/asesores");
  revalidatePath(`/admin/asesores/${id}`);

  return { success: true, featured: updated.featured };
}

// Carga lazy de propiedades de un asesor para el modal de transferencia
export async function getAgentPropertiesForTransferAction(agentId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  const properties = await prisma.property.findMany({
    where: { agentId },
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      status: true,
      operationType: true,
      city: true,
      sector: true,
      images: {
        orderBy: { order: "asc" },
        take: 1,
        select: { url: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return properties.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    currency: p.currency,
    status: p.status,
    operationType: p.operationType,
    city: p.city,
    sector: p.sector,
    coverImage: p.images[0]?.url || null,
  }));
}

// Accion para transferir cartera de inmuebles entre asesores
export async function transferPropertiesAction(params: {
  sourceAgentId: string;
  targetAgentId: string;
  propertyIds?: string[];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");

  const { sourceAgentId, targetAgentId, propertyIds } = params;

  if (sourceAgentId === targetAgentId) {
    throw new Error("El asesor de origen y destino no pueden ser el mismo.");
  }

  const targetAgent = await prisma.user.findUnique({
    where: { id: targetAgentId },
    select: { id: true, name: true, role: true, isActive: true },
  });

  if (!targetAgent || targetAgent.role !== "AGENT") {
    throw new Error("El asesor destino seleccionado no es válido.");
  }

  const whereClause: { agentId: string; id?: { in: string[] } } = {
    agentId: sourceAgentId,
  };

  if (propertyIds && propertyIds.length > 0) {
    whereClause.id = { in: propertyIds };
  }

  const result = await prisma.property.updateMany({
    where: whereClause,
    data: {
      agentId: targetAgentId,
    },
  });

  revalidatePath("/admin/asesores");
  revalidatePath(`/admin/asesores/${sourceAgentId}`);
  revalidatePath(`/admin/asesores/${targetAgentId}`);
  revalidatePath("/admin/propiedades");
  revalidatePath("/admin");

  return { success: true, count: result.count };
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

