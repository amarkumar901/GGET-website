import { createFileRoute } from "@tanstack/react-router";
import { applyRazorpayWebhook } from "@/lib/server/donations";

export const Route = createFileRoute("/api/webhooks/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature") || "";
        try {
          await applyRazorpayWebhook(rawBody, signature);
          return new Response(JSON.stringify({ ok: true }), {
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          const status = (err as { status?: number }).status || 400;
          const message = err instanceof Error ? err.message : "Webhook failed";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
