"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  CircleGeometry,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineDashedMaterial,
  LineLoop,
  LineSegments,
  MathUtils,
  MeshBasicMaterial,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type Mesh,
  type Points,
} from "three";
import { light, material, palette } from "@/lib/palette";
import type { Quality } from "./geometry";
import {
  coreFragment,
  coreVertex,
  haloFragment,
  haloVertex,
  ringFragment,
  ringVertex,
  seedFragment,
  seedVertex,
} from "./astroShaders";

/**
 * El astro: una esfera de luz que es sol a la mañana y luna a la noche y
 * cambia de estado con cada ritual. Alba sale; Aura se envuelve en un halo;
 * Prisma se facetea y quiebra la luz en los tonos de la paleta; Vértice se
 * vuelve líneas que se cruzan; Eclipse queda tapado y solo brilla la corona;
 * Mantra respira en anillos; Génesis se disuelve en células y vuelve a formarse.
 * Todo es shader propio: sin modelos, sin texturas, sin postprocesado.
 */

export type AstroState = {
  /** 0 = Alba … 6 = Génesis. Entre dos rituales, los estados se mezclan. */
  phase: number;
  /** 0–1: aparece y se apaga. */
  opacity: number;
};

type Look = {
  top: string;
  bottom: string;
  rim: string;
  rimStrength: number;
  noise: number;
  facet: number;
  bands: number;
  halo: number;
  haloColor: string;
  dashed: number;
  lines: number;
  eclipse: number;
  rings: number;
  seeds: number;
  dissolve: number;
  breath: number;
};

const alba: Look = {
  top: palette.papelClaro,
  bottom: light.prisma,
  rim: palette.papelClaro,
  rimStrength: 0.55,
  noise: 0.035,
  facet: 0,
  bands: 0,
  halo: 0.25,
  haloColor: palette.papelClaro,
  dashed: 0,
  lines: 0,
  eclipse: 0,
  rings: 0,
  seeds: 0,
  dissolve: 0,
  breath: 0,
};

/** Un "look" por ritual, en el orden del día. */
const looks: Look[] = [
  alba,
  { ...alba, bottom: light.aura, rimStrength: 1.1, noise: 0.03, halo: 0.9, dashed: 1 },
  { ...alba, top: light.alba, bottom: material.vitaminC, rimStrength: 0.7, noise: 0, facet: 1, bands: 1, halo: 0.25 },
  { ...alba, bottom: light.vertice, rimStrength: 0.6, noise: 0, facet: 0.35, lines: 1, halo: 0.1 },
  {
    ...alba,
    top: palette.papel,
    bottom: light.vertice,
    rim: light.prisma,
    rimStrength: 1.4,
    noise: 0.02,
    halo: 1.7,
    haloColor: light.prisma,
    eclipse: 1,
  },
  { ...alba, bottom: light.aura, rimStrength: 0.9, noise: 0.05, halo: 0.35, rings: 1, breath: 1 },
  { ...alba, bottom: palette.papel, rimStrength: 1, noise: 0.07, halo: 0.5, seeds: 1, dissolve: 0.3 },
];

const colors = looks.map((l) => ({
  top: new Color(l.top),
  bottom: new Color(l.bottom),
  rim: new Color(l.rim),
  halo: new Color(l.haloColor),
}));

const ink = new Color(palette.profundo);
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function seedGeometry(count: number): BufferGeometry {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const v = new Vector3();
  for (let i = 0; i < count; i++) {
    v.randomDirection().multiplyScalar(0.92 + Math.random() * 0.16);
    positions.set([v.x, v.y, v.z], i * 3);
    seeds[i] = Math.random();
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
  return g;
}

function circleGeometry(radius: number, segments: number): BufferGeometry {
  const points: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(points, 3));
  return g;
}

export function Astro({ state, quality }: { state: AstroState; quality: Quality }) {
  const high = quality === "high";
  // Los materiales se ajustan en cada cuadro a través de refs (no del objeto memorizado).
  const coreRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);
  const dashedRef = useRef<LineLoop>(null);
  const edgesRef = useRef<LineSegments>(null);
  const veeRef = useRef<LineSegments>(null);
  const ringRefs = useRef<(Mesh | null)[]>([]);
  const seedsRef = useRef<Points>(null);
  const occluderRef = useRef<Mesh>(null);

  const parts = useMemo(() => {
    const core = new ShaderMaterial({
      vertexShader: coreVertex,
      fragmentShader: coreFragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uNoise: { value: 0 },
        uBreath: { value: 0 },
        uTop: { value: new Color() },
        uBottom: { value: new Color() },
        uRim: { value: new Color() },
        uRimStrength: { value: 0 },
        uFacet: { value: 0 },
        uBands: { value: 0 },
        uBand1: { value: new Color(light.prisma) },
        uBand2: { value: new Color(light.alba) },
        uBand3: { value: new Color(light.aura) },
        uDissolve: { value: 0 },
        uOpacity: { value: 0 },
      },
    });
    const halo = new ShaderMaterial({
      vertexShader: haloVertex,
      fragmentShader: haloFragment,
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: new Color() }, uStrength: { value: 0 } },
    });
    const ring = () =>
      new ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: new Color(palette.papelClaro) }, uOpacity: { value: 0 } },
      });
    const seeds = new ShaderMaterial({
      vertexShader: seedVertex,
      fragmentShader: seedFragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: 0 },
        uSize: { value: high ? 5 : 4 },
        uColor: { value: new Color(palette.papelClaro) },
        uOpacity: { value: 0 },
      },
    });

    // Vértice: la V del glifo y las aristas de un cristal simple.
    const vee = new BufferGeometry();
    vee.setAttribute(
      "position",
      new Float32BufferAttribute([-1.95, 1.7, 0, 0, -1.4, 0, 1.95, 1.7, 0, 0, -1.4, 0, -1.3, 0.12, 0, 1.3, 0.12, 0], 3),
    );
    const dashedRing = new LineLoop(
      circleGeometry(1.52, 160),
      new LineDashedMaterial({ color: ink, dashSize: 0.05, gapSize: 0.1, transparent: true, opacity: 0 }),
    );
    dashedRing.computeLineDistances();

    return {
      coreGeometry: new IcosahedronGeometry(1, high ? 32 : 14),
      haloGeometry: new SphereGeometry(1.34, 48, 32),
      ringGeometry: new RingGeometry(0.99, 1, 128),
      seedGeometry: seedGeometry(high ? 900 : 380),
      occluderGeometry: new CircleGeometry(0.95, 64),
      edges: new LineSegments(
        new EdgesGeometry(new IcosahedronGeometry(1.015, 1)),
        new LineBasicMaterial({ color: ink, transparent: true, opacity: 0 }),
      ),
      vee: new LineSegments(vee, new LineBasicMaterial({ color: ink, transparent: true, opacity: 0 })),
      dashedRing,
      core,
      halo,
      rings: [ring(), ring(), ring()],
      seeds,
      occluder: new MeshBasicMaterial({ color: palette.noche, transparent: true, opacity: 0 }),
    };
  }, [high]);

  useFrame((frame, rawDelta) => {
    const core = coreRef.current;
    const halo = haloRef.current;
    const dashed = dashedRef.current;
    const edges = edgesRef.current;
    const vee = veeRef.current;
    const seeds = seedsRef.current;
    const occluder = occluderRef.current;
    if (!core || !halo || !dashed || !edges || !vee || !seeds || !occluder) return;

    const delta = Math.min(rawDelta, 0.1);
    const time = frame.clock.elapsedTime;
    const p = MathUtils.clamp(state.phase, 0, looks.length - 1);
    const k0 = Math.floor(p);
    const k1 = Math.min(looks.length - 1, k0 + 1);
    const t = p - k0;
    const A = looks[k0];
    const B = looks[k1];
    const m = (key: keyof Look) => MathUtils.lerp(A[key] as number, B[key] as number, t);
    const o = state.opacity;

    const u = (core.material as ShaderMaterial).uniforms;
    u.uTime.value = time;
    u.uNoise.value = m("noise");
    u.uBreath.value = m("breath");
    u.uTop.value.lerpColors(colors[k0].top, colors[k1].top, t);
    u.uBottom.value.lerpColors(colors[k0].bottom, colors[k1].bottom, t);
    u.uRim.value.lerpColors(colors[k0].rim, colors[k1].rim, t);
    u.uRimStrength.value = m("rimStrength");
    u.uFacet.value = m("facet");
    u.uBands.value = m("bands");
    u.uDissolve.value = m("dissolve");
    u.uOpacity.value = o;
    core.rotation.y += delta * 0.06;

    const h = (halo.material as ShaderMaterial).uniforms;
    h.uColor.value.lerpColors(colors[k0].halo, colors[k1].halo, t);
    h.uStrength.value = m("halo") * o;

    const dash = m("dashed") * o;
    (dashed.material as LineDashedMaterial).opacity = dash * 0.55;
    dashed.visible = dash > 0.01;
    dashed.rotation.z += delta * 0.08;

    const lines = m("lines") * o;
    (vee.material as LineBasicMaterial).opacity = lines * 0.6;
    (edges.material as LineBasicMaterial).opacity = lines * 0.28;
    vee.visible = edges.visible = lines > 0.01;
    edges.rotation.y = core.rotation.y;

    // Eclipse: el disco entra desde la derecha y deja solo la corona.
    const e = m("eclipse");
    occluder.position.x = MathUtils.lerp(2.6, 0.06, inOut(e));
    occluder.visible = e > 0.01 && o > 0.01;
    (occluder.material as MeshBasicMaterial).opacity = Math.min(1, e * 2.5) * o;

    // Mantra: tres anillos que se abren y se apagan, uno detrás del otro.
    const rings = m("rings") * o;
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const cycle = (time / 8 + i / 3) % 1;
      ring.scale.setScalar(1.12 + cycle * 1.5);
      (ring.material as ShaderMaterial).uniforms.uOpacity.value = rings * (1 - cycle) * 0.6;
      ring.visible = rings > 0.01;
    });

    const s = (seeds.material as ShaderMaterial).uniforms;
    const spread = m("seeds");
    s.uTime.value = time;
    s.uSpread.value = spread;
    s.uOpacity.value = spread * o;
  });

  return (
    <group>
      <mesh ref={coreRef} geometry={parts.coreGeometry} material={parts.core} renderOrder={1} />
      <mesh ref={haloRef} geometry={parts.haloGeometry} material={parts.halo} renderOrder={2} />
      <primitive ref={dashedRef} object={parts.dashedRing} renderOrder={3} />
      <primitive ref={edgesRef} object={parts.edges} renderOrder={3} />
      <primitive ref={veeRef} object={parts.vee} renderOrder={3} />
      {parts.rings.map((material, i) => (
        <mesh
          key={i}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
          geometry={parts.ringGeometry}
          material={material}
          renderOrder={3}
          visible={false}
        />
      ))}
      <points ref={seedsRef} geometry={parts.seedGeometry} material={parts.seeds} renderOrder={4} />
      <mesh ref={occluderRef} geometry={parts.occluderGeometry} material={parts.occluder} position={[2.6, 0, 1.25]} renderOrder={5} visible={false} />
    </group>
  );
}
