import { ShieldCheck, Scale, Clock, HeartHandshake } from "lucide-react";

// Seccion institucional que expone los pilares de confianza y diferenciacion de la firma
export function TrustSection() {
  const pillars = [
    {
      icon: Scale,
      title: "Seguridad Jurídica y Notarial",
      description:
        "Verificación exhaustiva de títulos, tradición legal, solvencias municipales y redacción de documentos para blindar tu operación.",
    },
    {
      icon: ShieldCheck,
      title: "Cartera 100% Verificada",
      description:
        "Cada inmueble publicado cuenta con inspección física previa, documentación en regla y avalúo comercial acorde al mercado trujillano.",
    },
    {
      icon: HeartHandshake,
      title: "Acompañamiento Integral",
      description:
        "Un asesor inmobiliario dedicado te guiará personalmente desde la primera visita hasta la firma final en el Registro Público.",
    },
    {
      icon: Clock,
      title: "Celeridad y Transparencia",
      description:
        "Gestión ágil para compradores, propietarios e inversionistas con información clara y sin comisiones ocultas.",
    },
  ];

  return (
    <section id="nosotros" className="py-20 bg-ui-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-accent block">
            Por Qué Elegirnos
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-brand-primary font-heading tracking-tight">
            El Estándar de Confianza en Bienes Raíces
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Combinamos solidez jurídica, conocimiento local del mercado y tecnología de vanguardia para proteger tu patrimonio familiar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-neutral-50/70 hover:bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 space-y-3.5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:bg-brand-accent group-hover:text-white transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-brand-primary font-heading">
                  {item.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

