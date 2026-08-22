import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignCard, ProgramCard, StoryCard } from "@/components/cards";
import { useSite } from "@/components/site-context";
import { formatInrCompact } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setInView(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function Metric({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder: boolean;
}) {
  return (
    <div className="text-center">
      <p className="font-display text-4xl tabular-nums text-navy-deep sm:text-5xl">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
      {placeholder ? (
        <p className="mt-1 text-[11px] tracking-wide text-ink-soft/80 uppercase">To be published</p>
      ) : null}
    </div>
  );
}

export function Homepage() {
  const site = useSite();
  const { org, flags, programs, campaigns, stories, metrics, partners, presets, blocks } = site;
  const problem = blocks.problem;
  const founder = blocks.founder_note;
  const cta = blocks.final_cta;
  const hero = blocks.hero;
  const { ref: heroRef } = useInView<HTMLDivElement>();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NGO",
            name: org.trust_name,
            slogan: org.tagline,
            email: org.email,
            telephone: org.phone,
            address: org.location,
            description: org.mission,
          }),
        }}
      />

      <section className="relative min-h-[88dvh] overflow-hidden bg-navy-deep">
        <img
          src={org.hero_image || hero?.image_url || "/images/hero.jpg"}
          alt="A classroom photographed from behind so children are not identifiable"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/55 to-navy-deep/20" />
        <div
          ref={heroRef}
          className="relative mx-auto flex min-h-[88dvh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20"
        >
          <p className="rise-in text-sm font-medium tracking-[0.22em] text-amber-soft uppercase">
            {org.trust_name}
          </p>
          <h1 className="rise-in stagger-1 mt-4 max-w-3xl font-display text-4xl text-cream sm:text-6xl sm:leading-[1.05]">
            {hero?.title || org.tagline}
          </h1>
          <p className="rise-in stagger-2 mt-5 max-w-xl text-lg text-paper/85">
            {hero?.body || org.supporting_message}
          </p>
          <div className="rise-in stagger-3 mt-8 flex flex-wrap gap-3">
            <Button asChild variant="amber" size="lg">
              <Link to="/donate">Donate Now</Link>
            </Button>
            <Button asChild variant="cream" size="lg">
              <Link to="/work">See Our Work</Link>
            </Button>
          </div>
          <a
            href="#impact"
            className="mt-12 inline-flex w-fit items-center gap-2 text-sm text-paper/70"
          >
            <ChevronDown className="size-4" /> Scroll
          </a>
        </div>
      </section>

      <section id="impact" className="border-b border-line bg-cream">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
          {metrics.map((m) => (
            <Metric key={m.id} label={m.label} value={m.value_text} placeholder={m.is_placeholder} />
          ))}
        </div>
        <p className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-ink-soft sm:px-6">
          Impact figures appear only after the trust enters verified numbers in the admin panel. Dashes
          mean the data has not been published yet.
        </p>
      </section>

      {problem ? (
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl">
            <img
              src={problem.image_url || "/images/problem.jpg"}
              alt="An empty classroom doorway at late afternoon"
              className="photo aspect-[4/3] w-full object-cover lg:aspect-[5/6]"
            />
          </div>
          <div>
            <p className="text-sm font-medium tracking-[0.18em] text-amber-deep uppercase">The problem</p>
            <h2 className="mt-3 font-display text-4xl text-navy-deep sm:text-5xl">{problem.title}</h2>
            <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-ink">
              {(problem.body || "").split("\n\n").map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-medium tracking-[0.18em] text-amber-deep uppercase">Our approach</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl text-navy-deep">Programmes that keep a child in the story of their own education</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-sm font-medium tracking-[0.18em] text-amber-deep uppercase">Your contribution</p>
        <h2 className="mt-3 font-display text-4xl text-navy-deep">See what your contribution can make possible</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Amounts below are giving levels, not guaranteed packages. A specific rupee amount is never
          claimed to produce a specific result unless an administrator has verified that relationship.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {presets.map((p) => (
            <Link
              key={p.id}
              to="/donate"
              search={{ amount: String(Math.trunc(p.amount_paise / 100)) }}
              className="rounded-2xl bg-cream p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <p className="font-display text-3xl text-navy-deep">{formatInrCompact(p.amount_paise)}</p>
              <p className="mt-2 font-medium text-navy">{p.label}</p>
              <p className="mt-2 text-sm text-ink-soft">{p.description}</p>
              {!p.verified ? (
                <Badge tone="paper" className="mt-3">
                  Unverified relationship
                </Badge>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      {campaigns.length > 0 ? (
        <section className="bg-navy py-20 text-paper">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-sm font-medium tracking-[0.18em] text-amber-soft uppercase">Campaigns</p>
            <h2 className="mt-3 font-display text-4xl text-cream">Work you can fund right now</h2>
            <p className="mt-3 max-w-2xl text-paper/70">
              Progress is calculated from verified successful donations, never from a number typed into
              the page.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {stories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-amber-deep uppercase">Stories</p>
              <h2 className="mt-3 font-display text-4xl text-navy-deep">How a year of learning can feel</h2>
            </div>
            <Link to="/stories" className="text-sm font-medium text-amber-deep">
              All stories
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {stories.slice(0, 3).map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      ) : null}

      {founder ? (
        <section className="bg-cream">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="overflow-hidden rounded-3xl">
              <img
                src={org.founder_image || founder.image_url || "/images/founder.jpg"}
                alt={`Portrait of ${org.founder_name} — demonstration placeholder`}
                className="photo aspect-[3/4] w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-amber-deep uppercase">Founder</p>
              <h2 className="mt-3 font-display text-4xl text-navy-deep">{founder.title}</h2>
              <p className="mt-2 text-lg text-navy">{org.founder_name}</p>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink">{founder.body}</p>
              <Button asChild variant="outline" className="mt-8">
                <Link to="/about/founder">Read our story</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-sm font-medium tracking-[0.18em] text-amber-deep uppercase">Transparency</p>
        <h2 className="mt-3 font-display text-4xl text-navy-deep">Your trust matters to us</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Registrations and reports appear here only when an administrator has entered them and marked
          them published. Empty cards mean the document is not yet on record — not that it has been
          verified.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "registration", t: "Trust registration", on: Boolean(org.trust_registration_number) },
            { k: "12a", t: "12A", on: Boolean(org.twelve_a) },
            { k: "80g", t: "80G", on: flags.is_80g_approved && Boolean(org.eighty_g) },
            { k: "fcra", t: "FCRA", on: flags.foreign_donations_enabled && Boolean(org.fcra_status) },
          ].map((item) => (
            <div key={item.k} className="rounded-2xl bg-cream p-5 shadow-card">
              <p className="font-medium text-navy">{item.t}</p>
              <p className="mt-2 text-sm text-ink-soft">
                {item.on ? "On record — see Transparency" : "Not published yet"}
              </p>
            </div>
          ))}
        </div>
        <Button asChild variant="outline" className="mt-8">
          <Link to="/transparency">Open the transparency page</Link>
        </Button>
      </section>

      {partners.length > 0 ? (
        <section className="border-t border-line py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-center text-sm font-medium tracking-[0.18em] text-ink-soft uppercase">
              Partners
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
              {partners.map((p) => (
                <span key={p.id} className="text-lg font-medium text-navy/70">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-navy-deep">
        <img
          src={cta?.image_url || "/images/school-sunrise.jpg"}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h2 className="font-display text-4xl text-cream sm:text-5xl">
            {cta?.title || "A small opportunity can change the direction of a life."}
          </h2>
          <p className="mt-4 text-paper/80">{cta?.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="amber" size="lg">
              <Link to="/donate">Donate Now</Link>
            </Button>
            <Button asChild variant="cream" size="lg">
              <Link to="/volunteer">Volunteer With Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
