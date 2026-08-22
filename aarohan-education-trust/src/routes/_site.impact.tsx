import { createFileRoute, Link } from "@tanstack/react-router";
import { useSite } from "@/components/site-context";
import { StoryCard } from "@/components/cards";

export const Route = createFileRoute("/_site/impact")({
  component: ImpactPage,
  head: () => ({ meta: [{ title: "Impact — Aarohan Education Trust" }] }),
});

function ImpactPage() {
  const { metrics, stories, programs, timeline, blocks } = useSite();
  return (
    <div>
      <header className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Impact</p>
        <h1 className="mt-2 font-display text-5xl text-navy-deep">What we will measure — when it is real</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          This page is designed as an impact record, not a corporate dashboard. Empty figures mean
          the trust has not yet published verified numbers. That is honest, not unfinished design.
        </p>
      </header>
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
          {metrics.map((m) => (
            <div key={m.id} className="text-center">
              <p className="font-display text-4xl tabular-nums text-navy-deep">{m.value_text}</p>
              <p className="mt-1 text-sm text-ink-soft">{m.label}</p>
              {m.is_placeholder ? (
                <p className="mt-1 text-[11px] tracking-wide text-ink-soft uppercase">Placeholder</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl text-navy-deep">Programmes</h2>
        <ul className="mt-6 space-y-3">
          {programs.map((p) => (
            <li key={p.id}>
              <Link to="/work/$slug" params={{ slug: p.slug }} className="text-lg text-navy underline-offset-4 hover:underline">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
        <h2 className="mt-16 font-display text-3xl text-navy-deep">A working timeline</h2>
        <ol className="mt-8 space-y-6 border-l border-line pl-6">
          {timeline.map((t) => (
            <li key={t.id}>
              <p className="text-xs tracking-[0.16em] text-amber-deep uppercase">{t.year}</p>
              <p className="font-medium text-navy">{t.title}</p>
              <p className="text-sm text-ink-soft">{t.body}</p>
            </li>
          ))}
        </ol>
        {blocks.funds_use?.body ? (
          <p className="mt-12 max-w-2xl text-ink-soft">{blocks.funds_use.body}</p>
        ) : null}
      </section>
      {stories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="font-display text-3xl text-navy-deep">Stories</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {stories.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
