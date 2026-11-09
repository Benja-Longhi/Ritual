import { getProduct, type Product } from "@/data/products";
import type { LightId } from "./palette";

/**
 * Qué ritual acompaña cada hora del día. Lo usan el chip "Ahora" del hero,
 * el menú, el reloj de /ritual y el footer.
 */

export type DayPart = "manana" | "dia" | "tarde" | "noche";

export type NowRitual = {
  part: DayPart;
  /** El ritual de este momento. */
  product: Product;
  label: string;
  hint: string;
  icon: "sun" | "moon";
};

const parts: Record<DayPart, { slug: LightId; label: string; hint: string; icon: "sun" | "moon" }> = {
  manana: { slug: "alba", label: "Ritual de mañana", hint: "Alba, Aura, Prisma y Vértice.", icon: "sun" },
  dia: { slug: "aura", label: "Pleno día", hint: "Aura refresca la piel, incluso sobre el maquillaje.", icon: "sun" },
  tarde: { slug: "eclipse", label: "La vuelta a casa", hint: "Eclipse te saca el día de encima.", icon: "moon" },
  noche: { slug: "mantra", label: "Ritual de noche", hint: "Eclipse, Génesis, Vértice y Mantra.", icon: "moon" },
};

export function dayPartAt(hour: number): DayPart {
  if (hour >= 5 && hour < 10) return "manana";
  if (hour >= 10 && hour < 18) return "dia";
  if (hour >= 18 && hour < 21) return "tarde";
  return "noche";
}

/** El ritual que acompaña una hora decimal (0–24). */
export function ritualAt(hour: number): NowRitual {
  const part = dayPartAt(hour);
  const { slug, ...rest } = parts[part];
  // De noche, pasadas las once, la hora es de Génesis.
  const product = getProduct(part === "noche" && (hour >= 23 || hour < 5) ? "genesis" : slug)!;
  return { part, product, ...rest };
}

export function hourOf(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}

const clock = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });

export function formatClock(date: Date): string {
  return clock.format(date);
}

/** "07:30" a partir de una hora decimal. */
export function formatHour(hour: number): string {
  const total = Math.round(hour * 60);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
