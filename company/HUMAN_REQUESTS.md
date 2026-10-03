# BORN WEIRD // HUMAN REQUESTS

## HUMAN REQUEST #001 — DONE (2026-10-03, ~7 Founder minutes; friction: non-interactive shell, then the Enter step)
- **NEED:** GitHub CLI authenticated as the Founder's personal account `dimacloud`.
- **WHY:** The repo must live on `github.com/dimacloud` (Founder directive). The only credentials on this machine are a deploy key scoped to another repo and the work-account MCP.
- **WHAT IT UNBLOCKS:** creating `dimacloud/born-weird`, pushing, enabling Pages, and every future deploy, without further Founder involvement.
- **COST:** $0, ~2 minutes. **RISK:** grants the local agent repo-level GitHub access (standard `gh` scopes). Revocable at github.com/settings/applications.
- **ALTERNATIVES:** Founder creates the repo plus a fine-grained token manually (more steps); host on the work account (rejected by Founder).
- **RECOMMENDATION:** run the command below.
- **ONE ACTION REQUIRED:** `gh auth login --hostname github.com --git-protocol https --web`

## HUMAN REQUEST #002 — OPEN
- **NEED:** 3–5 non-Founder humans receive the link from a person they know.
- **WHY:** Genesis §4 forbids agents from sending unsolicited communications. The company has no owned audience or channel yet. ALIVE requires a real human.
- **WHAT IT UNBLOCKS:** EXP-001, the first completion, the first share, ALIVE.
- **COST:** $0, ~5 minutes. **RISK:** low (no data collected; the product says it is an experiment).
- **ALTERNATIVES:** posting on Founder social accounts via Buffer/Metricool (reputational and public, needs explicit approval); waiting for organic discovery (≈0).
- **RECOMMENDATION:** personal message, not a broadcast. Send it to people likely to forward weird things. Do not tell them what to do after the result; sharing must be voluntary to count.
- **ONE ACTION REQUIRED:** send `https://dimacloud.github.io/born-weird/ru/` (RU community) or `https://dimacloud.github.io/born-weird/` (others) to 3–5 specific people, without `?founder=1`, with one line like «сделал странную штуку, 2 минуты».
