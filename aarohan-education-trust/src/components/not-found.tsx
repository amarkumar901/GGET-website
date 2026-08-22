import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-medium tracking-[0.2em] text-amber-deep uppercase">404</p>
        <h1 className="mt-3 font-display text-4xl text-navy-deep">This page is not here</h1>
        <p className="mt-3 text-ink-soft">
          The address may have changed, or the page has not been published yet.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="amber">
            <Link to="/">Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/donate">Donate</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
