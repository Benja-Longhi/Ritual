import { palette } from "./palette";

const toRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

const toHex = (rgb: number[]) =>
  `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;

/** Mezcla dos colores hex (t = 0 → a, t = 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const ca = toRgb(a);
  const cb = toRgb(b);
  return toHex(ca.map((v, i) => v + (cb[i] - v) * t));
}

/** Oscurece hacia la noche de la marca (nunca a negro puro). */
export const darken = (hex: string, t: number) => mix(hex, palette.noche, t);

/** Aclara hacia el papel claro de la marca (nunca a blanco puro). */
export const lighten = (hex: string, t: number) => mix(hex, palette.papelClaro, t);
