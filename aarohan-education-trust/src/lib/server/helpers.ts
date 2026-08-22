import { getSql } from "@/lib/db";
import { asJson, newId } from "@/lib/utils";
import { asPaise } from "@/lib/money";
import {
  DEFAULT_DONATION,
  DEFAULT_FLAGS,
  DEFAULT_ORG,
  DEFAULT_SEO,
  type ContentBlock,
  type DonationSettings,
  type FlagSettings,
  type OrgSettings,
  type SeoSettings,
} from "@/lib/types";

export async function getOrg(): Promise<OrgSettings> {
  const sql = await getSql();
  const rows = await sql<{ value: unknown }>`select value from site_settings where key = 'org'`;
  return { ...DEFAULT_ORG, ...asJson<Partial<OrgSettings>>(rows[0]?.value, {}) };
}

export async function getFlags(): Promise<FlagSettings> {
  const sql = await getSql();
  const rows = await sql<{ value: unknown }>`select value from site_settings where key = 'flags'`;
  return { ...DEFAULT_FLAGS, ...asJson<Partial<FlagSettings>>(rows[0]?.value, {}) };
}

export async function getSeo(): Promise<SeoSettings> {
  const sql = await getSql();
  const rows = await sql<{ value: unknown }>`select value from site_settings where key = 'seo'`;
  return { ...DEFAULT_SEO, ...asJson<Partial<SeoSettings>>(rows[0]?.value, {}) };
}

export async function getDonationSettings(): Promise<DonationSettings> {
  const sql = await getSql();
  const rows = await sql<{ value: unknown }>`select value from site_settings where key = 'donation'`;
  const parsed = asJson<Partial<DonationSettings>>(rows[0]?.value, {});
  return {
    ...DEFAULT_DONATION,
    ...parsed,
    min_paise: asPaise(parsed.min_paise ?? DEFAULT_DONATION.min_paise),
    max_paise: asPaise(parsed.max_paise ?? DEFAULT_DONATION.max_paise),
    preset_paise: (parsed.preset_paise ?? DEFAULT_DONATION.preset_paise).map(asPaise),
  };
}

export async function getBlock(id: string): Promise<ContentBlock | null> {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    title: string | null;
    body: string | null;
    image_url: string | null;
    extra: unknown;
  }>`select id, title, body, image_url, extra from content_blocks where id = ${id}`;
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    image_url: r.image_url,
    extra: asJson(r.extra, {} as Record<string, string | number | boolean>),
  };
}

export async function audit(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
) {
  const sql = await getSql();
  await sql`insert into audit_logs (id, user_id, action, entity_type, entity_id, metadata)
    values (${newId("aud")}, ${userId}, ${action}, ${entityType ?? null}, ${entityId ?? null}, ${JSON.stringify(metadata ?? {})}::jsonb)`;
}

export async function requireAdmin(userId: string): Promise<"admin" | "editor"> {
  const sql = await getSql();
  const existing = await sql<{ user_id: string; role: string }>`select user_id, role from admins`;
  if (existing.length === 0) {
    await sql`insert into admins (user_id, role) values (${userId}, 'admin')`;
    await audit(userId, "bootstrap_admin", "admins", userId);
    return "admin";
  }
  const me = existing.find((r) => r.user_id === userId);
  if (!me) {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    throw err;
  }
  return me.role as "admin" | "editor";
}

export async function rateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{ count: number; window_start: string }>`
    select count, window_start::text as window_start from rate_limits where key = ${key}`;
  const now = Date.now();
  if (!rows[0]) {
    await sql`insert into rate_limits (key, count, window_start) values (${key}, 1, now())`;
    return true;
  }
  const start = Date.parse(rows[0].window_start);
  if (!Number.isFinite(start) || now - start > windowMs) {
    await sql`update rate_limits set count = 1, window_start = now() where key = ${key}`;
    return true;
  }
  if (rows[0].count >= max) return false;
  await sql`update rate_limits set count = count + 1 where key = ${key}`;
  return true;
}

export function clientKey(requestHeaders?: Headers): string {
  const xf = requestHeaders?.get("x-forwarded-for") ?? "";
  const ip = xf.split(",")[0]?.trim() || "unknown";
  return ip.slice(0, 64);
}

export function razorpayEnv(): {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  live: boolean;
} {
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
  return { keyId, keySecret, webhookSecret, live: Boolean(keyId && keySecret) };
}

export function parseGallery(value: unknown): string[] {
  const arr = asJson<unknown[]>(value, []);
  return arr.filter((x): x is string => typeof x === "string");
}

export function asInt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return 0;
}
