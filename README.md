# SpendLens

> Free 90-second audit for startups overpaying on AI tools.

Built for the Credex internship project (May 2026). Covers Cursor, GitHub
Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf.

## What it does

You enter what you currently pay (tool, plan, seats, monthly spend, team size,
primary use case). SpendLens runs a deterministic rule-based audit against
verified May 2026 pricing and shows:

- Total monthly + annual savings
- Per-tool finding with a defensible action and reason
- An AI-generated 80-word summary in your voice (Groq Llama 3.3 70B, free tier)
- A Credex consultation CTA when monthly savings exceed $500 or API spend > $1k

The audit math is **pure TypeScript**, no LLM. The LLM only writes the
narrative summary on top of the deterministic result. If Groq is down or the
key isn't set, a templated fallback paragraph runs instead — the user never
sees a dead summary panel.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind v4
- Vitest (Node env) for engine tests
- Zod for input validation on the API route
- Groq SDK for LLM summaries (free)
- Supabase planned for lead capture (Day 3)

## Local dev

```bash
npm install
cp .env.example .env.local   # add GROQ_API_KEY (optional — fallback works without)
npm run dev                  # http://localhost:3000
npm test                     # vitest
```

## Project layout

```
app/
  page.tsx                   # form + results (client)
  api/summarize/route.ts     # Groq summary endpoint with templated fallback
components/
  AuditForm.tsx              # multi-tool entry, persisted to localStorage
  Results.tsx                # savings hero + per-tool breakdown + Credex CTA
lib/
  audit/
    types.ts                 # AuditInput / AuditResult shapes
    pricing.ts               # source-of-truth pricing tables
    engine.ts                # pure rule-based audit (no I/O)
    engine.test.ts           # 9 tests covering the headline traps
  utils.ts                   # cn() + formatUsd()
PRICING_DATA.md              # every plan price with vendor URL + verify date
docs/
  ARCHITECTURE.md
  DEVLOG.md
  PROMPTS.md
  TESTS.md
```

## Why pricing lives in a markdown file

Because the auditable claim is "we cut your bill by $X". If a reviewer at
Credex wants to verify a number, they read `PRICING_DATA.md`, click the vendor
URL, and confirm. `lib/audit/pricing.ts` is mechanical — the truth is the
markdown.

## Status

Day 1 of 7. See `docs/DEVLOG.md` for what shipped and what's next.
