import { createFileRoute, Link } from "@tanstack/react-router";
import { useSite } from "@/components/site-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/about/governance")({
  component: GovernancePage,
  head: () => ({ meta: [{ title: "Governance — Aarohan Education Trust" }] }),
});

function GovernancePage() {
  const { org } = useSite();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Governance</p>
      <h1 className="mt-2 font-display text-5xl text-navy-deep">Who is accountable</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink">
        Trustee names, roles, and meeting cadence will be listed here once the board has approved
        publication. We will not invent a governing body for the sake of looking established.
      </p>
      <div className="mt-8 rounded-2xl bg-cream p-6 shadow-card">
        <p className="text-sm text-ink-soft">Managing trustee (placeholder)</p>
        <p className="mt-1 font-display text-2xl text-navy">{org.founder_name}</p>
        <p className="mt-2 text-sm text-ink-soft">Replace with the real board before launch.</p>
      </div>
      <p className="mt-8 text-ink">
        Policies for safeguarding, data, and donations live on the{" "}
        <Link to="/transparency" className="underline">
          transparency
        </Link>{" "}
        page when uploaded.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/transparency/registrations">Registrations</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/transparency/reports">Reports</Link>
        </Button>
      </div>
    </article>
  );
}
