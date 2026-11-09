"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { products, ritualNumber } from "@/data/products";
import { navLinks, site } from "@/lib/site";
import { duration, ease, distance, stagger, transition } from "@/lib/motion";
import { useNow } from "@/hooks/useNow";
import { formatClock, hourOf, ritualAt } from "@/lib/ritualTime";
import { lockScroll } from "@/components/providers/SmoothScroll";
import { RitualGlyph } from "@/components/brand/RitualGlyph";
import { MomentIcon } from "@/components/brand/MomentIcon";
import { ArrowIcon } from "@/components/ui/icons";

const menuLinks = [{ href: "/", label: "Inicio" }, ...navLinks];

const item = {
  hidden: { opacity: 0, y: distance.sm },
  show: { opacity: 1, y: 0, transition: transition.enter },
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Panel que se despliega desde la propia píldora del navbar (desktop). */
export function NavMenuPanel({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    firstLink.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      className="grid grid-cols-[1fr_1.15fr_0.9fr] gap-10 border-t border-current/10 px-7 pt-7 pb-8"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: stagger.base, delayChildren: 0.06 } } }}
    >
      <motion.nav variants={item} aria-label="Secciones">
        <p className="mb-4 text-sm opacity-70">Secciones</p>
        <ul>
          {menuLinks.map((link, i) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  ref={i === 0 ? firstLink : undefined}
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-0.5 transition-colors hover:bg-current/5"
                >
                  <span className={`font-serif text-[2.7rem] leading-[1.05] ${active ? "italic" : ""}`}>{link.label}</span>
                  <ArrowIcon
                    width={18}
                    className="-translate-x-2 opacity-0 transition-[opacity,translate] duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.nav>

      <motion.nav variants={item} aria-label="Los siete rituales">
        <p className="mb-4 text-sm opacity-70">Los siete rituales, del alba a la noche</p>
        <ul className="space-y-0.5">
          {products.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/productos/${p.slug}`}
                onClick={onNavigate}
                className="group -mx-2 grid grid-cols-[1.75rem_2rem_1fr] items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-current/5"
              >
                <RitualGlyph slug={p.slug} className="size-6 transition-transform duration-700 ease-out-expo group-hover:scale-110" />
                <span className="text-sm tabular-nums opacity-60">{ritualNumber(p.id)}</span>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="ritual-name text-[0.82rem]">{p.name}</span>
                  <span className="text-sm opacity-70">{p.type}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.nav>

      <motion.div variants={item} className="flex flex-col">
        <p className="mb-4 text-sm opacity-70">Ahora</p>
        <NowCard onNavigate={onNavigate} />
        <div className="mt-auto pt-6 text-sm">
          <a href={`mailto:${site.email}`} className="block underline-offset-4 hover:underline">
            {site.email}
          </a>
          <p className="mt-1 opacity-75">{site.hours}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Lo que toca ahora, en grande: el momento del día y su ritual. */
function NowCard({ onNavigate }: { onNavigate: () => void }) {
  const now = useNow();
  if (!now) return <div className="h-44 rounded-[3px] bg-current/5" />;
  const { product, label, hint, icon } = ritualAt(hourOf(now));
  return (
    <Link
      href={`/productos/${product.slug}`}
      onClick={onNavigate}
      className="group block rounded-[3px] p-5 ring-1 ring-current/12 transition-colors hover:bg-current/5"
    >
      <span className="flex items-center gap-2 text-sm">
        <MomentIcon moment={icon} />
        <span className="tabular-nums opacity-70">{formatClock(now)}</span>
        <span className="opacity-70">· {label}</span>
      </span>
      <span className="mt-4 flex items-center gap-3">
        <RitualGlyph slug={product.slug} className="size-10" />
        <span className="ritual-name text-lg">{product.name}</span>
      </span>
      <span className="mt-3 block text-sm opacity-75">{hint}</span>
    </Link>
  );
}

// El overlay nace desde el botón de menú, como la luz que se abre.
const origin = "calc(100% - 4.75rem) 2.6rem";

/** Menú a pantalla completa (mobile). */
export function NavMenuOverlay({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    lockScroll(true);
    firstLink.current?.focus({ preventScroll: true });
    return () => lockScroll(false);
  }, []);

  return (
    <motion.div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      data-surface="dark"
      data-lenis-prevent
      className="pointer-events-auto fixed inset-0 -z-10 flex flex-col overflow-y-auto bg-noche px-6 pt-28 pb-10 text-papel"
      initial={{ clipPath: `circle(0% at ${origin})` }}
      animate={{ clipPath: `circle(150% at ${origin})`, transition: { duration: duration.slower, ease: ease.out } }}
      exit={{ clipPath: `circle(0% at ${origin})`, transition: { duration: duration.base, ease: ease.inOut } }}
    >
      <motion.ul
        className="flex flex-col"
        initial="hidden"
        animate="show"
        exit="hidden"
        variants={{
          show: { transition: { staggerChildren: stagger.base, delayChildren: 0.18 } },
          hidden: { transition: { staggerChildren: stagger.tight, staggerDirection: -1 } },
        }}
      >
        {menuLinks.map((link, i) => {
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href} className="overflow-hidden">
              <motion.div
                variants={{
                  hidden: { y: "110%", transition: { duration: duration.fast, ease: ease.inOut } },
                  show: { y: "0%", transition: { duration: duration.slow, ease: ease.out } },
                }}
              >
                <Link
                  ref={i === 0 ? firstLink : undefined}
                  href={link.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`block py-0.5 font-serif text-[3.5rem] leading-[1.02] ${active ? "italic" : ""}`}
                >
                  {link.label}
                </Link>
              </motion.div>
            </li>
          );
        })}
      </motion.ul>

      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { ...transition.enter, delay: 0.45 } }}
        exit={{ opacity: 0, transition: { duration: duration.instant } }}
      >
        <p className="mb-3 text-sm opacity-70">Los siete rituales</p>
        <ul className="flex flex-wrap gap-2">
          {products.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/productos/${p.slug}`}
                onClick={onClose}
                className="flex items-center gap-2 rounded-full bg-papel/8 py-2 pr-3.5 pl-2.5"
              >
                <RitualGlyph slug={p.slug} className="size-5" />
                <span className="ritual-name text-[0.72rem]">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <NowCard onNavigate={onClose} />
        </div>
        <p className="mt-8 text-sm text-papel/80">
          <a href={`mailto:${site.email}`} className="text-papel">
            {site.email}
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
