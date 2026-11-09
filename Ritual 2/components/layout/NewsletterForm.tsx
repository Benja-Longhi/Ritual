"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { z } from "zod";
import { transition } from "@/lib/motion";
import { ArrowIcon } from "@/components/ui/icons";

const emailSchema = z.email("Ese mail no parece válido.");

type Status = "idle" | "sending" | "done" | "error";

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("email");
    const parsed = emailSchema.safeParse(value);
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Revisá el mail.");
      return;
    }
    setError(null);
    setStatus("sending");
    // Simulado: reemplazar por el proveedor de newsletter.
    await new Promise((r) => setTimeout(r, 900));
    setStatus("done");
  }

  return (
    <div className="max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.p
            key="done"
            role="status"
            className="font-serif text-3xl text-prisma"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: transition.enter }}
          >
            Listo. Te escribimos una vez por mes, con un ritual que valga la pena.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            exit={{ opacity: 0, y: -8, transition: transition.exit }}
          >
            <label htmlFor="newsletter-email" className="mb-3 block text-sm text-papel/85">
              Un mail por mes con un ritual para tu piel. Nada más.
            </label>
            <div
              className={`flex items-center gap-2 rounded-[3px] p-1.5 pl-5 ring-1 ring-inset transition-colors focus-within:ring-prisma ${
                error ? "ring-prisma" : "ring-papel/25"
              }`}
            >
              <input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@mail.com"
                aria-invalid={!!error}
                aria-describedby={error ? "newsletter-error" : undefined}
                onChange={() => error && setError(null)}
                className="min-w-0 flex-1 bg-transparent py-2 text-papel placeholder:text-papel/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                aria-label="Suscribirme"
                className="flex size-11 shrink-0 items-center justify-center rounded-[2px] bg-prisma text-profundo transition-transform duration-500 ease-out-expo hover:scale-105 disabled:opacity-60"
              >
                <motion.span
                  animate={status === "sending" ? { x: [0, 6, 0] } : { x: 0 }}
                  transition={status === "sending" ? { repeat: Infinity, duration: 0.9 } : undefined}
                  className="flex"
                >
                  <ArrowIcon width={18} />
                </motion.span>
              </button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  id="newsletter-error"
                  role="alert"
                  className="mt-2 flex items-center gap-2 pl-5 text-sm text-papel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-prisma" aria-hidden />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
