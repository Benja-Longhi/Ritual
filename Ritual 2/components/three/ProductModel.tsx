"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { Color, DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial, type Material } from "three";
import type { Product } from "@/data/products";
import { palette } from "@/lib/palette";
import { getFormatSpec, type MaterialSlot, type Quality } from "./geometry";
import { fontsReady, getLabelTexture } from "./label";

/**
 * Un producto en 3D: envase procedural, materiales según su `pack` y la
 * etiqueta de la marca. Mismo diseño que el packshot SVG.
 */

const materialCache = new Map<string, Record<MaterialSlot, Material>>();

function getMaterials(product: Product, quality: Quality): Record<MaterialSlot, Material> {
  const key = `${product.slug}-${quality}`;
  const cached = materialCache.get(key);
  if (cached) return cached;
  const { pack } = product;
  const high = quality === "high";

  const glass = new MeshPhysicalMaterial({
    color: pack.body,
    roughness: 0.06,
    metalness: 0,
    transparent: true,
    opacity: high ? 0.62 : 0.74,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.5,
    depthWrite: false,
    side: DoubleSide,
  });

  const materials: Record<MaterialSlot, Material> = {
    // Un cuerpo "opaco" de vidrio (el óleo) usa el mismo vidrio.
    body: pack.glass
      ? glass
      : high
        ? new MeshPhysicalMaterial({
            color: pack.body,
            roughness: 0.42,
            clearcoat: 0.55,
            clearcoatRoughness: 0.32,
            sheen: 0.35,
            sheenColor: new Color(palette.papelClaro),
            sheenRoughness: 0.6,
          })
        : new MeshStandardMaterial({ color: pack.body, roughness: 0.45 }),
    // Vidrio "falso": transparente con reflejos del entorno. La transmisión
    // real oscurecería el vidrio sobre un canvas sin fondo.
    glass,
    cap: high
      ? new MeshPhysicalMaterial({ color: pack.cap, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.12 })
      : new MeshStandardMaterial({ color: pack.cap, roughness: 0.3 }),
    rubber: new MeshStandardMaterial({ color: pack.cap, roughness: 0.62 }),
    liquid: new MeshStandardMaterial({
      color: pack.liquid ?? pack.body,
      roughness: 0.18,
      emissive: new Color(pack.liquid ?? pack.body),
      emissiveIntensity: 0.14,
    }),
  };
  materialCache.set(key, materials);
  return materials;
}

/** Las fuentes de la marca tienen que estar listas antes de dibujar etiquetas. */
let fontsLoaded = false;
const fontsPromise = typeof document === "undefined" ? Promise.resolve() : fontsReady().then(() => {
  fontsLoaded = true;
});

function useFontsReady(): boolean {
  const [ready, setReady] = useState(fontsLoaded);
  useEffect(() => {
    if (ready) return;
    let alive = true;
    void fontsPromise.then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [ready]);
  return ready;
}

type ProductModelProps = ComponentProps<"group"> & {
  product: Product;
  quality: Quality;
};

export function ProductModel({ product, quality, ...group }: ProductModelProps) {
  const spec = getFormatSpec(product.format, quality);
  const materials = getMaterials(product, quality);
  const fonts = useFontsReady();

  const labelMaterial = useMemo(() => {
    if (!fonts) return null;
    const map = getLabelTexture(product, spec.label.aspect);
    return new MeshStandardMaterial({ map, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -1 });
  }, [fonts, product, spec.label.aspect]);

  const glassBody = !!product.pack.glass;

  return (
    <group {...group}>
      {spec.parts.map((part, i) => (
        <mesh
          key={i}
          geometry={part.geometry}
          material={materials[part.slot]}
          position={part.position}
          renderOrder={part.slot === "glass" || (glassBody && part.slot === "body") ? 2 : 0}
        />
      ))}
      {glassBody && spec.glassLiquid && <mesh geometry={spec.glassLiquid} material={materials.liquid} />}
      {labelMaterial && <mesh geometry={spec.labelGeometry} material={labelMaterial} renderOrder={1} />}
    </group>
  );
}
