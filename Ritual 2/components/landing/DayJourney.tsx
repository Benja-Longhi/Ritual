"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { blocks, products, ritualNumber, type Product } from "@/data/products";
import { getActive } from "@/data/actives";
import { isDarkLight, light, palette } from "@/lib/palette";
import { gsap, media, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { formatHour } from "@/lib/ritualTime";
import { getLenis } from "@/components/providers/SmoothScroll";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { RitualGlyph } from "@/components/brand/RitualGlyph";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { AstroAnchor, BottleAnchor } from "./Anchors";

/** Desktop con movimiento: horizontal. Si no, los rituales se apilan. */
const HORIZONTAL = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

const hourLabel = (p: Product) => (p.block === "comodin" ? "AM y PM" : formatHour(p.hour));

/**
 * "Un día, siete rituales". Al bajar, el día avanza en horizontal: el astro
 * cruza el cielo en arco (sale con Alba, cenit en Vértice, luna en Génesis)
 * y cambia de estado con cada ritual; el fondo pasa por las siete luces y
 * cada envase espera en su panel.
 */
export function DayJourney() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const horizontal = useMediaQuery(HORIZONTAL);

  useGSAP(
    () => {
      const root = document.documentElement;
      const mm = gsap.matchMedia();
      // El reloj pasa por la hora de cada ritual cuando su panel está alineado.
      const setClock = (p: number) => {
        const x = Math.min(Math.max(p, 0), 1) * (products.length - 1);
        const i = Math.min(products.length - 2, Math.floor(x));
        const hour = products[i].hour + (products[i + 1].hour - products[i].hour) * (x - i);
        if (clock.current) clock.current.textContent = formatHour(hour);
      };
      const pick = (i: number) => setActive((prev) => (prev === i ? prev : i));

      mm.add(media.desktop, () => {
        const vw = () => window.innerWidth;
        const distance = () => (track.current?.scrollWidth ?? 0) - vw();
        const entry = { trigger: section.current, start: "top bottom", end: "top top", scrub: true };

        // Entrada: el astro baja al comienzo del arco y la luz pasa al alba.
        gsap.fromTo(sceneState, { toSky: 0 }, { toSky: 1, ease: "none", scrollTrigger: entry });
        gsap.fromTo(sceneState, { bottles: 0 }, { bottles: 1, ease: "none", scrollTrigger: { ...entry, start: "top 55%" } });
        gsap.fromTo(
          root,
          { "--page-bg": palette.papel },
          { "--page-bg": light.alba, ease: "none", immediateRender: false, scrollTrigger: { ...entry, start: "top 60%" } },
        );

        // El día: un píxel de scroll mueve un píxel la fila de paneles.
        const range = {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: true,
          invalidateOnRefresh: true,
        };
        ScrollTrigger.create({
          trigger: section.current,
          pin: pin.current,
          start: "top top",
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            pick(Math.round(self.progress * (products.length - 1)));
            setClock(self.progress);
          },
        });
        gsap.to(track.current, { x: () => -distance(), ease: "none", scrollTrigger: range });
        gsap.fromTo(sceneState, { sky: 0 }, { sky: 1, ease: "none", scrollTrigger: range });
        const colors = gsap.timeline({ scrollTrigger: range });
        products.slice(1).forEach((p, i) => {
          colors.fromTo(
            root,
            { "--page-bg": light[products[i].slug] },
            { "--page-bg": light[p.slug], ease: "none", duration: 1, immediateRender: false },
          );
        });

        // El contenido de cada panel entra a medida que llega.
        gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel, i) => {
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger:
              i === 0
                ? { trigger: section.current, start: "top 45%", end: "top top", scrub: true }
                : {
                    trigger: section.current,
                    start: () => `top+=${(i - 0.85) * vw()} top`,
                    end: () => `top+=${(i - 0.3) * vw()} top`,
                    scrub: true,
                    invalidateOnRefresh: true,
                  },
          });
          panel.querySelectorAll("[data-reveal]").forEach((el, k) => {
            tl.from(el, { y: 40, autoAlpha: 0, duration: 1 }, k * 0.12);
          });
        });

        // Salida: el astro se pone, los envases se van y vuelve el papel (otro día).
        const exit = { trigger: section.current, start: "bottom bottom", end: "bottom 30%", scrub: true };
        gsap.fromTo(sceneState, { setting: 0 }, { setting: 1, ease: "none", immediateRender: false, scrollTrigger: exit });
        gsap.fromTo(
          sceneState,
          { bottles: 1 },
          { bottles: 0, ease: "none", immediateRender: false, scrollTrigger: { ...exit, end: "bottom 75%" } },
        );
        gsap.fromTo(
          root,
          { "--page-bg": light.genesis },
          { "--page-bg": palette.papel, ease: "none", immediateRender: false, scrollTrigger: exit },
        );
        return () => root.style.removeProperty("--page-bg");
      });

      mm.add(media.mobile, () => {
        // El cielo queda fijo arriba: el astro cruza el arco mientras pasan los rituales.
        gsap.fromTo(sceneState, { toSky: 0 }, {
          toSky: 1,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top bottom", end: "top top", scrub: true },
        });
        gsap.fromTo(sceneState, { sky: 0 }, {
          sky: 1,
          ease: "none",
          scrollTrigger: {
            trigger: track.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => setClock(self.progress),
          },
        });
        const light$ = (color: string) => gsap.to(root, { "--page-bg": color, duration: 0.9, ease: "power2.out", overwrite: "auto" });
        gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel, i) => {
          ScrollTrigger.create({
            trigger: panel,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              if (!self.isActive) return;
              pick(i);
              light$(light[products[i].slug]);
            },
          });
        });
        ScrollTrigger.create({ trigger: section.current, start: "top 55%", onLeaveBack: () => light$(palette.papel) });
        ScrollTrigger.create({
          trigger: section.current,
          start: "bottom 55%",
          onEnter: () => light$(palette.papel),
          onLeaveBack: () => light$(light.genesis),
        });
        gsap.fromTo(sceneState, { setting: 0 }, {
          setting: 1,
          ease: "none",
          immediateRender: false,
          scrollTrigger: { trigger: section.current, start: "bottom bottom", end: "bottom 40%", scrub: true },
        });
        return () => root.style.removeProperty("--page-bg");
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  /** Saltar a un ritual desde el HUD. */
  const goTo = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + i * window.innerWidth;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { duration: 1.6 });
    else window.scrollTo({ top });
  };

  const current = products[active];
  const dark = isDarkLight(current.slug);

  return (
    <section ref={section} id="dia" data-scene-zone aria-labelledby="dia-titulo" className="relative">
      <h2 id="dia-titulo" className="sr-only">
        Un día, siete rituales
      </h2>
      <div ref={pin} className="relative horizontal:h-svh horizontal:overflow-hidden">
        {/* El cielo: el astro recorre este arco (en mobile queda fijo arriba) */}
        <div className="pointer-events-none sticky top-0 z-0 h-svh horizontal:absolute horizontal:inset-0 horizontal:h-full" aria-hidden>
          <AstroAnchor at="sky" className="absolute inset-x-[8vw] top-[8svh] h-[24svh] horizontal:inset-x-[10vw] horizontal:top-[7svh] horizontal:h-[23svh]" />
        </div>

        <div ref={track} className="relative z-10 -mt-[100svh] flex flex-col horizontal:mt-0 horizontal:h-full horizontal:w-max horizontal:flex-row">
          {products.map((product, i) => (
            <JourneyPanel key={product.slug} product={product} index={i} flat={!horizontal} />
          ))}
        </div>

        {/* HUD: el bloque del día, los siete rituales y la hora */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden transition-colors duration-700 horizontal:block ${
            dark ? "text-papel" : "text-profundo"
          }`}
        >
          <div className="mx-[6vw] flex items-center justify-between gap-8 border-t border-current/25 py-5">
            <p className="w-72 text-sm">
              <span className="font-medium">{blocks[current.block].label}:</span> {blocks[current.block].idea.toLowerCase()}
            </p>
            <ol className="pointer-events-auto flex items-center gap-1" aria-label="Rituales del día">
              {products.map((p, i) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Ir a ${p.name}`}
                    aria-current={i === active ? "step" : undefined}
                    className={`flex size-9 items-center justify-center rounded-full transition-[opacity,background-color] duration-500 ${
                      i === active ? "bg-current/12 opacity-100" : "opacity-45 hover:opacity-80"
                    }`}
                  >
                    <RitualGlyph slug={p.slug} className="size-5" />
                  </button>
                </li>
              ))}
            </ol>
            <p className="w-72 text-right text-sm">
              <span ref={clock} className="tabular-nums">
                {formatHour(products[0].hour)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneyPanel({ product, index, flat }: { product: Product; index: number; flat: boolean }) {
  const visual = useRef<HTMLDivElement>(null);
  const dark = isDarkLight(product.slug);

  return (
    <article
      data-panel
      data-surface={dark ? "dark" : "light"}
      aria-labelledby={`dia-${product.slug}`}
      // Sin movimiento no hay fondo que cambie con el scroll: cada panel lleva su luz.
      style={{ "--panel-light": `var(--color-${product.slug})` } as CSSProperties}
      className={`relative flex min-h-svh w-full shrink-0 flex-col justify-end px-6 pt-[36svh] pb-20 motion-reduce:min-h-0 motion-reduce:bg-[var(--panel-light)] motion-reduce:pt-24 horizontal:h-full horizontal:min-h-0 horizontal:w-screen horizontal:flex-row horizontal:items-end horizontal:justify-start horizontal:px-[6vw] horizontal:pt-0 horizontal:pb-[15svh] ${
        dark ? "text-papel" : "text-profundo"
      }`}
    >
      <div className="relative z-10 max-w-xl horizontal:w-[46vw] horizontal:max-w-[40rem]">
        <p data-reveal className="flex items-center gap-2.5 text-sm opacity-80">
          <RitualGlyph slug={product.slug} className="size-5" />
          <span className="tabular-nums">{hourLabel(product)}</span>
          <span aria-hidden>—</span>
          {product.when}
        </p>
        <h3 id={`dia-${product.slug}`} data-reveal className="mt-5 flex items-baseline gap-5">
          <span className="font-serif text-[clamp(3rem,5.6vw,5.4rem)] leading-none tabular-nums">{ritualNumber(product.id)}</span>
          <span className="ritual-name text-[clamp(1.35rem,2.4vw,2.3rem)]">{product.name}</span>
        </h3>
        <p data-reveal className="mt-3 opacity-80">
          [ {product.type} ]
        </p>
        <p data-reveal className="mt-6 font-serif text-[clamp(1.7rem,2.6vw,2.5rem)] leading-[1.08] italic">
          {product.phrase}
        </p>
        <p data-reveal className="mt-5 max-w-[46ch] leading-relaxed opacity-85">
          {product.concept}
        </p>
        <ul data-reveal className="mt-5 flex flex-wrap gap-2 text-sm" aria-label="Activos">
          {product.actives.map((id) => (
            <li key={id} className="rounded-full px-3 py-1 ring-1 ring-current/25">
              {getActive(id).name}
            </li>
          ))}
        </ul>
        <div data-reveal className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <AddToCartButton
            slug={product.slug}
            name={product.name}
            price={product.price}
            source={visual}
            variant="inline"
            openDrawer={false}
            light={dark}
          />
          <Link href={`/productos/${product.slug}`} data-cursor="Ver" className="underline-offset-4 hover:underline">
            Conocé {product.name}
          </Link>
        </div>
      </div>

      <div
        ref={visual}
        className="relative mx-auto mt-10 h-[40svh] w-[60vw] horizontal:absolute horizontal:right-[10vw] horizontal:bottom-[15svh] horizontal:mx-0 horizontal:mt-0 horizontal:h-[48svh] horizontal:w-[22vw]"
      >
        <BottleAnchor product={product} index={index} flat={flat} className="absolute inset-0" />
      </div>
    </article>
  );
}
