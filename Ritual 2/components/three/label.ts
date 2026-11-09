import { CanvasTexture, SRGBColorSpace } from "three";
import { ritualNumber, type Product } from "@/data/products";
import { ALEPH_PATH, MARK_SIZE } from "@/components/brand/logoPaths";

/**
 * La etiqueta del envase dibujada en un canvas con las fuentes reales de la
 * marca (next/font las expone como variables CSS) y el logo vectorizado.
 * Se llama recién cuando las fuentes terminaron de cargar.
 */

const cache = new Map<string, CanvasTexture>();

function fontFamily(variable: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
}

export async function fontsReady(): Promise<void> {
  const serif = fontFamily("--font-cormorant", "serif");
  const sans = fontFamily("--font-jost", "sans-serif");
  await Promise.all([
    document.fonts.load(`400 64px ${serif}`, "0123456789"),
    document.fonts.load(`500 32px ${sans}`, "ALBA[ ]"),
  ]).catch(() => undefined);
}

type LabelProduct = Pick<Product, "id" | "name" | "type" | "pack">;

function setTracking(ctx: CanvasRenderingContext2D, px: number) {
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
}

/** El isotipo (marco + álef) en un cuadrado de lado `size`. */
function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, ink: string) {
  const k = size / MARK_SIZE;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = Math.max(10, 2.2 / k);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, MARK_SIZE - ctx.lineWidth, MARK_SIZE - ctx.lineWidth);
  const aleph = new Path2D(ALEPH_PATH);
  ctx.fill(aleph, "evenodd");
  ctx.lineWidth = Math.max(4, 1 / k);
  ctx.stroke(aleph);
  ctx.restore();
}

export function getLabelTexture(product: LabelProduct, aspect: number): CanvasTexture {
  const key = `${product.id}-${aspect.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const h = 360;
  const w = Math.round(h * aspect);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const serif = fontFamily("--font-cormorant", "serif");
  const sans = fontFamily("--font-jost", "sans-serif");
  const { label, ink } = product.pack;
  const cx = w / 2;

  ctx.fillStyle = label;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // La cara visible es el centro de la banda: todo va centrado.
  const markSize = h * 0.2;
  drawMark(ctx, cx - markSize / 2, h * 0.1, markSize, ink);

  ctx.font = `500 ${h * 0.13}px ${sans}`;
  setTracking(ctx, h * 0.045);
  // El tracking deja aire a la derecha: se compensa para centrar.
  ctx.fillText(product.name.toUpperCase(), cx + h * 0.0225, h * 0.56);

  ctx.font = `400 ${h * 0.058}px ${sans}`;
  setTracking(ctx, h * 0.004);
  ctx.globalAlpha = 0.85;
  ctx.fillText(`[ ${product.type} ]`, cx, h * 0.7);
  ctx.globalAlpha = 1;

  // Número del ritual, abajo: el orden del día se lee en el envase.
  ctx.font = `400 ${h * 0.12}px ${serif}`;
  setTracking(ctx, 0);
  ctx.fillText(ritualNumber(product.id), cx, h * 0.9);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  cache.set(key, texture);
  return texture;
}
