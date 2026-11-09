/**
 * Datos de marca. Contacto, precios de envío y descuentos son provisorios:
 * se cambian acá y se actualizan en todo el sitio.
 */
export const site = {
  name: "7RITUAL",
  tagline: "La belleza a tu propio ritmo",
  description:
    "7RITUAL resignifica la belleza como un concepto holístico, de salud y bienestar: siete rituales de cosmética clean y vegana que acompañan a tu piel de la primera luz del día a la noche.",
  /** El dominio de producción de Vercel hasta que haya uno propio (NEXT_PUBLIC_SITE_URL). */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://7ritual.com.ar"),
  email: "hola@7ritual.com.ar",
  phone: "+54 9 11 5555-0177",
  whatsapp: "5491155550177",
  instagram: "@7ritual",
  address: "Buenos Aires, Argentina",
  hours: "Lunes a viernes de 9 a 18 h",
  /** Envío gratis desde este monto (ARS). */
  freeShippingFrom: 70000,
  /** Descuento automático cuando el carrito tiene los 7 rituales. */
  ritualDiscount: 0.15,
  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "TikTok", href: "https://tiktok.com/" },
    { label: "Pinterest", href: "https://pinterest.com/" },
  ],
} as const;

export const navLinks = [
  { href: "/productos", label: "Rituales" },
  { href: "/ritual", label: "El método" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;
