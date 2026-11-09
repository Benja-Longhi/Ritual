import Link from "next/link";
import type { ReactNode } from "react";
import { getProduct, products, ritualNumber } from "@/data/products";
import { benefits } from "@/data/benefits";
import { careSteps, dimensions, weekdays, type DimensionId } from "@/data/seven";
import { RitualGlyph } from "@/components/brand/RitualGlyph";

/** Las cuatro dimensiones del 7, cada una con sus siete elementos explicados. */
export function SevenDimensions() {
  const content: Record<DimensionId, ReactNode> = {
    dias: (
      <ol className="grid grid-cols-7 gap-1.5 text-center text-sm">
        {weekdays.map((d) => (
          <li key={d} className="rounded-[3px] py-3 ring-1 ring-inset ring-profundo/12">
            {d}
          </li>
        ))}
      </ol>
    ),
    pasos: (
      <ol className="divide-y divide-profundo/10">
        {careSteps.map((s, i) => (
          <li key={s.name} className="flex items-baseline justify-between gap-4 py-2.5">
            <span className="flex items-baseline gap-3">
              <span className="w-5 text-sm tabular-nums opacity-60">{i + 1}</span>
              {s.name}
            </span>
            <span className="flex gap-3 text-[0.68rem]">
              {s.rituals.map((slug) => (
                <Link key={slug} href={`/productos/${slug}`} className="ritual-name hover:underline">
                  {getProduct(slug)!.name}
                </Link>
              ))}
            </span>
          </li>
        ))}
      </ol>
    ),
    beneficios: (
      <ul className="divide-y divide-profundo/10">
        {benefits.map((b) => (
          <li key={b.id} className="flex items-baseline justify-between gap-4 py-2.5">
            <span>
              {b.label}
              <span className="ml-2 text-sm opacity-65">{b.hint}</span>
            </span>
            <Link href={`/productos?beneficio=${b.id}`} className="shrink-0 text-sm tabular-nums underline-offset-4 hover:underline">
              {products.filter((p) => p.benefits.includes(b.id)).length} rituales
            </Link>
          </li>
        ))}
      </ul>
    ),
    rituales: (
      <ol className="divide-y divide-profundo/10">
        {products.map((p) => (
          <li key={p.slug}>
            <Link href={`/productos/${p.slug}`} className="group flex items-center gap-4 py-2.5">
              <RitualGlyph slug={p.slug} className="size-6 transition-transform duration-500 ease-out-expo group-hover:scale-110" />
              <span className="w-6 text-sm tabular-nums opacity-60">{ritualNumber(p.id)}</span>
              <span className="ritual-name text-sm">{p.name}</span>
              <span className="ml-auto text-sm opacity-70">{p.aroma.mood}</span>
            </Link>
          </li>
        ))}
      </ol>
    ),
  };

  return (
    <div className="grid gap-x-14 gap-y-20 lg:grid-cols-2">
      {dimensions.map((d) => (
        <article key={d.id} aria-labelledby={`dim-${d.id}`}>
          <h3 id={`dim-${d.id}`} className="font-serif text-headline">
            {d.title}
          </h3>
          <p className="mt-3 font-medium">{d.idea}</p>
          <p className="mt-2 max-w-lg text-profundo/80">{d.text}</p>
          <div className="mt-8">{content[d.id]}</div>
        </article>
      ))}
    </div>
  );
}
