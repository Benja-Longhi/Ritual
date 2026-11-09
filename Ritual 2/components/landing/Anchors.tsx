"use client";

import type { ReactNode } from "react";
import type { Product } from "@/data/products";
import { anchorRef } from "@/lib/sceneAnchors";
import { useScene } from "@/store/scene";
import { Packshot } from "@/components/brand/Packshot";

type AstroAnchorProps = {
  at: "hero" | "manifesto" | "sky" | "close";
  className?: string;
  /** Lo que se ve si no hay 3D (reduced-motion, sin GPU): un sol dibujado, un glifo. */
  fallback?: ReactNode;
};

/** Un lugar del layout donde vive el astro. La escena 3D lo sigue. */
export function AstroAnchor({ at, className, fallback }: AstroAnchorProps) {
  const svg = useScene((s) => s.mode === "svg");
  return (
    <div ref={anchorRef(`astro:${at}`)} className={className} aria-hidden>
      {fallback && (
        <div className={`size-full transition-opacity duration-700 ease-out-expo ${svg ? "opacity-100" : "opacity-0"}`}>
          {fallback}
        </div>
      )}
    </div>
  );
}

type BottleAnchorProps = {
  product: Product;
  index: number;
  className?: string;
  /** Sin 3D en este lugar (mobile): siempre el packshot. */
  flat?: boolean;
};

/**
 * Un lugar del layout donde se apoya un envase. La escena 3D lo sigue; si el
 * equipo no la soporta (o con reduced-motion) se ve el packshot SVG.
 */
export function BottleAnchor({ product, index, className, flat }: BottleAnchorProps) {
  const svg = useScene((s) => s.mode === "svg");
  return (
    <div ref={flat ? undefined : anchorRef(`bottle:${index}`)} className={className} aria-hidden>
      <div data-fly-show className={`size-full transition-opacity duration-700 ease-out-expo ${svg || flat ? "opacity-100" : "opacity-0"}`}>
        <Packshot product={product} className="size-full" />
      </div>
    </div>
  );
}

/** El sol dibujado: el astro cuando no hay 3D. */
export function DrawnSun({ className }: { className?: string }) {
  return (
    <div
      className={`aspect-square rounded-full ${className ?? ""}`}
      style={{
        background:
          "radial-gradient(circle at 38% 32%, var(--color-papel-claro) 0%, var(--color-prisma) 62%, color-mix(in oklab, var(--color-prisma) 70%, var(--color-cafe)) 100%)",
        boxShadow: "0 0 80px 10px color-mix(in oklab, var(--color-papel-claro) 60%, transparent)",
      }}
    />
  );
}
