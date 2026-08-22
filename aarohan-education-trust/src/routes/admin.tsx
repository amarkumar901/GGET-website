import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/donations", label: "Donations" },
  { to: "/admin/campaigns", label: "Campaigns" },
  { to: "/admin/programs", label: "Programmes" },
  { to: "/admin/stories", label: "Stories" },
  { to: "/admin/content", label: "Content" },
  { to: "/admin/enquiries", label: "Enquiries" },
  { to: "/admin/volunteers", label: "Volunteers" },
  { to: "/admin/documents", label: "Documents" },
  { to: "/admin/settings", label: "Settings" },
];

function AdminLayout() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-navy/10" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="min-h-dvh bg-paper">
      <div className="flex min-h-dvh">
        <aside className="hidden w-56 shrink-0 border-r border-line bg-cream md:flex md:flex-col">
          <Link to="/" className="px-5 py-5 font-display text-lg text-navy-deep">
            Aarohan
          </Link>
          <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-6">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    active ? "bg-navy text-paper" : "text-navy hover:bg-paper-2",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <p className="text-sm font-medium text-navy">Admin</p>
            <UserButton />
          </header>
          <nav className="flex gap-2 overflow-x-auto border-b border-line px-3 py-2 md:hidden">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="shrink-0 rounded-full bg-paper-2 px-3 py-2 text-xs">
                {item.label}
              </Link>
            ))}
          </nav>
          <main className="flex-1 px-4 py-6 sm:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
