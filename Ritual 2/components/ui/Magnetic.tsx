"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { spring } from "@/lib/motion";
import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";

type MagneticProps = {
  children: ReactNode;
  /** Cuánto sigue al puntero (0–1). */
  strength?: number;
  className?: string;
};

/**
 * Atrae suavemente su contenido hacia el puntero: le da peso físico a los
 * llamados a la acción. Solo con mouse fino y sin reduced-motion.
 */
export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), spring.magnetic);
  const y = useSpring(useMotionValue(0), spring.magnetic);
  const active = fine && !reduced;

  const onMove = (e: PointerEvent) => {
    if (!active || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className={`inline-flex ${className ?? ""}`}
    >
      {children}
    </motion.span>
  );
}
