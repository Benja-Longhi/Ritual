"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart, resolveLines } from "@/store/cart";
import { priceCart } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { spring, stagger, transition } from "@/lib/motion";
import { useCheckout } from "@/hooks/useCheckout";
import { useCartHydrated } from "@/hooks/useCartHydrated";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { CartLineItem } from "./CartLineItem";
import { CheckoutSuccess } from "./CheckoutSuccess";
import { RitualProgress } from "./RitualProgress";

/** Página de carrito: prioriza claridad, con movimiento sutil. */
export function CartView() {
  const hydrated = useCartHydrated();
  const lines = useCart((s) => s.lines);
  const items = useMemo(() => resolveLines(lines), [lines]);
  const pricing = priceCart(items);
  const { state, run, reset } = useCheckout();

  if (!hydrated) return <div className="min-h-[40vh]" aria-busy="true" />;

  if (state.status === "success") {
    return (
      <div className="mx-auto max-w-lg">
        <CheckoutSuccess orderId={state.orderId}>
          <ButtonLink href="/productos" className="mt-8">
            Ver los rituales
          </ButtonLink>
        </CheckoutSuccess>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-start gap-6 border-t border-profundo/12 pt-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: transition.enter }}
      >
        <p className="max-w-xl font-serif text-4xl leading-tight">
          Tu carrito está vacío. El día empieza con Alba.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/productos" icon={<ArrowIcon width={18} />}>
            Ver los rituales
          </ButtonLink>
          <ButtonLink href="/ritual#test" variant="outline">
            ¿Por dónde empiezo?
          </ButtonLink>
        </div>
      </motion.div>
    );
  }

  const shippingProgress = Math.min(1, pricing.total / site.freeShippingFrom);

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_26rem] lg:gap-16">
      <div>
        <RitualProgress covered={pricing.covered} missing={pricing.missing} />
        <motion.ul
          className="mt-6 h-fit divide-y divide-profundo/12 border-y border-profundo/12"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: stagger.base } } }}
        >
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartLineItem key={item.slug} item={item} large />
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      <motion.aside
        aria-label="Resumen"
        className="h-fit rounded-[4px] bg-papel-claro p-7 ring-1 ring-inset ring-profundo/8 lg:sticky lg:top-28"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { ...transition.enter, delay: 0.2 } }}
      >
        <h2 className="font-serif text-4xl">Resumen</h2>

        <div className="mt-6">
          <p className="text-sm text-profundo/75" aria-live="polite">
            {pricing.toFreeShipping > 0 ? (
              <>
                Te faltan <strong className="font-medium text-profundo">{formatPrice(pricing.toFreeShipping)}</strong> para
                el envío gratis.
              </>
            ) : (
              "¡Tenés envío gratis!"
            )}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-profundo/10">
            <motion.div
              className="h-full origin-left rounded-full bg-pino"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: shippingProgress }}
              transition={spring.soft}
            />
          </div>
        </div>

        <dl className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-profundo/70">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(pricing.subtotal)}</dd>
          </div>
          {pricing.discount > 0 && (
            <div className="flex justify-between">
              <dt>Los siete rituales ({Math.round(site.ritualDiscount * 100)}%)</dt>
              <dd className="tabular-nums">−{formatPrice(pricing.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-profundo/70">Envío</dt>
            <dd>{pricing.toFreeShipping > 0 ? "Se calcula al finalizar" : "Gratis"}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-profundo/12 pt-4">
            <dt className="font-medium">Total</dt>
            <dd className="font-serif text-4xl tabular-nums">{formatPrice(pricing.total)}</dd>
          </div>
        </dl>

        {state.status === "error" && (
          <p role="alert" className="mt-4 text-sm font-medium">
            {state.message}{" "}
            <button type="button" className="underline" onClick={reset}>
              Reintentar
            </button>
          </p>
        )}

        <Button type="button" className="mt-8 w-full" disabled={state.status === "processing"} onClick={() => run(items)}>
          {state.status === "processing" ? "Procesando…" : "Finalizar compra"}
        </Button>
        <p className="mt-3 text-center text-xs text-profundo/70">Por ahora el checkout es de prueba: no se realiza ningún cobro.</p>
        <Link href="/productos" className="mt-6 block text-center text-sm underline-offset-4 hover:underline">
          Seguir comprando
        </Link>
      </motion.aside>
    </div>
  );
}
