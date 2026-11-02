import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import { COMPANY_CONFIG } from "@/config/company";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      className={`${poppins.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-ui-background text-text-primary">
        {children}
      </body>
    </html>
  );
}
