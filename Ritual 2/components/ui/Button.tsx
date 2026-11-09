import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Magnetic } from "./Magnetic";

type Variant = "solid" | "light" | "outline";

const variants: Record<Variant, string> = {
  solid: "bg-profundo text-papel before:bg-prisma hover:text-profundo",
  light: "bg-papel text-profundo before:bg-prisma",
  outline: "text-current ring-1 ring-inset ring-current/35 before:bg-current/10",
};

/**
 * Botones rectos como el marco del logo. Al pasar el mouse la luz sube desde
 * la base, como un amanecer dentro del marco.
 */
export function buttonClasses(variant: Variant = "solid", className = "") {
  return [
    "group relative isolate inline-flex items-center justify-center gap-3 overflow-hidden rounded-[3px]",
    "px-7 py-4 text-[0.95rem] font-medium tracking-[0.01em] transition-colors duration-500 ease-out-expo",
    "before:absolute before:inset-0 before:-z-10 before:translate-y-full",
    "before:transition-transform before:duration-500 before:ease-out-expo hover:before:translate-y-0",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    className,
  ].join(" ");
}

/** Texto que "rueda" hacia arriba y es reemplazado por su copia. */
export function RollingLabel({ children }: { children: ReactNode }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0 motion-reduce:transition-none"
      >
        {children}
      </span>
    </span>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  magnetic?: boolean;
  icon?: ReactNode;
};

export function ButtonLink({
  variant = "solid",
  magnetic = true,
  className,
  children,
  icon,
  ...props
}: ButtonLinkProps) {
  const link = (
    <Link className={buttonClasses(variant, className)} {...props}>
      <RollingLabel>{children}</RollingLabel>
      {icon}
    </Link>
  );
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  icon?: ReactNode;
};

export function Button({ variant = "solid", className, children, icon, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, className)} {...props}>
      <RollingLabel>{children}</RollingLabel>
      {icon}
    </button>
  );
}
