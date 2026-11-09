"use client";

import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { blocks, products, type Block } from "@/data/products";
import { benefits, isBenefitId, type BenefitId } from "@/data/benefits";
import { spring, transition } from "@/lib/motion";
import { MomentIcon } from "@/components/brand/MomentIcon";
import { ProductCard } from "./ProductCard";
import { KitCard } from "./KitCard";

type Filters = { block: Block | null; benefit: BenefitId | null };

const blockOrder: Block[] = ["am", "comodin", "pm"];
const isBlock = (v: string | null): v is Block => blockOrder.includes(v as Block);

const blockChip: Record<Block, { label: string; icon: ReactNode }> = {
  am: { label: "Mañana", icon: <MomentIcon moment="am" width={14} height={14} /> },
  comodin: { label: "Mañana y noche", icon: null },
  pm: { label: "Noche", icon: <MomentIcon moment="pm" width={14} height={14} /> },
};

/** Lee los filtros de la URL (requiere Suspense por `useSearchParams`). */
export function ProductCatalogFromURL() {
  const params = useSearchParams();
  const momento = params.get("momento");
  const beneficio = params.get("beneficio");
  return (
    <ProductCatalog
      initial={{
        block: isBlock(momento) ? momento : null,
        benefit: isBenefitId(beneficio) ? beneficio : null,
      }}
    />
  );
}

/**
 * Los siete rituales en el orden del día, agrupados como los ordena la marca
 * (bloque AM, comodín, bloque PM). Los filtros esconden lo que no corresponde
 * con layout animations (se ve qué quedó y qué se fue) y viven en la URL.
 */
export function ProductCatalog({ initial }: { initial: Filters }) {
  const [filters, setFilters] = useState<Filters>(initial);

  const update = (next: Partial<Filters>) => {
    const f = { ...filters, ...next };
    setFilters(f);
    const q = new URLSearchParams();
    if (f.block) q.set("momento", f.block);
    if (f.benefit) q.set("beneficio", f.benefit);
    const qs = q.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const visible = products.filter(
    (p) => (!filters.block || p.block === filters.block) && (!filters.benefit || p.benefits.includes(filters.benefit)),
  );
  const groups = blockOrder
    .map((block) => ({ block, items: visible.filter((p) => p.block === block) }))
    .filter((g) => g.items.length > 0);
  const anyFilter = filters.block || filters.benefit;

  return (
    <div>
      <div className="space-y-4 border-y border-profundo/12 py-5">
        <LayoutGroup id="block-filter">
          <div role="group" aria-label="Filtrar por momento del día" className="-mx-1 flex flex-wrap gap-1">
            <Chip selected={!filters.block} onClick={() => update({ block: null })} layoutId="block-pill">
              Todo el día
            </Chip>
            {blockOrder.map((b) => (
              <Chip key={b} selected={filters.block === b} onClick={() => update({ block: b })} layoutId="block-pill">
                {blockChip[b].icon}
                {blockChip[b].label}
              </Chip>
            ))}
          </div>
        </LayoutGroup>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <LayoutGroup id="benefit-filter">
            <div role="group" aria-label="Filtrar por beneficio" className="-mx-1 flex flex-wrap items-center gap-1">
              <Chip small selected={!filters.benefit} onClick={() => update({ benefit: null })} layoutId="benefit-pill">
                Todos los beneficios
              </Chip>
              {benefits.map((b) => (
                <Chip key={b.id} small selected={filters.benefit === b.id} onClick={() => update({ benefit: b.id })} layoutId="benefit-pill">
                  {b.label}
                </Chip>
              ))}
            </div>
          </LayoutGroup>
          <p className="ml-auto text-sm text-profundo/75" aria-live="polite">
            {visible.length} {visible.length === 1 ? "ritual" : "rituales"}
            {anyFilter && (
              <button type="button" onClick={() => update({ block: null, benefit: null })} className="ml-3 underline underline-offset-4">
                Ver los siete
              </button>
            )}
          </p>
        </div>
      </div>

      <motion.div layout className="mt-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {groups.map(({ block, items }) => (
            <motion.section
              key={block}
              layout
              aria-labelledby={`bloque-${block}`}
              className="grid gap-8 border-b border-profundo/12 py-12 lg:grid-cols-[17rem_1fr] lg:gap-14"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: spring.soft }}
              exit={{ opacity: 0, transition: transition.exit }}
              transition={spring.soft}
            >
              <header className="lg:sticky lg:top-28 lg:self-start">
                <h2 id={`bloque-${block}`} className="font-serif text-[2.6rem] leading-none">
                  {blocks[block].label}
                </h2>
                <p className="mt-3 text-profundo/80">{blocks[block].idea}.</p>
              </header>
              <motion.ul layout className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map((product, i) => (
                    <motion.li
                      key={product.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.94, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0, transition: { ...spring.soft, delay: i * 0.05 } }}
                      exit={{ opacity: 0, scale: 0.94, transition: transition.exit }}
                      transition={spring.soft}
                    >
                      <ProductCard product={product} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            </motion.section>
          ))}
        </AnimatePresence>
        {groups.length === 0 && (
          <p className="py-20 text-center font-serif text-3xl text-profundo/75">Ningún ritual coincide con esos filtros.</p>
        )}
      </motion.div>

      {!anyFilter && <KitCard className="mt-16" />}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
  layoutId,
  small,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  layoutId: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-full transition-colors duration-300 ${small ? "px-3.5 py-1.5 text-sm" : "px-4 py-2.5 text-[0.95rem]"} ${
        selected ? "text-papel" : "text-profundo hover:bg-profundo/6"
      }`}
    >
      {selected && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-profundo" transition={spring.soft} />}
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
}
