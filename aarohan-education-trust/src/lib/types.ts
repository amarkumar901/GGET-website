export type OrgSettings = {
  trust_name: string;
  short_name: string;
  founder_name: string;
  tagline: string;
  supporting_message: string;
  location: string;
  registered_address: string;
  email: string;
  phone: string;
  trust_registration_number: string;
  pan: string;
  twelve_a: string;
  eighty_g: string;
  fcra_status: string;
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  mission: string;
  vision: string;
  receipt_prefix: string;
  authorised_signatory_name: string;
  authorised_signatory_title: string;
  hero_image: string;
  founder_image: string;
  demo: boolean;
};

export type FlagSettings = {
  foreign_donations_enabled: boolean;
  is_80g_approved: boolean;
  monthly_donations_enabled: boolean;
  demo_banner: boolean;
  foreign_donation_message: string;
};

export type SeoSettings = {
  default_title: string;
  default_description: string;
  ga_id: string;
  gtm_id: string;
  meta_pixel_id: string;
};

export type DonationSettings = {
  min_paise: number;
  max_paise: number;
  preset_paise: number[];
  currency: string;
};

export type Program = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  long_description: string;
  cover_image: string | null;
  gallery: string[];
  impact_metrics: { label: string; value: string }[];
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
};

export type CampaignPublic = {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  hero_image: string | null;
  goal_amount_paise: number;
  raised_paise: number;
  donor_count: number;
  percent: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  featured: boolean;
  program_id: string | null;
  program_title: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type Story = {
  id: string;
  title: string;
  slug: string;
  display_name: string;
  cover_image: string | null;
  excerpt: string;
  body: string;
  program_id: string | null;
  program_title: string | null;
  published_at: string | null;
  featured: boolean;
  consent_obtained: boolean;
  is_composite: boolean;
  seo_title: string | null;
  seo_description: string | null;
  status: string;
};

export type ImpactMetric = {
  id: string;
  label: string;
  value_text: string;
  numeric_value: number | null;
  suffix: string | null;
  sort_order: number;
  is_placeholder: boolean;
};

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  url: string | null;
  sort_order: number;
  published: boolean;
};

export type TrustDocument = {
  id: string;
  title: string;
  doc_type: string;
  year: number | null;
  file_url: string | null;
  published: boolean;
};

export type ImpactPreset = {
  id: string;
  amount_paise: number;
  label: string;
  description: string;
  verified: boolean;
  sort_order: number;
};

export type TimelineItem = {
  id: string;
  year: string;
  title: string;
  body: string;
  sort_order: number;
};

export type ContentBlock = {
  id: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  extra: Record<string, string | number | boolean>;
};

export type PublicSite = {
  org: OrgSettings;
  flags: FlagSettings;
  seo: SeoSettings;
  donation: DonationSettings;
  programs: Program[];
  campaigns: CampaignPublic[];
  stories: Story[];
  metrics: ImpactMetric[];
  partners: Partner[];
  documents: TrustDocument[];
  presets: ImpactPreset[];
  timeline: TimelineItem[];
  blocks: Record<string, ContentBlock>;
};

export const DEFAULT_ORG: OrgSettings = {
  trust_name: "Aarohan Education Trust",
  short_name: "Aarohan",
  founder_name: "Meera Krishnan",
  tagline: "Education can change a child's entire future.",
  supporting_message:
    "We're working to make sure financial circumstances never decide how far a child can dream.",
  location: "Bengaluru, Karnataka, India",
  registered_address: "Bengaluru, Karnataka, India",
  email: "hello@aarohan.example",
  phone: "+91 80 0000 0000",
  trust_registration_number: "",
  pan: "",
  twelve_a: "",
  eighty_g: "",
  fcra_status: "",
  instagram: "",
  facebook: "",
  youtube: "",
  linkedin: "",
  mission:
    "Provide education and educational opportunities to children from economically disadvantaged communities.",
  vision:
    "Create a future where financial circumstances never determine a child's ability to receive quality education.",
  receipt_prefix: "AAROHAN",
  authorised_signatory_name: "Meera Krishnan",
  authorised_signatory_title: "Managing Trustee",
  hero_image: "/images/hero.jpg",
  founder_image: "/images/founder.jpg",
  demo: true,
};

export const DEFAULT_FLAGS: FlagSettings = {
  foreign_donations_enabled: false,
  is_80g_approved: false,
  monthly_donations_enabled: false,
  demo_banner: true,
  foreign_donation_message:
    "We are not currently able to accept contributions from foreign citizens or entities. If you would like to support the trust, please write to us and we will share the appropriate next step.",
};

export const DEFAULT_SEO: SeoSettings = {
  default_title: "Aarohan Education Trust",
  default_description:
    "A charitable educational trust working so that financial circumstances never decide how far a child can dream.",
  ga_id: "",
  gtm_id: "",
  meta_pixel_id: "",
};

export const DEFAULT_DONATION: DonationSettings = {
  min_paise: 10000,
  max_paise: 5_00_00_000,
  preset_paise: [50000, 100000, 250000, 500000, 1000000],
  currency: "INR",
};
