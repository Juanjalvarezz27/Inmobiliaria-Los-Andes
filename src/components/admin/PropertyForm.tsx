"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  createPropertyAction,
  updatePropertyAction,
  uploadPropertyImageAction,
} from "@/app/admin/actions";
import { compressImage, COMPRESSION_PRESETS } from "@/lib/imageCompression";
import {
  UploadCloud,
  Loader2,
  ImageIcon,
  Star,
  X,
  Plus,
  Save,
  ArrowLeft,
  FileText,
  Tag,
  Home,
  CheckCircle2,
  DollarSign,
  Building2,
  Compass,
  MapPin,
  Map,
  BedDouble,
  Bath,
  Car,
  Maximize2,
  AlignLeft,
  Sparkles,
  UserCheck,
  Check,
  ChevronDown,
  ExternalLink,
  Navigation,
  ClipboardCopy,
  Eye,
  EyeOff,
} from "lucide-react";
import type { OperationType, PropertyType, PropertyStatus } from "@/generated/prisma/client";
import { CustomSelect, CustomSelectOption } from "./CustomSelect";

// Opciones estilizadas para los selectores de la propiedad
const OPERATION_TYPE_OPTIONS: CustomSelectOption<OperationType>[] = [
  { value: "SALE", label: "Venta" },
  { value: "RENT", label: "Alquiler" },
];

const PROPERTY_TYPE_OPTIONS: CustomSelectOption<PropertyType>[] = [
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "HOUSE", label: "Casa" },
  { value: "APARTMENT", label: "Apartamento" },
  { value: "COMMERCIAL", label: "Local Comercial" },
  { value: "LAND", label: "Terreno" },
  { value: "OFFICE", label: "Oficina" },
  { value: "OTHER", label: "Otro" },
];

const PROPERTY_STATUS_OPTIONS: CustomSelectOption<PropertyStatus>[] = [
  { value: "AVAILABLE", label: "Disponible", dotColor: "bg-emerald-500" },
  { value: "RESERVED", label: "Reservado", dotColor: "bg-amber-500" },
  { value: "SOLD", label: "Vendido", dotColor: "bg-blue-500" },
  { value: "RENTED", label: "Alquilado", dotColor: "bg-purple-500" },
];

export interface AgentOption {
  id: string;
  name: string;
  position: string;
  avatarUrl?: string | null;
}

// Opcion corporativa predeterminada para propiedades asignadas a la oficina Central
export const CENTRAL_AGENT_OPTION: AgentOption = {
  id: "central-los-andes",
  name: "Inmobiliaria Los Andes",
  position: "Central Los Andes",
  avatarUrl: "/Logo redondo.png",
};

// Limite maximo estricto de fotografias por inmueble
const MAX_PROPERTY_IMAGES = 8;

export interface InitialPropertyData {
  id?: string;
  title?: string;
  operationType?: OperationType;
  propertyType?: PropertyType;
  customPropertyType?: string | null;
  status?: PropertyStatus;
  price?: number | string | { toString: () => string };
  currency?: string;
  featured?: boolean;
  city?: string;
  sector?: string | null;
  address?: string;
  googleMapsUrl?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpots?: number | null;
  areaSquareMeters?: number | string | { toString: () => string } | null;
  description?: string;
  amenities?: string[];
  agentId?: string;
  images?: { url: string; caption?: string | null; isMain: boolean }[];
}

export interface PropertyFormProps {
  initialData?: InitialPropertyData;
  agents: AgentOption[];
  isEditing?: boolean;
  defaultAgentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  hideHeader?: boolean;
}

// Formulario reactivo completo de propiedad con carga directa WebP y diseño refinado
export function PropertyForm({
  initialData,
  agents,
  isEditing = false,
  defaultAgentId,
  onSuccess,
  onCancel,
  hideHeader = false,
}: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seccion 1: Galeria de imagenes (primer campo del formulario)
  const [images, setImages] = useState<{ url: string; caption?: string; isMain: boolean }[]>(
    initialData?.images?.length
      ? initialData.images.map((img) => ({
          url: img.url,
          caption: img.caption || "",
          isMain: img.isMain,
        }))
      : []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seccion 2: Datos Principales
  const [title, setTitle] = useState(initialData?.title || "");
  const [operationType, setOperationType] = useState<OperationType>(initialData?.operationType || "SALE");
  const [propertyType, setPropertyType] = useState<PropertyType>(initialData?.propertyType || "TOWNHOUSE");
  const [customPropertyType, setCustomPropertyType] = useState(initialData?.customPropertyType || "");
  const [status, setStatus] = useState<PropertyStatus>(initialData?.status || "AVAILABLE");
  const [price, setPrice] = useState(initialData?.price ? initialData.price.toString() : "");

  // Opciones de estatus del inmueble (sin el estado oculto por defecto para nuevos o estandar)
  const statusOptions = useMemo(() => {
    if (initialData?.status === "HIDDEN") {
      return [
        ...PROPERTY_STATUS_OPTIONS,
        { value: "HIDDEN" as PropertyStatus, label: "Oculto (Borrador)", dotColor: "bg-neutral-400" },
      ];
    }
    return PROPERTY_STATUS_OPTIONS;
  }, [initialData?.status]);

  // Opciones dinamicas que muestran el tipo personalizado en la etiqueta si se define
  const propertyTypeOptions = useMemo(() => {
    return PROPERTY_TYPE_OPTIONS.map((opt) => {
      if (opt.value === "OTHER" && customPropertyType.trim()) {
        return {
          ...opt,
          label: `Otro (${customPropertyType.trim()})`,
        };
      }
      return opt;
    });
  }, [customPropertyType]);

  // Seccion 3: Ubicacion Geografica
  const [city, setCity] = useState(initialData?.city || "Trujillo Capital");
  const [sector, setSector] = useState(initialData?.sector || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initialData?.googleMapsUrl || "");

  // Abre Google Maps en una pestaña nueva para visualizar la ubicacion o ubicar la busqueda
  const handleOpenGoogleMaps = () => {
    const raw = googleMapsUrl.trim();
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      window.open(raw, "_blank", "noopener,noreferrer");
      return;
    }
    const query = raw || [address, sector, city, "Trujillo, Venezuela"].filter((p) => p && p.trim()).join(", ") || "Trujillo Capital, Venezuela";
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
  };

  // Seccion 4: Distribucion Cuantitativa
  const [bedrooms, setBedrooms] = useState(
    initialData?.bedrooms !== undefined && initialData?.bedrooms !== null ? String(initialData.bedrooms) : "3"
  );
  const [bathrooms, setBathrooms] = useState(
    initialData?.bathrooms !== undefined && initialData?.bathrooms !== null ? String(initialData.bathrooms) : "2"
  );
  const [parkingSpots, setParkingSpots] = useState(
    initialData?.parkingSpots !== undefined && initialData?.parkingSpots !== null ? String(initialData.parkingSpots) : "1"
  );
  const [areaSquareMeters, setAreaSquareMeters] = useState(
    initialData?.areaSquareMeters ? initialData.areaSquareMeters.toString() : ""
  );

  // Seccion 5: Descripcion y Amenidades
  const [description, setDescription] = useState(initialData?.description || "");
  const [amenities, setAmenities] = useState<string[]>(
    initialData?.amenities || [
      "Tanque de agua con bomba",
      "Portón eléctrico",
      "Vigilancia privada",
    ]
  );
  const [newAmenity, setNewAmenity] = useState("");

  // Seccion 6: Asesor Inmobiliario Asignado (vacio por defecto sin asesor preseleccionado)
  const [agentId, setAgentId] = useState(
    initialData?.agentId || defaultAgentId || ""
  );
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const agentDropdownRef = useRef<HTMLDivElement>(null);

  // Lista consolidada de asesores: Primera opcion obligatoria "Inmobiliaria Los Andes - Central Los Andes"
  const allAgentOptions = useMemo<AgentOption[]>(() => {
    const list = agents.filter((a) => a.id !== "central-los-andes");
    return [CENTRAL_AGENT_OPTION, ...list];
  }, [agents]);

  const selectedAgent = allAgentOptions.find((a) => a.id === agentId);

  // Cierre automatico al hacer clic fuera del desplegable de asesor
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(e.target as Node)) {
        setIsAgentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Procesa y sube multiples archivos de imagen con compresion WebP en el navegador
  const processFiles = async (filesList: FileList | File[]) => {
    const rawFiles = Array.from(filesList).filter((f) => f.type.startsWith("image/"));
    if (rawFiles.length === 0) {
      setError("Por favor selecciona archivos de imagen válidos (PNG, JPG o WEBP).");
      return;
    }

    if (images.length >= MAX_PROPERTY_IMAGES) {
      setError(`Se ha alcanzado el límite máximo de ${MAX_PROPERTY_IMAGES} fotografías por inmueble.`);
      return;
    }

    const availableSlots = MAX_PROPERTY_IMAGES - images.length;
    const filesToUpload = rawFiles.slice(0, availableSlots);

    if (rawFiles.length > availableSlots) {
      setError(`Solo se cargarán ${availableSlots} fotografía(s) para no exceder el límite de ${MAX_PROPERTY_IMAGES} fotos.`);
    } else {
      setError(null);
    }

    setIsUploading(true);

    try {
      const uploadedResults: { url: string; caption?: string; isMain: boolean }[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgress({ current: i + 1, total: filesToUpload.length });

        // Compresion optimizada a WebP calibrado (1440x1080 a 80% calidad)
        const compressed = await compressImage(file, COMPRESSION_PRESETS.PROPERTY);

        const formData = new FormData();
        formData.append("file", compressed.file);

        const res = await uploadPropertyImageAction(formData);
        if (!res.success || !res.url) {
          throw new Error(res.error || `Error al subir "${file.name}".`);
        }

        const isFirst = images.length === 0 && uploadedResults.length === 0;
        uploadedResults.push({
          url: res.url,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          isMain: isFirst,
        });
      }

      setImages((prev) => {
        const merged = [...prev, ...uploadedResults];
        if (!merged.some((img) => img.isMain) && merged.length > 0) {
          merged[0].isMain = true;
        }
        return merged;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error durante la subida de imágenes.";
      setError(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Manejador del input de archivos
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  // Remueve una imagen de la lista y recalcula la portada si es necesario
  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    if (updated.length > 0 && !updated.some((img) => img.isMain)) {
      updated[0].isMain = true;
    }
    setImages(updated);
  };

  // Define la imagen seleccionada como Portada Principal
  const handleSetMainImage = (index: number) => {
    setImages(
      images.map((img, idx) => ({
        ...img,
        isMain: idx === index,
      }))
    );
  };

  // Agrega una amenidad al listado
  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  // Remueve una amenidad del listado
  const handleRemoveAmenity = (indexToRemove: number) => {
    setAmenities(amenities.filter((_, idx) => idx !== indexToRemove));
  };

  // Envio del formulario completo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!agentId) {
        throw new Error("Debe seleccionar un Asesor Inmobiliario responsable o la opción Central Los Andes.");
      }

      if (images.length === 0) {
        throw new Error("Debe agregar al menos una fotografía a la propiedad para la portada.");
      }

      if (images.length > MAX_PROPERTY_IMAGES) {
        throw new Error(`El inmueble no puede tener más de ${MAX_PROPERTY_IMAGES} fotografías.`);
      }

      if (propertyType === "OTHER" && !customPropertyType.trim()) {
        throw new Error("Por favor especifica el tipo de inmueble para la opción 'Otro'.");
      }

      const finalGoogleMapsUrl = (() => {
        const raw = googleMapsUrl.trim();
        if (!raw) return undefined;
        if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
        const query = [raw, city || "Trujillo Capital", "Venezuela"].filter(Boolean).join(", ");
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      })();

      const payload = {
        title,
        operationType,
        propertyType,
        customPropertyType: propertyType === "OTHER" ? customPropertyType.trim() : null,
        status,
        price: parseFloat(price) || 0,
        currency: "USD",
        featured: initialData?.featured || false,
        city,
        sector,
        address,
        googleMapsUrl: finalGoogleMapsUrl,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
        parkingSpots: parkingSpots ? parseInt(parkingSpots, 10) : undefined,
        areaSquareMeters: areaSquareMeters ? parseFloat(areaSquareMeters) : undefined,
        description,
        amenities,
        agentId,
        images: images.map((img, idx) => ({
          url: img.url,
          caption: img.caption,
          isMain: img.isMain,
          order: idx,
        })),
      };

      if (isEditing && initialData?.id) {
        await updatePropertyAction(initialData.id, payload);
      } else {
        await createPropertyAction(payload);
      }

      setIsSubmitting(false);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/propiedades");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar el inmueble.";
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={
        hideHeader
          ? "flex-1 flex flex-col min-h-0 overflow-hidden relative"
          : "space-y-8 max-w-4xl pb-6"
      }
    >
      {/* Cabecera independiente para paginas standalone */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/propiedades"
              className="p-2.5 rounded-xl bg-white border border-neutral-200 text-text-secondary hover:text-brand-primary hover:border-brand-accent transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-brand-primary font-heading tracking-tight">
                {isEditing ? "Editar Ficha de Inmueble" : "Registrar Nuevo Inmueble"}
              </h1>
              <p className="text-xs text-text-secondary font-medium">
                Ingresa fotografías, datos técnicos y ubicación del inmueble.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e85d30] via-brand-accent to-[#c4441b] hover:shadow-lg hover:shadow-brand-accent/30 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md shadow-brand-accent/20 transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Inmueble</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Contenedor desplazable de secciones (transparente para proyectar el fondo andino continuo) */}
      <div
        className={
          hideHeader
            ? "flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain relative z-10 bg-transparent"
            : "space-y-6 relative isolate"
        }
      >
        {/* Alerta de error si ocurre alguno */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center justify-between shadow-xs">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      {/* 1. Galería de Fotografías */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 text-brand-accent text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
              01
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-brand-primary font-heading">
                Fotografías y Galería Multimedia *
              </h2>
              <p className="text-[11px] text-text-secondary font-medium">
                Sube hasta {MAX_PROPERTY_IMAGES} fotos en alta resolución. La marcada como portada encabezará la ficha pública.
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
              images.length >= MAX_PROPERTY_IMAGES
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-neutral-50 text-text-secondary border-neutral-200 shadow-2xs"
            }`}
          >
            {images.length} de {MAX_PROPERTY_IMAGES} fotos {images.length >= MAX_PROPERTY_IMAGES ? "(Límite)" : ""}
          </span>
        </div>

        {/* Zona de subida o banner de limite alcanzado */}
        {images.length >= MAX_PROPERTY_IMAGES ? (
          <div className="rounded-2xl border-2 border-neutral-200 bg-neutral-50/80 p-6 sm:p-7 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-2xs">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-text-primary">
                Límite máximo de {MAX_PROPERTY_IMAGES} fotografías alcanzado
              </p>
              <p className="text-xs text-text-secondary max-w-md">
                Has alcanzado el cupo máximo de 8 fotos por propiedad. Si deseas agregar una foto diferente, elimina alguna de la galería inferior.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileInputChange}
              disabled={isUploading || isSubmitting}
              className="hidden"
              id="property-photos-upload"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
              }}
              className={`relative rounded-2xl border-2 border-dashed transition-all p-6 sm:p-8 text-center flex flex-col items-center justify-center ${
                isDragging
                  ? "border-brand-accent bg-orange-50/40 scale-[0.99]"
                  : isUploading
                  ? "border-neutral-300 bg-neutral-50/70 opacity-80 pointer-events-none"
                  : "border-neutral-300 hover:border-brand-accent/80 bg-neutral-50/40 hover:bg-orange-50/20"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-9 h-9 text-brand-accent animate-spin" />
                  <p className="text-sm font-bold text-text-primary">
                    Optimizando y subiendo fotografías ({uploadProgress?.current} de {uploadProgress?.total})...
                  </p>
                  <p className="text-xs text-text-secondary">
                    Comprimiendo a WebP HD para máxima velocidad de carga.
                  </p>
                </div>
              ) : (
                <label
                  htmlFor="property-photos-upload"
                  className="w-full flex flex-col items-center justify-center cursor-pointer space-y-2.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs text-brand-accent flex items-center justify-center group-hover:scale-110 group-hover:border-brand-accent/40 transition-all">
                    <UploadCloud className="w-6 h-6 text-brand-accent" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-text-primary">
                      Haz clic o arrastra fotos aquí para subirlas desde tu dispositivo
                    </p>
                    <p className="text-xs text-text-secondary">
                      Formatos PNG, JPG o WEBP (máx. {MAX_PROPERTY_IMAGES - images.length} foto{MAX_PROPERTY_IMAGES - images.length === 1 ? "" : "s"} restante{MAX_PROPERTY_IMAGES - images.length === 1 ? "" : "s"}).
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 group-hover:text-brand-accent group-hover:border-brand-accent/40 shadow-2xs transition-colors">
                    <Plus className="w-3.5 h-3.5 text-brand-accent" />
                    <span>Explorar archivos</span>
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Grilla visual de miniaturas cargadas */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl overflow-hidden border-2 bg-neutral-100 flex flex-col transition-all group ${
                  img.isMain
                    ? "border-brand-accent ring-2 ring-brand-accent/20 shadow-md"
                    : "border-neutral-200/90 hover:border-neutral-300"
                }`}
              >
                {/* Imagen con relacion 16/10 */}
                <div className="relative aspect-[16/10] w-full bg-neutral-200">
                  <Image
                    src={img.url}
                    alt={img.caption || `Foto ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />

                  {/* Badge de Portada Principal */}
                  {img.isMain && (
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-brand-accent text-white text-[10px] font-bold shadow-md flex items-center gap-1 z-10">
                      <Star className="w-3 h-3 fill-white" />
                      <span>Portada</span>
                    </span>
                  )}

                  {/* Boton para eliminar fotografia */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm z-10"
                    title="Eliminar foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Barra de accion para definir como portada */}
                <div className="p-2 bg-white flex items-center justify-between text-xs border-t border-neutral-100">
                  {img.isMain ? (
                    <span className="text-[11px] font-bold text-brand-accent flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Foto de Portada</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(idx)}
                      className="text-[11px] font-bold text-neutral-500 hover:text-brand-accent flex items-center gap-1 transition-colors w-full justify-center py-0.5"
                    >
                      <Star className="w-3 h-3" />
                      <span>Marcar como Portada</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 px-4 rounded-xl bg-neutral-50/60 border border-neutral-200/60 text-xs text-text-secondary">
            No has agregado fotografías todavía. Sube al menos una imagen para la ficha del inmueble.
          </div>
        )}
      </div>

      {/* 2. Datos Principales de la Publicacion */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3.5 border-b border-neutral-100">
          <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 text-brand-accent text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
            02
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-brand-primary font-heading">
              Información Básica y Comercial
            </h2>
            <p className="text-[11px] text-text-secondary font-medium">
              Define el título comercial, modalidad de negociación, tipo de propiedad y precio.
            </p>
          </div>
        </div>

        {/* Titulo descriptivo */}
        <div>
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span>Título Descriptivo *</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Hermoso y moderno Townhouse en Urb. Vista Real"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs placeholder-neutral-400"
          />
        </div>

        {/* Operacion, Tipo y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Tipo de Operación *</span>
            </label>
            <CustomSelect<OperationType>
              value={operationType}
              onChange={setOperationType}
              options={OPERATION_TYPE_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Tipo de Inmueble *</span>
            </label>
            <CustomSelect<PropertyType>
              value={propertyType}
              onChange={setPropertyType}
              options={propertyTypeOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Estado del Inmueble *</span>
            </label>
            <CustomSelect<PropertyStatus>
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
          </div>
        </div>

        {/* Campo dinamico si el tipo de inmueble es OTRO */}
        {propertyType === "OTHER" && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 bg-orange-50/40 border border-brand-accent/25 rounded-2xl p-4 sm:p-4.5 space-y-1.5">
            <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Especificar Tipo de Inmueble *</span>
            </label>
            <input
              type="text"
              required={propertyType === "OTHER"}
              placeholder="Ej. Galpón industrial, Finca campestre, Quinta vacacional, Penthouse..."
              value={customPropertyType}
              onChange={(e) => setCustomPropertyType(e.target.value)}
              className="w-full bg-white border border-brand-accent/30 rounded-xl px-4 py-2.5 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs placeholder-neutral-400"
            />
            <p className="text-[11px] text-text-secondary">
              Escribe la categoría exacta del inmueble para mostrarla a los clientes en el catálogo y ficha técnica.
            </p>
          </div>
        )}

        {/* Tarjeta destacada de Precio */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-orange-50/30 border border-orange-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-xs font-black text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-brand-accent" />
              <span>{operationType === "RENT" ? "Canon de Arrendamiento *" : "Precio de Venta *"}</span>
            </label>
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
              {operationType === "RENT" ? "Monto mensual en dólares estadounidenses (USD / mes)" : "Precio total de venta en dólares estadounidenses (USD)"}
            </p>
          </div>
          <div className="relative w-full sm:w-56">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-brand-accent">
              USD $
            </span>
            <input
              type="number"
              required
              min="0"
              step="1"
              placeholder={operationType === "RENT" ? "Ej. 450" : "Ej. 55000"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl pl-16 pr-4 py-2.5 text-base font-black text-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 3. Ubicacion Geografica */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3.5 border-b border-neutral-100">
          <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 text-brand-accent text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
            03
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-brand-primary font-heading">
              Ubicación Geográfica
            </h2>
            <p className="text-[11px] text-text-secondary font-medium">
              Indica la ciudad, sector residencial y punto geográfico de referencia.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Ciudad / Municipio *</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Trujillo Capital"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs placeholder-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Sector / Urbanización *</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sector Centro Chiquinquirá"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs placeholder-neutral-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span>Dirección Exacta *</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Calle Comercio, Casa Colonial Nro 12"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs placeholder-neutral-400"
          />
        </div>

        {/* Ubicacion en Google Maps */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Ubicación en Google Maps</span>
            </label>
            <span className="text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200/80">
              Opcional
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ej. Edificio La Cascada o enlace https://maps.app.goo.gl/..."
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs placeholder-neutral-400"
              />
              {googleMapsUrl && (
                <button
                  type="button"
                  onClick={() => setGoogleMapsUrl("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                  title="Limpiar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100/80 border border-brand-accent/30 text-xs font-bold text-brand-primary transition-colors shrink-0 shadow-2xs active:scale-95"
              title="Abrir y verificar la ubicación en Google Maps"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-accent" />
              <span>Ubicar en Maps</span>
              <ExternalLink className="w-3 h-3 text-brand-accent ml-0.5" />
            </button>
          </div>

          <p className="text-[11px] text-text-secondary mt-1.5">
            {googleMapsUrl.trim().startsWith("http")
              ? "✓ Enlace web de Google Maps configurado."
              : googleMapsUrl.trim()
              ? `✓ Se creará un enlace satelital automático hacia: "${googleMapsUrl.trim()}".`
              : "Puedes escribir el nombre de un edificio/sitio de referencia o pegar directamente un link de Google Maps."}
          </p>
        </div>
      </div>

      {/* 4. Distribucion y Dimensiones */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3.5 border-b border-neutral-100">
          <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 text-brand-accent text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
            04
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-brand-primary font-heading">
              Distribución y Dimensiones
            </h2>
            <p className="text-[11px] text-text-secondary font-medium">
              Especifica la cantidad de estancias y el metraje total de construcción o terreno.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-3.5 space-y-2">
            <label className="block text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Habitaciones</span>
            </label>
            <input
              type="number"
              min="0"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs"
            />
          </div>

          <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-3.5 space-y-2">
            <label className="block text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Baños</span>
            </label>
            <input
              type="number"
              min="0"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs"
            />
          </div>

          <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-3.5 space-y-2">
            <label className="block text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Puestos Est.</span>
            </label>
            <input
              type="number"
              min="0"
              value={parkingSpots}
              onChange={(e) => setParkingSpots(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs"
            />
          </div>

          <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-3.5 space-y-2">
            <label className="block text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Área (m²)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={areaSquareMeters}
              onChange={(e) => setAreaSquareMeters(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 5. Descripcion y Amenidades */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3.5 border-b border-neutral-100">
          <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 text-brand-accent text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
            05
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-brand-primary font-heading">
              Descripción y Amenidades
            </h2>
            <p className="text-[11px] text-text-secondary font-medium">
              Redacta los detalles más atractivos del inmueble y resalta su equipamiento clave.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span>Descripción General *</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Detalles sobre distribución interna (sala, cocina, patio social, acabados, tanque de agua)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs leading-relaxed placeholder-neutral-400"
          />
        </div>

        {/* Amenidades Dinamicas con chips y sugerencias rapidas */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span>Amenidades y Equipamiento</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. Tanque de agua 10.000L, Planta eléctrica, Portón eléctrico..."
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAmenity())}
              className="flex-1 bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent shadow-2xs placeholder-neutral-400"
            />
            <button
              type="button"
              onClick={handleAddAmenity}
              className="px-4 py-2.5 bg-brand-primary hover:bg-[#122b1c] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>

          {/* Sugerencias rapidas con un clic si no estan agregadas */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] font-bold text-text-secondary mr-1">Sugeridos:</span>
            {[
              "Tanque de Agua",
              "Planta Eléctrica",
              "Vigilancia Privada",
              "Portón Eléctrico",
              "Aire Acondicionado",
              "Gas Directo",
              "Piscina",
              "Línea Cantv / Fibra",
            ]
              .filter((sug) => !amenities.includes(sug))
              .slice(0, 5)
              .map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setAmenities((prev) => [...prev, suggestion])}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-orange-50 hover:text-brand-accent hover:border-brand-accent/30 border border-neutral-200/70 text-text-secondary transition-all"
                >
                  + {suggestion}
                </button>
              ))}
          </div>

          {/* Chips agregados */}
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1.5">
              {amenities.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-orange-50/70 hover:bg-orange-100/70 text-brand-primary text-xs font-semibold px-3 py-1.5 rounded-xl border border-orange-200/80 transition-colors"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(idx)}
                    className="text-neutral-400 hover:text-red-500 p-0.5 rounded-md"
                    title="Eliminar amenidad"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Asesor Inmobiliario Responsable */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3.5 border-b border-neutral-100">
          <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 text-brand-accent text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
            06
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-brand-primary font-heading">
              Asesor Inmobiliario Responsable *
            </h2>
            <p className="text-[11px] text-text-secondary font-medium">
              Asigna al agente inmobiliario que atenderá a los clientes interesados en esta propiedad.
            </p>
          </div>
        </div>

        <div ref={agentDropdownRef} className="relative">
          <input type="hidden" name="agentId" value={agentId} required />
          <button
            type="button"
            onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
            className={`w-full bg-white border rounded-xl px-4 py-2.5 flex items-center justify-between text-left transition-all shadow-2xs ${
              isAgentDropdownOpen
                ? "border-brand-accent ring-2 ring-brand-accent/20"
                : "border-neutral-300 hover:border-brand-accent/60"
            }`}
            aria-haspopup="listbox"
            aria-expanded={isAgentDropdownOpen}
          >
            {selectedAgent ? (
              <div className="flex items-center gap-3 min-w-0">
                {selectedAgent.avatarUrl ? (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                    <Image
                      src={selectedAgent.avatarUrl}
                      alt={selectedAgent.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-brand-accent/30 text-brand-accent font-bold text-xs flex items-center justify-center shrink-0">
                    {selectedAgent.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-bold text-brand-primary truncate">
                    {selectedAgent.name}
                  </div>
                  {selectedAgent.position && (
                    <div className="text-xs text-text-secondary font-medium truncate">
                      {selectedAgent.position}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-sm text-neutral-400 font-medium">
                -- Seleccionar Asesor Responsable --
              </span>
            )}

            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-2 ${
                isAgentDropdownOpen ? "rotate-180 text-brand-accent" : ""
              }`}
            />
          </button>

          {/* Menu desplegable estilizado */}
          {isAgentDropdownOpen && (
            <div
              role="listbox"
              className="absolute bottom-full mb-1.5 sm:bottom-auto sm:top-full sm:mt-1.5 left-0 right-0 bg-white rounded-2xl border border-neutral-200 shadow-xl z-50 p-1.5 space-y-1 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            >
              {allAgentOptions.map((agent, index) => {
                const isSelected = agent.id === agentId;
                const isCentralOption = agent.id === "central-los-andes";

                return (
                  <button
                    key={agent.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setAgentId(agent.id);
                      setIsAgentDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                      isSelected
                        ? "bg-orange-50/80 text-brand-accent ring-1 ring-brand-accent/20"
                        : isCentralOption
                        ? "bg-neutral-50/70 hover:bg-orange-50/50 text-brand-primary"
                        : "hover:bg-neutral-50 text-text-primary"
                    } ${index === 0 ? "border-b border-neutral-100 pb-3 mb-1" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {agent.avatarUrl ? (
                        <div className={`relative w-8 h-8 rounded-lg overflow-hidden border shrink-0 ${
                          isCentralOption ? "border-brand-accent/30 bg-white p-0.5" : "border-neutral-200"
                        }`}>
                          <Image
                            src={agent.avatarUrl}
                            alt={agent.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-brand-accent text-white border-brand-accent"
                              : "bg-orange-50 text-brand-accent border-brand-accent/20"
                          }`}
                        >
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-bold truncate ${
                              isSelected ? "text-brand-accent" : "text-brand-primary"
                            }`}
                          >
                            {agent.name}
                          </span>
                          {isCentralOption && (
                            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-brand-primary text-white shrink-0">
                              Oficina Central
                            </span>
                          )}
                        </div>
                        {agent.position && (
                          <div className="text-xs text-text-secondary font-medium truncate">
                            {agent.position}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-brand-accent shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-xs text-text-secondary mt-1.5">
            {selectedAgent?.id === "central-los-andes"
              ? "Propiedad asignada a Central Los Andes. En la ficha y tarjetas mostrará el logo institucional y la atención corporativa directa."
              : "El botón de WhatsApp en la ficha pública del inmueble contactará directamente a este asesor."}
          </p>
        </div>
      </div>

      </div>

      {/* Botones de Accion Final - SIEMPRE FIJADO AL FONDO */}
      <div
        className={
          hideHeader
            ? "shrink-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 px-5 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-20"
            : "pt-4 border-t border-neutral-200/90 flex items-center justify-end gap-3"
        }
      >
        <p className="text-xs text-neutral-500 font-medium hidden sm:block">
          * Campos obligatorios para publicación inmediata.
        </p>
        <div className="flex items-center gap-3 ml-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || isUploading}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-neutral-600 hover:bg-neutral-100 border border-neutral-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e85d30] via-brand-accent to-[#c4441b] hover:shadow-lg hover:shadow-brand-accent/30 text-white font-bold px-7 py-2.5 rounded-xl shadow-md shadow-brand-accent/20 transition-all active:scale-95 text-xs sm:text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando Inmueble...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? "Guardar Cambios" : "Registrar Inmueble"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
