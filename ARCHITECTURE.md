# Architecture

## One-line summary

A static Next.js page calls a pure-TypeScript audit engine in the browser, saves the result to Supabase for a shareable URL, then asks a server route for an LLM-written summary. Email capture happens after value is shown.

## System diagram

```mermaid
flowchart LR
    User[Cold visitor] -->|fills form| Form[AuditForm.tsx<br/>localStorage persist]
    Form -->|AuditInput| Engine[runAudit<br/>lib/audit/engine.ts<br/>pure TS, no I/O]
    Engine -->|AuditResult| Results[Results.tsx<br/>instant render]

    Results -.POST.-> SumAPI[/api/summarize]
    SumAPI --> Groq{GROQ_API_KEY?}
    Groq -->|yes| Llama[Groq Llama 3.3 70B]
    Groq -->|no / fail| Template[Templated fallback]
    Llama --> Summary[80-word paragraph]
    Template --> Summary

    Results -.POST.-> SaveAPI[/api/audit/save]
    SaveAPI --> Supabase[(Supabase<br/>audits table)]
    SaveAPI -->|audit ID| ShareURL[/audit/id<br/>OG tags]

    Results --> LeadCapture[LeadCapture.tsx]
    LeadCapture -.POST.-> LeadAPI[/api/lead/capture]
    LeadAPI --> Honeypot{Honeypot + Rate limit}
    Honeypot -->|pass| Supabase2[(Supabase<br/>leads table)]
    Honeypot -->|pass| Resend[Resend<br/>transactional email]

    Pricing[(PRICING_DATA.md<br/>verified 2026-05-07)] -.compiles into.-> PricingTS[lib/audit/pricing.ts]
    PricingTS --> Engine
```

## Data flow: input → audit result

1. `AuditForm.tsx` builds `AuditInput` (tools, plans, seats, spend, team size, use case) and calls `onSubmit`. Form state persists in localStorage across reloads.
2. `app/page.tsx` calls `runAudit(input)` **synchronously in the browser** — result renders instantly, no network.
3. In parallel, two async calls fire:
   - `POST /api/summarize` — Zod validates, calls Groq, returns 80-word paragraph (or templated fallback)
   - `POST /api/audit/save` — saves `{input, result, summary}` to Supabase `audits` table, returns a nanoid-based shareable ID
4. `LeadCapture.tsx` renders below results with email + optional company/role/team fields.
5. On email submit, `POST /api/lead/capture` — honeypot check → rate limit check → insert into `leads` table → fire-and-forget Resend email.
6. Shareable URL `/audit/[id]` loads the audit from Supabase at request time, strips identifying details (email, company), shows tools + savings + OG tags.

## Why this stack

| Choice | Why |
|--------|-----|
| Next.js 16 (App Router) | Server components for OG metadata generation, API routes colocated, Vercel deploy in one click |
| React 19 | Concurrent features, server components |
| TypeScript strict | Audit engine handles money — type safety prevents silent bugs |
| Tailwind v4 | Zero-runtime CSS, fast iteration, no design system overhead for a 7-day build |
| Vitest | Fast, ESM-native, works with TypeScript out of the box |
| Supabase (Postgres + RLS) | Free tier, row-level security for public reads / private writes, no ORM needed |
| Groq (Llama 3.3 70B) | Free, fast (500 tok/s), good enough for structured paraphrasing |
| Resend | Generous free tier (100 emails/day), modern DX, transactional email in 5 lines |
| nanoid | Short, URL-safe IDs for shareable links — better than UUIDs in URLs |

## What I'd change at 10k audits/day

1. **Move audit save to a queue.** At scale, synchronous Supabase inserts in the hot path add P99 latency. Use a background queue (Inngest, Trigger.dev) to write audits asynchronously.
2. **Cache shareable pages at the edge.** `/audit/[id]` is immutable once created — set `Cache-Control: public, max-age=31536000` and serve from CDN.
3. **Rate limit at the edge, not in the API route.** Move rate limiting to Vercel Edge Middleware or Cloudflare Workers so abusive traffic never reaches the origin.
4. **Batch lead emails.** Instead of one Resend call per lead, batch into 10-minute windows. Reduces API calls 50×.
5. **Add a pricing freshness job.** A cron that pings vendor pricing pages weekly and flags stale numbers. At 10k/day, stale pricing = wrong recommendations at scale.
6. **Horizontal scaling is free** — the compute is in the browser (audit engine) and serverless functions (API routes). Supabase is the only stateful piece, and Postgres handles 10k inserts/day without breaking a sweat.
