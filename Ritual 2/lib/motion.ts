/**
 * Sistema de movimiento: única fuente de easings, duraciones, distancias y
 * resortes. Todo lo que se anima en el sitio sale de acá para que se sienta
 * de la misma familia: suave, orgánico, con inercia (nunca mecánico).
 *
 * Los easings tienen su espejo en CSS (`--ease-*` en app/globals.css).
 */

type Bezier = [number, number, number, number];

/** Curvas para Motion (cubic-bezier). */
export const ease = {
  /** Expo out: llega rápido y se asienta despacio. Default para entradas. */
  out: [0.16, 1, 0.3, 1] as Bezier,
  /** In-out suave: para salidas y cambios de estado simétricos. */
  inOut: [0.65, 0, 0.35, 1] as Bezier,
  /** Respiración: senoidal, para loops y pulsos. */
  breath: [0.37, 0, 0.63, 1] as Bezier,
} as const;

/** Mismas curvas, con nombre de GSAP. */
export const gsapEase = {
  out: "expo.out",
  inOut: "power3.inOut",
  breath: "sine.inOut",
  /** Para scrub ligado al scroll: lineal, la inercia la pone Lenis. */
  scrub: "none",
} as const;

/** Duraciones en segundos. */
export const duration = {
  instant: 0.15,
  fast: 0.3,
  base: 0.6,
  slow: 1,
  slower: 1.4,
} as const;

/** Distancias de desplazamiento en px. */
export const distance = {
  sm: 12,
  md: 32,
} as const;

/** Escalonado entre elementos hermanos, en segundos. */
export const stagger = {
  tight: 0.035,
  base: 0.07,
  loose: 0.12,
} as const;

/** Resortes para Motion. */
export const spring = {
  /** Layout, indicadores, paneles. */
  soft: { type: "spring", stiffness: 260, damping: 32, mass: 1 },
  /** Reacciones cortas (contador del carrito, toggles). */
  snappy: { type: "spring", stiffness: 520, damping: 26, mass: 0.8 },
  /** Botones magnéticos y cursor: ligero, con inercia. */
  magnetic: { type: "spring", stiffness: 170, damping: 16, mass: 0.2 },
} as const;

/** Transiciones listas para usar. */
export const transition = {
  enter: { duration: duration.base, ease: ease.out },
  exit: { duration: duration.fast, ease: ease.inOut },
} as const;
