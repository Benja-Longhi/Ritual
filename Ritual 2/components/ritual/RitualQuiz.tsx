"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { momentLabel } from "@/data/products";
import { buildQuizRitual, questions, type QuizAnswers } from "@/data/quiz";
import { useCart } from "@/store/cart";
import { flyToCart } from "@/lib/flyToCart";
import { formatPrice } from "@/lib/format";
import { ritualDiscountFor } from "@/lib/pricing";
import { spring, stagger, transition } from "@/lib/motion";
import { Packshot } from "@/components/brand/Packshot";
import { MomentIcon } from "@/components/brand/MomentIcon";
import { buttonClasses } from "@/components/ui/Button";

type Answers = { [K in keyof QuizAnswers]?: QuizAnswers[K] };

/**
 * "¿Por dónde empiezo?": tres preguntas, una por pantalla, y una rutina
 * armada con los siete rituales en el orden de aplicación.
 */
export function RitualQuiz() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const done = step >= questions.length;

  const choose = (id: keyof QuizAnswers, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setStep((s) => s + 1);
  };

  return (
    <div className="rounded-[4px] bg-papel-claro p-6 ring-1 ring-inset ring-profundo/10 md:p-10">
      <div className="mb-8 flex items-center justify-between gap-4 text-sm text-profundo/75">
        <p aria-live="polite">{done ? "Tu rutina" : `Pregunta ${step + 1} de ${questions.length}`}</p>
        <ol className="flex gap-1.5" aria-hidden>
          {questions.map((q, i) => (
            <li key={q.id} className={`h-1 w-8 rounded-full transition-colors duration-500 ${i < step ? "bg-profundo" : "bg-profundo/15"}`} />
          ))}
        </ol>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <Result
            key="result"
            answers={answers as QuizAnswers}
            onRestart={() => {
              setAnswers({});
              setStep(0);
            }}
          />
        ) : (
          <motion.div
            key={questions[step].id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0, transition: transition.enter }}
            exit={{ opacity: 0, x: -24, transition: transition.exit }}
          >
            <h3 className="max-w-2xl font-serif text-title">{questions[step].title}</h3>
            <motion.ul
              className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: stagger.tight } } }}
            >
              {questions[step].options.map((o) => (
                <motion.li
                  key={o.value}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: transition.enter } }}
                >
                  <button
                    type="button"
                    onClick={() => choose(questions[step].id, o.value)}
                    className="group flex h-full w-full flex-col items-start rounded-[3px] p-5 text-left ring-1 ring-inset ring-profundo/15 transition-colors duration-300 hover:bg-profundo hover:text-papel"
                  >
                    <span className="text-lg leading-snug">{o.label}</span>
                    <span className="mt-2 text-sm opacity-70">{o.hint}</span>
                  </button>
                </motion.li>
              ))}
            </motion.ul>
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="mt-6 text-sm underline underline-offset-4">
                Volver a la pregunta anterior
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Result({ answers, onRestart }: { answers: QuizAnswers; onRestart: () => void }) {
  const { routines, products, tip } = buildQuizRitual(answers);
  const thumbs = useRef(new Map<string, HTMLElement>());
  const addMany = useCart((s) => s.addMany);
  const openDrawer = useCart((s) => s.openDrawer);
  const [added, setAdded] = useState(false);
  const subtotal = products.reduce((sum, p) => sum + p.price, 0);
  const total = products.length === 7 ? subtotal - ritualDiscountFor(subtotal) : subtotal;

  async function addAll() {
    await Promise.all(
      products.map(
        (p, i) => new Promise<void>((r) => setTimeout(() => void flyToCart(thumbs.current.get(p.slug) ?? null).then(r), i * 110)),
      ),
    );
    addMany(products.map((p) => p.slug));
    setAdded(true);
    setTimeout(openDrawer, 300);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: transition.enter }} exit={{ opacity: 0 }}>
      <h3 className="font-serif text-title">Tu ritual, a tu ritmo.</h3>
      <p className="mt-3 max-w-2xl text-profundo/80">{tip}</p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {routines.map((r) => (
          <div key={r.moment}>
            <p className="mb-3 flex items-center gap-2 text-sm text-profundo/75">
              <MomentIcon moment={r.moment} width={16} height={16} />
              {momentLabel[r.moment]}
            </p>
            <ol className="space-y-2">
              {r.products.map((p, i) => (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0, transition: { ...spring.soft, delay: i * 0.05 } }}
                >
                  <Link href={`/productos/${p.slug}`} className="flex items-center gap-4 rounded-[3px] p-2 ring-1 ring-inset ring-profundo/10 hover:bg-profundo/5">
                    <span
                      ref={(el) => {
                        if (el) thumbs.current.set(p.slug, el);
                      }}
                      className="block w-12 shrink-0"
                      style={{ background: `var(--color-${p.slug})` }}
                    >
                      <Packshot product={p} className="aspect-square w-full p-1" bare />
                    </span>
                    <span className="text-sm tabular-nums opacity-60">{i + 1}</span>
                    <span className="ritual-name text-sm">{p.name}</span>
                    <span className="ml-auto text-sm text-profundo/70">{p.type}</span>
                  </Link>
                </motion.li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-5">
        <button type="button" onClick={addAll} disabled={added} className={buttonClasses("solid")}>
          {added ? "En tu carrito" : `Agregar mi rutina · ${formatPrice(total)}`}
        </button>
        <button type="button" onClick={onRestart} className="text-sm underline underline-offset-4">
          Empezar de nuevo
        </button>
      </div>
    </motion.div>
  );
}
