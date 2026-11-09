/**
 * Los 7 beneficios clave del documento de marca: cada fórmula aporta a uno
 * o más pilares de una piel sana. Se usan como filtro y en cada ficha.
 */

export type BenefitId = "antiedad" | "hidratacion" | "luminosidad" | "firmeza" | "barrera" | "calma" | "renovacion";

export type Benefit = { id: BenefitId; label: string; hint: string };

export const benefits: Benefit[] = [
  { id: "antiedad", label: "Antiedad", hint: "Acompaña los cambios de la piel con el tiempo." },
  { id: "hidratacion", label: "Hidratación profunda", hint: "Agua que la piel retiene durante horas." },
  { id: "luminosidad", label: "Luminosidad", hint: "Tono parejo y un brillo propio." },
  { id: "firmeza", label: "Firmeza", hint: "Sostén para la piel más fina." },
  { id: "barrera", label: "Protección barrera", hint: "Defensa frente a lo que viene de afuera." },
  { id: "calma", label: "Calma", hint: "Menos rojez, menos tirantez." },
  { id: "renovacion", label: "Renovación celular", hint: "La piel se rehace mientras dormís." },
];

const byId = new Map(benefits.map((b) => [b.id, b]));

export function isBenefitId(value: unknown): value is BenefitId {
  return typeof value === "string" && byId.has(value as BenefitId);
}
