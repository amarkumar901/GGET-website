/** HMAC-SHA256 using Web Crypto so this module is safe if a bundler traces it. */

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/** Razorpay payment signature: HMAC-SHA256(orderId + "|" + paymentId, secret) */
export async function razorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  secret: string,
): Promise<string> {
  return hmacSha256Hex(secret, `${orderId}|${paymentId}`);
}

export async function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}): Promise<boolean> {
  if (!input.orderId || !input.paymentId || !input.signature || !input.secret) return false;
  const expected = await razorpayPaymentSignature(input.orderId, input.paymentId, input.secret);
  return safeEqualHex(expected, input.signature);
}

/** Razorpay webhook: HMAC-SHA256(rawBody, webhookSecret) compared to X-Razorpay-Signature */
export async function verifyRazorpayWebhookSignature(input: {
  rawBody: string;
  signature: string;
  secret: string;
}): Promise<boolean> {
  if (!input.rawBody || !input.signature || !input.secret) return false;
  const expected = await hmacSha256Hex(input.secret, input.rawBody);
  return safeEqualHex(expected, input.signature);
}
