# Reflection

## 1. The hardest bug I hit this week, and how I debugged it

The hardest bug was Supabase's `createClient` breaking the Next.js build. The symptom was cryptic: `npm run build` would fail during "Collecting page data" with `supabaseUrl is required` — but the env vars were clearly set in `.env.local`.

**Hypothesis 1:** "The env vars aren't being loaded." Wrong — `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` printed correctly during `npm run dev`.

**Hypothesis 2:** "The build step doesn't have access to `.env.local`." Partially right, but not the real issue — Next.js does load `.env.local` during build.

**Hypothesis 3 (correct):** The Supabase client was instantiated at **module scope** (`export const supabase = createClient(...)`) which means it runs during the initial module evaluation at build time, before Next.js has injected runtime env vars. The fix was lazy initialization: replace the module-level `const` with a `getServiceClient()` function that creates the client on first call.

What made this hard: the error only appeared during `npm run build`, not during `npm run dev` (where modules are evaluated lazily). I caught it because I ran the build before deploying, which I almost skipped. Lesson: always build locally before deploying.

## 2. A decision I reversed mid-week, and what made me reverse it

I originally planned to use the Anthropic API directly for the AI summary (the spec says "Anthropic API preferred"). I reversed this on Day 1 and chose Groq instead.

Why I reversed: The summary is not a frontier-model task. It's a structured paraphrase of a JSON object — "turn these numbers into one paragraph." Llama 3.3 70B on Groq does this flawlessly at 500 tok/s, and it's free. The Anthropic API would have added a cost that scales linearly with traffic ($0.003–$0.015 per summary, which at 1000 audits/day = $3–$15/day). For an intern project with no revenue, free is the correct choice.

The spec says "preferred" — I read that as "show you can use an LLM API, not that it must be Anthropic specifically." The architecture is provider-agnostic (swap the SDK, keep the prompt), and the PROMPTS.md documents the reasoning.

## 3. What I would build in week 2 if I had it

**Benchmark mode.** "Your AI spend per developer is $47/mo — companies your size average $62/mo." I already compute `perSeatSpendForBenchmark` in the engine. The missing piece is a benchmarks table in Supabase that aggregates anonymized data from completed audits. After 100 audits, you have statistically meaningful "companies at your stage with your use case spend $X" data. This is the feature that turns SpendLens from a one-time tool into something people return to quarterly.

Also: PDF export (easy — html-to-pdf on the results page), and a referral code system where sharing your audit link and getting 3 people to run theirs unlocks a "premium" comparison to your industry vertical.

## 4. How I used AI tools

- **Claude Code (this tool):** Architecture decisions, writing the audit engine rules, building React components, Supabase schema design, documentation. I used it for ~80% of the coding.
- **What I didn't trust it with:** Pricing numbers. Every number in PRICING_DATA.md was manually verified against vendor pages. The AI would confidently cite old pricing (its training data predates the May 2026 changes). I caught it twice: once giving Cursor Business as $25/seat (outdated), and once claiming Claude Max at $50/seat (hallucinated — it's $100 for 5× and $200 for 20×).
- **One specific time the AI was wrong:** When building the Supabase client, it initially wrote `export const supabase = createClient(...)` at module scope. This broke the build. I caught it during `npm run build` — the AI didn't flag this as a potential issue because it doesn't simulate the Next.js build pipeline. I diagnosed and fixed it (lazy initialization).

## 5. Self-ratings

- **Discipline: 7/10** — Shipped every day except Sunday, followed the devlog religiously, but could have been tighter on time boxing (Day 1 ran long because I went deep on pricing research).
- **Code quality: 8/10** — TypeScript strict throughout, pure functions for the audit engine, proper error handling on every API route. Would be 9 if I'd added integration tests for the API routes.
- **Design sense: 6/10** — The UI is clean and functional but not memorable. The results page "looks like a developer built it" — which is fine for the audience but won't win a design award. Would improve with better visual hierarchy on the savings number and more whitespace.
- **Problem-solving: 8/10** — The audit engine rules are genuinely defensible. I'm proud that the engine has an "optimal" state that refuses to manufacture savings. The Supabase build bug debugging was systematic. Lost a point because the rate limiting is basic (per-IP) and wouldn't survive a determined attacker.
- **Entrepreneurial thinking: 7/10** — The shareable URL as viral loop is a real insight. The GTM plan is specific and actionable. Lost points because I didn't build the benchmark mode (the actual moat) and didn't attempt the blog post / launch thread.
