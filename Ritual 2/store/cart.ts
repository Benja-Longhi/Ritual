"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getProduct, type Product } from "@/data/products";
import { CART_KEY } from "@/lib/storageKeys";

export type CartLine = {
  slug: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  drawerOpen: boolean;
  /** Se incrementa en cada "agregar" para que el ícono del carrito reaccione. */
  pulse: number;
  add: (slug: string, quantity?: number) => void;
  /** Agrega varios productos de una (una rutina, los siete, el resultado del test). */
  addMany: (slugs: string[]) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const MAX_QUANTITY = 12;

const clamp = (n: number) => Math.max(1, Math.min(MAX_QUANTITY, Math.round(n)));

function addLine(lines: CartLine[], slug: string, quantity: number): CartLine[] {
  const existing = lines.find((l) => l.slug === slug);
  return existing
    ? lines.map((l) => (l.slug === slug ? { ...l, quantity: clamp(l.quantity + quantity) } : l))
    : [...lines, { slug, quantity: clamp(quantity) }];
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      drawerOpen: false,
      pulse: 0,
      add: (slug, quantity = 1) =>
        set((state) => ({ lines: addLine(state.lines, slug, quantity), pulse: state.pulse + 1 })),
      addMany: (slugs) =>
        set((state) => ({
          lines: slugs.reduce((lines, slug) => addLine(lines, slug, 1), state.lines),
          pulse: state.pulse + 1,
        })),
      remove: (slug) => set((state) => ({ lines: state.lines.filter((l) => l.slug !== slug) })),
      setQuantity: (slug, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.slug === slug ? { ...l, quantity: clamp(quantity) } : l)),
        })),
      clear: () => set({ lines: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: CART_KEY,
      version: 1,
      // No escribir hasta haber leído: un `set` previo a la hidratación
      // (ej: cerrar el drawer al montar) pisaría el carrito guardado.
      storage: createJSONStorage(() => ({
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => {
          if (useCart.persist.hasHydrated()) localStorage.setItem(key, value);
        },
        removeItem: (key) => localStorage.removeItem(key),
      })),
      partialize: (state) => ({ lines: state.lines }),
      skipHydration: true,
    },
  ),
);

export type CartItem = CartLine & { product: Product; total: number };

/** Une las líneas con el catálogo, descarta productos que ya no existen y ordena como el día. */
export function resolveLines(lines: CartLine[]): CartItem[] {
  return lines
    .flatMap((line) => {
      const product = getProduct(line.slug);
      return product ? [{ ...line, product, total: product.price * line.quantity }] : [];
    })
    .sort((a, b) => a.product.id - b.product.id);
}

export function selectCount(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.quantity, 0);
}
