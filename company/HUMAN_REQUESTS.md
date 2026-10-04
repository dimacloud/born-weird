# BORN WEIRD // HUMAN REQUESTS

## HUMAN REQUEST #001 — DONE (2026-10-03, ~7 Founder minutes; friction: non-interactive shell, then the Enter step)
- **NEED:** GitHub CLI authenticated as the Founder's personal account `dimacloud`.
- **WHY:** The repo must live on `github.com/dimacloud` (Founder directive). The only credentials on this machine are a deploy key scoped to another repo and the work-account MCP.
- **WHAT IT UNBLOCKS:** creating `dimacloud/born-weird`, pushing, enabling Pages, and every future deploy, without further Founder involvement.
- **COST:** $0, ~2 minutes. **RISK:** grants the local agent repo-level GitHub access (standard `gh` scopes). Revocable at github.com/settings/applications.
- **ALTERNATIVES:** Founder creates the repo plus a fine-grained token manually (more steps); host on the work account (rejected by Founder).
- **RECOMMENDATION:** run the command below.
- **ONE ACTION REQUIRED:** `gh auth login --hostname github.com --git-protocol https --web`

## HUMAN REQUEST #002 — WITHDRAWN 2026-10-04 (DECISION #017: do not expose v0.5; replaced by lab finalists)
- **NEED:** 3–5 non-Founder humans receive the link from a person they know.
- **WHY:** Genesis §4 forbids agents from sending unsolicited communications. The company has no owned audience or channel yet. ALIVE requires a real human.
- **WHAT IT UNBLOCKS:** EXP-001, the first completion, the first share, ALIVE.
- **COST:** $0, ~5 minutes. **RISK:** low (no data collected; the product says it is an experiment).
- **ALTERNATIVES:** posting on Founder social accounts via Buffer/Metricool (reputational and public, needs explicit approval); waiting for organic discovery (≈0).
- **RECOMMENDATION:** personal message, not a broadcast. Send it to people likely to forward weird things. Do not tell them what to do after the result; sharing must be voluntary to count.
- **ONE ACTION REQUIRED:** send `https://dimacloud.github.io/born-weird/ru/` (RU community) or `https://dimacloud.github.io/born-weird/` (others) to 3–5 specific people, without `?founder=1`, with one line like «сделал странную штуку, 2 минуты».

## HUMAN REQUEST #003 — FROZEN 2026-10-04 (runtime AI frozen by the Product Reset)
- **NEED:** Runtime AI generation (unique questions and future from symbolic birth data and choices), the Founder's original intent.
- **GATE:** EXP-003 shows ≥15% AI-handoff clicks per completion, or the Founder decides to proceed anyway (their financial call).
- **COST:** $5 prepaid (hard ceiling, auto-reload OFF) ≈ 450 AI realities on Claude Haiku 4.5. Cloudflare Workers free tier.
- **RISK:** an abuse-prone public endpoint. Mitigated by prepaid cap + monthly workspace limit + daily cap (~150 calls) + per-IP limit + Turnstile + fallback to the deterministic engine.
- **ONE SITTING (~10 min):**
  1. console.anthropic.com → account → buy $5 credits (auto-reload OFF) → workspace `born-weird`, monthly limit $5 → create an API key.
  2. dash.cloudflare.com → free account.
  3. In the project folder: `npx wrangler login`, then `npx wrangler secret put ANTHROPIC_API_KEY` and paste the key. Never send the key to anyone, including the agents.

## HUMAN REQUEST #004 — DONE (2026-10-04, ~8 min; result: DECISION #020): play the three lab games, then tell us which one feels alive
- **NEED:** the Founder's taste signal on three playable prototypes (EXP-004). This is not an implementation question; the agents own every design decision.
- **WHY:** Founder taste is one valuable signal (not the market). It also checks the lab on a real phone inside a real messenger before other humans see it.
- **COST:** ~5 minutes. **RISK:** none.
- **ONE ACTION:** open `https://dimacloud.github.io/born-weird/lab/?f=1` on the phone, play all three without analysing, answer one question: which one feels alive (and any gut lines like "homework", "made me curious", "I'd send this").
- **NEXT (HR-005, only after this):** send the 1–2 surviving games to 5–10 people personally (no `?f=1`), following `reports/tournament/HUMAN_TEST_PROTOCOL.md`.

## HUMAN REQUEST #006 — OPEN (2026-10-04): play ШАР round 2, two finals
- **NEED:** taste signal on two reveal variants of the same game (DECISION #020).
- **ONE ACTION:** open `https://dimacloud.github.io/born-weird/lab/?f=1`, play ФИНАЛ X and ФИНАЛ Y, say after which final you want to send it to someone (and to whom).
- **NEXT (HR-005):** send the winning version to 5–10 people personally.
