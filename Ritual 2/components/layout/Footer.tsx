"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { useNow } from "@/hooks/useNow";
import { products } from "@/data/products";
import { site } from "@/lib/site";
import { formatClock, hourOf, ritualAt } from "@/lib/ritualTime";
import { getLenis } from "@/components/providers/SmoothScroll";
import { MomentIcon } from "@/components/brand/MomentIcon";
import { RitualGlyph } from "@/components/brand/RitualGlyph";
import { NewsletterForm } from "./NewsletterForm";
import { FooterWordmark } from "./FooterWordmark";

const columns = [
  {
    title: "El método",
    links: [
      { href: "/ritual#siete", label: "El manifiesto del 7" },
      { href: "/ritual#ritmo", label: "Armá tu rutina" },
      { href: "/ritual#test", label: "¿Por dónde empiezo?" },
      { href: "/ritual#preguntas", label: "Preguntas frecuentes" },
    ],
  },
  {
    title: "7RITUAL",
    links: [
      { href: "/nosotros", label: "Nosotros" },
      { href: "/contacto", label: "Contacto" },
      { href: "/carrito", label: "Tu carrito" },
    ],
  },
];

/**
 * "Buenas noches": el sitio termina como termina el día. El footer queda
 * debajo de la página y el contenido se levanta para descubrirlo.
 * Si no entra en la pantalla (mobile chico) se muestra normal.
 */
export function Footer({ year }: { year: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [height, setHeight] = useState(0);
  const [reveal, setReveal] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const measure = () => {
      const h = footer.offsetHeight;
      setHeight(h);
      setReveal(h <= window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(footer);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  const shade = useTransform(scrollYProgress, [0, 1], [0.7, 0]);

  return (
    <div ref={wrapperRef} className="relative" style={reveal ? { height, clipPath: "inset(0 0 0 0)" } : undefined}>
      <footer
        ref={footerRef}
        data-surface="dark"
        className={`${reveal ? "fixed bottom-0" : "relative"} w-full bg-noche text-papel`}
      >
        <motion.div style={reveal && !reduced ? { y } : undefined} className="relative">
          <div className="mx-auto grid max-w-[1440px] gap-14 px-6 pt-20 md:px-10 md:pt-24 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="mb-6 flex items-center gap-2 text-sm text-papel/70">
                <MomentIcon moment="moon" width={15} height={15} />
                Buenas noches
              </p>
              <h2 className="max-w-xl font-serif text-headline">Mañana, otra vez, el alba.</h2>
              <div className="mt-10">
                <NewsletterForm />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-[1.3fr_1fr_1fr]">
              <nav aria-label="Los siete rituales" className="col-span-2 sm:col-span-1">
                <p className="mb-4 text-sm text-papel/60">Los siete rituales</p>
                <ul className="space-y-1">
                  {products.map((p) => (
                    <li key={p.slug}>
                      <FooterLink href={`/productos/${p.slug}`}>
                        <RitualGlyph slug={p.slug} className="mr-2 inline size-4 align-[-0.15em] opacity-70" />
                        <span className="ritual-name text-[0.76rem]">{p.name}</span>
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </nav>
              {columns.map((col) => (
                <nav key={col.title} aria-label={col.title}>
                  <p className="mb-4 text-sm text-papel/60">{col.title}</p>
                  <ul className="space-y-2">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <FooterLink href={l.href}>{l.label}</FooterLink>
                      </li>
                    ))}
                  </ul>
                  {col.title === "7RITUAL" && (
                    <ul className="mt-6 space-y-2">
                      {site.social.map((s) => (
                        <li key={s.label}>
                          <FooterLink href={s.href} external>
                            {s.label}
                          </FooterLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </nav>
              ))}
            </div>
          </div>

          <NightClock />

          <div className="mt-6 px-4 md:px-8">
            <FooterWordmark progress={scrollYProgress} still={reduced || !reveal} />
          </div>

          <div className="mx-auto mt-6 flex max-w-[1440px] flex-col gap-2 border-t border-papel/10 px-6 py-5 text-xs text-papel/70 sm:flex-row sm:justify-between md:px-10">
            <p>
              © {year} {site.name}. {site.tagline}.
            </p>
            <p>Clean beauty y vegana, sin testeo en animales. Hecho en Argentina.</p>
          </div>
        </motion.div>

        {/* La página se "levanta": una sombra que se disipa a medida que se descubre */}
        {reveal && !reduced && (
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-noche" style={{ opacity: shade }} />
        )}
      </footer>
    </div>
  );
}

function FooterLink({ href, external, children }: { href: string; external?: boolean; children: ReactNode }) {
  const className = "group relative inline-block text-[0.95rem]";
  const line = (
    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-prisma transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
      {line}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
      {line}
    </Link>
  );
}

/** El reloj del footer: qué ritual acompaña este momento, y la vuelta al alba. */
function NightClock() {
  const now = useNow();
  const ritual = now ? ritualAt(hourOf(now)) : null;

  return (
    <div className="mx-auto mt-12 flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 md:px-10">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-papel/80">
        {ritual && now ? (
          <>
            <span className="flex items-center gap-2 text-papel">
              <MomentIcon moment={ritual.icon} width={15} height={15} />
              Ahora, <span className="tabular-nums">{formatClock(now)}</span>
            </span>
            <span>
              {ritual.label}: {ritual.hint}
            </span>
          </>
        ) : (
          <span>Siete rituales, del alba a la noche.</span>
        )}
      </p>
      <button
        type="button"
        onClick={() => {
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(0, { duration: 2.4 });
          else window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="group flex items-center gap-3 rounded-[3px] px-4 py-2.5 text-sm ring-1 ring-inset ring-papel/25 transition-colors hover:bg-papel/8"
      >
        Volver al alba
        <span className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5" aria-hidden>
          ↑
        </span>
      </button>
    </div>
  );
}
