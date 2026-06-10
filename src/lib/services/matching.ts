import { MOCK_JOBS } from "@/lib/data/jobs.mock";
import type { JobMatch } from "@/types";

/**
 * Module 5 — Internship & Job Matchmaker.
 * Scores mock postings against the learner's skills. Match score = share of a
 * posting's required skills the learner already has.
 */
export function matchJobs(userSkills: string[]): JobMatch[] {
  const owned = new Set(userSkills.map((s) => s.toLowerCase().trim()));

  return MOCK_JOBS.map((job) => {
    const missing = job.requiredSkills.filter((s) => !owned.has(s.toLowerCase()));
    const matchScore = Math.round(
      ((job.requiredSkills.length - missing.length) / job.requiredSkills.length) * 100,
    );
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      isInternship: job.isInternship,
      matchScore,
      missingSkills: missing,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/** Resume readiness indicator for a single posting (0..100). */
export function scoreResumeForJob(userSkills: string[], jobId: string): number {
  const job = MOCK_JOBS.find((j) => j.id === jobId);
  if (!job) return 0;
  const owned = new Set(userSkills.map((s) => s.toLowerCase().trim()));
  const have = job.requiredSkills.filter((s) => owned.has(s.toLowerCase())).length;
  return Math.round((have / job.requiredSkills.length) * 100);
}
