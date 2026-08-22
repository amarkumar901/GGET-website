import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { exportDonationsCsv, listAdminDonations } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/donations")({
  component: DonationsPage,
});

function DonationsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAdminDonations>>>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    listAdminDonations({ data: { q, status } })
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function download() {
    const { csv } = await exportDonationsCsv();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl text-navy-deep">Donations</h1>
        <Button type="button" variant="outline" onClick={() => void download()}>
          Export CSV
        </Button>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        Records are not deletable here. PAN is masked. Totals always come from PAID rows.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input placeholder="Search email, receipt, payment id" value={q} onChange={(e) => setQ(e.target.value)} />
        <select
          className="h-11 rounded-lg bg-cream px-3 shadow-[0_0_0_1px_rgba(42,36,28,0.12)]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {["CREATED", "PENDING", "PAID", "FAILED", "REFUNDED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Button type="button" onClick={load}>
          Filter
        </Button>
      </div>
      {error ? <p className="mt-4 text-danger">{error}</p> : null}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-ink-soft">
              <th className="py-2">When</th>
              <th>Donor</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Receipt</th>
              <th>PAN</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="py-2 pr-3 whitespace-nowrap">{r.created_at.slice(0, 16)}</td>
                <td>
                  {r.donor_name}
                  <br />
                  <span className="text-ink-soft">{r.donor_email}</span>
                </td>
                <td className="tabular-nums">{r.amount_label}</td>
                <td>
                  {r.status}
                  {r.demo ? " · demo" : ""}
                </td>
                <td>{r.receipt_number || "—"}</td>
                <td>{r.pan_masked || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
