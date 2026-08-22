import { Badge } from "@/components/ui/badge";
import type { TrustDocument } from "@/lib/types";

export function publishedDocs(documents: TrustDocument[], type: string) {
  return documents.filter((d) => d.doc_type === type && d.published);
}

export function DocumentList({
  heading,
  docs,
  empty,
}: {
  heading?: string;
  docs: TrustDocument[];
  empty: string;
}) {
  return (
    <div className="rounded-2xl bg-cream p-5 shadow-card">
      {heading ? <p className="font-medium text-navy">{heading}</p> : null}
      {docs.length === 0 ? (
        <p className={heading ? "mt-2 text-sm text-ink-soft" : "text-sm text-ink-soft"}>
          {empty}{" "}
          <Badge tone="paper">None published</Badge>
        </p>
      ) : (
        <ul className={heading ? "mt-3 space-y-2" : "space-y-2"}>
          {docs.map((d) => (
            <li key={d.id} className="text-sm">
              {d.file_url ? (
                <a href={d.file_url} className="underline" target="_blank" rel="noreferrer">
                  {d.title}
                  {d.year ? ` (${d.year})` : ""}
                </a>
              ) : (
                <span className="text-ink-soft">
                  {d.title}
                  {d.year ? ` (${d.year})` : ""} — file not attached
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
