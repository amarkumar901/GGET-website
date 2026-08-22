import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  campaignPercent,
  formatInrAscii,
  formatPercent,
  parseRupeeInput,
  rupeesToPaise,
  validateDonationPaise,
} from "./money.ts";

describe("donation amount validation", () => {
  it("accepts whole rupee amounts within bounds", () => {
    const ok = validateDonationPaise(50000);
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.paise, 50000);
  });
  it("rejects zero and negative", () => {
    assert.equal(validateDonationPaise(0).ok, false);
    assert.equal(validateDonationPaise(-100).ok, false);
  });
  it("rejects amounts below minimum", () => {
    const r = validateDonationPaise(5000, 10000, 1_00_00_000);
    assert.equal(r.ok, false);
  });
  it("rejects paise that are not whole rupees", () => {
    const r = validateDonationPaise(50150);
    assert.equal(r.ok, false);
  });
  it("parses rupee input without commas", () => {
    assert.equal(parseRupeeInput("2500"), 250000);
    assert.equal(parseRupeeInput("₹2,500"), 250000);
    assert.equal(parseRupeeInput("12.5"), null);
    assert.equal(parseRupeeInput(""), null);
  });
  it("converts rupees to paise without floats", () => {
    assert.equal(rupeesToPaise(1500), 150000);
  });
  it("formats ASCII amounts without a rupee sign", () => {
    const label = formatInrAscii(250000);
    assert.equal(label.includes("₹"), false);
    assert.match(label, /^Rs /);
    assert.match(label, /2,500/);
  });
});

describe("campaign totals", () => {
  it("computes percent from integer paise", () => {
    assert.equal(campaignPercent(25000000, 50000000), 50);
    assert.equal(campaignPercent(0, 50000000), 0);
    assert.equal(campaignPercent(1, 0), 0);
    assert.equal(campaignPercent(600, 100), 100);
  });
  it("keeps a tenth of a percent so small gifts still move the bar", () => {
    assert.equal(campaignPercent(50000, 50000000), 0.1);
    assert.equal(campaignPercent(250000, 50000000), 0.5);
    assert.equal(formatPercent(0.5), "0.5%");
    assert.equal(formatPercent(50), "50%");
  });
});
