import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { submitVolunteer } from "@/lib/server/forms";
import { track } from "@/lib/analytics";
import {
  friendlyCaughtError,
  hasErrors,
  validateEmail,
  validateMessage,
  validateName,
  validatePhone,
  validateShortText,
  validateCityOrState,
  type FieldErrors,
} from "@/lib/validation";

export const Route = createFileRoute("/_site/volunteer")({
  component: VolunteerPage,
  head: () => ({ meta: [{ title: "Volunteer — Aarohan Education Trust" }] }),
});

function VolunteerPage() {
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
    const city = validateCityOrState(String(fd.get("city") || ""), "City");
    if (city) next.city = city;
    const profession = validateShortText(String(fd.get("profession") || ""), "Profession", 120);
    if (profession) next.profession = profession;
    const interest = validateShortText(String(fd.get("area_of_interest") || ""), "Area of interest", 160);
    if (interest) next.area_of_interest = interest;
    const availability = validateShortText(String(fd.get("availability") || ""), "Availability", 160);
    if (availability) next.availability = availability;
    const message = validateMessage(String(fd.get("message") || ""), { required: false, min: 0 });
    if (message) next.message = message;
    if (fd.get("consent") !== "on") next.consent = "Please confirm you consent to being contacted.";
    return next;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = check(fd);
    setErrors(next);
    if (hasErrors(next)) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setBusy(true);
    try {
      await submitVolunteer({
        data: {
          full_name: String(fd.get("full_name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          city: String(fd.get("city") || ""),
          profession: String(fd.get("profession") || ""),
          area_of_interest: String(fd.get("area_of_interest") || ""),
          availability: String(fd.get("availability") || ""),
          message: String(fd.get("message") || ""),
          consent: fd.get("consent") === "on",
          honeypot: String(fd.get("company") || ""),
        },
      });
      track("volunteer_form_submitted");
      setDone(true);
    } catch (err) {
      toast.error(friendlyCaughtError(err, "Could not send"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <header className="relative isolate overflow-hidden bg-navy-deep">
        <img src="/images/volunteers.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="relative mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <p className="text-sm tracking-[0.18em] text-amber-soft uppercase">Get involved</p>
          <h1 className="mt-2 font-display text-5xl text-cream">Give hours, not only rupees</h1>
          <p className="mt-4 text-lg text-paper/80">
            Facilitation, kit packing, documentation, design, accounts — tell us what you can offer.
            We will not publish volunteer names without asking.
          </p>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl text-navy-deep">Where help is useful</h2>
          <ul className="mt-6 space-y-4 text-ink">
            <li>
              <strong>Learning support</strong> — sitting with a small group, never replacing a teacher.
            </li>
            <li>
              <strong>Materials</strong> — assembling kits with lists from educators.
            </li>
            <li>
              <strong>Operations</strong> — accounts, documentation, translation.
            </li>
            <li>
              <strong>Professional skills</strong> — law, audit, photography with consent, design.
            </li>
          </ul>
        </div>
        <div className="rounded-2xl bg-cream p-6 shadow-card">
          {done ? (
            <p className="text-lg text-navy">Thank you. We have your enquiry and will write back.</p>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
              <Field label="Name" error={errors.full_name}>
                <Input name="full_name" required maxLength={120} autoComplete="name" aria-invalid={Boolean(errors.full_name)} />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input name="email" type="email" required maxLength={160} autoComplete="email" aria-invalid={Boolean(errors.email)} />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <Input name="phone" maxLength={15} inputMode="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} />
              </Field>
              <Field label="City" error={errors.city}>
                <Input name="city" maxLength={80} aria-invalid={Boolean(errors.city)} />
              </Field>
              <Field label="Profession" error={errors.profession}>
                <Input name="profession" maxLength={120} aria-invalid={Boolean(errors.profession)} />
              </Field>
              <Field label="Area of interest" error={errors.area_of_interest}>
                <Input name="area_of_interest" maxLength={160} aria-invalid={Boolean(errors.area_of_interest)} />
              </Field>
              <Field label="Availability" error={errors.availability}>
                <Input name="availability" maxLength={160} placeholder="Weekends / weekday evenings" aria-invalid={Boolean(errors.availability)} />
              </Field>
              <Field label="Message" error={errors.message}>
                <Textarea name="message" maxLength={4000} aria-invalid={Boolean(errors.message)} />
              </Field>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="consent" required className="mt-1" />
                I consent to the trust contacting me about volunteering. I have read the privacy note.
              </label>
              {errors.consent ? (
                <p className="text-xs text-danger" role="alert">
                  {errors.consent}
                </p>
              ) : null}
              <div className="hidden" aria-hidden>
                <input name="company" tabIndex={-1} autoComplete="off" />
              </div>
              <Button type="submit" variant="navy" disabled={busy}>
                {busy ? "Sending…" : "Submit"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}