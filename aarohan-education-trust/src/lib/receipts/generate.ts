import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatInrAscii } from "../money";
import type { OrgSettings } from "../types";
import { pdfSafeText } from "./text";

export { pdfSafeText };

export async function buildReceiptPdf(opts: {
  org: OrgSettings;
  receiptNumber: string;
  issuedAt: string;
  donorName: string;
  amountPaise: number;
  paymentRef: string;
  campaign?: string | null;
  program?: string | null;
  paymentMode?: string | null;
  demo: boolean;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const navy = rgb(0.106, 0.165, 0.29);
  const ink = rgb(0.165, 0.141, 0.11);
  const muted = rgb(0.36, 0.325, 0.282);
  const amber = rgb(0.788, 0.518, 0.165);

  const draw = (
    text: string,
    args: { x: number; y: number; size: number; font: typeof serif; color: ReturnType<typeof rgb> },
  ) => {
    page.drawText(pdfSafeText(text), args);
  };

  page.drawRectangle({ x: 0, y: 800, width: 595, height: 42, color: navy });
  draw(opts.org.short_name.toUpperCase(), {
    x: 48,
    y: 816,
    size: 14,
    font: serifBold,
    color: rgb(0.969, 0.945, 0.91),
  });
  page.drawRectangle({ x: 48, y: 796, width: 80, height: 3, color: amber });

  let y = 750;
  draw("Donation acknowledgement", {
    x: 48,
    y,
    size: 22,
    font: serifBold,
    color: navy,
  });
  y -= 28;
  draw(opts.org.trust_name, { x: 48, y, size: 12, font: serif, color: ink });
  y -= 16;
  draw(opts.org.registered_address || opts.org.location, {
    x: 48,
    y,
    size: 10,
    font: serif,
    color: muted,
  });
  y -= 36;

  const rows: [string, string][] = [
    ["Receipt number", opts.receiptNumber],
    ["Date", opts.issuedAt],
    ["Received from", opts.donorName],
    ["Amount", formatInrAscii(opts.amountPaise)],
    ["Payment reference", opts.paymentRef],
    ["Towards", opts.campaign || opts.program || "General corpus / programmes"],
    ["Mode", opts.paymentMode || (opts.demo ? "Demonstration" : "Online")],
  ];
  for (const [k, v] of rows) {
    draw(k, { x: 48, y, size: 10, font: serif, color: muted });
    draw(v.slice(0, 70), { x: 220, y, size: 11, font: serifBold, color: ink });
    y -= 22;
  }

  y -= 12;
  draw(
    "This is an acknowledgement of a contribution. It is not Form 10BE and is not a tax certificate.",
    { x: 48, y, size: 9, font: serif, color: muted },
  );
  y -= 28;
  if (opts.demo) {
    draw("DEMONSTRATION RECEIPT -- no real payment was processed.", {
      x: 48,
      y,
      size: 10,
      font: serifBold,
      color: amber,
    });
    y -= 24;
  }
  if (!opts.org.trust_registration_number) {
    draw("Registration details will appear here once entered by the trust.", {
      x: 48,
      y,
      size: 9,
      font: serif,
      color: muted,
    });
    y -= 20;
  } else {
    draw(`Registration: ${opts.org.trust_registration_number}`, {
      x: 48,
      y,
      size: 9,
      font: serif,
      color: muted,
    });
    y -= 20;
  }

  y -= 24;
  draw(opts.org.authorised_signatory_name, {
    x: 48,
    y,
    size: 11,
    font: serifBold,
    color: navy,
  });
  y -= 14;
  draw(opts.org.authorised_signatory_title, {
    x: 48,
    y,
    size: 9,
    font: serif,
    color: muted,
  });

  draw("Legal wording on this page is a placeholder pending review by the trust's advisers.", {
    x: 48,
    y: 48,
    size: 8,
    font: serif,
    color: muted,
  });

  return doc.save();
}
