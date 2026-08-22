import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/privacy")({
  component: LegalPage,
  head: () => ({ meta: [{ title: "Privacy — Aarohan Education Trust" }] }),
});

function LegalPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="rounded-lg bg-amber/15 px-3 py-2 text-sm text-amber-deep">
        Placeholder for legal review. Do not treat this as approved privacy wording.
      </p>
      <h1 className="mt-6 font-display text-4xl text-navy-deep">Privacy policy</h1>
      <div className="mt-6 space-y-4 text-ink">
        <p>
          Aarohan Education Trust collects only what a form actually needs: contact details, donation
          records, and optional PAN or address when you ask for tax-related documentation.
        </p>
        <p>
          Donor information is visible to authorised administrators. It is not queryable by the public
          website. Payment card numbers, CVV, UPI PINs, and bank passwords are never stored here.
        </p>
        <p>
          Analytics, if enabled later, will not receive PAN, payment IDs, or email addresses. Children
          are not identified in public stories without consent flags.
        </p>
        <p>Replace this page after the trust's advisers have reviewed it.</p>
      </div>
    </article>
  );
}
