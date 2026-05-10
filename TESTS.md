# Tests

The audit engine is the only part of this app where being wrong costs the user money. That's the part that gets tested. UI and LLM summary are QA-tested manually because their failure mode is "looks ugly" or "writes a bad sentence", not "tells a founder to keep paying $200/mo when they shouldn't".

## How to run

```bash
npm test              # vitest run, exits 0/1
npm run test:watch    # vitest watch mode
```

## Test file: `lib/audit/engine.test.ts`

9 tests, all covering the audit engine:

| # | Scenario | What it asserts | Why it matters |
|---|----------|-----------------|----------------|
| 1 | 2-person team on Claude Team plan | Recommends Pro × 2, surfaces $110/mo savings | Headline trap — Team has a 5-seat minimum, so a 2-person team pays for 3 ghost seats |
| 2 | Cursor Business with 4 seats | Downgrades to Pro × 4, $80/mo savings, severity = save_big | Business ($40/seat) is overkill for sub-10-person teams without SSO needs |
| 3 | Cursor Business with 15 seats | No downgrade, severity = optimal | At 15 seats SSO need is plausible — engine must NOT false-positive |
| 4 | ChatGPT Pro $200, intensity=regular | Recommends Plus, $180/mo savings | Pro is for heavy o1-pro users; regular users belong on Plus |
| 5 | ChatGPT Pro $200, intensity=heavy | No change, $0 savings | Inverse of #4 — heavy user, keep Pro. No manufactured savings |
| 6 | Anthropic API $2.5k/mo | credexEligible=true, surfaces Credex consultation | >$1k API spend = Credex-eligible (credit marketplace fit) |
| 7 | OpenAI API $80/mo | credexEligible=false | Modest spend shouldn't trigger Credex flag |
| 8 | Optimal stack (Copilot Pro + Claude Pro) | isOptimal=true, totalMonthlySavings < $5 | The hardest property — engine must be honest when nothing to save |
| 9 | Multi-tool totals math (3 tools) | totalMonthlySavings=330, annual=3960, current=470, recommended=140 | Catches summation bugs |

## Why these specific tests

Started with the cases I'd be embarrassed to ship wrong:

1. **Claude Team trap (#1)** — most common overpayment in early-stage startups (5-seat minimum hidden behind marketing page)
2. **Optimal honesty (#8)** — easiest property to break when you're optimizing for "find savings"
3. **Heavy-user respect (#5)** — must not recommend downgrades for users who genuinely need the tier
4. **Math correctness (#9)** — if the hero number is wrong, nothing else matters

## Running in CI

`.github/workflows/ci.yml` runs `npm test` on every push to `main`. The pipeline also runs `npx tsc --noEmit` and `npm run lint` before tests.
