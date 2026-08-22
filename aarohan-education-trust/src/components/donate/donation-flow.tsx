import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useSite } from "@/components/site-context";
import { formatInrFromPaise, parseRupeeInput, paiseToRupeesInt } from "@/lib/money";
import { track } from "@/lib/analytics";
import {
  completeDemoDonation,
  createDonationOrder,
  failDonation,
  verifyDonationPayment,
} from "@/lib/server/donations";
import { cn } from "@/lib/utils";
import {
  friendlyCaughtError,
  hasErrors,
  validateDonor,
  validateEmail,
  validateName,
  validatePan,
  validatePhone,
  validatePin,
  validateCityOrState,
  validateAddress,
  type FieldErrors,
} from "@/lib/validation";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

const STEPS = ["Amount", "Cause", "Your details", "Review", "Pay"];

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load checkout"));
    document.body.appendChild(s);
  });
}

export function DonationFlow({
  initialCampaign,
  initialAmount,
}: {
  initialCampaign?: string;
  initialAmount?: string;
}) {
  const site = useSite();
  const nav = useNavigate();
  const router = useRouter();
  const { org, flags, donation, campaigns, programs } = site;
  const [step, setStep] = useState(0);
  const [frequency, setFrequency] = useState<"one_time" | "monthly">("one_time");
  const [preset, setPreset] = useState<number | "other">(
    initialAmount ? "other" : donation.preset_paise[1] || donation.preset_paise[0],
  );
  const [other, setOther] = useState(initialAmount || "");
  const [campaignId, setCampaignId] = useState(
    campaigns.find((c) => c.slug === initialCampaign)?.id || "",
  );
  const [programId, setProgramId] = useState("");
  const [donor, setDonor] = useState({
    full_name: "",
    email: "",
    phone: "",
    pan: "",
    address: "",
    city: "",
    state: "",
    pin: "",
    citizenship_category: "indian" as "indian" | "foreign",
    wants_tax_docs: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [pending, setPending] = useState<{
    donationId: string;
    orderId: string;
    accessToken: string;
    amountPaise: number;
    mode: "demo" | "razorpay";
    keyId: string;
  } | null>(null);

  const amountPaise = useMemo(() => {
    if (preset === "other") return parseRupeeInput(other) ?? 0;
    return preset;
  }, [preset, other]);

  const foreignBlocked =
    donor.citizenship_category === "foreign" && !flags.foreign_donations_enabled;

  function setField<K extends keyof typeof donor>(k: K, v: (typeof donor)[K]) {
    setDonor((d) => ({ ...d, [k]: v }));
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((prev) => {
      const next = { ...prev };
      const draft = { ...donor, [k]: v };
      const live = validateDonor(draft);
      if (live[k as string]) next[k as string] = live[k as string];
      else delete next[k as string];
      return next;
    });
  }

  function fieldError(key: string): string | undefined {
    return touched[key] || errors[key] ? errors[key] : undefined;
  }

  async function startPay() {
    const formErrors = validateDonor(donor);
    if (hasErrors(formErrors)) {
      setErrors(formErrors);
      setTouched(Object.fromEntries(Object.keys(formErrors).map((k) => [k, true])));
      setStep(2);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setBusy(true);
    track("donation_started", { amount_rupees: paiseToRupeesInt(amountPaise) });
    try {
      const selected = campaigns.find((c) => c.id === campaignId);
      const res = await createDonationOrder({
        data: {
          amount_paise: amountPaise,
          frequency,
          campaign_id: campaignId || null,
          campaign_slug: selected?.slug || initialCampaign || null,
          program_id: programId || null,
          honeypot,
          donor: { ...donor, wants_tax_docs: donor.wants_tax_docs },
        },
      });
      setPending(res);
      if (res.mode === "demo") {
        setDemoOpen(true);
        setBusy(false);
        return;
      }
      await loadRazorpay();
      const Rz = window.Razorpay;
      if (!Rz) throw new Error("Checkout unavailable");
      const checkout = new Rz({
        key: res.keyId,
        amount: res.amountPaise,
        currency: res.currency,
        name: res.trustName,
        description: res.description,
        order_id: res.orderId,
        prefill: { name: donor.full_name, email: donor.email, contact: donor.phone },
        theme: { color: "#1B2A4A" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyDonationPayment({
              data: {
                donationId: res.donationId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });
            track("donation_completed", { amount_rupees: paiseToRupeesInt(res.amountPaise) });
            await router.invalidate();
            void nav({ to: "/donation/success", search: { t: res.accessToken } });
          } catch (e) {
            track("donation_failed");
            toast.error(friendlyCaughtError(e, "Could not verify payment"));
            void nav({ to: "/donation/failed", search: { t: res.accessToken } });
          }
        },
        modal: {
          ondismiss: () => {
            void failDonation({
              data: { donationId: res.donationId, accessToken: res.accessToken, reason: "dismissed" },
            });
            setBusy(false);
          },
        },
      });
      checkout.open();
    } catch (e) {
      toast.error(friendlyCaughtError(e, "Could not start donation"));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDemo() {
    if (!pending) return;
    setBusy(true);
    try {
      await completeDemoDonation({
        data: { donationId: pending.donationId, accessToken: pending.accessToken },
      });
      track("donation_completed", { demo: true });
      await router.invalidate();
      void nav({ to: "/donation/success", search: { t: pending.accessToken } });
    } catch (e) {
      toast.error(friendlyCaughtError(e, "Could not complete demonstration payment"));
    } finally {
      setBusy(false);
    }
  }

  function closeDemo() {
    setDemoOpen(false);
    if (pending) {
      void failDonation({
        data: {
          donationId: pending.donationId,
          accessToken: pending.accessToken,
          reason: "demo_cancel",
        },
      });
    }
  }

  function goNext() {
    if (step === 0) {
      if (amountPaise < donation.min_paise) {
        toast.error(`Minimum donation is ${formatInrFromPaise(donation.min_paise)}.`);
        return;
      }
      track("donate_clicked", { amount_rupees: paiseToRupeesInt(amountPaise) });
    }
    if (step === 2) {
      const formErrors = validateDonor(donor);
      setErrors(formErrors);
      setTouched({
        full_name: true,
        email: true,
        phone: true,
        pan: true,
        address: true,
        city: true,
        state: true,
        pin: true,
      });
      if (hasErrors(formErrors)) return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="relative z-10 mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium tracking-[0.18em] text-amber-deep uppercase">Donate</p>
      <h1 className="mt-2 font-display text-4xl text-navy-deep">Give with a clear record</h1>
      <p className="mt-3 text-ink-soft">
        {org.trust_name}. Payments are verified on the server before a receipt is issued.
      </p>

      <ol className="mt-8 flex gap-1 text-xs text-ink-soft" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <button
              type="button"
              disabled={i > step}
              className={cn(
                "w-full rounded-full py-1 text-center",
                i === step ? "bg-navy text-paper" : i < step ? "bg-navy/70 text-paper" : "bg-paper-2",
                i <= step ? "cursor-pointer" : "cursor-default",
              )}
              onClick={() => {
                if (i <= step) setStep(i);
              }}
            >
              {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl bg-cream p-5 shadow-card sm:p-8">
        {step === 0 ? (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-navy">How often</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={cn(
                    "h-12 rounded-lg border text-sm font-medium",
                    frequency === "one_time" ? "border-navy bg-navy text-paper" : "border-line",
                  )}
                  onClick={() => setFrequency("one_time")}
                >
                  One-time
                </button>
                <button
                  type="button"
                  disabled={!flags.monthly_donations_enabled}
                  className={cn(
                    "h-12 rounded-lg border text-sm font-medium disabled:opacity-40",
                    frequency === "monthly" ? "border-navy bg-navy text-paper" : "border-line",
                  )}
                  onClick={() => flags.monthly_donations_enabled && setFrequency("monthly")}
                >
                  Monthly
                </button>
              </div>
              {!flags.monthly_donations_enabled ? (
                <p className="mt-2 text-xs text-ink-soft">
                  Monthly giving will appear here once recurring payments are configured.
                </p>
              ) : null}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-navy">Amount</p>
              <div className="relative z-10 grid grid-cols-3 gap-2">
                {donation.preset_paise.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={cn(
                      "relative z-10 h-12 rounded-lg border text-sm font-medium tabular-nums",
                      preset === p ? "border-navy bg-navy text-paper" : "border-line bg-cream",
                    )}
                    onClick={() => setPreset(p)}
                  >
                    {formatInrFromPaise(p)}
                  </button>
                ))}
                <button
                  type="button"
                  className={cn(
                    "relative z-10 h-12 rounded-lg border text-sm font-medium",
                    preset === "other" ? "border-navy bg-navy text-paper" : "border-line bg-cream",
                  )}
                  onClick={() => setPreset("other")}
                >
                  Other
                </button>
              </div>
              {preset === "other" ? (
                <div className="mt-3">
                  <Field
                    label="Amount in rupees"
                    error={
                      other && (parseRupeeInput(other) ?? 0) < donation.min_paise
                        ? `Minimum is ${formatInrFromPaise(donation.min_paise)} in whole rupees.`
                        : undefined
                    }
                  >
                    <Input
                      inputMode="numeric"
                      value={other}
                      maxLength={7}
                      onChange={(e) => setOther(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
                      placeholder="2500"
                      aria-invalid={Boolean(other && (parseRupeeInput(other) ?? 0) < donation.min_paise)}
                    />
                  </Field>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <Field label="Campaign (optional)">
              <select
                className="h-11 w-full rounded-lg bg-cream px-3 shadow-[0_0_0_1px_rgba(42,36,28,0.12)]"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              >
                <option value="">General support</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Programme (optional)">
              <select
                className="h-11 w-full rounded-lg bg-cream px-3 shadow-[0_0_0_1px_rgba(42,36,28,0.12)]"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
              >
                <option value="">No specific programme</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <Field label="Full name" error={fieldError("full_name")}>
              <Input
                value={donor.full_name}
                maxLength={120}
                autoComplete="name"
                aria-invalid={Boolean(fieldError("full_name"))}
                onBlur={() => {
                  setTouched((t) => ({ ...t, full_name: true }));
                  const msg = validateName(donor.full_name, "Full name");
                  setErrors((e) => ({ ...e, full_name: msg || "" }));
                }}
                onChange={(e) => setField("full_name", e.target.value)}
              />
            </Field>
            <Field label="Email" error={fieldError("email")}>
              <Input
                type="email"
                value={donor.email}
                maxLength={160}
                autoComplete="email"
                aria-invalid={Boolean(fieldError("email"))}
                onBlur={() => {
                  setTouched((t) => ({ ...t, email: true }));
                  const msg = validateEmail(donor.email);
                  setErrors((e) => ({ ...e, email: msg || "" }));
                }}
                onChange={(e) => setField("email", e.target.value)}
              />
            </Field>
            <Field label="Phone" error={fieldError("phone")} hint="10-digit Indian mobile, optional.">
              <Input
                value={donor.phone}
                maxLength={15}
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(fieldError("phone"))}
                onBlur={() => {
                  setTouched((t) => ({ ...t, phone: true }));
                  const msg = validatePhone(donor.phone);
                  setErrors((e) => ({ ...e, phone: msg || "" }));
                }}
                onChange={(e) => setField("phone", e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 15))}
              />
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy">Citizenship category</legend>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cit"
                    checked={donor.citizenship_category === "indian"}
                    onChange={() => setField("citizenship_category", "indian")}
                  />
                  Indian citizen / entity
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cit"
                    checked={donor.citizenship_category === "foreign"}
                    onChange={() => setField("citizenship_category", "foreign")}
                  />
                  Foreign citizen / entity
                </label>
              </div>
            </fieldset>
            {foreignBlocked ? (
              <div className="rounded-lg bg-paper-2 p-4 text-sm text-ink">
                {flags.foreign_donation_message}{" "}
                <Link to="/contact" className="underline">
                  Contact the trust
                </Link>
                .
              </div>
            ) : null}
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={donor.wants_tax_docs}
                onChange={(e) => setField("wants_tax_docs", e.target.checked)}
              />
              <span>
                Would you like tax-related documentation where applicable?
                {!flags.is_80g_approved ? (
                  <span className="mt-1 block text-ink-soft">
                    80G deductions are not advertised. This trust has not enabled 80G claims on this
                    website.
                  </span>
                ) : null}
              </span>
            </label>
            {donor.wants_tax_docs ? (
              <>
                <Field
                  label="PAN"
                  hint="10 characters, ABCDE1234F. Stored for accounting. Masked in the admin list."
                  error={fieldError("pan")}
                >
                  <Input
                    value={donor.pan}
                    maxLength={10}
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={Boolean(fieldError("pan"))}
                    onChange={(e) =>
                      setField("pan", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))
                    }
                    onBlur={() => {
                      setTouched((t) => ({ ...t, pan: true }));
                      const msg = validatePan(donor.pan);
                      setErrors((er) => ({ ...er, pan: msg || "" }));
                    }}
                  />
                </Field>
                <Field label="Address" error={fieldError("address")}>
                  <Textarea
                    className="min-h-20"
                    value={donor.address}
                    maxLength={200}
                    aria-invalid={Boolean(fieldError("address"))}
                    onChange={(e) => setField("address", e.target.value.slice(0, 200))}
                    onBlur={() => {
                      setTouched((t) => ({ ...t, address: true }));
                      const msg = validateAddress(donor.address);
                      setErrors((er) => ({ ...er, address: msg || "" }));
                    }}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="City" error={fieldError("city")}>
                    <Input
                      value={donor.city}
                      maxLength={80}
                      aria-invalid={Boolean(fieldError("city"))}
                      onChange={(e) => setField("city", e.target.value)}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, city: true }));
                        const msg = validateCityOrState(donor.city, "City");
                        setErrors((er) => ({ ...er, city: msg || "" }));
                      }}
                    />
                  </Field>
                  <Field label="State" error={fieldError("state")}>
                    <Input
                      value={donor.state}
                      maxLength={80}
                      aria-invalid={Boolean(fieldError("state"))}
                      onChange={(e) => setField("state", e.target.value)}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, state: true }));
                        const msg = validateCityOrState(donor.state, "State");
                        setErrors((er) => ({ ...er, state: msg || "" }));
                      }}
                    />
                  </Field>
                  <Field label="PIN" error={fieldError("pin")}>
                    <Input
                      value={donor.pin}
                      maxLength={6}
                      inputMode="numeric"
                      aria-invalid={Boolean(fieldError("pin"))}
                      onChange={(e) => setField("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, pin: true }));
                        const msg = validatePin(donor.pin);
                        setErrors((er) => ({ ...er, pin: msg || "" }));
                      }}
                    />
                  </Field>
                </div>
              </>
            ) : null}
            <div className="hidden" aria-hidden>
              <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Amount</dt>
              <dd className="tabular-nums font-medium">{formatInrFromPaise(amountPaise)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Type</dt>
              <dd>{frequency === "monthly" ? "Monthly" : "One-time"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Towards</dt>
              <dd className="text-right">
                {campaigns.find((c) => c.id === campaignId)?.title ||
                  programs.find((p) => p.id === programId)?.title ||
                  "General support"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Trust</dt>
              <dd>{org.trust_name}</dd>
            </div>
            <p className="pt-2 text-ink-soft">
              Checkout is processed by Razorpay when live keys are configured. Without keys, a labelled
              demonstration payment is used so you can test receipts — no real money moves.
            </p>
          </dl>
        ) : null}

        <div className="mt-8 flex gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < 3 ? (
            <Button
              type="button"
              variant="navy"
              className="ml-auto"
              disabled={step === 2 && foreignBlocked}
              onClick={goNext}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="amber"
              className="ml-auto"
              disabled={busy || foreignBlocked}
              onClick={() => void startPay()}
            >
              {busy ? "Starting…" : "Proceed to pay"}
            </Button>
          )}
        </div>
      </div>

      {demoOpen && pending
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] grid place-items-center bg-navy-deep/50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="demo-checkout-title"
              onClick={closeDemo}
            >
              <div
                className="w-full max-w-md rounded-2xl bg-paper p-6 shadow-card"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs font-medium tracking-[0.16em] text-amber-deep uppercase">
                  Demonstration checkout
                </p>
                <h2 id="demo-checkout-title" className="mt-2 font-display text-2xl text-navy-deep">
                  No real payment will be taken
                </h2>
                <p className="mt-3 text-sm text-ink">
                  Razorpay keys are not configured, so this completes a server-verified demo donation of{" "}
                  {formatInrFromPaise(pending.amountPaise)} and issues a demonstration receipt.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={closeDemo}>
                    Cancel
                  </Button>
                  <Button variant="amber" className="ml-auto" disabled={busy} onClick={() => void confirmDemo()}>
                    {busy ? "Recording…" : "Confirm demo payment"}
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}