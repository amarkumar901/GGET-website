import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/utils";
import { sendAdminNotice, sendEmail, escapeHtml } from "@/lib/email/send";
import { getOrg, rateLimit } from "./helpers";
import { parseOrThrow } from "@/lib/validation";

const contactSchema = z.object({
  kind: z.enum(["contact", "partnership"]).default("contact"),
  full_name: z.string().trim().min(2, "Enter your name (at least 2 characters).").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(160, "Email is too long."),
  phone: z.string().trim().max(15, "Phone number is too long.").optional().or(z.literal("")),
  organisation: z.string().trim().max(160, "Organisation name is too long.").optional().or(z.literal("")),
  designation: z.string().trim().max(120, "Designation is too long.").optional().or(z.literal("")),
  subject: z.string().trim().max(160, "Subject is too long.").optional().or(z.literal("")),
  partnership_interest: z.string().trim().max(160, "Partnership interest is too long.").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(4000, "Message is too long."),
  honeypot: z.string().optional(),
});

const volunteerSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your name (at least 2 characters).").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(160, "Email is too long."),
  phone: z.string().trim().max(15, "Phone number is too long.").optional().or(z.literal("")),
  city: z.string().trim().max(80, "City is too long.").optional().or(z.literal("")),
  profession: z.string().trim().max(120, "Profession is too long.").optional().or(z.literal("")),
  area_of_interest: z.string().trim().max(160, "Area of interest is too long.").optional().or(z.literal("")),
  availability: z.string().trim().max(160, "Availability is too long.").optional().or(z.literal("")),
  message: z.string().trim().max(4000, "Message is too long.").optional().or(z.literal("")),
  consent: z.boolean(),
  honeypot: z.string().optional(),
});

export const submitContact = createServerFn({ method: "POST" })
  .validator((d: unknown) => parseOrThrow(contactSchema, d))
  .handler(async ({ data }) => {
    if (data.honeypot) return { ok: true };
    const allowed = await rateLimit(`contact:${data.email.toLowerCase()}`, 5, 60 * 60 * 1000);
    if (!allowed) throw new Error("Please wait before sending another message.");
    const sql = await getSql();
    const id = newId("enq");
    await sql`insert into contact_submissions (
      id, kind, full_name, email, phone, organisation, designation, subject, partnership_interest, message
    ) values (
      ${id}, ${data.kind}, ${data.full_name}, ${data.email.toLowerCase()}, ${data.phone || null},
      ${data.organisation || null}, ${data.designation || null}, ${data.subject || null},
      ${data.partnership_interest || null}, ${data.message}
    )`;
    const org = await getOrg();
    await sendEmail({
      to: data.email,
      subject: `We received your message — ${org.trust_name}`,
      html: `<p>Dear ${escapeHtml(data.full_name)},</p><p>Thank you for writing to ${escapeHtml(org.trust_name)}. We will reply as soon as we can.</p>`,
    });
    await sendAdminNotice(
      `${data.kind === "partnership" ? "Partnership" : "Contact"} enquiry`,
      `<p>${escapeHtml(data.full_name)} <${escapeHtml(data.email)}></p><p>${escapeHtml(data.message)}</p>`,
    );
    return { ok: true };
  });

export const submitVolunteer = createServerFn({ method: "POST" })
  .validator((d: unknown) => parseOrThrow(volunteerSchema, d))
  .handler(async ({ data }) => {
    if (data.honeypot) return { ok: true };
    if (!data.consent) throw new Error("Please confirm you consent to being contacted.");
    const allowed = await rateLimit(`vol:${data.email.toLowerCase()}`, 4, 60 * 60 * 1000);
    if (!allowed) throw new Error("Please wait before sending another application.");
    const sql = await getSql();
    const id = newId("vol");
    await sql`insert into volunteer_applications (
      id, full_name, email, phone, city, profession, area_of_interest, availability, message, consent, status
    ) values (
      ${id}, ${data.full_name}, ${data.email.toLowerCase()}, ${data.phone || null}, ${data.city || null},
      ${data.profession || null}, ${data.area_of_interest || null}, ${data.availability || null},
      ${data.message || null}, true, 'NEW'
    )`;
    const org = await getOrg();
    await sendEmail({
      to: data.email,
      subject: `Volunteer enquiry received — ${org.trust_name}`,
      html: `<p>Dear ${escapeHtml(data.full_name)},</p><p>Thank you for offering your time. We will be in touch about volunteer opportunities.</p>`,
    });
    await sendAdminNotice(
      "Volunteer enquiry",
      `<p>${escapeHtml(data.full_name)} — ${escapeHtml(data.area_of_interest || "general")}</p>`,
    );
    return { ok: true };
  });
