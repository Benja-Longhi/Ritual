/**
 * Activos explicados simple: la parte "skintellectual" de la marca. Los
 * dermocosméticos son los protagonistas; los botánicos acompañan.
 * Textos provisorios: validar con quien formula.
 */

export type ActiveId =
  | "hialuronico"
  | "vitamina-c"
  | "niacinamida"
  | "peptidos"
  | "retinol"
  | "bakuchiol"
  | "te-verde"
  | "aloe"
  | "pantenol"
  | "cafeina"
  | "jojoba"
  | "vitamina-e"
  | "escualano";

export type Active = {
  id: ActiveId;
  name: string;
  /** Dermocosmético (eficacia comprobada) o botánico (acompaña). */
  kind: "dermo" | "botanico";
  /** Qué hace, en una frase y sin jerga. */
  what: string;
};

export const actives: Record<ActiveId, Active> = {
  hialuronico: {
    id: "hialuronico",
    name: "Ácido hialurónico",
    kind: "dermo",
    what: "Retiene agua en la piel como una esponja: hidrata y rellena desde la superficie.",
  },
  "vitamina-c": {
    id: "vitamina-c",
    name: "Vitamina C",
    kind: "dermo",
    what: "Antioxidante: ayuda a defender la piel de la contaminación y empareja el tono.",
  },
  niacinamida: {
    id: "niacinamida",
    name: "Niacinamida",
    kind: "dermo",
    what: "Vitamina B3: refuerza la barrera de la piel, afina la textura y calma las rojeces.",
  },
  peptidos: {
    id: "peptidos",
    name: "Péptidos",
    kind: "dermo",
    what: "Cadenas cortas de aminoácidos que estimulan el colágeno: firmeza donde la piel es más fina.",
  },
  retinol: {
    id: "retinol",
    name: "Retinol",
    kind: "dermo",
    what: "Derivado de la vitamina A: acelera la renovación de la piel y mejora textura, tono y líneas.",
  },
  bakuchiol: {
    id: "bakuchiol",
    name: "Bakuchiol",
    kind: "dermo",
    what: "Activo vegetal con un efecto parecido al del retinol, más amable con las pieles sensibles.",
  },
  "te-verde": {
    id: "te-verde",
    name: "Té verde",
    kind: "botanico",
    what: "Antioxidante vegetal: suma defensa desde el primer paso del día.",
  },
  aloe: { id: "aloe", name: "Aloe vera", kind: "botanico", what: "Calma e hidrata sin peso." },
  pantenol: { id: "pantenol", name: "Pantenol", kind: "botanico", what: "Provitamina B5: suaviza y ayuda a reparar." },
  cafeina: { id: "cafeina", name: "Cafeína", kind: "botanico", what: "Descongestiona y desinflama la mirada cansada." },
  jojoba: {
    id: "jojoba",
    name: "Aceite de jojoba",
    kind: "botanico",
    what: "Se parece al sebo natural de la piel: disuelve impurezas sin resecar.",
  },
  "vitamina-e": {
    id: "vitamina-e",
    name: "Vitamina E",
    kind: "botanico",
    what: "Antioxidante que cuida los aceites de la fórmula y a la piel.",
  },
  escualano: {
    id: "escualano",
    name: "Escualano de oliva",
    kind: "botanico",
    what: "Hidrata y suaviza como los aceites propios de la piel, sin dejar brillo.",
  },
};

/** Los activos que la marca explica en primer plano (en el orden en que aparecen en el día). */
export const starActives: ActiveId[] = ["vitamina-c", "hialuronico", "niacinamida", "peptidos", "retinol", "bakuchiol"];

export function getActive(id: ActiveId): Active {
  return actives[id];
}
