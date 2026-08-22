import { createFileRoute } from "@tanstack/react-router";
import { loadCampaigns, loadPrograms, loadStories } from "@/lib/server/site";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const staticPaths = [
          "/",
          "/about",
          "/about/founder",
          "/about/vision",
          "/about/governance",
          "/work",
          "/impact",
          "/stories",
          "/campaigns",
          "/donate",
          "/volunteer",
          "/partner",
          "/csr",
          "/transparency",
          "/transparency/reports",
          "/transparency/registrations",
          "/contact",
          "/privacy",
          "/terms",
          "/refund-policy",
        ];
        const [programs, campaigns, stories] = await Promise.all([
          loadPrograms(),
          loadCampaigns(),
          loadStories(),
        ]);
        const urls = [
          ...staticPaths,
          ...programs.map((p) => `/work/${p.slug}`),
          ...campaigns.map((c) => `/campaigns/${c.slug}`),
          ...stories.map((s) => `/stories/${s.slug}`),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${origin}${u}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(xml, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
