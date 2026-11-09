"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import { gsapEase } from "@/lib/motion";
import { resetScene, sceneState } from "@/lib/sceneState";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { useIntro } from "@/store/intro";
import { useScene } from "@/store/scene";

const LandingScene = dynamic(() => import("./LandingScene"), { ssr: false });

/**
 * Monta la escena 3D de la landing cuando termina la intro (así nunca la
 * traba) y el navegador queda libre, solo si el equipo la aguanta. Si no
 * la aguanta, o si tarda demasiado, las anclas muestran sus versiones SVG.
 */
export function LandingCanvas() {
  const tier = useDeviceTier();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const introDone = useIntro((s) => s.done);
  const setMode = useScene((s) => s.setMode);

  useEffect(() => {
    resetScene();
    return () => setMode("pending");
  }, [setMode]);

  // Sin GPU o con reduced-motion no hay 3D: directo a los SVG.
  useEffect(() => {
    if (tier === "static") setMode("svg");
  }, [tier, setMode]);

  useEffect(() => {
    if (!introDone || tier === "static" || tier === null) return;
    const idle = typeof requestIdleCallback === "function";
    const id = idle ? requestIdleCallback(() => setLoad(true), { timeout: 400 }) : setTimeout(() => setLoad(true), 100);
    // Red de seguridad: si la escena no llega a dibujar, se muestran los SVG.
    const fallback = setTimeout(() => {
      if (useScene.getState().mode === "pending") setMode("svg");
    }, 8000);
    return () => {
      if (idle) cancelIdleCallback(id as number);
      else clearTimeout(id);
      clearTimeout(fallback);
    };
  }, [introDone, tier, setMode]);

  // Solo se dibuja si alguna sección con 3D está cerca de la pantalla.
  useEffect(() => {
    const zones = document.querySelectorAll("[data-scene-zone]");
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        sceneState.inView = visible.size > 0;
      },
      { rootMargin: "25% 0px" },
    );
    zones.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, []);

  // Puntero → escena, sin pasar por React.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // El astro sale apenas la escena dibuja: el amanecer del hero.
  useEffect(() => {
    if (!ready) return;
    setMode("3d");
    const tween = gsap.to(sceneState, { entrance: 1, duration: 2.4, ease: gsapEase.out });
    return () => {
      tween.kill();
    };
  }, [ready, setMode]);

  if (!(tier === "high" || tier === "low") || !load) return null;
  return (
    <div className={`transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
      <LandingScene tier={tier} onReady={() => setReady(true)} />
    </div>
  );
}
