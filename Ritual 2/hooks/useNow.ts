"use client";

import { useSyncExternalStore } from "react";

/**
 * Un solo reloj compartido por todo el sitio: avanza al empezar cada minuto.
 * En el servidor (y en la hidratación) devuelve null, porque la hora del
 * visitante solo existe en su navegador.
 */

let now: Date | null = null;
let timer = 0;
const listeners = new Set<() => void>();

function tick() {
  now = new Date();
  listeners.forEach((l) => l());
  timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 20);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) tick();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearTimeout(timer);
      now = null;
    }
  };
}

export function useNow(): Date | null {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );
}
