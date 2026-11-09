"use client";

import { useState } from "react";
import { checkoutProvider } from "@/lib/checkout";
import { useCart, type CartItem } from "@/store/cart";

type CheckoutState =
  | { status: "idle" }
  | { status: "processing" }
  | { status: "success"; orderId: string }
  | { status: "error"; message: string };

export function useCheckout() {
  const [state, setState] = useState<CheckoutState>({ status: "idle" });
  const clear = useCart((s) => s.clear);

  async function run(items: CartItem[]) {
    setState({ status: "processing" });
    try {
      const result = await checkoutProvider.checkout(items);
      if (result.status === "redirect") {
        window.location.href = result.url;
        return;
      }
      if (result.status === "success") clear();
      setState(result);
    } catch {
      setState({ status: "error", message: "Algo falló al procesar el pedido. Probá de nuevo." });
    }
  }

  return { state, run, reset: () => setState({ status: "idle" }), label: checkoutProvider.label };
}
