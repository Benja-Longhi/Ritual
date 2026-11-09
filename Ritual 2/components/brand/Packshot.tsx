"use client";

import { useId } from "react";
import { ritualNumber, type Format, type Product } from "@/data/products";
import { palette } from "@/lib/palette";
import { darken, lighten } from "@/lib/color";
import { ALEPH_PATH, MARK_SIZE } from "./logoPaths";

/**
 * El envase dibujado en SVG: misma silueta, colores y etiqueta que el modelo
 * 3D, pero liviano para grillas, carrito y fallback. La etiqueta es la de la
 * marca: el marco con la álef, el número, el NOMBRE y el tipo entre corchetes.
 */

type Rect = { x: number; y: number; w: number; h: number };

type Shape = {
  label: Rect;
  /** Zona del cuerpo que ocupa el contenido (solo vidrio). */
  liquid?: Rect;
};

const shapes: Record<Format, Shape> = {
  gotero: { label: { x: 86, y: 196, w: 68, h: 74 }, liquid: { x: 84, y: 172, w: 72, h: 112 } },
  pote: { label: { x: 64, y: 214, w: 112, h: 60 } },
  pomo: { label: { x: 86, y: 118, w: 68, h: 104 } },
  dosificador: { label: { x: 82, y: 168, w: 76, h: 96 }, liquid: { x: 78, y: 146, w: 84, h: 138 } },
  bruma: { label: { x: 86, y: 178, w: 68, h: 86 }, liquid: { x: 82, y: 150, w: 76, h: 134 } },
};

type PackshotProps = {
  product: Pick<Product, "id" | "name" | "type" | "format" | "pack">;
  className?: string;
  /** Sin sombra al pie (cuando el contenedor ya la tiene). */
  bare?: boolean;
};

export function Packshot({ product, className, bare }: PackshotProps) {
  const uid = useId().replace(/:/g, "");
  const { format, pack } = product;
  const shape = shapes[format];
  const body = pack.body;
  const ids = { body: `b${uid}`, cap: `c${uid}`, gloss: `g${uid}`, shadow: `s${uid}` };

  return (
    <svg viewBox="0 0 240 320" className={className} aria-hidden>
      <defs>
        {/* Sombreado cilíndrico: oscuro en los bordes, luz a un tercio */}
        <linearGradient id={ids.body} x1="0" x2="1">
          <stop offset="0" stopColor={darken(body, pack.glass ? 0.35 : 0.18)} />
          <stop offset="0.22" stopColor={body} />
          <stop offset="0.42" stopColor={lighten(body, pack.glass ? 0.32 : 0.4)} />
          <stop offset="0.7" stopColor={body} />
          <stop offset="1" stopColor={darken(body, pack.glass ? 0.45 : 0.26)} />
        </linearGradient>
        <linearGradient id={ids.cap} x1="0" x2="1">
          <stop offset="0" stopColor={darken(pack.cap, 0.3)} />
          <stop offset="0.35" stopColor={lighten(pack.cap, 0.16)} />
          <stop offset="0.6" stopColor={pack.cap} />
          <stop offset="1" stopColor={darken(pack.cap, 0.45)} />
        </linearGradient>
        <linearGradient id={ids.gloss} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={palette.papelClaro} stopOpacity="0.75" />
          <stop offset="1" stopColor={palette.papelClaro} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={ids.shadow}>
          <stop offset="0" stopColor={palette.noche} stopOpacity="0.34" />
          <stop offset="1" stopColor={palette.noche} stopOpacity="0" />
        </radialGradient>
      </defs>

      {!bare && <ellipse cx="120" cy="292" rx="88" ry="12" fill={`url(#${ids.shadow})`} />}

      <Body format={format} bodyFill={`url(#${ids.body})`} capFill={`url(#${ids.cap})`} glass={!!pack.glass} />

      {pack.glass && shape.liquid && pack.liquid && <Liquid rect={shape.liquid} color={pack.liquid} format={format} />}

      <Label rect={shape.label} product={product} />

      {/* Brillo vertical del material */}
      <Gloss format={format} fill={`url(#${ids.gloss})`} />
    </svg>
  );
}

const rectProps = (r: Rect) => ({ x: r.x, y: r.y, width: r.w, height: r.h });

/** La etiqueta: marco con la álef, número, NOMBRE y [ tipo ]. */
function Label({ rect, product }: { rect: Rect; product: PackshotProps["product"] }) {
  const { pack } = product;
  const wide = rect.w > rect.h;
  const mark = wide ? 15 : 13;
  const cx = rect.x + rect.w / 2;
  return (
    <g fill={pack.ink}>
      <rect {...rectProps(rect)} rx="2.5" fill={pack.label} />
      <svg x={rect.x + 7} y={rect.y + 7} width={mark} height={mark} viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}>
        <rect x="14" y="14" width={MARK_SIZE - 28} height={MARK_SIZE - 28} fill="none" stroke={pack.ink} strokeWidth="28" />
        <path d={ALEPH_PATH} fill={pack.ink} fillRule="evenodd" stroke={pack.ink} strokeWidth="10" />
      </svg>
      <text x={rect.x + rect.w - 7} y={rect.y + 18} textAnchor="end" className="font-serif" fontSize="12">
        {ritualNumber(product.id)}
      </text>
      <text
        x={cx}
        y={rect.y + rect.h * (wide ? 0.66 : 0.6)}
        textAnchor="middle"
        className="font-sans"
        fontSize={wide ? 10 : 8.6}
        fontWeight="500"
        letterSpacing={wide ? 3 : 2.4}
      >
        {product.name.toUpperCase()}
      </text>
      <text
        x={cx}
        y={rect.y + rect.h - (wide ? 9 : 10)}
        textAnchor="middle"
        className="font-sans"
        fontSize="4.6"
        letterSpacing="0.3"
        opacity="0.8"
      >
        [ {product.type} ]
      </text>
    </g>
  );
}

function Body({ format, bodyFill, capFill, glass }: { format: Format; bodyFill: string; capFill: string; glass: boolean }) {
  const bodyOpacity = glass ? 0.9 : 1;
  switch (format) {
    case "gotero":
      return (
        <g>
          {/* frasco con hombros redondeados */}
          <path d="M78 290 V168 C78 150 92 140 104 136 V124 H136 V136 C148 140 162 150 162 168 V290 Z" fill={bodyFill} opacity={bodyOpacity} />
          {/* aro y pera del gotero */}
          <rect x="96" y="98" width="48" height="30" rx="5" fill={capFill} />
          <rect x="104" y="40" width="32" height="64" rx="16" fill={capFill} />
          <rect x="104" y="96" width="32" height="4" fill={palette.noche} opacity="0.35" />
        </g>
      );
    case "pote":
      return (
        <g>
          <path d="M54 200 H186 V276 C186 284 180 290 172 290 H68 C60 290 54 284 54 276 Z" fill={bodyFill} opacity={bodyOpacity} />
          <rect x="48" y="160" width="144" height="44" rx="10" fill={capFill} />
          <rect x="48" y="196" width="144" height="5" fill={palette.noche} opacity="0.25" />
        </g>
      );
    case "pomo":
      return (
        <g>
          {/* el pomo se para sobre la tapa: sello arriba, tapa abajo */}
          <path d="M90 258 C86 204 72 122 72 70 H168 C168 122 154 204 150 258 Z" fill={bodyFill} opacity={bodyOpacity} />
          <rect x="70" y="52" width="100" height="20" rx="3" fill={bodyFill} />
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={i} x={76 + i * 8.6} y="55" width="1.4" height="14" fill={palette.noche} opacity="0.14" />
          ))}
          <rect x="92" y="254" width="56" height="38" rx="7" fill={capFill} />
        </g>
      );
    case "dosificador":
      return (
        <g>
          <rect x="72" y="122" width="96" height="168" rx="18" fill={bodyFill} opacity={bodyOpacity} />
          <rect x="100" y="104" width="40" height="22" rx="4" fill={capFill} />
          <rect x="114" y="72" width="12" height="36" fill={capFill} />
          <rect x="98" y="58" width="46" height="18" rx="5" fill={capFill} />
          <rect x="140" y="61" width="30" height="8" rx="3" fill={capFill} />
        </g>
      );
    case "bruma":
      return (
        <g>
          <path d="M76 290 V156 C76 140 90 132 102 130 V116 H138 V130 C150 132 164 140 164 156 V290 Z" fill={bodyFill} opacity={bodyOpacity} />
          <rect x="98" y="98" width="44" height="22" rx="4" fill={capFill} />
          <rect x="106" y="74" width="28" height="28" rx="6" fill={capFill} />
          <circle cx="129" cy="86" r="2.2" fill={palette.papelClaro} opacity="0.7" />
        </g>
      );
  }
}

function Liquid({ rect, color, format }: { rect: Rect; color: string; format: Format }) {
  const top = rect.y;
  const curve = format === "gotero" ? 4 : 5;
  const r = format === "dosificador" ? 14 : 10;
  return (
    <g opacity="0.82">
      <path
        d={`M${rect.x} ${top + curve} Q${rect.x + rect.w / 2} ${top - curve} ${rect.x + rect.w} ${top + curve} V${rect.y + rect.h - r} Q${rect.x + rect.w} ${rect.y + rect.h} ${rect.x + rect.w - r} ${rect.y + rect.h} H${rect.x + r} Q${rect.x} ${rect.y + rect.h} ${rect.x} ${rect.y + rect.h - r} Z`}
        fill={color}
      />
      {/* Menisco: la línea de luz donde el líquido toca el vidrio */}
      <path
        d={`M${rect.x + 3} ${top + curve} Q${rect.x + rect.w / 2} ${top - curve} ${rect.x + rect.w - 3} ${top + curve}`}
        fill="none"
        stroke={lighten(color, 0.6)}
        strokeWidth="1.5"
      />
    </g>
  );
}

function Gloss({ format, fill }: { format: Format; fill: string }) {
  const g: Record<Format, Rect> = {
    gotero: { x: 90, y: 160, w: 9, h: 118 },
    pote: { x: 70, y: 206, w: 10, h: 70 },
    pomo: { x: 88, y: 80, w: 8, h: 160 },
    dosificador: { x: 84, y: 132, w: 10, h: 146 },
    bruma: { x: 88, y: 150, w: 9, h: 128 },
  };
  return <rect {...rectProps(g[format])} rx="5" fill={fill} opacity="0.7" />;
}
