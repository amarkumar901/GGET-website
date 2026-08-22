import { createFileRoute, notFound } from "@tanstack/react-router";
import { getDonationReceipt } from "@/lib/server/donations";
import { formatInrFromPaise } from "@/lib/money";
import { useSite } from "@/components/site-context";
import { Button } from "@/components/ui/button";
import { DownloadReceiptButton } from "@/components/donate/download-receipt";

export const Route = createFileRoute("/_site/receipt/$token")({
  loader: async ({ params }) => {
    const d = await getDonationReceipt({ data: { token: params.token } });
    if (!d || d.status !== "PAID") throw notFound();
    return d;
  },
  component: ReceiptPage,
  head: () => ({ meta: [{ title: "Acknowledgement — Aarohan" }] }),
});

function ReceiptPage() {
  const d = Route.useLoaderData();
  const { org } = useSite();
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl bg-cream p-8 shadow-card print:shadow-none">
        <p className="text-xs tracking-[0.2em] text-amber-deep uppercase">{org.short_name}</p>
        <h1 className="mt-2 font-display text-3xl text-navy-deep">Donation acknowledgement</h1>
        <p className="mt-1 text-sm text-ink-soft">{org.trust_name}</p>
        <p className="text-sm text-ink-soft">{org.registered_address}</p>
        <dl className="mt-8 space-y-3 text-sm">
          <Row k="Receipt number" v={d.receipt_number || "—"} />
          <Row k="Date" v={d.paid_at || "—"} />
          <Row k="Received from" v={d.donor_name} />
          <Row k="Amount" v={formatInrFromPaise(d.amount_paise)} />
          <Row k="Towards" v={d.campaign || d.program || "General support"} />
          <Row k="Payment reference" v={d.payment_ref || "—"} />
          <Row k="Mode" v={d.payment_method || "Online"} />
        </dl>
        <p className="mt-8 text-xs text-ink-soft">
          This is an acknowledgement of a contribution. It is not Form 10BE and is not a tax
          certificate.
        </p>
        {d.demo ? (
          <p className="mt-3 text-sm text-amber-deep">Demonstration receipt — no real payment.</p>
        ) : null}
      </div>
      <div className="mt-6 flex gap-3 print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Print
        </Button>
        <DownloadReceiptButton
          token={d.access_token}
          receiptNumber={d.receipt_number}
          label="Download PDF"
        />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="font-medium text-navy">{v}</dd>
    </div>
  );
}
