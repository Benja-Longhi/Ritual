"use server";

import { contactSchema, type ContactInput } from "@/lib/contactSchema";

export type ContactResult = { ok: true } | { ok: false; message: string };

/**
 * Envío simulado del formulario. Valida de nuevo en el servidor; para
 * producción, reemplazar el delay por el envío real (mail, CRM, etc.).
 */
export async function sendContact(input: ContactInput): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revisá los datos del formulario." };
  }
  await new Promise((r) => setTimeout(r, 1100));
  return { ok: true };
}
