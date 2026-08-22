export const DONATION_STATUSES = [
  "CREATED",
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;

export type DonationStatus = (typeof DONATION_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<DonationStatus, DonationStatus[]> = {
  CREATED: ["PENDING", "FAILED"],
  PENDING: ["PAID", "FAILED"],
  PAID: ["REFUNDED", "PARTIALLY_REFUNDED"],
  FAILED: ["PENDING"],
  REFUNDED: [],
  PARTIALLY_REFUNDED: ["REFUNDED"],
};

export function canTransition(from: DonationStatus, to: DonationStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
