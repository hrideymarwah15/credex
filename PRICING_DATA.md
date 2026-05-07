# PRICING_DATA.md

All prices verified **2026-05-07** against vendor official pricing pages. Numbers in this file are the source of truth for the audit engine in `lib/audit/pricing.ts`. If a vendor changes pricing, update this file and the engine in the same commit.

A handful of API model prices are listed at "best available verified figure as of 2026-05-07" — vendors update API prices irregularly and we accept ±20% drift for the audit math without changing the recommendation.

---

## Cursor
**Source:** https://cursor.com/pricing — verified 2026-05-07

| Plan | Price | Seats | Key limits / differentiators |
|------|-------|-------|------------------------------|
| Hobby | $0 | 1 | 2,000 completions/mo, 50 slow premium requests |
| Pro | $20/user/mo ($16 annual) | 1+ | Unlimited completions, 500 fast premium requests, all models |
| Business | $40/user/mo ($32 annual) | 1+ | SSO, admin dashboard, centralized billing, privacy mode enforced |
| Ultra | $200/user/mo | 1+ | 20× Pro usage, priority access |

**Audit-engine notes:**
- Trigger downgrade Pro → Hobby when: user reports "occasional / low" usage and team size = 1
- Trigger upgrade Hobby → Pro when: user is hitting limits (we infer from "primary use case = coding" + active team)
- **Business is only justified when:** SSO is required (regulated industry / >10 seats with compliance need) — under 10 seats with no SSO requirement, `Pro × N seats` saves $20/seat/month

---

## GitHub Copilot
**Source:** https://github.com/features/copilot/plans — verified 2026-05-07

| Plan | Price | Seats | Key limits / differentiators |
|------|-------|-------|------------------------------|
| Free | $0 | 1 | 2,000 completions, 50 chat requests/mo |
| Pro | $10/user/mo ($100/yr) | 1 | Unlimited completions, GPT-4.1, Claude Sonnet, 300 premium requests |
| Pro+ | $39/user/mo | 1 | 1,500 premium requests, all models including Opus / o3 |
| Business | $19/user/mo | 1+ | Org policy, audit logs, IP indemnity, 300 premium requests/user |
| Enterprise | $39/user/mo | 1+ | Custom models, knowledge bases, fine-tuning, SSO/SCIM |

**Audit-engine notes:**
- Pro at $10 is one of the cheapest serious coding assistants on the market — **rarely a downgrade target**
- Business at $19 is overkill unless org needs IP indemnity / audit logs — under 5 seats, recommend Pro × N
- Enterprise rarely justified under 50 seats

---

## Claude (Anthropic chat)
**Source:** https://claude.com/pricing — verified 2026-05-07

| Plan | Price | Seats | Key limits / differentiators |
|------|-------|-------|------------------------------|
| Free | $0 | 1 | Limited daily messages, Sonnet only |
| Pro | $20/user/mo ($17 annual) | 1 | 5× free usage, Opus access, Projects, Claude Code limited |
| Max 5× | $100/user/mo | 1 | 5× Pro usage |
| Max 20× | $200/user/mo | 1 | 20× Pro usage, priority |
| Team | $30/user/mo (5 min) | 5+ | Central billing, admin, higher limits |
| Enterprise | Custom (~$60+/seat) | Contact | SSO, audit, expanded context, data residency |

**Audit-engine notes:**
- **Team plan trap:** Team requires 5-seat minimum at $30/seat = $150/mo floor. A 2-person team on Team is paying for 3 phantom seats — recommend 2× Pro = $40/mo (saves $110/mo)
- Max plans are for power users who hit Pro limits weekly — only justify if user reports "heavy / all day"
- Enterprise rarely justified under 25 seats

---

## ChatGPT (OpenAI chat)
**Source:** https://openai.com/chatgpt/pricing — verified 2026-05-07

| Plan | Price | Seats | Key limits / differentiators |
|------|-------|-------|------------------------------|
| Free | $0 | 1 | GPT-4o mini, limited 4o |
| Plus | $20/user/mo | 1 | GPT-4o, o1, o3-mini, image gen, advanced voice |
| Pro | $200/user/mo | 1 | o1 pro, unlimited, Sora |
| Team | $25/user/mo annual or $30 monthly (2 min) | 2+ | Admin, no training on data, 2-seat min |
| Business | $25/user/mo (annual) | 1+ | SAML SSO, admin |
| Enterprise | ~$60/seat (custom) | 150+ | Unlimited, expanded context, dedicated capacity |

**Audit-engine notes:**
- Plus → Free downgrade for users who self-report "occasional" use
- **Team minimum 2 seats is tighter than Claude's 5** — Team often makes sense for actual 2-person teams
- ChatGPT Pro at $200 is rarely a fit — most users overpay. Recommend Plus + API for o1 use
- Enterprise floor is high (~150 seats) — under that, Team is more honest pricing

---

## Anthropic API (direct)
**Source:** https://www.anthropic.com/pricing#api — verified 2026-05-07

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| Claude Opus 4.5 | $15 / MTok | $75 / MTok | Highest capability |
| Claude Sonnet 4.5 | $3 / MTok | $15 / MTok | Best price/perf for most tasks |
| Claude Haiku 4.5 | $1 / MTok | $5 / MTok | Cheapest, fast |
| Prompt caching | 0.1× read, 1.25× write | — | Use for repeated context |

**Audit-engine notes:**
- API users self-report monthly $ — we don't try to model token usage, we benchmark against typical "$X/mo for typical N-engineer usage" ranges
- Big switching opportunity: users on Opus for everything → Sonnet 4.5 saves ~5×
- For users >$1000/mo on Anthropic API: this is exactly Credex's sweet spot — flag for consultation

---

## OpenAI API (direct)
**Source:** https://openai.com/api/pricing — verified 2026-05-07

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| GPT-5 | $5 / MTok | $20 / MTok | Flagship reasoning |
| GPT-4.1 | $2 / MTok | $8 / MTok | Coding sweet spot |
| GPT-4o | $2.50 / MTok | $10 / MTok | Multimodal |
| o1 | $15 / MTok | $60 / MTok | Reasoning |
| o3-mini | $1.10 / MTok | $4.40 / MTok | Cheap reasoning |
| GPT-4o-mini | $0.15 / MTok | $0.60 / MTok | Bulk / cheap |

**Audit-engine notes:**
- Same pattern as Anthropic — heavy GPT-5 / o1 spend often replaceable with GPT-4.1 or o3-mini at 5–10× saving
- >$1000/mo OpenAI API spend = Credex consultation flag

---

## Gemini (Google AI)
**Source:** https://gemini.google/subscriptions/ and https://ai.google.dev/pricing — verified 2026-05-07

| Plan | Price | Seats | Key limits / differentiators |
|------|-------|-------|------------------------------|
| Free | $0 | 1 | Gemini 2.5 Flash, limited Pro |
| AI Pro | $20/user/mo | 1 | Gemini 2.5 Pro, Deep Research, 2TB Drive |
| AI Ultra | $250/user/mo | 1 | Veo 3, agent mode, 30TB Drive |
| Workspace add-on | $20/user/mo | 1+ | Gemini in Workspace apps |

**Gemini API pricing (most-used):**
| Model | Input | Output |
|-------|-------|--------|
| Gemini 2.5 Pro | $1.25 / MTok | $10 / MTok |
| Gemini 2.5 Flash | $0.30 / MTok | $2.50 / MTok |
| Gemini 2.0 Flash | $0.10 / MTok | $0.40 / MTok |

**Audit-engine notes:**
- AI Ultra is rarely justified — recommend AI Pro + API for the 5% of users who actually use Veo
- Gemini 2.5 Flash is one of the cheapest credible API options on the market — often the right downgrade target from Sonnet/GPT-4 for bulk tasks

---

## Windsurf
**Source:** https://windsurf.com/pricing — verified 2026-05-07

| Plan | Price | Seats | Key limits / differentiators |
|------|-------|-------|------------------------------|
| Free | $0 | 1 | 25 prompt credits/mo, limited models |
| Pro | $15/user/mo | 1 | 500 prompt credits, all models, unlimited tab |
| Teams | $30/user/mo (min 2) | 2+ | 500 credits + admin, SSO |
| Enterprise | $60/user/mo (annual, min 200) | 200+ | Hybrid deployment, custom |

**Audit-engine notes:**
- Windsurf Pro at $15 is **cheaper than Cursor Pro ($20)** — for users on Cursor Pro who self-report "I just want completions + chat", Windsurf is a 25% saving with comparable feature set
- Teams plan: only worth it for SSO requirement — otherwise Pro × N saves $15/seat

---

## Cross-tool substitution rules (in audit engine)

These are the "big saving" rules that drive the headline number:

1. **Cursor Pro → Windsurf Pro** for non-power coders → saves $5/seat/mo
2. **Claude Team (5-seat min) → 2× Claude Pro** for actual 2-person teams → saves $110/mo
3. **ChatGPT Pro $200 → Plus $20 + API** for users who don't need o1 daily → saves $150–180/mo
4. **Cursor Business → Cursor Pro** for teams under 10 with no SSO need → saves $20/seat/mo
5. **Heavy API spend (Anthropic >$1k or OpenAI >$1k or both) → Credex credits** → typical 15–30% saving

---

## Disclaimer

Pricing data is informational and changes frequently. SpendLens recommendations are estimates; users should verify current pricing on vendor pages before switching.
