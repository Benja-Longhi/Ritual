import { z } from "zod";

export const contactReasons = [
  "Consulta sobre mi rutina",
  "Estado de mi pedido",
  "Cambios y devoluciones",
  "Ventas mayoristas",
  "Prensa y colaboraciones",
  "Otra cosa",
] as const;

/** Mismo esquema en el cliente (react-hook-form) y en el servidor (acción). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Contanos cómo te llamás."),
  email: z.email("Revisá el mail: no parece válido."),
  reason: z.enum(contactReasons, "Elegí un motivo."),
  message: z
    .string()
    .trim()
    .min(20, "Escribinos un poco más (mínimo 20 caracteres).")
    .max(1500, "Es un poco largo: hasta 1500 caracteres."),
});

export type ContactInput = z.infer<typeof contactSchema>;
