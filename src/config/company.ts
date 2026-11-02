// Informacion legal, corporativa y de contacto centralizada
export const COMPANY_CONFIG = {
  legalName: "INVERSIONES INMOBILIARIA LOS ANDES, C.A.",
  tradeName: "Inmobiliaria Los Andes",
  rif: "J508799380",
  rifFormatted: "J-50879938-0",
  address: {
    street: "AV INDEPENDENCIA LOCAL NRO 6-22",
    sector: "SECTOR CENTRO CHIQUINQUIRA",
    city: "TRUJILLO",
    state: "TRUJILLO",
    postalCode: "3102",
    country: "Venezuela",
    fullAddress: "AV INDEPENDENCIA LOCAL NRO 6-22 SECTOR CENTRO CHIQUINQUIRA (TRUJILLO) TRUJILLO ZONA POSTAL 3102",
  },
  contact: {
    phone: "",
    email: "",
    whatsapp: "",
  },
  social: {
    instagram: "",
    facebook: "",
  },
} as const;

export type CompanyConfig = typeof COMPANY_CONFIG;

