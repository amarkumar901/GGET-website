import { createFileRoute } from "@tanstack/react-router";
import { listActiveCampaigns } from "@/lib/server/site";
import { CampaignCard } from "@/components/cards";

export const Route = createFileRoute("/_site/campaigns/")({
  loader: () => listActiveCampaigns(),
  staleTime: 0,
  component: CampaignsPage,
  head: () => ({ meta: [{ title: "Campaigns — Aarohan Education Trust" }] }),
});

function CampaignsPage() {
  const campaigns = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Campaigns</p>
      <h1 className="mt-2 font-display text-5xl text-navy-deep">Current initiatives</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        Raised amounts and donor counts come from verified successful donations. Draft campaigns never
        appear here.
      </p>
      {campaigns.length === 0 ? (
        <p className="mt-12 text-ink-soft">No active campaigns yet. You can still give general support.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}