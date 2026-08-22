import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms — Aarohan Education Trust" }] }),
});

function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="rounded-lg bg-amber/15 px-3 py-2 text-sm text-amber-deep">
        Placeholder for legal review. Not approved terms of use.
      </p>
      <h1 className="mt-6 font-display text-4xl text-navy-deep">Terms of use</h1>
      <div className="mt-6 space-y-4 text-ink">
        <p>
          This website is provided so that people can learn about the trust, apply to volunteer, and
          donate. Content may include demonstration material clearly marked as such until launch.
        </p>
        <p>
          You may not scrape donor records, attempt to access the admin area without authorisation, or
          misrepresent a relationship with the trust.
        </p>
        <p>Replace this page after advisers have reviewed it.</p>
      </div>
    </article>
  );
}
