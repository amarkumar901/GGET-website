import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/refund-policy")({
  component: RefundPage,
  head: () => ({ meta: [{ title: "Donation policy — Aarohan Education Trust" }] }),
});

function RefundPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="rounded-lg bg-amber/15 px-3 py-2 text-sm text-amber-deep">
        Placeholder for legal and accounting review. Not an approved refund policy.
      </p>
      <h1 className="mt-6 font-display text-4xl text-navy-deep">Donation & refund policy</h1>
      <div className="mt-6 space-y-4 text-ink">
        <p>
          A donation is recorded as successful only after server-side payment verification. The
          acknowledgement you receive is not Form 10BE unless the trust later attaches official tax
          documentation.
        </p>
        <p>
          Refunds, if offered, will be processed through the original payment route where the payment
          provider allows it. Duplicate webhook events will not create duplicate receipts.
        </p>
        <p>80G language appears on this site only if an administrator enables a valid 80G status.</p>
        <p>Replace this page after advisers have reviewed it.</p>
      </div>
    </article>
  );
}
