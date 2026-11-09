"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, ViewTransition, type Ref } from "react";
import type { Product } from "@/data/products";
import { isDarkLight } from "@/lib/palette";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { Packshot } from "@/components/brand/Packshot";

const ProductViewer = dynamic(() => import("@/components/three/ProductViewer"), { ssr: false });

/**
 * El envase grande de la ficha, dentro de la ventana del logo y sobre la luz
 * de su hora. Arranca con el packshot (el mismo de la tarjeta, así el morph
 * de la navegación es continuo) y, si el equipo lo aguanta, pasa al 3D.
 */
export function ProductVisual({ product, ref }: { product: Product; ref?: Ref<HTMLDivElement> }) {
  const tier = useDeviceTier();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const dark = isDarkLight(product.slug);

  // El 3D llega después de la transición de página, con el navegador libre.
  useEffect(() => {
    const t = setTimeout(() => setLoad(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
      <div
        ref={ref}
        data-cursor={ready ? "Arrastrá" : undefined}
        className={`relative aspect-square overflow-hidden rounded-[3px] ring-1 ring-inset ${dark ? "ring-papel/20" : "ring-profundo/15"}`}
        style={{ background: `color-mix(in oklab, var(--color-${product.slug}) 82%, var(--color-papel-claro))` }}
      >
        <div
          data-fly-show
          className={`absolute inset-[9%_20%_5%] transition-opacity duration-700 ease-out-expo ${ready ? "opacity-0" : "opacity-100"}`}
        >
          <Packshot product={product} className="size-full" />
        </div>
        {(tier === "high" || tier === "low") && load && (
          <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
            <ProductViewer product={product} tier={tier} onReady={() => setReady(true)} />
          </div>
        )}
      </div>
    </ViewTransition>
  );
}
