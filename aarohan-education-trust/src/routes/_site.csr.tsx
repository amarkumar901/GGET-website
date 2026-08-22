import { createFileRoute, Link } from "@tanstack/react-router";
import { PartnershipForm } from "@/components/forms/partnership-form";

export const Route = createFileRoute("/_site/csr")({
  component: CsrPage,
  head: () => ({ meta: [{ title: "CSR — Aarohan Education Trust" }] }),
});

function CsrPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">CSR</p>
      <h1 className="mt-2 font-display text-5xl text-navy-deep">Corporate social responsibility</h1>
      <p className="mt-4 text-lg text-ink">
        Companies that want to support education through a CSR budget can start a conversation here.
        We do not offer legal opinions on whether a contribution qualifies under the Companies Act —
        that sits with your counsel. We can share a programme note, a reporting cadence, and how a
        grant would be earmarked.
      </p>
      <h2 className="mt-10 font-display text-2xl text-navy-deep">Ways a company can work with us</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-ink">
        <li>A programme grant tied to a named campaign or learning centre</li>
        <li>Employee volunteering days, planned with the trust rather than dropped in</li>
        <li>In-kind materials that teachers have actually asked for</li>
        <li>Pro-bono professional services (audit, legal, design) as agreed in writing</li>
      </ul>
      <p className="mt-6 text-sm text-ink-soft">
        Looking for a broader partnership that is not CSR-labelled? Use the{" "}
        <Link to="/partner" className="underline">
          partner page
        </Link>
        .
      </p>
      <div className="mt-12 rounded-2xl bg-cream p-6 shadow-card">
        <h2 className="font-display text-2xl text-navy-deep">CSR enquiry</h2>
        <p className="mt-2 mb-6 text-sm text-ink-soft">
          Tell us who you are and what you would like to explore. We will reply from the trust email.
        </p>
        <PartnershipForm interestPlaceholder="CSR grant / employee volunteering / in-kind" />
      </div>
    </div>
  );
}
