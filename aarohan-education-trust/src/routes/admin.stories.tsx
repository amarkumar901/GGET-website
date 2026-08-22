import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPublicSite } from "@/lib/server/site";
import { saveStory } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { toast } from "sonner";
import type { Story } from "@/lib/types";

export const Route = createFileRoute("/admin/stories")({
  component: StoriesAdmin,
});

function StoriesAdmin() {
  const [list, setList] = useState<Story[]>([]);
  const [edit, setEdit] = useState<Partial<Story> | null>(null);
  useEffect(() => {
    getPublicSite().then((s) => setList(s.stories));
  }, []);
  async function save() {
    if (!edit?.title || !edit.display_name) return;
    await saveStory({
      data: {
        id: edit.id,
        title: edit.title,
        slug: edit.slug,
        display_name: edit.display_name,
        excerpt: edit.excerpt || "",
        body: edit.body || "",
        cover_image: edit.cover_image,
        program_id: edit.program_id,
        featured: edit.featured,
        consent_obtained: edit.consent_obtained,
        is_composite: edit.is_composite,
        status: (edit.status as "draft" | "published") || "published",
      },
    });
    toast.success("Saved");
    setList((await getPublicSite()).stories);
    setEdit(null);
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy-deep">Stories</h1>
        <Button type="button" onClick={() => setEdit({ title: "", display_name: "", is_composite: true })}>
          New
        </Button>
      </div>
      <ul className="mt-6 space-y-2 text-sm">
        {list.map((s) => (
          <li key={s.id}>
            <button type="button" className="underline" onClick={() => setEdit(s)}>
              {s.title} {s.is_composite ? "(composite)" : ""} {s.consent_obtained ? "" : "· no consent"}
            </button>
          </li>
        ))}
      </ul>
      {edit ? (
        <div className="mt-8 max-w-xl space-y-3 rounded-2xl bg-cream p-5 shadow-card">
          <Field label="Title">
            <Input value={edit.title || ""} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
          </Field>
          <Field label="Display name (anonymised)">
            <Input
              value={edit.display_name || ""}
              onChange={(e) => setEdit({ ...edit, display_name: e.target.value })}
            />
          </Field>
          <Field label="Excerpt">
            <Textarea className="min-h-20" value={edit.excerpt || ""} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} />
          </Field>
          <Field label="Body">
            <Textarea value={edit.body || ""} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(edit.consent_obtained)}
              onChange={(e) => setEdit({ ...edit, consent_obtained: e.target.checked })}
            />
            Media / story consent obtained
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={edit.is_composite !== false}
              onChange={(e) => setEdit({ ...edit, is_composite: e.target.checked })}
            />
            Composite / illustrative (not a real identified child)
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
