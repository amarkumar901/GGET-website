import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/components/site-context";

export const Route = createFileRoute("/_site/about/vision")({
  component: VisionPage,
  head: () => ({ meta: [{ title: "Vision & mission — Aarohan Education Trust" }] }),
});

function VisionPage() {
  const { org } = useSite();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Vision & mission</p>
      <h1 className="mt-2 font-display text-5xl text-navy-deep">Where this work is pointed</h1>
      <h2 className="mt-12 font-display text-3xl text-navy-deep">Mission</h2>
      <p className="mt-3 text-lg leading-relaxed text-ink">{org.mission}</p>
      <h2 className="mt-12 font-display text-3xl text-navy-deep">Vision</h2>
      <p className="mt-3 text-lg leading-relaxed text-ink">{org.vision}</p>
      <h2 className="mt-12 font-display text-3xl text-navy-deep">The next decade</h2>
      <p className="mt-3 text-lg leading-relaxed text-ink">
        A five-to-ten-year plan belongs to the board. Until they publish one, we will not invent
        targets, centre counts, or scholarship numbers. The shape we are building toward is simple:
        learning that continues, materials that arrive, scholarships that are dull and reliable, and
        reporting a parent could read.
      </p>
    </article>
  );
}
