import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getProgramBySlug } from "@/lib/server/site";
import { Button } from "@/components/ui/button";
import { CampaignCard, StoryCard } from "@/components/cards";

export const Route = createFileRoute("/_site/work/$slug")({
  loader: async ({ params }) => {
    const data = await getProgramBySlug({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.program.title ?? "Programme"} — Aarohan` }],
  }),
  component: ProgramPage,
});

function ProgramPage() {
  const { program, campaigns, stories } = Route.useLoaderData();
  const paragraphs = program.long_description.split("\n\n");
  return (
    <article>
      <header className="relative isolate min-h-[50vh] overflow-hidden bg-navy-deep">
        {program.cover_image ? (
          <img src={program.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        ) : null}
        <div className="relative mx-auto flex min-h-[50vh] max-w-6xl items-end px-4 py-16 sm:px-6">
          <div>
            <p className="text-sm tracking-[0.18em] text-amber-soft uppercase">Programme</p>
            <h1 className="mt-2 font-display text-5xl text-cream">{program.title}</h1>
            <p className="mt-3 max-w-2xl text-lg text-paper/80">{program.short_description}</p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 24)} className="mt-4 text-lg leading-relaxed text-ink">
            {p}
          </p>
        ))}
        <Button asChild variant="amber" className="mt-10">
          <Link to="/donate" search={{ program: program.slug }}>
            Donate to this work
          </Link>
        </Button>
      </div>
      {program.gallery.length > 0 ? (
        <div className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-3 sm:px-6">
          {program.gallery.map((src) => (
            <img key={src} src={src} alt="" className="photo aspect-[4/3] w-full rounded-2xl object-cover" />
          ))}
        </div>
      ) : null}
      {campaigns.length > 0 ? (
        <section className="bg-cream py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl text-navy-deep">Current campaigns</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {stories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-navy-deep">Stories</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {stories.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
