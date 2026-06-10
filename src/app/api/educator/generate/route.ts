import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateCourse } from "@/lib/services/educator";
import type { ApiResponse, GeneratedCourse } from "@/types";

const schema = z.object({
  topic: z.string().min(2),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  language: z.enum(["uz", "ru", "en"]).default("en"),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Validation failed" },
      { status: 422 },
    );
  }

  const course = await generateCourse(
    parsed.data.topic,
    parsed.data.level,
    parsed.data.language,
  );
  return NextResponse.json<ApiResponse<GeneratedCourse>>({ data: course, error: null });
}
