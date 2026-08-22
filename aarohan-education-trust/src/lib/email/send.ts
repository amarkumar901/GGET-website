import { getOrg } from "@/lib/server/helpers";

type EmailResult = { status: "sent" | "failed" | "demo"; error?: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<EmailResult> {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const from = (process.env.EMAIL_FROM || "").trim();
  if (!apiKey || !from) {
    return { status: "demo" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!res.ok) return { status: "failed", error: "resend_" + res.status };
    return { status: "sent" };
  } catch {
    return { status: "failed", error: "network" };
  }
}

export async function sendAdminNotice(subject: string, html: string) {
  const to = (process.env.ADMIN_NOTIFICATION_EMAIL || "").trim();
  if (!to) return { status: "demo" as const };
  return sendEmail({ to, subject, html });
}

export async function donationReceivedEmail(opts: {
  donorName: string;
  donorEmail: string;
  amountLabel: string;
  receiptNumber: string;
  campaign?: string | null;
  accessToken: string;
  demo: boolean;
}) {
  const org = await getOrg();
  const origin = process.env.VITE_SITE_URL || "";
  const receiptUrl = origin
    ? origin + "/receipt/" + opts.accessToken
    : "/receipt/" + opts.accessToken;
  const towards = opts.campaign ? " towards " + escapeHtml(opts.campaign) : "";
  const demoNote = opts.demo
    ? "<p style='color:#5C5348;font-size:13px'>This was processed in demonstration mode. No real payment was taken.</p>"
    : "";
  const html =
    "<div style='font-family:Georgia,serif;color:#2A241C;line-height:1.55;max-width:560px'>" +
    "<p>Dear " +
    escapeHtml(opts.donorName) +
    ",</p>" +
    "<p>Thank you. We received your contribution of <strong>" +
    escapeHtml(opts.amountLabel) +
    "</strong>" +
    towards +
    ".</p>" +
    "<p>Your acknowledgement number is <strong>" +
    escapeHtml(opts.receiptNumber) +
    "</strong>.</p>" +
    "<p>You can view or print your acknowledgement here:<br/><a href='" +
    escapeHtml(receiptUrl) +
    "'>" +
    escapeHtml(receiptUrl) +
    "</a></p>" +
    demoNote +
    "<p>With gratitude,<br/>" +
    escapeHtml(org.trust_name) +
    "</p></div>";
  return sendEmail({
    to: opts.donorEmail,
    subject: "Thank you — " + org.trust_name,
    html,
  });
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}
