# Tests

The audit engine is the only part of this app where being wrong costs the user money. That's the part that gets tested. UI and LLM summary are QA-tested manually because their failure mode is "looks ugly" or "writes a bad sentence", not "tells a founder to keep paying $200/mo when they shouldn't".

## How to run

```bash
npm test              # vitest run, exits 0/1
npm run test:watch    # vitest watch mode
```

## Test file: `__tests__/audit/engine.test.ts`

14 tests covering the audit engine across 7 test suites:

| # | Test Suite | Scenario | What it asserts |
|---|------------|----------|-----------------|
| **Cursor auditing** |||
| 1 | Cursor | Business → Pro for 4-person team | Detects overspend, recommends Pro, monthlySavings > 0, severity = save_big |
| 2 | Cursor | Keep Business for 12-person team | No change recommended, monthlySavings = 0, severity = optimal |
| 3 | Cursor | Windsurf alternative for non-coding | Suggests Windsurf for writing use case, monthlySavings > 0 |
| **Claude auditing** |||
| 4 | Claude | Team → Pro for 2-person team | Recommends Pro (avoids 5-seat minimum trap), monthlySavings > 0 |
| 5 | Claude | Keep Team for ≥5 seats | No change, monthlySavings = 0 |
| **GitHub Copilot** |||
| 6 | Copilot | Business vs Individual for small team | Detects overspend on Business tier, monthlySavings > 0 |
| **API-based tools** |||
| 7 | Anthropic API | High API spend ($200/mo) | Flags and suggests subscription alternative |
| **Multi-tool optimization** |||
| 8 | Multi-tool | 3 tools with mixed findings | Calculates totalMonthlySavings, totalAnnualSavings, totalCurrentMonthly correctly |
| 9 | Multi-tool | Already-optimal stack | isOptimal = true, totalMonthlySavings = 0 |
| **Credex eligibility** |||
| 10 | Credex | High-savings audit (>$500/mo) | credexEligible = true |
| 11 | Credex | Low-savings audit (<$500/mo) | credexEligible = false |
| **Edge cases** |||
| 12 | Edge | Invalid tool ID | Doesn't throw, handles gracefully |
| 13 | Edge | Zero monthly spend | Returns valid result with currentSpend = 0 |
| 14 | Edge | Empty tools array | Returns valid result, totalSavings = 0, isOptimal = true |

## Why these specific tests

Started with the cases I'd be embarrassed to ship wrong:

1. **Claude Team trap (#1)** — most common overpayment in early-stage startups (5-seat minimum hidden behind marketing page)
2. **Optimal honesty (#8)** — easiest property to break when you're optimizing for "find savings"
3. **Heavy-user respect (#5)** — must not recommend downgrades for users who genuinely need the tier
4. **Math correctness (#9)** — if the hero number is wrong, nothing else matters

## Running in CI

`.github/workflows/ci.yml` runs `npm test` on every push to `main`. The pipeline also runs `npx tsc --noEmit` and `npm run lint` before tests.
