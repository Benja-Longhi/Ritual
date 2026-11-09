import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Tu carrito",
  robots: { index: false },
};

export default function CarritoPage() {
  return (
    <Page className="pb-32">
      <div data-surface="light">
        <PageHeader kicker="Tu carrito" title="Tu día, en orden." />
        <section aria-label="Productos en el carrito" className="mx-auto max-w-[1440px] px-6 md:px-10">
          <CartView />
        </section>
      </div>
    </Page>
  );
}
