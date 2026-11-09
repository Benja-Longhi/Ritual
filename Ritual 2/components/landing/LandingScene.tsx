"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, advance, useFrame, useThree, type RootState } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { easing } from "maath";
import { MathUtils, Vector2, type Group } from "three";
import { products, type Product } from "@/data/products";
import { gsap } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { getAnchor, type AnchorKey } from "@/lib/sceneAnchors";
import type { DeviceTier } from "@/hooks/useDeviceTier";
import { getFormatSpec, type Quality } from "@/components/three/geometry";
import { ProductModel } from "@/components/three/ProductModel";
import { Studio } from "@/components/three/Studio";
import { Astro, type AstroState } from "@/components/three/Astro";

/**
 * Una sola escena 3D, fija detrás de toda la landing: el astro que recorre
 * el día (hero → manifiesto → cielo → se pone → luna del cierre) y los siete
 * envases, cada uno en su panel del recorrido. Todo sigue anclas del DOM con
 * los pesos que escribe el scroll en `sceneState`.
 */

type LandingSceneProps = {
  tier: Exclude<DeviceTier, "static">;
  onReady: () => void;
};

export default function LandingScene({ tier, onReady }: LandingSceneProps) {
  const [degraded, setDegraded] = useState(tier === "low");
  const quality: Quality = degraded ? "low" : "high";

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        frameloop="never"
        dpr={degraded ? 1 : [1, 1.75]}
        camera={{ position: [0, 0, 12], fov: 30 }}
        gl={{ antialias: !degraded, alpha: true, powerPreference: "high-performance" }}
      >
        <TickDriver />
        <PerformanceMonitor onDecline={() => setDegraded(true)} />
        <Studio resolution={128} />
        <AstroRig quality={quality} />
        {products.map((product, i) => (
          <Bottle key={product.slug} index={i} product={product} quality={quality} />
        ))}
        <ReadySignal onReady={onReady} />
      </Canvas>
    </div>
  );
}

/**
 * El canvas no tiene reloj propio: avanza en el mismo tick de GSAP que mueve
 * Lenis y ScrollTrigger, así nada se desfasa del DOM. Si ninguna sección con
 * 3D está a la vista, no se dibuja.
 */
function TickDriver() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    let last = 0;
    let compiled = false;
    // Los shaders se compilan en paralelo antes del primer cuadro.
    const { gl, scene, camera } = get();
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .finally(() => {
        compiled = true;
      });
    const tick = (time: number) => {
      if (!compiled || (!sceneState.inView && time - last < 1)) return;
      last = time;
      advance(time, false, get());
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [get]);
  return null;
}

/** Avisa cuando la escena ya dibujó algunos cuadros (shaders compilados). */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 4) onReady();
  });
  return null;
}

type Spot = { x: number; y: number; size: number; on: boolean };

/** Un punto de la pantalla (y un alto) en unidades de mundo, sobre el plano z = 0. */
function toWorld(state: RootState, cx: number, cy: number, heightPx: number): Spot {
  const { width, height } = state.size;
  const vp = state.viewport;
  return {
    x: (cx / width - 0.5) * vp.width,
    y: (0.5 - cy / height) * vp.height,
    size: (heightPx / height) * vp.height,
    on: cy > -heightPx && cy < height + heightPx,
  };
}

function spot(key: AnchorKey, state: RootState): Spot | null {
  const el = getAnchor(key);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return toWorld(state, r.left + r.width / 2, r.top + r.height / 2, r.height);
}

const clamp01 = (v: number) => MathUtils.clamp(v, 0, 1);
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const backOut = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

/** El estado visual del astro: lo escribe el rig en cada cuadro y lo lee el shader. */
const look: AstroState = { phase: 0, opacity: 0 };

function AstroRig({ quality }: { quality: Quality }) {
  const group = useRef<Group>(null);
  const pointer = useRef(new Vector2());

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.1);
    const { entrance, toManifesto, toSky, sky, setting, closing } = sceneState;

    let x = 0;
    let y = 0;
    let size = 0;
    const hero = spot("astro:hero", state);
    if (hero) ({ x, y, size } = hero);
    // Sale detrás del horizonte del hero (el DOM tapa lo que queda abajo).
    if (hero) y -= (1 - inOut(clamp01(entrance))) * size * 0.75;

    const toward = (to: Spot | null, weight: number) => {
      if (!to || weight <= 0) return;
      const k = inOut(clamp01(weight));
      x = MathUtils.lerp(x, to.x, k);
      y = MathUtils.lerp(y, to.y, k);
      size = MathUtils.lerp(size, to.size, k);
    };

    toward(spot("astro:manifesto", state), toManifesto);

    // El cielo del día: un arco que sube hasta el cenit (Vértice) y baja.
    const skyEl = getAnchor("astro:sky");
    if (skyEl) {
      const r = skyEl.getBoundingClientRect();
      const u = clamp01(sky);
      const diameter = Math.min(r.height * 0.55, r.width * 0.16);
      toward(toWorld(state, r.left + r.width * u, r.bottom - diameter / 2 - (r.height - diameter) * Math.sin(u * Math.PI), diameter), toSky);
    }

    // Terminado el día, se pone: baja y se apaga.
    if (setting > 0) y -= inOut(clamp01(setting)) * state.viewport.height * 0.6;
    toward(spot("astro:close", state), closing);

    look.phase = closing > 0.01 ? 6 : clamp01(toSky) * clamp01(sky) * 6;
    look.opacity = Math.max(clamp01(entrance) * (1 - clamp01(setting)), clamp01(closing * 1.4));

    // Sigue al mouse apenas, con inercia (la posición del ancla, en cambio, es exacta).
    easing.damp2(pointer.current, [sceneState.pointerX, sceneState.pointerY], 0.35, delta);
    g.visible = look.opacity > 0.01 && size > 0.001;
    g.position.set(x + pointer.current.x * size * 0.05, y - pointer.current.y * size * 0.04, 0);
    g.scale.setScalar(Math.max(size / 2, 0.0001));
    easing.dampE(g.rotation, [pointer.current.y * 0.2, pointer.current.x * 0.3, 0], 0.4, delta);
  });

  return (
    <group ref={group} visible={false}>
      <Astro state={look} quality={quality} />
    </group>
  );
}

type BottleProps = { index: number; product: Product; quality: Quality };

/** Un envase en su panel del recorrido: de frente cuando el panel está alineado. */
function Bottle({ index, product, quality }: BottleProps) {
  const group = useRef<Group>(null);
  const spec = getFormatSpec(product.format, quality);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.1);
    const el = getAnchor(`bottle:${index}`);
    const weight = sceneState.bottles;
    if (!el || weight <= 0.001) {
      g.visible = false;
      return;
    }
    const r = el.getBoundingClientRect();
    const p = toWorld(state, r.left + r.width / 2, r.top + r.height / 2, r.height);
    const s = (p.size / spec.fitHeight) * backOut(clamp01(weight));
    g.visible = p.on && s > 0.002;
    if (!g.visible) return;
    g.position.set(p.x, p.y, 0.4);
    g.scale.setScalar(Math.max(s, 0.0001));

    const panel = el.closest("[data-panel]");
    const offset = panel ? panel.getBoundingClientRect().left / state.size.width : 0;
    const t = state.clock.elapsedTime;
    const ry = -offset * 1.5 + Math.sin(t * 0.5 + index) * 0.12 + sceneState.pointerX * 0.25;
    easing.dampE(g.rotation, [0.05 + sceneState.pointerY * 0.08, ry, 0], 0.25, delta);
  });

  return (
    <group ref={group} visible={false}>
      <ProductModel product={product} quality={quality} position={[0, -spec.center, 0]} />
    </group>
  );
}
