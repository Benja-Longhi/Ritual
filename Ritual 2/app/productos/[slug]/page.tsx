import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, products, type Product } from "@/data/products";
import { isDarkLight } from "@/lib/palette";
import { site } from "@/lib/site";
import { Page } from "@/components/layout/Page";
import { ProductHero } from "@/components/product/ProductHero";
import { ProductDetails } from "@/components/product/ProductDetails";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/productos/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name}, ${product.type.toLowerCase()}`,
    description: `${product.product}. ${product.phrase} ${product.description}`,
  };
}

function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${site.name} ${product.name}`,
    description: product.description,
    brand: { "@type": "Brand", name: site.name },
    category: product.product,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "ARS",
      availability: "https://schema.org/InStock",
      url: `${site.url}/productos/${product.slug}`,
    },
  };
}

export default function ProductPage({ params }: PageProps<"/productos/[slug]">) {
  return (
    <Page className="pb-0">
      <Suspense fallback={<div className="min-h-svh" data-surface="light" />}>
        <ProductContent params={params} />
      </Suspense>
    </Page>
  );
}

/** La ficha toma la luz de la hora de su ritual: Alba amanece, Génesis es de noche. */
async function ProductContent({ params }: { params: PageProps<"/productos/[slug]">["params"] }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const dark = isDarkLight(product.slug);

  return (
    <div
      data-surface={dark ? "dark" : "light"}
      className={`pb-28 ${dark ? "text-papel" : "text-profundo"}`}
      style={{ background: `var(--color-${product.slug})` }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c") }}
      />
      <ProductHero product={product} dark={dark} />
      <ProductDetails product={product} dark={dark} />
    </div>
  );
}
