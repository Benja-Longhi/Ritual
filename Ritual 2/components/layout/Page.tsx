import { ViewTransition, type ReactNode } from "react";

type PageProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Envoltorio de cada página: al navegar, la página vieja se disipa y la
 * nueva sube como vapor (ver `.page` en globals.css). Va en cada page.tsx
 * y no en el layout, porque el layout persiste entre navegaciones.
 */
export function Page({ children, className }: PageProps) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <main id="contenido" className={`relative bg-[var(--page-bg)] ${className ?? ""}`}>
        {children}
      </main>
    </ViewTransition>
  );
}
