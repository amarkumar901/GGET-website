import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useSite } from "@/components/site-context";
import { submitContact } from "@/lib/server/forms";
import { track } from "@/lib/analytics";
import {
  friendlyCaughtError,
  hasErrors,
  validateEmail,
  validateMessage,
  validateName,
  validatePhone,
  validateShortText,
  type FieldErrors,
} from "@/lib/validation";

export const Route = createFileRoute("/_site/contact")({
  component: ContactPage,
  head: () => ({ meta: [{ title: "Contact — Aarohan Education Trust" }] }),
});

function ContactPage() {
  const { org } = useSite();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function check(fd: FormData): FieldErrors {
    const next: FieldErrors = {};
    const name = validateName(String(fd.get("full_name") || ""), "Name");
    if (name) next.full_name = name;
    const email = validateEmail(String(fd.get("email") || ""));
    if (email) next.email = email;
    const phone = validatePhone(String(fd.get("phone") || ""));
    if (phone) next.phone = phone;
    const subject = validateShortText(String(fd.get("subject") || ""), "Subject", 160);
    if (subject) next.subject = subject;
    const message = validateMessage(String(fd.get("message") || ""), { required: true, min: 10 });
    if (message) next.message = message;
    return next;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const next = check(fd);
    setErrors(next);
    if (hasErrors(next)) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setBusy(true);
    try {
      await submitContact({
        data: {
          kind: "contact",
          full_name: String(fd.get("full_name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          subject: String(fd.get("subject") || ""),
          message: String(fd.get("message") || ""),
          honeypot: String(fd.get("company") || ""),
        },
      });
      track("contact_form_submitted");
      setDone(true);
    } catch (err) {
      toast.error(friendlyCaughtError(err, "Could not send"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
      <div>
        <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Contact</p>
        <h1 className="mt-2 font-display text-5xl text-navy-deep">Write to the trust</h1>
        <p className="mt-4 text-lg text-ink-soft">
          {org.location}
          <br />
          <a className="underline" href={`mailto:${org.email}`}>
            {org.email}
          </a>
          <br />
          {org.phone}
        </p>
      </div>
      <div className="rounded-2xl bg-cream p-6 shadow-card">
        {done ? (
          <p>Thank you. We have your message.</p>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
            <Field label="Name" error={errors.full_name}>
              <Input name="full_name" maxLength={120} autoComplete="name" required aria-invalid={Boolean(errors.full_name)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input name="email" type="email" maxLength={160} autoComplete="email" required aria-invalid={Boolean(errors.email)} />
            </Field>
            <Field label="Phone (optional)" error={errors.phone}>
              <Input name="phone" maxLength={15} inputMode="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} />
            </Field>
            <Field label="Subject" error={errors.subject}>
              <Input name="subject" maxLength={160} aria-invalid={Boolean(errors.subject)} />
            </Field>
            <Field label="Message" error={errors.message}>
              <Textarea name="message" required maxLength={4000} aria-invalid={Boolean(errors.message)} />
            </Field>
            <div className="hidden" aria-hidden>
              <input name="company" tabIndex={-1} autoComplete="off" />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}