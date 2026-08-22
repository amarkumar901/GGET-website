import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pdfSafeText } from "./text.ts";
import { formatInrAscii } from "../money.ts";

describe("pdfSafeText", () => {
  it("replaces the rupee sign so WinAnsi fonts can encode the line", () => {
    assert.equal(pdfSafeText("₹2,500"), "Rs 2,500");
  });
  it("replaces em dashes used in campaign titles", () => {
    assert.equal(pdfSafeText("Keep a centre open — this year"), "Keep a centre open -- this year");
  });
  it("strips leftover non-latin characters", () => {
    assert.match(pdfSafeText("Meera — कृष्णन"), /Meera -- \?+/);
  });
});

describe("formatInrAscii used on receipts", () => {
  it("never includes the rupee sign", () => {
    const label = formatInrAscii(250000);
    assert.equal(label.includes("₹"), false);
    assert.equal(pdfSafeText(label), label);
  });
});
