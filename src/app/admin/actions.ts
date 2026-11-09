"use server";

import { prisma } from "@/lib/prisma";
import { loginUser, logoutUser, getCurrentUser } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { uploadToUploadThing } from "@/lib/uploadthing";
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

// Accion para eliminar propiedad
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

// Accion para crear un nuevo Asesor Inmobiliario (solo perfil de contacto, sin acceso al panel)
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
      featured: data.featured || false,
    },
  });

  revalidatePath("/");
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

  // Si se va a activar, validar que no se exceda el limite de 8
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

// Carga lazy de propiedades de un asesor para el modal de transferencia (evita over-fetching inicial)
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

  // Verificar existencia del asesor receptor
  const targetAgent = await prisma.user.findUnique({
    where: { id: targetAgentId },
    select: { id: true, name: true, role: true, isActive: true },
  });

  if (!targetAgent || targetAgent.role !== "AGENT") {
    throw new Error("El asesor destino seleccionado no es válido.");
  }

  // Construir condicion de actualizacion
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

// Accion para subir fotografia de asesor al CDN de UploadThing
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

  // Envio directo a UploadThing (cuenta de asesores)
  return await uploadToUploadThing(file, "agent");
}

// Accion para subir fotografia de inmueble al CDN de UploadThing
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

  // Envio balanceado entre cuentas de UploadThing con failover automatico
  return await uploadToUploadThing(file, "property");
}

// Accion para alternar estado destacado de un inmueble en portada
export async function togglePropertyFeaturedAction(
  id: string
): Promise<{ success: boolean; featured?: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    const property = await prisma.property.findUnique({
      where: { id },
      select: { featured: true },
    });

    if (!property) throw new Error("Inmueble no encontrado");

    const updated = await prisma.property.update({
      where: { id },
      data: { featured: !property.featured },
      select: { featured: true },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/propiedades");

    return { success: true, featured: updated.featured };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar estado destacado.";
    return { success: false, error: message };
  }
}


// Accion para actualizar el orden y visibilidad de las secciones de la vista inicial
export async function updateHomeSectionsAction(
  sections: import("@/lib/settings").HomeSectionConfig[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    const { saveHomeSectionsConfig } = await import("@/lib/settings");
    await saveHomeSectionsConfig(sections);

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al guardar el orden de las secciones.";
    return { success: false, error: message };
  }
}

// Accion para actualizar el orden secuencial de aparicion de inmuebles en el catalogo
export async function reorderPropertiesAction(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    if (orderedIds.length > 0) {
      // Sanitizacion estricta de CUIDs/IDs alfanumericos
      const safeEntries = orderedIds
        .filter((id) => /^[a-zA-Z0-9_-]+$/.test(id))
        .map((id, index) => `('${id}', ${index + 1})`);

      if (safeEntries.length > 0) {
        await prisma.$executeRawUnsafe(`
          UPDATE properties AS p
          SET "displayOrder" = v.new_order
          FROM (VALUES ${safeEntries.join(", ")}) AS v(id, new_order)
          WHERE p.id = v.id;
        `);
      }
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar el orden de los inmuebles.";
    return { success: false, error: message };
  }
}

// Accion para reordenar asesores de forma atomica para el slider del Home
export async function reorderAgentsAction(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    if (orderedIds.length > 0) {
      const safeEntries = orderedIds
        .filter((id) => /^[a-zA-Z0-9_-]+$/.test(id))
        .map((id, index) => `('${id}', ${index + 1})`);

      if (safeEntries.length > 0) {
        await prisma.$executeRawUnsafe(`
          UPDATE users AS u
          SET "displayOrder" = v.new_order
          FROM (VALUES ${safeEntries.join(", ")}) AS v(id, new_order)
          WHERE u.id = v.id;
        `);
      }
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/asesores");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar el orden de los asesores.";
    return { success: false, error: message };
  }
}

// Accion para mover directamente un inmueble a una posicion especifica
export async function movePropertyToPositionAction(
  propertyId: string,
  targetPosition: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    const all = await prisma.property.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true },
    });

    const currentIndex = all.findIndex((p) => p.id === propertyId);
    if (currentIndex === -1) throw new Error("Inmueble no encontrado");

    const clampedPos = Math.max(1, Math.min(targetPosition, all.length));
    const targetIndex = clampedPos - 1;

    if (currentIndex === targetIndex) return { success: true };

    const ids = all.map((p) => p.id);
    const [movedId] = ids.splice(currentIndex, 1);
    ids.splice(targetIndex, 0, movedId);

    const safeEntries = ids
      .filter((id) => /^[a-zA-Z0-9_-]+$/.test(id))
      .map((id, index) => `('${id}', ${index + 1})`);

    if (safeEntries.length > 0) {
      await prisma.$executeRawUnsafe(`
        UPDATE properties AS p
        SET "displayOrder" = v.new_order
        FROM (VALUES ${safeEntries.join(", ")}) AS v(id, new_order)
        WHERE p.id = v.id;
      `);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al reubicar el inmueble.";
    return { success: false, error: message };
  }
}

// Accion para restablecer el orden predeterminado de las secciones del home
export async function resetHomeSectionsAction(): Promise<{
  success: boolean;
  sections?: import("@/lib/settings").HomeSectionConfig[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    const { saveHomeSectionsConfig, DEFAULT_HOME_SECTIONS } = await import("@/lib/settings");
    await saveHomeSectionsConfig(DEFAULT_HOME_SECTIONS);

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, sections: DEFAULT_HOME_SECTIONS };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al restablecer las secciones.";
    return { success: false, error: message };
  }
}
