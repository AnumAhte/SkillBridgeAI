import { NextResponse } from "next/server";
import { geminiAvailable } from "@/lib/gemini/client";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    geminiConfigured: geminiAvailable,
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    time: new Date().toISOString(),
  });
}
