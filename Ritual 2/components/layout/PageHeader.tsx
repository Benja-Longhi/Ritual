import type { CSSProperties, ReactNode } from "react";
import { RevealWords } from "@/components/ui/RevealWords";

type PageHeaderProps = {
  /** Dónde estás, en palabras (sin mayúsculas ni adornos). */
  kicker: string;
  title: string;
  children?: ReactNode;
  /** Contenido a la derecha del título (ej: un glifo, un reloj). */
  aside?: ReactNode;
};

/** Encabezado común de las páginas internas: el título sube desde una línea de horizonte. */
export function PageHeader({ kicker, title, children, aside }: PageHeaderProps) {
  return (
    <header className="mx-auto grid max-w-[1440px] items-end gap-10 px-6 pt-36 pb-14 md:px-10 md:pt-44 md:pb-20 lg:grid-cols-[1fr_auto]">
      <div>
        <p className="fade-rise mb-6 flex items-center gap-3 text-[0.95rem] text-profundo/70">
          <span className="h-px w-8 bg-current" aria-hidden />
          {kicker}
        </p>
        <RevealWords text={title} className="max-w-5xl font-serif text-display" />
        {children && (
          <div className="fade-rise mt-8 max-w-xl text-lg leading-relaxed text-profundo/75" style={{ "--d": "0.5s" } as CSSProperties}>
            {children}
          </div>
        )}
      </div>
      {aside}
    </header>
  );
}
