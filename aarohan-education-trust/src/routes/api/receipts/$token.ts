import { createFileRoute } from "@tanstack/react-router";
import { getDonationReceipt } from "@/lib/server/donations";
import { getOrg } from "@/lib/server/helpers";
import { buildReceiptPdf } from "@/lib/receipts/generate";

export const Route = createFileRoute("/api/receipts/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = params.token;
        const data = await getDonationReceipt({ data: { token } });
        if (!data || data.status !== "PAID") {
          return new Response("Not found", { status: 404 });
        }
        try {
          const org = await getOrg();
          const pdf = await buildReceiptPdf({
            org,
            receiptNumber: data.receipt_number || "—",
            issuedAt: (data.paid_at || "").slice(0, 10),
            donorName: data.donor_name,
            amountPaise: data.amount_paise,
            paymentRef: data.payment_ref || "—",
            campaign: data.campaign,
            program: data.program,
            paymentMode: data.payment_method,
            demo: data.demo,
          });
          const filename = `${(data.receipt_number || "acknowledgement").replace(/[/\\"]/g, "-")}.pdf`;
          return new Response(Buffer.from(pdf), {
            headers: {
              "content-type": "application/pdf",
              "content-disposition": `attachment; filename="${filename}"`,
              "cache-control": "private, no-store",
            },
          });
        } catch (err) {
          console.error("[receipts] pdf failed", err);
          return new Response("Could not generate acknowledgement", { status: 500 });
        }
      },
    },
  },
});
