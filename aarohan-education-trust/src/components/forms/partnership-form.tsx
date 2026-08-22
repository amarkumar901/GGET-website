import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { submitContact } from "@/lib/server/forms";
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

export function PartnershipForm({ interestPlaceholder }: { interestPlaceholder?: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function check(fd: FormData): FieldErrors {
    const next: FieldErrors = {};
    const name = validateName(String(fd.get("full_name") || ""), "Name");
    if (name) next.full_name = name;
    const org = validateShortText(String(fd.get("organisation") || ""), "Organisation", 160, true);
    if (org) next.organisation = org;
    const designation = validateShortText(String(fd.get("designation") || ""), "Designation", 120);
    if (designation) next.designation = designation;
    const email = validateEmail(String(fd.get("email") || ""));
    if (email) next.email = email;
    const phone = validatePhone(String(fd.get("phone") || ""));
    if (phone) next.phone = phone;
    const interest = validateShortText(String(fd.get("partnership_interest") || ""), "Partnership interest", 160);
    if (interest) next.partnership_interest = interest;
    const message = validateMessage(String(fd.get("message") || ""), { required: true, min: 10 });
    if (message) next.message = message;
    return next;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
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
      await submitContact({
        data: {
          kind: "partnership",
          full_name: String(fd.get("full_name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          organisation: String(fd.get("organisation") || ""),
          designation: String(fd.get("designation") || ""),
          partnership_interest: String(fd.get("partnership_interest") || ""),
          message: String(fd.get("message") || ""),
          honeypot: String(fd.get("company") || ""),
        },
      });
      setDone(true);
    } catch (err) {
      toast.error(friendlyCaughtError(err, "Could not send"));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <p>Thank you. We will reply from the trust email.</p>;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
      <Field label="Name" error={errors.full_name}>
        <Input name="full_name" required maxLength={120} autoComplete="name" aria-invalid={Boolean(errors.full_name)} />
      </Field>
      <Field label="Organisation" error={errors.organisation}>
        <Input name="organisation" required maxLength={160} aria-invalid={Boolean(errors.organisation)} />
      </Field>
      <Field label="Designation" error={errors.designation}>
        <Input name="designation" maxLength={120} aria-invalid={Boolean(errors.designation)} />
      </Field>
      <Field label="Email" error={errors.email}>
        <Input name="email" type="email" required maxLength={160} autoComplete="email" aria-invalid={Boolean(errors.email)} />
      </Field>
      <Field label="Phone" error={errors.phone}>
        <Input name="phone" maxLength={15} inputMode="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} />
      </Field>
      <Field label="Partnership interest" error={errors.partnership_interest}>
        <Input
          name="partnership_interest"
          maxLength={160}
          placeholder={interestPlaceholder || "Grant / volunteering / in-kind"}
          aria-invalid={Boolean(errors.partnership_interest)}
        />
      </Field>
      <Field label="Message" error={errors.message}>
        <Textarea name="message" required maxLength={4000} aria-invalid={Boolean(errors.message)} />
      </Field>
      <div className="hidden" aria-hidden>
        <input name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}