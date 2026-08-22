import { createFileRoute, Link } from "@tanstack/react-router";
import { useSite } from "@/components/site-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/about/")({
  component: AboutPage,
  head: () => ({ meta: [{ title: "Our story — Aarohan Education Trust" }] }),
});

function AboutPage() {
  const { org, blocks, timeline } = useSite();
  const values = blocks.values;
  return (
    <article>
      <header className="relative isolate overflow-hidden bg-navy-deep">
        <img src="/images/problem.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="relative mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <p className="text-sm tracking-[0.2em] text-amber-soft uppercase">About</p>
          <h1 className="mt-3 font-display text-5xl text-cream">A trust built so a child's year does not end early</h1>
          <p className="mt-4 text-lg text-paper/80">{org.mission}</p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl text-navy-deep">Why we exist</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink">
          {org.supporting_message} This page is storytelling, not a filing. The origin, trustees, and
          long-term goals below are labelled as demonstration copy until the real board replaces them.
        </p>
        <h2 className="mt-12 font-display text-3xl text-navy-deep">Mission</h2>
        <p className="mt-3 text-lg text-ink">{org.mission}</p>
        <h2 className="mt-12 font-display text-3xl text-navy-deep">Vision</h2>
        <p className="mt-3 text-lg text-ink">{org.vision}</p>
        {values?.body ? (
          <>
            <h2 className="mt-12 font-display text-3xl text-navy-deep">{values.title}</h2>
            <p className="mt-3 text-lg text-ink">{values.body}</p>
          </>
        ) : null}
        <h2 className="mt-12 font-display text-3xl text-navy-deep">A timeline</h2>
        <ol className="mt-8 space-y-8 border-l border-line pl-6">
          {timeline.map((t) => (
            <li key={t.id}>
              <p className="text-xs tracking-[0.16em] text-amber-deep uppercase">{t.year}</p>
              <h3 className="mt-1 font-display text-2xl text-navy">{t.title}</h3>
              <p className="mt-2 text-ink-soft">{t.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/about/founder">Founder</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/about/governance">Governance</Link>
          </Button>
          <Button asChild variant="amber">
            <Link to="/donate">Donate</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
