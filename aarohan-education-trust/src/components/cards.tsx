import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { formatInrCompact, formatPercent } from "@/lib/money";
import type { CampaignPublic, Program, Story } from "@/lib/types";

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      to="/work/$slug"
      params={{ slug: program.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-cream shadow-card transition-[box-shadow,transform] duration-200 hover:shadow-card-hover"
    >
      <div className="aspect-[4/3] overflow-hidden">
        {program.cover_image ? (
          <img
            src={program.cover_image}
            alt=""
            className="photo h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full bg-paper-2" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl text-navy-deep">{program.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{program.short_description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-deep">
          Learn more <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export function CampaignCard({ campaign }: { campaign: CampaignPublic }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-cream shadow-card">
      <div className="aspect-[16/9] overflow-hidden">
        {campaign.hero_image ? (
          <img src={campaign.hero_image} alt="" className="photo h-full w-full object-cover" />
        ) : (
          <div className="h-full bg-paper-2" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {campaign.status === "active" ? <Badge tone="sage">Active</Badge> : <Badge>{campaign.status}</Badge>}
        <h3 className="mt-2 font-display text-2xl text-navy-deep">{campaign.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{campaign.short_description}</p>
        <div className="mt-4">
          <ProgressBar value={campaign.percent} />
          <div className="mt-2 flex justify-between text-sm">
            <span className="tabular-nums font-medium text-navy">
              {formatInrCompact(campaign.raised_paise)} raised
            </span>
            <span className="text-ink-soft">of {formatInrCompact(campaign.goal_amount_paise)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            {campaign.donor_count} donor{campaign.donor_count === 1 ? "" : "s"} · {formatPercent(campaign.percent)}
          </p>
        </div>
        <div className="mt-5 flex gap-2">
          <Link
            to="/donate"
            search={{ campaign: campaign.slug }}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-amber text-sm font-medium text-navy-deep"
          >
            Donate
          </Link>
          <Link
            to="/campaigns/$slug"
            params={{ slug: campaign.slug }}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-navy/15 text-sm font-medium text-navy"
          >
            Read more
          </Link>
        </div>
      </div>
    </article>
  );
}

export function StoryCard({ story }: { story: Story }) {
  return (
    <Link
      to="/stories/$slug"
      params={{ slug: story.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-cream shadow-card"
    >
      <div className="aspect-[4/3] overflow-hidden">
        {story.cover_image ? (
          <img
            src={story.cover_image}
            alt=""
            className="photo h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full bg-paper-2" />
        )}
      </div>
      <div className="p-5">
        {story.is_composite ? <Badge tone="paper">Composite / placeholder</Badge> : null}
        <h3 className="mt-2 font-display text-2xl text-navy-deep">{story.title}</h3>
        <p className="mt-1 text-sm text-ink-soft">{story.display_name}</p>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink">{story.excerpt}</p>
      </div>
    </Link>
  );
}
