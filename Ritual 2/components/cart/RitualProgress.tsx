"use client";

import { AnimatePresence, motion } from "motion/react";
import { getRitual, products, type RitualId } from "@/data/products";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { spring, transition } from "@/lib/motion";
import { RitualGlyph } from "@/components/brand/RitualGlyph";
import { PlusIcon } from "@/components/ui/icons";

type RitualProgressProps = {
  covered: RitualId[];
  missing: RitualId[];
  /** En el drawer se muestra más compacto. */
  compact?: boolean;
};

/**
 * "Tu día: 4 de 7". Los siete glifos en fila, del alba a la noche: los que
 * están en el carrito se encienden y los que faltan se suman con un toque.
 * Con los siete, el descuento.
 */
export function RitualProgress({ covered, missing, compact }: RitualProgressProps) {
  const add = useCart((s) => s.add);
  const complete = missing.length === 0;
  const discountLabel = `${Math.round(site.ritualDiscount * 100)}% off`;

  return (
    <div className={`rounded-[3px] bg-papel-hondo/60 ring-1 ring-inset ring-profundo/8 ${compact ? "p-4" : "p-6"}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={complete ? "done" : covered.length}
            className={`font-serif leading-tight ${compact ? "text-xl" : "text-2xl"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: transition.enter }}
            exit={{ opacity: 0, y: -8, transition: transition.exit }}
          >
            {complete
              ? `Los siete rituales: ${discountLabel} aplicado.`
              : `Tu día: ${covered.length} de 7. Con los siete, ${discountLabel}.`}
          </motion.p>
        </AnimatePresence>
        <ol className="flex items-center gap-1" aria-label="Rituales del día">
          {products.map((p) => {
            const on = covered.includes(p.id);
            return (
              <li key={p.slug} title={`${p.name}${on ? "" : " (falta)"}`}>
                <motion.span
                  className="flex size-7 items-center justify-center rounded-full"
                  animate={{ opacity: on ? 1 : 0.32, scale: on ? 1 : 0.86 }}
                  style={{ background: on ? `var(--color-${p.slug})` : "transparent" }}
                  transition={spring.soft}
                >
                  <RitualGlyph slug={p.slug} className={`size-[1.1rem] ${on && p.id >= 5 ? "text-papel" : ""}`} />
                </motion.span>
                <span className="sr-only">
                  {p.name}: {on ? "en el carrito" : "falta"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {!complete && (
        <ul className={`${compact ? "mt-3" : "mt-5"} flex flex-wrap gap-1.5`} aria-label="Rituales que faltan">
          <AnimatePresence initial={false}>
            {missing.map((id) => {
              const product = getRitual(id);
              return (
                <motion.li
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, pointerEvents: "none" }}
                  transition={spring.soft}
                >
                  <button
                    type="button"
                    onClick={() => add(product.slug)}
                    title={`Agregar ${product.name} (${formatPrice(product.price)})`}
                    className="group flex items-center gap-1.5 rounded-full bg-papel-claro py-1.5 pr-3 pl-2 text-sm ring-1 ring-profundo/10 transition-colors hover:bg-profundo hover:text-papel"
                  >
                    <RitualGlyph slug={product.slug} className="size-4" />
                    <span className="ritual-name text-[0.68rem]">{product.name}</span>
                    <PlusIcon width={12} height={12} className="opacity-60 group-hover:opacity-100" />
                    <span className="sr-only">: agregar al carrito</span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
