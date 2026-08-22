import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function newId(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export function asJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function maskEmail(email: string): string {
  const [u, d] = email.split("@");
  if (!u || !d) return "••••";
  const keep = u.slice(0, Math.min(2, u.length));
  return `${keep}•••@${d}`;
}

export function maskPan(pan: string | null | undefined): string {
  if (!pan) return "";
  const p = pan.replace(/\s/g, "").toUpperCase();
  if (p.length < 6) return "••••";
  return `${p.slice(0, 2)}••••••${p.slice(-2)}`;
}

export function indianFy(date = new Date()): string {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = m >= 3 ? y : y - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
