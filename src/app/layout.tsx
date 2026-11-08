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
  title: {
    default: COMPANY_CONFIG.tradeName,
    template: `%s | ${COMPANY_CONFIG.tradeName}`,
  },
  description: `Plataforma oficial de ${COMPANY_CONFIG.legalName}. Venta y alquiler de propiedades.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-ui-background text-text-primary">
        {children}
        <Toaster position="top-right" closeButton duration={4500} />
      </body>
    </html>
  );
}
