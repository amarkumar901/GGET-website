import { createContext, useContext } from "react";
import type { PublicSite } from "@/lib/types";

const SiteCtx = createContext<PublicSite | null>(null);

export function SiteProvider({
  value,
  children,
}: {
  value: PublicSite;
  children: React.ReactNode;
}) {
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSite(): PublicSite {
  const v = useContext(SiteCtx);
  if (!v) throw new Error("useSite must be used within the public site layout");
  return v;
}
