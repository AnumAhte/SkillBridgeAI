// Shared domain types for SkillBridge AI.

export type Language = "uz" | "ru" | "en";
export type UserRole = "student" | "jobseeker" | "educator" | "admin";

export interface Skill {
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced";
}

export interface SkillGap {
  skill: string;
  priority: number;
}

export interface RoadmapItem {
  position: number;
  title: string;
  skill: string;
  estWeeks: number;
}

export interface CareerAnalysis {
  targetRole: string;
  readinessScore: number; // 0..100
  haveSkills: Skill[];
  gaps: SkillGap[];
  roadmap: RoadmapItem[];
  rationale: string; // AI transparency
  usedFallback: boolean;
}

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface GeneratedCourse {
  title: string;
  level: string;
  outcomes: string[];
  modules: {
    title: string;
    lessons: { title: string; summary: string }[];
    quiz: QuizQuestion[];
    assignment: string;
  }[];
  usedFallback: boolean;
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  isInternship: boolean;
  matchScore: number; // 0..100
  missingSkills: string[];
}

/** Signed-in identity — a real Supabase user or the offline demo student. */
export interface AppUser {
  id: string;
  email: string | null;
  name: string;
  isDemo: boolean;
}

export type ArtifactKind = "assessment" | "course" | "tutor";

/** A saved piece of user-generated content (assessment, course, tutor chat). */
export interface Artifact<T = unknown> {
  id: string;
  kind: ArtifactKind;
  title: string;
  payload: T;
  createdAt: string;
  updatedAt: string;
}

/** Payload stored for a career assessment artifact. */
export interface AssessmentPayload {
  analysis: CareerAnalysis;
  sourceFile?: string | null;
}

/** Payload stored for a tutor conversation artifact. */
export interface TutorSessionPayload {
  language: Language;
  messages: TutorMessage[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
}
