"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { momentLabel } from "@/data/products";
import { weekdays } from "@/data/seven";
import {
  buildRoutine,
  genesisStartNights,
  intensityLabel,
  routineMinutes,
  routineProducts,
  scopeLabel,
  type Intensity,
  type RoutineScope,
} from "@/data/routines";
import { useCart } from "@/store/cart";
import { flyToCart } from "@/lib/flyToCart";
import { formatPrice } from "@/lib/format";
import { ritualDiscountFor } from "@/lib/pricing";
import { spring, transition } from "@/lib/motion";
import { Packshot } from "@/components/brand/Packshot";
import { MomentIcon } from "@/components/brand/MomentIcon";
import { buttonClasses } from "@/components/ui/Button";

const scopes: RoutineScope[] = ["am", "pm", "dia"];
const intensities: Intensity[] = ["esencial", "completo"];

/**
 * "A tu propio ritmo": la estructura modular del documento de marca. Elegís
 * cuándo y cuánto tiempo, y la rutina se arma en el orden de aplicación.
 * Las tarjetas se reacomodan (no aparecen de golpe): se ve qué se suma.
 */
export function RhythmBuilder({ id = "ritmo", heading }: { id?: string; heading?: ReactNode }) {
  const [scope, setScope] = useState<RoutineScope>("am");
  const [intensity, setIntensity] = useState<Intensity>("esencial");
  const thumbs = useRef(new Map<string, HTMLElement>());
  const addMany = useCart((s) => s.addMany);
  const openDrawer = useCart((s) => s.openDrawer);
  const [phase, setPhase] = useState<"idle" | "adding" | "done">("idle");

  const routines = buildRoutine(scope, intensity);
  const products = routineProducts(routines);
  const minutes = routineMinutes(routines);
  const subtotal = products.reduce((sum, p) => sum + p.price, 0);
  const all = products.length === 7;
  const total = all ? subtotal - ritualDiscountFor(subtotal) : subtotal;
  const withGenesis = products.some((p) => p.slug === "genesis");

  async function addRoutine() {
    if (phase !== "idle") return;
    setPhase("adding");
    await Promise.all(
      products.map(
        (p, i) =>
          new Promise<void>((resolve) => setTimeout(() => void flyToCart(thumbs.current.get(p.slug) ?? null).then(resolve), i * 110)),
      ),
    );
    addMany(products.map((p) => p.slug));
    setPhase("done");
    setTimeout(openDrawer, 300);
    setTimeout(() => setPhase("idle"), 2200);
  }

  return (
    <section id={id} aria-labelledby={`${id}-titulo`} data-surface="light" className="relative scroll-mt-24 px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <h2 id={`${id}-titulo`} className="font-serif text-headline">
            {heading ?? "A tu propio ritmo."}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-profundo/80">
            De lo esencial a los siete pasos. Elegí cuándo y cuánto tiempo: el orden lo ponemos nosotros, de la textura
            más liviana a la más rica.
          </p>

          <div className="mt-10 space-y-5">
            <Segmented label="Cuándo" value={scope} options={scopes} onChange={setScope} render={(s) => scopeLabel[s]} />
            <Segmented
              label="Cuánto"
              value={intensity}
              options={intensities}
              onChange={setIntensity}
              render={(i) => intensityLabel[i].label}
            />
            <p className="text-sm text-profundo/70">{intensityLabel[intensity].hint}</p>
          </div>

          <dl className="mt-10 grid grid-cols-3 border-y border-profundo/15 py-5 text-sm">
            <Stat label="Rituales" value={String(products.length)} />
            <Stat label="Por día" value={`${minutes} min`} />
            <Stat label="Total" value={formatPrice(total)} note={all ? "15% off" : undefined} />
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="button" onClick={addRoutine} className={buttonClasses("solid")} aria-live="polite">
              <span className="relative block overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={phase}
                    className="block"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1, transition: transition.enter }}
                    exit={{ y: "-100%", opacity: 0, transition: transition.exit }}
                  >
                    {phase === "idle" ? "Agregar esta rutina" : phase === "adding" ? "Agregando…" : "En tu carrito"}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
            <Link href="/ritual#test" className="text-sm underline-offset-4 hover:underline">
              ¿No sabés por dónde empezar? Hacé el test
            </Link>
          </div>
        </div>

        <div>
          <LayoutGroup id={`${id}-routine`}>
            {routines.map((routine) => (
              <motion.div key={routine.moment} layout transition={spring.soft} className="mb-10 last:mb-0">
                <p className="mb-4 flex items-center gap-2 text-sm text-profundo/75">
                  <MomentIcon moment={routine.moment} width={16} height={16} />
                  {momentLabel[routine.moment]}
                </p>
                <motion.ol layout className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {routine.products.map((p, i) => (
                      <motion.li
                        key={`${routine.moment}-${p.slug}`}
                        layout
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0, transition: { ...spring.soft, delay: i * 0.04 } }}
                        exit={{ opacity: 0, scale: 0.92, transition: transition.exit }}
                        transition={spring.soft}
                      >
                        <Link href={`/productos/${p.slug}`} data-cursor="Ver" className="group block">
                          <div
                            ref={(el) => {
                              if (el) thumbs.current.set(p.slug, el);
                            }}
                            className="relative aspect-square overflow-hidden rounded-[3px] ring-1 ring-inset ring-profundo/10"
                            style={{ background: `color-mix(in oklab, var(--color-${p.slug}) 78%, var(--color-papel))` }}
                          >
                            <span className={`absolute top-2.5 left-3 text-sm tabular-nums ${p.id >= 5 ? "text-papel" : ""}`}>
                              {i + 1}
                            </span>
                            <Packshot product={p} className="absolute inset-[10%_16%_4%] transition-transform duration-700 ease-out-expo group-hover:scale-105" bare />
                          </div>
                          <p className="ritual-name mt-3 text-[0.78rem]">{p.name}</p>
                          <p className="mt-0.5 text-sm text-profundo/70">
                            {p.type} · {p.seconds < 60 ? `${p.seconds} s` : `${p.seconds / 60} min`}
                          </p>
                        </Link>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ol>
              </motion.div>
            ))}
          </LayoutGroup>

          <WeekStrip moments={routines.map((r) => r.moment)} withGenesis={withGenesis} />
        </div>
      </div>
    </section>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  render,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
  render: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="w-16 text-sm text-profundo/70">{label}</span>
      <LayoutGroup id={`seg-${label}`}>
        <div role="radiogroup" aria-label={label} className="flex rounded-full p-1 ring-1 ring-profundo/15">
          {options.map((o) => {
            const selected = o === value;
            return (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(o)}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-300 ${selected ? "text-papel" : "hover:bg-profundo/6"}`}
              >
                {selected && <motion.span layoutId={`seg-${label}-pill`} className="absolute inset-0 rounded-full bg-profundo" transition={spring.soft} />}
                <span className="relative">{render(o)}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <dt className="text-profundo/70">{label}</dt>
      <dd className="mt-1 font-serif text-[1.9rem] leading-none tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="inline-block"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={spring.snappy}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        {note && <span className="ml-2 font-sans text-xs text-pino">{note}</span>}
      </dd>
    </div>
  );
}

/** La semana: sincronicidad. Qué momentos tocan cada día y cuándo suma Génesis. */
function WeekStrip({ moments, withGenesis }: { moments: ("am" | "pm")[]; withGenesis: boolean }) {
  return (
    <div className="mt-12 border-t border-profundo/15 pt-6">
      <p className="text-sm text-profundo/75">Tu semana</p>
      <ol className="mt-4 grid grid-cols-7 gap-1.5 text-center text-sm">
        {weekdays.map((day, i) => {
          const genesis = withGenesis && genesisStartNights.includes(i);
          return (
            <li key={day} className="rounded-[3px] py-3 ring-1 ring-inset ring-profundo/10">
              <span className="block text-profundo/75">{day}</span>
              <span className="mt-2 flex justify-center gap-1" aria-hidden>
                {moments.includes("am") && <span className="size-2 rounded-full bg-prisma ring-1 ring-profundo/20" />}
                {moments.includes("pm") && <span className={`size-2 rounded-full ${genesis ? "bg-genesis" : "bg-pino"}`} />}
              </span>
              <span className="sr-only">
                {[moments.includes("am") && "mañana", moments.includes("pm") && "noche", genesis && "con Génesis"].filter(Boolean).join(", ")}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 max-w-xl text-sm text-profundo/75">
        {withGenesis
          ? "Génesis (retinol) se suma de a poco: lunes, miércoles y viernes al empezar. Si tu piel lo acepta, todas las noches."
          : "La piel cambia con la semana, el clima y la estación: escuchala y ajustá el ritual."}
      </p>
    </div>
  );
}
