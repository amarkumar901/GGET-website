import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { asJson } from "@/lib/utils";
import { asPaise, campaignPercent } from "@/lib/money";
import {
  DEFAULT_DONATION,
  DEFAULT_FLAGS,
  DEFAULT_ORG,
  DEFAULT_SEO,
  type CampaignPublic,
  type ContentBlock,
  type ImpactMetric,
  type ImpactPreset,
  type Partner,
  type Program,
  type PublicSite,
  type Story,
  type TimelineItem,
  type TrustDocument,
} from "@/lib/types";
import { asInt, getDonationSettings, getFlags, getOrg, getSeo, parseGallery } from "./helpers";

type CampaignRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  hero_image: string | null;
  goal_amount_paise: unknown;
  start_date: string | null;
  end_date: string | null;
  status: string;
  featured: boolean;
  program_id: string | null;
  program_title: string | null;
  seo_title: string | null;
  seo_description: string | null;
  raised_paise: unknown;
  donor_count: unknown;
};

function mapCampaign(r: CampaignRow): CampaignPublic {
  const goal = asPaise(r.goal_amount_paise);
  const raised = asPaise(r.raised_paise);
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    description: r.description,
    short_description: r.short_description,
    hero_image: r.hero_image,
    goal_amount_paise: goal,
    raised_paise: raised,
    donor_count: asInt(r.donor_count),
    percent: campaignPercent(raised, goal),
    start_date: r.start_date,
    end_date: r.end_date,
    status: r.status,
    featured: Boolean(r.featured),
    program_id: r.program_id,
    program_title: r.program_title,
    seo_title: r.seo_title,
    seo_description: r.seo_description,
  };
}

const CAMPAIGN_SELECT = `
  c.id, c.title, c.slug, c.description, c.short_description, c.hero_image,
  c.goal_amount_paise, c.start_date::text as start_date, c.end_date::text as end_date,
  c.status, c.featured, c.program_id, p.title as program_title,
  c.seo_title, c.seo_description,
  coalesce((select sum(d.amount_paise) from donations d where d.campaign_id = c.id and d.status = 'PAID'), 0) as raised_paise,
  coalesce((select count(*) from donations d where d.campaign_id = c.id and d.status = 'PAID'), 0) as donor_count
`;

export async function loadCampaigns(opts?: { featured?: boolean; status?: string; slug?: string }) {
  const sql = await getSql();
  let query = `select ${CAMPAIGN_SELECT} from campaigns c left join programs p on p.id = c.program_id where 1=1`;
  const params: unknown[] = [];
  if (opts?.featured) query += ` and c.featured = true`;
  if (opts?.status) {
    params.push(opts.status);
    query += ` and c.status = $${params.length}`;
  } else {
    query += ` and c.status in ('active','completed')`;
  }
  if (opts?.slug) {
    params.push(opts.slug);
    query += ` and c.slug = $${params.length}`;
  }
  query += ` order by c.featured desc, c.created_at desc`;
  const rows = await sql.query<CampaignRow>(query, params);
  return rows.map(mapCampaign);
}

export async function loadPrograms(opts?: { slug?: string; all?: boolean }) {
  const sql = await getSql();
  const rows = opts?.slug
    ? await sql.query<Record<string, unknown>>(
        `select * from programs where slug = $1 limit 1`,
        [opts.slug],
      )
    : await sql.query<Record<string, unknown>>(
        `select * from programs ${opts?.all ? "" : "where status = 'published'"} order by sort_order, title`,
      );
  return rows.map(
    (r): Program => ({
      id: String(r.id),
      title: String(r.title),
      slug: String(r.slug),
      short_description: String(r.short_description ?? ""),
      long_description: String(r.long_description ?? ""),
      cover_image: (r.cover_image as string) ?? null,
      gallery: parseGallery(r.gallery),
      impact_metrics: asJson(r.impact_metrics, []),
      status: String(r.status),
      seo_title: (r.seo_title as string) ?? null,
      seo_description: (r.seo_description as string) ?? null,
      sort_order: asInt(r.sort_order),
    }),
  );
}

export async function loadStories(opts?: { slug?: string; featured?: boolean; programId?: string }) {
  const sql = await getSql();
  let q = `select s.*, p.title as program_title, s.published_at::text as published_at
    from stories s left join programs p on p.id = s.program_id where s.status = 'published'`;
  const params: unknown[] = [];
  if (opts?.slug) {
    params.push(opts.slug);
    q += ` and s.slug = $${params.length}`;
  }
  if (opts?.featured) q += ` and s.featured = true`;
  if (opts?.programId) {
    params.push(opts.programId);
    q += ` and s.program_id = $${params.length}`;
  }
  q += ` order by s.published_at desc nulls last, s.created_at desc`;
  const rows = await sql.query<Record<string, unknown>>(q, params);
  return rows.map(
    (r): Story => ({
      id: String(r.id),
      title: String(r.title),
      slug: String(r.slug),
      display_name: String(r.display_name),
      cover_image: (r.cover_image as string) ?? null,
      excerpt: String(r.excerpt ?? ""),
      body: String(r.body ?? ""),
      program_id: (r.program_id as string) ?? null,
      program_title: (r.program_title as string) ?? null,
      published_at: (r.published_at as string) ?? null,
      featured: Boolean(r.featured),
      consent_obtained: Boolean(r.consent_obtained),
      is_composite: Boolean(r.is_composite),
      seo_title: (r.seo_title as string) ?? null,
      seo_description: (r.seo_description as string) ?? null,
      status: String(r.status),
    }),
  );
}

export const getPublicSite = createServerFn({ method: "GET" }).handler(async (): Promise<PublicSite> => {
  const sql = await getSql();
  const [org, flags, seo, donation, programs, campaigns, stories] = await Promise.all([
    getOrg(),
    getFlags(),
    getSeo(),
    getDonationSettings(),
    loadPrograms(),
    loadCampaigns({ status: "active" }),
    loadStories(),
  ]);

  const metrics = await sql<ImpactMetric>`
    select id, label, value_text, numeric_value, suffix, sort_order, is_placeholder
    from impact_metrics order by sort_order`;
  const partners = await sql<Partner>`
    select id, name, logo_url, url, sort_order, published from partners
    where published = true order by sort_order, name`;
  const documents = await sql<TrustDocument>`
    select id, title, doc_type, year, file_url, published from documents
    where published = true order by year desc nulls last, title`;
  const presets = await sql<ImpactPreset>`
    select id, amount_paise, label, description, verified, sort_order
    from donation_impact_presets order by sort_order`;
  const timeline = await sql<TimelineItem>`
    select id, year, title, body, sort_order from founder_timeline order by sort_order`;
  const blockRows = await sql<{
    id: string;
    title: string | null;
    body: string | null;
    image_url: string | null;
    extra: unknown;
  }>`select id, title, body, image_url, extra from content_blocks`;

  const blocks: Record<string, ContentBlock> = {};
  for (const b of blockRows) {
    blocks[b.id] = {
      id: b.id,
      title: b.title,
      body: b.body,
      image_url: b.image_url,
      extra: asJson(b.extra, {} as Record<string, string | number | boolean>),
    };
  }

  return {
    org: { ...DEFAULT_ORG, ...org },
    flags: { ...DEFAULT_FLAGS, ...flags },
    seo: { ...DEFAULT_SEO, ...seo },
    donation: { ...DEFAULT_DONATION, ...donation },
    programs,
    campaigns,
    stories,
    metrics: metrics.map((m) => ({
      ...m,
      numeric_value: m.numeric_value == null ? null : asInt(m.numeric_value),
      is_placeholder: Boolean(m.is_placeholder),
    })),
    partners,
    documents,
    presets: presets.map((p) => ({
      ...p,
      amount_paise: asPaise(p.amount_paise),
      verified: Boolean(p.verified),
    })),
    timeline,
    blocks,
  };
});

export const getProgramBySlug = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const programs = await loadPrograms({ slug: data.slug });
    const program = programs[0];
    if (!program) return null;
    const [campaigns, stories] = await Promise.all([
      loadCampaigns({ status: "active" }).then((all) =>
        all.filter((c) => c.program_id === program.id),
      ),
      loadStories({ programId: program.id }),
    ]);
    return { program, campaigns, stories };
  });

export const getCampaignBySlug = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const list = await loadCampaigns({ slug: data.slug, status: undefined });
    const campaign = list.find((c) => c.slug === data.slug && c.status !== "draft");
    return campaign ?? null;
  });

export const listActiveCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  return loadCampaigns({ status: "active" });
});

export const getStoryBySlug = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const stories = await loadStories({ slug: data.slug });
    const story = stories[0];
    if (!story) return null;
    const related = (await loadStories()).filter((s) => s.id !== story.id).slice(0, 3);
    return { story, related };
  });

export const getPaymentMode = createServerFn({ method: "GET" }).handler(async () => {
  const { razorpayEnv } = await import("./helpers");
  const env = razorpayEnv();
  return {
    mode: env.live ? ("razorpay" as const) : ("demo" as const),
    keyId: env.live ? env.keyId : "",
  };
});
