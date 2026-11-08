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
    phone: "+58 412-2431716",
    phoneFormatted: "+58 (412) 243-1716",
    phoneRaw: "584122431716",
    email: "inv.inm.losandes@gmail.com",
    whatsapp: "+584122431716",
  },
  social: {
    instagram: "inv_inmobiliarialosandes",
    instagramUrl: "https://instagram.com/inv_inmobiliarialosandes",
    facebook: "",
  },
} as const;

export type CompanyConfig = typeof COMPANY_CONFIG;

