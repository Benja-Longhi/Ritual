"use client";

import Link from "next/link";
import { useRef } from "react";
import { ritualNumber, type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { formatHour } from "@/lib/ritualTime";
import { site } from "@/lib/site";
import { RitualGlyph } from "@/components/brand/RitualGlyph";
import { RevealWords } from "@/components/ui/RevealWords";
import { AddToCartButton } from "./AddToCartButton";
import { ProductVisual } from "./ProductVisual";

/** La cabecera de la ficha: el envase en su ventana y todo lo necesario para decidir. */
export function ProductHero({ product, dark }: { product: Product; dark: boolean }) {
  const visual = useRef<HTMLDivElement>(null);
  const facts = [
    { label: "Qué es", value: product.product },
    { label: "Tamaño", value: product.size },
    { label: "Textura", value: product.texture },
    { label: "Cuándo", value: product.frequency },
  ];

  return (
    <section className="mx-auto grid max-w-[1440px] gap-10 px-6 pt-28 pb-20 md:px-10 md:pt-32 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <ProductVisual product={product} ref={visual} />
      </div>

      <div className="lg:pt-6">
        <nav aria-label="Ubicación" className="text-sm opacity-75">
          <Link href="/productos" className="underline-offset-4 hover:underline">
            Los siete rituales
          </Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <p className="mt-8 flex items-center gap-2.5 text-sm opacity-85">
          <RitualGlyph slug={product.slug} className="size-5" />
          <span className="tabular-nums">{product.block === "comodin" ? "AM y PM" : formatHour(product.hour)}</span>
          <span aria-hidden>—</span>
          {product.when}
        </p>
        <h1 className="mt-5 flex items-baseline gap-5">
          <span className="font-serif text-[clamp(3.4rem,6vw,6rem)] leading-none tabular-nums">{ritualNumber(product.id)}</span>
          <span className="ritual-name text-[clamp(1.6rem,3vw,2.8rem)]">{product.name}</span>
        </h1>
        <p className="mt-3 opacity-80">[ {product.type} ]</p>

        <RevealWords text={product.phrase} as="p" className="mt-8 max-w-xl font-serif text-title italic" delay={0.2} stagger={0.04} />
        <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-85">{product.description}</p>

        <dl className={`mt-8 grid max-w-xl grid-cols-2 gap-x-8 gap-y-4 border-y py-6 text-sm ${dark ? "border-papel/15" : "border-profundo/15"}`}>
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="opacity-70">{f.label}</dt>
              <dd className="mt-1">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <p className="font-serif text-5xl tabular-nums">{formatPrice(product.price)}</p>
          <AddToCartButton slug={product.slug} name={product.name} source={visual} light={dark} />
        </div>
        <p className="mt-4 text-sm opacity-75">
          Con los siete rituales en el carrito, {Math.round(site.ritualDiscount * 100)}% off en todo tu pedido.
        </p>
      </div>
    </section>
  );
}
