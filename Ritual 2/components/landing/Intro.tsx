"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { useAnimate } from "motion/react";
import { ease } from "@/lib/motion";
import { palette } from "@/lib/palette";
import { INTRO_KEY } from "@/lib/storageKeys";
import { useIntro } from "@/store/intro";
import { lockScroll } from "@/components/providers/SmoothScroll";
import { ALEPH_GUIDES, ALEPH_PATH, MARK_SIZE, WORDMARK } from "@/components/brand/logoPaths";

const subscribe = () => () => {};
const readSeen = () => {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return true;
  }
};

/** Marca la intro como terminada: el titular del hero se revela (CSS). */
function markDone() {
  document.documentElement.dataset.introDone = "1";
}

/**
 * Intro "Portal del alba": de noche se dibuja el horizonte, de él sube el
 * marco del logo, la álef se traza adentro y "7RITUAL" aparece debajo.
 * Amanece, y el marco viaja hasta su lugar en el hero: es la ventana por la
 * que sale el sol. Solo la primera visita de la sesión; se puede saltear.
 */
export function Intro() {
  // En la hidratación se asume "no vista"; un script en el <head> ya la
  // ocultó por CSS si correspondía, así que no hay parpadeo.
  const seen = useSyncExternalStore(subscribe, readSeen, () => false);
  const done = useIntro((s) => s.done);
  const finish = useIntro((s) => s.finish);

  useEffect(() => {
    if (seen) {
      markDone();
      finish();
    }
  }, [seen, finish]);

  if (seen || done) return null;
  return <IntroOverlay onDone={finish} />;
}

// Proporciones del logo original (ver LogoLockup).
const W = WORDMARK.width;
const FRAME = W * 0.587;
const GAP = W * 0.107;
const H = FRAME + GAP + WORDMARK.height;
const FX = (W - FRAME) / 2;
const MID = FX + FRAME / 2;
const markTransform = `translate(${FX} 0) scale(${FRAME / MARK_SIZE})`;

/** Los tiempos del primer tramo (CSS), en segundos. */
const t = {
  horizon: { d: 0.05, t: 0.4 },
  frame: { d: 0.25, t: 0.55 },
  aleph: [
    { d: 0.55, t: 0.35 },
    { d: 0.78, t: 0.3 },
    { d: 0.82, t: 0.35 },
  ],
  letters: 0.72,
  /** Cuando termina el dibujo y empieza a amanecer. */
  dawn: 1.3,
};

function IntroOverlay({ onDone }: { onDone: () => void }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const skipped = useRef(false);

  useEffect(() => {
    lockScroll(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let gliding = false;

    const end = () => {
      if (cancelled) return;
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      lockScroll(false);
      onDone();
    };

    /** Amanece: la noche se va y la tinta pasa de papel a profundo. */
    function dawn(d: number) {
      animate("[data-night]", { opacity: 0 }, { duration: d, ease: ease.inOut });
      animate("[data-glow]", { y: ["30%", "-8%"], opacity: [0, 1] }, { duration: d * 1.4, ease: ease.out });
      animate(scope.current, { color: palette.profundo }, { duration: d, ease: ease.inOut });
    }

    /** El marco viaja hasta su lugar en el hero; el resto se apaga. */
    async function glide(d: number) {
      if (gliding) return;
      gliding = true;
      markDone();
      const from = scope.current.querySelector("[data-intro-frame]")?.getBoundingClientRect();
      const to = document.querySelector("[data-hero-frame]")?.getBoundingClientRect();
      const box = scope.current.querySelector<HTMLElement>("[data-frame-box]");
      animate("[data-fade]", { opacity: 0 }, { duration: d * 0.5, ease: ease.inOut });
      if (from && to && box && to.width > 0) {
        Object.assign(box.style, {
          left: `${from.left}px`,
          top: `${from.top}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
          opacity: "1",
        });
        scope.current.querySelector<SVGElement>("[data-intro-frame]")?.style.setProperty("opacity", "0");
        await animate(
          box,
          { left: to.left, top: to.top, width: to.width, height: to.height },
          { duration: d, ease: ease.out },
        );
      } else {
        await animate(scope.current, { opacity: 0 }, { duration: d * 0.6 });
      }
      end();
    }

    async function run() {
      if (reduced) {
        await new Promise((r) => setTimeout(r, 600));
        markDone();
        await animate(scope.current, { opacity: 0 }, { duration: 0.4 });
        return end();
      }
      // El dibujo arrancó por CSS en el primer pintado: esperamos lo que falte.
      const wait = Math.max(150, t.dawn * 1000 - performance.now());
      await new Promise((r) => setTimeout(r, wait));
      if (cancelled || skipped.current) return;
      dawn(0.55);
      await new Promise((r) => setTimeout(r, 480));
      if (cancelled || skipped.current) return;
      await glide(0.62);
    }

    const skip = () => {
      if (skipped.current || gliding) return;
      skipped.current = true;
      dawn(0.3);
      void glide(0.45);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
    };

    window.addEventListener("keydown", onKey);
    const node = scope.current;
    node?.addEventListener("click", skip);
    void run();

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      node?.removeEventListener("click", skip);
      lockScroll(false);
    };
  }, [animate, scope, onDone]);

  return (
    <div
      ref={scope}
      data-intro
      className="fixed inset-0 z-[120] cursor-pointer overflow-hidden bg-papel"
      style={{ color: palette.papel }}
    >
      {/* El alba: un resplandor que sube desde el horizonte, detrás de la noche */}
      <div
        data-glow
        aria-hidden
        className="absolute inset-x-0 top-[22%] h-[80svh] opacity-0"
        style={{ background: "radial-gradient(ellipse 45% 38% at 50% 50%, var(--color-prisma), transparent 70%)" }}
      />
      <div data-night aria-hidden className="absolute inset-0 bg-noche" />

      <div className="relative flex h-svh flex-col items-center justify-center px-8">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-[min(72vw,26rem)] overflow-visible" aria-hidden>
          <defs>
            <mask id="intro-aleph" maskUnits="userSpaceOnUse" x="0" y="0" width={MARK_SIZE} height={MARK_SIZE}>
              <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
                {ALEPH_GUIDES.map((g, i) => (
                  <path
                    key={i}
                    d={g.d}
                    strokeWidth={g.width}
                    pathLength={1}
                    className="intro-draw"
                    style={{ "--d": `${t.aleph[i].d}s`, "--t": `${t.aleph[i].t}s` } as CSSProperties}
                  />
                ))}
              </g>
            </mask>
          </defs>

          {/* El horizonte: de él sube todo */}
          <path
            data-fade
            d={`M${-W * 0.55} ${FRAME} H${W * 1.55}`}
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            className="intro-draw"
            style={{ "--d": `${t.horizon.d}s`, "--t": `${t.horizon.t}s` } as CSSProperties}
          />

          {/* El marco: dos mitades que suben desde el centro del horizonte */}
          <g data-intro-frame fill="none" stroke="currentColor" strokeWidth="1.5">
            {[
              `M${MID} ${FRAME} H${FX} V0 H${MID}`,
              `M${MID} ${FRAME} H${FX + FRAME} V0 H${MID}`,
            ].map((d) => (
              <path
                key={d}
                d={d}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                className="intro-draw"
                style={{ "--d": `${t.frame.d}s`, "--t": `${t.frame.t}s` } as CSSProperties}
              />
            ))}
          </g>

          <g data-fade transform={markTransform}>
            <path d={ALEPH_PATH} fill="currentColor" fillRule="evenodd" mask="url(#intro-aleph)" />
          </g>

          <g data-fade transform={`translate(0 ${FRAME + GAP})`} fill="currentColor">
            {WORDMARK.letters.map((d, i) => (
              <path
                key={i}
                d={d}
                fillRule="evenodd"
                className="intro-letter"
                style={{ "--d": `${t.letters + i * 0.05}s`, transformBox: "fill-box" } as CSSProperties}
              />
            ))}
          </g>
        </svg>

        <p data-fade className="intro-fade mt-10 font-serif text-xl italic opacity-80" style={{ "--d": "1s" } as CSSProperties}>
          La belleza a tu propio ritmo
        </p>
      </div>

      {/* El marco que viaja al hero (HTML: se puede animar hasta un rect del DOM) */}
      <div data-frame-box aria-hidden className="pointer-events-none fixed border-[1.5px] border-current opacity-0" />

      <button
        type="button"
        data-fade
        className="absolute right-6 bottom-6 rounded-[3px] px-4 py-2 text-sm opacity-70 ring-1 ring-current/25 transition-opacity hover:opacity-100"
      >
        Saltar intro
      </button>
      <span className="sr-only">Presentación de 7RITUAL. Tocá cualquier parte o presioná Escape para saltarla.</span>
    </div>
  );
}
