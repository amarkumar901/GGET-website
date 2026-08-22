import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAllDocuments, saveDocument } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { TrustDocument } from "@/lib/types";

export const Route = createFileRoute("/admin/documents")({
  component: DocumentsAdmin,
});

function DocumentsAdmin() {
  const [rows, setRows] = useState<TrustDocument[]>([]);
  useEffect(() => {
    listAllDocuments()
      .then(setRows)
      .catch(() => undefined);
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl text-navy-deep">Documents</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Publish only after the real PDF is uploaded or linked. Unpublished items stay hidden on the
        public transparency page.
      </p>
      <div className="mt-6 space-y-4">
        {rows.map((d) => (
          <form
            key={d.id}
            className="max-w-xl space-y-2 rounded-2xl bg-cream p-4 shadow-card"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const year = String(fd.get("year") || "");
              void saveDocument({
                data: {
                  id: d.id,
                  title: String(fd.get("title") || ""),
                  year: year ? Number(year) : null,
                  file_url: String(fd.get("file_url") || "") || null,
                  published: fd.get("published") === "on",
                },
              }).then(() => toast.success("Saved"));
            }}
          >
            <p className="text-xs uppercase text-ink-soft">{d.doc_type}</p>
            <Field label="Title">
              <Input name="title" defaultValue={d.title} />
            </Field>
            <Field label="Year">
              <Input name="year" defaultValue={d.year ?? ""} />
            </Field>
            <Field label="File URL">
              <Input name="file_url" defaultValue={d.file_url ?? ""} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={d.published} /> Published
            </label>
            <Button type="submit" size="sm">
              Save
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
