"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ritualNumber } from "@/data/products";
import { useCart, type CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { distance, transition } from "@/lib/motion";
import { Packshot } from "@/components/brand/Packshot";
import { QuantityStepper } from "./QuantityStepper";

export const lineVariants: Variants = {
  hidden: { opacity: 0, x: distance.md },
  show: { opacity: 1, x: 0, transition: transition.enter },
  exit: { opacity: 0, x: -distance.sm, transition: transition.exit },
};

type CartLineItemProps = {
  item: CartItem;
  onNavigate?: () => void;
  large?: boolean;
};

export function CartLineItem({ item, onNavigate, large }: CartLineItemProps) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const { product } = item;

  return (
    <motion.li layout="position" variants={lineVariants} exit="exit" className="flex gap-4 py-5">
      <Link
        href={`/productos/${product.slug}`}
        onClick={onNavigate}
        className={`${large ? "w-28 md:w-32" : "w-20"} block shrink-0 overflow-hidden rounded-[3px]`}
        style={{ background: `color-mix(in oklab, var(--color-${product.slug}) 70%, var(--color-papel))` }}
        tabIndex={-1}
        aria-hidden
      >
        <Packshot product={product} className="aspect-[4/5] w-full p-1.5" bare />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-profundo/70">
              <span className="tabular-nums">{ritualNumber(product.id)}</span> · {product.type}
            </p>
            <Link
              href={`/productos/${product.slug}`}
              onClick={onNavigate}
              className={`ritual-name mt-1 block ${large ? "text-lg" : "text-base"}`}
            >
              {product.name}
            </Link>
            <p className="mt-0.5 text-xs text-profundo/70">{product.size}</p>
          </div>
          <p className="text-sm font-medium tabular-nums">{formatPrice(item.total)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            value={item.quantity}
            onChange={(q) => setQuantity(product.slug, q)}
            label={product.name}
            size={large ? "md" : "sm"}
          />
          <button
            type="button"
            onClick={() => remove(product.slug)}
            className="text-xs text-profundo/70 underline-offset-4 hover:text-profundo hover:underline"
          >
            Quitar
          </button>
        </div>
      </div>
    </motion.li>
  );
}
