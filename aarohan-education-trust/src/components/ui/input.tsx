import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg bg-cream px-3.5 text-[15px] text-ink shadow-[0_0_0_1px_rgba(42,36,28,0.12)] placeholder:text-ink-soft/70",
        "focus:shadow-[0_0_0_2px_#c9842a] focus:outline-none",
        "aria-[invalid=true]:shadow-[0_0_0_1px_#9b3d2e]",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-lg bg-cream px-3.5 py-2.5 text-[15px] text-ink shadow-[0_0_0_1px_rgba(42,36,28,0.12)] placeholder:text-ink-soft/70",
        "focus:shadow-[0_0_0_2px_#c9842a] focus:outline-none",
        "aria-[invalid=true]:shadow-[0_0_0_1px_#9b3d2e]",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-navy", className)} {...props} />
  );
}

export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  const child = Children.map(children, (node) => {
    if (!isValidElement(node)) return node;
    const extra: Record<string, unknown> = { id };
    if (error) extra["aria-invalid"] = true;
    return cloneElement(node, extra);
  });
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {child}
      {error ? (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}
