"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCart, selectCount } from "@/store/cart";
import { spring } from "@/lib/motion";
import { BagIcon } from "@/components/ui/icons";

/**
 * Ícono del carrito. Es el destino del "vuelo" al agregar (`data-cart-target`)
 * y reacciona con un pulso cada vez que entra un producto.
 */
export function CartButton({ dark }: { dark: boolean }) {
  const count = useCart(selectCount);
  const pulse = useCart((s) => s.pulse);
  const openDrawer = useCart((s) => s.openDrawer);

  return (
    <button
      type="button"
      onClick={openDrawer}
      data-cart-target
      aria-label={`Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
      className={`relative flex size-10 items-center justify-center rounded-full transition-colors duration-300 ${
        dark ? "bg-papel text-profundo" : "bg-profundo text-papel"
      }`}
    >
      <motion.span
        key={pulse}
        initial={pulse > 0 ? { scale: 0.7, rotate: -12 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={spring.snappy}
        className="flex"
      >
        <BagIcon width={18} height={18} />
      </motion.span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={spring.snappy}
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center overflow-hidden rounded-full bg-prisma px-1 text-[0.65rem] font-semibold text-profundo tabular-nums"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={spring.snappy}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
