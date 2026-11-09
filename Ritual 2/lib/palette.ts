/**
 * La paleta en hex para contextos que no leen CSS (three.js, canvas, OG).
 * Espejo exacto de los tokens de app/globals.css: mantener sincronizados.
 */
export const palette = {
  papel: "#e9dfc8",
  papelClaro: "#f2ebdc",
  profundo: "#34271e",
  noche: "#241b15",
  cafe: "#9a7556",
  pino: "#46604f",
  pasto: "#8fb07a",
} as const;

/** Las luces del día: una por ritual, de la primera luz a la noche. */
export const light = {
  alba: "#e6d6cb",
  aura: "#d3d8c4",
  prisma: "#ddcb98",
  vertice: "#c4ad8e",
  eclipse: "#7a5b43",
  mantra: "#46604f",
  genesis: "#2a211b",
} as const;

export type LightId = keyof typeof light;

/** Las luces oscuras llevan texto papel; las claras, texto profundo. */
export const darkLights: readonly LightId[] = ["eclipse", "mantra", "genesis"];

export const isDarkLight = (id: LightId) => darkLights.includes(id);

/** Tonos de materiales que no son de la UI pero sí de los envases. */
export const material = {
  /** Vidrio dorado del sérum de vitamina C. */
  goldGlass: "#b48a4a",
  /** Vidrio ahumado del óleo. */
  smokeGlass: "#5e4636",
  /** Vidrio casi negro del sérum de noche. */
  nightGlass: "#2b211b",
  /** Vidrio verde tenue de la bruma. */
  veilGlass: "#c9d2bd",
  /** Contenidos */
  gel: "#ece3cf",
  vitaminC: "#e2b552",
  oil: "#c99a4b",
  retinol: "#d7a64a",
} as const;
