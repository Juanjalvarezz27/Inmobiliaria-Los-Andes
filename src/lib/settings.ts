import { prisma } from "@/lib/prisma";

export interface HomeSectionConfig {
  id: "hero" | "banner" | "catalog" | "agents" | "trust";
  name: string;
  description: string;
  visible: boolean;
  order: number;
}

export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  {
    id: "hero",
    name: "Hero con Buscador y Carrusel Dinámico",
    description: "Buscador interactivo con autocompletado y fotografías dinámicas de inmuebles de fondo.",
    visible: true,
    order: 1,
  },
  {
    id: "banner",
    name: "Franja de Estadísticas del Catálogo",
    description: "Contador de inmuebles, asesores activos y mensaje institucional.",
    visible: true,
    order: 2,
  },
  {
    id: "catalog",
    name: "Catálogo Principal de Inmuebles",
    description: "Grilla de propiedades disponibles, ordenadas con destacadas primero y paginación.",
    visible: true,
    order: 3,
  },
  {
    id: "agents",
    name: "Asesores Inmobiliarios Destacados",
    description: "Vitrina de asesores oficiales seleccionados con enlace directo a WhatsApp.",
    visible: true,
    order: 4,
  },
  {
    id: "trust",
    name: "Pilares de Confianza y Respaldo Institucional",
    description: "Sección institucional con los valores de garantía, seguridad jurídica y trayectoria.",
    visible: true,
    order: 5,
  },
];

let tableInitialized = false;

// Asegura la existencia de la tabla site_settings en PostgreSQL
async function ensureSettingsTable() {
  if (tableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    tableInitialized = true;
  } catch (err) {
    console.error("Error asegurando tabla site_settings:", err);
  }
}

// Obtiene la configuracion de orden y visibilidad de secciones de la vista inicial
export async function getHomeSectionsConfig(): Promise<HomeSectionConfig[]> {
  try {
    await ensureSettingsTable();
    const rows = await prisma.$queryRawUnsafe<{ value: HomeSectionConfig[] }[]>(`
      SELECT value FROM site_settings WHERE key = 'home_sections' LIMIT 1;
    `);

    if (rows && rows.length > 0 && Array.isArray(rows[0].value)) {
      const saved = rows[0].value;
      const idsInSaved = new Set(saved.map((s) => s.id));
      const missingDefaults = DEFAULT_HOME_SECTIONS.filter((d) => !idsInSaved.has(d.id));
      const combined = [...saved, ...missingDefaults].sort((a, b) => a.order - b.order);
      return combined;
    }
  } catch (err) {
    console.warn("Fallo al leer configuracion de home_sections, usando defaults:", err);
  }
  return DEFAULT_HOME_SECTIONS;
}

// Guarda la configuracion de orden y visibilidad de las secciones
export async function saveHomeSectionsConfig(sections: HomeSectionConfig[]): Promise<void> {
  await ensureSettingsTable();
  const normalized = sections.map((sec, index) => ({
    ...sec,
    order: index + 1,
  }));

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ('home_sections', $1::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW();
  `,
    JSON.stringify(normalized)
  );
}
