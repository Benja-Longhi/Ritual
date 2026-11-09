"use client";

import { AnimatePresence, motion } from "motion/react";
import { MAX_QUANTITY } from "@/store/cart";
import { spring } from "@/lib/motion";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "md";
};

export function QuantityStepper({ value, onChange, label, size = "sm" }: QuantityStepperProps) {
  const btn = size === "sm" ? "size-8" : "size-11";
  return (
    <div role="group" aria-label={`Cantidad de ${label}`} className="inline-flex items-center rounded-full ring-1 ring-profundo/15">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Restar uno"
        className={`${btn} flex items-center justify-center rounded-full transition-colors hover:bg-profundo/6 disabled:opacity-30`}
      >
        <MinusIcon width={14} />
      </button>
      <span className="relative w-7 overflow-hidden text-center text-sm tabular-nums" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="block"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={spring.snappy}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        aria-label="Sumar uno"
        className={`${btn} flex items-center justify-center rounded-full transition-colors hover:bg-profundo/6 disabled:opacity-30`}
      >
        <PlusIcon width={14} />
      </button>
    </div>
  );
}
