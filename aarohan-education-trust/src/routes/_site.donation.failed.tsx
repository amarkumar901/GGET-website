import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type Search = { t?: string };

export const Route = createFileRoute("/_site/donation/failed")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    t: typeof raw.t === "string" ? raw.t : undefined,
  }),
  component: FailedPage,
  head: () => ({ meta: [{ title: "Payment not completed — Aarohan" }] }),
});

function FailedPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl text-navy-deep">The payment did not complete</h1>
      <p className="mt-4 text-ink-soft">
        Nothing has been marked successful. You can try again, or write to us if money left your
        account and you do not receive an acknowledgement.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild variant="amber">
          <Link to="/donate">Try again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/contact">Contact</Link>
        </Button>
      </div>
    </div>
  );
}
