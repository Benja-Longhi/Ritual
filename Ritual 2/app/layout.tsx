import type { Metadata, Viewport } from "next";
import { cacheLife } from "next/cache";
import { Cormorant, Jost } from "next/font/google";
import { site } from "@/lib/site";
import { palette } from "@/lib/palette";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Cursor } from "@/components/ui/Cursor";
import { INTRO_KEY } from "@/lib/storageKeys";
import "./globals.css";

/** La mística: titulares y frases de packaging. */
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

/** La ciencia y el wordmark: cuerpo, UI y nombres de los rituales. */
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    locale: "es_AR",
    type: "website",
    siteName: site.name,
  },
};

export const viewport: Viewport = {
  themeColor: palette.papel,
};

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  slogan: site.tagline,
  url: site.url,
  email: site.email,
  description: site.description,
  areaServed: { "@type": "Country", name: "Argentina" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const year = await currentYear();
  return (
    <html lang="es-AR" className={`${cormorant.variable} ${jost.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* La intro es para quien entra por la landing: si ya se vio (o se entró por otra página) se oculta antes del primer pintado */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=sessionStorage,d=document.documentElement;if(location.pathname!=="/")s.setItem("${INTRO_KEY}","1");if(s.getItem("${INTRO_KEY}")==="1"){d.dataset.introSeen="1";d.dataset.introDone="1"}}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="grain">
        <a
          href="#contenido"
          className="fixed top-3 left-3 z-[300] -translate-y-24 rounded-full bg-profundo px-5 py-3 text-sm text-papel focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <Providers>
          <Navbar />
          {children}
          <Footer year={year} />
          <CartDrawer />
          <Cursor />
        </Providers>
      </body>
    </html>
  );
}
