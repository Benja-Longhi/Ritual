import Link from "next/link";
import type { ReactNode } from "react";
import { getDayNeighbors, products, ritualNumber, type Product } from "@/data/products";
import { benefits } from "@/data/benefits";
import { getActive } from "@/data/actives";
import { freeFrom } from "@/data/commitments";
import { formatHour } from "@/lib/ritualTime";
import { RitualGlyph } from "@/components/brand/RitualGlyph";
import { Packshot } from "@/components/brand/Packshot";
import { ArrowIcon } from "@/components/ui/icons";

type DetailsProps = { product: Product; dark: boolean };

/** Una sección de la ficha: título a la izquierda, contenido a la derecha. */
function Row({ title, children, dark }: { title: string; children: ReactNode; dark: boolean }) {
  return (
    <section className={`grid gap-6 border-t py-12 md:grid-cols-[16rem_1fr] md:gap-14 ${dark ? "border-papel/15" : "border-profundo/15"}`}>
      <h2 className="font-serif text-[2rem] leading-none">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

/** Dónde cae el ritual en el día: una línea de 5 a 24 h con los siete. Vértice va dos veces. */
const START = 5;
const END = 24;
const marks = products.flatMap((p) =>
  p.block === "comodin" ? [{ p, hour: 8.6 }, { p, hour: 22.6 }] : [{ p, hour: p.hour }],
);

function DayLine({ product, dark }: DetailsProps) {
  return (
    <div className="max-w-3xl">
      <div className="relative h-24">
        <div
          aria-hidden
          className="absolute inset-x-0 top-11 h-1.5"
          style={{
            background: `linear-gradient(90deg, ${products.map((p, i) => `var(--color-${p.slug}) ${10 + i * 13}%`).join(", ")})`,
          }}
        />
        {marks.map(({ p, hour }) => {
          const on = p.slug === product.slug;
          return (
            <span
              key={`${p.slug}-${hour}`}
              className={`absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity ${on ? "opacity-100" : "opacity-45"}`}
              style={{ left: `${((hour - START) / (END - START)) * 100}%` }}
            >
              <RitualGlyph slug={p.slug} className={on ? "size-7" : "size-5"} />
              <span className={`mt-5 text-xs tabular-nums ${on ? "font-medium" : "sr-only"}`}>{formatHour(hour)}</span>
            </span>
          );
        })}
      </div>
      <div className={`mt-1 flex justify-between text-xs tabular-nums ${dark ? "opacity-70" : "opacity-60"}`}>
        <span>05:00</span>
        <span>12:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}

export function ProductDetails({ product, dark }: DetailsProps) {
  const { prev, next } = getDayNeighbors(product);

  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-24 md:px-10">
      <Row title="El concepto" dark={dark}>
        <p className="max-w-3xl font-serif text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.18]">{product.concept}</p>
      </Row>

      <Row title="En tu día" dark={dark}>
        <DayLine product={product} dark={dark} />
        <p className="mt-6 max-w-xl opacity-85">{product.frequency}.</p>
      </Row>

      <Row title="Activos" dark={dark}>
        <ul className="grid max-w-3xl gap-8 sm:grid-cols-2">
          {product.actives.map((id) => {
            const active = getActive(id);
            return (
              <li key={id}>
                <p className="font-serif text-3xl">{active.name}</p>
                <p className="mt-2 leading-relaxed opacity-85">{active.what}</p>
              </li>
            );
          })}
        </ul>
      </Row>

      <Row title="Beneficios" dark={dark}>
        <ol className="grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-7" aria-label="Los siete beneficios">
          {benefits.map((b) => {
            const on = product.benefits.includes(b.id);
            return (
              <li key={b.id} className={on ? "" : "opacity-40"}>
                <span aria-hidden className={`block size-3 rounded-full ring-1 ring-current ${on ? "bg-current" : ""}`} />
                <span className="mt-2 block text-sm leading-tight">{b.label}</span>
                <span className="sr-only">{on ? ": sí" : ": no es su foco"}</span>
              </li>
            );
          })}
        </ol>
      </Row>

      <Row title="Aroma" dark={dark}>
        <p className="max-w-xl font-serif text-[2rem] leading-tight">
          {product.aroma.notes.join(" y ")}, para {product.aroma.mood.toLowerCase()}.
        </p>
        <p className="mt-3 max-w-xl leading-relaxed opacity-85">
          Cosmética neurosensorial: notas de aromaterapia que acompañan el momento del día y bajan el estrés de la piel y
          de la mente.
        </p>
      </Row>

      <Row title="Cómo se usa" dark={dark}>
        <ol className="max-w-2xl space-y-4">
          {product.howTo.map((step, i) => (
            <li key={step} className="flex gap-5">
              <span className="font-serif text-2xl leading-none tabular-nums opacity-75">{i + 1}</span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </Row>

      <Row title="Sin" dark={dark}>
        <ul className="flex max-w-3xl flex-wrap gap-2">
          {freeFrom.map((item) => (
            <li key={item} className="rounded-full px-3.5 py-1.5 text-sm ring-1 ring-current/25">
              {item}
            </li>
          ))}
        </ul>
        <details className="group mt-8 max-w-3xl">
          <summary className="cursor-pointer list-none text-sm underline underline-offset-4">
            <span className="group-open:hidden">Ver la fórmula completa (INCI)</span>
            <span className="hidden group-open:inline">Ocultar la fórmula</span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed opacity-85">{product.inci.join(", ")}.</p>
          <p className="mt-2 text-xs opacity-70">Fórmula provisoria: puede cambiar antes del lanzamiento.</p>
        </details>
      </Row>

      <section aria-label="Antes y después en tu día" className={`grid gap-3 border-t pt-12 sm:grid-cols-2 ${dark ? "border-papel/15" : "border-profundo/15"}`}>
        {prev ? <Neighbor product={prev} label="Antes" /> : <span />}
        {next ? <Neighbor product={next} label="Después" align="end" /> : <span />}
      </section>
    </div>
  );
}

function Neighbor({ product, label, align }: { product: Product; label: string; align?: "end" }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      prefetch
      data-cursor="Ver"
      className={`group flex items-center gap-5 rounded-[3px] p-4 ring-1 ring-current/15 transition-colors hover:bg-current/5 ${
        align === "end" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="block w-20 shrink-0" style={{ background: `var(--color-${product.slug})` }}>
        <Packshot product={product} className="aspect-square w-full p-1.5" bare />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm opacity-75">{label} en tu día</span>
        <span className="mt-1 flex items-center gap-2 font-serif text-2xl leading-tight [justify-content:inherit]">
          {align !== "end" && <ArrowIcon width={18} className="rotate-180 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />}
          <span className="tabular-nums">{ritualNumber(product.id)}</span>
          <span className="ritual-name text-base">{product.name}</span>
          {align === "end" && <ArrowIcon width={18} className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />}
        </span>
      </span>
    </Link>
  );
}
