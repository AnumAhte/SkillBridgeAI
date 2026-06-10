import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeCareer } from "@/lib/services/career";
import type { ApiResponse, CareerAnalysis } from "@/types";

const schema = z.object({
  resumeText: z.string().min(20, "Resume text is too short"),
  targetRole: z.string().min(2).default("Data Analyst"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 422 },
    );
  }

  const result = await analyzeCareer(parsed.data.resumeText, parsed.data.targetRole);
  return NextResponse.json<ApiResponse<CareerAnalysis>>({
    data: result,
    error: null,
    meta: { usedFallback: result.usedFallback },
  });
}
