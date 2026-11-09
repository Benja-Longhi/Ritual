"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { products, type Product } from "@/data/products";
import { useNow } from "@/hooks/useNow";
import { formatClock, formatHour, hourOf, ritualAt } from "@/lib/ritualTime";
import { transition } from "@/lib/motion";
import { RitualGlyph } from "@/components/brand/RitualGlyph";

/**
 * El reloj es esquemático: los rituales de la mañana están a minutos de
 * distancia, así que se reparten en su mitad del día (la hora real va en el
 * detalle). Vértice, el comodín, queda entre las dos mitades.
 */
const clockHour: Record<Product["slug"], number> = {
  alba: 6,
  aura: 8,
  prisma: 10,
  vertice: 13.5,
  eclipse: 18.5,
  mantra: 20.5,
  genesis: 22.5,
};
const marks = products.map((p) => ({ p, hour: clockHour[p.slug] }));

const angle = (hour: number) => (hour / 24) * Math.PI * 2 - Math.PI / 2;
const point = (hour: number, r: number) => ({ x: 200 + Math.cos(angle(hour)) * r, y: 200 + Math.sin(angle(hour)) * r });

/**
 * El reloj del día: las 24 horas con los siete rituales en su momento y la
 * aguja en la hora de quien mira. Tocá un ritual para ver de qué se trata.
 */
export function RitualClock() {
  const now = useNow();
  const current = now ? ritualAt(hourOf(now)).product : null;
  const [picked, setPicked] = useState<Product | null>(null);
  const shown = picked ?? current ?? products[0];
  const hand = now ? point(hourOf(now), 150) : null;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,34rem)_1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
        {/* El anillo de luz: cada ritual tiñe su hora */}
        <div
          aria-hidden
          className="absolute inset-[6%] rounded-full [mask:radial-gradient(circle,transparent_63%,#000_64%,#000_70%,transparent_71%)]"
          style={{
            background: `conic-gradient(from 0deg, var(--color-genesis) 0deg, ${products
              .map((p) => `var(--color-${p.slug}) ${clockHour[p.slug] * 15}deg`)
              .join(", ")}, var(--color-genesis) 360deg)`,
          }}
        />
        <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" role="img" aria-label="Reloj de los siete rituales">
          {Array.from({ length: 24 }, (_, h) => {
            const a = point(h, 186);
            const b = point(h, h % 6 === 0 ? 176 : 181);
            return <line key={h} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity="0.35" />;
          })}
          {[0, 6, 12, 18].map((h) => {
            const p = point(h, 162);
            return (
              <text key={h} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" className="fill-current font-sans text-[11px] opacity-60">
                {String(h).padStart(2, "0")}
              </text>
            );
          })}
          {hand && (
            <g>
              <line x1="200" y1="200" x2={hand.x} y2={hand.y} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="200" cy="200" r="3.5" className="fill-current" />
            </g>
          )}
        </svg>

        {marks.map(({ p, hour }) => {
          const { x, y } = point(hour, 128);
          const on = p.slug === shown.slug;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => setPicked(p)}
              onPointerEnter={() => setPicked(p)}
              onFocus={() => setPicked(p)}
              aria-label={`${p.name}, ${p.block === "comodin" ? "mañana y noche" : formatHour(p.hour)}`}
              aria-pressed={on}
              className={`absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-[background-color,opacity] duration-500 ${
                on ? "bg-profundo text-papel" : "opacity-70 hover:opacity-100"
              }`}
              style={{ left: `${(x / 400) * 100}%`, top: `${(y / 400) * 100}%` }}
            >
              <RitualGlyph slug={p.slug} className="size-6" />
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-[30%] flex flex-col items-center justify-center text-center">
          <p className="text-sm tabular-nums opacity-70">{now ? `Ahora, ${formatClock(now)}` : "Las 24 horas"}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={shown.slug}
              className="ritual-name mt-2 text-xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: transition.enter }}
              exit={{ opacity: 0, y: -8, transition: transition.exit }}
            >
              {shown.name}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={shown.slug}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: transition.enter }}
          exit={{ opacity: 0, y: -10, transition: transition.exit }}
          className="max-w-xl"
        >
          <p className="text-sm opacity-75">
            {shown.block === "comodin" ? "Mañana y noche" : formatHour(shown.hour)} — {shown.when}
          </p>
          <p className="mt-3 font-serif text-title italic">{shown.phrase}</p>
          <p className="mt-4 leading-relaxed text-profundo/85">{shown.concept}</p>
          <Link href={`/productos/${shown.slug}`} className="mt-6 inline-block underline underline-offset-4">
            Conocé {shown.name}, {shown.type.toLowerCase()}
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
