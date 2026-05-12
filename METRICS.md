# Metrics

What we measure, why, and what triggers action.

## North Star Metric

**Qualified leads captured per week.**

A "qualified lead" is:
- Audit shows >$500/mo in potential savings
- Email captured on LeadCapture form
- Intent signal: completed audit + saw Credex CTA

Why this metric:
- Revenue follows qualified leads (not total audits)
- Optimizing for audit volume without qualification is a vanity trap
- This is a B2B lead-gen tool, not a consumer app — our success is measured by pipeline, not DAU

**Target:** 50 qualified leads/week by Month 3 (bootstrapped organic traffic)

---

## Input Metrics (drive the North Star)

### 1. Audit completion rate
**Definition:** (Audits completed) / (Form started)

**Current baseline:** Unknown (not instrumented yet)  
**Target:** >65%

Why it matters: If 50% of users who start the form bail before hitting "Audit my stack," the UX is broken. Could be form length, unclear value prop, or trust issues.

What triggers action:
- <50% → investigate form friction (too many fields? unclear CTA? mobile UX broken?)
- 50-65% → acceptable, monitor
- >65% → working well, focus elsewhere

---

### 2. High-savings audit rate
**Definition:** (Audits showing >$500/mo savings) / (Audits completed)

**Current baseline:** ~18% (modeled from pricing data)  
**Target:** Maintain 15-20%

Why it matters: This is the filter for qualified leads. If this drops to 5%, either our ICP is wrong (we're attracting solopreneurs, not startups) or the audit logic is broken (not finding real savings).

What triggers action:
- <10% → revisit ICP and distribution channels (are we attracting the right users?)
- 10-15% → acceptable
- >25% → either we're attracting high-spend teams (good) or audit logic is too aggressive (bad — validate findings)

---

### 3. Lead capture rate (for high-savings audits)
**Definition:** (Emails captured) / (Audits showing >$500/mo savings)

**Current baseline:** 30% (guess — not instrumented yet)  
**Target:** >40%

Why it matters: If founders see $500/mo in savings and *don't* capture the report, the value prop didn't land or trust is missing.

What triggers action:
- <25% → investigate trust signals (testimonials? pricing source citations? "is this legit" anxiety)
- 25-40% → acceptable
- >50% → strong value delivery, focus on top-of-funnel volume

---

## What We'd Instrument First

Day 1 instrumentation (already built or trivial to add):
- Audit completions (already logged in DB via `/api/audit/save`)
- Lead captures (already logged in `/api/lead/capture`)
- Audits showing >$500/mo savings (derivable from audit results table)

Week 2 instrumentation (requires Vercel Analytics or PostHog):
- Form abandonment (where in the flow users bail)
- Scroll depth on Results page (do they read the findings or bounce after hero number?)
- Share button clicks (is the viral loop working?)
- PDF export clicks (do users want offline reports?)

Month 2 instrumentation (requires Credex backend integration):
- Consultation bookings (Calendly webhook → how many leads convert to booked calls)
- Credit purchases (Credex CRM → closed-won revenue attribution back to SpendLens audits)

---

## What Number Triggers a Pivot Decision

**<10 qualified leads/week after Month 2** = distribution failure. Either:
1. Organic channels aren't working (HN/Reddit posts didn't catch fire)
2. ICP is wrong (tool is useful but not for venture-backed founders)
3. Category doesn't exist yet (founders don't care about AI spend optimization)

At that point:
- Option A: Paid acquisition test ($2k budget, Facebook/LinkedIn ads to eng managers at Series A startups)
- Option B: Pivot to "monitor mode" SaaS (charge $5-10/mo for ongoing spend alerts, not one-shot audits)
- Option C: Kill it and harvest learnings

**>100 qualified leads/week before Month 3** = unexpected PMF. At that scale:
- Credex sales team can't handle volume → need to add self-serve credit purchase flow
- Audit engine needs real load testing (currently untested above 50 req/s)
- Virality is working — double down on share mechanics (referral codes, leaderboards, etc.)

---

## Why Not DAU / MAU?

This isn't a habit-forming product. Founders audit their stack once, capture the report, act on it (or don't), and leave. Coming back daily makes no sense.

The right retention metric is **"did they share the tool with another founder?"** (measured via share link clicks + audit creation from shared URLs). We're optimizing for *one perfect use* + viral spread, not repeat usage.

---

## Summary Table

| Metric | Current | Target | Red Flag | Action Trigger |
|--------|---------|--------|----------|----------------|
| **North Star: Qualified leads/week** | 0 (pre-launch) | 50 by Month 3 | <10 after Month 2 | Pivot or paid acquisition |
| Audit completion rate | TBD | >65% | <50% | Fix form UX |
| High-savings audit rate | ~18% (est) | 15-20% | <10% | Revisit ICP |
| Lead capture rate (high-savings) | ~30% (est) | >40% | <25% | Fix trust signals |

The bottleneck is top-of-funnel volume. If we can drive 200+ audits/week organically, the funnel math works. If not, we need paid acquisition or a product pivot.
