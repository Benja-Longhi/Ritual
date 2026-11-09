import type { Metadata } from "next";
import { Suspense } from "react";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCatalog, ProductCatalogFromURL } from "@/components/product/ProductCatalog";

export const metadata: Metadata = {
  title: "Los siete rituales",
  description:
    "Alba, Aura, Prisma, Vértice, Eclipse, Mantra y Génesis: siete rituales de cosmética clean y vegana, del limpiador de la mañana al sérum de la noche.",
};

const empty = { block: null, benefit: null };

export default function ProductosPage() {
  return (
    <Page className="pb-32">
      <div data-surface="light">
        <PageHeader kicker="La tienda" title="Siete rituales, del alba a la noche.">
          Elegí por momento del día o por lo que tu piel necesita. Cada fórmula es clean y vegana, y está pensada para
          usarse con las otras, en orden.
        </PageHeader>
        <section aria-label="Catálogo" className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Suspense fallback={<ProductCatalog initial={empty} />}>
            <ProductCatalogFromURL />
          </Suspense>
        </section>
      </div>
    </Page>
  );
}
