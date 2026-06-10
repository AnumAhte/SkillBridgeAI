import { generateStream } from "@/lib/gemini/client";
import { tutorSystemInstruction } from "@/lib/gemini/prompts";
import type { Language, TutorMessage } from "@/types";

/**
 * Module 3 — Multilingual AI Tutor.
 * Returns a stream of text chunks. Falls back to a canned multilingual reply
 * if Gemini is unavailable so the demo still shows trilingual behavior.
 */
export async function* tutorReply(
  messages: TutorMessage[],
  language: Language,
): AsyncGenerator<string> {
  const stream = await generateStream(tutorSystemInstruction(language), messages);

  if (stream) {
    yield* stream;
    return;
  }

  // ── Fallback (offline mode) ──
  const fallback: Record<Language, string> = {
    uz: "Bu demo rejimi. Gemini API kalitini qo'shsangiz, men savolingizga o'zbek tilida to'liq javob beraman.",
    ru: "Это демо-режим. Добавьте ключ Gemini API, и я отвечу на ваш вопрос на русском языке.",
    en: "This is demo mode. Add a Gemini API key and I'll fully answer your question with explanations and examples.",
  };
  for (const word of fallback[language].split(" ")) {
    yield word + " ";
  }
}
