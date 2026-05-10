# SpendLens

> Free 90-second audit for startups overpaying on AI tools. Built for the Credex internship (May 2026).

SpendLens audits your AI tool stack against verified May 2026 pricing and shows exactly where you're overspending — with defensible reasoning a finance person can verify. Covers Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf.

**Live:** [https://spendlens.vercel.app](https://spendlens.vercel.app)

## Screenshots

<!-- Add screenshots or Loom link here before submission -->

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/credex.git
cd credex
npm install
cp .env.example .env.local
# Fill in env vars (all optional for core audit — see .env.example)
npm run dev    # http://localhost:3000
npm test       # vitest — 9 tests, all covering audit engine
```

### Deploy

Push to GitHub, connect to Vercel. Set environment variables:

- `GROQ_API_KEY` — for AI summaries (optional, fallback works)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `RESEND_API_KEY` — for transactional email (optional)
- `NEXT_PUBLIC_BASE_URL` — deployed URL for email links

## How it works

1. User enters tools, plans, seats, monthly spend, team size, use case
2. Pure-TypeScript audit engine runs deterministic rules (no LLM in the math)
3. Results show instantly — AI summary arrives async via Groq
4. Audit is saved to Supabase, gets a shareable URL with OG tags
5. Lead capture (email gate) shown *after* value — never before
6. High-savings cases surface Credex consultation CTA

## Decisions

1. **Audit engine is pure TypeScript, not AI.** A 2-person team on Claude Team is overpaying $110/mo whether or not an LLM agrees. Deterministic rules are verifiable, testable, and instant.

2. **Groq (free tier) over OpenAI/Anthropic for summaries.** The summary is a fluent paraphrase of a JSON object — doesn't need a frontier model. Llama 3.3 70B at 500 tok/s is free and fast. Cost scales linearly with traffic; free matters.

3. **Email capture after value, never before.** The spec is explicit, but it's also the right UX — show the savings, earn the email. Conversion rate is higher when users already trust the tool.

4. **Honeypot over hCaptcha for abuse protection.** Zero friction for real users. Bots fill hidden fields; humans don't. Rate limiting (5 submissions/hour/IP) catches the rest. hCaptcha adds JS weight and UX friction for a tool that should feel instant.

5. **Supabase over Firebase/D1.** Row-level security, Postgres flexibility, free tier with generous limits, and the best DX for a solo developer shipping in a week. RLS policies protect leads while keeping audits publicly readable for shareable URLs.

## Project layout

```
app/
  page.tsx                        # form → audit → results → lead capture
  audit/[id]/page.tsx             # shareable public audit page with OG tags
  api/audit/save/route.ts         # saves audit to Supabase, returns shareable ID
  api/lead/capture/route.ts       # lead capture with honeypot + rate limiting
  api/summarize/route.ts          # Groq LLM summary with templated fallback
components/
  AuditForm.tsx                   # multi-tool entry, localStorage persist
  Results.tsx                     # savings hero + per-tool breakdown + Credex CTA
  LeadCapture.tsx                 # email gate (shown after results)
lib/
  audit/
    types.ts                      # AuditInput / AuditResult shapes
    pricing.ts                    # source-of-truth pricing tables
    engine.ts                     # pure rule-based audit (no I/O)
    engine.test.ts                # 9 tests covering headline traps
  supabase.ts                     # lazy Supabase client
  utils.ts                        # cn() + formatUsd()
```

## Status

See `DEVLOG.md` for daily progress.
