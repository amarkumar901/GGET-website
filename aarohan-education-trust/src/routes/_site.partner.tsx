import { createFileRoute, Link } from "@tanstack/react-router";
import { PartnershipForm } from "@/components/forms/partnership-form";

export const Route = createFileRoute("/_site/partner")({
  component: PartnerPage,
  head: () => ({ meta: [{ title: "Partner — Aarohan Education Trust" }] }),
});

function PartnerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Partners</p>
      <h1 className="mt-2 font-display text-5xl text-navy-deep">Organisations that want to help</h1>
      <p className="mt-4 text-lg text-ink">
        Foundations, schools, and other trusts can support learning centres, materials, or
        scholarships. This is a conversation, not a prospectus of legal claims.
      </p>
      <ul className="mt-8 list-disc space-y-2 pl-5 text-ink">
        <li>Programme grants for a named campaign</li>
        <li>Employee volunteering days</li>
        <li>In-kind materials, never unsolicited dumps of expired stock</li>
        <li>Professional services (audit, legal, design) as agreed</li>
      </ul>
      <p className="mt-6 text-sm text-ink-soft">
        If you are writing as a company CSR team, the{" "}
        <Link to="/csr" className="underline">
          CSR page
        </Link>{" "}
        is the better starting point.
      </p>
      <div className="mt-12 rounded-2xl bg-cream p-6 shadow-card">
        <PartnershipForm />
      </div>
    </div>
  );
}
