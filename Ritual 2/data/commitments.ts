/**
 * Los tres compromisos de la marca (documento de marca). Cada uno es una
 * "ventana" en la landing y una sección en /nosotros.
 */

export type CommitmentId = "consciencia" | "experiencia" | "eficacia";

export type Commitment = {
  id: CommitmentId;
  /** La palabra que lo resume. */
  name: string;
  title: string;
  text: string;
};

export const commitments: Commitment[] = [
  {
    id: "consciencia",
    name: "Consciencia",
    title: "Clean beauty y vegana",
    text: "Fórmulas libres de parabenos, sulfatos, siliconas cosméticas e ingredientes de origen animal. Cruelty-free siempre, con materias primas naturales obtenidas de forma ética.",
  },
  {
    id: "experiencia",
    name: "Experiencia",
    title: "Cosmética neurosensorial",
    text: "Un vínculo entre la piel y la mente: cada fórmula lleva activos de aromaterapia que bajan el estrés de la piel y el emocional.",
  },
  {
    id: "eficacia",
    name: "Eficacia",
    title: "Skintellectual",
    text: "Honestidad científica: activos de vanguardia y eficacia comprobada, explicados de forma simple, transparente y accesible.",
  },
];

/** Lo que ninguna fórmula lleva. */
export const freeFrom = [
  "Parabenos",
  "Sulfatos",
  "Siliconas cosméticas",
  "Ingredientes de origen animal",
  "Testeo en animales",
] as const;
