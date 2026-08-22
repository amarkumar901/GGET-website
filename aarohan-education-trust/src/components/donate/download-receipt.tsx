import { useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DownloadReceiptButton({
  token,
  receiptNumber,
  label = "Download acknowledgement",
}: {
  token: string;
  receiptNumber?: string | null;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const filename = `${(receiptNumber || "acknowledgement").replace(/[/\\]/g, "-")}.pdf`;
  const href = `/api/receipts/${encodeURIComponent(token)}`;

  async function onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error("Could not download the acknowledgement.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download the acknowledgement.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button asChild variant="navy">
      <a href={href} download={filename} onClick={onClick}>
        {busy ? "Preparing…" : label}
      </a>
    </Button>
  );
}
