import { useState } from "react";

export function ShareRow({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `${title}`;
  async function nativeOrCopy() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 text-sm">
      <span className="text-ink-soft">Share</span>
      <a className="rounded-full bg-paper-2 px-3 py-2" href={wa} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <a className="rounded-full bg-paper-2 px-3 py-2" href={fb} target="_blank" rel="noreferrer">
        Facebook
      </a>
      <a className="rounded-full bg-paper-2 px-3 py-2" href={x} target="_blank" rel="noreferrer">
        X
      </a>
      <a className="rounded-full bg-paper-2 px-3 py-2" href={li} target="_blank" rel="noreferrer">
        LinkedIn
      </a>
      <button type="button" className="rounded-full bg-paper-2 px-3 py-2" onClick={() => void nativeOrCopy()}>
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
