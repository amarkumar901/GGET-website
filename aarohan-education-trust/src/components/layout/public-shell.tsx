import { useSite } from "@/components/site-context";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const { flags } = useSite();
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      {flags.demo_banner ? (
        <div className="bg-navy text-center text-[13px] leading-5 text-paper">
          <p className="mx-auto max-w-5xl px-4 py-2">
            Demonstration website with placeholder content. Figures, stories, and registrations are not
            real trust records until an administrator replaces them.
          </p>
        </div>
      ) : null}
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
