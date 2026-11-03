import { MessageCircle } from "lucide-react";

// Boton flotante discreto de atencion rapida por WhatsApp para visitantes
export function FloatingWhatsApp() {
  const waUrl =
    "https://wa.me/584140000000?text=Hola,%20estoy%20navegando%20en%20su%20portal%20web%20y%20deseo%20asesor%C3%ADa%20inmobiliaria.";

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/30 cursor-pointer"
        title="Chatear con un asesor inmobiliario"
      >
        <MessageCircle className="w-5 h-5 fill-white text-emerald-500" />
        <span className="hidden sm:inline">¿Hablamos por WhatsApp?</span>
      </a>
    </div>
  );
}

