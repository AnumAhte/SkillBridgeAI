// Versioned prompt templates. Keep prompts here for reproducibility/auditing.

import type { Language } from "@/types";

export const PROMPT_VERSION = "v1";

const LANG_LABEL: Record<Language, string> = {
  uz: "Uzbek",
  ru: "Russian",
  en: "English",
};

export function careerAnalysisPrompt(resumeText: string, targetRole: string, roleSkills: string[]) {
  return `You are a career advisor for Uzbekistan's digital economy.
Analyze the candidate's resume against the target role "${targetRole}".
The role typically requires these skills: ${roleSkills.join(", ")}.

Resume:
"""
${resumeText.slice(0, 6000)}
"""

Return JSON with:
- readinessScore (0-100): how aligned the candidate is with the target role.
- haveSkills: skills evident in the resume (with proficiency).
- gaps: required skills the candidate is missing, ordered by priority.
- roadmap: an ordered learning plan (3-6 steps) to close the gaps.
- rationale: 1-2 sentences explaining how the score and recommendations were derived (for transparency).`;
}

export function curriculumPrompt(topic: string, level: string, language: Language) {
  return `You are an expert instructional designer.
Create a ${level} course on "${topic}". Respond in ${LANG_LABEL[language]}.
Return JSON with: title, level, outcomes (3-5 learning outcomes), and modules.
Each module has: title, lessons (2-3, each with title + 1-sentence summary),
quiz (2 multiple-choice questions with options, answerIndex, explanation),
and one assignment description.`;
}

export function tutorSystemInstruction(language: Language) {
  return `You are SkillBridge AI Tutor, a patient teacher for learners in Uzbekistan.
Always respond in ${LANG_LABEL[language]}.
Explain concepts simply with short examples. Help with homework and coding by
guiding the learner to the answer rather than only giving it. Keep answers concise.`;
}
