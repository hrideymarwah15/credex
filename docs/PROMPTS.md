# Prompts

Single LLM surface in this app: `/api/summarize`. Documenting what's there,
what I tried, and why I rejected the alternatives.

## Model + provider

- **Provider:** Groq (free tier, ~30 req/min)
- **Model:** `llama-3.3-70b-versatile`
- **Temperature:** 0.4 (low — this is a summary of deterministic data, not a
  creative task)
- **max_tokens:** 220 (paragraphs longer than ~100 words read like spam)

Picked Groq over Anthropic/OpenAI because the audit math doesn't need a
frontier model — it needs a fluent paraphrase of a JSON object. Llama 3.3
70B is more than capable, runs at ~500 tok/s on Groq, and is free. Cost
matters here because every audit triggers a summary call; an OpenAI/Anthropic
bill would scale linearly with traffic.

## Current system prompt

```
You are SpendLens, a no-nonsense AI spend analyst.
You will be given an audit result for a startup's AI tool stack.
Write ONE short paragraph (60–100 words) the founder will read.

Rules:
- Talk to them, not about them. Use "you" and "your".
- Lead with the dollar number that matters most (annual savings if non-zero, else acknowledge the stack is tight).
- Name 1–2 specific actions they should take this week. Use the tool labels you see.
- No marketing fluff. No bullet points. No headers. No emojis. No "I" or "we".
- If isOptimal is true, do not invent savings — say their stack looks tight and where they'd spend next as they grow.
- Plain prose, calm tone, like a CFO friend.
```

The user message is a JSON object with the audit result fields the model
actually needs (no PII, no internal IDs):

```json
{
  "teamSize": 4,
  "useCase": "coding",
  "currentMonthly": 470,
  "recommendedMonthly": 140,
  "monthlySavings": 330,
  "annualSavings": 3960,
  "isOptimal": false,
  "findings": [
    { "tool": "Cursor", "action": "Switch to Cursor Pro × 4 seats", "reason": "...", "monthlySavings": 60, "severity": "save_big" }
  ]
}
```

## Alternates I tried and rejected

### v1 — too marketing
> "You are SpendLens, the founder's best friend for AI spend. Be encouraging
> and warm and excited about their savings!"

Result: every paragraph started with "Great news!" and read like an email
from a SaaS that just acquired your company. Killed.

### v2 — too templated
Asked the model to fill 4 named slots (`headline`, `top_action`,
`secondary_action`, `risk`). Result: read like a form, not a paragraph.
Founders skim, so the prose has to do the skimming for them. Killed.

### v3 — too long
Allowed 200 words. The model padded with "It's important to consider..." filler.
Cap at 100 words forces it to choose what matters. Kept the cap.

### v4 (current)
Plain-prose paragraph, "you/your", concrete actions, no emojis. Reads like a
CFO friend texting you the answer. Kept.

## Templated fallback (no LLM)

When `GROQ_API_KEY` is missing or the call fails, `templatedFallback()` runs.
Two branches:

- **isOptimal:** acknowledges the stack is tight, names the next tier
  breakpoints (Cursor Pro→Business at ~10, Claude Pro→Team at 5+) so the
  founder still leaves with something useful.
- **savings exist:** leads with annual savings, then names the top 1–2
  findings by `monthlySavings` desc.

This is in `app/api/summarize/route.ts`. It is intentionally boring. The
point is: the page never shows a dead summary panel.

## What I'm watching

- **Hallucinated tool names.** The model sees only the labels we send it
  (`Cursor`, `Claude`, etc.) but Llama 3.3 sometimes adds tools that aren't
  in the audit. If this happens in practice, I'll add a guardrail that
  validates the output mentions only tools from the input.
- **Number drift.** The model occasionally rounds `$3,960` to `$4,000` in
  prose. That's fine for the narrative but I want the exact number to appear
  in the Results UI separately, which it does.
