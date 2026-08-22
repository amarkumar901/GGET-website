import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useSite } from "@/components/site-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type NavItem = { to: string; label: string };

const ABOUT: NavItem[] = [
  { to: "/about", label: "Our Story" },
  { to: "/about/founder", label: "Founder" },
  { to: "/about/vision", label: "Vision & Mission" },
  { to: "/about/governance", label: "Governance" },
];
const WORK: NavItem[] = [
  { to: "/work", label: "Programs" },
  { to: "/campaigns", label: "Current Initiatives" },
];
const IMPACT: NavItem[] = [
  { to: "/impact", label: "Our Impact" },
  { to: "/stories", label: "Stories" },
];
const INVOLVED: NavItem[] = [
  { to: "/volunteer", label: "Volunteer" },
  { to: "/partner", label: "Partner With Us" },
  { to: "/csr", label: "CSR" },
];
const TRANSPARENCY: NavItem[] = [
  { to: "/transparency", label: "Financials" },
  { to: "/transparency/reports", label: "Reports" },
  { to: "/transparency/registrations", label: "Registrations" },
];

const MOBILE_ITEMS: NavItem[] = [
  ...ABOUT,
  ...WORK,
  ...IMPACT,
  ...INVOLVED,
  ...TRANSPARENCY,
  { to: "/contact", label: "Contact" },
];

function Dropdown({
  label,
  items,
  open,
  onToggle,
  onClose,
}: {
  label: string;
  items: NavItem[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-11 items-center gap-1 px-2 text-[15px] font-medium text-navy hover:text-navy-soft"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {label}
        <ChevronDown className={cn("size-3.5 opacity-60 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div role="menu" className="absolute left-0 top-full z-50 min-w-52 pt-1">
          <div className="rounded-xl bg-cream p-2 shadow-card">
            {items.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                role="menuitem"
                className="block rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-paper-2"
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Navbar() {
  const { org } = useSite();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function menuProps(id: string) {
    return {
      open: openMenu === id,
      onToggle: () => setOpenMenu((cur) => (cur === id ? null : id)),
      onClose: () => setOpenMenu(null),
    };
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 overflow-visible border-b transition-colors duration-200",
        scrolled ? "border-line bg-paper/95 backdrop-blur-md" : "border-transparent bg-paper/80",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:h-[4.25rem] sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 pr-2">
          <span className="grid size-9 place-items-center rounded-lg bg-navy text-amber" aria-hidden>
            <svg viewBox="0 0 32 32" className="size-5" fill="none">
              <circle cx="16" cy="11" r="4" fill="currentColor" />
              <path d="M8 22h16l-3-6H11l-3 6z" fill="#F7F1E8" />
            </svg>
          </span>
          <span className="font-display text-lg leading-none text-navy-deep">{org.short_name}</span>
        </Link>

        <nav className="ml-4 hidden items-center lg:flex" aria-label="Primary">
          <Dropdown label="About" items={ABOUT} {...menuProps("about")} />
          <Dropdown label="Our Work" items={WORK} {...menuProps("work")} />
          <Dropdown label="Impact" items={IMPACT} {...menuProps("impact")} />
          <Dropdown label="Get Involved" items={INVOLVED} {...menuProps("involved")} />
          <Dropdown label="Transparency" items={TRANSPARENCY} {...menuProps("transparency")} />
          <Link
            to="/contact"
            className="inline-flex h-11 items-center px-2 text-[15px] font-medium text-navy"
            onClick={() => setOpenMenu(null)}
          >
            Contact
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isPending ? (
            <div className="hidden h-8 w-16 animate-pulse rounded-full bg-navy/10 sm:block" />
          ) : user ? (
            <Link
              to="/admin"
              className="hidden h-11 items-center px-2 text-sm font-medium text-navy/70 hover:text-navy sm:inline-flex"
            >
              Admin
            </Link>
          ) : null}
          <Button asChild variant="amber" size="sm">
            <Link
              to="/donate"
              onClick={() => {
                setOpen(false);
                setOpenMenu(null);
              }}
            >
              <span className="sm:hidden">Donate</span>
              <span className="hidden sm:inline">Donate Now</span>
            </Link>
          </Button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg text-navy lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-paper lg:hidden">
          <nav className="mx-auto flex max-h-[calc(100dvh-4rem)] max-w-6xl flex-col gap-1 overflow-y-auto px-4 py-4">
            {MOBILE_ITEMS.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                className="rounded-lg px-3 py-3 text-base text-navy"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="amber" className="mt-2">
              <Link to="/donate" onClick={() => setOpen(false)}>
                Donate Now
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
