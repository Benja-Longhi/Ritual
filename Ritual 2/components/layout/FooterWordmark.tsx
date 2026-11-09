"use client";

import { useRef } from "react";
import { useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { WORDMARK } from "@/components/brand/logoPaths";

/**
 * El wordmark enorme del footer. Llega en contorno y se va llenando de luz
 * desde la base a medida que la noche se descubre: el mismo amanecer que
 * abrió el sitio en la intro, para cerrar el ciclo.
 */
export function FooterWordmark({ progress, still }: { progress: MotionValue<number>; still?: boolean }) {
  const { width: w, height: h, letters } = WORDMARK;
  const light = useRef<SVGRectElement>(null);
  const top = useTransform(progress, [0.2, 1], [h + 2, -2]);

  // El atributo `y` del recorte (más compatible que transformar dentro de un clipPath).
  useMotionValueEvent(top, "change", (v) => {
    if (!still) light.current?.setAttribute("y", v.toFixed(2));
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block w-full overflow-visible" role="img" aria-label="7RITUAL">
      <defs>
        <clipPath id="footer-dawn">
          <rect ref={light} x="-2" y={still ? -2 : h + 2} width={w + 4} height={h + 4} />
        </clipPath>
      </defs>
      <g fill="none" stroke="currentColor" strokeOpacity="0.3">
        {letters.map((d, i) => (
          <path key={i} d={d} fillRule="evenodd" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g clipPath="url(#footer-dawn)" fill="currentColor">
        {letters.map((d, i) => (
          <path key={i} d={d} fillRule="evenodd" />
        ))}
      </g>
    </svg>
  );
}
