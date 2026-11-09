"use client";

import { useSyncExternalStore } from "react";
import { useCart } from "@/store/cart";

/** true cuando el carrito ya se leyó de localStorage (evita mostrar "vacío" de más). */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useCart.persist.onFinishHydration(onChange),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}
