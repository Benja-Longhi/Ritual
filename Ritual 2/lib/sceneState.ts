/**
 * Estado mutable compartido entre el DOM (GSAP, eventos) y la escena 3D de
 * la landing. Se lee en cada frame dentro de `useFrame`, así que no pasa por
 * React: cero re-renders por scroll o por movimiento del mouse.
 *
 * El recorrido del astro: hero → manifiesto → cielo del día → se pone →
 * vuelve como luna en el cierre. Cada tramo es un peso de 0 a 1 que escribe
 * el scroll.
 */
export const sceneState = {
  /** Puntero normalizado a -1 … 1 respecto de la ventana. */
  pointerX: 0,
  pointerY: 0,
  /** El astro sale después de la intro, 0 → 1. */
  entrance: 0,
  /** Del hero al manifiesto (un sol chico arriba). */
  toManifesto: 0,
  /** Del manifiesto al comienzo del arco del día. */
  toSky: 0,
  /** Recorrido del arco: 0 = Alba … 1 = Génesis (también su estado). */
  sky: 0,
  /** Los envases entran en sus paneles. */
  bottles: 0,
  /** Terminado el día, el astro se pone. */
  setting: 0,
  /** Vuelve como luna en el cierre. */
  closing: 0,
  /** Alguna sección con 3D está a la vista: si no, no se renderiza. */
  inView: true,
};

export function resetScene() {
  Object.assign(sceneState, {
    entrance: 0,
    toManifesto: 0,
    toSky: 0,
    sky: 0,
    bottles: 0,
    setting: 0,
    closing: 0,
    inView: true,
  });
}
