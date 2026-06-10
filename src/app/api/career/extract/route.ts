import { NextRequest, NextResponse } from "next/server";
import { extractCvText, ExtractionError, MAX_FILE_BYTES } from "@/lib/services/extract";
import type { ApiResponse } from "@/types";

// Native parsers require the Node.js runtime (not edge).
export const runtime = "nodejs";

type ExtractResult = { text: string; kind: string; filename: string };

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Expected multipart/form-data with a 'file' field." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "No file provided." },
      { status: 422 },
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "File too large (max 8 MB)." },
      { status: 413 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text, kind } = await extractCvText(buffer, file.name, file.type);
    return NextResponse.json<ApiResponse<ExtractResult>>({
      data: { text, kind, filename: file.name },
      error: null,
    });
  } catch (err) {
    const msg =
      err instanceof ExtractionError ? err.message : "Failed to read the file.";
    if (!(err instanceof ExtractionError)) console.error("[extract] failed:", err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: msg },
      { status: err instanceof ExtractionError ? 422 : 500 },
    );
  }
}
