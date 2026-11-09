import type { MetadataRoute } from "next";

// Reglas de rastreo e indexación para motores de búsqueda (Google, Bing)
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://inmobiliarialosandes.com");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

