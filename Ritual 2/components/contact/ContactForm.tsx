"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { contactReasons, contactSchema, type ContactInput } from "@/lib/contactSchema";
import { sendContact } from "@/app/contacto/actions";
import { duration, ease, transition } from "@/lib/motion";
import { ALEPH_PATH, MARK_SIZE } from "@/components/brand/logoPaths";
import { Field, inputClasses } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";

type Status = { kind: "idle" } | { kind: "sent"; name: string } | { kind: "error"; message: string };

/** Formulario de contacto: validación en vivo, estados claros y animación sutil. */
export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setStatus({ kind: "idle" });
    try {
      const result = await sendContact(data);
      if (result.ok) {
        setStatus({ kind: "sent", name: data.name.split(" ")[0] });
        reset();
      } else {
        setStatus({ kind: "error", message: result.message });
      }
    } catch {
      setStatus({ kind: "error", message: "No pudimos enviar el mensaje. Probá de nuevo en un rato." });
    }
  });

  const describedBy = (field: keyof ContactInput) => (errors[field] ? `contact-${field}-error` : undefined);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status.kind === "sent" ? (
        <motion.div
          key="sent"
          role="status"
          data-surface="dark"
          className="flex min-h-[28rem] flex-col items-start justify-center rounded-[4px] bg-noche p-10 text-papel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: transition.enter }}
          exit={{ opacity: 0, transition: transition.exit }}
        >
          {/* El marco del logo se cierra: el mensaje llegó */}
          <svg viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`} className="mb-8 size-16" aria-hidden>
            <motion.rect
              x="10"
              y="10"
              width={MARK_SIZE - 20}
              height={MARK_SIZE - 20}
              fill="none"
              stroke="currentColor"
              strokeWidth="20"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: duration.slower, ease: ease.inOut, delay: 0.1 }}
            />
            <motion.path
              d={ALEPH_PATH}
              fill="currentColor"
              fillRule="evenodd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: duration.slow, ease: ease.out, delay: 1.1 }}
            />
          </svg>
          <p className="font-serif text-4xl">¡Gracias, {status.name}!</p>
          <p className="mt-3 max-w-sm text-papel/80">
            Recibimos tu mensaje. Te responde una persona, en menos de 48 horas hábiles.
          </p>
          <button
            type="button"
            onClick={() => setStatus({ kind: "idle" })}
            className="mt-8 text-sm underline underline-offset-4"
          >
            Enviar otro mensaje
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={onSubmit}
          noValidate
          className="space-y-6"
          exit={{ opacity: 0, y: -12, transition: transition.exit }}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="contact-name" label="Nombre" error={errors.name?.message}>
              <input
                id="contact-name"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={describedBy("name")}
                className={inputClasses(!!errors.name)}
                {...register("name")}
              />
            </Field>
            <Field id="contact-email" label="Mail" error={errors.email?.message}>
              <input
                id="contact-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={describedBy("email")}
                className={inputClasses(!!errors.email)}
                {...register("email")}
              />
            </Field>
          </div>

          <Field id="contact-reason" label="Motivo" error={errors.reason?.message}>
            <select
              id="contact-reason"
              defaultValue=""
              aria-invalid={!!errors.reason}
              aria-describedby={describedBy("reason")}
              className={`${inputClasses(!!errors.reason)} appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8'><path d='M1 1l5 5 5-5' fill='none' stroke='%2334271e' stroke-width='1.5'/></svg>")] bg-[position:right_1.25rem_center] bg-no-repeat`}
              {...register("reason")}
            >
              <option value="" disabled>
                Elegí una opción
              </option>
              {contactReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          <Field id="contact-message" label="Mensaje" error={errors.message?.message}>
            <textarea
              id="contact-message"
              rows={6}
              aria-invalid={!!errors.message}
              aria-describedby={describedBy("message")}
              className={`${inputClasses(!!errors.message)} resize-y`}
              {...register("message")}
            />
          </Field>

          <AnimatePresence>
            {status.kind === "error" && (
              <motion.p
                role="alert"
                className="rounded-[3px] bg-eclipse/15 px-5 py-4 text-sm font-medium text-profundo"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: transition.enter }}
                exit={{ opacity: 0, transition: transition.exit }}
              >
                {status.message}
              </motion.p>
            )}
          </AnimatePresence>

          <Button type="submit" disabled={isSubmitting} icon={<ArrowIcon width={18} />}>
            {isSubmitting ? "Enviando…" : "Enviar mensaje"}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
