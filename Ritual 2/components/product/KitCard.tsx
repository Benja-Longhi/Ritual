"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getKitProducts, kitTotal } from "@/data/products";
import { useCart } from "@/store/cart";
import { flyToCart } from "@/lib/flyToCart";
import { formatPrice } from "@/lib/format";
import { ritualDiscountFor } from "@/lib/pricing";
import { site } from "@/lib/site";
import { transition } from "@/lib/motion";
import { Packshot } from "@/components/brand/Packshot";
import { buttonClasses } from "@/components/ui/Button";

const kit = getKitProducts();
const total = kitTotal();
const discounted = total - ritualDiscountFor(total);

type Phase = "idle" | "adding" | "done";

/**
 * Los siete rituales como uno solo: el día completo. Vuelan al carrito en
 * orden (del alba a la noche) y, con los siete adentro, el descuento se aplica solo.
 */
export function KitCard({ className }: { className?: string }) {
  const thumbs = useRef<(HTMLDivElement | null)[]>([]);
  const addMany = useCart((s) => s.addMany);
  const openDrawer = useCart((s) => s.openDrawer);
  const [phase, setPhase] = useState<Phase>("idle");

  async function addRitual() {
    if (phase !== "idle") return;
    setPhase("adding");
    await Promise.all(
      thumbs.current.map((el, i) => new Promise<void>((resolve) => setTimeout(() => void flyToCart(el).then(resolve), i * 110))),
    );
    addMany(kit.map((p) => p.slug));
    setPhase("done");
    setTimeout(openDrawer, 300);
    setTimeout(() => setPhase("idle"), 2200);
  }

  return (
    <div
      data-surface="dark"
      className={`flex flex-col gap-6 rounded-[4px] bg-noche p-6 text-papel md:flex-row md:items-center md:justify-between md:p-8 ${className ?? ""}`}
    >
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="flex" aria-hidden>
          {kit.map((product, i) => (
            <div
              key={product.slug}
              ref={(el) => {
                thumbs.current[i] = el;
              }}
              className="w-10 overflow-hidden ring-1 ring-noche"
              style={{ background: `var(--color-${product.slug})` }}
            >
              <Packshot product={product} className="aspect-[3/4] w-full scale-125" bare />
            </div>
          ))}
        </div>
        <div>
          <p className="font-serif text-3xl leading-none">El día completo</p>
          <p className="mt-1.5 text-sm text-papel/75">
            Los siete rituales, del alba a la noche, con {Math.round(site.ritualDiscount * 100)}% off.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <p className="tabular-nums">
          <span className="mr-2 text-papel/60 line-through">{formatPrice(total)}</span>
          <span className="font-serif text-4xl">{formatPrice(discounted)}</span>
        </p>
        <button type="button" onClick={addRitual} className={buttonClasses("light")} aria-live="polite">
          <span className="relative block overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={phase}
                className="block"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1, transition: transition.enter }}
                exit={{ y: "-100%", opacity: 0, transition: transition.exit }}
              >
                {phase === "idle" ? "Agregar los siete" : phase === "adding" ? "Agregando…" : "En tu carrito"}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
      </div>
    </div>
  );
}
