import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSite } from "@/components/site-context";
import { StoryCard } from "@/components/cards";

export const Route = createFileRoute("/_site/stories/")({
  component: StoriesPage,
  head: () => ({ meta: [{ title: "Stories — Aarohan Education Trust" }] }),
});

function StoriesPage() {
  const { stories, programs } = useSite();
  const [program, setProgram] = useState("all");
  const filtered = useMemo(
    () => (program === "all" ? stories : stories.filter((s) => s.program_id === program)),
    [stories, program],
  );
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Stories</p>
      <h1 className="mt-2 font-display text-5xl text-navy-deep">Written with care for privacy</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        Composite sketches are labelled. Real stories will require consent and will still withhold
        full names, addresses, and school identities.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setProgram("all")}
          className={`h-11 rounded-full px-4 text-sm ${program === "all" ? "bg-navy text-paper" : "bg-paper-2 text-navy"}`}
        >
          All
        </button>
        {programs.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setProgram(p.id)}
            className={`h-11 rounded-full px-4 text-sm ${program === p.id ? "bg-navy text-paper" : "bg-paper-2 text-navy"}`}
          >
            {p.title}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {filtered.map((s) => (
          <StoryCard key={s.id} story={s} />
        ))}
      </div>
    </div>
  );
}
