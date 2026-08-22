const WINANSI_SWAPS: Record<string, string> = {
  "₹": "Rs ",
  "—": "--",
  "–": "-",
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "…": "...",
  "•": "-",
  " ": " ",
};

/** Standard PDF fonts only encode WinAnsi. Strip anything they cannot draw. */
export function pdfSafeText(input: string): string {
  const swapped = Array.from(input)
    .map((ch) => WINANSI_SWAPS[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
  return swapped.replace(/[^\t\n\r\x20-\x7E]/g, "?");
}
