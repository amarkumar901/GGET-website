import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/transparency")({
  component: TransparencyLayout,
});

const TABS = [
  { to: "/transparency", label: "Financials", match: "/transparency" },
  { to: "/transparency/reports", label: "Reports", match: "/transparency/reports" },
  { to: "/transparency/registrations", label: "Registrations", match: "/transparency/registrations" },
] as const;

function TransparencyLayout() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname.replace(/\/$/, "") || "/",
  });
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Transparency</p>
      <h1 className="mt-2 font-display text-5xl text-navy-deep">Your trust matters to us</h1>
      <p className="mt-4 text-lg text-ink-soft">
        Nothing on these pages is a claim that a registration or report exists unless an administrator
        has published it.
      </p>
      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Transparency sections">
        {TABS.map((tab) => {
          const active = pathname === tab.match;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "inline-flex h-11 items-center rounded-full px-4 text-sm font-medium",
                active ? "bg-navy text-paper" : "bg-paper-2 text-navy",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-10">
        <Outlet />
      </div>
    </div>
  );
}
