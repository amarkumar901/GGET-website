import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminEnquiries } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/enquiries")({
  component: EnquiriesAdmin,
});

function EnquiriesAdmin() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAdminEnquiries>>>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    listAdminEnquiries()
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl text-navy-deep">Enquiries</h1>
      {error ? <p className="mt-4 text-danger">{error}</p> : null}
      <ul className="mt-6 space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="rounded-2xl bg-cream p-4 text-sm shadow-card">
            <p className="font-medium text-navy">
              {r.kind} · {r.full_name} · {r.email}
            </p>
            <p className="mt-1 text-ink-soft">{r.subject || r.organisation}</p>
            <p className="mt-2 whitespace-pre-wrap">{r.message}</p>
          </li>
        ))}
        {rows.length === 0 && !error ? <li className="text-ink-soft">None yet</li> : null}
      </ul>
    </div>
  );
}
