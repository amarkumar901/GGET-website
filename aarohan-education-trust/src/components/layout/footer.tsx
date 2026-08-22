import { Link } from "@tanstack/react-router";
import { useSite } from "@/components/site-context";

export function Footer() {
  const { org, flags } = useSite();
  return (
    <footer className="mt-auto bg-navy-deep text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl">{org.short_name}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-paper/70">{org.tagline}</p>
          <p className="mt-4 text-sm text-paper/60">
            {org.location}
            <br />
            <a className="underline-offset-2 hover:underline" href={`mailto:${org.email}`}>
              {org.email}
            </a>
            {org.phone ? (
              <>
                <br />
                {org.phone}
              </>
            ) : null}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-amber uppercase">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/80">
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/work">Our work</Link>
            </li>
            <li>
              <Link to="/impact">Impact</Link>
            </li>
            <li>
              <Link to="/transparency">Transparency</Link>
            </li>
            <li>
              <Link to="/transparency/reports">Reports</Link>
            </li>
            <li>
              <Link to="/volunteer">Volunteer</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-amber uppercase">Give</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/80">
            <li>
              <Link to="/donate">Donate</Link>
            </li>
            <li>
              <Link to="/campaigns">Campaigns</Link>
            </li>
            <li>
              <Link to="/csr">CSR</Link>
            </li>
            <li>
              <Link to="/partner">Partners</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {org.trust_name}. Demonstration content until launch.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/refund-policy">Donation policy</Link>
            {!flags.is_80g_approved ? <span>80G claims are not enabled</span> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
