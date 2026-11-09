"use client";

import { useRef, useState } from "react";
import { products } from "@/data/products";
import { careSteps, dimensions, manifesto, weekdays, type DimensionId } from "@/data/seven";
import { benefits } from "@/data/benefits";
import { gsap, media, SplitText, useGSAP } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { WORDMARK } from "@/components/brand/logoPaths";
import { RitualGlyph } from "@/components/brand/RitualGlyph";
import { AstroAnchor, DrawnSun } from "./Anchors";

type Point = { x: number; y: number };

/**
 * Las siete posiciones de cada dimensión, en % del escenario. Los mismos
 * siete puntos se reordenan: una semana, una pila de pasos, el heptágono de
 * los beneficios y, al final, el arco del día donde viven los rituales.
 */
const layouts: Record<DimensionId, Point[]> = {
  dias: Array.from({ length: 7 }, (_, i) => ({ x: 7 + i * 14.33, y: 46 })),
  pasos: Array.from({ length: 7 }, (_, i) => ({ x: 9, y: 8 + i * 13.5 })),
  beneficios: Array.from({ length: 7 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7;
    return { x: 50 + Math.cos(a) * 21, y: 50 + Math.sin(a) * 37 };
  }),
  rituales: Array.from({ length: 7 }, (_, i) => ({ x: 7 + i * 14.33, y: 78 - Math.sin((i / 6) * Math.PI) * 58 })),
};

const labels: Record<DimensionId, string[]> = {
  dias: [...weekdays],
  pasos: careSteps.map((s) => s.name),
  beneficios: benefits.map((b) => b.label),
  rituales: products.map((p) => p.name),
};

/** Dónde va la etiqueta de cada punto, según la dimensión. */
function labelStyle(dim: DimensionId, p: Point, i: number) {
  if (dim === "pasos") return { left: `${p.x + 4}%`, top: `${p.y}%`, transform: "translateY(-50%)" };
  if (dim === "beneficios") {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7;
    const x = 50 + Math.cos(a) * 31;
    const y = 50 + Math.sin(a) * 50;
    const tx = Math.cos(a) > 0.25 ? "0%" : Math.cos(a) < -0.25 ? "-100%" : "-50%";
    return { left: `${x}%`, top: `${y}%`, transform: `translate(${tx}, -50%)` };
  }
  return { left: `${p.x}%`, top: `${p.y + (dim === "rituales" ? 11 : 9)}%`, transform: "translateX(-50%)" };
}

const order: DimensionId[] = ["dias", "pasos", "beneficios", "rituales"];

/** 06:15. La frase de la marca, que se enciende al leerla, y el 7 en sus cuatro dimensiones. */
export function Manifesto() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState<DimensionId>("dias");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${media.desktop}, ${media.mobile}`, () => {
        const desktop = window.matchMedia(media.desktop).matches;

        // La frase se enciende palabra por palabra mientras se lee.
        const split = SplitText.create("[data-light-words]", { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: "[data-light-words]", start: "top 82%", end: "bottom 48%", scrub: true },
          },
        );

        // El astro deja el hero y queda como un sol chico arriba del 7.
        gsap.fromTo(
          sceneState,
          { toManifesto: 0 },
          { toManifesto: 1, ease: "none", scrollTrigger: { trigger: pin.current, start: "top bottom", end: "top top", scrub: true } },
        );

        // El 7 se dibuja y se llena.
        gsap.fromTo("[data-seven-line]", { drawSVG: "0%" }, {
          drawSVG: "100%",
          ease: "none",
          scrollTrigger: { trigger: pin.current, start: "top 75%", end: "top 10%", scrub: true },
        });
        gsap.fromTo("[data-seven-fill]", { opacity: 0 }, {
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: pin.current, start: "top 25%", end: "top top", scrub: true },
        });

        // Los siete puntos se reordenan en cada dimensión.
        const atoms = gsap.utils.toArray<HTMLElement>("[data-atom]");
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut", duration: 0.7 },
          scrollTrigger: {
            trigger: pin.current,
            pin: pin.current,
            start: "top top",
            end: () => `+=${window.innerHeight * (desktop ? 3.4 : 2.8)}`,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Cada dimensión cambia a mitad de su transición (ver los tiempos de abajo).
              const time = self.progress * tl.duration();
              const next = order[time < 1.2 ? 0 : time < 2.2 ? 1 : time < 3.2 ? 2 : 3];
              setActive((prev) => (prev === next ? prev : next));
            },
          },
        });
        order.slice(1).forEach((dim, k) => {
          const at = k + 0.8;
          const prev = order[k];
          atoms.forEach((atom, i) => tl.to(atom, { left: `${layouts[dim][i].x}%`, top: `${layouts[dim][i].y}%` }, at));
          tl.to(`[data-labels="${prev}"]`, { autoAlpha: 0, y: -10, duration: 0.3 }, at);
          tl.fromTo(`[data-labels="${dim}"]`, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.4);
          tl.to(`[data-dim="${prev}"]`, { autoAlpha: 0, y: -16, duration: 0.3 }, at);
          tl.fromTo(`[data-dim="${dim}"]`, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.35);
        });
        // Al final, los puntos se vuelven los glifos de los rituales.
        tl.to(atoms, { scale: 0, duration: 0.3, stagger: 0.04 }, 3.3);
        tl.fromTo("[data-ritual-glyph]", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.04 }, 3.4);
        tl.set({}, {}, 4.2);

        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: section, dependencies: [reduced], revertOnUpdate: true },
  );

  const sevenPath = WORDMARK.letters[0];

  return (
    <section ref={section} data-scene-zone aria-labelledby="manifiesto" className="relative" data-surface="light">
      <div className="mx-auto max-w-[1440px] px-6 pt-32 pb-24 md:px-10 md:pt-44 md:pb-36">
        <h2 id="manifiesto" data-light-words className="max-w-[17ch] font-serif text-headline">
          {manifesto}
        </h2>
      </div>

      {reduced ? (
        <StaticDimensions />
      ) : (
        <div ref={pin} className="relative h-svh overflow-hidden">
          <AstroAnchor
            at="manifesto"
            className="absolute top-[13svh] right-[7vw] size-[9svh] md:size-[12svh]"
            fallback={<DrawnSun className="size-full" />}
          />
          <div className="mx-auto grid h-full max-w-[1440px] content-center gap-6 px-6 pt-20 pb-16 md:grid-cols-[auto_1fr] md:items-center md:gap-16 md:px-10 md:py-0">
            <svg viewBox="0 0 62 89" className="h-[16svh] w-auto overflow-visible md:h-[58svh]" aria-hidden>
              <path data-seven-fill d={sevenPath} fill="currentColor" fillRule="evenodd" opacity="0" />
              <path data-seven-line d={sevenPath} fill="none" stroke="currentColor" strokeWidth="0.6" />
            </svg>

            <div>
              <div className="relative min-h-[10.5rem] md:min-h-[9.5rem]">
                {dimensions.map((d, i) => (
                  <div key={d.id} data-dim={d.id} className={`max-w-xl ${i === 0 ? "relative" : "invisible absolute inset-x-0 top-0"}`}>
                    <p className="font-serif text-title">{d.title}</p>
                    <p className="mt-2 font-medium">{d.idea}</p>
                    <p className="mt-2 text-profundo/75">{d.text}</p>
                  </div>
                ))}
              </div>
              <Stage className="mt-6 md:mt-10" />
            </div>
          </div>

          <ol className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 gap-5 text-sm md:flex" aria-label="Dimensiones del 7">
            {dimensions.map((d) => (
              <li key={d.id} className={`transition-opacity duration-500 ${active === d.id ? "opacity-100" : "opacity-40"}`}>
                {d.title}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

/** Los siete puntos, sus etiquetas por dimensión y los glifos del final. */
function Stage({ className }: { className?: string }) {
  return (
    <div className={`relative aspect-[4/3] w-full max-w-3xl md:aspect-[16/8] ${className ?? ""}`} aria-hidden>
      {layouts.dias.map((p, i) => (
        <span
          key={i}
          data-atom
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-profundo md:size-3.5"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        />
      ))}
      {layouts.rituales.map((p, i) => (
        <span
          key={products[i].slug}
          data-ritual-glyph
          className="invisible absolute size-9 -translate-x-1/2 -translate-y-1/2 md:size-12"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <RitualGlyph slug={products[i].slug} className="size-full" />
        </span>
      ))}
      {order.map((dim, k) => (
        <div key={dim} data-labels={dim} className={`absolute inset-0 ${k === 0 ? "" : "invisible"}`}>
          {labels[dim].map((text, i) => (
            <span
              key={text}
              className={`absolute text-[0.78rem] whitespace-nowrap md:text-[0.95rem] ${dim === "rituales" ? "ritual-name text-[0.62rem] md:text-[0.74rem]" : ""}`}
              style={labelStyle(dim, layouts[dim][i], i)}
            >
              {text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Sin movimiento: las cuatro dimensiones, una al lado de la otra. */
function StaticDimensions() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-x-10 gap-y-14 px-6 pb-28 sm:grid-cols-2 md:px-10">
      {dimensions.map((d) => (
        <div key={d.id}>
          <p className="font-serif text-title">{d.title}</p>
          <p className="mt-2 font-medium">{d.idea}</p>
          <p className="mt-2 max-w-md text-profundo/75">{d.text}</p>
          <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-profundo/80">
            {d.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
