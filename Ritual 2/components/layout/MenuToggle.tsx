"use client";

import { motion } from "motion/react";
import type { Ref } from "react";
import { spring } from "@/lib/motion";

type MenuToggleProps = {
  open: boolean;
  onToggle: () => void;
  dark: boolean;
  ref?: Ref<HTMLButtonElement>;
};

/** Dos trazos que se cruzan al abrir: el ícono cuenta el cambio de estado. */
export function MenuToggle({ open, onToggle, dark, ref }: MenuToggleProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="site-menu"
      className={`group flex h-10 items-center gap-2.5 rounded-full px-4 text-sm transition-colors duration-300 ${
        dark ? "hover:bg-papel/10" : "hover:bg-profundo/6"
      }`}
    >
      <span className="hidden sm:inline">{open ? "Cerrar" : "Menú"}</span>
      <span className="relative block h-3 w-4" aria-hidden>
        <motion.span
          className="absolute left-0 h-[1.5px] w-full rounded-full bg-current"
          initial={false}
          animate={open ? { top: "50%", rotate: 45, y: "-50%" } : { top: "15%", rotate: 0, y: "0%" }}
          transition={spring.snappy}
        />
        <motion.span
          className="absolute left-0 h-[1.5px] w-full rounded-full bg-current"
          initial={false}
          animate={open ? { top: "50%", rotate: -45, y: "-50%", width: "100%" } : { top: "75%", rotate: 0, y: "0%", width: "65%" }}
          transition={spring.snappy}
        />
      </span>
      <span className="sr-only sm:hidden">{open ? "Cerrar menú" : "Abrir menú"}</span>
    </button>
  );
}
