import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPublicSite } from "@/lib/server/site";
import { saveCampaign } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { toast } from "sonner";
import { paiseToRupeesInt } from "@/lib/money";
import type { CampaignPublic } from "@/lib/types";

export const Route = createFileRoute("/admin/campaigns")({
  component: CampaignsAdmin,
});

function CampaignsAdmin() {
  const [list, setList] = useState<CampaignPublic[]>([]);
  const [edit, setEdit] = useState<Partial<CampaignPublic> & { goal_rupees?: number } | null>(null);
  useEffect(() => {
    getPublicSite().then((s) => setList(s.campaigns));
  }, []);
  async function save() {
    if (!edit?.title || !edit.goal_rupees) return;
    await saveCampaign({
      data: {
        id: edit.id,
        title: edit.title,
        slug: edit.slug,
        description: edit.description || "",
        short_description: edit.short_description || "",
        hero_image: edit.hero_image,
        goal_rupees: edit.goal_rupees,
        start_date: edit.start_date,
        end_date: edit.end_date,
        status: (edit.status as "draft" | "active" | "completed" | "paused") || "active",
        featured: edit.featured,
        program_id: edit.program_id,
      },
    });
    toast.success("Saved");
    setList((await getPublicSite()).campaigns);
    setEdit(null);
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy-deep">Campaigns</h1>
        <Button type="button" onClick={() => setEdit({ title: "", goal_rupees: 100000, status: "draft" })}>
          New
        </Button>
      </div>
      <p className="mt-2 text-sm text-ink-soft">Raised totals are not editable. They are sums of PAID donations.</p>
      <ul className="mt-6 space-y-2 text-sm">
        {list.map((c) => (
          <li key={c.id}>
            <button type="button" className="underline" onClick={() => setEdit({ ...c, goal_rupees: paiseToRupeesInt(c.goal_amount_paise) })}>
              {c.title} — {c.status} — {c.percent}%
            </button>
          </li>
        ))}
      </ul>
      {edit ? (
        <div className="mt-8 max-w-xl space-y-3 rounded-2xl bg-cream p-5 shadow-card">
          <Field label="Title">
            <Input value={edit.title || ""} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
          </Field>
          <Field label="Short description">
            <Textarea
              className="min-h-20"
              value={edit.short_description || ""}
              onChange={(e) => setEdit({ ...edit, short_description: e.target.value })}
            />
          </Field>
          <Field label="Full description">
            <Textarea value={edit.description || ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
          </Field>
          <Field label="Goal (rupees)">
            <Input
              type="number"
              value={edit.goal_rupees ?? 0}
              onChange={(e) => setEdit({ ...edit, goal_rupees: Number(e.target.value) })}
            />
          </Field>
          <Field label="Status">
            <select
              className="h-11 w-full rounded-lg bg-cream px-3 shadow-[0_0_0_1px_rgba(42,36,28,0.12)]"
              value={edit.status || "draft"}
              onChange={(e) => setEdit({ ...edit, status: e.target.value })}
            >
              <option>draft</option>
              <option>active</option>
              <option>paused</option>
              <option>completed</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(edit.featured)}
              onChange={(e) => setEdit({ ...edit, featured: e.target.checked })}
            />
            Featured
          </label>
          <div className="flex gap-2">
            <Button type="button" onClick={() => void save()}>
              Save
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEdit(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
