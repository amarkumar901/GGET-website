import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPublicSite } from "@/lib/server/site";
import { saveContentBlock, saveImpactMetric, savePreset } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { toast } from "sonner";
import type { ContentBlock, ImpactMetric, ImpactPreset } from "@/lib/types";

export const Route = createFileRoute("/admin/content")({
  component: ContentAdmin,
});

function ContentAdmin() {
  const [blocks, setBlocks] = useState<Record<string, ContentBlock>>({});
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [presets, setPresets] = useState<ImpactPreset[]>([]);
  useEffect(() => {
    getPublicSite().then((s) => {
      setBlocks(s.blocks);
      setMetrics(s.metrics);
      setPresets(s.presets);
    });
  }, []);
  return (
    <div className="space-y-12">
      <section>
        <h1 className="font-display text-3xl text-navy-deep">Homepage content</h1>
        <div className="mt-6 space-y-6">
          {Object.values(blocks).map((b) => (
            <form
              key={b.id}
              className="max-w-2xl space-y-2 rounded-2xl bg-cream p-5 shadow-card"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void saveContentBlock({
                  data: {
                    id: b.id,
                    title: String(fd.get("title") || ""),
                    body: String(fd.get("body") || ""),
                    image_url: String(fd.get("image_url") || ""),
                  },
                }).then(() => toast.success("Saved " + b.id));
              }}
            >
              <p className="text-xs tracking-wide text-ink-soft uppercase">{b.id}</p>
              <Field label="Title">
                <Input name="title" defaultValue={b.title || ""} />
              </Field>
              <Field label="Body">
                <Textarea name="body" defaultValue={b.body || ""} />
              </Field>
              <Field label="Image URL">
                <Input name="image_url" defaultValue={b.image_url || ""} />
              </Field>
              <Button type="submit" size="sm">
                Save
              </Button>
            </form>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl text-navy-deep">Impact metrics</h2>
        <p className="text-sm text-ink-soft">Uncheck placeholder only when the figure is verified.</p>
        <div className="mt-4 space-y-3">
          {metrics.map((m) => (
            <form
              key={m.id}
              className="flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const numeric = String(fd.get("numeric") || "");
                void saveImpactMetric({
                  data: {
                    id: m.id,
                    label: String(fd.get("label") || ""),
                    value_text: String(fd.get("value_text") || ""),
                    numeric_value: numeric ? Number(numeric) : null,
                    is_placeholder: fd.get("ph") === "on",
                  },
                }).then(() => toast.success("Saved metric"));
              }}
            >
              <Input name="label" defaultValue={m.label} className="w-40" />
              <Input name="value_text" defaultValue={m.value_text} className="w-24" />
              <Input name="numeric" defaultValue={m.numeric_value ?? ""} className="w-24" placeholder="numeric" />
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" name="ph" defaultChecked={m.is_placeholder} /> placeholder
              </label>
              <Button type="submit" size="sm" variant="outline">
                Save
              </Button>
            </form>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl text-navy-deep">Donation impact presets</h2>
        <div className="mt-4 space-y-3">
          {presets.map((p) => (
            <form
              key={p.id}
              className="max-w-xl space-y-2 rounded-2xl bg-cream p-4 shadow-card"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void savePreset({
                  data: {
                    id: p.id,
                    label: String(fd.get("label") || ""),
                    description: String(fd.get("description") || ""),
                    verified: fd.get("verified") === "on",
                  },
                }).then(() => toast.success("Saved preset"));
              }}
            >
              <Field label="Label">
                <Input name="label" defaultValue={p.label} />
              </Field>
              <Field label="Description">
                <Textarea name="description" className="min-h-20" defaultValue={p.description} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="verified" defaultChecked={p.verified} />
                Verified rupee-to-outcome relationship
              </label>
              <Button type="submit" size="sm">
                Save
              </Button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
