import { getProduct, type Moment, type Product } from "./products";
import type { LightId } from "@/lib/palette";

/**
 * Estructura modular: de lo esencial al ritual completo. El orden es el de
 * aplicación (de la textura más liviana a la más rica), que no siempre es
 * el número del ritual. Rutinas provisorias: validar con quien formula.
 */

export type Intensity = "esencial" | "completo";
export type RoutineScope = Moment | "dia";

const order: Record<Moment, Record<Intensity, LightId[]>> = {
  am: { esencial: ["alba", "prisma"], completo: ["alba", "aura", "prisma", "vertice"] },
  pm: { esencial: ["eclipse", "mantra"], completo: ["eclipse", "genesis", "vertice", "mantra"] },
};

export const intensityLabel: Record<Intensity, { label: string; hint: string }> = {
  esencial: { label: "Esencial", hint: "Lo justo, en un par de minutos." },
  completo: { label: "Completo", hint: "Todos los pasos, con tiempo para vos." },
};

export const scopeLabel: Record<RoutineScope, string> = { am: "Mañana", pm: "Noche", dia: "Día completo" };

export type Routine = { moment: Moment; products: Product[] };

export function buildRoutine(scope: RoutineScope, intensity: Intensity): Routine[] {
  const moments: Moment[] = scope === "dia" ? ["am", "pm"] : [scope];
  return moments.map((moment) => ({
    moment,
    products: order[moment][intensity].map((slug) => getProduct(slug)!),
  }));
}

/** Productos distintos de una rutina (Vértice va de mañana y de noche, pero se compra una vez). */
export function routineProducts(routines: Routine[]): Product[] {
  return [...new Map(routines.flatMap((r) => r.products).map((p) => [p.slug, p])).values()];
}

/** Minutos por día, redondeados hacia arriba. */
export function routineMinutes(routines: Routine[]): number {
  const seconds = routines.reduce((sum, r) => sum + r.products.reduce((s, p) => s + p.seconds, 0), 0);
  return Math.max(1, Math.ceil(seconds / 60));
}

/**
 * Sincronicidad: la semana de Génesis. El retinol se suma de a poco
 * (lunes, miércoles y viernes al empezar); el resto va todos los días.
 */
export const genesisStartNights = [0, 2, 4];
