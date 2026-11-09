/**
 * Anclas del DOM que la escena 3D sigue: lugares vacíos en el layout donde
 * "vive" el astro en cada sección y donde se apoya cada envase. Así el 3D
 * respeta el diseño responsive y se mueve con el scroll sin duplicar
 * cuentas: cada frame lee dónde quedó cada ancla.
 */

export type AnchorKey =
  | "astro:hero"
  | "astro:manifesto"
  | "astro:sky"
  | "astro:close"
  | `bottle:${number}`;

const anchors = new Map<AnchorKey, HTMLElement>();

export function anchorRef(key: AnchorKey) {
  return (el: HTMLElement | null) => {
    if (el) anchors.set(key, el);
    else if (anchors.get(key)) anchors.delete(key);
  };
}

export function getAnchor(key: AnchorKey): HTMLElement | undefined {
  const el = anchors.get(key);
  // Un ancla oculta (display: none en este breakpoint) no cuenta.
  return el && el.offsetParent !== null ? el : undefined;
}
