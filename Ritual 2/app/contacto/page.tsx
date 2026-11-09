import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { ArrowIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribinos por tu rutina, tu pedido o un activo que no entendés. Te responde una persona en menos de 48 horas hábiles.",
};

const channels = [
  { label: "WhatsApp", value: site.phone, href: `https://wa.me/${site.whatsapp}` },
  { label: "Mail", value: site.email, href: `mailto:${site.email}` },
  { label: "Instagram", value: site.instagram, href: site.social[0].href },
];

const quick = [
  {
    q: "Envíos",
    a: `A todo el país, en 2 a 6 días hábiles. Gratis en compras desde ${formatPrice(site.freeShippingFrom)}.`,
  },
  { q: "Cambios", a: "Si un ritual no le cae bien a tu piel, escribinos dentro de los 30 días y lo resolvemos." },
  { q: "Pagos", a: "Tarjetas de crédito y débito, transferencia y efectivo en puntos de pago." },
];

export default function ContactoPage() {
  return (
    <Page className="pb-32">
      <div data-surface="light">
        <PageHeader kicker="Contacto" title="Hablemos de tu piel.">
          ¿Dudas con tu rutina, con un pedido o con un activo? Escribinos: te responde una persona, con tiempo.
        </PageHeader>

        <div className="mx-auto grid max-w-[1440px] gap-16 px-6 md:px-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-24">
          <section aria-label="Formulario de contacto">
            <ContactForm />
          </section>

          <aside className="space-y-12">
            <div>
              <h2 className="mb-5 text-sm text-profundo/75">Directo</h2>
              <ul className="divide-y divide-profundo/12 border-y border-profundo/12">
                {channels.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-4 py-5"
                    >
                      <span>
                        <span className="block text-sm text-profundo/75">{c.label}</span>
                        <span className="mt-1 block font-serif text-2xl">{c.value}</span>
                      </span>
                      <ArrowIcon width={20} className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-profundo/75">{site.hours}.</p>
            </div>

            <div>
              <h2 className="mb-5 text-sm text-profundo/75">Lo que más nos preguntan</h2>
              <dl className="space-y-5">
                {quick.map((item) => (
                  <div key={item.q}>
                    <dt className="font-serif text-2xl">{item.q}</dt>
                    <dd className="mt-1 text-profundo/80">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Link
              href="/ritual#test"
              className="group block rounded-[3px] bg-prisma p-7 ring-1 ring-inset ring-profundo/10 transition-transform duration-500 ease-out-expo hover:-translate-y-1"
            >
              <span className="text-sm">¿No sabés por dónde empezar?</span>
              <span className="mt-3 flex items-center justify-between gap-4 font-serif text-3xl leading-tight">
                Tres preguntas y armamos tu rutina.
                <ArrowIcon width={22} className="shrink-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
              </span>
            </Link>
          </aside>
        </div>
      </div>
    </Page>
  );
}
