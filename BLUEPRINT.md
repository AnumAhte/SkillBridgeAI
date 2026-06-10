# SkillBridge AI — Hackathon Blueprint

> **AI-powered bridge between learning and earning for Uzbekistan's digital economy.**
> Built on free tiers. Pitch-ready. Startup-grade architecture — not just another LMS.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Unique Selling Proposition (USP)](#2-unique-selling-proposition-usp)
3. [System Architecture Diagram](#3-system-architecture-diagram)
4. [Database Schema](#4-database-schema)
5. [User Flows](#5-user-flows)
6. [UI/UX Wireframes](#6-uiux-wireframes)
7. [Complete Folder Structure](#7-complete-folder-structure)
8. [Supabase Schema](#8-supabase-schema)
9. [API Design](#9-api-design)
10. [Gemini Integration Plan](#10-gemini-integration-plan)
11. [MVP Roadmap (48-Hour Hackathon Version)](#11-mvp-roadmap-48-hour-hackathon-version)
12. [Demo Day Flow](#12-demo-day-flow)
13. [Pitch Deck Outline](#13-pitch-deck-outline)
14. [Competitive Advantage Analysis](#14-competitive-advantage-analysis)
15. [Future Scaling Plan](#15-future-scaling-plan)

---

## 1. Product Vision

**Vision statement:**
> *Every Uzbek citizen — regardless of language, location, or income — should be able to discover a future-ready career path, learn the exact skills for it in their own language, and get matched to a real job or internship.*

Uzbekistan's "Digital Uzbekistan 2030" strategy and IT Park's rapid growth created enormous demand for digital talent — but four gaps remain:

| Gap | Reality today | SkillBridge AI's answer |
|---|---|---|
| **Personalization** | One-size-fits-all courses | AI roadmap built from *your* CV + target role |
| **Language** | Most quality content is English-only | Uzbek / Russian / English tutor + lessons |
| **Educator shortage** | Not enough trainers to scale | Educator Copilot multiplies one teacher into many |
| **Education ↔ industry gap** | Graduates lack market skills | Labor-market-driven roadmaps + job matching |

**Mission:** Close the loop — *Assess → Learn → Prove → Get Matched* — in a single platform.

SkillBridge AI is positioned as **national digital-skills infrastructure**, deployable by the government, universities, IT Park training centers, and individuals alike.

---

## 2. Unique Selling Proposition (USP)

> **"The only AI platform that turns your resume into a personalized, multilingual learning roadmap — and then connects that learning directly to real jobs in Uzbekistan."**

What makes it defensible vs. Coursera / Udemy / local LMS products:

1. **Closed learning-to-earning loop.** Competitors stop at "course complete." We continue to *job-matched* with a measurable **Readiness Score**.
2. **Native trilingual AI** (Uzbek/Russian/English) — most global platforms barely support Uzbek. This is our local moat.
3. **Labor-market-aligned roadmaps** — skills are recommended from *demand data*, not a static catalog.
4. **Educator Copilot** — solves the educator-shortage problem competitors ignore. One teacher scales to thousands.
5. **AI transparency layer** — every recommendation explains *why* (builds trust with government + universities).
6. **Government-ready** — data-localization-ready, GDPR-aligned, role-based dashboards for national programs.

**One-liner for judges:** *"LinkedIn × Duolingo × ChatGPT, localized for Uzbekistan, on a free-tier MVP you can demo today."*

---

## 3. System Architecture Diagram

API-first, serverless, all free-tier.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser / Mobile-responsive PWA)      │
│   Next.js 15 App Router · React 19 · Tailwind · shadcn/ui · Dark/Light     │
└───────────────┬────────────────────────────────────────────┬─────────────┘
                │ HTTPS                                        │
                ▼                                              ▼
┌──────────────────────────────┐            ┌──────────────────────────────┐
│   Server Actions (mutations) │            │   Route Handlers (/api/*)     │
│   - CV analysis              │            │   - REST API (API-first)      │
│   - roadmap generation       │            │   - streaming tutor chat      │
│   - quiz grading             │            │   - webhooks / integrations   │
└───────────────┬──────────────┘            └───────────────┬──────────────┘
                │                                            │
                ▼                                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │              SERVICE / DOMAIN LAYER (src/lib)              │
        │  career · learning · tutor · educator · matching · market  │
        └───────┬───────────────────────────────────┬───────────────┘
                │                                    │
                ▼                                    ▼
   ┌────────────────────────┐          ┌──────────────────────────────┐
   │   Gemini 2.5 Flash      │          │   Supabase (free tier)        │
   │   - skill extraction    │          │   - Postgres + Row Level Sec. │
   │   - recommendations     │          │   - Auth (email/OAuth)        │
   │   - lesson/quiz gen      │          │   - Storage (CV uploads)      │
   │   - multilingual tutor   │          │   - pgvector (future RAG)     │
   │   structured JSON output │          └──────────────────────────────┘
   └────────────────────────┘
                                         Hosting: Vercel (free) · CI: GitHub
```

**Key principles**
- **API-first:** every capability is a service function callable by Server Actions *and* `/api` routes → easy mobile/3rd-party reuse later.
- **Stateless compute, stateful DB:** all persistence in Supabase; functions are pure → trivially scalable on Vercel serverless.
- **AI isolated behind an adapter** (`src/lib/gemini`) → swap models/providers without touching features.
- **Security:** RLS enforces per-user data isolation; service-role key never leaves the server.

---

## 4. Database Schema

Conceptual ERD (physical SQL in [§8](#8-supabase-schema)).

```
profiles ──1:1── auth.users
   │
   ├──1:M── resumes ──1:M── extracted_skills
   │
   ├──1:M── career_assessments ──1:M── skill_gaps
   │                          └──1:1── learning_roadmaps ──1:M── roadmap_items
   │
   ├──1:M── enrollments ──1:M── lesson_progress
   │                     └──1:M── quiz_attempts
   │
   ├──1:M── tutor_sessions ──1:M── tutor_messages
   │
   ├──1:M── job_applications
   │
   └──(educator)──1:M── courses ──1:M── modules ──1:M── lessons ──1:M── quizzes

skills (taxonomy) ──M:M── roles (job_role_skills)
roles ──1:M── job_postings (mock dataset)
market_trends (mock dataset, time-series of skill demand)
```

**Core entities**

| Table | Purpose |
|---|---|
| `profiles` | role (student/jobseeker/educator/admin), language, locale, consent flags |
| `resumes` | uploaded CV text + storage path |
| `career_assessments` | target role, readiness score, AI rationale |
| `skill_gaps` | missing skills per assessment, priority |
| `learning_roadmaps` / `roadmap_items` | ordered learning plan |
| `courses/modules/lessons/quizzes` | content (AI-generated or educator-authored) |
| `enrollments/lesson_progress/quiz_attempts` | adaptive learning state |
| `tutor_sessions/tutor_messages` | multilingual chat history |
| `job_postings/job_applications` | matching + resume scoring |
| `skills/roles/job_role_skills` | taxonomy that powers gap analysis & matching |
| `market_trends` | labor-market insights dashboard |
| `ai_audit_log` | transparency: every AI call, model, prompt hash, latency |

---

## 5. User Flows

### Flow A — Student / Job Seeker (the hero flow)
```
Sign up → pick role + language
   → Upload CV (or paste text)
   → Gemini extracts skills  →  pick target role ("Data Analyst")
   → Readiness Score: 75%  +  Skill Gaps: [SQL, Power BI, Statistics]
   → "Generate my roadmap"  → ordered learning path
   → Start lessons → take quiz
        ├─ score < 60% → lessons auto-simplify, extra practice
        └─ score ≥ 80% → advanced content unlocked
   → Readiness Score rises → Job Matchmaker shows matched internships/jobs
   → Apply → resume scored against posting → "next skills to improve match"
```

### Flow B — Educator
```
Sign up (educator) → "Create a beginner AI course"
   → Copilot generates modules + lessons + quizzes + assignments + outcomes
   → Edit/approve → publish to learners
   → View student progress insights dashboard
```

### Flow C — Multilingual Tutor (cross-cutting)
```
Any screen → open Tutor → choose language (UZ/RU/EN)
   → ask: "Explain SQL JOINs" / "Help with my homework" / "Debug this code"
   → streamed answer in chosen language → save to session history
```

### Flow D — Admin / Government Program
```
Admin dashboard → cohort analytics (readiness by region/skill)
   → labor-market insights → identify national skill gaps → seed roadmaps
```

---

## 6. UI/UX Wireframes

Low-fidelity ASCII wireframes (the actual scaffold implements these in shadcn/ui).

**Landing**
```
┌────────────────────────────────────────────────────────┐
│ SkillBridge AI            Features  Pricing  [☾] [Login] │
├────────────────────────────────────────────────────────┤
│   From your resume to a real job — in your language.     │
│   [ Get my Readiness Score → ]   [ See demo ]            │
│   ───────────────────────────────────────────────       │
│   🇺🇿 Uzbek · 🇷🇺 Russian · 🇬🇧 English   ·  Powered by Gemini│
└────────────────────────────────────────────────────────┘
```

**Dashboard (student)**
```
┌──────────┬─────────────────────────────────────────────┐
│ ◧ Sidebar│  Welcome back, Aziz       Readiness ◉ 75%    │
│ Navigator│ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│ Learning │ │ Career      │ │ Continue    │ │ Matched  │ │
│ Tutor    │ │ Data Analyst│ │ learning →  │ │ 3 jobs   │ │
│ Jobs     │ └─────────────┘ └─────────────┘ └──────────┘ │
│ Insights │  Skill gaps: [SQL ▮▮▯] [Power BI ▮▯▯] ...     │
│ ─────────│  Roadmap ▸ 1. SQL Basics ▸ 2. Data Viz ...    │
│ [☾ theme]│  ⓘ Why these? (AI transparency)               │
└──────────┴─────────────────────────────────────────────┘
```

**Career Navigator result**
```
┌────────────────────────────────────────────────────────┐
│  Target: Data Analyst        Readiness  ◉◉◉◉◉◉◉◉○○ 75%   │
│  ✔ Have: Excel, Python basics, Communication             │
│  ✖ Need: SQL · Power BI · Statistics                     │
│  ── Roadmap ───────────────────────────────────────────  │
│  ① SQL Fundamentals      (2 wks)  [Start]                │
│  ② Power BI Dashboards   (2 wks)  🔒                     │
│  ③ Statistics for Data   (3 wks)  🔒                     │
│  ⓘ This roadmap was generated from your CV + live demand │
└────────────────────────────────────────────────────────┘
```

**Tutor (chat)**
```
┌────────────────────────────────────────────────────────┐
│ Tutor    Language: [Uzbek ▾]                             │
│ ───────────────────────────────────────────────────────│
│  🧑 SQL JOIN nima?                                       │
│  🤖 JOIN ikki jadvalni bog'laydi... (explanation in UZ)  │
│  [ Type your question…                         ] [Send] │
└────────────────────────────────────────────────────────┘
```

**Design system:** shadcn/ui (new-york), slate base, CSS-variable theming, `next-themes` dark/light, fully responsive (mobile-first grid → desktop sidebar).

---

## 7. Complete Folder Structure

```
skillbridge-ai/
├── BLUEPRINT.md                 ← this document (all 15 deliverables)
├── README.md                    ← setup + run instructions
├── package.json · tsconfig.json · next.config.ts
├── tailwind.config.ts · postcss.config.mjs · components.json
├── .env.example · .gitignore · .eslintrc.json
├── supabase/
│   └── schema.sql               ← tables, RLS, seed data (§8)
└── src/
    ├── app/
    │   ├── layout.tsx            ← root layout + ThemeProvider
    │   ├── globals.css           ← design tokens (light/dark)
    │   ├── page.tsx              ← marketing landing
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── signup/page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx        ← sidebar shell
    │   │   ├── dashboard/page.tsx
    │   │   ├── career-navigator/page.tsx   ← Module 1
    │   │   ├── learning/page.tsx           ← Module 2
    │   │   ├── tutor/page.tsx              ← Module 3
    │   │   ├── educator/page.tsx           ← Module 4
    │   │   ├── jobs/page.tsx               ← Module 5
    │   │   └── insights/page.tsx           ← Module 6
    │   └── api/
    │       ├── career/analyze/route.ts     ← REST: CV → skills+roadmap
    │       ├── tutor/route.ts              ← streaming chat
    │       ├── educator/generate/route.ts  ← course generation
    │       └── health/route.ts
    ├── components/
    │   ├── ui/                  ← shadcn primitives (button, card, …)
    │   ├── theme-provider.tsx · theme-toggle.tsx
    │   ├── ai-transparency.tsx  ← "Why this recommendation?" panel
    │   └── dashboard/sidebar.tsx
    ├── lib/
    │   ├── gemini/
    │   │   ├── client.ts        ← model adapter (swap-friendly)
    │   │   ├── prompts.ts       ← versioned prompt templates
    │   │   └── schemas.ts       ← zod schemas for structured output
    │   ├── services/
    │   │   ├── career.ts        ← extractSkills, analyzeReadiness, buildRoadmap
    │   │   ├── learning.ts      ← adaptive difficulty logic
    │   │   ├── tutor.ts
    │   │   ├── educator.ts
    │   │   └── matching.ts      ← resume scoring + job match
    │   ├── supabase/
    │   │   ├── client.ts        ← browser client
    │   │   └── server.ts        ← server client (cookies)
    │   ├── data/
    │   │   ├── skills.ts        ← taxonomy + role→skill map
    │   │   ├── jobs.mock.ts     ← mock postings (MVP)
    │   │   └── market.mock.ts   ← mock labor-market trends
    │   └── utils.ts
    └── types/
        └── index.ts             ← shared domain types
```

---

## 8. Supabase Schema

Full SQL with **Row Level Security** lives in [`supabase/schema.sql`](./supabase/schema.sql). Highlights:

- Every user-owned table has RLS: `auth.uid() = user_id`.
- `profiles` auto-created via trigger on `auth.users` insert.
- Enums for `user_role`, `language`, `roadmap_status`.
- `ai_audit_log` records model, latency, token estimate, and a prompt hash for **AI transparency & GDPR auditability** (no raw PII stored in logs).
- Seed data: skills taxonomy, sample roles, mock job postings, mock market trends — so the demo works with **zero external dependencies**.

Run it: Supabase Dashboard → SQL Editor → paste `schema.sql` → Run.

---

## 9. API Design

REST, API-first. All routes return `{ data, error, meta }`. Auth via Supabase session cookie (or Bearer for external clients).

| Method | Route | Body / Params | Returns |
|---|---|---|---|
| `POST` | `/api/career/analyze` | `{ resumeText, targetRole? }` | `{ skills[], readinessScore, gaps[], roadmap[], rationale }` |
| `POST` | `/api/tutor` | `{ messages[], language }` | streamed text (SSE) |
| `POST` | `/api/educator/generate` | `{ topic, level, language }` | `{ course: { modules[], lessons[], quizzes[], outcomes[] } }` |
| `POST` | `/api/learning/quiz/grade` | `{ quizId, answers[] }` | `{ score, nextDifficulty, feedback }` |
| `GET`  | `/api/jobs/match` | `?assessmentId=` | `{ matches[] (score, missingSkills) }` |
| `GET`  | `/api/market/trends` | `?role=` | `{ trending[], emerging[], recommended[] }` |
| `GET`  | `/api/health` | — | `{ status, model, db }` |

**Conventions**
- Validation with **zod** at the boundary (reject early).
- AI endpoints log to `ai_audit_log`.
- Idempotent reads cacheable at the edge; mutations via Server Actions for type-safe forms.
- Errors: typed codes (`AUTH`, `VALIDATION`, `AI_TIMEOUT`, `RATE_LIMIT`).

---

## 10. Gemini Integration Plan

**Model:** `gemini-2.5-flash` (fast, cheap, generous free tier — ideal for hackathon).

**Adapter pattern** (`src/lib/gemini/client.ts`): one `generateJSON<T>(prompt, schema)` and one `generateStream(messages)`. Features never call the SDK directly → provider-swappable.

| Capability | Technique | Output |
|---|---|---|
| Skill extraction | `responseMimeType: application/json` + schema | typed `Skill[]` |
| Readiness + gaps | role→skill map injected into prompt, JSON out | score + gaps |
| Roadmap generation | structured JSON, ordered items | `RoadmapItem[]` |
| Curriculum gen | nested JSON (modules→lessons→quizzes) | `Course` |
| Quiz generation/grading | JSON Qs; grading via rubric prompt | graded result |
| Tutor | streaming, system prompt sets language + pedagogy | SSE text |
| Translation | system instruction "respond in {language}" | localized text |

**Reliability for live demo**
- **Strict JSON** via `responseSchema` → no brittle parsing.
- **Graceful fallback:** if `GEMINI_API_KEY` is missing or the call fails, services return realistic **mock results** so the demo never breaks on stage. *(implemented in the scaffold)*
- **Prompt versioning** in `prompts.ts` for reproducibility.
- **Transparency:** each call returns a `rationale` string surfaced in the UI's "Why this recommendation?" panel.

---

## 11. MVP Roadmap (48-Hour Hackathon Version)

| Phase | Hours | Deliverable | Owner |
|---|---|---|---|
| **0. Setup** | 0–2 | Repo, Vercel, Supabase project, `schema.sql` run, env keys | All |
| **1. Auth + shell** | 2–8 | Supabase Auth, dashboard layout, theme toggle, landing | FE |
| **2. ⭐ Career Navigator** | 8–18 | CV paste/upload → Gemini skills → readiness + gaps + roadmap | FS |
| **3. Tutor** | 18–26 | Streaming trilingual chat | FS |
| **4. Educator Copilot** | 26–32 | Topic → course/quiz generation | BE |
| **5. Jobs + Insights** | 32–38 | Mock matching, resume score, trends dashboard | FE |
| **6. Adaptive learning** | 38–42 | Quiz grade → difficulty adjust + progress | BE |
| **7. Polish + transparency** | 42–46 | AI "why" panels, empty states, mobile pass | All |
| **8. Demo prep** | 46–48 | Seed demo account, rehearse script, deploy | All |

**Cut-line (if behind):** Modules 1 + 3 are the demo spine — ship those flawless first. 4/5/6 can be "generate on click" demos. Everything degrades to mock data, so nothing blocks the pitch.

---

## 12. Demo Day Flow (3–4 min)

1. **Hook (20s):** "70%+ of Uzbek graduates feel unready for digital jobs. Watch us fix that in 3 minutes."
2. **Live (2m):**
   - Paste a real CV → **Readiness Score 75% for Data Analyst** appears → gaps + roadmap.
   - Click **"Why?"** → AI transparency panel (judge trust moment).
   - Open **Tutor**, ask *"SQL JOIN nima?"* → answer streams **in Uzbek**.
   - **Educator Copilot:** type "beginner AI course" → full curriculum generated live.
   - **Jobs:** roadmap progress bumps readiness → matched internship appears.
3. **Vision (40s):** government/university rollout, labor-market dashboard, scaling plan.
4. **Close (10s):** "LinkedIn × Duolingo × ChatGPT — localized for Uzbekistan. Live now on free tier."

---

## 13. Pitch Deck Outline (10 slides)

1. **Title** — SkillBridge AI + one-liner + team.
2. **Problem** — 4 gaps, Uzbekistan stats, "Digital Uzbekistan 2030."
3. **Solution** — the Assess→Learn→Prove→Match loop.
4. **Demo** — live (or 30s GIF backup).
5. **USP / Moat** — trilingual + closed loop + transparency.
6. **Market** — students, job seekers, universities, IT Park, government (TAM/SAM/SOM).
7. **How it works** — architecture + Gemini, "built on free tier."
8. **Traction plan / GTM** — pilot with 1 university + IT Park training center.
9. **Business model** — B2C freemium, B2B (institutions), B2G (national programs).
10. **Ask & vision** — pilot partners, scaling roadmap, national infrastructure.

---

## 14. Competitive Advantage Analysis

| | Coursera/Udemy | Local LMS / Moodle | LinkedIn Learning | **SkillBridge AI** |
|---|---|---|---|---|
| Personalized from *your* CV | ✖ | ✖ | partial | ✅ |
| Uzbek language | ✖ | partial | ✖ | ✅ native |
| Skill-gap → roadmap | ✖ | ✖ | partial | ✅ |
| Learning → **job matching** | ✖ | ✖ | partial | ✅ closed loop |
| Educator AI copilot | ✖ | ✖ | ✖ | ✅ |
| Labor-market-driven | ✖ | ✖ | partial | ✅ |
| AI transparency | ✖ | ✖ | ✖ | ✅ |
| Gov/data-localization ready | ✖ | partial | ✖ | ✅ |

**Moat:** local language + labor-market data + the closed loop. Global players won't prioritize Uzbek; local LMS players lack AI depth. We sit in the gap.

---

## 15. Future Scaling Plan

**Phase 1 — Post-hackathon (0–3 mo):** real CV file parsing (PDF/DOCX), pgvector RAG over Uzbek curricula, email auth hardening, analytics.

**Phase 2 — Pilot (3–9 mo):** partner with 1 university + 1 IT Park center; replace mock jobs with real HeadHunter.uz / IT Park job feeds; voice tutor (Gemini Live / STT-TTS); certificates.

**Phase 3 — Scale (9–24 mo):**
- **Infra:** Supabase Pro / dedicated Postgres, read replicas, edge caching, queue for batch AI (cost control).
- **AI:** fine-tuned/RAG Uzbek models, embeddings-based matching, fraud/plagiarism detection.
- **Business:** B2G contracts (Ministry of Digital Technologies), B2B institutional seats, B2C premium.
- **Product:** mobile app (the API-first design makes this cheap), employer portal, micro-credentials, regional expansion (Kazakhstan, Tajikistan — similar language/market dynamics).

**Compliance roadmap:** full data-localization (in-country hosting), GDPR + Uzbek personal-data-law alignment, consent management, AI explainability reports for regulators.

---

*Built for the Uzbekistan hackathon — feasible on free tiers, designed to become national infrastructure.*
