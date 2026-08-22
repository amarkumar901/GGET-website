import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCampaignBySlug } from "@/lib/server/site";
import { Button } from "@/components/ui/button";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { formatInrCompact, formatPercent } from "@/lib/money";
import { ShareRow } from "@/components/share-row";

export const Route = createFileRoute("/_site/campaigns/$slug")({
  staleTime: 0,
  loader: async ({ params }) => {
    const campaign = await getCampaignBySlug({ data: { slug: params.slug } });
    if (!campaign) throw notFound();
    return campaign;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? "Campaign"} — Aarohan` }],
  }),
  component: CampaignPage,
});

function CampaignPage() {
  const c = Route.useLoaderData();
  return (
    <article>
      <header className="relative isolate min-h-[46vh] overflow-hidden bg-navy-deep">
        {c.hero_image ? (
          <img src={c.hero_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        ) : null}
        <div className="relative mx-auto flex min-h-[46vh] max-w-6xl items-end px-4 py-16 sm:px-6">
          <div>
            <Badge tone="amber">{c.status}</Badge>
            <h1 className="mt-3 font-display text-5xl text-cream">{c.title}</h1>
            <p className="mt-3 max-w-2xl text-lg text-paper/80">{c.short_description}</p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ProgressBar value={c.percent} />
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
          <span className="tabular-nums font-medium text-navy">
            {formatInrCompact(c.raised_paise)} raised of {formatInrCompact(c.goal_amount_paise)}
          </span>
          <span className="text-ink-soft">
            {c.donor_count} donor{c.donor_count === 1 ? "" : "s"} · {formatPercent(c.percent)}
          </span>
        </div>
        {c.end_date ? <p className="mt-2 text-sm text-ink-soft">Closes {c.end_date}</p> : null}
        <div className="mt-8 space-y-4 text-lg leading-relaxed text-ink">
          {c.description.split("\n\n").map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>
        <Button asChild variant="amber" className="mt-10">
          <Link to="/donate" search={{ campaign: c.slug }}>
            Donate to this campaign
          </Link>
        </Button>
        <ShareRow title={c.title} />
      </div>
    </article>
  );
}
