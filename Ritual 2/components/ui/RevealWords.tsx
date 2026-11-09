import { Fragment, type CSSProperties } from "react";

type RevealWordsProps = {
  text: string;
  as?: "h1" | "h2" | "p";
  id?: string;
  className?: string;
  /** Retardo inicial y escalonado, en segundos. */
  delay?: number;
  stagger?: number;
};

/**
 * Igual que RevealText pero 100% CSS: arranca con el primer pintado, sin
 * esperar la hidratación. Para títulos visibles al cargar (y buen LCP).
 */
export function RevealWords({ text, as: Tag = "h1", id, className, delay = 0, stagger = 0.06 }: RevealWordsProps) {
  const words = text.split(" ");
  return (
    <Tag id={id} className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="reveal-mask">
            <span className="reveal-word" style={{ "--d": `${delay + i * stagger}s` } as CSSProperties}>
              {w}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
