-- Aarohan Education Trust — application schema
-- IDs are application-generated text (no pgcrypto). Monetary values are integer paise.

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists admins (
  user_id text primary key,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists programs (
  id text primary key,
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  long_description text not null default '',
  cover_image text,
  gallery jsonb not null default '[]',
  impact_metrics jsonb not null default '[]',
  status text not null default 'published',
  seo_title text,
  seo_description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaigns (
  id text primary key,
  title text not null,
  slug text not null unique,
  description text not null default '',
  short_description text not null default '',
  hero_image text,
  goal_amount_paise bigint not null default 0,
  start_date date,
  end_date date,
  status text not null default 'draft',
  featured boolean not null default false,
  program_id text references programs(id),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists donors (
  id text primary key,
  full_name text not null,
  email text not null,
  phone text,
  pan text,
  address text,
  city text,
  state text,
  pin text,
  citizenship_category text not null default 'indian',
  created_at timestamptz not null default now()
);
create index if not exists donors_email_idx on donors (email);

create table if not exists donations (
  id text primary key,
  donor_id text not null references donors(id),
  campaign_id text references campaigns(id),
  program_id text references programs(id),
  amount_paise bigint not null,
  currency text not null default 'INR',
  frequency text not null default 'one_time',
  status text not null,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  payment_method text,
  wants_tax_docs boolean not null default false,
  receipt_number text unique,
  access_token text not null unique,
  demo boolean not null default false,
  campaign_title_snapshot text,
  program_title_snapshot text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists donations_status_idx on donations (status);
create index if not exists donations_campaign_idx on donations (campaign_id);
create index if not exists donations_created_idx on donations (created_at desc);

create table if not exists payment_events (
  id text primary key,
  provider_event_id text unique,
  donation_id text references donations(id),
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

create table if not exists receipts (
  id text primary key,
  donation_id text not null unique references donations(id),
  receipt_number text not null unique,
  issued_at timestamptz not null default now(),
  email_status text not null default 'pending'
);

create table if not exists stories (
  id text primary key,
  title text not null,
  slug text not null unique,
  display_name text not null,
  cover_image text,
  excerpt text not null default '',
  body text not null default '',
  program_id text references programs(id),
  published_at date,
  featured boolean not null default false,
  consent_obtained boolean not null default false,
  is_composite boolean not null default true,
  seo_title text,
  seo_description text,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists impact_metrics (
  id text primary key,
  label text not null,
  value_text text not null,
  numeric_value bigint,
  suffix text,
  sort_order int not null default 0,
  is_placeholder boolean not null default true,
  year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists partners (
  id text primary key,
  name text not null,
  logo_url text,
  url text,
  sort_order int not null default 0,
  published boolean not null default true
);

create table if not exists documents (
  id text primary key,
  title text not null,
  doc_type text not null,
  year int,
  file_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists volunteer_applications (
  id text primary key,
  full_name text not null,
  email text not null,
  phone text,
  city text,
  profession text,
  area_of_interest text,
  availability text,
  message text,
  consent boolean not null default false,
  status text not null default 'NEW',
  created_at timestamptz not null default now()
);

create table if not exists contact_submissions (
  id text primary key,
  kind text not null default 'contact',
  full_name text not null,
  email text not null,
  phone text,
  organisation text,
  designation text,
  subject text,
  partnership_interest text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists media (
  id text primary key,
  url text not null,
  alt_text text,
  caption text,
  consent_flag boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id text primary key,
  user_id text not null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on audit_logs (created_at desc);

create table if not exists donation_impact_presets (
  id text primary key,
  amount_paise bigint not null,
  label text not null,
  description text not null,
  verified boolean not null default false,
  sort_order int not null default 0
);

create table if not exists founder_timeline (
  id text primary key,
  year text not null,
  title text not null,
  body text not null,
  sort_order int not null default 0
);

create table if not exists content_blocks (
  id text primary key,
  title text,
  body text,
  image_url text,
  extra jsonb not null default '{}'
);

create table if not exists rate_limits (
  key text primary key,
  count int not null default 0,
  window_start timestamptz not null default now()
);

create table if not exists receipt_counters (
  fy text primary key,
  last_number int not null default 0
);
