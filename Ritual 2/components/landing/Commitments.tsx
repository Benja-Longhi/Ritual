"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { commitments, freeFrom, type CommitmentId } from "@/data/commitments";
import { getActive, starActives } from "@/data/actives";
import { products, productsWithActive } from "@/data/products";
import { gsap, media, useGSAP } from "@/lib/gsap";
import { RitualGlyph } from "@/components/brand/RitualGlyph";

const looks: Record<CommitmentId, { bg: string; dark: boolean }> = {
  consciencia: { bg: "var(--color-aura)", dark: false },
  experiencia: { bg: "var(--color-pino)", dark: true },
  eficacia: { bg: "var(--color-prisma)", dark: false },
};

/**
 * Los tres compromisos como ventanas del marco del logo: cada una arranca
 * como un cuadrado en el centro y, al bajar, se abre hasta ocupar todo.
 * Adentro de la que se abrió aparece la siguiente.
 */
export function Commitments() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(media.desktop, () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-window]");
        const side = () => Math.min(window.innerWidth, window.innerHeight) * 0.36;
        const win = { "--ix": () => `${(window.innerWidth - side()) / 2}px`, "--iy": () => `${(window.innerHeight - side()) / 2}px` };
        const shut = { "--ix": () => `${window.innerWidth / 2}px`, "--iy": () => `${window.innerHeight / 2}px` };
        const open = { "--ix": "0px", "--iy": "0px" };

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: section.current,
            pin: pin.current,
            start: "top top",
            end: () => `+=${window.innerHeight * 4.2}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        layers.forEach((layer, i) => {
          const at = 0.2 + i * 1.45;
          // La siguiente ventana se abre como un cuadrado chico en el centro…
          if (i > 0) tl.fromTo(layer, shut, { ...win, duration: 0.35 }, at - 0.4);
          else tl.set(layer, win, 0);
          // …y después se abre hasta ocupar toda la pantalla.
          tl.to(layer, { ...open, duration: 1 }, at);
          // Adentro ya no hace falta el rótulo de la ventana: pasa a ser el título.
          tl.to(layer.querySelector("[data-window-name]"), { autoAlpha: 0, scale: 0.94, duration: 0.35 }, at + 0.45);
          tl.from(layer.querySelectorAll("[data-reveal]"), { autoAlpha: 0, y: 30, stagger: 0.08, duration: 0.45 }, at + 0.6);
          const strikes = layer.querySelectorAll("[data-strike]");
          if (strikes.length) tl.fromTo(strikes, { scaleX: 0 }, { scaleX: 1, stagger: 0.08, duration: 0.35 }, at + 0.85);
        });
        tl.set({}, {}, 0.2 + layers.length * 1.45 + 0.2);
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="compromiso" className="relative">
      <h2 id="compromiso" className="sr-only">
        Nuestro compromiso
      </h2>
      <div ref={pin} className="relative horizontal:h-svh horizontal:overflow-hidden">
        {commitments.map((c, i) => (
          <Window key={c.id} id={c.id} index={i} name={c.name} title={c.title} text={c.text}>
            {c.id === "consciencia" && <FreeFrom />}
            {c.id === "experiencia" && <Breath />}
            {c.id === "eficacia" && <Actives />}
          </Window>
        ))}
      </div>
    </section>
  );
}

type WindowProps = {
  id: CommitmentId;
  index: number;
  name: string;
  title: string;
  text: string;
  children: ReactNode;
};

function Window({ id, index, name, title, text, children }: WindowProps) {
  const { bg, dark } = looks[id];
  const closed = index === 0 ? "[--ix:calc(50vw-18vmin)] [--iy:calc(50svh-18vmin)]" : "[--ix:50vw] [--iy:50svh]";
  return (
    <div
      data-window
      data-surface={dark ? "dark" : "light"}
      className={`relative min-h-svh px-6 py-24 horizontal:absolute horizontal:inset-0 horizontal:min-h-0 horizontal:p-0 horizontal:[clip-path:inset(var(--iy)_var(--ix))] ${closed} ${
        dark ? "text-papel" : "text-profundo"
      }`}
      style={{ background: bg, zIndex: index } as CSSProperties}
    >
      {/* El borde de la ventana: el marco del logo */}
      <span
        aria-hidden
        className="pointer-events-none absolute hidden border-[1.5px] border-current/70 horizontal:block"
        style={{ top: "var(--iy)", bottom: "var(--iy)", left: "var(--ix)", right: "var(--ix)" }}
      />
      {/* Lo que se ve por la ventana chica: el nombre del compromiso */}
      <div data-window-name className="flex flex-col items-center text-center horizontal:absolute horizontal:inset-0 horizontal:justify-center">
        <p className="font-serif text-[clamp(2.8rem,3.9vw,4.2rem)] leading-none italic">{name}</p>
        <p className="mt-3 text-[0.95rem]">{title}</p>
      </div>
      <div data-reveal className="mx-auto mt-10 max-w-md horizontal:absolute horizontal:top-[16svh] horizontal:left-[6vw] horizontal:mt-0 horizontal:max-w-[27rem]">
        <h3 className="hidden horizontal:block">
          <span className="block font-serif text-headline italic">{name}</span>
          <span className="mt-3 block text-[0.95rem]">{title}</span>
        </h3>
        <p className="text-lg leading-relaxed horizontal:mt-8">{text}</p>
      </div>
      <div data-reveal className="mx-auto mt-12 max-w-xl horizontal:absolute horizontal:right-[6vw] horizontal:bottom-[11svh] horizontal:mt-0 horizontal:w-[36vw] horizontal:max-w-none">
        {children}
      </div>
    </div>
  );
}

/** Consciencia: lo que ninguna fórmula lleva, tachado. */
function FreeFrom() {
  return (
    <div>
      <p className="mb-4 text-sm opacity-75">Sin:</p>
      <ul className="space-y-1">
        {freeFrom.map((item) => (
          <li key={item} className="relative w-fit font-serif text-[clamp(1.6rem,2.3vw,2.3rem)] leading-tight">
            {item}
            <span data-strike aria-hidden className="absolute top-[55%] -right-2 -left-2 h-[1.5px] origin-left bg-current" />
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm opacity-80">Cruelty-free y vegana, siempre.</p>
    </div>
  );
}

/** Experiencia: una respiración guiada (4 s y 4 s) y el estado que busca cada ritual. */
function Breath() {
  return (
    <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
      <div className="relative flex size-44 shrink-0 items-center justify-center" aria-hidden>
        <span className="absolute inset-0 rounded-full ring-1 ring-current/40" />
        <span className="absolute inset-[12%] animate-[breathe_8s_var(--ease-breath)_infinite] rounded-full bg-current/15 motion-reduce:animate-none" />
        <span className="relative text-sm">
          <span className="block animate-[breathe-in_8s_steps(1)_infinite] motion-reduce:animate-none">Inhalá</span>
          <span className="absolute inset-0 animate-[breathe-out_8s_steps(1)_infinite] motion-reduce:hidden">Exhalá</span>
        </span>
      </div>
      <ul className="space-y-1.5 text-sm">
        {products.map((p) => (
          <li key={p.slug} className="flex items-center gap-2.5 whitespace-nowrap">
            <RitualGlyph slug={p.slug} className="size-4" />
            <span className="w-20">{p.aroma.mood}</span>
            <span className="opacity-75">{p.aroma.notes.join(" y ").toLowerCase()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Eficacia: los activos, cada uno en una frase y con los rituales que lo llevan. */
function Actives() {
  return (
    <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {starActives.map((id) => {
        const active = getActive(id);
        return (
          <li key={id}>
            <p className="font-serif text-2xl leading-tight">{active.name}</p>
            <p className="mt-1 text-sm leading-snug opacity-80">{active.what}</p>
            <p className="mt-1.5 flex gap-3 text-[0.68rem]">
              {productsWithActive(id).map((p) => (
                <span key={p.slug} className="ritual-name">
                  {p.name}
                </span>
              ))}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
