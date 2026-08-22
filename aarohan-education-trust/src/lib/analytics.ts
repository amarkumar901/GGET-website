declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

const BLOCKED = new Set(["pan", "email", "phone", "name", "full_name", "address", "payment_id", "razorpay_payment_id"]);

export function track(event: string, props: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  const safe: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (BLOCKED.has(k.toLowerCase())) continue;
    safe[k] = v;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...safe });
  if (typeof window.gtag === "function") {
    window.gtag("event", event, safe);
  }
}
