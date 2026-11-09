"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCart, resolveLines } from "@/store/cart";
import { priceCart } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { duration, ease, stagger, transition } from "@/lib/motion";
import { lockScroll } from "@/components/providers/SmoothScroll";
import { useCheckout } from "@/hooks/useCheckout";
import { Button, buttonClasses, RollingLabel } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";
import { CartLineItem } from "./CartLineItem";
import { CheckoutSuccess } from "./CheckoutSuccess";
import { RitualProgress } from "./RitualProgress";

export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const close = useCart((s) => s.closeDrawer);
  const pathname = usePathname();

  // Navegar cierra el drawer.
  useEffect(() => {
    if (useCart.getState().drawerOpen) close();
  }, [pathname, close]);

  return <AnimatePresence>{open && <DrawerPanel key="drawer" onClose={close} />}</AnimatePresence>;
}

function DrawerPanel({ onClose }: { onClose: () => void }) {
  const lines = useCart((s) => s.lines);
  const items = useMemo(() => resolveLines(lines), [lines]);
  const pricing = priceCart(items);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { state, run, reset } = useCheckout();

  useEffect(() => {
    lockScroll(true);
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
      previous?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <motion.button
        type="button"
        aria-label="Cerrar carrito"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-noche/40 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: transition.enter }}
        exit={{ opacity: 0, transition: transition.exit }}
      />
      <motion.aside
        data-surface="light"
        className="absolute top-0 right-0 flex h-full w-full max-w-[480px] flex-col bg-papel-claro text-profundo shadow-[-30px_0_80px_-40px_rgb(36_27_21/0.6)] sm:top-2 sm:right-2 sm:h-[calc(100%-1rem)] sm:rounded-[4px]"
        initial={{ x: "105%" }}
        animate={{ x: 0, transition: { duration: duration.slow, ease: ease.out } }}
        exit={{ x: "105%", transition: { duration: duration.base, ease: ease.inOut } }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 id="cart-title" className="font-serif text-4xl">
            Tu carrito
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="flex size-10 items-center justify-center rounded-full ring-1 ring-profundo/15 transition-transform duration-500 ease-out-expo hover:rotate-90"
          >
            <CloseIcon width={18} />
          </button>
        </div>

        {state.status === "success" ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <CheckoutSuccess orderId={state.orderId}>
              <Link href="/productos" onClick={onClose} className={buttonClasses("solid", "mt-8")}>
                <RollingLabel>Ver los rituales</RollingLabel>
              </Link>
            </CheckoutSuccess>
          </div>
        ) : items.length === 0 ? (
          <EmptyCart onClose={onClose} />
        ) : (
          <>
            <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { ...transition.enter, delay: 0.15 } }}
              >
                <RitualProgress covered={pricing.covered} missing={pricing.missing} compact />
              </motion.div>
              <motion.ul
                className="divide-y divide-profundo/10"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: stagger.base, delayChildren: 0.2 } } }}
              >
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <CartLineItem key={item.slug} item={item} onNavigate={onClose} />
                  ))}
                </AnimatePresence>
              </motion.ul>
            </div>

            <motion.div
              className="border-t border-profundo/10 px-6 pt-5 pb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { ...transition.enter, delay: 0.35 } }}
            >
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-profundo/70">Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(pricing.subtotal)}</dd>
                </div>
                <AnimatePresence initial={false}>
                  {pricing.discount > 0 && (
                    <motion.div
                      className="flex justify-between overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <dt>Los siete rituales</dt>
                      <dd className="tabular-nums">−{formatPrice(pricing.discount)}</dd>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-baseline justify-between pt-1">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-serif text-3xl tabular-nums">{formatPrice(pricing.total)}</dd>
                </div>
              </dl>
              <p className="mt-1 text-xs text-profundo/70">
                {pricing.toFreeShipping > 0
                  ? `Te faltan ${formatPrice(pricing.toFreeShipping)} para el envío gratis.`
                  : "Tenés envío gratis."}
              </p>
              {state.status === "error" && (
                <p role="alert" className="mt-3 text-sm font-medium">
                  {state.message}{" "}
                  <button type="button" className="underline" onClick={reset}>
                    Reintentar
                  </button>
                </p>
              )}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link href="/carrito" onClick={onClose} className={buttonClasses("outline", "px-4")}>
                  <RollingLabel>Ver carrito</RollingLabel>
                </Link>
                <Button type="button" className="px-4" disabled={state.status === "processing"} onClick={() => run(items)}>
                  {state.status === "processing" ? "Procesando…" : "Finalizar"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </motion.aside>
    </div>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center px-8 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { ...transition.enter, delay: 0.2 } }}
    >
      <p className="font-serif text-3xl">Tu día todavía no amaneció.</p>
      <p className="mt-2 text-sm text-profundo/70">Empezá por Alba, o armá tu rutina con el test.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link href="/productos" onClick={onClose} className={buttonClasses("solid")}>
          <RollingLabel>Ver los rituales</RollingLabel>
        </Link>
        <Link href="/ritual#test" onClick={onClose} className={buttonClasses("outline")}>
          <RollingLabel>Hacer el test</RollingLabel>
        </Link>
      </div>
    </motion.div>
  );
}
