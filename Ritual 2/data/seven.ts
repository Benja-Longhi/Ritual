import { benefits } from "./benefits";
import { products, type Product } from "./products";

/**
 * El manifiesto del 7: el número es el eje de la marca y se despliega en
 * cuatro dimensiones (textos del documento de marca).
 */

export const manifesto =
  "7RITUAL resignifica la belleza como un concepto holístico, de salud y bienestar: un equilibrio interno que se manifiesta en el exterior.";

export const origin = {
  lead: "7RITUAL nace como una respuesta holística a la cosmética contemporánea.",
  body: [
    "Fusiona la rigurosidad de la ciencia dérmica con la mística del bienestar integral.",
    "Concebimos el cuidado de la piel no como una tarea automática, sino como un acto sagrado de reconexión diaria.",
    "La marca transforma la rutina de belleza en un espacio de pausa, consciencia y eficacia real.",
  ],
};

export const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

/** Los 7 pasos de cuidado y qué ritual cubre cada uno. */
export const careSteps: { name: string; rituals: Product["slug"][] }[] = [
  { name: "Limpieza", rituals: ["alba", "eclipse"] },
  { name: "Tonificación", rituals: ["aura"] },
  { name: "Activación", rituals: ["prisma"] },
  { name: "Hidratación", rituals: ["mantra"] },
  { name: "Firmeza y contorno", rituals: ["vertice"] },
  { name: "Protección", rituals: ["aura"] },
  { name: "Renovación nocturna", rituals: ["genesis"] },
];

export type DimensionId = "dias" | "pasos" | "beneficios" | "rituales";

export type Dimension = {
  id: DimensionId;
  /** "7 días" */
  title: string;
  /** La idea que la ordena. */
  idea: string;
  text: string;
  /** Los siete elementos de esta dimensión. */
  items: string[];
};

export const dimensions: Dimension[] = [
  {
    id: "dias",
    title: "7 días",
    idea: "Sincronicidad biológica",
    text: "Un cuidado dinámico que entiende que la piel cambia y se adapta a los ritmos de la semana, las estaciones y el ambiente.",
    items: [...weekdays],
  },
  {
    id: "pasos",
    title: "7 pasos",
    idea: "Estructura modular",
    text: "De lo esencial a una experiencia completa de siete pasos: vos elegís cuántos, según tu día.",
    items: careSteps.map((s) => s.name),
  },
  {
    id: "beneficios",
    title: "7 beneficios",
    idea: "Promesa multifuncional",
    text: "Cada fórmula aporta a los pilares de una piel sana, y juntas los cubren todos.",
    items: benefits.map((b) => b.label),
  },
  {
    id: "rituales",
    title: "7 rituales",
    idea: "Sintonía emocional",
    text: "Productos pensados para un estado de ánimo y un momento: del despertar de Alba a la pausa de Génesis.",
    items: products.map((p) => p.name),
  },
];
