import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Optimizaciones de rendimiento y cuotas para Vercel Hobby + Neon */
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400, // 31 días en caché Edge CDN para no agotar la cuota de 1.000 optimizaciones/mes
    deviceSizes: [640, 768, 1080, 1280], // Limita anchos máximos evitando generar variantes 4K innecesarias
    imageSizes: [48, 96, 128, 256, 384], // Variantes para miniaturas y tarjetas
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.utfs.io" },
      { protocol: "https", hostname: "ufs.sh" },
      { protocol: "https", hostname: "*.ufs.sh" },
    ],
  },
  compress: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
