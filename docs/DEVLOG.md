# DEVLOG

Honest daily log. The point of this file is for me to read it in 6 months and
remember what was actually hard, not to look good.

---

## Day 1 — 2026-05-07

**Goal:** Ship a usable end-to-end slice — scaffold, pricing, audit engine,
form, results, AI summary. Deliberately skipping lead capture, share URL, and
docs polish until later in the week so I can validate the audit logic against
real numbers first.

**What shipped**

- Next.js 16 + TS strict + Tailwind v4 scaffold.
- `PRICING_DATA.md` for 8 tools (Cursor, Copilot, Claude, ChatGPT, Anthropic
  API, OpenAI API, Gemini, Windsurf). Every number cites a vendor URL and is
  verified 2026-05-07.
- `lib/audit/engine.ts` — pure-TS audit, no I/O, no LLM. Each rule is its
  own named function.
- 9 unit tests covering: Claude Team trap (the headline bug — a 2-person team
  on Team plan is overpaying $110/mo because Team has a 5-seat minimum),
  Cursor Business→Pro for sub-10-person teams, ChatGPT Pro→Plus when the user
  isn't self-reported heavy, API spend > $1k → Credex eligible, optimal stack
  honesty (no false savings), totals math across multiple tools.
- `AuditForm.tsx` with multi-tool entry and localStorage persistence.
- `Results.tsx` with savings hero, per-tool breakdown, Credex CTA when
  eligible, and a calm "stack looks tight" state when it doesn't.
- `/api/summarize` — Groq Llama 3.3 70B with Zod-validated input and a
  templated fallback that runs if the key is missing or the call fails.
  Crucially, the savings number on screen never depends on the LLM.

**What was harder than expected**

- **Cursor Business pricing.** Public docs hedge between "$40 per user" and
  "starts at $40". Settled on $40/seat with `needsSso: true` so the rule can
  treat it as legitimate at 10+ seats and overkill below.
- **ChatGPT Pro $200 vs Plus $20.** The "is this person actually a heavy
  user?" question can't be answered from spend alone. Added an `intensity`
  field on each tool — 90% of users will leave it on "regular", which is the
  right default for the downgrade rule to fire.
- **Claude Team's 5-seat minimum** is the most common trap in the wild and
  the one I want SpendLens to catch first. Put it in the test file as the
  literal first test case so a reviewer sees it before anything else.

**What I deliberately didn't do**

- No lead capture / email yet. Day 3.
- No shareable URL. Day 3.
- No CI. Day 5.
- No landing copy beyond the form. Day 6.
- No design system polish. The current UI is honest plaintext-ish — that's
  fine for Day 1.

**Decisions for tomorrow**

- Day 2: harden the engine with 3-4 more edge cases (Copilot Business sub-10
  seats, Gemini AI Ultra → AI Pro, Windsurf Teams when team < 5), then
  start lead capture wiring.
- Need to decide between Resend and Postmark for transactional email. Resend
  has a more generous free tier and better DX; defaulting to Resend unless
  delivery rates push me to Postmark.

**Honest worry**

The pricing table will go stale fast. Three of the eight vendors changed
prices in the last 90 days. I should add a `verifiedAt` per plan (not just at
the file level) so the UI can warn when a number is older than 30 days.
Logging this for Day 4.
