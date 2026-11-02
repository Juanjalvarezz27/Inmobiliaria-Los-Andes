"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPropertyAction, updatePropertyAction } from "@/app/admin/actions";
import { Plus, X, Image as ImageIcon, Save, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import type { OperationType, PropertyType, PropertyStatus } from "@/generated/prisma/client";

interface AgentOption {
  id: string;
  name: string;
  position: string;
}

export interface InitialPropertyData {
  id?: string;
  title?: string;
  operationType?: OperationType;
  propertyType?: PropertyType;
  status?: PropertyStatus;
  price?: number | string | { toString: () => string };
  featured?: boolean;
  city?: string;
  sector?: string | null;
  address?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpots?: number | null;
  areaSquareMeters?: number | string | { toString: () => string } | null;
  description?: string;
  amenities?: string[];
  agentId?: string;
  images?: { url: string; caption?: string | null; isMain: boolean }[];
}

interface PropertyFormProps {
  initialData?: InitialPropertyData;
  agents: AgentOption[];
  isEditing?: boolean;
}

// Formulario reactivo completo para crear o editar fichas de propiedades
export function PropertyForm({ initialData, agents, isEditing = false }: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario
  const [title, setTitle] = useState(initialData?.title || "");
  const [operationType, setOperationType] = useState<OperationType>(initialData?.operationType || "SALE");
  const [propertyType, setPropertyType] = useState<PropertyType>(initialData?.propertyType || "TOWNHOUSE");
  const [status, setStatus] = useState<PropertyStatus>(initialData?.status || "AVAILABLE");
  const [price, setPrice] = useState(initialData?.price ? initialData.price.toString() : "");
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);

  const [city, setCity] = useState(initialData?.city || "Trujillo Capital");
  const [sector, setSector] = useState(initialData?.sector || "");
  const [address, setAddress] = useState(initialData?.address || "");

  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms !== undefined && initialData?.bedrooms !== null ? String(initialData.bedrooms) : "3");
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms !== undefined && initialData?.bathrooms !== null ? String(initialData.bathrooms) : "2");
  const [parkingSpots, setParkingSpots] = useState(initialData?.parkingSpots !== undefined && initialData?.parkingSpots !== null ? String(initialData.parkingSpots) : "1");
  const [areaSquareMeters, setAreaSquareMeters] = useState(initialData?.areaSquareMeters ? initialData.areaSquareMeters.toString() : "");

  const [description, setDescription] = useState(initialData?.description || "");

  // Amenidades (etiquetas dinamicas)
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || [
    "Tanque de agua con bomba",
    "Portón eléctrico",
    "Vigilancia privada",
  ]);
  const [newAmenity, setNewAmenity] = useState("");

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (indexToRemove: number) => {
    setAmenities(amenities.filter((_, idx) => idx !== indexToRemove));
  };

  // Galeria de imagenes
  const [images, setImages] = useState<{ url: string; caption?: string; isMain: boolean }[]>(
    initialData?.images?.length
      ? initialData.images.map((img) => ({
          url: img.url,
          caption: img.caption || "",
          isMain: img.isMain,
        }))
      : [
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            caption: "Fachada Principal",
            isMain: true,
          },
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([
        ...images,
        { url: newImageUrl.trim(), caption: "", isMain: images.length === 0 },
      ]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    if (updated.length > 0 && !updated.some((img) => img.isMain)) {
      updated[0].isMain = true;
    }
    setImages(updated);
  };

  const handleSetMainImage = (index: number) => {
    setImages(
      images.map((img, idx) => ({
        ...img,
        isMain: idx === index,
      }))
    );
  };

  // Asesor Asignado
  const [agentId, setAgentId] = useState(initialData?.agentId || (agents[0]?.id || ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!agentId) {
        throw new Error("Debe seleccionar un Asesor Inmobiliario responsable.");
      }

      if (images.length === 0) {
        throw new Error("Debe agregar al menos una fotografía a la propiedad.");
      }

      const payload = {
        title,
        operationType,
        propertyType,
        status,
        price: parseFloat(price) || 0,
        currency: "USD",
        featured,
        city,
        sector,
        address,
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

      router.push("/admin/propiedades");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar el inmueble.";
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-16">
      {/* Boton volver y Titulo */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/propiedades"
            className="p-2 rounded-xl bg-ui-surface border border-neutral-200 text-text-secondary hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-brand-primary">
              {isEditing ? "Editar Ficha del Inmueble" : "Nueva Propiedad Inmobiliaria"}
            </h1>
            <p className="text-xs text-text-secondary">
              Ingresa los datos técnicos, distribución y fotografías del inmueble.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-brand-accent hover:bg-[#c94b21] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Guardando..." : "Guardar Inmueble"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* 1. Datos Principales */}
      <section className="bg-ui-surface p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-neutral-100 pb-3">
          1. Datos Principales de la Publicación
        </h2>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Título Descriptivo *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Hermoso y moderno Townhouse en Urb. Vista Real"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Tipo de Operación *
            </label>
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value as OperationType)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <option value="SALE">Venta</option>
              <option value="RENT">Alquiler</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Tipo de Inmueble *
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="HOUSE">Casa</option>
              <option value="APARTMENT">Apartamento</option>
              <option value="COMMERCIAL">Local Comercial</option>
              <option value="LAND">Terreno</option>
              <option value="OFFICE">Oficina</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Estado del Inmueble *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PropertyStatus)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <option value="AVAILABLE">Disponible</option>
              <option value="RESERVED">Reservado</option>
              <option value="SOLD">Vendido</option>
              <option value="RENTED">Alquilado</option>
              <option value="HIDDEN">Oculto (Borrador)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Precio en USD ($) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="1"
              placeholder="Ej. 72000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          <div className="pt-5 sm:pt-6">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-brand-accent rounded focus:ring-brand-accent"
              />
              <span className="text-xs font-bold text-text-primary">
                Destacar en Portada Principal (Badge especial)
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* 2. Ubicacion */}
      <section className="bg-ui-surface p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-neutral-100 pb-3">
          2. Ubicación Geográfica
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Ciudad / Municipio *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Trujillo Capital"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Sector / Urbanización *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Urb. Vista Real, sector La Raya"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Dirección Exacta *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Av. Independencia, Casa Nro 14"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
      </section>

      {/* 3. Distribucion Cuantitativa */}
      <section className="bg-ui-surface p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-neutral-100 pb-3">
          3. Distribución Cuantitativa
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Habitaciones
            </label>
            <input
              type="number"
              min="0"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Baños
            </label>
            <input
              type="number"
              min="0"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Puestos Estacionamiento
            </label>
            <input
              type="number"
              min="0"
              value={parkingSpots}
              onChange={(e) => setParkingSpots(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Área Construida (m²)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={areaSquareMeters}
              onChange={(e) => setAreaSquareMeters(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
        </div>
      </section>

      {/* 4. Descripcion y Amenidades */}
      <section className="bg-ui-surface p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-neutral-100 pb-3">
          4. Descripción y Amenidades
        </h2>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Descripción General *
          </label>
          <textarea
            required
            rows={5}
            placeholder="Detalles sobre distribución interna (sala, cocina, comedor, patio social, acabados)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent leading-relaxed"
          />
        </div>

        {/* Amenidades Dinamicas */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Amenidades y Equipamiento (Etiquetas Dinámicas)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. Tanque de agua 10.000L, Planta eléctrica..."
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAmenity())}
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            <button
              type="button"
              onClick={handleAddAmenity}
              className="px-4 py-2.5 bg-brand-primary hover:bg-opacity-90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {amenities.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 text-xs font-medium px-3 py-1.5 rounded-full border border-neutral-200"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(idx)}
                  className="text-neutral-400 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Galeria de Fotografias */}
      <section className="bg-ui-surface p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-neutral-100 pb-3">
          5. Galería Multimedia (Fotografías)
        </h2>

        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Pegar URL de fotografía (ej. https://images.unsplash.com/...)"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="px-4 py-2.5 bg-brand-primary hover:bg-opacity-90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Agregar Foto</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl overflow-hidden border-2 bg-neutral-100 flex flex-col ${
                img.isMain ? "border-brand-accent shadow-md" : "border-neutral-200"
              }`}
            >
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={img.url}
                  alt={img.caption || `Foto ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-white flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleSetMainImage(idx)}
                  className={`flex items-center gap-1 font-bold ${
                    img.isMain ? "text-brand-accent" : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${img.isMain ? "fill-current" : ""}`} />
                  <span>{img.isMain ? "Portada" : "Marcar Portada"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Asesor Inmobiliario Asignado */}
      <section className="bg-ui-surface p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-neutral-100 pb-3">
          6. Asignación de Asesor Responsable (Obligatorio)
        </h2>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Seleccionar Asesor Inmobiliario *
          </label>
          <select
            value={agentId}
            required
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            <option value="">-- Seleccionar Asesor --</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} — {agent.position}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-secondary mt-1.5">
            El botón de WhatsApp en la ficha pública del inmueble contactará directamente a este asesor.
          </p>
        </div>
      </section>

      {/* Boton Guardar Final */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-brand-accent hover:bg-[#c94b21] text-white font-bold px-8 py-3.5 rounded-2xl shadow-xl transition-all active:scale-95 text-base disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{isSubmitting ? "Guardando..." : "Guardar Inmueble"}</span>
        </button>
      </div>
    </form>
  );
}
