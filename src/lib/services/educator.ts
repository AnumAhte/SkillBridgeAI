import { generateJSON } from "@/lib/gemini/client";
import { courseSchema } from "@/lib/gemini/schemas";
import { curriculumPrompt } from "@/lib/gemini/prompts";
import type { GeneratedCourse, Language } from "@/types";

/**
 * Module 4 — Educator Copilot.
 * Generates a full course (modules, lessons, quizzes, assignments, outcomes)
 * from a topic. Falls back to a template course if Gemini is unavailable.
 */
export async function generateCourse(
  topic: string,
  level: string,
  language: Language,
): Promise<GeneratedCourse> {
  const { data } = await generateJSON<Omit<GeneratedCourse, "usedFallback">>(
    curriculumPrompt(topic, level, language),
    courseSchema,
  );

  if (data) return { ...data, usedFallback: false };

  // ── Fallback template ──
  return {
    title: `${level} ${topic}`,
    level,
    outcomes: [
      `Understand core concepts of ${topic}`,
      `Apply ${topic} to a practical task`,
      `Explain key terminology of ${topic}`,
    ],
    modules: [
      {
        title: `Introduction to ${topic}`,
        lessons: [
          { title: `What is ${topic}?`, summary: `Overview and why it matters.` },
          { title: `Key concepts`, summary: `Foundational ideas explained simply.` },
        ],
        quiz: [
          {
            question: `Which best describes ${topic}?`,
            options: ["A core concept", "Unrelated", "A programming language only", "None"],
            answerIndex: 0,
            explanation: `${topic} is introduced as a core concept in this module.`,
          },
        ],
        assignment: `Write a short summary of what you learned about ${topic}.`,
      },
      {
        title: `Applying ${topic}`,
        lessons: [
          { title: `Hands-on basics`, summary: `Practice the fundamentals.` },
          { title: `A simple project`, summary: `Build something small end-to-end.` },
        ],
        quiz: [
          {
            question: `What is the best way to learn ${topic}?`,
            options: ["By practice", "Avoiding it", "Memorizing only", "Skipping basics"],
            answerIndex: 0,
            explanation: `Hands-on practice cements understanding.`,
          },
        ],
        assignment: `Complete a small project applying ${topic}.`,
      },
    ],
    usedFallback: true,
  };
}
