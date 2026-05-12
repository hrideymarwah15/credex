# DEVLOG

Honest daily log. The point of this file is to read it in 6 months and remember what was actually hard, not to look good.

---

## Day 1 — 2026-05-07

**Hours worked:** 6

**What I did:**
- Scaffolded Next.js 16 + TS strict + Tailwind v4
- Built `PRICING_DATA.md` for all 8 tools (Cursor, Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf) — every number cites a vendor URL, verified 2026-05-07
- Wrote the pure-TS audit engine (`lib/audit/engine.ts`) — each rule is a named function, no I/O, no LLM
- 9 unit tests covering headline traps: Claude Team 5-seat minimum, Cursor Business overkill, ChatGPT Pro→Plus, API spend thresholds, optimal-stack honesty, totals math
- Built `AuditForm.tsx` with multi-tool entry and localStorage persistence
- Built `Results.tsx` with savings hero, per-tool breakdown, Credex CTA
- Built `/api/summarize` — Groq Llama 3.3 70B with Zod validation and templated fallback

**What I learned:**
- Claude Team's 5-seat minimum is hidden behind their marketing page. Had to dig into the actual signup flow to confirm. This is genuinely the #1 trap for small teams.
- ChatGPT's Pro→Plus decision can't be answered from spend alone. Added `intensity` field — 90% of users will leave it on "regular", which is the correct default for the downgrade rule.

**Blockers / what I'm stuck on:**
- Cursor Business pricing hedges between "$40 per user" and "starts at $40". Settled on $40/seat flat. Will revisit if someone files a correction.

**Plan for tomorrow:**
- More engine edge cases (Copilot Business, Gemini Ultra, Windsurf Teams)
- Start Supabase integration for lead capture

---

## Day 2 — 2026-05-08

**Hours worked:** 4

**What I did:**
- Added Copilot Pro+ rule (heavy users only at $39/seat — downgrades to Pro at $10 for non-heavy)
- Refined Gemini AI Ultra→AI Pro rule (Ultra's $250 only justified for Veo 3 video + 30TB storage users)
- Windsurf Teams→Pro for sub-5-seat teams
- Researched Resend vs Postmark — chose Resend (100 emails/day free, modern SDK, simpler DX)
- Set up Supabase project, designed schema for audits + leads tables

**What I learned:**
- Gemini's AI Ultra at $250/mo is genuinely hard to justify for anyone who isn't producing video. The product is really "Google One AI Premium with video generation" — most users just want Gemini 2.5 Pro which is included in AI Pro at $20.
- Copilot's tiers are confusing: Free → Pro ($10) → Pro+ ($39) → Business ($19) → Enterprise ($39). Pro+ is MORE expensive than Business but for individuals who want premium models.

**Blockers / what I'm stuck on:**
- Nothing blocking. Clean day.

**Plan for tomorrow:**
- Wire up Supabase: save audits, generate shareable URLs, lead capture form

---

## Day 3 — 2026-05-09

**Hours worked:** 5

**What I did:**
- Created Supabase tables: `audits` (shareable URL storage), `leads` (email capture), `rate_limits` (abuse protection)
- RLS policies: audits publicly readable (shareable URLs work), leads insert-only via anon key
- Built `/api/audit/save` — saves audit + returns nanoid-based shareable ID
- Built `/api/lead/capture` — honeypot field, IP-based rate limiting (5/hour), Supabase insert, fire-and-forget Resend email
- Built `LeadCapture.tsx` — email gate shown AFTER results, with optional company/role/team fields
- Built `/audit/[id]` page — server-rendered with dynamic OG tags (title includes savings amount), Twitter card
- Built `SharedAuditView.tsx` — strips identifying details, shows tools + savings + CTA
- Wired up full flow: form → audit → results → save → lead capture → share URL
- HTML email template for confirmation (different messaging for high-savings vs optimal)

**What I learned:**
- Supabase's `createClient` at module scope breaks Next.js builds (env vars not available at build time). Had to make it lazy-initialized with a getter function.
- The shareable URL is the viral loop — OG preview shows "$X,XXX/year in AI tool savings found." That's the hook that makes people click.

**Blockers / what I'm stuck on:**
- Need to deploy to Vercel and test the full flow with real Supabase credentials. Local testing confirms API routes work but Supabase calls fail without env vars (expected).

**Plan for tomorrow:**
- Deploy to Vercel with all env vars
- End-to-end test on production
- Lighthouse optimization pass
- Write remaining docs (REFLECTION.md, GTM.md)

---

## Day 4 — 2026-05-10

**Hours worked:** 3

**What I did:**
- Wrote all required documentation files (README, ARCHITECTURE, PROMPTS, TESTS, GTM)
- Moved docs from `docs/` to repo root as spec requires
- Verified build passes clean (all routes compile)
- Verified all 9 tests pass
- Cleaned up TypeScript types

**What I learned:**
- The OG tags for shareable URLs are genuinely powerful for distribution. When someone shares `/audit/abc123` on Twitter, the card preview shows "SpendLens found $3,960/yr in AI tool savings" — that's a click magnet.

**Blockers / what I'm stuck on:**
- Need Vercel deployment to test the full integrated flow.

**Plan for tomorrow:**
- Deploy to Vercel
- Lighthouse pass
- REFLECTION.md

---

## Day 5 — 2026-05-11

**Hours worked:** 0

Sunday — off.

---

## Day 6 — 2026-05-12

**Hours worked:** 4

**What I did:**
- Fixed all hardcoded `zinc-*` colors in LeadCapture, Button, Card, ThemeToggle — replaced with semantic tokens (`muted`, `border`, `card`, `surface`) so light mode works properly
- Lighthouse optimization pass: replaced `transition: all` with specific properties, added `prefers-reduced-motion` support to AnimatedCounter and FadeIn, added skip-to-content link, fixed `rel="noopener noreferrer"` on all external links, added OG + Twitter card metadata
- Fixed tool selector bug — was showing only Cursor as static text, now a dropdown with all 8 tools
- Fixed localStorage hydration mismatch — moved `readStorage()` from `useState` initializer to `useEffect` post-mount

**What I learned:**
- `transition: all` in CSS silently triggers layout/paint on every property change — specific properties are both faster and more correct for Lighthouse.
- `useState` initializers that read `localStorage` cause hydration mismatches because they run synchronously on both server (where window is undefined) and client (where localStorage has data). The fix is always `useEffect`.

**Blockers / what I'm stuck on:**
- Nothing blocking.

---

## Day 7 — 2026-05-13

**Hours worked:** 5

**What I did:**
- Enhanced all animations with motion/react: loading skeleton between form and results (800ms minimum), hero savings counter with scale+blur entrance and green glow effect, spring physics on page transitions, tool card whileHover/whileTap micro-interactions, SpendBar animated fill, benchmark gauge marker slide+pop, share button hover animations, button press feedback via motion.button
- Improved AI prompt: structured JSON response with `summary` + `priority_action`, sharper system prompt requiring tool names and dollar amounts per recommendation, better fallback templates with per-tool savings
- Threaded `priorityAction` through to UI — highlighted callout box below AI summary in Results
- Updated DEVLOG with final entries
- All 14 tests pass, build compiles clean, zero console errors

**What I learned:**
- motion v12's `motion.button` conflicts with React's `onDrag` type — need to exclude it from the spread. Small TypeScript friction but the whileTap animation is worth it.
- The loading skeleton with a minimum delay creates a more satisfying UX than instantly showing results — even though the audit engine is synchronous and instant. Users trust results more when they see "thinking" happen.

**Blockers / what I'm stuck on:**
- Vercel deployment still needed — env vars ready, code is production-ready.

**Status:** Submission-ready pending deployment.
- Submitted
