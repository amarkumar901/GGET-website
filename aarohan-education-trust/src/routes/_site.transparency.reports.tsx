import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/components/site-context";
import { DocumentList, publishedDocs } from "@/components/transparency/document-list";

export const Route = createFileRoute("/_site/transparency/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports — Aarohan Education Trust" }] }),
});

function ReportsPage() {
  const { documents } = useSite();
  const annual = publishedDocs(documents, "annual_report");
  const impact = publishedDocs(documents, "impact");
  return (
    <div>
      <h2 className="font-display text-3xl text-navy-deep">Reports</h2>
      <p className="mt-3 text-ink">
        Annual and impact reports are published only after they exist. Placeholder PDFs are not
        invented for this demonstration.
      </p>
      <div className="mt-8 space-y-4">
        <DocumentList
          heading="Annual reports"
          docs={annual}
          empty="No annual report has been published yet."
        />
        <DocumentList
          heading="Impact reports"
          docs={impact}
          empty="No impact report has been published yet. Metrics stay as dashes until they are verified."
        />
      </div>
    </div>
  );
}
