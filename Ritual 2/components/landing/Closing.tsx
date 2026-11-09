"use client";

import { useRef } from "react";
import { palette, light } from "@/lib/palette";
import { gsap, media, useGSAP } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { AstroAnchor } from "./Anchors";

/**
 * 23:30. Anochece: el papel pasa al café del eclipse y a la noche, y el
 * astro vuelve como luna. Desde acá, el footer.
 */
export function Closing() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = document.documentElement;
      const mm = gsap.matchMedia();
      mm.add(`${media.desktop}, ${media.mobile}`, () => {
        const dusk = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section.current, start: "top bottom", end: "top 15%", scrub: true },
        });
        dusk
          .fromTo(root, { "--page-bg": palette.papel }, { "--page-bg": light.eclipse, immediateRender: false }, 0)
          .to(root, { "--page-bg": palette.noche }, 0.6);
        gsap.fromTo(sceneState, { closing: 0 }, {
          closing: 1,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top 60%", end: "center center", scrub: true },
        });
        gsap.from("[data-closing-copy] > *", {
          autoAlpha: 0,
          y: 30,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top 40%", end: "top 5%", scrub: true },
        });
        return () => root.style.removeProperty("--page-bg");
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} data-scene-zone data-surface="dark" aria-labelledby="cierre" className="relative min-h-[115svh] overflow-hidden text-papel motion-reduce:bg-noche">
      <div data-closing-copy className="mx-auto flex max-w-[1440px] flex-col items-center px-6 pt-[22svh] text-center md:px-10">
        <p className="text-sm tabular-nums text-papel/75">23:30</p>
        <h2 id="cierre" className="mt-6 max-w-[14ch] font-serif text-display">
          Tu piel ya tiene su ritmo.
        </h2>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-papel/80">
          Elegí tus rituales, o contestá tres preguntas y armamos la rutina con vos.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/productos" variant="light" icon={<ArrowIcon width={18} />}>
            Elegí tus rituales
          </ButtonLink>
          <ButtonLink href="/ritual#test" variant="outline">
            ¿Por dónde empiezo?
          </ButtonLink>
        </div>
      </div>
      <AstroAnchor
        at="close"
        className="absolute bottom-[4svh] left-1/2 size-[24svh] -translate-x-1/2"
        fallback={<div className="size-full rounded-full bg-papel/90 shadow-[0_0_80px_10px_rgb(242_235_220/0.25)]" />}
      />
    </section>
  );
}
