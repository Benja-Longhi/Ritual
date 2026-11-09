import {
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  LatheGeometry,
  BoxGeometry,
  MathUtils,
  Vector2,
  Vector3,
} from "three";
import type { Format } from "@/data/products";

/**
 * Envases procedurales: perfiles (radio, altura) que se giran alrededor del
 * eje Y. Sin modelos externos que descargar. Las siluetas son las mismas que
 * las del packshot SVG (components/brand/Packshot.tsx).
 */

export type MaterialSlot = "body" | "glass" | "cap" | "rubber" | "liquid";

export type Part = {
  geometry: BufferGeometry;
  slot: MaterialSlot;
  position?: [number, number, number];
};

export type LabelSpec = {
  radius: number;
  yMin: number;
  yMax: number;
  /** Ángulo que cubre la etiqueta alrededor del envase (rad). */
  theta: number;
  /** Proporción ancho/alto de la etiqueta desplegada: la usa la textura. */
  aspect: number;
};

export type FormatSpec = {
  parts: Part[];
  label: LabelSpec;
  labelGeometry: BufferGeometry;
  /** Alto al que se ajusta el envase dentro de su ancla (los potes, más bajos). */
  fitHeight: number;
  /** Base y centro vertical del envase, para apoyarlo o centrarlo en su ancla. */
  bottom: number;
  center: number;
  /** Contenido para cuando el cuerpo (opaco por defecto) es de vidrio. */
  glassLiquid?: BufferGeometry;
};

type BuiltSpec = Omit<FormatSpec, "bottom" | "center">;

export type Quality = "high" | "low";

type Profile = [number, number][];

/**
 * Pared recta: con dos puntos de apoyo cerca de cada punta, la curva
 * Catmull-Rom no se "infla" entre ellas (y no atraviesa la etiqueta).
 */
function wall(r: number, y0: number, y1: number): Profile {
  return [
    [r, y0],
    [r, y0 + 0.05],
    [r, y1 - 0.05],
    [r, y1],
  ];
}

function lathe(points: Profile, segments: number, smooth = true): LatheGeometry {
  const pts = smooth
    ? new CatmullRomCurve3(
        points.map(([x, y]) => new Vector3(x, y, 0)),
        false,
        "centripetal",
      )
        .getPoints(points.length * 10)
        .map((p) => new Vector2(Math.max(p.x, 0.0001), p.y))
    : points.map(([x, y]) => new Vector2(x, y));
  const geometry = new LatheGeometry(pts, segments);
  geometry.computeVertexNormals();
  return geometry;
}

function labelBand(label: Omit<LabelSpec, "aspect">, segments: number): { spec: LabelSpec; geometry: BufferGeometry } {
  const height = label.yMax - label.yMin;
  const geometry = new CylinderGeometry(
    label.radius,
    label.radius,
    height,
    Math.round(segments * (label.theta / (Math.PI * 2))) + 8,
    1,
    true,
    -label.theta / 2,
    label.theta,
  );
  geometry.translate(0, label.yMin + height / 2, 0);
  return { spec: { ...label, aspect: (label.radius * label.theta) / height }, geometry };
}

/** Cuerpo de vidrio + contenido con un poco menos de radio, hasta el nivel de llenado. */
function liquidFrom(profile: Profile, fill: number, segments: number): LatheGeometry {
  const inner = profile
    .filter(([, y]) => y <= fill)
    .map(([x, y]) => [Math.max(x * 0.9 - 0.012, 0.0001), y + 0.025] as [number, number]);
  const top = inner[inner.length - 1];
  return lathe([...inner, [top[0], fill], [0.0001, fill]], segments, false);
}

const builders: Record<Format, (q: Quality) => BuiltSpec> = {
  gotero(q) {
    const seg = q === "high" ? 64 : 36;
    const body: Profile = [
      [0.0001, -1.1],
      [0.48, -1.1],
      [0.555, -1.04],
      ...wall(0.565, -0.9, 0.28),
      [0.52, 0.44],
      [0.32, 0.56],
      [0.215, 0.6],
      [0.215, 0.74],
      [0.0001, 0.74],
    ];
    const label = labelBand({ radius: 0.578, yMin: -0.78, yMax: -0.12, theta: 2.3 }, seg);
    return {
      parts: [
        { geometry: lathe(body, seg), slot: "glass" },
        { geometry: liquidFrom(body, 0.08, seg), slot: "liquid" },
        // aro y pera del gotero
        { geometry: lathe([[0.0001, 0.62], [0.27, 0.62], [0.285, 0.66], [0.285, 0.95], [0.27, 0.99], [0.0001, 0.99]], seg), slot: "cap" },
        {
          geometry: lathe(
            [
              [0.0001, 0.98],
              [0.17, 0.99],
              [0.19, 1.1],
              [0.19, 1.38],
              [0.15, 1.52],
              [0.07, 1.58],
              [0.0001, 1.59],
            ],
            seg,
          ),
          slot: "rubber",
        },
      ],
      label: label.spec,
      labelGeometry: label.geometry,
      fitHeight: 2.7,
    };
  },

  pote(q) {
    const seg = q === "high" ? 72 : 40;
    const label = labelBand({ radius: 0.978, yMin: -0.45, yMax: 0.13, theta: 2.5 }, seg);
    return {
      parts: [
        {
          geometry: lathe(
            [
              [0.0001, -0.66],
              [0.86, -0.66],
              [0.95, -0.6],
              ...wall(0.965, -0.48, 0.26),
              [0.92, 0.33],
              [0.0001, 0.33],
            ],
            seg,
          ),
          slot: "body",
        },
        {
          geometry: lathe(
            [
              [0.0001, 0.32],
              [0.97, 0.32],
              [1.005, 0.36],
              [1.01, 0.7],
              [0.98, 0.76],
              [0.0001, 0.765],
            ],
            seg,
          ),
          slot: "cap",
        },
      ],
      label: label.spec,
      labelGeometry: label.geometry,
      fitHeight: 2.35,
    };
  },

  pomo(q) {
    const seg = q === "high" ? 64 : 36;
    const y0 = 0.12;
    const yTop = 1.02;
    const tube = lathe(
      [
        [0.0001, -0.74],
        [0.3, -0.74],
        [0.44, -0.62],
        ...wall(0.48, -0.48, yTop - 0.04),
        [0.0001, yTop],
      ],
      seg,
    );
    // El extremo superior se aplana hasta el sello, como un pomo real.
    const pos = tube.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = MathUtils.smoothstep(y, y0, yTop);
      pos.setX(i, pos.getX(i) * (1 + 0.4 * t));
      pos.setZ(i, pos.getZ(i) * (1 - 0.93 * t));
    }
    tube.computeVertexNormals();
    const crimp = new BoxGeometry(1.36, 0.16, 0.07);
    crimp.translate(0, yTop + 0.04, 0);
    const label = labelBand({ radius: 0.492, yMin: -0.46, yMax: 0.1, theta: 2.4 }, seg);
    return {
      parts: [
        { geometry: tube, slot: "body" },
        { geometry: crimp, slot: "body" },
        {
          geometry: lathe(
            [
              [0.0001, -1.12],
              [0.34, -1.12],
              [0.37, -1.08],
              [0.37, -0.76],
              [0.32, -0.72],
              [0.0001, -0.72],
            ],
            seg,
          ),
          slot: "cap",
        },
      ],
      label: label.spec,
      labelGeometry: label.geometry,
      fitHeight: 2.6,
    };
  },

  dosificador(q) {
    const seg = q === "high" ? 64 : 36;
    const head = new BoxGeometry(0.5, 0.15, 0.22);
    head.translate(0.12, 1.27, 0);
    const label = labelBand({ radius: 0.598, yMin: -0.72, yMax: 0.14, theta: 2.3 }, seg);
    const body: Profile = [
      [0.0001, -1.1],
      [0.5, -1.1],
      [0.57, -1.03],
      ...wall(0.585, -0.88, 0.42),
      [0.55, 0.56],
      [0.32, 0.65],
      [0.24, 0.69],
      [0.0001, 0.7],
    ];
    return {
      glassLiquid: liquidFrom(body, 0.24, seg),
      parts: [
        { geometry: lathe(body, seg), slot: "body" },
        { geometry: lathe([[0.0001, 0.66], [0.26, 0.66], [0.275, 0.7], [0.275, 0.88], [0.26, 0.9], [0.0001, 0.9]], seg), slot: "cap" },
        { geometry: new CylinderGeometry(0.055, 0.055, 0.34, 16).translate(0, 1.06, 0), slot: "cap" },
        { geometry: head, slot: "cap" },
      ],
      label: label.spec,
      labelGeometry: label.geometry,
      fitHeight: 2.6,
    };
  },

  bruma(q) {
    const seg = q === "high" ? 64 : 36;
    const body: Profile = [
      [0.0001, -1.1],
      [0.46, -1.1],
      [0.52, -1.05],
      ...wall(0.535, -0.94, 0.4),
      [0.48, 0.55],
      [0.27, 0.66],
      [0.2, 0.7],
      [0.2, 0.84],
      [0.0001, 0.84],
    ];
    const label = labelBand({ radius: 0.548, yMin: -0.78, yMax: -0.02, theta: 2.3 }, seg);
    return {
      parts: [
        { geometry: lathe(body, seg), slot: "glass" },
        { geometry: liquidFrom(body, 0.3, seg), slot: "liquid" },
        { geometry: lathe([[0.0001, 0.74], [0.25, 0.74], [0.265, 0.78], [0.265, 1.0], [0.25, 1.03], [0.0001, 1.03]], seg), slot: "cap" },
        {
          geometry: lathe([[0.0001, 1.02], [0.17, 1.02], [0.18, 1.06], [0.18, 1.3], [0.15, 1.34], [0.0001, 1.35]], seg),
          slot: "cap",
        },
      ],
      label: label.spec,
      labelGeometry: label.geometry,
      fitHeight: 2.6,
    };
  },
};

const cache = new Map<string, FormatSpec>();

/** Geometrías compartidas por todos los productos del mismo envase. */
export function getFormatSpec(format: Format, quality: Quality): FormatSpec {
  const key = `${format}-${quality}`;
  let spec = cache.get(key);
  if (!spec) {
    const built = builders[format](quality);
    let min = Infinity;
    let max = -Infinity;
    for (const part of built.parts) {
      part.geometry.computeBoundingBox();
      const box = part.geometry.boundingBox!;
      min = Math.min(min, box.min.y);
      max = Math.max(max, box.max.y);
    }
    spec = { ...built, bottom: min, center: (min + max) / 2 };
    cache.set(key, spec);
  }
  return spec;
}
