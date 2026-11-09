import { ALEPH_PATH, FRAME_STROKE, MARK_SIZE, WORDMARK } from "./logoPaths";

type MarkProps = {
  className?: string;
  /**
   * Grosor fijo en píxeles para tamaños chicos (navbar, etiquetas): el marco
   * y la álef no se adelgazan hasta desaparecer. Sin él, proporción original.
   */
  stroke?: number;
  title?: string;
};

const a11y = (title?: string) => (title ? { role: "img", "aria-label": title } : { "aria-hidden": true as const });

/** El isotipo: la álef dentro del marco cuadrado. */
export function LogoMark({ className, stroke, title }: MarkProps) {
  const inset = FRAME_STROKE / 2;
  return (
    <svg viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`} className={className} {...a11y(title)}>
      <rect
        x={inset}
        y={inset}
        width={MARK_SIZE - FRAME_STROKE}
        height={MARK_SIZE - FRAME_STROKE}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke ?? FRAME_STROKE}
        vectorEffect={stroke ? "non-scaling-stroke" : undefined}
      />
      <path
        d={ALEPH_PATH}
        fill="currentColor"
        fillRule="evenodd"
        stroke={stroke ? "currentColor" : undefined}
        strokeWidth={stroke ? stroke * 0.5 : undefined}
        strokeLinejoin="round"
        vectorEffect={stroke ? "non-scaling-stroke" : undefined}
      />
    </svg>
  );
}

/** "7RITUAL": el wordmark de la marca. */
export function Wordmark({ className, title = "7RITUAL" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={`0 0 ${WORDMARK.width} ${WORDMARK.height}`} className={className} {...a11y(title)}>
      {WORDMARK.letters.map((d, i) => (
        <path key={i} d={d} fill="currentColor" fillRule="evenodd" />
      ))}
    </svg>
  );
}

/** Isotipo + wordmark en línea: el logo del navbar. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className="size-7" stroke={1.25} />
      <Wordmark className="h-[0.8rem] w-auto" title="7RITUAL" />
    </span>
  );
}

/** Proporciones del logo original: el marco mide el 59 % del wordmark y lo separa un 11 %. */
const LOCKUP = {
  mark: WORDMARK.width * 0.587,
  gap: WORDMARK.width * 0.107,
};

/** El logo completo, apilado como en el documento de marca. */
export function LogoLockup({ className, title = "7RITUAL" }: { className?: string; title?: string }) {
  const height = LOCKUP.mark + LOCKUP.gap + WORDMARK.height;
  const scale = LOCKUP.mark / MARK_SIZE;
  return (
    <svg viewBox={`0 0 ${WORDMARK.width} ${height}`} className={className} {...a11y(title)}>
      <g transform={`translate(${(WORDMARK.width - LOCKUP.mark) / 2} 0) scale(${scale})`}>
        <rect
          x={FRAME_STROKE / 2}
          y={FRAME_STROKE / 2}
          width={MARK_SIZE - FRAME_STROKE}
          height={MARK_SIZE - FRAME_STROKE}
          fill="none"
          stroke="currentColor"
          strokeWidth={FRAME_STROKE}
        />
        <path d={ALEPH_PATH} fill="currentColor" fillRule="evenodd" />
      </g>
      <g transform={`translate(0 ${LOCKUP.mark + LOCKUP.gap})`}>
        {WORDMARK.letters.map((d, i) => (
          <path key={i} d={d} fill="currentColor" fillRule="evenodd" />
        ))}
      </g>
    </svg>
  );
}
