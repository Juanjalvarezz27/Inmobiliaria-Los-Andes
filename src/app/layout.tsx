import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { COMPANY_CONFIG } from "@/config/company";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://inmobiliarialosandes.com")
  ),
  title: {
    default: COMPANY_CONFIG.tradeName,
    template: `%s | ${COMPANY_CONFIG.tradeName}`,
  },
  description: `Plataforma oficial de ${COMPANY_CONFIG.legalName}. Venta y alquiler de propiedades en Trujillo y toda Venezuela.`,
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: COMPANY_CONFIG.tradeName,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-ui-background text-text-primary">
        {children}
        <Toaster position="top-right" closeButton duration={4500} />
      </body>
    </html>
  );
}
