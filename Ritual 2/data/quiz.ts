import type { LightId } from "@/lib/palette";
import { getProduct, type Moment, type Product } from "./products";
import { buildRoutine, routineProducts, type Routine } from "./routines";

/**
 * El test "¿Por dónde empiezo?": tres preguntas y reglas simples que arman
 * una rutina con los siete rituales. Reglas provisorias, fáciles de ajustar.
 */

export type SkinType = "seca" | "mixta" | "grasa" | "sensible" | "normal";
export type Focus = "luminosidad" | "firmeza" | "calma" | "hidratacion" | "renovacion";
export type Time = "esencial" | "noche" | "completo";

export type QuizAnswers = { skin: SkinType; focus: Focus; time: Time };

type Option<T extends string> = { value: T; label: string; hint: string };

export const questions = [
  {
    id: "skin",
    title: "¿Cómo sentís tu piel a media tarde?",
    options: [
      { value: "seca", label: "Tirante o áspera", hint: "Piel seca" },
      { value: "mixta", label: "Brillosa solo en la zona T", hint: "Piel mixta" },
      { value: "grasa", label: "Brillosa en todo el rostro", hint: "Piel grasa" },
      { value: "sensible", label: "Se enrojece o pica fácil", hint: "Piel sensible" },
      { value: "normal", label: "Bien, sin quejas", hint: "Piel normal" },
    ] satisfies Option<SkinType>[],
  },
  {
    id: "focus",
    title: "¿Qué te gustaría ver primero?",
    options: [
      { value: "luminosidad", label: "Un tono más parejo y luminoso", hint: "Luminosidad" },
      { value: "firmeza", label: "Líneas más suaves", hint: "Firmeza" },
      { value: "calma", label: "Menos rojez y tirantez", hint: "Calma" },
      { value: "hidratacion", label: "Una piel que no se reseque", hint: "Hidratación profunda" },
      { value: "renovacion", label: "Una textura más fina y pareja", hint: "Renovación celular" },
    ] satisfies Option<Focus>[],
  },
  {
    id: "time",
    title: "¿Cuánto tiempo le das a tu ritual?",
    options: [
      { value: "esencial", label: "Un par de minutos, mañana y noche", hint: "Esencial" },
      { value: "noche", label: "Poco de mañana, más de noche", hint: "Noche completa" },
      { value: "completo", label: "Me tomo mi tiempo", hint: "Ritual completo" },
    ] satisfies Option<Time>[],
  },
] as const;

/** El ritual que suma cada prioridad, y en qué momento va. */
const focusPick: Record<Focus, { slug: LightId; moments: Moment[] }> = {
  luminosidad: { slug: "prisma", moments: ["am"] },
  firmeza: { slug: "vertice", moments: ["am", "pm"] },
  calma: { slug: "aura", moments: ["am"] },
  hidratacion: { slug: "aura", moments: ["am"] },
  renovacion: { slug: "genesis", moments: ["pm"] },
};

const tips: Record<Focus, string> = {
  luminosidad: "La vitamina C de Prisma rinde más si nunca salteás el protector solar.",
  firmeza: "Vértice va con toquecitos del dedo anular: la piel de la mirada es la más fina.",
  calma: "Agua tibia, toquecitos y nada de frotar: tu piel lo nota desde el primer día.",
  hidratacion: "Aplicá Prisma con la piel todavía húmeda por Aura: retiene más agua.",
  renovacion: "Génesis trabaja mientras dormís: la constancia es todo, y de día, protector.",
};

/** Suma un ritual a una rutina respetando el orden de aplicación. */
function withProduct(routine: Routine, product: Product): Routine {
  if (routine.products.some((p) => p.slug === product.slug)) return routine;
  const reference = buildRoutine(routine.moment, "completo")[0].products.map((p) => p.slug);
  const products = [...routine.products, product].sort((a, b) => reference.indexOf(a.slug) - reference.indexOf(b.slug));
  return { ...routine, products };
}

export type QuizResult = { routines: Routine[]; products: Product[]; tip: string };

export function buildQuizRitual({ skin, focus, time }: QuizAnswers): QuizResult {
  let routines: Routine[] =
    time === "completo"
      ? buildRoutine("dia", "completo")
      : time === "noche"
        ? [...buildRoutine("am", "esencial"), ...buildRoutine("pm", "completo")]
        : buildRoutine("dia", "esencial");

  const pick = focusPick[focus];
  const focusProduct = getProduct(pick.slug)!;
  routines = routines.map((r) => (pick.moments.includes(r.moment) ? withProduct(r, focusProduct) : r));

  const products = routineProducts(routines);
  const hasRetinol = products.some((p) => p.slug === "genesis");
  const tip =
    skin === "sensible" && hasRetinol
      ? "Tu piel es sensible: empezá con Génesis una noche por semana y subí de a poco."
      : skin === "grasa" && focus !== "hidratacion"
        ? "No saltees Mantra: la piel deshidratada produce más grasa, no menos."
        : tips[focus];

  return { routines, products, tip };
}
