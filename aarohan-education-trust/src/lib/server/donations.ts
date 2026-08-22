import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { indianFy, newId } from "@/lib/utils";
import { asPaise, formatInrFromPaise, validateDonationPaise } from "@/lib/money";
import { parseOrThrow } from "@/lib/validation";
import type { DonationStatus } from "@/lib/payments/status";
import { canTransition } from "@/lib/payments/status";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/payments/signature";
import { donationReceivedEmail, sendAdminNotice, escapeHtml } from "@/lib/email/send";
import { getDonationSettings, getFlags, getOrg, razorpayEnv, rateLimit } from "./helpers";

const donorSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name (at least 2 characters).").max(120, "Name is too long (120 characters max)."),
  email: z.string().trim().email("Enter a valid email address.").max(160, "Email is too long."),
  phone: z.string().trim().max(15, "Phone number is too long.").optional().or(z.literal("")),
  pan: z
    .string()
    .trim()
    .max(10, "PAN is 10 characters (ABCDE1234F).")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(200, "Address is too long (200 characters max).").optional().or(z.literal("")),
  city: z.string().trim().max(80, "City is too long.").optional().or(z.literal("")),
  state: z.string().trim().max(80, "State is too long.").optional().or(z.literal("")),
  pin: z.string().trim().max(6, "PIN code must be 6 digits.").optional().or(z.literal("")),
  citizenship_category: z.enum(["indian", "foreign"]),
  wants_tax_docs: z.boolean().optional(),
});

const orderSchema = z.object({
  amount_paise: z.number().int(),
  frequency: z.enum(["one_time", "monthly"]).default("one_time"),
  campaign_id: z.string().optional().nullable(),
  campaign_slug: z.string().optional().nullable(),
  program_id: z.string().optional().nullable(),
  honeypot: z.string().optional(),
  donor: donorSchema,
});

function panLooksValid(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
}

async function nextReceiptNumber(prefix: string): Promise<string> {
  const sql = await getSql();
  const fy = indianFy();
  await sql`insert into receipt_counters (fy, last_number) values (${fy}, 0) on conflict (fy) do nothing`;
  const rows = await sql<{ last_number: number }>`
    update receipt_counters set last_number = last_number + 1 where fy = ${fy} returning last_number`;
  const n = rows[0]?.last_number ?? 1;
  return `${prefix}/${fy}/${String(n).padStart(6, "0")}`;
}

async function createRazorpayOrder(amountPaise: number, receipt: string, donationId: string) {
  const env = razorpayEnv();
  if (!env.live) {
    return { id: `order_demo_${donationId}`, demo: true as const };
  }
  const auth = Buffer.from(`${env.keyId}:${env.keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: receipt.slice(0, 40),
      notes: { donation_id: donationId },
    }),
  });
  if (!res.ok) {
    throw new Error("Could not start payment. Please try again.");
  }
  const json = (await res.json()) as { id?: string };
  if (!json.id) throw new Error("Could not start payment. Please try again.");
  return { id: json.id, demo: false as const };
}

export const createDonationOrder = createServerFn({ method: "POST" })
  .validator((d: unknown) => parseOrThrow(orderSchema, d))
  .handler(async ({ data }) => {
    if (data.honeypot) {
      throw new Error("Unable to process this request.");
    }
    const flags = await getFlags();
    const donationCfg = await getDonationSettings();
    const org = await getOrg();

    if (data.frequency === "monthly" && !flags.monthly_donations_enabled) {
      throw new Error("Monthly donations are not enabled yet.");
    }
    if (data.donor.citizenship_category === "foreign" && !flags.foreign_donations_enabled) {
      throw new Error(flags.foreign_donation_message);
    }

    const amountCheck = validateDonationPaise(
      data.amount_paise,
      donationCfg.min_paise,
      donationCfg.max_paise,
    );
    if (!amountCheck.ok) throw new Error(amountCheck.error);

    const pan = (data.donor.pan || "").toUpperCase();
    if (data.donor.wants_tax_docs && pan && !panLooksValid(pan)) {
      throw new Error("Enter a valid PAN if you would like tax-related documentation.");
    }

    const allowed = await rateLimit(`donate:${data.donor.email.toLowerCase()}`, 8, 60 * 60 * 1000);
    if (!allowed) throw new Error("Please wait before starting another donation.");

    const sql = await getSql();

    let campaignTitle: string | null = null;
    let programTitle: string | null = null;
    let campaignId = data.campaign_id || null;
    let programId = data.program_id || null;

    if (!campaignId && data.campaign_slug) {
      const bySlug = await sql<{ id: string }>`
        select id from campaigns where slug = ${data.campaign_slug} and status = 'active' limit 1`;
      campaignId = bySlug[0]?.id ?? null;
    }

    if (campaignId) {
      const camps = await sql<{
        id: string;
        title: string;
        status: string;
        program_id: string | null;
      }>`select id, title, status, program_id from campaigns where id = ${campaignId}`;
      const c = camps[0];
      if (!c || c.status !== "active") throw new Error("This campaign is not open for donations.");
      campaignTitle = c.title;
      programId = c.program_id;
    }
    if (programId) {
      const progs = await sql<{ id: string; title: string; status: string }>`
        select id, title, status from programs where id = ${programId}`;
      const p = progs[0];
      if (!p || p.status !== "published") {
        programId = null;
      } else {
        programTitle = p.title;
      }
    }

    const donorId = newId("donor");
    const donationId = newId("don");
    const accessToken = newId("tok");

    await sql`insert into donors (
      id, full_name, email, phone, pan, address, city, state, pin, citizenship_category
    ) values (
      ${donorId},
      ${data.donor.full_name},
      ${data.donor.email.toLowerCase()},
      ${data.donor.phone || null},
      ${pan || null},
      ${data.donor.address || null},
      ${data.donor.city || null},
      ${data.donor.state || null},
      ${data.donor.pin || null},
      ${data.donor.citizenship_category}
    )`;

    await sql`insert into donations (
      id, donor_id, campaign_id, program_id, amount_paise, currency, frequency, status,
      access_token, wants_tax_docs, campaign_title_snapshot, program_title_snapshot, demo
    ) values (
      ${donationId}, ${donorId}, ${campaignId}, ${programId}, ${amountCheck.paise}, 'INR',
      ${data.frequency}, 'CREATED', ${accessToken}, ${Boolean(data.donor.wants_tax_docs)},
      ${campaignTitle}, ${programTitle}, ${false}
    )`;

    const order = await createRazorpayOrder(amountCheck.paise, donationId, donationId);
    const env = razorpayEnv();

    await sql`update donations set
      razorpay_order_id = ${order.id},
      status = 'PENDING',
      demo = ${order.demo},
      updated_at = now()
      where id = ${donationId}`;

    return {
      donationId,
      orderId: order.id,
      amountPaise: amountCheck.paise,
      currency: "INR",
      accessToken,
      mode: order.demo ? ("demo" as const) : ("razorpay" as const),
      keyId: order.demo ? "" : env.keyId,
      trustName: org.trust_name,
      description: campaignTitle || programTitle || "Donation",
    };
  });

async function markPaid(opts: {
  donationId: string;
  paymentId: string;
  signature?: string | null;
  method?: string | null;
}) {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    status: DonationStatus;
    amount_paise: unknown;
    donor_id: string;
    campaign_title_snapshot: string | null;
    program_title_snapshot: string | null;
    access_token: string;
    demo: boolean;
    receipt_number: string | null;
  }>`select id, status, amount_paise, donor_id, campaign_title_snapshot, program_title_snapshot,
      access_token, demo, receipt_number from donations where id = ${opts.donationId}`;
  const d = rows[0];
  if (!d) throw new Error("Donation not found.");
  if (d.status === "PAID") {
    return { already: true, receiptNumber: d.receipt_number, accessToken: d.access_token };
  }
  if (!canTransition(d.status, "PAID")) {
    throw new Error("This donation cannot be marked paid.");
  }

  const org = await getOrg();
  const receiptNumber = await nextReceiptNumber(org.receipt_prefix || "AAROHAN");
  const receiptId = newId("rcpt");

  await sql`update donations set
    status = 'PAID',
    razorpay_payment_id = ${opts.paymentId},
    razorpay_signature = ${opts.signature ?? null},
    payment_method = ${opts.method ?? null},
    receipt_number = ${receiptNumber},
    paid_at = now(),
    updated_at = now()
    where id = ${d.id} and status <> 'PAID'`;

  await sql`insert into receipts (id, donation_id, receipt_number, email_status)
    values (${receiptId}, ${d.id}, ${receiptNumber}, 'pending')
    on conflict (donation_id) do nothing`;

  const donor = await sql<{ full_name: string; email: string }>`
    select full_name, email from donors where id = ${d.donor_id}`;
  const who = donor[0];
  if (who) {
    const mail = await donationReceivedEmail({
      donorName: who.full_name,
      donorEmail: who.email,
      amountLabel: formatInrFromPaise(asPaise(d.amount_paise)),
      receiptNumber,
      campaign: d.campaign_title_snapshot,
      accessToken: d.access_token,
      demo: Boolean(d.demo),
    });
    await sql`update receipts set email_status = ${mail.status} where id = ${receiptId}`;
    void sendAdminNotice(
      `Donation received — ${formatInrFromPaise(asPaise(d.amount_paise))}`,
      `<p>${escapeHtml(who.full_name)} donated ${escapeHtml(formatInrFromPaise(asPaise(d.amount_paise)))}.</p>
       <p>Receipt ${escapeHtml(receiptNumber)}</p>`,
    );
  }

  return { already: false, receiptNumber, accessToken: d.access_token };
}

export const verifyDonationPayment = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    parseOrThrow(
      z.object({
        donationId: z.string(),
        razorpay_order_id: z.string(),
        razorpay_payment_id: z.string(),
        razorpay_signature: z.string(),
      }),
      d,
    ),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      razorpay_order_id: string | null;
      status: DonationStatus;
      demo: boolean;
    }>`select id, razorpay_order_id, status, demo from donations where id = ${data.donationId}`;
    const d = rows[0];
    if (!d) throw new Error("Donation not found.");
    if (d.razorpay_order_id !== data.razorpay_order_id) {
      throw new Error("Payment does not match this donation.");
    }
    const env = razorpayEnv();
    if (d.demo || !env.live) {
      throw new Error("Use the demonstration checkout to complete this donation.");
    }
    const ok = await verifyRazorpayPaymentSignature({
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
      signature: data.razorpay_signature,
      secret: env.keySecret,
    });
    if (!ok) throw new Error("Payment could not be verified.");
    const paid = await markPaid({
      donationId: d.id,
      paymentId: data.razorpay_payment_id,
      signature: data.razorpay_signature,
      method: "razorpay",
    });
    return { ok: true, ...paid };
  });

export const completeDemoDonation = createServerFn({ method: "POST" })
  .validator((d: unknown) => parseOrThrow(z.object({ donationId: z.string(), accessToken: z.string() }), d))
  .handler(async ({ data }) => {
    const env = razorpayEnv();
    if (env.live) {
      throw new Error("Demonstration checkout is disabled when Razorpay is configured.");
    }
    const sql = await getSql();
    const rows = await sql<{ id: string; access_token: string; demo: boolean; status: string }>`
      select id, access_token, demo, status from donations where id = ${data.donationId}`;
    const d = rows[0];
    if (!d || d.access_token !== data.accessToken) throw new Error("Donation not found.");
    const paymentId = `pay_demo_${d.id.slice(-12)}`;
    const paid = await markPaid({
      donationId: d.id,
      paymentId,
      method: "demo",
    });
    return { ok: true, ...paid };
  });

export const failDonation = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ donationId: z.string(), accessToken: z.string(), reason: z.string().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: string; access_token: string; status: DonationStatus }>`
      select id, access_token, status from donations where id = ${data.donationId}`;
    const d = rows[0];
    if (!d || d.access_token !== data.accessToken) throw new Error("Donation not found.");
    if (d.status === "PAID") return { ok: true, status: d.status };
    if (!canTransition(d.status, "FAILED")) return { ok: true, status: d.status };
    await sql`update donations set status = 'FAILED', failure_reason = ${data.reason ?? "cancelled"}, updated_at = now()
      where id = ${d.id} and status <> 'PAID'`;
    return { ok: true, status: "FAILED" as const };
  });

export const getDonationReceipt = createServerFn({ method: "GET" })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    if (!data.token) return null;
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      status: string;
      amount_paise: unknown;
      currency: string;
      receipt_number: string | null;
      campaign_title_snapshot: string | null;
      program_title_snapshot: string | null;
      paid_at: string | null;
      demo: boolean;
      donor_name: string;
      donor_email: string;
      access_token: string;
      payment_method: string | null;
      razorpay_payment_id: string | null;
      campaign_slug: string | null;
    }>`
      select don.id, don.status, don.amount_paise, don.currency, don.receipt_number,
        don.campaign_title_snapshot, don.program_title_snapshot, don.paid_at::text as paid_at,
        don.demo, dr.full_name as donor_name, dr.email as donor_email, don.access_token,
        don.payment_method, don.razorpay_payment_id,
        (select slug from campaigns where id = don.campaign_id) as campaign_slug
      from donations don
      join donors dr on dr.id = don.donor_id
      where don.access_token = ${data.token}
      limit 1`;
    const r = rows[0];
    if (!r) return null;
    return {
      status: r.status,
      amount_paise: asPaise(r.amount_paise),
      currency: r.currency,
      receipt_number: r.receipt_number,
      campaign: r.campaign_title_snapshot,
      campaign_slug: r.campaign_slug,
      program: r.program_title_snapshot,
      paid_at: r.paid_at,
      demo: Boolean(r.demo),
      donor_name: r.donor_name,
      donor_email: r.donor_email,
      payment_method: r.payment_method,
      payment_ref: r.razorpay_payment_id,
      access_token: r.access_token,
    };
  });

export async function applyRazorpayWebhook(rawBody: string, signature: string): Promise<{ ok: boolean }> {
  const env = razorpayEnv();
  if (!env.webhookSecret) {
    throw Object.assign(new Error("Webhook is not configured."), { status: 503 });
  }
  const good = await verifyRazorpayWebhookSignature({
    rawBody,
    signature,
    secret: env.webhookSecret,
  });
  if (!good) {
    throw Object.assign(new Error("Invalid signature"), { status: 400 });
  }

  const payload = JSON.parse(rawBody) as {
    event?: string;
    payload?: { payment?: { entity?: Record<string, unknown> } };
  };
  const eventType = String(payload.event || "unknown");
  const entity = payload.payload?.payment?.entity;
  const eventId =
    (entity && typeof entity.id === "string" ? `${eventType}:${entity.id}` : null) ||
    `${eventType}:${Buffer.from(rawBody).toString("base64").slice(0, 40)}`;

  const sql = await getSql();
  const existing = await sql<{ id: string }>`select id from payment_events where provider_event_id = ${eventId}`;
  if (existing[0]) return { ok: true };

  const orderId = entity && typeof entity.order_id === "string" ? entity.order_id : null;
  const paymentId = entity && typeof entity.id === "string" ? entity.id : null;
  const method = entity && typeof entity.method === "string" ? entity.method : null;

  let donationId: string | null = null;
  if (orderId) {
    const d = await sql<{ id: string }>`select id from donations where razorpay_order_id = ${orderId}`;
    donationId = d[0]?.id ?? null;
  }

  try {
    await sql`insert into payment_events (id, provider_event_id, donation_id, event_type, payload)
      values (${newId("evt")}, ${eventId}, ${donationId}, ${eventType}, ${rawBody}::jsonb)`;
  } catch {
    return { ok: true };
  }

  if (donationId && paymentId && (eventType === "payment.captured" || eventType === "payment.authorized")) {
    await markPaid({ donationId, paymentId, method: method || "razorpay" });
  }
  if (donationId && eventType === "payment.failed") {
    const cur = await sql<{ status: DonationStatus }>`select status from donations where id = ${donationId}`;
    if (cur[0] && canTransition(cur[0].status, "FAILED")) {
      await sql`update donations set status = 'FAILED', failure_reason = 'webhook_failed', updated_at = now()
        where id = ${donationId} and status <> 'PAID'`;
    }
  }
  return { ok: true };
}
