import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { commitments, freeFrom } from "@/data/commitments";
import { manifesto, origin } from "@/data/seven";
import { LogoLockup } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "7RITUAL fusiona la rigurosidad de la ciencia dérmica con la mística del bienestar integral: el cuidado de la piel como un acto de reconexión diaria.",
};

const looks = {
  consciencia: "var(--color-aura)",
  experiencia: "var(--color-alba)",
  eficacia: "var(--color-prisma)",
} as const;

export default function NosotrosPage() {
  return (
    <Page className="pb-32">
      <div data-surface="light">
        <PageHeader kicker="Nosotros" title="Un acto de reconexión diaria.">
          {origin.lead}
        </PageHeader>

        <section aria-label="Quiénes somos" className="mx-auto grid max-w-[1440px] gap-16 px-6 md:px-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="space-y-8">
            {origin.body.map((line) => (
              <p key={line} className="max-w-3xl font-serif text-[clamp(1.7rem,2.8vw,2.7rem)] leading-[1.15]">
                {line}
              </p>
            ))}
          </div>
          <div className="mx-auto w-full max-w-sm text-profundo">
            <LogoLockup className="w-full" />
          </div>
        </section>

        <section aria-labelledby="eje" className="mx-auto mt-36 max-w-[1440px] px-6 md:px-10">
          <div className="grid gap-10 border-y border-profundo/15 py-14 lg:grid-cols-[0.6fr_1.4fr]">
            <h2 id="eje" className="font-serif text-headline">
              El 7, nuestro eje.
            </h2>
            <div>
              <p className="max-w-2xl text-lg leading-relaxed text-profundo/85">
                El número siete es el eje gravitacional de la marca. Se despliega en siete días (la piel cambia con la
                semana), siete pasos (de lo esencial al ritual completo), siete beneficios (los pilares de una piel sana)
                y siete rituales (un estado de ánimo para cada momento).
              </p>
              <p className="mt-6 max-w-2xl font-serif text-2xl italic">{manifesto}</p>
              <Link href="/ritual#siete" className="mt-8 inline-flex items-center gap-2 underline underline-offset-4">
                Conocé el método <ArrowIcon width={16} />
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="compromisos" className="mx-auto mt-36 max-w-[1440px] px-6 md:px-10">
          <h2 id="compromisos" className="font-serif text-headline">
            Lo que sostenemos.
          </h2>
          <ul className="mt-12 grid gap-3 lg:grid-cols-3">
            {commitments.map((c) => (
              <li key={c.id} className="flex flex-col rounded-[3px] p-8 ring-1 ring-inset ring-profundo/10" style={{ background: looks[c.id] }}>
                <p className="font-serif text-[2.6rem] leading-none italic">{c.name}</p>
                <p className="mt-3 font-medium">{c.title}</p>
                <p className="mt-6 leading-relaxed text-profundo/85">{c.text}</p>
                {c.id === "consciencia" && (
                  <ul className="mt-6 flex flex-wrap gap-1.5 text-sm">
                    {freeFrom.map((f) => (
                      <li key={f} className="rounded-full px-3 py-1 ring-1 ring-profundo/20">
                        Sin {f.toLowerCase()}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section data-surface="dark" className="mx-auto mt-36 max-w-[1440px] px-6 md:px-10">
          <div className="grid gap-10 rounded-[4px] bg-noche p-8 text-papel md:grid-cols-[1.2fr_1fr] md:items-end md:p-14">
            <div>
              <p className="text-sm text-papel/70">Hecho en Argentina</p>
              <p className="mt-4 font-serif text-headline">La belleza, a tu propio ritmo.</p>
            </div>
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-papel/80">
                Siete rituales para acompañar a tu piel del alba a la noche. Empezá por uno, o por el día completo.
              </p>
              <ButtonLink href="/productos" variant="light" icon={<ArrowIcon width={18} />}>
                Ver los rituales
              </ButtonLink>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
