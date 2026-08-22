import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getStoryBySlug } from "@/lib/server/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoryCard } from "@/components/cards";
import { ShareRow } from "@/components/share-row";

export const Route = createFileRoute("/_site/stories/$slug")({
  loader: async ({ params }) => {
    const data = await getStoryBySlug({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.story.title ?? "Story"} — Aarohan` }],
  }),
  component: StoryPage,
});

function StoryPage() {
  const { story, related } = Route.useLoaderData();
  return (
    <article>
      <header className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
        {story.is_composite ? <Badge tone="paper">Composite / placeholder</Badge> : null}
        <h1 className="mt-3 font-display text-4xl text-navy-deep sm:text-5xl">{story.title}</h1>
        <p className="mt-3 text-ink-soft">
          {story.display_name}
          {story.program_title ? ` · ${story.program_title}` : ""}
          {story.published_at ? ` · ${story.published_at}` : ""}
        </p>
      </header>
      {story.cover_image ? (
        <div className="mx-auto mt-8 max-w-4xl px-4 sm:px-6">
          <img src={story.cover_image} alt="" className="photo w-full rounded-3xl object-cover" />
        </div>
      ) : null}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {story.body.split("\n\n").map((p) => (
          <p key={p.slice(0, 24)} className="mt-5 text-lg leading-[1.7] text-ink">
            {p}
          </p>
        ))}
        <ShareRow title={story.title} />
        <Button asChild variant="amber" className="mt-10">
          <Link to="/donate">Support this work</Link>
        </Button>
      </div>
      {related.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="font-display text-2xl text-navy-deep">Related</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
