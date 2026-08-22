import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/components/site-context";
import { DocumentList, publishedDocs } from "@/components/transparency/document-list";

export const Route = createFileRoute("/_site/transparency/registrations")({
  component: RegistrationsPage,
  head: () => ({ meta: [{ title: "Registrations — Aarohan Education Trust" }] }),
});

function RegistrationsPage() {
  const { org, flags, documents } = useSite();
  return (
    <div>
      <h2 className="font-display text-3xl text-navy-deep">Registrations</h2>
      <p className="mt-3 text-ink">
        A number appears here only when the trust has entered it. Empty fields mean it is not claimed.
      </p>
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Info label="Legal name" value={org.trust_name} />
        <Info label="Registration number" value={org.trust_registration_number || "Not published"} />
        <Info label="12A" value={org.twelve_a || "Not published"} />
        <Info
          label="80G"
          value={
            flags.is_80g_approved && org.eighty_g
              ? org.eighty_g
              : "Not enabled — no 80G claim is made"
          }
        />
        <div className="rounded-2xl bg-cream p-5 shadow-card sm:col-span-2">
          <p className="text-sm text-ink-soft">FCRA / foreign contributions</p>
          <p className="mt-1 font-medium text-navy">
            {flags.foreign_donations_enabled
              ? org.fcra_status || "Enabled in settings — add the registration text"
              : "Foreign donations are not accepted on this website"}
          </p>
        </div>
      </section>
      <div className="mt-8 space-y-4">
        <DocumentList
          heading="Registration documents"
          docs={publishedDocs(documents, "registration")}
          empty="No registration certificate has been published yet."
        />
        <DocumentList
          heading="12A documents"
          docs={publishedDocs(documents, "12a")}
          empty="No 12A document has been published yet."
        />
        <DocumentList
          heading="80G documents"
          docs={publishedDocs(documents, "80g")}
          empty="No 80G document has been published yet."
        />
        <DocumentList
          heading="FCRA documents"
          docs={publishedDocs(documents, "fcra")}
          empty="No FCRA document has been published yet."
        />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream p-5 shadow-card">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 font-medium text-navy">{value}</p>
    </div>
  );
}
