import type { CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { priceCart } from "@/lib/pricing";
import { site } from "@/lib/site";
import { ritualNumber } from "@/data/products";

/**
 * Contrato del cierre de compra. Hoy se usa el simulado; para pasar a
 * Mercado Pago o WhatsApp alcanza con cambiar `checkoutProvider`.
 */
export type CheckoutResult =
  | { status: "success"; orderId: string }
  | { status: "redirect"; url: string }
  | { status: "error"; message: string };

export type CheckoutProvider = {
  id: "simulado" | "mercadopago" | "whatsapp";
  label: string;
  checkout: (items: CartItem[]) => Promise<CheckoutResult>;
};

const simulated: CheckoutProvider = {
  id: "simulado",
  label: "Finalizar compra",
  async checkout(items) {
    if (items.length === 0) return { status: "error", message: "Tu carrito está vacío." };
    await new Promise((r) => setTimeout(r, 1400));
    const orderId = `7R-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    return { status: "success", orderId };
  },
};

/** Arma el pedido como mensaje y abre WhatsApp. Lista para activar. */
export const whatsapp: CheckoutProvider = {
  id: "whatsapp",
  label: "Cerrar pedido por WhatsApp",
  async checkout(items) {
    const lines = items.map(
      (i) => `• ${ritualNumber(i.product.id)} ${i.product.name} [${i.product.type}] · ${i.quantity} × ${formatPrice(i.product.price)}`,
    );
    const { discount, total } = priceCart(items);
    const text = [
      `¡Hola ${site.name}! Quiero hacer este pedido:`,
      ...lines,
      ...(discount > 0 ? [`Los 7 rituales: −${formatPrice(discount)}`] : []),
      `Total: ${formatPrice(total)}`,
    ].join("\n");
    return {
      status: "redirect",
      url: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`,
    };
  },
};

export const checkoutProvider: CheckoutProvider = simulated;
