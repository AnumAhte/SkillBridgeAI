/**
 * One-click demo mode: a seeded student profile with realistic history so
 * judges see a lived-in product (progress over time, saved content) instead
 * of empty states.
 */

import { saveArtifact, listArtifacts } from "@/lib/storage";
import type {
  AppUser,
  AssessmentPayload,
  GeneratedCourse,
  TutorSessionPayload,
} from "@/types";

export const DEMO_USER: AppUser = {
  id: "demo-aziza",
  email: "aziza@demo.skillbridge.uz",
  name: "Aziza Karimova",
  isDemo: true,
};

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

/** Idempotent: seeds only when the demo profile has no saved content yet. */
export async function seedDemoData(): Promise<void> {
  const existing = await listArtifacts(DEMO_USER);
  if (existing.length > 0) return;

  const firstAssessment: AssessmentPayload = {
    analysis: {
      targetRole: "Data Analyst",
      readinessScore: 38,
      haveSkills: [
        { name: "Excel", proficiency: "intermediate" },
        { name: "Communication", proficiency: "advanced" },
      ],
      gaps: [
        { skill: "SQL", priority: 3 },
        { skill: "Power BI", priority: 3 },
        { skill: "Python", priority: 2 },
        { skill: "Statistics", priority: 2 },
      ],
      roadmap: [
        { position: 1, title: "Learn SQL", skill: "SQL", estWeeks: 3 },
        { position: 2, title: "Learn Power BI", skill: "Power BI", estWeeks: 3 },
        { position: 3, title: "Learn Python", skill: "Python", estWeeks: 2 },
        { position: 4, title: "Learn Statistics", skill: "Statistics", estWeeks: 2 },
      ],
      rationale:
        "Strong Excel and reporting background from a retail analytics internship in Tashkent, but no database or BI-tool experience was detected — SQL and Power BI are the highest-weight requirements for junior Data Analyst roles.",
      usedFallback: false,
    },
    sourceFile: "aziza_cv_v1.pdf",
  };

  const latestAssessment: AssessmentPayload = {
    analysis: {
      targetRole: "Data Analyst",
      readinessScore: 64,
      haveSkills: [
        { name: "Excel", proficiency: "intermediate" },
        { name: "SQL", proficiency: "intermediate" },
        { name: "Python", proficiency: "beginner" },
        { name: "Communication", proficiency: "advanced" },
      ],
      gaps: [
        { skill: "Power BI", priority: 3 },
        { skill: "Statistics", priority: 2 },
      ],
      roadmap: [
        { position: 1, title: "Learn Power BI", skill: "Power BI", estWeeks: 3 },
        { position: 2, title: "Learn Statistics", skill: "Statistics", estWeeks: 2 },
      ],
      rationale:
        "SQL and basic Python now appear with project evidence (sales dashboard for a local marketplace), lifting readiness from 38% to 64%. Power BI remains the main gap — it is requested in 7 of 10 junior analyst postings in Tashkent.",
      usedFallback: false,
    },
    sourceFile: "aziza_cv_v2.pdf",
  };

  const course: GeneratedCourse = {
    title: "SQL asoslari — ma'lumotlar tahlili uchun",
    level: "beginner",
    outcomes: [
      "Write SELECT queries with filtering and sorting",
      "Join tables to answer real business questions",
      "Aggregate data with GROUP BY for reports",
    ],
    modules: [
      {
        title: "So'rovlar asoslari (Query basics)",
        lessons: [
          { title: "SELECT va WHERE", summary: "Reading rows and filtering them with conditions." },
          { title: "ORDER BY va LIMIT", summary: "Sorting results and taking the top N." },
        ],
        quiz: [
          {
            question: "Qaysi buyruq qatorlarni filtrlaydi? (Which clause filters rows?)",
            options: ["WHERE", "ORDER BY", "GROUP BY", "SELECT"],
            answerIndex: 0,
            explanation: "WHERE keeps only rows that match the condition.",
          },
        ],
        assignment: "Toshkent do'konlari savdo jadvalidan eng ko'p sotilgan 5 mahsulotni toping.",
      },
      {
        title: "JOIN va agregatsiya",
        lessons: [
          { title: "INNER va LEFT JOIN", summary: "Combining customers with their orders." },
          { title: "GROUP BY bilan hisobotlar", summary: "Counting and summing per category." },
        ],
        quiz: [
          {
            question: "Ikkala jadvalda mos kelgan qatorlarni qaysi JOIN qaytaradi?",
            options: ["LEFT JOIN", "INNER JOIN", "FULL JOIN", "CROSS JOIN"],
            answerIndex: 1,
            explanation: "INNER JOIN returns only rows with a match in both tables.",
          },
        ],
        assignment: "Mijozlar va buyurtmalar jadvallarini birlashtirib, viloyatlar bo'yicha daromad hisobotini tuzing.",
      },
    ],
    usedFallback: false,
  };

  const tutorUz: TutorSessionPayload = {
    language: "uz",
    messages: [
      { role: "user", content: "SQL JOIN nima? Oddiy misol bilan tushuntiring." },
      {
        role: "assistant",
        content:
          "JOIN — ikki jadvalni umumiy ustun orqali birlashtirish. Misol: `mijozlar` va `buyurtmalar` jadvallari bor. INNER JOIN faqat buyurtma qilgan mijozlarni qaytaradi:\n\nSELECT m.ism, b.summa\nFROM mijozlar m\nINNER JOIN buyurtmalar b ON m.id = b.mijoz_id;\n\nLEFT JOIN esa barcha mijozlarni qaytaradi — buyurtmasi yo'qlarda summa NULL bo'ladi.",
      },
      { role: "user", content: "LEFT JOIN qachon kerak bo'ladi?" },
      {
        role: "assistant",
        content:
          "Hech narsa sotib olmagan mijozlarni ham ko'rishni istasangiz — masalan, marketing ro'yxati uchun. LEFT JOIN chap jadvaldagi hamma qatorni saqlab qoladi.",
      },
    ],
  };

  const tutorEn: TutorSessionPayload = {
    language: "en",
    messages: [
      { role: "user", content: "Explain Big-O notation simply." },
      {
        role: "assistant",
        content:
          "Big-O describes how an algorithm's work grows as input grows. O(1): same time regardless of size (array lookup). O(n): doubles when input doubles (a single loop). O(n²): nested loops — fine for 100 items, painful for 1,000,000. Interviewers mostly want you to spot the loop structure and name the growth.",
      },
    ],
  };

  // Backdated ids/timestamps tell a progress story on the dashboard.
  await saveArtifact(DEMO_USER, "assessment", "Data Analyst — 38%", firstAssessment);
  await saveArtifact(DEMO_USER, "tutor", "SQL JOIN nima?", tutorUz);
  await saveArtifact(DEMO_USER, "course", course.title, course);
  await saveArtifact(DEMO_USER, "tutor", "Explain Big-O notation", tutorEn);
  await saveArtifact(DEMO_USER, "assessment", "Data Analyst — 64%", latestAssessment);

  // Spread createdAt over the past two weeks (localStorage backend only).
  try {
    const key = `sb:artifacts:${DEMO_USER.id}`;
    const items = JSON.parse(localStorage.getItem(key) ?? "[]") as {
      title: string;
      createdAt: string;
      updatedAt: string;
    }[];
    const ages: Record<string, number> = {
      "Data Analyst — 38%": 14,
      "SQL JOIN nima?": 10,
      "SQL asoslari — ma'lumotlar tahlili uchun": 7,
      "Explain Big-O notation": 3,
      "Data Analyst — 64%": 1,
    };
    for (const item of items) {
      const age = ages[item.title];
      if (age !== undefined) {
        item.createdAt = daysAgo(age);
        item.updatedAt = daysAgo(age);
      }
    }
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Cosmetic only.
  }
}
