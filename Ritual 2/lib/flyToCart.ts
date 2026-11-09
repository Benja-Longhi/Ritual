"use client";

import { animate } from "motion/react";
import { duration, ease } from "@/lib/motion";

/**
 * Hace "volar" una copia de la imagen del producto hasta el ícono del
 * carrito siguiendo un arco, como el sol que cruza el cielo.
 * Resuelve cuando aterriza, para que el contador reaccione en ese instante.
 */
export async function flyToCart(source: HTMLElement | null): Promise<void> {
  const target = document.querySelector<HTMLElement>("[data-cart-target]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!source || !target || reduced) return;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  // Si el navbar está escondido, apuntamos a donde aparece.
  const toX = to.left + to.width / 2;
  const toY = to.bottom < 0 ? 40 : to.top + to.height / 2;

  const size = Math.min(from.width, from.height, 220);
  const ghost = source.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("id");
  // Un canvas clonado sale en blanco: se saca y se muestra el packshot que tapaba.
  ghost.querySelectorAll("canvas").forEach((c) => c.remove());
  ghost.querySelectorAll<HTMLElement | SVGElement>("[data-fly-show]").forEach((el) => {
    el.style.opacity = "1";
  });
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    margin: "0",
    zIndex: "150",
    borderRadius: "999px",
    overflow: "hidden",
    pointerEvents: "none",
    viewTransitionName: "none",
    boxShadow: "0 20px 50px -20px rgb(36 27 21 / 0.5)",
    background: "var(--color-papel-claro)",
  });
  document.body.appendChild(ghost);

  const dx = toX - (from.left + from.width / 2);
  const dy = toY - (from.top + from.height / 2);
  // Punto alto del arco: sube antes de ir al carrito.
  const lift = Math.min(-80, dy * 0.4 - 120);

  try {
    await animate(
      ghost,
      {
        x: [0, dx * 0.45, dx],
        y: [0, lift, dy],
        scale: [1, 0.55, 0.12],
        rotate: [0, -8, 0],
        opacity: [1, 1, 0.6],
      },
      { duration: duration.slow * 0.9, ease: ease.inOut, times: [0, 0.45, 1] },
    );
  } finally {
    ghost.remove();
  }
}
