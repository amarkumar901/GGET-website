import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPublicSite } from "@/lib/server/site";
import { saveProgram } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { toast } from "sonner";
import type { Program } from "@/lib/types";

export const Route = createFileRoute("/admin/programs")({
  component: ProgramsAdmin,
});

function ProgramsAdmin() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [edit, setEdit] = useState<Partial<Program> | null>(null);
  useEffect(() => {
    getPublicSite().then((s) => setPrograms(s.programs));
  }, []);
  async function save() {
    if (!edit?.title) return;
    await saveProgram({
      data: {
        id: edit.id,
        title: edit.title,
        slug: edit.slug,
        short_description: edit.short_description || "",
        long_description: edit.long_description || "",
        cover_image: edit.cover_image,
        status: (edit.status as "draft" | "published" | "archived") || "published",
        seo_title: edit.seo_title,
        seo_description: edit.seo_description,
      },
    });
    toast.success("Saved");
    const s = await getPublicSite();
    setPrograms(s.programs);
    setEdit(null);
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy-deep">Programmes</h1>
        <Button type="button" onClick={() => setEdit({ title: "", status: "published" })}>
          New
        </Button>
      </div>
      <ul className="mt-6 space-y-2">
        {programs.map((p) => (
          <li key={p.id}>
            <button type="button" className="text-navy underline" onClick={() => setEdit(p)}>
              {p.title}
            </button>
          </li>
        ))}
      </ul>
      {edit ? (
        <div className="mt-8 max-w-xl space-y-3 rounded-2xl bg-cream p-5 shadow-card">
          <Field label="Title">
            <Input value={edit.title || ""} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
          </Field>
          <Field label="Slug">
            <Input value={edit.slug || ""} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} />
          </Field>
          <Field label="Short description">
            <Textarea
              className="min-h-20"
              value={edit.short_description || ""}
              onChange={(e) => setEdit({ ...edit, short_description: e.target.value })}
            />
          </Field>
          <Field label="Long description">
            <Textarea
              value={edit.long_description || ""}
              onChange={(e) => setEdit({ ...edit, long_description: e.target.value })}
            />
          </Field>
          <Field label="Cover image URL">
            <Input
              value={edit.cover_image || ""}
              onChange={(e) => setEdit({ ...edit, cover_image: e.target.value })}
            />
          </Field>
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
