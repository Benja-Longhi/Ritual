"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { useCart } from "@/store/cart";
import { SmoothScroll } from "./SmoothScroll";

export function Providers({ children }: { children: ReactNode }) {
  // El carrito se hidrata desde localStorage recién en el cliente,
  // así el HTML del servidor y el primer render coinciden.
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      {children}
    </MotionConfig>
  );
}
