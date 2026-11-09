import { products, type RitualId } from "@/data/products";
import type { CartItem } from "@/store/cart";
import { site } from "./site";

export type CartPricing = {
  subtotal: number;
  /** Rituales que ya están en el carrito. */
  covered: RitualId[];
  missing: RitualId[];
  /** Descuento por los siete rituales (0 si falta alguno). */
  discount: number;
  total: number;
  /** Cuánto falta para el envío gratis (0 si ya lo tiene). */
  toFreeShipping: number;
};

/** Descuento por ritual completo, redondeado a la centena (precios limpios). */
export function ritualDiscountFor(subtotal: number): number {
  return Math.round((subtotal * site.ritualDiscount) / 100) * 100;
}

/**
 * Regla comercial (provisoria): con los 7 rituales en el carrito, 15% off en
 * todo el pedido. El envío gratis se calcula sobre el total con descuento.
 */
export function priceCart(items: CartItem[]): CartPricing {
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const present = new Set(items.map((i) => i.product.id));
  const covered = products.filter((p) => present.has(p.id)).map((p) => p.id);
  const missing = products.filter((p) => !present.has(p.id)).map((p) => p.id);
  const discount = missing.length === 0 ? ritualDiscountFor(subtotal) : 0;
  const total = subtotal - discount;
  return {
    subtotal,
    covered,
    missing,
    discount,
    total,
    toFreeShipping: Math.max(0, site.freeShippingFrom - total),
  };
}
