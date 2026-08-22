import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPublicSite } from "@/lib/server/site";
import { saveSiteSettings } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { toast } from "sonner";
import type { DonationSettings, FlagSettings, OrgSettings, SeoSettings } from "@/lib/types";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const [org, setOrg] = useState<OrgSettings | null>(null);
  const [flags, setFlags] = useState<FlagSettings | null>(null);
  const [seo, setSeo] = useState<SeoSettings | null>(null);
  const [donation, setDonation] = useState<DonationSettings | null>(null);
  useEffect(() => {
    getPublicSite().then((s) => {
      setOrg(s.org);
      setFlags(s.flags);
      setSeo(s.seo);
      setDonation(s.donation);
    });
  }, []);
  if (!org || !flags || !seo || !donation) return <p>Loading…</p>;
  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void saveSiteSettings({
          data: {
            org: org as unknown as Record<string, unknown>,
            flags: flags as unknown as Record<string, unknown>,
            seo: seo as unknown as Record<string, unknown>,
            donation: donation as unknown as Record<string, unknown>,
          },
        }).then(() => toast.success("Settings saved"));
      }}
    >
      <h1 className="font-display text-3xl text-navy-deep">Trust settings</h1>
      {(
        [
          ["trust_name", "Trust name"],
          ["short_name", "Short name"],
          ["founder_name", "Founder name"],
          ["tagline", "Tagline"],
          ["location", "Location"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["trust_registration_number", "Registration number"],
          ["pan", "Organisation PAN"],
          ["twelve_a", "12A details"],
          ["eighty_g", "80G details"],
          ["fcra_status", "FCRA status"],
        ] as const
      ).map(([k, label]) => (
        <Field key={k} label={label}>
          <Input value={String(org[k] ?? "")} onChange={(e) => setOrg({ ...org, [k]: e.target.value })} />
        </Field>
      ))}
      <Field label="Mission">
        <Textarea value={org.mission} onChange={(e) => setOrg({ ...org, mission: e.target.value })} />
      </Field>
      <Field label="Vision">
        <Textarea value={org.vision} onChange={(e) => setOrg({ ...org, vision: e.target.value })} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={flags.is_80g_approved}
          onChange={(e) => setFlags({ ...flags, is_80g_approved: e.target.checked })}
        />
        80G approved (do not enable without the real certificate)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={flags.foreign_donations_enabled}
          onChange={(e) => setFlags({ ...flags, foreign_donations_enabled: e.target.checked })}
        />
        Accept foreign donations (FCRA — default off)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={flags.monthly_donations_enabled}
          onChange={(e) => setFlags({ ...flags, monthly_donations_enabled: e.target.checked })}
        />
        Monthly donations enabled
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={flags.demo_banner}
          onChange={(e) => setFlags({ ...flags, demo_banner: e.target.checked })}
        />
        Show demonstration banner
      </label>
      <Field label="Google Analytics ID">
        <Input value={seo.ga_id} onChange={(e) => setSeo({ ...seo, ga_id: e.target.value })} />
      </Field>
      <Button type="submit">Save settings</Button>
    </form>
  );
}
