"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { spring } from "@/lib/motion";
import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Cursor contextual: aparece solo sobre lo que tiene una acción propia
 * (`data-cursor="Ver"`, "Arrastrá", "Agregar") y dice cuál es. El cursor del
 * sistema sigue ahí: esto suma información, no la reemplaza.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, spring.magnetic);
  const sy = useSpring(y, spring.magnetic);
  const [label, setLabel] = useState<string | null>(null);
  const active = fine && !reduced;

  useEffect(() => {
    if (!active) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(target?.getAttribute("data-cursor") ?? null);
    };
    const onLeave = () => setLabel(null);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [active, x, y]);

  if (!active) return null;

  return (
    <motion.div aria-hidden className="pointer-events-none fixed top-0 left-0 z-[200]" style={{ x: sx, y: sy }}>
      <AnimatePresence>
        {label && (
          <motion.div
            key="ring"
            className="flex size-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-profundo/85 text-[0.8rem] font-medium text-papel backdrop-blur-sm"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.2, opacity: 0 }}
            transition={spring.soft}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={label}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={spring.snappy}
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
