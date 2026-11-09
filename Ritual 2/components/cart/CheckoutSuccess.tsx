"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { duration, ease, transition } from "@/lib/motion";
import { ALEPH_PATH, MARK_SIZE } from "@/components/brand/logoPaths";

/** Confirmación: el marco del logo se cierra lado a lado y la álef aparece adentro. */
export function CheckoutSuccess({ orderId, children }: { orderId: string; children?: ReactNode }) {
  const s = 16;
  return (
    <motion.div
      role="status"
      className="flex flex-col items-center py-10 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: transition.enter }}
    >
      <svg viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`} className="mb-7 size-20" aria-hidden>
        <motion.rect
          x={s / 2}
          y={s / 2}
          width={MARK_SIZE - s}
          height={MARK_SIZE - s}
          fill="none"
          stroke="currentColor"
          strokeWidth={s}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: duration.slower, ease: ease.inOut, delay: 0.1 }}
        />
        <motion.path
          d={ALEPH_PATH}
          fill="currentColor"
          fillRule="evenodd"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: ease.out, delay: 1.1 }}
        />
      </svg>
      <p className="font-serif text-4xl">Gracias. Tu ritual está en camino.</p>
      <p className="mt-2 max-w-xs text-sm text-profundo/75">
        Tu pedido <strong className="font-medium text-profundo">{orderId}</strong> ya está en preparación. Te mandamos
        los detalles por mail.
      </p>
      <p className="mt-1 text-xs text-profundo/70">(Checkout de prueba: no se hizo ningún cobro.)</p>
      {children}
    </motion.div>
  );
}
