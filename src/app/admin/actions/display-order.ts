"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { HomeSectionConfig } from "@/lib/settings";

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

// Accion para actualizar el orden y visibilidad de las secciones del inicio
export async function updateHomeSectionsAction(
  sections: HomeSectionConfig[]
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
  sections?: HomeSectionConfig[];
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

