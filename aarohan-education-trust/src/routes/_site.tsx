import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getPublicSite } from "@/lib/server/site";
import { SiteProvider } from "@/components/site-context";
import { PublicShell } from "@/components/layout/public-shell";

export const Route = createFileRoute("/_site")({
  loader: () => getPublicSite(),
  staleTime: 0,
  component: SiteLayout,
});

function SiteLayout() {
  const site = Route.useLoaderData();
  return (
    <SiteProvider value={site}>
      <PublicShell>
        <Outlet />
      </PublicShell>
    </SiteProvider>
  );
}
