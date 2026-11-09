"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, PresentationControls } from "@react-three/drei";
import type { Group } from "three";
import type { Product } from "@/data/products";
import type { DeviceTier } from "@/hooks/useDeviceTier";
import { getFormatSpec, type Quality } from "./geometry";
import { ProductModel } from "./ProductModel";
import { Studio } from "./Studio";

type ProductViewerProps = {
  product: Product;
  tier: Exclude<DeviceTier, "static">;
  onReady: () => void;
};

/**
 * El producto en 3D en su ficha: se puede girar arrastrando y vuelve solo
 * a su lugar. Gira despacio cuando nadie lo toca. Si la ficha no se ve,
 * no se dibuja.
 */
export default function ProductViewer({ product, tier, onReady }: ProductViewerProps) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [compiled, setCompiled] = useState(false);
  const markCompiled = useCallback(() => setCompiled(true), []);
  const [degraded, setDegraded] = useState(tier === "low");
  const quality: Quality = degraded ? "low" : "high";
  const spec = getFormatSpec(product.format, quality);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={container} className="absolute inset-0 cursor-grab active:cursor-grabbing" aria-hidden>
      <Canvas
        frameloop={visible && compiled ? "always" : "never"}
        dpr={degraded ? 1 : [1, 2]}
        camera={{ position: [0, 0, 9], fov: 30 }}
        gl={{ antialias: !degraded, alpha: true, powerPreference: "high-performance" }}
      >
        <PerformanceMonitor onDecline={() => setDegraded(true)} />
        <Studio />
        <PresentationControls
          global={false}
          cursor={false}
          snap
          speed={1.6}
          polar={[-0.3, 0.3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
        >
          <Idle>
            <group scale={3.2 / spec.fitHeight}>
              <ProductModel product={product} quality={quality} position={[0, -spec.center, 0]} />
            </group>
          </Idle>
        </PresentationControls>
        <ReadySignal onReady={onReady} />
        <CompileFirst onDone={markCompiled} />
      </Canvas>
    </div>
  );
}

/** Gira despacio y flota apenas: el envase está "vivo" aunque nadie lo toque. */
function Idle({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = Math.sin(t * 0.35) * 0.55;
    g.position.y = Math.sin(t * 0.9) * 0.06;
  });
  return <group ref={group}>{children}</group>;
}

/**
 * Compila los shaders en paralelo antes de dibujar el primer cuadro, así el
 * hilo principal no se traba. Va al final: cuando corre, el modelo ya está.
 */
function CompileFirst({ onDone }: { onDone: () => void }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const { gl, scene, camera } = get();
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .finally(onDone);
  }, [get, onDone]);
  return null;
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 4) onReady();
  });
  return null;
}
