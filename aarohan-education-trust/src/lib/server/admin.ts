import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { asPaise, formatInrFromPaise } from "@/lib/money";
import { maskPan, newId, slugify } from "@/lib/utils";
import { asInt, audit, requireAdmin } from "./helpers";
import { loadPrograms } from "./site";

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const totals = await sql<{
      paid_count: unknown;
      paid_sum: unknown;
      today_count: unknown;
      today_sum: unknown;
      month_count: unknown;
      month_sum: unknown;
    }>`
      select
        coalesce(sum(case when status = 'PAID' then 1 else 0 end), 0) as paid_count,
        coalesce(sum(case when status = 'PAID' then amount_paise else 0 end), 0) as paid_sum,
        coalesce(sum(case when status = 'PAID' and paid_at::date = current_date then 1 else 0 end), 0) as today_count,
        coalesce(sum(case when status = 'PAID' and paid_at::date = current_date then amount_paise else 0 end), 0) as today_sum,
        coalesce(sum(case when status = 'PAID' and paid_at >= date_trunc('month', now()) then 1 else 0 end), 0) as month_count,
        coalesce(sum(case when status = 'PAID' and paid_at >= date_trunc('month', now()) then amount_paise else 0 end), 0) as month_sum
      from donations`;
    const t = totals[0];
    const campaigns = await sql<{ id: string; title: string; slug: string; goal_amount_paise: unknown; raised: unknown }>`
      select c.id, c.title, c.slug, c.goal_amount_paise,
        coalesce((select sum(d.amount_paise) from donations d where d.campaign_id = c.id and d.status = 'PAID'), 0) as raised
      from campaigns c where c.status = 'active'`;
    const recent = await sql<{
      id: string;
      amount_paise: unknown;
      status: string;
      donor_name: string;
      created_at: string;
      receipt_number: string | null;
    }>`
      select don.id, don.amount_paise, don.status, dr.full_name as donor_name,
        don.created_at::text as created_at, don.receipt_number
      from donations don join donors dr on dr.id = don.donor_id
      order by don.created_at desc limit 8`;
    const vols = await sql<{ n: unknown }>`select count(*) as n from volunteer_applications where status = 'NEW'`;
    const enqs = await sql<{ n: unknown }>`select count(*) as n from contact_submissions`;
    return {
      paid_count: asInt(t?.paid_count),
      paid_sum: asPaise(t?.paid_sum),
      today_count: asInt(t?.today_count),
      today_sum: asPaise(t?.today_sum),
      month_count: asInt(t?.month_count),
      month_sum: asPaise(t?.month_sum),
      campaigns: campaigns.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        goal: asPaise(c.goal_amount_paise),
        raised: asPaise(c.raised),
      })),
      recent: recent.map((r) => ({
        ...r,
        amount_paise: asPaise(r.amount_paise),
      })),
      new_volunteers: asInt(vols[0]?.n),
      enquiries: asInt(enqs[0]?.n),
    };
  });

export const listAdminDonations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { q?: string; status?: string } = {}) => d)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const q = (data.q || "").trim();
    const status = (data.status || "").trim();
    let query = `
      select don.id, don.amount_paise, don.status, don.receipt_number, don.razorpay_payment_id,
        don.razorpay_order_id, don.created_at::text as created_at, don.paid_at::text as paid_at,
        don.campaign_title_snapshot, don.demo, dr.full_name, dr.email, dr.pan, dr.citizenship_category
      from donations don join donors dr on dr.id = don.donor_id where 1=1`;
    const params: unknown[] = [];
    if (status) {
      params.push(status);
      query += ` and don.status = $${params.length}`;
    }
    if (q) {
      params.push(`%${q}%`);
      const p = params.length;
      query += ` and (dr.email ilike $${p} or dr.full_name ilike $${p} or don.receipt_number ilike $${p} or don.razorpay_payment_id ilike $${p} or don.id ilike $${p})`;
    }
    query += ` order by don.created_at desc limit 200`;
    const rows = await sql.query<Record<string, unknown>>(query, params);
    return rows.map((r) => ({
      id: String(r.id),
      amount_paise: asPaise(r.amount_paise),
      amount_label: formatInrFromPaise(asPaise(r.amount_paise)),
      status: String(r.status),
      receipt_number: (r.receipt_number as string) ?? null,
      payment_id: (r.razorpay_payment_id as string) ?? null,
      order_id: (r.razorpay_order_id as string) ?? null,
      created_at: String(r.created_at),
      paid_at: (r.paid_at as string) ?? null,
      campaign: (r.campaign_title_snapshot as string) ?? null,
      demo: Boolean(r.demo),
      donor_name: String(r.full_name),
      donor_email: String(r.email),
      pan_masked: maskPan((r.pan as string) ?? ""),
      citizenship: String(r.citizenship_category),
    }));
  });

export const exportDonationsCsv = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      receipt_number: string | null;
      paid_at: string | null;
      amount_paise: unknown;
      status: string;
      full_name: string;
      email: string;
      pan: string | null;
      campaign_title_snapshot: string | null;
      razorpay_payment_id: string | null;
      citizenship_category: string;
    }>`
      select don.receipt_number, don.paid_at::text as paid_at, don.amount_paise, don.status,
        dr.full_name, dr.email, dr.pan, don.campaign_title_snapshot, don.razorpay_payment_id,
        dr.citizenship_category
      from donations don join donors dr on dr.id = don.donor_id
      order by don.created_at desc`;
    const header = [
      "receipt_number",
      "paid_at",
      "amount_inr",
      "status",
      "donor_name",
      "email",
      "pan",
      "campaign",
      "payment_id",
      "citizenship",
    ];
    const lines = [header.join(",")];
    for (const r of rows) {
      const cells = [
        r.receipt_number ?? "",
        r.paid_at ?? "",
        String(Math.trunc(asPaise(r.amount_paise) / 100)),
        r.status,
        r.full_name,
        r.email,
        r.pan ?? "",
        r.campaign_title_snapshot ?? "",
        r.razorpay_payment_id ?? "",
        r.citizenship_category,
      ].map((c) => `"${String(c).replace(/"/g, '""')}"`);
      lines.push(cells.join(","));
    }
    await audit(context.userId, "export_donations_csv", "donations");
    return { csv: lines.join("\n") };
  });

export const listAdminEnquiries = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    return sql<{
      id: string;
      kind: string;
      full_name: string;
      email: string;
      phone: string | null;
      organisation: string | null;
      subject: string | null;
      message: string;
      created_at: string;
    }>`select id, kind, full_name, email, phone, organisation, subject, message, created_at::text as created_at
      from contact_submissions order by created_at desc limit 200`;
  });

export const listAdminVolunteers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    return sql<{
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
      city: string | null;
      profession: string | null;
      area_of_interest: string | null;
      availability: string | null;
      message: string | null;
      status: string;
      created_at: string;
    }>`select id, full_name, email, phone, city, profession, area_of_interest, availability, message, status,
      created_at::text as created_at from volunteer_applications order by created_at desc`;
  });

export const updateVolunteerStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string(),
        status: z.enum(["NEW", "CONTACTED", "APPROVED", "REJECTED", "COMPLETED"]),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`update volunteer_applications set status = ${data.status} where id = ${data.id}`;
    await audit(context.userId, "volunteer_status", "volunteer_applications", data.id, {
      status: data.status,
    });
    return { ok: true };
  });

export const saveProgram = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string().optional(),
        title: z.string().min(2),
        slug: z.string().optional(),
        short_description: z.string().default(""),
        long_description: z.string().default(""),
        cover_image: z.string().optional().nullable(),
        status: z.enum(["draft", "published", "archived"]).default("published"),
        seo_title: z.string().optional().nullable(),
        seo_description: z.string().optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const id = data.id || newId("prog");
    const slug = slugify(data.slug || data.title);
    if (data.id) {
      await sql`update programs set title = ${data.title}, slug = ${slug},
        short_description = ${data.short_description}, long_description = ${data.long_description},
        cover_image = ${data.cover_image ?? null}, status = ${data.status},
        seo_title = ${data.seo_title ?? null}, seo_description = ${data.seo_description ?? null},
        updated_at = now() where id = ${id}`;
    } else {
      await sql`insert into programs (id, title, slug, short_description, long_description, cover_image, status, seo_title, seo_description)
        values (${id}, ${data.title}, ${slug}, ${data.short_description}, ${data.long_description},
          ${data.cover_image ?? null}, ${data.status}, ${data.seo_title ?? null}, ${data.seo_description ?? null})`;
    }
    await audit(context.userId, data.id ? "update_program" : "create_program", "programs", id);
    return { ok: true, id };
  });

export const saveCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string().optional(),
        title: z.string().min(2),
        slug: z.string().optional(),
        description: z.string().default(""),
        short_description: z.string().default(""),
        hero_image: z.string().optional().nullable(),
        goal_rupees: z.number().int().positive(),
        start_date: z.string().optional().nullable(),
        end_date: z.string().optional().nullable(),
        status: z.enum(["draft", "active", "completed", "paused"]),
        featured: z.boolean().optional(),
        program_id: z.string().optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const id = data.id || newId("camp");
    const slug = slugify(data.slug || data.title);
    const goal = data.goal_rupees * 100;
    if (data.id) {
      await sql`update campaigns set title = ${data.title}, slug = ${slug}, description = ${data.description},
        short_description = ${data.short_description}, hero_image = ${data.hero_image ?? null},
        goal_amount_paise = ${goal}, start_date = ${data.start_date || null}, end_date = ${data.end_date || null},
        status = ${data.status}, featured = ${Boolean(data.featured)}, program_id = ${data.program_id || null},
        updated_at = now() where id = ${id}`;
    } else {
      await sql`insert into campaigns (id, title, slug, description, short_description, hero_image, goal_amount_paise, start_date, end_date, status, featured, program_id)
        values (${id}, ${data.title}, ${slug}, ${data.description}, ${data.short_description}, ${data.hero_image ?? null},
          ${goal}, ${data.start_date || null}, ${data.end_date || null}, ${data.status}, ${Boolean(data.featured)}, ${data.program_id || null})`;
    }
    await audit(context.userId, data.id ? "update_campaign" : "create_campaign", "campaigns", id);
    return { ok: true, id };
  });

export const saveStory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string().optional(),
        title: z.string().min(2),
        slug: z.string().optional(),
        display_name: z.string().min(1),
        excerpt: z.string().default(""),
        body: z.string().default(""),
        cover_image: z.string().optional().nullable(),
        program_id: z.string().optional().nullable(),
        featured: z.boolean().optional(),
        consent_obtained: z.boolean().optional(),
        is_composite: z.boolean().optional(),
        status: z.enum(["draft", "published"]).default("published"),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const id = data.id || newId("story");
    const slug = slugify(data.slug || data.title);
    if (data.id) {
      await sql`update stories set title = ${data.title}, slug = ${slug}, display_name = ${data.display_name},
        excerpt = ${data.excerpt}, body = ${data.body}, cover_image = ${data.cover_image ?? null},
        program_id = ${data.program_id || null}, featured = ${Boolean(data.featured)},
        consent_obtained = ${Boolean(data.consent_obtained)}, is_composite = ${data.is_composite !== false},
        status = ${data.status}, updated_at = now() where id = ${id}`;
    } else {
      await sql`insert into stories (id, title, slug, display_name, excerpt, body, cover_image, program_id, featured, consent_obtained, is_composite, status, published_at)
        values (${id}, ${data.title}, ${slug}, ${data.display_name}, ${data.excerpt}, ${data.body},
          ${data.cover_image ?? null}, ${data.program_id || null}, ${Boolean(data.featured)},
          ${Boolean(data.consent_obtained)}, ${data.is_composite !== false}, ${data.status}, current_date)`;
    }
    await audit(context.userId, data.id ? "update_story" : "create_story", "stories", id);
    return { ok: true, id };
  });

export const saveImpactMetric = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string(),
        label: z.string(),
        value_text: z.string(),
        numeric_value: z.number().nullable().optional(),
        is_placeholder: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`update impact_metrics set label = ${data.label}, value_text = ${data.value_text},
      numeric_value = ${data.numeric_value ?? null}, is_placeholder = ${data.is_placeholder}, updated_at = now()
      where id = ${data.id}`;
    await audit(context.userId, "update_metric", "impact_metrics", data.id);
    return { ok: true };
  });

export const saveSiteSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        org: z.record(z.string(), z.unknown()),
        flags: z.record(z.string(), z.unknown()),
        seo: z.record(z.string(), z.unknown()).optional(),
        donation: z.record(z.string(), z.unknown()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`update site_settings set value = ${JSON.stringify(data.org)}::jsonb, updated_at = now() where key = 'org'`;
    await sql`update site_settings set value = ${JSON.stringify(data.flags)}::jsonb, updated_at = now() where key = 'flags'`;
    if (data.seo) {
      await sql`update site_settings set value = ${JSON.stringify(data.seo)}::jsonb, updated_at = now() where key = 'seo'`;
    }
    if (data.donation) {
      await sql`update site_settings set value = ${JSON.stringify(data.donation)}::jsonb, updated_at = now() where key = 'donation'`;
    }
    await audit(context.userId, "update_settings", "site_settings");
    return { ok: true };
  });

export const saveContentBlock = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string(),
        title: z.string().optional().nullable(),
        body: z.string().optional().nullable(),
        image_url: z.string().optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`update content_blocks set title = ${data.title ?? null}, body = ${data.body ?? null},
      image_url = ${data.image_url ?? null} where id = ${data.id}`;
    await audit(context.userId, "update_block", "content_blocks", data.id);
    return { ok: true };
  });

export const saveDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string(),
        title: z.string(),
        year: z.number().nullable().optional(),
        file_url: z.string().nullable().optional(),
        published: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`update documents set title = ${data.title}, year = ${data.year ?? null},
      file_url = ${data.file_url ?? null}, published = ${data.published} where id = ${data.id}`;
    await audit(context.userId, "update_document", "documents", data.id);
    return { ok: true };
  });

export const savePreset = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string(),
        label: z.string(),
        description: z.string(),
        verified: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`update donation_impact_presets set label = ${data.label}, description = ${data.description},
      verified = ${data.verified} where id = ${data.id}`;
    await audit(context.userId, "update_preset", "donation_impact_presets", data.id);
    return { ok: true };
  });

export const listAdminPrograms = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    return loadPrograms({ all: true });
  });

export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      await requireAdmin(context.userId);
      return { admin: true, userId: context.userId };
    } catch {
      return { admin: false, userId: context.userId };
    }
  });

export const listAllDocuments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    return sql<{
      id: string;
      title: string;
      doc_type: string;
      year: number | null;
      file_url: string | null;
      published: boolean;
    }>`select id, title, doc_type, year, file_url, published from documents order by title`;
  });
