# User Interviews

Did three calls this week with people actually building stuff. Notes are pretty messy but that's kinda the point — wanted to capture what they actually said.

---

## Interview 1 — Shwetansh Singh (sellixahq)

**Who:** College team, 3 people, building social commerce thing. All final year engineering students, completely bootstrapped.

**When:** May 11

**The situation:**

They're on free everything — Claude Free, ChatGPT Free, Cursor Hobby. Total monthly burn is like ₹500 and most of that is just hosting. They hit rate limits every single day but can't justify paying ₹1,660/mo for Claude Pro when they have literally zero revenue.

The wild part: all three of them share ONE Claude Pro login. Same email, same password. They had no clue that's against ToS. Genuinely thought "we bought one subscription so we can all use it."

**Best quote:**

"If you told us 'you're wasting ₹2,000/mo' we'd laugh because we're not even spending that much total. But if you said 'you could get API for ₹500/mo and stop hitting rate limits' that would change everything."

**What hit me:**

When I showed them the Anthropic API calculator and explained their usage (10-15 queries/day) would be like ₹200-300/mo instead of ₹1,660 for Pro, Shwetansh literally went "wait, WHAT?" They just assumed API = expensive = not for people like us.

**What changed:**

Had to make the tool work for ₹0 spend. My first version assumed everyone had paid tools and just needed to optimize. But if you're on all free tiers getting wrecked by rate limits, the answer isn't "upgrade to Pro" — it's "switch to API, pay for what you actually use."

Also realized I need way more explanation. These guys don't know what Enterprise tier is, don't understand seat licensing, have never heard of SSO. Can't just say "get this plan" — gotta explain WHY for their specific situation.

---

## Interview 2 — Poorvansh Tong (collabrio)

**Who:** 5-person student team building project collaboration tool. Just won ₹50k grant from university incubator.

**When:** May 12

**The situation:**

Got ₹50k and immediately went HAM buying tools.Claude Pro for 3 people, ChatGPT Plus for the whole team. Burning ₹12,000/mo. TWELVE THOUSAND. With zero revenue. They have 6 months of runway left.

Nobody audited anything. They just Googled "best AI tools for startups" and bought whatever came up.

Here's the painful part: they bought Cursor Pro for their DESIGNER and their PM. The designer tried it once and went back to Figma. PM never logged in after setup. Paying ₹1,660/mo × 2 for seats that literally just sit there unused.

**Best quote:**

When I showed them they could cut to ₹3k/mo without losing anything, Poorvansh started tearing up. Said "that's 3 extra months of runway. That's whether we make it to launch or have to shut down."

**What hit me:**

They thought you had to buy the same plan for everyone. Like "the whole team gets Pro or no one does." The concept of mixing plans was completely new to them.

**What changed:**

Started thinking about "runway math" instead of just "savings." For college teams with a fixed grant, every ₹1,000/mo saved = X more weeks to build. That's WAY more urgent than abstract "you're overspending."

Also added role-checking. If you're buying Cursor for a designer, the tool should literally flag it and say "hey, Cursor is for devs writing code — this person won't use it." Obvious in hindsight but they genuinely had no idea.

---

## Interview 3 — Raunak Jaiswal (AVM)

**Who:** Solo technical founder, building AI analytics platform. Has a full-time job, works on this nights/weekends. Pre-launch, zero users.

**When:** May 13

**The situation:**

Using Claude API direct because he's building AI features into the product. Hit ₹8,000 last month in API costs. That's MORE THAN HIS RENT.

When I asked what the calls were for, turns out 90% is testing/debugging the embeddings pipeline. He's paying production API prices to develop locally.

He has zero tracking. No observability. Just gets the bill once a month and panics.

**Best quote:**

"It's like driving with your eyes closed and checking the odometer once a month. I have no idea if I'm doing this wrong."

**What hit me:**

He doesn't know if ₹8k/mo is normal or insane for pre-launch. Has no benchmark. No idea which calls cost what. Just hopes it doesn't explode when he actually launches.

**What changed:**

This one kinda broke my brain because I realized API users are in a completely different world. They don't need "pick the right subscription" advice — they need "you're burning money in dev and don't even know where."

The obvious next feature (didn't have time for MVP): log parser. Like "paste your Anthropic API logs from last month, we'll show you which 3 calls ate 80% of your bill."

Also: pre-launch vs post-launch changes EVERYTHING. ₹8k/mo with zero revenue = emergency. Same spend with ₹50k MRR = probably fine.

---

## Main takeaway

College teams either spend nothing and suffer (rate limits, account sharing) OR blow ₹12k/mo on a ₹50k grant without realizing they're about to run dry. No middle ground.

Solo API users just bleed cash with zero visibility into where it's going. Build first, check bill later, freak out.

Nobody audits after they buy. Sign up once, swipe card, forget about it until money's gone.

That's basically why this tool needs to exist — most people never look at their spend until it's too late.
