import { NextRequest } from "next/server";
import { z } from "zod";
import { tutorReply } from "@/lib/services/tutor";

const schema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1),
  language: z.enum(["uz", "ru", "en"]).default("en"),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return new Response("Invalid request", { status: 422 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of tutorReply(parsed.data.messages, parsed.data.language)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
