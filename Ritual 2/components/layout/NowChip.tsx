"use client";

import Link from "next/link";
import { useNow } from "@/hooks/useNow";
import { formatClock, hourOf, ritualAt } from "@/lib/ritualTime";
import { RitualGlyph } from "@/components/brand/RitualGlyph";

type NowChipProps = {
  dark?: boolean;
  className?: string;
};

/**
 * "21:40 · Mantra": qué ritual acompaña este momento del día de quien mira.
 * La hora solo existe en el navegador: hasta hidratar, el chip no ocupa nada.
 */
export function NowChip({ dark, className }: NowChipProps) {
  const now = useNow();
  if (!now) return null;
  const { product, label } = ritualAt(hourOf(now));
  return (
    <Link
      href={`/productos/${product.slug}`}
      title={`${label}: ${product.name}`}
      className={`group flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-colors duration-300 ${
        dark ? "hover:bg-papel/10" : "hover:bg-profundo/6"
      } ${className ?? ""}`}
    >
      <RitualGlyph slug={product.slug} className="size-4.5 transition-transform duration-700 ease-out-expo group-hover:rotate-45" />
      <span className="tabular-nums opacity-75">{formatClock(now)}</span>
      <span>{product.name}</span>
    </Link>
  );
}
