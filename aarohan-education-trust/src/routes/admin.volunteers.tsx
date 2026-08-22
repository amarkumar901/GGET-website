import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminVolunteers, updateVolunteerStatus } from "@/lib/server/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/volunteers")({
  component: VolunteersAdmin,
});

const STATUSES = ["NEW", "CONTACTED", "APPROVED", "REJECTED", "COMPLETED"] as const;

function VolunteersAdmin() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAdminVolunteers>>>([]);
  useEffect(() => {
    listAdminVolunteers().then(setRows).catch(() => undefined);
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl text-navy-deep">Volunteers</h1>
      <ul className="mt-6 space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="rounded-2xl bg-cream p-4 text-sm shadow-card">
            <p className="font-medium text-navy">
              {r.full_name} · {r.email}
            </p>
            <p className="text-ink-soft">
              {r.city} · {r.profession} · {r.area_of_interest} · {r.availability}
            </p>
            <p className="mt-2">{r.message}</p>
            <select
              className="mt-3 h-10 rounded-lg bg-paper px-2"
              value={r.status}
              onChange={(e) => {
                const status = e.target.value as (typeof STATUSES)[number];
                void updateVolunteerStatus({ data: { id: r.id, status } }).then(() => {
                  toast.success("Updated");
                  setRows((cur) => cur.map((x) => (x.id === r.id ? { ...x, status } : x)));
                });
              }}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
