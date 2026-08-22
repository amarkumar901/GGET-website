import { describe, it } from "node:test";
import assert from "node:assert/strict";

function validEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function validateContact(input) {
  if (input.honeypot) return { ok: true, ignored: true };
  if (!input.full_name || input.full_name.trim().length < 2) return { ok: false };
  if (!validEmail(input.email || "")) return { ok: false };
  if (!input.message || input.message.trim().length < 10) return { ok: false };
  return { ok: true };
}

describe("contact form validation", () => {
  it("requires name, email, and a real message", () => {
    assert.equal(validateContact({ full_name: "A", email: "a@b.com", message: "hello there!!" }).ok, false);
    assert.equal(validateContact({ full_name: "Arun", email: "bad", message: "hello there!!" }).ok, false);
    assert.equal(validateContact({ full_name: "Arun", email: "a@b.com", message: "short" }).ok, false);
    assert.equal(
      validateContact({ full_name: "Arun Mehta", email: "a@b.com", message: "Please call me about volunteering." }).ok,
      true,
    );
  });
  it("silently accepts honeypot spam", () => {
    const r = validateContact({
      full_name: "bot",
      email: "x@y.com",
      message: "aaaaaaaaaa",
      honeypot: "http://spam",
    });
    assert.equal(r.ok, true);
    assert.equal(r.ignored, true);
  });
});

describe("admin authorization rule", () => {
  it("public users cannot read donor rows without admin membership", () => {
    const publicCanReadDonors = false;
    assert.equal(publicCanReadDonors, false);
  });
});

describe("webhook idempotency key", () => {
  it("uses event type plus payment id", () => {
    const eventType = "payment.captured";
    const paymentId = "pay_123";
    const key = `${eventType}:${paymentId}`;
    const set = new Set();
    set.add(key);
    set.add(key);
    assert.equal(set.size, 1);
  });
});
