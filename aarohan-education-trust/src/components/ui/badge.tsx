import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "navy",
  className,
}: {
  children: React.ReactNode;
  tone?: "navy" | "amber" | "sage" | "paper";
  className?: string;
}) {
  const tones = {
    navy: "bg-navy/8 text-navy",
    amber: "bg-amber/15 text-amber-deep",
    sage: "bg-sage/12 text-sage",
    paper: "bg-paper-2 text-ink-soft",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-paper-3"
      role="progressbar"
      aria-valuenow={Number(v.toFixed(1))}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-amber transition-[width] duration-500 ease-out"
        style={{ width: v <= 0 ? "0%" : `max(${v}%, 10px)` }}
      />
    </div>
  );
}
