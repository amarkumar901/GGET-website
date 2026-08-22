/** Integer paise only. Never use floats for money. */

export const MIN_DONATION_PAISE = 10000; // ₹100
export const MAX_DONATION_PAISE = 5_00_00_000; // ₹5,00,000

export function asPaise(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.round(n);
  }
  return 0;
}

export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) return 0;
  return Math.round(rupees) * 100;
}

export function paiseToRupeesInt(paise: number): number {
  return Math.trunc(asPaise(paise) / 100);
}

export function formatInrFromPaise(paise: number): string {
  const rupees = paiseToRupeesInt(paise);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

/** WinAnsi-safe amount for PDF receipts. Standard PDF fonts cannot encode ₹. */
export function formatInrAscii(paise: number): string {
  return `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(paiseToRupeesInt(paise))}`;
}

export function formatInrCompact(paise: number): string {
  return `₹${new Intl.NumberFormat("en-IN").format(paiseToRupeesInt(paise))}`;
}

export function parseRupeeInput(raw: string): number | null {
  const cleaned = raw.replace(/[₹,\s]/g, "");
  if (!cleaned) return null;
  if (!/^\d+$/.test(cleaned)) return null;
  const rupees = Number(cleaned);
  if (!Number.isSafeInteger(rupees) || rupees <= 0) return null;
  return rupees * 100;
}

export function campaignPercent(raisedPaise: number, goalPaise: number): number {
  const r = asPaise(raisedPaise);
  const g = asPaise(goalPaise);
  if (g <= 0) return 0;
  const pct = (r * 100) / g;
  if (pct <= 0) return 0;
  if (pct >= 100) return 100;
  return Math.round(pct * 10) / 10;
}

export function formatPercent(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  if (n === 0) return "0%";
  if (n > 0 && n < 1) return `${n.toFixed(1)}%`;
  if (Number.isInteger(n)) return `${n}%`;
  return `${n.toFixed(1)}%`;
}

export function addPaise(a: number, b: number): number {
  return asPaise(a) + asPaise(b);
}

export function validateDonationPaise(
  paise: number,
  min = MIN_DONATION_PAISE,
  max = MAX_DONATION_PAISE,
): { ok: true; paise: number } | { ok: false; error: string } {
  const n = asPaise(paise);
  if (!Number.isSafeInteger(n) || n <= 0) {
    return { ok: false, error: "Enter a valid amount in whole rupees." };
  }
  if (n % 100 !== 0) {
    return { ok: false, error: "Amount must be in whole rupees." };
  }
  if (n < min) {
    return { ok: false, error: `Minimum donation is ${formatInrFromPaise(min)}.` };
  }
  if (n > max) {
    return { ok: false, error: `Maximum donation is ${formatInrFromPaise(max)}.` };
  }
  return { ok: true, paise: n };
}
