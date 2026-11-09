"use client";

import { useEffect, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";

export type Surface = "light" | "dark";

/**
 * Detecta sobre qué superficie (`data-surface`) está flotando un elemento
 * fijo, para que adapte su contraste al fondo que tiene detrás.
 */
export function useSurfaceBehind(ref: RefObject<HTMLElement | null>, probeY = 36): Surface {
  const [surface, setSurface] = useState<Surface>("light");
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;

    const probe = () => {
      frame = 0;
      const self = ref.current;
      const stack = document.elementsFromPoint(window.innerWidth / 2, probeY);
      const behind = stack.find((el) => !self?.contains(el));
      const value = behind?.closest<HTMLElement>("[data-surface]")?.dataset.surface;
      setSurface(value === "dark" ? "dark" : "light");
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };

    probe();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Las secciones pueden cambiar de superficie sin scroll (fondos animados).
    const interval = window.setInterval(schedule, 600);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.clearInterval(interval);
      cancelAnimationFrame(frame);
    };
  }, [ref, probeY, pathname]);

  return surface;
}
