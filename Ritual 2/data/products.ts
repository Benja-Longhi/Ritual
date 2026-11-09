/**
 * Los siete rituales de 7RITUAL, tal como los define el documento de marca:
 * nombre, concepto y frase de packaging son de la marca. Precios, tamaños,
 * fórmulas, aromas y beneficios asignados son provisorios (validar).
 * La UI solo consume `Product` y las funciones de abajo: fácil de pasar a un CMS.
 */

import { light, material, palette, type LightId } from "@/lib/palette";
import type { ActiveId } from "./actives";
import type { BenefitId } from "./benefits";

export type RitualId = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Moment = "am" | "pm";
export type Block = "am" | "comodin" | "pm";
export type Format = "gotero" | "pote" | "pomo" | "dosificador" | "bruma";

/** Cómo se ve el envase: lo usan el packshot SVG y el modelo 3D. */
export type Packaging = {
  body: string;
  /** Cuerpo de vidrio: se ve el contenido. */
  glass?: boolean;
  liquid?: string;
  cap: string;
  /** Fondo y tinta de la etiqueta. */
  label: string;
  ink: string;
};

export type Product = {
  id: RitualId;
  /** El nombre en minúscula: es la URL y también su luz (var(--color-alba)…). */
  slug: LightId;
  name: string;
  /** Lo que va entre corchetes: "[ Limpiador Purificante ]". */
  type: string;
  /** Qué es, en palabras de todos los días. */
  product: string;
  block: Block;
  moments: Moment[];
  /** Cuándo, en palabras: así aparece en el recorrido del día. */
  when: string;
  /** Hora del recorrido del día (0–24): la luz y el reloj de la landing. */
  hour: number;
  concept: string;
  /** Código sutil del packaging. */
  phrase: string;
  description: string;
  actives: ActiveId[];
  benefits: BenefitId[];
  /** Cosmética neurosensorial: notas de aromaterapia y el estado que buscan. */
  aroma: { notes: [string, string]; mood: string };
  format: Format;
  size: string;
  /** Precio en ARS, sin decimales. */
  price: number;
  /** Cuánto lleva aplicarlo, en segundos (para armar la rutina). */
  seconds: number;
  texture: string;
  howTo: string[];
  frequency: string;
  inci: string[];
  pack: Packaging;
  /** Ruta a la foto real cuando exista; mientras tanto se dibuja el packshot. */
  image?: string;
};

export const products: Product[] = [
  {
    id: 1,
    slug: "alba",
    name: "Alba",
    type: "Limpiador Purificante",
    product: "Gel limpiador facial antioxidante",
    block: "am",
    moments: ["am"],
    when: "Al despertar",
    hour: 6.5,
    concept: "Representa la primera luz del día, el nacimiento y la limpieza absoluta para empezar de cero.",
    phrase: "El espacio en blanco. La calma antes de que comience el día.",
    description:
      "Un gel que se vuelve espuma suave y limpia sin arrastrar la barrera de la piel. Sus antioxidantes vegetales la dejan lista para lo que traiga el día.",
    actives: ["te-verde", "aloe"],
    benefits: ["barrera", "calma", "luminosidad"],
    aroma: { notes: ["Pomelo", "Menta"], mood: "Despertar" },
    format: "dosificador",
    size: "150 ml",
    price: 24900,
    seconds: 60,
    texture: "Gel transparente que se vuelve espuma suave",
    howTo: [
      "Humedecé el rostro con agua tibia.",
      "Dos disparos en las manos: frotalas hasta hacer espuma.",
      "Masajeá un minuto con movimientos circulares.",
      "Enjuagá y secá a toquecitos, sin frotar.",
    ],
    frequency: "Todas las mañanas",
    inci: [
      "Aqua",
      "Coco-Glucoside",
      "Glycerin",
      "Sodium Cocoyl Glutamate",
      "Camellia Sinensis Leaf Extract",
      "Aloe Barbadensis Leaf Juice",
      "Citrus Paradisi Peel Oil",
      "Mentha Piperita Oil",
      "Tocopherol",
      "Xanthan Gum",
      "Sodium Benzoate",
      "Potassium Sorbate",
      "Citric Acid",
      "Limonene",
    ],
    pack: { body: palette.papelClaro, cap: palette.profundo, label: light.alba, ink: palette.profundo },
  },
  {
    id: 2,
    slug: "aura",
    name: "Aura",
    type: "Bruma de Protección",
    product: "Bruma tónica con niacinamida",
    block: "am",
    moments: ["am"],
    when: "Después de limpiar",
    hour: 7.25,
    concept:
      "El campo protector, la energía que nos rodea. Traducido a la piel: la barrera cutánea protegida de los agentes externos.",
    phrase: "Un velo imperceptible. La suavidad que guarda tu propio ritmo.",
    description:
      "Una bruma finísima que tonifica y deja un velo que no se siente. La niacinamida refuerza la barrera de la piel frente a la contaminación, el viento y los cambios de clima.",
    actives: ["niacinamida", "pantenol"],
    benefits: ["barrera", "hidratacion", "calma"],
    aroma: { notes: ["Azahar", "Té blanco"], mood: "Serenidad" },
    format: "bruma",
    size: "100 ml",
    price: 22900,
    seconds: 15,
    texture: "Bruma ultrafina, sin alcohol",
    howTo: [
      "Agitá antes de usar.",
      "Dos o tres disparos a 20 cm del rostro, con los ojos cerrados.",
      "Presioná suave con las palmas y seguí con Prisma.",
    ],
    frequency: "Todas las mañanas, y de día cuando la piel lo pida",
    inci: [
      "Aqua",
      "Citrus Aurantium Amara Flower Water",
      "Niacinamide",
      "Glycerin",
      "Panthenol",
      "Sodium PCA",
      "Camellia Sinensis Leaf Extract",
      "Sodium Levulinate",
      "Sodium Anisate",
      "Citric Acid",
    ],
    pack: {
      body: material.veilGlass,
      glass: true,
      liquid: palette.papelClaro,
      cap: palette.profundo,
      label: light.aura,
      ink: palette.profundo,
    },
  },
  {
    id: 3,
    slug: "prisma",
    name: "Prisma",
    type: "Sérum Iluminador",
    product: "Sérum de vitamina C y ácido hialurónico",
    block: "am",
    moments: ["am"],
    when: "Antes de salir",
    hour: 8,
    concept:
      "El objeto que descompone la luz y la multiplica. El producto busca que la piel refleje su máximo brillo natural (efecto glow).",
    phrase: "La claridad se refleja desde adentro. El destello más sutil.",
    description:
      "Vitamina C estable en una base de ácido hialurónico: unifica el tono, suma defensa antioxidante y deja la piel con su brillo propio. Glow, sin brillo graso.",
    actives: ["vitamina-c", "hialuronico"],
    benefits: ["luminosidad", "antiedad", "hidratacion"],
    aroma: { notes: ["Naranja dulce", "Jengibre"], mood: "Claridad" },
    format: "gotero",
    size: "30 ml",
    price: 38900,
    seconds: 30,
    texture: "Fluido acuoso que se absorbe al instante",
    howTo: [
      "Sobre la piel limpia, todavía húmeda por Aura.",
      "Tres gotas en las palmas.",
      "Presioná sobre rostro y cuello, sin frotar.",
      "De día, terminá con tu protector solar.",
    ],
    frequency: "Todas las mañanas",
    inci: [
      "Aqua",
      "Ascorbyl Glucoside",
      "Glycerin",
      "Sodium Hyaluronate",
      "Hydrolyzed Sodium Hyaluronate",
      "Ferulic Acid",
      "Tocopherol",
      "Citrus Aurantium Dulcis Peel Oil",
      "Zingiber Officinale Root Extract",
      "Xanthan Gum",
      "Sodium Levulinate",
      "Sodium Anisate",
      "Limonene",
    ],
    pack: {
      body: material.goldGlass,
      glass: true,
      liquid: material.vitaminC,
      cap: palette.profundo,
      label: light.prisma,
      ink: palette.profundo,
    },
  },
  {
    id: 4,
    slug: "vertice",
    name: "Vértice",
    type: "Contorno Focalizado",
    product: "Contorno de ojos y labios con péptidos",
    block: "comodin",
    moments: ["am", "pm"],
    when: "Mañana y noche",
    hour: 13.5,
    concept:
      "El punto de unión geométrico donde se cruzan las líneas. Enfocado en las líneas de expresión y los puntos clave de la mirada.",
    phrase: "Donde las líneas se suavizan. El punto exacto de calma.",
    description:
      "Péptidos que acompañan la firmeza de la piel más fina: la de la mirada y el contorno de los labios. De mañana descongestiona; de noche, suaviza las líneas.",
    actives: ["peptidos", "cafeina"],
    benefits: ["firmeza", "antiedad"],
    aroma: { notes: ["Pepino", "Romero"], mood: "Foco" },
    format: "pomo",
    size: "15 ml",
    price: 29900,
    seconds: 30,
    texture: "Gel-crema fresco",
    howTo: [
      "Un grano de arroz alcanza para los dos ojos.",
      "Toquecitos con el dedo anular, del lagrimal hacia afuera.",
      "En los labios, una capa fina sobre el contorno.",
      "Mañana y noche, antes de la crema.",
    ],
    frequency: "Mañana y noche",
    inci: [
      "Aqua",
      "Glycerin",
      "Caprylic/Capric Triglyceride",
      "Palmitoyl Tripeptide-1",
      "Palmitoyl Tetrapeptide-7",
      "Caffeine",
      "Cucumis Sativus Fruit Extract",
      "Sodium Hyaluronate",
      "Cetearyl Olivate",
      "Sorbitan Olivate",
      "Tocopherol",
      "Xanthan Gum",
      "Sodium Benzoate",
    ],
    pack: { body: palette.cafe, cap: palette.profundo, label: light.vertice, ink: palette.profundo },
  },
  {
    id: 5,
    slug: "eclipse",
    name: "Eclipse",
    type: "Óleo de Transición",
    product: "Óleo limpiador transformador",
    block: "pm",
    moments: ["pm"],
    when: "Al volver a casa",
    hour: 20,
    concept:
      "El paso de la luz a la sombra. Simboliza el momento de quitarse el día de encima, desmaquillar y entrar en el mood nocturno.",
    phrase: "El desvanecimiento de las sombras. Desprenderse del peso del día.",
    description:
      "Un óleo que se funde sobre la piel seca, disuelve el maquillaje, el protector y el día entero, y al tocar el agua se vuelve leche. Se enjuaga sin dejar película.",
    actives: ["jojoba", "vitamina-e"],
    benefits: ["calma", "barrera"],
    aroma: { notes: ["Bergamota", "Sándalo"], mood: "Soltar" },
    format: "dosificador",
    size: "150 ml",
    price: 27900,
    seconds: 90,
    texture: "Óleo sedoso que se vuelve leche con el agua",
    howTo: [
      "Dos o tres disparos sobre la piel seca, con las manos secas.",
      "Masajeá un minuto: el maquillaje se disuelve.",
      "Mojá las manos y seguí masajeando: el óleo se vuelve leche.",
      "Enjuagá con agua tibia.",
    ],
    frequency: "Todas las noches",
    inci: [
      "Caprylic/Capric Triglyceride",
      "Simmondsia Chinensis Seed Oil",
      "Helianthus Annuus Seed Oil",
      "Polyglyceryl-4 Oleate",
      "Polyglyceryl-2 Caprate",
      "Tocopherol",
      "Citrus Aurantium Bergamia Fruit Oil",
      "Amyris Balsamifera Bark Oil",
      "Limonene",
      "Linalool",
    ],
    pack: {
      body: material.smokeGlass,
      glass: true,
      liquid: material.oil,
      cap: palette.noche,
      label: light.eclipse,
      ink: palette.papel,
    },
  },
  {
    id: 6,
    slug: "mantra",
    name: "Mantra",
    type: "Crema de Confort",
    product: "Crema gel hidratante",
    block: "pm",
    moments: ["pm"],
    when: "Antes de dormir",
    hour: 21.75,
    concept:
      "Repetición, calma, inducción al descanso y al bienestar. Una crema que “resetea” y abraza la piel antes de dormir.",
    phrase: "La quietud que reconforta. Texturas que abrigan el descanso.",
    description:
      "Una crema gel que se funde y abraza la piel antes de dormir. Ácido hialurónico y escualano de oliva para hidratar profundo sin pesar, y lavanda para bajar un cambio.",
    actives: ["hialuronico", "escualano"],
    benefits: ["hidratacion", "calma", "barrera"],
    aroma: { notes: ["Lavanda", "Manzanilla"], mood: "Calma" },
    format: "pote",
    size: "50 g",
    price: 33900,
    seconds: 45,
    texture: "Crema gel que se funde",
    howTo: [
      "Es el último paso de la noche.",
      "Entibiá un garbanzo de crema entre los dedos.",
      "Presioná sobre rostro y cuello, y respirá hondo tres veces.",
    ],
    frequency: "Todas las noches",
    inci: [
      "Aqua",
      "Glycerin",
      "Squalane",
      "Sodium Hyaluronate",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Olivate",
      "Sorbitan Olivate",
      "Lavandula Angustifolia Oil",
      "Chamomilla Recutita Flower Extract",
      "Tocopherol",
      "Xanthan Gum",
      "Sodium Benzoate",
      "Potassium Sorbate",
      "Linalool",
    ],
    pack: { body: palette.pino, cap: palette.noche, label: palette.papel, ink: palette.pino },
  },
  {
    id: 7,
    slug: "genesis",
    name: "Génesis",
    type: "Sérum de Renovación",
    product: "Sérum nocturno con retinol y bakuchiol",
    block: "pm",
    moments: ["pm"],
    when: "Mientras dormís",
    hour: 23,
    concept: "El origen, el principio de la creación, la regeneración desde la raíz celular mientras dormís.",
    phrase: "Una transición silenciosa. El instante donde todo se recrea.",
    description:
      "Retinol encapsulado de liberación lenta y bakuchiol, su par vegetal: renuevan la piel desde la raíz mientras dormís. Textura, firmeza y tono, noche tras noche.",
    actives: ["retinol", "bakuchiol"],
    benefits: ["renovacion", "antiedad", "firmeza"],
    aroma: { notes: ["Vetiver", "Rosa"], mood: "Pausa" },
    format: "gotero",
    size: "30 ml",
    price: 41900,
    seconds: 30,
    texture: "Sérum-óleo liviano",
    howTo: [
      "De noche, sobre la piel limpia y seca.",
      "Tres gotas para rostro y cuello, sin tocar el contorno de ojos.",
      "Seguí con Vértice y cerrá con Mantra.",
      "De día, protector solar siempre.",
    ],
    frequency: "Empezá dos o tres noches por semana y subí de a poco",
    inci: [
      "Squalane",
      "Caprylic/Capric Triglyceride",
      "Simmondsia Chinensis Seed Oil",
      "Bakuchiol",
      "Retinol",
      "Tocopherol",
      "Vetiveria Zizanoides Root Oil",
      "Rosa Damascena Flower Oil",
      "Helianthus Annuus Seed Oil",
      "Citronellol",
      "Geraniol",
    ],
    pack: {
      body: material.nightGlass,
      glass: true,
      liquid: material.retinol,
      cap: palette.noche,
      label: light.genesis,
      ink: palette.papel,
    },
  },
];

export const blocks: Record<Block, { label: string; idea: string }> = {
  am: { label: "Bloque AM", idea: "Energía, protección y luminosidad" },
  comodin: { label: "Comodín", idea: "Mañana y noche" },
  pm: { label: "Bloque PM", idea: "Pausa, reparación y renovación" },
};

export const momentLabel: Record<Moment, string> = { am: "Mañana", pm: "Noche" };

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return bySlug.get(slug as LightId);
}

export function getRitual(id: RitualId): Product {
  return products[id - 1];
}

/** "01", "02"… */
export function ritualNumber(id: RitualId): string {
  return String(id).padStart(2, "0");
}

/** El ritual anterior y el siguiente en el día. */
export function getDayNeighbors(product: Product): { prev?: Product; next?: Product } {
  return { prev: products[product.id - 2], next: products[product.id] };
}

/** Los siete, en el orden del día: el kit "Ritual completo". */
export function getKitProducts(): Product[] {
  return products;
}

export function kitTotal(): number {
  return products.reduce((sum, p) => sum + p.price, 0);
}

export function productsWithActive(id: ActiveId): Product[] {
  return products.filter((p) => p.actives.includes(id));
}
