# 7RITUAL · La belleza a tu propio ritmo

Sitio de 7RITUAL: siete rituales de cosmética clean y vegana para cada momento del día (Alba, Aura, Prisma, Vértice, Eclipse, Mantra y Génesis). La landing es un día entero: arranca al alba y termina de noche. Incluye intro, landing con 3D y scroll horizontal, tienda con carrito, El método (`/ritual`), Nosotros y Contacto.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Stack

Next.js 16 (App Router, Cache Components, Partial Prefetching) · TypeScript estricto · Tailwind CSS 4 · Motion · GSAP (ScrollTrigger, SplitText, DrawSVG) + Lenis · React Three Fiber + drei · Zustand · react-hook-form + zod.

**Regla de convivencia de animaciones:** GSAP maneja lo ligado al scroll (pins, horizontales, scrub). Motion maneja la UI (estados, gestos, layout, carrito). Nunca animan el mismo elemento. Las transiciones entre páginas y el morph de tarjeta a ficha usan `<ViewTransition>` de React.

**Lenguaje de movimiento:** cada animación responde a uno de tres motivos. *La luz* (del alba a la noche: el fondo cambia con la hora, los textos suben desde una línea de horizonte), *el marco* (la ventana cuadrada del logo: se dibuja, se abre, se atraviesa) y *la respiración* (loops lentos de 4 s y 4 s, la pausa).

## Concepto

- **El scroll es el día.** Hero (06:00) → manifiesto del 7 → "Un día, siete rituales" (scroll horizontal por las siete luces) → armador de rutina → compromisos → cierre (23:30) → footer "Buenas noches".
- **El astro** (`components/three/Astro.tsx`): una esfera de luz con shader propio que es sol a la mañana y luna a la noche, y cambia de estado con cada ritual: Alba sale, Aura se envuelve en un halo, Prisma se facetea y quiebra la luz en los tonos de la paleta, Vértice se vuelve líneas, Eclipse queda tapado y brilla la corona, Mantra respira en anillos, Génesis se disuelve en células y se rehace.
- **Intro "Portal del alba"** (`components/landing/Intro.tsx`): de noche se dibuja el horizonte, sube el marco del logo, se traza la álef, amanece y el marco viaja hasta su lugar en el hero. Una vez por sesión, se saltea con clic, Escape o Enter.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Paleta (base + una luz por ritual), fuentes, easings CSS, view transitions | `app/globals.css` (tokens `@theme static`; los colores por defecto de Tailwind están deshabilitados) |
| Paleta para three.js y canvas | `lib/palette.ts` (espejo de los tokens CSS) |
| Easings, duraciones, distancias y resortes | `lib/motion.ts` |
| Datos de marca (contacto, envío gratis, descuento por los siete) | `lib/site.ts` |
| Los siete rituales (concepto y frase de packaging del documento de marca) | `data/products.ts` |
| Manifiesto del 7 y sus cuatro dimensiones, texto de origen | `data/seven.ts` |
| Los 7 beneficios, los activos explicados, los compromisos | `data/benefits.ts`, `data/actives.ts`, `data/commitments.ts` |
| Rutinas (esencial / completa) y el test | `data/routines.ts`, `data/quiz.ts` |
| Qué ritual acompaña cada hora (chip "Ahora", reloj, footer) | `lib/ritualTime.ts` |
| Logo vectorizado (marco, álef y wordmark) | `components/brand/logoPaths.ts`, `components/brand/Logo.tsx` |
| Glifos de los rituales y packshots SVG | `components/brand/RitualGlyph.tsx`, `components/brand/Packshot.tsx` |
| Astro, envases 3D procedurales, etiquetas, luz de estudio, visor de la ficha | `components/three/*` |
| Landing | `components/landing/*` |
| Carrito y precios | `store/cart.ts`, `lib/pricing.ts`, `components/cart/*` |

## La escena 3D de la landing

Un solo `<Canvas>` fijo detrás de toda la landing (`components/landing/LandingScene.tsx`). El astro y los siete envases siguen **anclas del DOM** (`lib/sceneAnchors.ts`): el lugar del astro en el hero, en el manifiesto, el arco del cielo del recorrido y el cierre, y el panel de cada envase. El scroll escribe pesos en `lib/sceneState.ts` y cada cuadro lee dónde quedó cada ancla, así el 3D respeta el diseño responsive.

El canvas avanza en el mismo tick de GSAP que mueve Lenis y ScrollTrigger (sin desfase con el DOM) y no dibuja si ninguna sección con 3D está a la vista. No se descarga ningún modelo, textura ni HDR: envases y etiquetas son procedurales (las etiquetas se dibujan en canvas con las fuentes y el logo reales).

## Qué está simulado o es provisorio

- **Checkout:** `lib/checkout.ts` define `CheckoutProvider`. Hoy se usa `simulated`; hay un proveedor `whatsapp` listo. Para Mercado Pago, sumar un proveedor que cree la preferencia en un route handler y devuelva `{ status: "redirect", url }`.
- **Contacto y newsletter:** validan con zod y simulan el envío.
- **Fotos:** cada producto acepta `image`. Mientras no exista, se usan el packshot SVG y el modelo 3D.
- **A validar con la marca:** precios, tamaños, fórmulas INCI, aromas, beneficios asignados a cada ritual, rutinas, frecuencias, plazos de envío y datos de contacto. La línea no tiene protector solar: el copy no promete FPS.

## Accesibilidad y rendimiento

- `prefers-reduced-motion`: sin scroll suave, pins ni 3D. El recorrido del día se apila (cada ritual con su luz), el manifiesto muestra las cuatro dimensiones juntas, el hero muestra un sol dibujado y la intro es un fundido.
- El 3D se monta cuando el navegador está libre y solo si hay WebGL con GPU real (`hooks/useDeviceTier.ts`). Baja de calidad sola si cae el framerate.
- Los títulos visibles al cargar se revelan con CSS, sin esperar la hidratación, para no retrasar el LCP.
- Contraste AA verificado para el texto sobre cada una de las siete luces.
