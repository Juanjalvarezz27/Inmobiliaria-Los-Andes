import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { COMPANY_CONFIG } from "@/config/company";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-ui-background text-text-primary">
        {children}
      </body>
    </html>
  );
}
