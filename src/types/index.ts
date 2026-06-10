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

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
}
