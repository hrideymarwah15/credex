# Tests

The audit engine is the only part of this app where being wrong costs the
user money. So that's the part that gets tested. UI and the LLM summary are
not unit-tested — they're QA-tested manually because their failure mode is
"looks ugly" or "writes a bad sentence", not "tells a founder to keep paying
$200/mo when they shouldn't".

## How to run

```bash
npm test         # vitest run, exits 0/1
npm run test:watch
```

## What's covered today (9 tests, all in `lib/audit/engine.test.ts`)

| # | Scenario | Why it's tested |
|---|----------|-----------------|
| 1 | 2-person team on Claude Team plan | Headline trap — Team has a 5-seat minimum, so a 2-person team is paying for 3 ghost seats. Engine must recommend Pro × 2 and surface $110/mo savings. |
| 2 | Cursor Business with 4 seats | Business is $40/seat with SSO/admin features — overkill for a sub-10-person team. Engine downgrades to Pro × 4, $80/mo savings. |
| 3 | Cursor Business with 15 seats | Inverse of #2 — at 15 seats SSO need is plausible. Engine should NOT recommend a downgrade. Severity: optimal. |
| 4 | ChatGPT Pro $200 with intensity=regular | Pro is for heavy users; regular users belong on Plus. Engine recommends Plus, $180/mo savings. |
| 5 | ChatGPT Pro $200 with intensity=heavy | Inverse of #4 — heavy user, keep Pro. No false savings. |
| 6 | Anthropic API spend $2.5k/mo | Triggers Credex eligibility flag (>$1k API spend). Engine sets `credexEligible: true` and surfaces a consultation finding. |
| 7 | OpenAI API spend $80/mo | Inverse of #6 — modest spend, no Credex flag. |
| 8 | Optimal stack (Copilot Pro $10 + Claude Pro $20) | Verifies the engine returns `isOptimal: true` and doesn't manufacture savings. The hardest property of the system to keep right. |
| 9 | Multi-tool totals math | 3 tools each with savings of 60/90/180 → totals 330/mo, 3960/yr, currentTotal 470, recommendedTotal 140. Catches off-by-one errors in summation. |

## Why these specific tests

I started with the cases I'd be embarrassed to ship wrong. The Claude Team
trap is #1 because it's the single most common overpayment in early-stage
startups (5-seat minimum is hidden behind a marketing page). The optimal
case (#8) is in the suite because it's the easiest property to break — once
you're optimizing for "find savings", false-positive findings sneak in. A
test that asserts "no savings here" is the only way to keep the engine
honest.

## Not yet covered (Day 2 backlog)

- Copilot Business → Pro for sub-10-seat teams
- Gemini AI Ultra → AI Pro when use case is mostly writing
- Windsurf Teams when team size < the plan minimum
- Mixed: API spend + seat-based plan combined in one audit
- Team-size mismatch (10 seats on a plan but `teamSize: 4`) — should warn

## Coverage of the API route

`/api/summarize` is not unit-tested. Its job is "call Groq, fall back to
template if it fails". The fallback path is exercised manually by deleting
`GROQ_API_KEY` and submitting an audit — the page must still show a
summary. I'll add an integration test for this on Day 5 when CI lands.
