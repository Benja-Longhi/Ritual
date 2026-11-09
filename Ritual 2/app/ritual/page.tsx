import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { SevenDimensions } from "@/components/ritual/SevenDimensions";
import { RitualClock } from "@/components/ritual/RitualClock";
import { RhythmBuilder } from "@/components/ritual/RhythmBuilder";
import { RitualQuiz } from "@/components/ritual/RitualQuiz";

export const metadata: Metadata = {
  title: "El método",
  description:
    "El 7 como eje: siete días, siete pasos, siete beneficios y siete rituales. Cómo armar tu rutina, de lo esencial al día completo.",
};

const faq = [
  {
    q: "¿Tengo que usar los siete rituales?",
    a: "No. El sistema es modular: con Alba y Prisma a la mañana y Eclipse y Mantra a la noche ya tenés una rutina esencial. Los demás se suman cuando tu piel (o tu tiempo) los pide.",
  },
  {
    q: "¿En qué orden se aplican?",
    a: "De la textura más liviana a la más rica: primero limpiar, después la bruma, el sérum, el contorno y, de noche, la crema al final. En cada ficha está el paso a paso.",
  },
  {
    q: "¿Puedo usar Génesis si tengo la piel sensible?",
    a: "Sí, de a poco: empezá una o dos noches por semana y subí si tu piel lo acepta. El bakuchiol lo hace más amable que un retinol solo. De día, protector solar siempre.",
  },
  {
    q: "¿Alguno tiene protector solar?",
    a: "Todavía no. Aura cuida la barrera de la piel frente a lo que viene de afuera, pero no reemplaza al protector solar: usá uno todas las mañanas, sobre todo con Prisma y Génesis.",
  },
  {
    q: "¿Son veganos y cruelty-free?",
    a: "Sí. Ninguna fórmula lleva ingredientes de origen animal, parabenos, sulfatos ni siliconas cosméticas, y nada se testea en animales.",
  },
  {
    q: "¿Para qué tipo de piel son?",
    a: "Para todas. Si tu piel es sensible o reactiva, empezá por la rutina esencial y sumá los activos (Prisma, Génesis) de a uno.",
  },
];

export default function RitualPage() {
  return (
    <Page className="pb-32">
      <div data-surface="light">
        <PageHeader kicker="El método" title="El 7, en cuatro dimensiones.">
          El siete es el eje de 7RITUAL: los días de la semana, los pasos del cuidado, los beneficios de una piel sana y
          los rituales que acompañan cada momento.
        </PageHeader>

        <section id="siete" aria-label="Las cuatro dimensiones del 7" className="mx-auto max-w-[1440px] scroll-mt-24 px-6 md:px-10">
          <SevenDimensions />
        </section>

        <section aria-labelledby="reloj" className="mx-auto mt-36 max-w-[1440px] px-6 md:px-10">
          <h2 id="reloj" className="mb-12 font-serif text-headline">
            Un ritual para cada hora.
          </h2>
          <RitualClock />
        </section>

        <div className="mt-20">
          <RhythmBuilder heading="Armá tu rutina." />
        </div>

        <section id="test" aria-labelledby="test-titulo" className="mx-auto max-w-[1440px] scroll-mt-24 px-4 md:px-10">
          <h2 id="test-titulo" className="mb-8 px-2 font-serif text-headline">
            ¿Por dónde empiezo?
          </h2>
          <RitualQuiz />
        </section>

        <section id="preguntas" aria-labelledby="faq" className="mx-auto mt-36 max-w-[1440px] scroll-mt-24 px-6 md:px-10">
          <h2 id="faq" className="mb-10 font-serif text-headline">
            Preguntas frecuentes.
          </h2>
          <div className="max-w-3xl divide-y divide-profundo/12 border-y border-profundo/12">
            {faq.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-2xl">
                  {item.q}
                  <span aria-hidden className="text-xl transition-transform duration-500 ease-out-expo group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl leading-relaxed text-profundo/80">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
