import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/components/site-context";
import { ProgramCard } from "@/components/cards";

export const Route = createFileRoute("/_site/work/")({
  component: WorkPage,
  head: () => ({ meta: [{ title: "Our work — Aarohan Education Trust" }] }),
});

function WorkPage() {
  const { programs } = useSite();
  return (
    <div>
      <header className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Our work</p>
        <h1 className="mt-2 max-w-2xl font-display text-5xl text-navy-deep">
          Programmes, not slogans
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          Each programme page is stored in the CMS. What you read here can be rewritten by an
          administrator without touching the code.
        </p>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:px-6 md:grid-cols-3">
        {programs.map((p) => (
          <ProgramCard key={p.id} program={p} />
        ))}
      </div>
    </div>
  );
}
