# SkillBridge AI 🇺🇿

> AI-powered bridge between **learning** and **earning** for Uzbekistan's digital economy.
> Turn a resume into a personalized, multilingual learning roadmap — and connect it to real jobs.

**📘 Full product blueprint (15 deliverables): [`BLUEPRINT.md`](./BLUEPRINT.md)**
— vision, USP, architecture, schema, user flows, wireframes, API design, Gemini plan, MVP roadmap, pitch deck, competitive analysis, scaling plan.

---

## What's inside

| Module | Route | Status |
|---|---|---|
| 1 · AI Career Navigator | `/career-navigator` | ✅ live (Gemini + fallback) |
| 2 · Adaptive Learning Engine | `/learning` | ✅ live (difficulty adjusts) |
| 3 · Multilingual AI Tutor | `/tutor` | ✅ live (streaming, UZ/RU/EN) |
| 4 · Educator Copilot | `/educator` | ✅ live (course generation) |
| 5 · Job Matchmaker | `/jobs` | ✅ live (mock dataset) |
| 6 · Labor Market Insights | `/insights` | ✅ live (mock dataset) |

**Every AI feature degrades gracefully to a realistic mock if no Gemini key is set — so the demo never breaks on stage.**

## Tech stack (all free tier)

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · shadcn/ui · Supabase (Postgres + Auth) · Gemini 2.5 Flash · Vercel.

## Quick start

```bash
npm install
cp .env.example .env.local   # add keys (optional — runs in demo mode without them)
npm run dev                  # http://localhost:3000
```

### Optional: enable real AI + persistence
1. **Gemini** — get a free key at https://aistudio.google.com/app/apikey → set `GEMINI_API_KEY`.
2. **Supabase** — create a free project → run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor → set the three `SUPABASE`/`NEXT_PUBLIC_SUPABASE_*` vars.

Without keys the app still runs end-to-end using deterministic fallbacks and seed/mock data.

## Architecture (API-first)

```
UI (App Router) → Server Actions / Route Handlers → Services (src/lib/services)
                                                       ├─ Gemini adapter (src/lib/gemini)
                                                       └─ Supabase (src/lib/supabase)
```

Features never call the Gemini SDK directly — only the adapter — so the model/provider is swappable. See `BLUEPRINT.md §3`.

## Project structure

See `BLUEPRINT.md §7` for the annotated tree. Key folders:
- `src/lib/gemini` — model adapter, versioned prompts, structured-output schemas
- `src/lib/services` — career / learning / tutor / educator / matching business logic
- `src/app/(dashboard)` — the six modules
- `src/app/api` — REST endpoints (`/api/health` reports config status)

## Health check

`GET /api/health` → `{ status, model, geminiConfigured, supabaseConfigured }`

---

Built for the Uzbekistan hackathon · aligned with **Digital Uzbekistan 2030**.
