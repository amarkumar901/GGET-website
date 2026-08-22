import { createFileRoute } from "@tanstack/react-router";
import { DonationFlow } from "@/components/donate/donation-flow";

type DonateSearch = { campaign?: string; program?: string; amount?: string };

export const Route = createFileRoute("/_site/donate")({
  validateSearch: (raw: Record<string, unknown>): DonateSearch => ({
    campaign: typeof raw.campaign === "string" ? raw.campaign : undefined,
    program: typeof raw.program === "string" ? raw.program : undefined,
    amount: typeof raw.amount === "string" ? raw.amount : undefined,
  }),
  component: DonatePage,
  head: () => ({ meta: [{ title: "Donate — Aarohan Education Trust" }] }),
});

function DonatePage() {
  const { campaign, amount } = Route.useSearch();
  return (
    <DonationFlow initialCampaign={campaign} initialAmount={amount} />
  );
}
