"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useScroll, type MotionValue } from "motion/react";
import { navLinks } from "@/lib/site";
import { spring, transition } from "@/lib/motion";
import { useScrollState } from "@/hooks/useScrollState";
import { useSurfaceBehind } from "@/hooks/useSurfaceBehind";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Wordmark } from "@/components/brand/Logo";
import { ALEPH_PATH, MARK_SIZE } from "@/components/brand/logoPaths";
import { CartButton } from "./CartButton";
import { MenuToggle } from "./MenuToggle";
import { NowChip } from "./NowChip";
import { NavMenuOverlay, NavMenuPanel } from "./NavMenu";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Arriba de todo es una barra abierta: logo, links y el ritual de esta hora.
 * Al bajar se condensa en una píldora flotante (logo, menú, carrito) y el
 * marco del logo se va cerrando con el progreso de la página.
 */
export function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { scrolled, hidden } = useScrollState(64, 560);
  const surface = useSurfaceBehind(navRef);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll();

  // Cerrar el menú al navegar (ajuste de estado durante el render, sin efecto).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const dark = surface === "dark" && !open;
  const compact = (scrolled || isMobile) && !open;
  const floating = scrolled || open || isMobile;
  const indicatorFor = hovered ?? navLinks.find((l) => isActive(pathname, l.href))?.href;

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 md:px-5 md:pt-4"
      style={{ viewTransitionName: "site-nav" }}
    >
      <motion.nav
        ref={navRef}
        aria-label="Principal"
        data-surface={dark ? "dark" : "light"}
        initial={false}
        animate={{
          y: hidden && !open ? -120 : 0,
          maxWidth: open && !isMobile ? 1180 : compact ? 500 : 1440,
        }}
        transition={spring.soft}
        className={[
          "pointer-events-auto w-full overflow-hidden rounded-[1.6rem]",
          "transition-[background-color,color,box-shadow] duration-700 ease-out-expo",
          floating
            ? dark
              ? "bg-noche/55 text-papel ring-1 ring-papel/15 backdrop-blur-xl backdrop-saturate-150"
              : `${open ? "bg-papel" : "bg-papel/75"} text-profundo ring-1 ring-profundo/10 backdrop-blur-xl backdrop-saturate-150`
            : dark
              ? "text-papel"
              : "text-profundo",
          floating ? "shadow-[0_18px_50px_-26px_rgb(36_27_21/0.55)]" : "",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-4 py-2 pr-2 pl-3.5">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-md py-1" aria-label="7RITUAL, inicio">
            <ProgressMark progress={scrollYProgress} />
            <Wordmark className="h-[0.74rem] w-auto" title="" />
          </Link>

          <AnimatePresence initial={false}>
            {!compact && !open && (
              <motion.div
                key="links"
                className="hidden md:block"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0, transition: transition.enter }}
                exit={{ opacity: 0, y: -8, transition: transition.exit }}
              >
                <LayoutGroup id="nav-links">
                  <ul
                    className={`flex items-center rounded-full p-1 ring-1 backdrop-blur-xl transition-colors duration-700 ${
                      dark ? "bg-noche/40 ring-papel/12" : "bg-papel/60 ring-profundo/8"
                    }`}
                    onPointerLeave={() => setHovered(null)}
                  >
                    {navLinks.map((link) => {
                      const active = isActive(pathname, link.href);
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            aria-current={active ? "page" : undefined}
                            onPointerEnter={() => setHovered(link.href)}
                            onFocus={() => setHovered(link.href)}
                            onBlur={() => setHovered(null)}
                            className="relative block rounded-full px-4 py-2 text-[0.92rem]"
                          >
                            {indicatorFor === link.href && (
                              <motion.span
                                layoutId="nav-indicator"
                                className={`absolute inset-0 rounded-full ${dark ? "bg-papel/14" : "bg-profundo/8"}`}
                                transition={spring.soft}
                              />
                            )}
                            <span className="relative">{link.label}</span>
                            {active && (
                              <motion.span
                                layoutId="nav-dot"
                                className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-cafe"
                                transition={spring.soft}
                              />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </LayoutGroup>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-1">
            {!compact && !open && (
              <div className="hidden xl:block">
                <NowChip dark={dark} />
              </div>
            )}
            <MenuToggle ref={toggleRef} open={open} onToggle={() => setOpen((o) => !o)} dark={dark} />
            <CartButton dark={dark} />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && !isMobile && (
            <motion.div
              key="panel"
              id="site-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1, transition: { ...spring.soft, opacity: transition.enter } }}
              exit={{ height: 0, opacity: 0, transition: transition.exit }}
            >
              <NavMenuPanel pathname={pathname} onNavigate={() => setOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {open && isMobile && <NavMenuOverlay key="mobile" pathname={pathname} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}

/**
 * El isotipo del navbar: la álef siempre, y el marco que se dibuja a medida
 * que se recorre la página (completo, al llegar a la noche del footer).
 */
function ProgressMark({ progress }: { progress: MotionValue<number> }) {
  const s = 18;
  return (
    <svg viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`} className="size-7 shrink-0" aria-hidden>
      <rect x={s / 2} y={s / 2} width={MARK_SIZE - s} height={MARK_SIZE - s} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth={s} />
      <motion.rect
        x={s / 2}
        y={s / 2}
        width={MARK_SIZE - s}
        height={MARK_SIZE - s}
        fill="none"
        stroke="currentColor"
        strokeWidth={s}
        style={{ pathLength: progress }}
      />
      <path d={ALEPH_PATH} fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth={9} strokeLinejoin="round" />
    </svg>
  );
}
