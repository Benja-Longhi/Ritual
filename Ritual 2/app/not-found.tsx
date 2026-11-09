import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { RitualGlyph } from "@/components/brand/RitualGlyph";

export const metadata: Metadata = { title: "Página no encontrada" };

/** Una página que no existe: todavía no amaneció. */
export default function NotFound() {
  return (
    <Page>
      <div data-surface="light" className="mx-auto flex min-h-svh max-w-[1440px] flex-col justify-center px-6 py-32 md:px-10">
        <RitualGlyph slug="alba" className="mb-8 size-14" />
        <h1 className="max-w-4xl font-serif text-display">Esta página todavía no amaneció.</h1>
        <p className="mt-6 max-w-md text-lg text-profundo/80">
          El link que seguiste no lleva a ningún lado. El día, en cambio, sigue entero: empieza con Alba.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/" icon={<ArrowIcon width={18} />}>
            Volver al inicio
          </ButtonLink>
          <ButtonLink href="/productos" variant="outline">
            Ver los rituales
          </ButtonLink>
        </div>
      </div>
    </Page>
  );
}
