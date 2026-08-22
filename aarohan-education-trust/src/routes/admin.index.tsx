import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminOverview } from "@/lib/server/admin";
import { formatInrFromPaise } from "@/lib/money";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminOverview>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getAdminOverview()
      .then(setData)
      .catch((e: Error) => setError(e.message || "Could not load"));
  }, []);
  if (error) {
    return (
      <p className="text-danger">
        {error === "Forbidden"
          ? "You are signed in, but you are not an administrator. The first account to sign in becomes admin; later accounts must be added in the database."
          : error}
      </p>
    );
  }
  if (!data) return <p className="text-ink-soft">Loading overview…</p>;
  return (
    <div>
      <h1 className="font-display text-3xl text-navy-deep">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Successful donations" value={String(data.paid_count)} />
        <Stat label="Total raised" value={formatInrFromPaise(data.paid_sum)} />
        <Stat label="Today" value={`${data.today_count} · ${formatInrFromPaise(data.today_sum)}`} />
        <Stat label="This month" value={`${data.month_count} · ${formatInrFromPaise(data.month_sum)}`} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl text-navy">Campaigns</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.campaigns.map((c) => (
              <li key={c.id} className="rounded-lg bg-cream px-3 py-2 shadow-card">
                {c.title} — {formatInrFromPaise(c.raised)} / {formatInrFromPaise(c.goal)}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-xl text-navy">Recent donations</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.recent.map((r) => (
              <li key={r.id} className="rounded-lg bg-cream px-3 py-2 shadow-card">
                {r.donor_name} · {formatInrFromPaise(r.amount_paise)} · {r.status}
              </li>
            ))}
            {data.recent.length === 0 ? <li className="text-ink-soft">None yet</li> : null}
          </ul>
          <p className="mt-4 text-sm text-ink-soft">
            New volunteer enquiries: {data.new_volunteers} · Contact submissions: {data.enquiries}
          </p>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream p-4 shadow-card">
      <p className="text-xs tracking-wide text-ink-soft uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums text-navy-deep">{value}</p>
    </div>
  );
}
