# SkillBridge AI — Hackathon Readiness Audit

*Code-freeze audit · 2026-06-11 · commit `ca6339d` · no changes implemented*

---

## 1. Security Review

### Authentication security — **GOOD with caveats**

| Check | Status |
|---|---|
| Passwords handled by Supabase Auth (bcrypt, never stored by app) | ✅ |
| Session via Supabase SSR cookies, auto-refresh subscription | ✅ |
| Demo session is an explicit, local-only flag — no fake credentials | ✅ |
| Sign-out clears both demo flag and Supabase session | ✅ |
| Password minimum only 6 chars (form `minLength`) | ⚠️ acceptable for MVP |
| Email-confirmation flow not handled in UI | ⚠️ see Demo Risk #5 |

### Authorization & route protection — **ADEQUATE for MVP, know the limits**
- Dashboard routes are protected by a **client-side** `AuthGate` (redirect to `/login`). There is no middleware enforcement, so the route *shells* are technically reachable with JS disabled or via direct HTML fetch.
- **The real security boundary is correct, though:** all user data lives behind Supabase **Row Level Security** (`auth.uid() = user_id` on `user_artifacts` and every user table) or in the visitor's own localStorage. An attacker bypassing the client gate sees an empty UI, not data.
- Honest framing for judges: "route protection is UX, RLS is security" — that is a defensible architecture.

### File upload security — **GOOD**
- Size capped twice (8 MB in route *and* service), empty-file rejected, type allowlist (PDF/DOCX/DOC/TXT), Node runtime pinned, all parse failures → friendly 422/500 without stack leakage.
- Files are processed **in memory only** — never written to disk, never stored. Strong privacy posture.
- Gaps (post-hackathon): type detection trusts extension/MIME rather than magic bytes; a malicious crafted PDF could burn CPU in `pdf-parse` (DoS vector, not data risk). No rate limiting.

### API validation — **GOOD**
- All JSON endpoints use zod schemas with enums and minimums; malformed JSON handled; consistent `{data, error}` envelope; correct 400/413/422/500 codes.
- Gaps: `resumeText` and tutor `messages` have **no maximum length** (prompt cost abuse if deployed publicly; the prompt builder slicing CVs to 6 000 chars limits Gemini cost but not request size). API routes are **unauthenticated** — fine for the demo, must be locked to sessions + rate-limited before public launch.
- Prompt-injection exposure is reduced by structured output (`responseSchema` forces JSON shape); tutor system instruction is fixed server-side.

### Sensitive data handling — **STRONG**
- ✅ `.env*.local` gitignored; no keys in repo history; `GEMINI_API_KEY` server-only; service-role key documented as server-only and never used client-side.
- ✅ CVs analyzed transiently; `ai_audit_log` schema stores prompt *hashes*, not content; consent flags exist on `profiles`; demo data never leaves the browser.
- ⚠️ `npm audit`: 2 **moderate** advisories (postcss range via `next`). Not exploitable in this app's usage; defer upgrade past code freeze.
- For the data-localization question: Supabase region is selectable at project creation; self-hosted Postgres is the Phase-3 migration path already described in the blueprint.

**Security verdict: appropriate for a hackathon MVP. Top 3 before public launch: authenticate + rate-limit API routes, add max input lengths, server-side session middleware.**

---

## 2. Performance Review

### Bundle size — **EXCELLENT**
From the production build: shared First Load JS **102 kB**; heaviest pages: landing 191 kB, dashboard 189 kB, lightest interactive page 113 kB. All pages are **statically prerendered** (○); only API routes are dynamic. No images, no heavy chart libs, lucide icons tree-shaken. This is comfortably in the "fast SaaS" range — no action needed.

### Slow routes
| Route | Expected latency | Why |
|---|---|---|
| `POST /api/educator/generate` | **3–10 s** | Largest Gemini response (full curriculum JSON) |
| `POST /api/career/analyze` | 2–6 s | Structured analysis |
| `POST /api/career/extract` | < 1 s typical | CPU-bound parse; large scanned PDFs slower |
| `POST /api/tutor` | first token ~1–2 s | Mitigated — **streams** |
| Everything else | instant | static + localStorage |

### Bottlenecks & opportunities
1. **Gemini latency is the only real bottleneck** and it is already handled with spinners/streaming. Optional polish (post-freeze): stream the course generation, or show a step-wise "Analyzing skills → building roadmap" progress label so 6 seconds feels intentional.
2. Vercel free-tier **cold starts** add ~1s to the first API hit — warm the app by loading the landing page before going on stage.
3. Dashboard fires 3 storage reads in `Promise.all` — already optimal.
4. `pdf-parse` copies the buffer to `Uint8Array` — required correctness fix, negligible cost at 8 MB cap.

**Performance verdict: no blocking issues. The app will feel fast in the demo.**

---

## 3. UX Review

### Confusing flows
1. **Tutor history doesn't reopen** — the dashboard lists tutor sessions and links to `/tutor`, but the chat opens empty rather than restoring that conversation. A judge who clicks a session may think saving is broken. *Mitigation in demo: present it as "activity history" (which it is) and don't click through expecting restoration.*
2. Demo sign-out → `/login` is clean, but re-entering demo keeps prior artifacts (by design, idempotent seed). If you want a pristine reset between rehearsals: clear site data in DevTools.
3. Saves are silent — no "Saved ✓" toast after analysis/course generation. The dashboard proves persistence instead; in the demo, *visit the dashboard after generating content* to land the point.

### Loading states — **GOOD**
Skeletons on dashboard/jobs/auth-gate; spinner buttons on analyze/generate/login/demo; streaming text in tutor; upload spinner in dropzone. No identified gap on a slow path.

### Empty states — **GOOD**
All four dashboard sections have illustrated empty states with CTAs; tutor has prompt suggestions. Fresh-account experience is intentional.

### Accessibility — **FAIR**
- ✅ Dropzone is keyboard-operable (`role="button"`, Enter/Space), focus-visible rings everywhere, icon buttons have `aria-label`/`title`, language select has `aria-label`.
- ⚠️ Quiz answer buttons rely on color alone for selection (default vs outline variant) — moderate.
- ⚠️ `Progress` bars likely lack `aria-valuenow`; decorative for now.
- ⚠️ Streaming chat has no `aria-live` region — screen readers won't announce tutor replies.
- None of these will surface in a visual demo; list them honestly if asked about inclusivity.

### Mobile responsiveness — **one real gap**
- Layouts collapse correctly (sidebar becomes a top scroll bar, grids stack, hero scales).
- ❌ **The user card, sign-out, language switcher, and theme toggle are `hidden` on mobile** (`hidden md:flex` in the sidebar). On a phone there is no way to sign out or change language. This is the single most defensible "critical bug" fix if any code change is permitted during freeze; otherwise **demo on desktop** (recommended anyway).
- Minor: language flashes English for one frame on first paint (localStorage read after mount) — invisible in practice.

---

## 4. Demo Risk Assessment

### Failure-likelihood ranking (live demo)
| # | Risk | Likelihood | Blast radius | Built-in fallback |
|---|---|---|---|---|
| 1 | Gemini quota/outage/slow venue Wi-Fi | Medium | Analysis/tutor/course quality | ✅ **Every AI path has a deterministic offline fallback** (keyword scoring, template course, canned trilingual reply) with `usedFallback` honesty in the transparency panel |
| 2 | Judge hands you a **scanned image PDF** | Medium | Upload moment | ✅ Friendly 422 ("paste the text instead") — rehearse the recovery line |
| 3 | Supabase auth configured last-minute → email-confirmation blocks login on stage | Medium *if you add keys* | Login flow | ✅ Demo mode bypasses entirely — **recommended for stage** |
| 4 | Browser data cleared / incognito | Low | Demo profile | ✅ Seed is idempotent and re-runs on "Try the demo" |
| 5 | Port conflict / stale server on the demo machine | Low | Startup | Run `npm run build && npm start` fresh; kill port 3000 first |
| 6 | Uzbek tutor answer quality without API key | Low | Tutor wow-moment | Fallback reply is short; **bring a working Gemini key** for the tutor segment |

### Offline resilience — **STRONG (by design)**
The entire product works with zero environment variables: demo auth, localStorage persistence, heuristic AI fallbacks, mock jobs/market data. Only the *quality* of AI output needs internet. This is a genuine differentiator versus other teams — say it out loud to judges.

### Validation status
- ✅ Production build, all 16 pages/routes return 200, extract + analyze verified end-to-end with real PDF/DOCX/TXT through a running server.
- ⚠️ Not yet validated: a full **human click-through** of demo-mode → dashboard → each module in a real browser, and the Supabase-configured path (no project keys exist). **Do one complete browser rehearsal before the demo — this is the highest-value remaining action.**

---

## 5. Judging Criteria Assessment

| Criterion | Score | Notes |
|---|---|---|
| Technology | **8/10** | Modern, correctly used stack |
| Innovation | **7/10** | Integration + explainability is the novelty |
| Feasibility | **9/10** | It runs, free-tier, resilient |
| Product-Market Fit | **8/10** | Sharp personas, national tailwind |
| Scalability | **7/10** | Sound bones, known shortcuts |
| Ease of Implementation | **9/10** | Zero-config demo, env-progressive |
| Relevance to Uzbekistan | **9/10** | Trilingual + policy-aligned + local data |

**Technology (8).** *Strengths:* Next.js 15 + TS strict, Gemini structured JSON output (`responseSchema`) instead of fragile prompt-parsing, streaming chat, provider-swappable AI adapter, RLS schema, dual-backend persistence. *Weaknesses:* no automated tests, client-only route guard, jsonb artifact shortcut. *To improve:* a thin Playwright smoke suite and session middleware would push this to 9.

**Innovation (7).** *Strengths:* the closed loop (CV → score → gaps → adaptive learning → job match → re-score) with **explainable AI at every step** is rare in ed-tech, and trilingual-first is rarer. *Weaknesses:* each component exists somewhere; the novelty is synthesis, not invention. *To improve:* lean on the 38%→64% progress-delta story — "we measure employability change, not course completion."

**Feasibility (9).** *Strengths:* fully working MVP on free tiers, graceful degradation everywhere, deployable to Vercel today. *Weaknesses:* labor-market data is mocked. *To improve:* name a real data partner (HeadHunter.uz / IT Park resident survey) in the roadmap slide.

**Product-Market Fit (8).** *Strengths:* four clear user types with distinct value; institutions (universities, IT Park) are a plausible paying customer while students stay free. *Weaknesses:* no user evidence yet; B2C willingness-to-pay locally is low. *To improve:* one quote or survey stat from a real student/teacher would be worth more than any feature.

**Scalability (7).** *Strengths:* stateless serverless compute, Postgres with RLS, normalized schema already designed beyond the jsonb fast-path, adapter pattern makes the AI vendor swappable (or locally hostable for data sovereignty). *Weaknesses:* no rate limiting/queueing for AI calls, no caching layer, content moderation absent. *To improve:* present the 3-phase scaling plan from BLUEPRINT.md proactively.

**Ease of Implementation (9).** *Strengths:* clone → `npm i` → run, zero keys needed; one `schema.sql` provisions the cloud; features upgrade themselves when env vars appear. *Weaknesses:* none material at this stage.

**Relevance to Uzbekistan (9).** *Strengths:* Uzbek (Latin) as a first-class UI and tutor language; framing around Digital Uzbekistan 2030 and the 1M IT-professionals goal; jobs/courses use local employers and contexts (IT Park, Uzum, EPAM, Tashkent marketplace assignments); data-localization migration path. *Weaknesses:* market data is illustrative; no Karakalpak or Cyrillic-Uzbek option. *To improve:* mention Cyrillic-Uzbek toggle as a roadmap item — judges from older demographics will notice.

---

## 6. USP Validation

**One-liner to use:** *"LMS platforms track course completion. We track employability — in Uzbek, with an AI that shows its reasoning."*

**vs. Traditional LMS (Moodle, national platforms)** — ✅ Clearly differentiated. An LMS starts from content and measures completion; SkillBridge starts from a *job target* and measures readiness. Adaptive difficulty, AI course generation for teachers, and job matching simply don't exist there. Risk: ministries may see "LMS" and assume substitution — position as a layer *on top of* existing content, not a replacement.

**vs. Coursera/Udemy-style platforms** — ✅ Differentiated on three axes they structurally can't match locally: (1) Uzbek-language-first learning and tutoring; (2) the loop closes into the *local* labor market (Tashkent internships, IT Park employers), not a global certificate; (3) backwards design — content is selected by *your* skill gap, not by catalog browsing. Risk: judges may ask "why not just subtitle Coursera?" — answer: subtitles don't make a tutor answer follow-up questions in Uzbek, and certificates don't map to Uzum's hiring bar.

**vs. Generic AI tutors (ChatGPT et al.)** — ✅ Differentiated, and this is the question you *will* get. A chat tutor is stateless advice; SkillBridge is **structured and accountable**: persistent assessments with measurable deltas (38%→64%), machine-readable roadmaps tied to a jobs database, educator tooling, and an explainability layer (confidence, detected signals, decision factors + audit-log schema) that an education ministry can actually adopt. "ChatGPT is an ingredient — we're the institution-ready product around it."

**Verdict: the USP is real and articulable. The differentiation weakens only if the demo skips the dashboard progress-delta and the transparency panels — make both unmissable.**

---

## 7. Presentation Readiness

### 3-minute demo script
> **[0:00–0:20] Hook.** "Uzbekistan needs one million IT professionals by 2030. The bottleneck isn't talent — it's that no one can tell a student in Samarkand, in her own language, exactly what she's missing and how to close it. SkillBridge AI does."
> **[0:20–0:50] Career Navigator.** Land on the page → drag in the prepared PDF CV → text extracts automatically → readiness score, skills, gaps appear. "Sixty seconds from CV to an employability score against a real Tashkent job profile."
> **[0:50–1:20] Explainability + roadmap.** Open the *Why this recommendation?* panel: confidence, detected signals, per-gap reasoning. "Every recommendation explains itself — this is what makes us adoptable by universities and ministries, not just individuals." Scroll the roadmap.
> **[1:20–1:50] Tutor in Uzbek.** Ask "SQL JOIN nima?" — answer streams in Uzbek. Switch the *whole UI* to O'zbekcha with the switcher. "Trilingual isn't a translation file — the tutor teaches natively."
> **[1:50–2:20] The loop closes.** Jobs page: "Matching uses the skills from her actual assessment — and shows exactly which skill raises which match." Then dashboard: 38% → **64%, +26**. "We don't measure course completion. We measure employability change."
> **[2:20–3:00] Close.** "Built in 48 hours on free tiers, works offline if the venue Wi-Fi dies, schema is production-ready with row-level security. Students free, institutions pay. SkillBridge — from resume to real job, in your language."

### 5-minute demo script
Use the 3-minute script, plus:
- **+45 s Educator Copilot** (after tutor): generate "Beginner SQL, Uzbek" course → modules, quizzes, assignments with local contexts ("Toshkent do'konlari savdo jadvalidan…"). "One teacher-prompt becomes a full curriculum — this is how the supply side of teachers scales."
- **+30 s Adaptive Learning**: take the quiz, fail deliberately → "below 60%, lessons simplify; above 80%, advanced unlocks — and the panel shows the rule. Deterministic, no hidden scoring."
- **+30 s Auth & trust**: show login page ("real Supabase accounts when configured; one-click demo otherwise"), mention RLS, in-memory CV processing, audit-log design, data-localization path.
- **+15 s Market Insights** as the policy hook: "this dashboard is what we'd give IT Park with real vacancy data."

### Key talking points
1. **Closed loop:** assess → learn → match → re-assess; the readiness delta is the product's KPI.
2. **Explainable by design:** confidence + reasoning on every AI output; audit-log schema; "guidance, not guarantees" disclosure — institution-ready AI.
3. **Uzbek-first:** UI, tutor, and generated courses are natively trilingual; built for Digital Uzbekistan 2030.
4. **Demo cannot die:** every AI path has an offline fallback; persistence works without any cloud.
5. **Free-tier economics:** $0 infrastructure to pilot at a university tomorrow.
6. **Production path exists:** normalized schema, RLS, provider-swappable AI, 3-phase scaling plan.

### Judge Q&A preparation
| Likely question | Your answer |
|---|---|
| "Isn't this just ChatGPT with a UI?" | "ChatGPT is stateless advice. We're structured assessment with persistent, measurable outcomes tied to a local jobs database, plus educator tooling and an explainability/audit layer institutions require. Gemini is an ingredient — and swappable." |
| "Where does your labor-market data come from?" | "Today, a curated sample. Phase 2 integrates HeadHunter.uz/OLX postings and IT Park resident surveys via the same `market_trends` table — the schema is already built for it." |
| "What about AI hallucination / wrong advice?" | "Three layers: structured output schemas constrain responses; every recommendation shows confidence and reasoning so users can challenge it; and explicit 'guidance, not guarantees' framing. Scores are also reproducible — the fallback scorer is deterministic." |
| "How do you make money?" | "Students free forever. Universities and training centers pay per-seat for the Educator Copilot and cohort analytics; employers pay for qualified-candidate pipelines. Government partnership for national rollout." |
| "Data privacy? Where is data stored?" | "CVs are processed in memory and never stored as files; users own their data with consent flags; row-level security isolates every user; Supabase region is selectable today and the design migrates to in-country hosting for full localization." |
| "What if Gemini is blocked/expensive at scale?" | "The AI layer is a single adapter file. Swap to any provider — or a locally-hosted open model for data sovereignty — without touching features. We've proven that: the app runs fully offline." |
| "Why will students actually use it?" | "Because it answers the question they actually have — 'what exactly do I do next to get hired?' — in 60 seconds, in Uzbek, for free. The score gamifies progress the way Duolingo gamifies streaks." |
| "What's not real in this demo?" | Be honest: "Job postings and market trends are representative samples; the demo profile is seeded. The assessment, adaptation, tutoring, generation, persistence, and auth are fully functional." |

---

## 8. Final Recommendations

Ranked by impact-per-hour. **None are features.**

1. **Do one full browser rehearsal of the exact demo path, twice: once with a Gemini key, once with Wi-Fi off.** Highest-value remaining action; it validates demo mode end-to-end and rehearses the fallback narrative. *(0 code, ~30 min)*
2. **Stage kit:** known-good PDF CV on the desktop, production server pre-started (`npm start`), landing page pre-loaded (kills cold start), port 3000 verified free, backup screenshots of every module. *(0 code)*
3. **Use demo mode on stage, not live Supabase signup** — email confirmation is the most likely on-stage embarrassment. Show the login page, then click the demo button. *(0 code)*
4. **If one code change is permitted under the freeze:** un-hide sign-out/language switcher on mobile (`hidden md:flex` in `sidebar.tsx`) — it's the only place a judge poking the app on their phone hits a dead end. *(~5 lines)*
5. **Deploy to Vercel and put the URL + QR on the final slide.** Judges who can open the product on their own device after the pitch remember it. Demo mode means it works for them with zero keys. *(0 code, ~20 min)*
6. **Script the two killer moments and never skip them:** the 38→64 (+26) progress delta on the dashboard, and the transparency panel opened on stage. They carry Innovation and Explainability scores almost alone.
7. **Add one slide of real-world grounding:** one student quote or one stat from a local survey, plus named data partners (HeadHunter.uz, IT Park) for Phase 2. PMF is your weakest *evidenced* criterion — this is the cheapest fix.

---

*End of audit. No code was modified.*
