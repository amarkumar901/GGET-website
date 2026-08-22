import { createFileRoute, Link } from "@tanstack/react-router";
import { getDonationReceipt } from "@/lib/server/donations";
import { formatInrFromPaise } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { ShareRow } from "@/components/share-row";
import { DownloadReceiptButton } from "@/components/donate/download-receipt";

type Search = { t?: string };

export const Route = createFileRoute("/_site/donation/success")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    t: typeof raw.t === "string" ? raw.t : undefined,
  }),
  loaderDeps: ({ search }) => ({ t: search.t }),
  loader: async ({ deps }) => {
    if (!deps.t) return null;
    return getDonationReceipt({ data: { token: deps.t } });
  },
  component: SuccessPage,
  head: () => ({ meta: [{ title: "Thank you — Aarohan Education Trust" }] }),
});

function SuccessPage() {
  const data = Route.useLoaderData();
  if (!data || data.status !== "PAID") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-navy-deep">We could not load this donation</h1>
        <p className="mt-3 text-ink-soft">
          This page only shows a donation after it has been verified on the server. It does not trust
          amounts passed in the address bar.
        </p>
        <Button asChild variant="amber" className="mt-8">
          <Link to="/donate">Try again</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <p className="text-sm tracking-[0.18em] text-amber-deep uppercase">Thank you</p>
      <h1 className="mt-2 font-display text-4xl text-navy-deep">Your gift is on the record</h1>
      <p className="mt-4 text-lg text-ink">
        {formatInrFromPaise(data.amount_paise)}
        {data.campaign ? ` towards ${data.campaign}` : ""}
      </p>
      {data.receipt_number ? (
        <p className="mt-2 font-medium text-navy">Acknowledgement {data.receipt_number}</p>
      ) : null}
      <p className="mt-4 text-sm text-ink-soft">
        A confirmation is being sent to {data.donor_email}. Email delivery never changes a verified
        payment into a failed one.
      </p>
      {data.demo ? (
        <p className="mt-3 text-sm text-amber-deep">Demonstration payment — no real money was taken.</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <DownloadReceiptButton token={data.access_token} receiptNumber={data.receipt_number} />
        {data.campaign_slug ? (
          <Button asChild variant="navy">
            <Link to="/campaigns/$slug" params={{ slug: data.campaign_slug }}>
              See campaign progress
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/impact">See our impact</Link>
          </Button>
        )}
      </div>
      <ShareRow title="Support Aarohan Education Trust" />
    </div>
  );
}
