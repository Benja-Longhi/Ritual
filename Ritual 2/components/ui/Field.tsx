"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { transition } from "@/lib/motion";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

/**
 * Campo de formulario: etiqueta, control y mensaje de error que aparece
 * deslizándose (sin empujar el layout de golpe).
 */
export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2.5 block text-sm font-medium text-profundo/80">
        {label}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            className="overflow-hidden text-sm font-medium text-profundo"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: transition.enter }}
            exit={{ height: 0, opacity: 0, transition: transition.exit }}
          >
            <span className="flex items-center gap-2 pt-2">
              <span className="size-1.5 shrink-0 rounded-full bg-eclipse" aria-hidden />
              {error}
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export const inputClasses = (invalid: boolean) =>
  [
    "w-full rounded-[3px] bg-papel-claro px-5 py-4 text-profundo placeholder:text-profundo/40",
    "ring-1 ring-inset transition-[box-shadow,background-color] duration-300 focus:outline-none focus:ring-2",
    invalid ? "ring-eclipse focus:ring-eclipse" : "ring-profundo/15 focus:ring-profundo/70",
  ].join(" ");
