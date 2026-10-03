# BORN WEIRD // HUMAN REQUESTS

## HUMAN REQUEST #001 — OPEN
- **NEED:** GitHub CLI authenticated as the Founder's personal account `dimacloud`.
- **WHY:** The repo must live on `github.com/dimacloud` (Founder directive). The only credentials on this machine are a deploy key scoped to another repo and the work-account MCP.
- **WHAT IT UNBLOCKS:** creating `dimacloud/born-weird`, pushing, enabling Pages, and every future deploy, without further Founder involvement.
- **COST:** $0, ~2 minutes. **RISK:** grants the local agent repo-level GitHub access (standard `gh` scopes). Revocable at github.com/settings/applications.
- **ALTERNATIVES:** Founder creates the repo plus a fine-grained token manually (more steps); host on the work account (rejected by Founder).
- **RECOMMENDATION:** run the command below.
- **ONE ACTION REQUIRED:** `gh auth login --hostname github.com --git-protocol https --web`
