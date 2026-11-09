"use client";

import { useSyncExternalStore } from "react";

/** Suscripción a una media query. En el servidor devuelve `serverValue`. */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");
/** Como el de Motion, pero seguro para la hidratación (arranca con el valor del servidor). */
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
