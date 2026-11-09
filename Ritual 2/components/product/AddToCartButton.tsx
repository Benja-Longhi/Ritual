"use client";

import { useState, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/store/cart";
import { flyToCart } from "@/lib/flyToCart";
import { formatPrice } from "@/lib/format";
import { transition } from "@/lib/motion";
import { buttonClasses } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { PlusIcon } from "@/components/ui/icons";

type AddToCartButtonProps = {
  slug: string;
  name: string;
  price?: number;
  /** Elemento que "vuela" al carrito (la imagen del producto). */
  source: RefObject<HTMLElement | null>;
  quantity?: number;
  /** Abrir el drawer al aterrizar (en la ficha sí; en grillas no, para no cortar la navegación). */
  openDrawer?: boolean;
  /** full: la ficha · inline: con precio, en el recorrido · compact: solo el ícono. */
  variant?: "full" | "inline" | "compact";
  /** Sobre fondos oscuros. */
  light?: boolean;
};

type Phase = "idle" | "flying" | "done";

export function AddToCartButton({
  slug,
  name,
  price,
  source,
  quantity = 1,
  openDrawer = true,
  variant = "full",
  light,
}: AddToCartButtonProps) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.openDrawer);
  const [phase, setPhase] = useState<Phase>("idle");

  async function onClick() {
    if (phase !== "idle") return;
    setPhase("flying");
    await flyToCart(source.current);
    add(slug, quantity);
    setPhase("done");
    if (openDrawer) setTimeout(open, 350);
    setTimeout(() => setPhase("idle"), 1600);
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Agregar ${name} al carrito`}
        data-cursor="Agregar"
        className="flex size-11 items-center justify-center rounded-full bg-profundo text-papel shadow-[0_10px_30px_-12px_rgb(36_27_21/0.5)] transition-transform duration-500 ease-out-expo hover:scale-110"
      >
        <motion.span animate={{ rotate: phase === "done" ? 135 : 0 }} transition={transition.enter} className="flex">
          <PlusIcon width={18} />
        </motion.span>
      </button>
    );
  }

  const labels: Record<Phase, string> = {
    idle: variant === "inline" && price ? `Agregar · ${formatPrice(price)}` : "Agregar al carrito",
    flying: "Agregando…",
    done: "En tu carrito",
  };

  return (
    <Magnetic strength={0.2}>
      <button
        type="button"
        onClick={onClick}
        aria-live="polite"
        aria-label={phase === "idle" ? `Agregar ${name} al carrito` : undefined}
        className={buttonClasses(
          light ? "light" : "solid",
          variant === "full" ? "min-w-60 py-5 text-base" : "min-w-52 tabular-nums",
        )}
      >
        <span className="relative block overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={phase}
              className="block"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1, transition: transition.enter }}
              exit={{ y: "-100%", opacity: 0, transition: transition.exit }}
            >
              {labels[phase]}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
    </Magnetic>
  );
}
