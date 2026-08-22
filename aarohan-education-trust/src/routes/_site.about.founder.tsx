import { createFileRoute, Link } from "@tanstack/react-router";
import { useSite } from "@/components/site-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/about/founder")({
  component: FounderPage,
  head: () => ({ meta: [{ title: "Founder — Aarohan Education Trust" }] }),
});

function FounderPage() {
  const { org, blocks, timeline } = useSite();
  const bio = blocks.founder_bio;
  return (
    <article className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <img
          src={org.founder_image}
          alt={`${org.founder_name} — demonstration portrait`}
          className="photo aspect-[2/3] w-full rounded-3xl object-cover"
        />
        <p className="mt-3 text-xs text-ink-soft">Demonstration portrait. Replace before public launch.</p>
      </div>
      <div>
        <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Founder</p>
        <h1 className="mt-2 font-display text-5xl text-navy-deep">{org.founder_name}</h1>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink">
          {(bio?.body || "").split("\n\n").map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>
        <ol className="mt-12 space-y-6">
          {timeline.map((t) => (
            <li key={t.id}>
              <p className="text-xs tracking-[0.16em] text-amber-deep uppercase">{t.year}</p>
              <p className="font-medium text-navy">{t.title}</p>
              <p className="text-sm text-ink-soft">{t.body}</p>
            </li>
          ))}
        </ol>
        <Button asChild variant="outline" className="mt-10">
          <Link to="/about">Back to our story</Link>
        </Button>
      </div>
    </article>
  );
}
