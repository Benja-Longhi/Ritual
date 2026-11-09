import type { ReactNode } from "react";
import type { LightId } from "@/lib/palette";

/**
 * Un glifo por ritual, del mismo fenómeno de luz que su nombre: el sol que
 * asoma (Alba), el halo (Aura), la luz que se quiebra (Prisma), las líneas
 * que se cruzan (Vértice), la sombra que tapa (Eclipse), las ondas que se
 * repiten (Mantra) y la semilla (Génesis). Íconos, fallback del 3D y marcas
 * de la línea del día.
 */

const glyphs: Record<LightId, ReactNode> = {
  alba: (
    <>
      <path d="M5 32 H43" />
      <path d="M13 32 A11 11 0 0 1 35 32" />
      <path d="M24 14 V11 M12.3 18.8 l-2.1 -2.1 M35.7 18.8 l2.1 -2.1" />
    </>
  ),
  aura: (
    <>
      <circle cx="24" cy="24" r="7.5" />
      <circle cx="24" cy="24" r="15" strokeDasharray="1.5 3.2" />
    </>
  ),
  prisma: (
    <>
      <path d="M24 9 L38 35 H10 Z" />
      <path d="M3 25.5 L18 22" />
      <path d="M30.5 22.5 L45 16 M31.5 25 L45 24.5 M32 27.5 L45 33" />
    </>
  ),
  vertice: (
    <>
      <path d="M8 10 L24 36 L40 10" />
      <path d="M14 23 H34" strokeDasharray="1.5 3" />
      <circle cx="24" cy="36" r="2.2" fill="currentColor" stroke="none" />
    </>
  ),
  eclipse: (
    <>
      <circle cx="20.5" cy="24" r="12" />
      <circle cx="27.5" cy="24" r="12" fill="currentColor" stroke="none" />
    </>
  ),
  mantra: (
    <>
      <circle cx="24" cy="24" r="3.5" />
      <circle cx="24" cy="24" r="10" />
      <circle cx="24" cy="24" r="16.5" />
    </>
  ),
  genesis: (
    <>
      <path d="M24 7 C34 15 34 33 24 41 C14 33 14 15 24 7 Z" />
      <circle cx="24" cy="24" r="2.6" fill="currentColor" stroke="none" />
      <path d="M24 7 V3 M24 45 V41" />
    </>
  ),
};

type RitualGlyphProps = {
  slug: LightId;
  className?: string;
  /** Grosor del trazo en píxeles: se mantiene a cualquier tamaño. */
  strokeWidth?: number;
  title?: string;
};

export function RitualGlyph({ slug, className, strokeWidth = 1.25, title }: RitualGlyphProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`glyph ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      {glyphs[slug]}
    </svg>
  );
}
