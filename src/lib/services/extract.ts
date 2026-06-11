/**
 * CV text extraction from uploaded files (PDF / DOCX / plain text).
 * Runs server-side only (uses Node Buffer + native parsers).
 */

export const SUPPORTED_MIME = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  txt: "text/plain",
} as const;

export const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB

export class ExtractionError extends Error {}

function detectKind(filename: string, mime: string): "pdf" | "docx" | "txt" {
  const name = filename.toLowerCase();
  if (mime === SUPPORTED_MIME.pdf || name.endsWith(".pdf")) return "pdf";
  if (
    mime === SUPPORTED_MIME.docx ||
    mime === SUPPORTED_MIME.doc ||
    name.endsWith(".docx") ||
    name.endsWith(".doc")
  )
    return "docx";
  if (mime === SUPPORTED_MIME.txt || name.endsWith(".txt")) return "txt";
  throw new ExtractionError("Unsupported file type. Upload a PDF, DOCX, or TXT.");
}

/** Normalize whitespace so downstream prompts stay clean and token-efficient. */
function clean(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractCvText(
  buffer: Buffer,
  filename: string,
  mime: string,
): Promise<{ text: string; kind: string }> {
  if (buffer.byteLength === 0) throw new ExtractionError("The file is empty.");
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new ExtractionError("File too large (max 8 MB).");
  }

  const kind = detectKind(filename, mime);
  let text = "";

  if (kind === "pdf") {
    const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
    // pdf.js mishandles Node Buffers (ignores pool byteOffset) — pass a plain copy.
    const data = await pdfParse(new Uint8Array(buffer));
    text = data.text;
  } else if (kind === "docx") {
    const mammoth = (await import("mammoth")).default;
    const { value } = await mammoth.extractRawText({ buffer });
    text = value;
  } else {
    text = buffer.toString("utf-8");
  }

  text = clean(text);
  if (text.length < 20) {
    throw new ExtractionError(
      "Couldn't read enough text from this file. If it's a scanned image PDF, paste the text instead.",
    );
  }
  return { text, kind };
}
