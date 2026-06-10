import { generateJSON } from "@/lib/gemini/client";
import { careerAnalysisSchema } from "@/lib/gemini/schemas";
import { careerAnalysisPrompt } from "@/lib/gemini/prompts";
import { findRoleByTitle, ROLES } from "@/lib/data/skills";
import type { CareerAnalysis, Skill } from "@/types";

/**
 * Module 1 — AI Career Navigator.
 * Analyzes a resume against a target role: skills, readiness, gaps, roadmap.
 * Uses Gemini when available; otherwise a deterministic keyword fallback so
 * the demo always produces a credible result.
 */
export async function analyzeCareer(
  resumeText: string,
  targetRole: string,
): Promise<CareerAnalysis> {
  const role = findRoleByTitle(targetRole) ?? ROLES[0];
  const roleSkills = role.skills.map((s) => s.name);

  // ── Try Gemini (structured JSON) ──
  const { data } = await generateJSON<Omit<CareerAnalysis, "targetRole" | "usedFallback">>(
    careerAnalysisPrompt(resumeText, role.title, roleSkills),
    careerAnalysisSchema,
  );

  if (data) {
    return {
      targetRole: role.title,
      readinessScore: clampScore(data.readinessScore),
      haveSkills: data.haveSkills ?? [],
      gaps: data.gaps ?? [],
      roadmap: (data.roadmap ?? []).sort((a, b) => a.position - b.position),
      rationale: data.rationale ?? "",
      usedFallback: false,
    };
  }

  // ── Deterministic fallback (no API key / API failed) ──
  return keywordFallback(resumeText, role.title, role.skills);
}

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n || 0)));
}

function keywordFallback(
  resumeText: string,
  roleTitle: string,
  skills: { name: string; weight: number }[],
): CareerAnalysis {
  const text = resumeText.toLowerCase();
  const have: Skill[] = [];
  const gaps: { skill: string; priority: number }[] = [];
  let matchedWeight = 0;
  let totalWeight = 0;

  for (const s of skills) {
    totalWeight += s.weight;
    if (text.includes(s.name.toLowerCase())) {
      matchedWeight += s.weight;
      have.push({ name: s.name, proficiency: "intermediate" });
    } else {
      gaps.push({ skill: s.name, priority: s.weight });
    }
  }

  const readinessScore =
    totalWeight === 0 ? 50 : clampScore((matchedWeight / totalWeight) * 100);

  const roadmap = gaps
    .sort((a, b) => b.priority - a.priority)
    .map((g, i) => ({
      position: i + 1,
      title: `Learn ${g.skill}`,
      skill: g.skill,
      estWeeks: g.priority >= 3 ? 3 : 2,
    }));

  return {
    targetRole: roleTitle,
    readinessScore,
    haveSkills: have,
    gaps: gaps.sort((a, b) => b.priority - a.priority),
    roadmap,
    rationale: `Estimated from keyword matching against the ${roleTitle} skill profile (offline mode — add a Gemini API key for AI-quality analysis).`,
    usedFallback: true,
  };
}
