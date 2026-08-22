import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-amber",
  {
    variants: {
      variant: {
        amber:
          "bg-amber text-navy-deep hover:bg-amber-deep hover:text-cream shadow-card",
        navy: "bg-navy text-paper hover:bg-navy-soft",
        outline:
          "bg-transparent text-navy border border-navy/20 hover:border-navy/40 hover:bg-paper-2",
        ghost: "bg-transparent text-navy hover:bg-navy/5",
        cream: "bg-cream text-navy hover:bg-paper-2 shadow-card",
      },
      size: {
        sm: "h-10 px-4 text-sm rounded-md",
        md: "h-11 px-5 text-[15px] rounded-lg",
        lg: "h-12 px-6 text-base rounded-lg min-h-11",
      },
    },
    defaultVariants: { variant: "navy", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
