import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/components/site-context";
import { DocumentList, publishedDocs } from "@/components/transparency/document-list";

export const Route = createFileRoute("/_site/transparency/")({
  component: FinancialsPage,
  head: () => ({ meta: [{ title: "Financials — Aarohan Education Trust" }] }),
});

function FinancialsPage() {
  const { documents, blocks } = useSite();
  const financials = publishedDocs(documents, "financial");
  const policies = publishedDocs(documents, "policy");
  return (
    <div>
      <h2 className="font-display text-3xl text-navy-deep">Financials</h2>
      <p className="mt-3 text-ink">
        Audited statements will appear here after they are filed and published. Until then this page
        stays empty of invented figures.
      </p>
      <div className="mt-8 space-y-4">
        <DocumentList
          heading="Audited financial statements"
          docs={financials}
          empty="No audited statements have been published yet."
        />
        <DocumentList
          heading="Policies"
          docs={policies}
          empty="Finance and safeguarding policies will be listed once uploaded."
        />
      </div>
      <h3 className="mt-12 font-display text-2xl text-navy-deep">How funds are used</h3>
      <p className="mt-3 text-ink">{blocks.funds_use?.body}</p>
    </div>
  );
}
