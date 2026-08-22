import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center text-ink">
      <span className="text-amber-deep" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-2xl text-navy-deep">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-ink-soft">
        {error.message || "An unexpected error occurred. Try reloading the page."}
      </p>
      <Link to="/" className="mt-2 text-sm font-medium text-navy underline">
        Back home
      </Link>
    </main>
  );
}
