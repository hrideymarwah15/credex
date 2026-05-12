# User Interviews

Three 10-15 minute conversations with potential users. Raw notes below.

---

## Interview 1: Rohan, Co-founder at early-stage fintech startup

**Background:** 6-person team, raised pre-seed, building spend management for SMBs. Heavy AI users.

**Date:** May 10, 2026

### Direct Quotes

> "We're on ChatGPT Team, Cursor Pro, Claude Pro, and we just added Copilot for two junior devs. I look at the bill every month and sigh. It's like $600/month but I have no idea if that's good or bad."

> "The problem isn't the dollar amount — it's that I don't have a benchmark. Are we spending 2x what we should? Is there a cheaper combo that does the same thing? I have no fucking clue."

> "If you told me I could save $200/month by switching Cursor to a different plan, I'd do it today. But I'm not going to spend 4 hours researching pricing pages to find out."

### Most Surprising Thing

He said **he's never heard of Credex** (selling discounted AI credits) even though his team spends $7k/year on these tools. The distribution problem is real — founders don't know solutions exist.

Also: he assumed Cursor Pro was the right tier for a 6-person team. It's not. They're paying for features they don't use. **No one at the company audited this decision after the first month.**

### What It Changed

1. **Added "use case" field to the form.** He mentioned their usage is 70% coding, 30% content/writing. The audit engine now factors this in — if you're not coding, Cursor is overkill.

2. **Made benchmark comparison more prominent.** He wanted to know "am I overspending relative to other 6-person teams" more than "is there a cheaper alternative." Added the benchmark card to Results (shows spend per seat vs peers).

3. **Credex CTA needs to be clearer.** He didn't know discounted credits existed. Changed CTA copy from "Learn about Credex" (vague) to "Credex sells the same tools at 20-30% off through resale arbitrage" (specific value prop).

---

## Interview 2: Maya, Eng Manager at 40-person Series A startup

**Background:** Manages 12 engineers. Company pays for Cursor Business, GitHub Copilot Business, ChatGPT Team (20 seats). ~$3k/month AI spend.

**Date:** May 11, 2026

### Direct Quotes

> "Our CFO asked me to 'look into' our AI tool costs last quarter. I spent maybe 20 minutes on it, realized it was a rat's nest of overlapping tools, and punted it to next quarter."

> "The problem is everyone signed up for their own thing and expensed it. We have no centralized tracking. I don't even know if the marketing team is paying for Claude or if that's just eng."

> "If this tool could pull from our Brex statement automatically, I'd use it every quarter. But I'm not going to manually input 8 different tools and their seat counts."

### Most Surprising Thing

She didn't care about the "annual savings" number. She cared about **"will this decision piss anyone off?"**

Her quote: *"If I switch us off Cursor Business to save $400/month and one senior engineer complains to the VP, that's a losing trade for me. I'd rather overspend $400 and not deal with the headache."*

This means the "recommended action" needs to make it **socially safe** for the eng manager to act on it. E.g., "Cursor Business is the right tier for your team size — no change needed" is more valuable than "downgrade and save $400" if the downgrade risks team morale.

### What It Changed

1. **Audit logic now considers team size thresholds more carefully.** We won't recommend a downgrade from Business to Pro if team size is >8, even if math says they could save money, because the collaboration features matter at that scale.

2. **Added a "what this means for your team" sentence to each finding.** Not just "save $400" but "Cursor Business includes X which you're not using — Pro tier still gives your team Y and Z."

3. **Severity levels now include "no change needed."** If stack is optimal, we say so explicitly. This is valuable signal, not a failed audit.

---

## Interview 3: Dev, Solo founder building a side project

**Background:** Indie hacker, no funding, revenue ~$800/mo from a previous micro-SaaS. Building an AI-powered tool in his spare time.

**Date:** May 12, 2026

### Direct Quotes

> "I'm on Cursor Hobby ($10/mo), Claude API direct (pay-as-you-go), and I signed up for ChatGPT Plus but I haven't used it in 3 months. I should cancel that."

> "For me it's simple: I'm spending $30/month total. If you tell me I can get the same thing for $15, I'll switch today. I'm not optimizing for features, I'm optimizing for dollars."

> "I don't care about annual savings. I care about monthly burn. $30/mo vs $15/mo is a coffee habit vs a meal out. That's the mental model."

### Most Surprising Thing

He said **he'd pay $5/mo for a tool that audits his spend every month automatically** and pings him when a better deal appears. "Like Honey but for SaaS subscriptions."

This is wild because it suggests there's a SaaS business *on top of* the free audit tool — a "monitor mode" that watches pricing changes and alerts you when you should switch.

Also: he mentioned he Googles `"Cursor vs GitHub Copilot"` every few months to see if Reddit opinions have changed. **He trusts Reddit/HN more than official pricing pages.** This means SEO + community content (like "We tested Cursor vs Copilot for 6 months — here's what we learned") would drive massive organic traffic.

### What It Changed

1. **Added "monthly burn" as the hero number, not annual savings.** For bootstrappers, monthly matters more. Annual feels abstract.

2. **Considered a "notify me when deals change" feature.** Not building it now (out of scope for MVP) but added it to REFLECTION.md as a Week 2 feature.

3. **Export feature (PDF/CSV) is more valuable than I thought.** He wanted to screenshot the results and post in an indie hacker Slack to ask "is this right?" The shareability of the audit is part of the value, not a nice-to-have.

---

## Summary

All three cared about benchmarking ("am I overspending vs peers?") more than I expected. They wanted social proof that a recommended change is safe, not just math.

Solo founders optimize for monthly burn. Eng managers optimize for team morale + avoiding CFO scrutiny. Co-founders optimize for "is this decision legible to investors?"

None of them had heard of Credex before. The lead-gen angle is real — this tool is top-of-funnel for a market that doesn't know Credex exists yet.
