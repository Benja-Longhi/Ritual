"use client";

import Link from "next/link";
import { useRef, ViewTransition, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ritualNumber, type Product } from "@/data/products";
import { isDarkLight } from "@/lib/palette";
import { formatPrice } from "@/lib/format";
import { spring } from "@/lib/motion";
import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";
import { Packshot } from "@/components/brand/Packshot";
import { RitualGlyph } from "@/components/brand/RitualGlyph";
import { AddToCartButton } from "./AddToCartButton";

/**
 * Tarjeta de un ritual: el envase dentro de la ventana del logo, sobre la
 * luz de su hora. Responde al mouse con profundidad (la ventana se inclina
 * y el envase se desplaza por dentro) y se transforma en la ficha al navegar.
 */
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), spring.magnetic);
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), spring.magnetic);
  const ix = useSpring(useTransform(px, [-0.5, 0.5], [14, -14]), spring.magnetic);
  const iy = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), spring.magnetic);
  const interactive = fine && !reduced;
  const dark = isDarkLight(product.slug);

  const onMove = (e: PointerEvent) => {
    if (!interactive || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <article className={`group relative ${className ?? ""}`}>
      <div className="[perspective:900px]" onPointerMove={onMove} onPointerLeave={onLeave}>
        <motion.div style={interactive ? { rotateX: rx, rotateY: ry } : undefined} className="relative">
          {/* prefetch: trae la ficha completa para que el morph ocurra en el mismo commit */}
          <Link href={`/productos/${product.slug}`} prefetch className="block" tabIndex={-1} aria-hidden data-cursor="Ver">
            <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
              <div
                ref={frame}
                className={`relative aspect-square overflow-hidden rounded-[3px] ring-1 ring-inset ${dark ? "ring-papel/15" : "ring-profundo/10"}`}
                style={{ background: `var(--color-${product.slug})` }}
              >
                <motion.div style={interactive ? { x: ix, y: iy } : undefined} className="absolute inset-[9%_20%_5%]">
                  <Packshot product={product} className="size-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" />
                </motion.div>
                <span className={`absolute top-3.5 left-4 font-serif text-2xl tabular-nums ${dark ? "text-papel" : "text-profundo"}`}>
                  {ritualNumber(product.id)}
                </span>
                <RitualGlyph slug={product.slug} className={`absolute top-4 right-4 size-6 ${dark ? "text-papel" : "text-profundo"}`} />
              </div>
            </ViewTransition>
          </Link>
          <div className="absolute right-4 bottom-4 translate-y-2 opacity-0 transition-[opacity,translate] duration-500 ease-out-expo group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
            <AddToCartButton slug={product.slug} name={product.name} source={frame} openDrawer={false} variant="compact" />
          </div>
        </motion.div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="ritual-name text-[1.05rem]">
            <Link href={`/productos/${product.slug}`} prefetch className="underline-offset-4 hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-profundo/75">[ {product.type} ]</p>
          <p className="mt-2 line-clamp-2 font-serif text-lg leading-snug italic text-profundo/85">{product.phrase}</p>
        </div>
        <p className="pt-0.5 text-sm font-medium whitespace-nowrap tabular-nums">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
