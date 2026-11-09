"use client";

import { useEffect, useState } from "react";

type ScrollState = {
  /** Se pasó el umbral de "compacto". */
  scrolled: boolean;
  /** Bajando y lejos del tope: el navbar se esconde. */
  hidden: boolean;
};

/**
 * Estado de scroll para el navbar, con histéresis para que no titile
 * con movimientos chicos del trackpad.
 */
export function useScrollState(threshold = 48, hideAfter = 320, tolerance = 8): ScrollState {
  const [state, setState] = useState<ScrollState>({ scrolled: false, hidden: false });

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) < tolerance) return;
      last = y;
      setState((prev) => {
        const scrolled = y > threshold;
        const hidden = delta > 0 && y > hideAfter;
        return prev.scrolled === scrolled && prev.hidden === hidden ? prev : { scrolled, hidden };
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [threshold, hideAfter, tolerance]);

  return state;
}
