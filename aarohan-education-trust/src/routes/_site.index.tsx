import { createFileRoute } from "@tanstack/react-router";
import { Homepage } from "@/components/home/homepage";
import { useSite } from "@/components/site-context";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [{ title: "Aarohan Education Trust" }],
  }),
  component: HomePage,
});

function HomePage() {
  useSite();
  return <Homepage />;
}
