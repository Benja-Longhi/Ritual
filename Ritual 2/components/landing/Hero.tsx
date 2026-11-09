"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { getProduct } from "@/data/products";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/components/providers/SmoothScroll";
import { buttonClasses, RollingLabel } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { NowChip } from "@/components/layout/NowChip";
import { AstroAnchor, DrawnSun } from "./Anchors";

const alba = getProduct("alba")!;

/**
 * 06:00. La promesa de la marca y la ventana del logo con el sol que sale
 * detrás de su horizonte. Al bajar, el sol sigue subiendo y el texto se va.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scrub = { trigger: section.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-hero-copy]", { yPercent: -18, autoAlpha: 0, ease: "none", scrollTrigger: { ...scrub, end: "60% top" } });
        gsap.to("[data-hero-sun]", { yPercent: -38, ease: "none", scrollTrigger: scrub });
        gsap.to("[data-hero-hint]", { autoAlpha: 0, ease: "none", scrollTrigger: { ...scrub, end: "15% top" } });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  const toDay = () => {
    const target = document.getElementById("dia");
    if (!target) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 2.6 });
    else target.scrollIntoView();
  };

  return (
    <section ref={section} data-scene-zone data-surface="light" aria-labelledby="hero-title" className="relative">
      <div className="relative mx-auto grid min-h-svh max-w-[1440px] items-center gap-8 px-6 pt-24 pb-24 md:grid-cols-[1.08fr_0.92fr] md:gap-12 md:px-10 md:pt-28">
        {/* La ventana del logo: el sol sale detrás de su horizonte */}
        <div className="order-first md:order-last">
          <div data-hero-frame className="relative mx-auto aspect-square w-full max-w-[min(34rem,46svh)] border-[1.5px] border-profundo/70 md:max-w-[min(36rem,62svh)]">
            {/* data-hero-sun sube con el scroll y lleva el ancla: el astro la sigue */}
            <div data-hero-sun className="pointer-events-none absolute inset-0">
              <AstroAnchor
                at="hero"
                className="absolute bottom-[34%] left-1/2 aspect-square w-[44%] -translate-x-1/2"
                fallback={<DrawnSun className="size-full" />}
              />
            </div>
            {/* Debajo del horizonte el sol no se ve: el suelo tapa la escena 3D */}
            <div className="absolute inset-x-0 bottom-0 h-[34%] border-t border-profundo/50 bg-[var(--page-bg)]" aria-hidden />
            <p className="absolute top-4 left-4 text-sm tabular-nums text-profundo/70">06:00</p>
            <p className="ritual-name absolute top-4 right-4 text-[0.72rem] text-profundo/70">Alba</p>
            <p className="absolute inset-x-5 bottom-5 font-serif text-[clamp(1.05rem,1.6vw,1.4rem)] leading-snug text-profundo/80 italic md:inset-x-7 md:bottom-7">
              {alba.phrase}
            </p>
          </div>
        </div>

        <div data-hero-copy className="relative z-10">
          <h1 id="hero-title" className="font-serif text-[clamp(3.4rem,8.4vw,9.75rem)] leading-[0.88] tracking-[-0.025em]">
            <Line text="La belleza" delay={0.1} />
            <Line text="a tu propio" delay={0.24} />
            <Line text="ritmo." delay={0.38} italic />
          </h1>
          <div className="fade-rise" style={{ "--d": "0.75s" } as CSSProperties}>
            <p className="mt-8 max-w-[34rem] text-lg leading-relaxed text-profundo/80">
              Siete rituales de cosmética clean y vegana que acompañan a tu piel desde la primera luz hasta la noche.
              Ciencia dérmica y bienestar, en el orden justo.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button type="button" onClick={toDay} className={buttonClasses("solid")}>
                <RollingLabel>Recorré el día</RollingLabel>
                <ArrowIcon width={18} className="rotate-90" />
              </button>
              <Link href="/productos" className={buttonClasses("outline")}>
                <RollingLabel>Ver los rituales</RollingLabel>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-10">
        <p data-hero-hint className="hidden items-center gap-3 text-sm text-profundo/70 horizontal:flex" aria-hidden>
          <span className="relative block h-10 w-px overflow-hidden bg-profundo/15">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[hint_2.2s_var(--ease-breath)_infinite] bg-profundo/70" />
          </span>
          Bajá: amanece
        </p>
        <div className="pointer-events-auto ml-auto hidden md:block xl:hidden">
          <NowChip />
        </div>
      </div>
    </section>
  );
}

/** Una línea del titular: sube detrás de una máscara (CSS, sin esperar la hidratación). */
function Line({ text, delay, italic }: { text: string; delay: number; italic?: boolean }) {
  return (
    <span className="block">
      <span className="reveal-mask">
        <span className={`reveal-word ${italic ? "italic" : ""}`} style={{ "--d": `${delay}s` } as CSSProperties}>
          {text}
        </span>
      </span>
    </span>
  );
}
