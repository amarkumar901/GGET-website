import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  razorpayPaymentSignature,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "./signature.ts";
import { canTransition } from "./status.ts";

describe("Razorpay payment signature", () => {
  it("matches HMAC-SHA256 of orderId|paymentId", async () => {
    const secret = "test_secret";
    const orderId = "order_abc";
    const paymentId = "pay_xyz";
    const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    assert.equal(await razorpayPaymentSignature(orderId, paymentId, secret), expected);
    assert.equal(
      await verifyRazorpayPaymentSignature({ orderId, paymentId, signature: expected, secret }),
      true,
    );
  });
  it("rejects a tampered signature", async () => {
    const secret = "test_secret";
    assert.equal(
      await verifyRazorpayPaymentSignature({
        orderId: "order_abc",
        paymentId: "pay_xyz",
        signature: "00".repeat(32),
        secret,
      }),
      false,
    );
  });
  it("does not trust a client-provided amount — signature never includes amount", async () => {
    const sig = await razorpayPaymentSignature("order_1", "pay_1", "s");
    const sig2 = await razorpayPaymentSignature("order_1", "pay_1", "s");
    assert.equal(sig, sig2);
  });
});

describe("Razorpay webhook signature", () => {
  it("verifies HMAC of the raw body", async () => {
    const secret = "whsec";
    const rawBody = '{"event":"payment.captured","payload":{}}';
    const signature = createHmac("sha256", secret).update(rawBody).digest("hex");
    assert.equal(await verifyRazorpayWebhookSignature({ rawBody, signature, secret }), true);
  });
  it("rejects a replay with a different body", async () => {
    const secret = "whsec";
    const signature = createHmac("sha256", secret).update("body-a").digest("hex");
    assert.equal(
      await verifyRazorpayWebhookSignature({ rawBody: "body-b", signature, secret }),
      false,
    );
  });
});

describe("donation status transitions", () => {
  it("allows pending to paid and pending to failed", () => {
    assert.equal(canTransition("PENDING", "PAID"), true);
    assert.equal(canTransition("PENDING", "FAILED"), true);
  });
  it("does not allow failed to paid directly", () => {
    assert.equal(canTransition("FAILED", "PAID"), false);
  });
  it("does not allow paid to pending", () => {
    assert.equal(canTransition("PAID", "PENDING"), false);
  });
  it("is idempotent for the same status", () => {
    assert.equal(canTransition("PAID", "PAID"), true);
  });
});
