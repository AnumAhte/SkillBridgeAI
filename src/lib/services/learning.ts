/**
 * Module 2 — Adaptive Learning Engine.
 * Pure difficulty-adjustment logic based on quiz performance.
 *   score < 60  → simplify (drop a level, floor 1)
 *   score >= 80 → advance (raise a level, cap 3)
 *   otherwise   → hold
 */
export function nextDifficulty(current: number, score: number): number {
  if (score < 60) return Math.max(1, current - 1);
  if (score >= 80) return Math.min(3, current + 1);
  return current;
}

export function difficultyLabel(level: number): string {
  return ["", "Simplified", "Standard", "Advanced"][level] ?? "Standard";
}

export function feedbackFor(score: number): string {
  if (score < 60) return "Let's reinforce the basics — we've simplified your next lessons.";
  if (score >= 80) return "Excellent! You've unlocked advanced content.";
  return "Good progress — keep going at this level.";
}
