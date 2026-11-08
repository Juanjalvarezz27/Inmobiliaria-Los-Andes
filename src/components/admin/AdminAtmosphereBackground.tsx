import React from "react";

// Fondo atmosferico beige andino de ultra-alto rendimiento con destellos naranja
export function AdminAtmosphereBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden will-change-transform"
      style={{ transform: "translateZ(0)" }}
    >
      {/* Capa de destellos unificada mediante gradientes radiales por hardware */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#FAF7F2",
          backgroundImage: `
            radial-gradient(circle at 92% 5%, rgba(242, 116, 65, 0.28) 0%, rgba(222, 88, 42, 0.12) 35%, transparent 65%),
            radial-gradient(circle at 22% 8%, rgba(249, 115, 22, 0.24) 0%, rgba(234, 88, 12, 0.10) 30%, transparent 55%),
            radial-gradient(circle at 0% 35%, rgba(242, 116, 65, 0.25) 0%, rgba(234, 88, 12, 0.10) 30%, transparent 50%),
            radial-gradient(circle at 96% 52%, rgba(234, 88, 12, 0.26) 0%, rgba(242, 116, 65, 0.12) 30%, transparent 60%),
            radial-gradient(circle at 45% 48%, rgba(251, 146, 60, 0.18) 0%, transparent 50%),
            radial-gradient(circle at 8% 92%, rgba(242, 116, 65, 0.26) 0%, rgba(222, 88, 42, 0.10) 30%, transparent 55%),
            radial-gradient(circle at 88% 90%, rgba(249, 115, 22, 0.24) 0%, transparent 55%),
            linear-gradient(to bottom, #FAF7F2 0%, #F4EDE2 50%, #EAE0D3 100%)
          `,
        }}
      />

      {/* Patron cartografico andino optimizado sin mascaras pesadas de recorte */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.16]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="admin-topography-pattern"
            width="360"
            height="360"
            patternUnits="userSpaceOnUse"
          >
            <g stroke="#C28A5B" strokeWidth="0.8" fill="none">
              <path d="M 125 135 C 135 120 160 125 165 140 C 170 155 152 165 140 162 C 128 160 120 148 125 135 Z" />
              <path d="M 110 125 C 125 102 175 108 185 132 C 195 158 168 180 140 178 C 114 176 98 150 110 125 Z" />
              <path d="M 92 112 C 115 80 192 88 205 125 C 218 165 182 198 140 195 C 100 192 75 152 92 112 Z" />
              <path d="M 70 98 C 102 58 212 65 228 115 C 242 168 198 218 140 215 C 85 212 50 158 70 98 Z" />
              <path d="M 45 80 C 88 32 235 40 252 105 C 270 172 215 240 140 236 C 68 232 25 165 45 80 Z" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#admin-topography-pattern)" />
      </svg>
    </div>
  );
}
