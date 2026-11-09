# Proyecto: Sitio web de aromatizantes de ambiente naturales

## 1. Qué estamos construyendo

Un sitio web para una marca de **aromatizantes de ambiente naturales**: sin crueldad animal, ingredientes de origen vegetal, profundamente conectada con el medio ambiente. La estética es de **cosmética natural**: cálida, terrosa, sobria, táctil.

El sitio es **simple en contenido** (informativo + tienda chica), pero tiene que **sorprender por cómo se siente**: fluido, vivo, con movimiento que tiene sentido. Referencia de nivel de calidad: las webs de **Vercel y Next.js** (todo está animado, nada está animado "porque sí") y las de la lista de inspiración más abajo.

**Idioma del sitio:** español rioplatense (Argentina). Tono cálido, cercano, sin ser cursi. Precios en ARS.

## 2. Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **Motion (Framer Motion)** para transiciones de UI, layout animations, gestos, carrito.
- **GSAP + ScrollTrigger** para scroll pinneado, scroll horizontal y timelines complejos.
- **Lenis** para smooth scroll (sincronizado con ScrollTrigger).
- **React Three Fiber + drei + three** para el elemento 3D.
- **Zustand** (con `persist`) para el carrito.
- Fuentes con `next/font`.

Si algo del stack no cierra, proponé una alternativa y explicá por qué antes de cambiarlo.

## 3. Paleta de color (obligatoria)

Colores **pastel pero con cuerpo**. No son colores claros ni lavados: son tonos apagados, profundos, de tierra. Definirlos como variables CSS / tokens de Tailwind y **no usar colores fuera de la paleta**.

| Rol | Descripción | Hex de partida |
|---|---|---|
| **Marrón principal** | Café con leche con muy poca leche. Predomina en la identidad. | `#9A7556` |
| **Marrón profundo** (texto/contraste) | Café más oscuro, para texto y detalles. | `#3A2A20` |
| **Fondo base** | Color papel de caña de azúcar (bagazo): crema cálido, ligeramente grisáceo/amarillento. NO blanco puro. | `#E9DFC8` |
| **Verde oscuro** | Verde pastel oscuro, como hojas de pino en invierno. | `#4E6A5A` |
| **Verde pasto** | Verde pastel, como el pasto de una cancha de fútbol. | `#8FB07A` |

Los hex son punto de partida: ajustalos a ojo hasta que se sienta bien en pantalla, pero respetá la descripción. Usá opacidades/mezclas de estos mismos tonos para superficies y bordes. Alternar secciones entre fondo papel, verde oscuro y marrón da ritmo sin salirse de la paleta. Nada de negro puro ni blanco puro.

## 4. Tipografía y look general

- Un **display serif** con carácter (ej: Fraunces, Cormorant, Instrument Serif) para títulos, y una **sans limpia** (ej: Geist, DM Sans, Manrope) para cuerpo/UI. Evitar Inter/Roboto/Arial por defecto.
- Mucho espacio en blanco (en realidad "espacio papel"), grillas limpias, títulos grandes, microtipografía cuidada.
- Textura sutil de papel/grano opcional (muy suave, que no pese).
- Imágenes: placeholders elegantes (formas orgánicas, gradientes de la paleta) hasta tener fotos reales. Dejar todo listo para reemplazar por fotos.
- Evitar el look "plantilla de IA": nada de gradientes violetas, cards genéricas con sombras iguales, íconos de relleno ni emojis en la UI.

## 5. Páginas y funcionalidades

1. **Landing (`/`)**: ver sección 6. Es la pieza principal.
2. **Productos (`/productos`)**: grilla de productos con filtro por familia aromática (ej: cítrico, amaderado, herbal, floral). Transiciones de layout al filtrar.
3. **Detalle de producto (`/productos/[slug]`)**: galería, notas olfativas (salida/corazón/fondo) visualizadas de forma interesante, ingredientes, duración estimada, botón de agregar al carrito.
4. **Carrito**: drawer lateral accesible desde el navbar + página `/carrito`. Persistente (localStorage). Cambiar cantidades, quitar productos, subtotal. Checkout **simulado** por ahora (dejar la arquitectura lista para integrar Mercado Pago o cierre por WhatsApp después).
5. **Contacto (`/contacto`)**: formulario con validación (react-hook-form + zod), estados de éxito/error animados, datos de contacto, redes.
6. **Nosotros / Filosofía (`/nosotros`)**: compromiso ambiental, sin crueldad animal, ingredientes, packaging. Corta y visual.
7. **Navbar y footer globales**: ver secciones 7 y 8.

Datos de productos en un archivo local tipado (`/data/products.ts`) con 6 a 8 productos inventados pero verosímiles (nombre, slug, precio ARS, familia, notas, descripción, ingredientes). Fácil de reemplazar por un CMS o API más adelante.

## 6. Landing page (lo más importante)

Debe dar un "wow" en los primeros 3 segundos y mantenerlo mientras se scrollea. Estructura sugerida (podés mejorarla):

### a) Intro / preloader con sentido
Una intro corta (máx ~2,5 s, salteable) que cuente la marca: por ejemplo, el logo/nombre se "respira" o se revela como si un aroma se disipara, con una forma orgánica que se expande y revela el hero. Sin spinner genérico. Solo se ve en la primera visita de la sesión.

### b) Hero con elemento 3D
- Un objeto 3D en el centro del hero, con **R3F**. Opciones (elegí la que quede mejor y sea liviana): un frasco difusor de cerámica/vidrio esmerilado con varillas de ratán y hojas flotando alrededor; o una forma orgánica abstracta (tipo semilla/hoja/ondas de vapor) con material tipo cerámica o vidrio, iluminado con luz cálida.
- Interacciones: responde suavemente al mouse (parallax/rotación con inercia) y al **scroll** (rota, se desplaza, cambia de escala o de material a medida que bajás; puede "viajar" entre secciones).
- Partículas/estelas muy sutiles que representen el aroma difundiéndose.
- Iluminación y entorno con la paleta cálida. Postprocesado mínimo y solo si no afecta rendimiento.
- Carga con `Suspense` + fallback elegante; modelos optimizados (Draco/gltf-transform) o geometría procedural. Si el dispositivo es flojo o hay `prefers-reduced-motion`, mostrar versión simplificada/estática.

### c) Scroll horizontal
Una sección pinneada (GSAP ScrollTrigger) donde al scrollear vertical el contenido avanza en horizontal. Usarla para algo con narrativa, por ejemplo: **"De la planta al ambiente"** (origen → extracción → mezcla → tu casa), o el recorrido por las familias aromáticas. Cada panel con su propia micro-animación de entrada, progreso visible (barra o contador) y el fondo cambiando de color entre paneles.
En mobile: degradar a un carrusel con swipe o a layout vertical, no romper la experiencia.

### d) Más momentos de scroll
- Revelado de texto por líneas/palabras con máscara.
- Sección de manifiesto: texto grande donde las palabras se "encienden" a medida que scrolleás.
- Productos destacados con tarjetas que se revelan con máscaras y parallax de imagen.
- Contadores o datos de impacto (ej: % de ingredientes naturales, packaging reciclable) que se animan al entrar en pantalla.
- Transiciones de color de fondo entre secciones (papel → verde pino → marrón → papel), ligadas al scroll.
- CTA final potente que lleve a la tienda.

## 7. Navbar (tiene que ser súper fachero)

Referencia: **superpower.com**. Pautas:
- Flotante, tipo "píldora", con blur/translucidez que se adapta al fondo detrás.
- Se **transforma con el scroll**: se compacta al bajar, se oculta al scrollear hacia abajo y reaparece al subir (o el estilo que mejor funcione).
- Indicador de ítem activo que se desliza entre links (layout animation, no un simple cambio de color).
- Menú expandible con animación fluida (en desktop un panel que se despliega desde el propio navbar; en mobile, overlay a pantalla completa con links que entran escalonados).
- Ícono de carrito con contador que reacciona cuando agregás un producto (bump/pulse sutil) y abre el drawer.
- Accesible por teclado, con foco visible.

## 8. Footer

Referencias: deepjudge.ai, airvoir.com, superpower.com. Footer grande, memorable: tipografía enorme con el nombre de la marca, reveal al llegar al final (el contenido anterior "se levanta" y descubre el footer, o similar), links, newsletter, redes. Colores en verde pino oscuro o marrón profundo con texto papel. Con un pequeño detalle animado ligado al tema (hojas, humo/aroma, etc.).

## 9. Filosofía de animación (esto es central)

**Cada animación tiene que comunicar algo.** Antes de agregar una, preguntate: ¿qué ayuda a entender, guiar la atención o dar sensación de materia/aroma? Si no responde nada, no va.

- **Tema conceptual:** aroma que se difunde, respiración, crecimiento orgánico, hojas, vapor. Los movimientos son suaves, orgánicos, con inercia (spring/ease-out expo), nunca bruscos ni mecánicos.
- **Nada de "solo hover"**. Las interacciones deben ser más ricas: magnetic buttons, cursor personalizado que cambia de contexto, tarjetas que responden al mouse con profundidad, reveals con máscara, transiciones de página, scroll-linked animations, shared element transitions (de la tarjeta al detalle del producto).
- **Agregar al carrito:** animación memorable (el producto "vuela" al ícono del carrito, el contador reacciona, el drawer se abre con stagger en los ítems).
- **Transiciones entre páginas** fluidas (no cortes secos).
- **Consistencia:** definir un set de easings, duraciones y distancias en un único archivo (`/lib/motion.ts`) y reutilizarlo. Todo debe sentirse de la misma "familia".
- **Rendimiento:** animar solo `transform` y `opacity` cuando se pueda, 60 fps, `will-change` con criterio, evitar layout thrash, limpiar ScrollTriggers al desmontar.
- **Accesibilidad:** respetar `prefers-reduced-motion` (reemplazar por fades simples), no esconder contenido esencial detrás de animaciones, que todo sea usable con teclado.
- **Densidad:** la landing puede ser muy animada, pero las páginas funcionales (carrito, contacto, checkout) priorizan claridad: animaciones más sutiles.

## 10. Inspiración (visitá estos sitios antes de diseñar)

- **Elemento 3D:** untillabs.com, godaylight.com
- **Intro:** godaylight.com, airvoir.com, quantumbody.io
- **Animaciones épicas:** godaylight.com, deepjudge.ai, airvoir.com, superpower.com, quantumbody.io
- **Footer:** deepjudge.ai, airvoir.com, superpower.com
- **Navbar:** superpower.com
- Más inspiración: minimal.gallery
- Estilo general de animación: vercel.com, nextjs.org

Todos tienen scrolls interesantes: analizá cómo resuelven cada momento (qué se pinnea, qué se mueve con scroll, cómo entran los textos) y **tomá los principios, no copies**. El resultado tiene que ser propio y coherente con la marca.

## 11. Cómo trabajar

1. **Antes de escribir código:** mirá las referencias, y proponeme brevemente (1 pantalla de texto) el concepto del 3D, de la intro y del scroll horizontal. Esperá mi OK en esas tres decisiones si tenés dudas reales; si no, avanzá con tu mejor criterio.
2. **Construí por fases**, verificando cada una en el navegador (desktop y mobile):
   1. Setup, tokens de diseño (colores, fuentes, motion), layout base, navbar y footer.
   2. Landing: hero + 3D.
   3. Landing: scroll horizontal y resto de secciones.
   4. Productos, detalle y carrito (drawer + página).
   5. Contacto y Nosotros.
   6. Transiciones de página, pulido, accesibilidad, performance.
3. **Estructura de código limpia:** componentes reutilizables, datos separados de la UI, tipado estricto, sin código muerto.
4. **Antes de dar algo por terminado:** correr el build, revisar la consola, probar en viewport mobile, probar con `prefers-reduced-motion`, revisar Lighthouse (apuntar a buen rendimiento incluso con 3D).
5. Si una decisión de diseño es dudosa, elegí la opción más **simple, elegante y fiel a la paleta**. Menos cosas, mejor hechas.

## 12. Lo que NO quiero

- Colores fuera de la paleta, blanco/negro puro, o tonos pastel lavados y claros.
- Animaciones gratuitas, repetitivas o que tapen el contenido.
- Un 3D pesado que trabe el sitio o no cargue en celulares.
- Un diseño recargado: el sitio es simple, lo especial está en la ejecución y el movimiento.
- Texto relleno tipo "Lorem ipsum" (usar copy real, aunque sea provisorio, coherente con la marca).
