# BORN WEIRD // DECISION LOG

All decisions below are owned by CEO-001, are reversible unless stated otherwise, and were made without Founder input except where noted.

---
## DECISION #001 — Initial launch language — SUPERSEDED by #012 (2026-10-03)
- **DECISION:** English only for v0.1. Count Russian-locale visitors (`locale_ru` counter).
- **ALTERNATIVES:** Russian only; bilingual with auto-detect.
- **EVIDENCE:** The Founder wrote Genesis and BOOT in English. A share loop benefits from the widest-reach language. Bilingual doubles copy work and QA surface before any user exists. Counter-evidence: the Founder's personal network (the likely first 3–5 users) may be Russian-speaking; their mid-session message was in Russian.
- **EXPECTED EFFECT:** Fastest path to the first non-Founder completion. Some risk of drop-off among RU-only speakers.
- **COST:** $0. **REVERSIBILITY:** high (copy lives in engine.js and index.html). **CONFIDENCE:** medium.
- **REVISIT WHEN:** `locale_ru / landing_view ≥ 40%` with completion below 50%, OR the Founder reports that their first testers bounced on language. Then ship RU copy as Experiment.

## DECISION #002 — Product architecture
- **DECISION:** One static page: `index.html` plus `engine.js`. Vanilla JS, no build step, no backend, no framework.
- **ALTERNATIVES:** Next.js/Vercel app; serverless functions; native app (banned by Genesis §7).
- **EVIDENCE:** v0.1 needs zero server state. The generator is deterministic, the artifact is rendered in the browser, and referral lives in the URL.
- **EXPECTED EFFECT:** $0 hosting, instant load, nothing to break, no secrets to leak.
- **COST:** $0. **REVERSIBILITY:** high. **CONFIDENCE:** high.
- **REVISIT WHEN:** a feature needs server state (e.g. Collide Timelines, payments, LLM generation).

## DECISION #003 — AI/model strategy
- **DECISION:** No LLM at runtime in v0.1. Narrative comes from hand-authored situation and outcome templates, combined by seeded randomness (864 choice paths × seeded fragments × 10 anomalies × 10 worlds). AI enters through the **Reality Seed** handoff to the user's own AI. Agents (Claude Opus 5.5) are used for building, not serving.
- **ALTERNATIVES:** Claude Haiku/Sonnet per simulation through a serverless proxy.
- **EVIDENCE:** A runtime LLM needs an API key (secret, so a backend and credentials), adds ~$0.002–0.02 per reality, adds latency, and adds a risk of generating predictive or harmful claims. None of that is needed to test whether humans share.
- **EXPECTED EFFECT:** Cost per reality $0.00; deterministic, testable and safe output.
- **RISK:** the outputs can feel repetitive. Measured via `fb_feel_meh` share and qualitative reports.
- **REVISIT WHEN:** ≥30 completions and (avg worth < 3.5 OR meh ≥ 40%). Then test LLM-personalized "Possible Future" paragraphs as an experiment.

## DECISION #004 — Image-generation strategy
- **DECISION:** Procedural canvas pixel art in the browser ("LOST DOS GAME" protocol): seeded landscapes, a landmark per primary dimension, VGA palette per dimension, scan-lines, glitch rows, and a 1080×1350 PNG (portrait, story- and feed-friendly).
- **ALTERNATIVES:** Image model API (DALL·E / Flux / Imagen) at ~$0.003–0.04 per image.
- **EVIDENCE:** Image APIs need a key and backend, cost money, take 5–20 s, and give generic "AI image" aesthetics. Genesis §12 asks for "an artifact from a reality that never existed"; a fake DOS game screenshot does that for $0.
- **COST:** $0. **REVERSIBILITY:** high. **CONFIDENCE:** medium (shareability unproven).
- **REVISIT WHEN:** share rate < 15% of completions after 30 completions. Then try other protocols (corrupted broadcast, sci-fi magazine cover).

## DECISION #005 — Hosting / deployment
- **DECISION:** GitHub Pages on the Founder's **personal** account `dimacloud`, repo `dimacloud/born-weird`, deployed by a GitHub Actions workflow (tests must pass first). URL: `https://dimacloud.github.io/born-weird/`.
- **FOUNDER INPUT:** the Founder overrode the initial target (the connected GitHub MCP was the work account `dmitrii-businesslab`) and directed the repo to their personal account. Logged as a Founder intervention.
- **ALTERNATIVES:** Vercel/Netlify (needs new accounts); claude.ai Artifact (private by default, viewers may need a claude.ai account, which breaks the "New Human" loop).
- **COST:** $0. **REVERSIBILITY:** high (repo can be made private or deleted). **CONFIDENCE:** high.
- **REVISIT WHEN:** a custom domain is justified (e.g. bornweird.* after Level 1), or server features are needed.

## DECISION #006 — Analytics
- **DECISION:** Anonymous public event counters (abacus.jasoncameron.dev, namespace `bw-x7q2-p0`). One increment per event per page session. No IDs, cookies, IPs stored by us, birth dates or free text. Founder traffic is counted separately (`?founder=1`) and QA traffic is not counted at all (`?qa=1`).
- **ALTERNATIVES:** Plausible/PostHog/GoatCounter (need accounts or keys); no analytics (then ALIVE can't be detected).
- **EVIDENCE:** Probed 2026-10-03: CORS `*`, 30 req/10 s, keys live ~6 months, free.
- **RISKS:** the third party can disappear; counters are publicly writable (anyone can inflate them); no per-user funnels. Acceptable for n<100.
- **COST:** $0. **REVERSIBILITY:** high. **CONFIDENCE:** medium.
- **REVISIT WHEN:** >100 completions, OR evidence of counter tampering, OR a need for cohort analysis.

## DECISION #007 — Referral attribution
- **DECISION:** Share links carry `?from=<REALITY-ID>`. A visitor arriving with a valid ID sees "Reality #X sent you here". Their starts and completions increment `referred_*` counters. Lineage depth is not tracked in v0.1.
- **RRR** = `referred_simulation_completed / simulation_completed`.
- **COST:** $0. **REVERSIBILITY:** high. **CONFIDENCE:** high.
- **REVISIT WHEN:** "YOUR REALITY CREATED N REALITIES" becomes an experiment (needs a per-ID counter, which is cheap with the same service).

## DECISION #008 — Minimum agent organization
- **DECISION:** CEO-001 (with PRODUCT merged and BUILDER as a mode), QA-EVAL-001 (temporary, independent), ANALYST as a script. Nothing else is instantiated. See AGENTS.md.
- **EVIDENCE:** Genesis §27/§57. n=0 users means there is no data for Analyst, Growth or Community agents to act on.
- **COST:** non-cash inference only. **REVERSIBILITY:** high. **CONFIDENCE:** high.
- **REVISIT WHEN:** Phase 1 (≥30 completions), or any recurring task appears that the CEO does more than twice.

## DECISION #009 — Number of choices / temporal structure
- **DECISION:** 5 situational choices at NOW → 7 DAYS → 1 YEAR → 10 YEARS → 40 YEARS, with choice weights 1.0 → 2.2 (choices beat the birth seed; Genesis §6). The birth seed adds only a 0.75 bias.
- **HYPOTHESIS:** 5 is the smallest number that still spans near-actionable to absurd-speculative, and fits the 2–4 minute target. Tracked as EXP-001.
- **REVISIT WHEN:** stage drop-off between any two stages >25%, or completion <60%.

## DECISION #010 — Persistence and privacy
- **DECISION:** Nothing about the user is persisted server-side. Results exist only in the browser. The birth date is used in memory and never transmitted or stored. Reality Seeds and artifacts contain the weekday of birth, not the date. `localStorage` holds only the founder/qa flags; `sessionStorage` holds only the referrer reality ID.
- **COST:** $0. **REVERSIBILITY:** n/a. **CONFIDENCE:** high.

## DECISION #011 — Public company repository
- **DECISION:** The whole company folder (Genesis, company state, decisions, ledger, code) is pushed to the public repo `dimacloud/born-weird`, per Genesis §1 ("develop publicly").
- **SAFEGUARDS:** no secrets exist; no personal data beyond the Founder's GitHub handle; `.claude/` excluded.
- **REVERSIBILITY:** medium (published content may be cached). **REVISIT WHEN:** any sensitive data needs to enter company files. Then split into a private ops repo.

## DECISION #012 — Languages: bilingual EN + RU, one product, two entry links
- **TRIGGER:** Founder input (2026-10-03): the first humans are a Russian-speaking community, and many may not read English. This is the #001 revisit condition, met with evidence before launch.
- **DECISION:**
  1. One product, two language packs (EN, RU) with identical structure. The same seed gives the same reality in both languages, so metrics stay comparable and nothing forks.
  2. Two entry links: `/born-weird/` (EN) and `/born-weird/ru/` (RU). The RU entry is a generated copy with Russian `<meta>`/`og:image`, because Telegram/WhatsApp link previews don't run JS. A single URL would show an English card in a Russian chat.
  3. Language resolution: `?lang=` > entry page > saved choice > browser language (ru/uk/be/kk → RU) > EN.
  4. A small EN/RU switch on the start screen only. It covers Russians with English-language phones and vice versa. It isn't shown mid-run, to avoid half-translated states.
  5. Share links inherit the sharer's language (a RU user shares a `/ru/` link), so a chain inside a Russian community stays Russian. The recipient can still switch.
  6. Russian copy uses «ты» and present tense so the text is gender-neutral (the user's gender is unknown; past tense in Russian is gendered).
  7. Russian uses the Tiny5 pixel font (VT323 has no Cyrillic; Pixelify Sans was rejected for missing glyphs). It is self-hosted, OFL.
- **ALTERNATIVES:** RU-only (loses the international loop); EN + auto-detect without a switch (breaks for RU speakers on EN phones); separate RU product (forks code and metrics); LLM translation at runtime (cost, latency, keys).
- **TEAM:** CEO-001 (decision, RU copy, build). Independent: QA-EVAL-001 (regression and i18n), RU-EDITOR-001 (temporary, native-quality copy review). Builder ≠ evaluator.
- **COST:** $0 cash. **REVERSIBILITY:** high. **CONFIDENCE:** high.
- **MEASURE:** EXP-002 (RU vs EN completion and share).
- **REVISIT WHEN:** a third language reaches ≥15% of visits (`navigator.language` sampling is not collected; use the switch and entry counters), or the RU share rate is <½ of EN after 20 RU completions (copy problem).

## DECISION #013 — v0.3 "Character card": raise user value at $0 before adding runtime AI
- **TRIGGER:** Founder smoke test (2026-10-03). The value was unclear: the birth date seemed pointless, questions were identical, the image wasn't usable on a phone, the AI seed had no practical use, and the RU font was hard to read. A three-agent audit confirmed it (UX-AUDIT-001 scores: curiosity 3, recognition 2, surprise 2, utility 2, share 2).
- **DECISION (all $0, static):**
  1. **Visible symbolic birth decoding.** Life path (arithmetic shown), sun sign and element, eastern year, weekday. Each symbol gives a starting stat bonus (+4.0 total vs ~20 from choices), and the life path picks the first question. It is framed explicitly as a game seed, not a prediction (Genesis §6).
  2. **Question variety.** 3 situations per stage (15 total, 52 option paths per situation set, 243 situation sets), drawn per run.
  3. **Instant outcome after every choice** with stat deltas and a HUD (UX audit's #1 recommendation).
  4. **1080×1920 character card.** Start class, title, verdict one-liner, 6 stats, buff / debuff / boss, rarity "1 in N" (honest: share of 200k simulations), event log, key.
  5. **Player key** (`?k=`). It restores the full result without the birth date. A friend's link opens the sender's card. A per-reality counter shows "your realities spawned N".
  6. **AI next step in one tap.** ChatGPT/Claude deep links with 3 prompts (7-day quest plan, future-self conversation, debuff debugging), modelled on MIT "Future You". The full seed is kept as a fallback.
  7. **Fixes.** Readable RU font (IBM Plex Mono). Share sends the link, not the file (iOS dropped files when url/text were attached). "Save" opens the share sheet with the file on phones. Copy is robust. The seed no longer ends with a URL (pasted seeds looked like links).
  8. **Sound.** PC-speaker beeps synthesized in the browser (WebAudio), with a toggle. Founder suggestion; zero cost, adds the retro feel. Measured via `sound_off`.
- **REJECTED FOR NOW:** runtime LLM generation (AI-ARCH-001: ~$11/1000 realities on Haiku 4.5, needs 2 accounts and an API key). Gated behind EXP-003 demand evidence; HR-003 prepared.
- **TEAM:** CEO-001 (decision, build). Temporary agents: RESEARCH-001, UX-AUDIT-001, AI-ARCH-001 (inputs; retired after reports), QA-EVAL-001 and RU-EDITOR-002 (independent evaluation).
- **COST:** $0 cash. **REVERSIBILITY:** high. **CONFIDENCE:** medium-high (copy and mechanics proven elsewhere; our audience is untested).
- **REVISIT WHEN:** EXP-001/002/003 data from ≥10 real completions.

## DECISION #014 — Privacy over birth-date "influence": only the life path affects the result
- **TRIGGER:** QA-EVAL-001 measured that a shared card or key let someone narrow the birth date: first to ~28 candidate dates (exact scores in the key), then to a median of 9 with the age known (0–10 bars still shifted by sign, eastern year and weekday bonuses).
- **DECISION:** The seed is random per run (never date-derived). The key holds ranking + 0–10 bars + checksum only. Only the life path (+2) affects the result and picks the first question. Sign, eastern year and weekday are shown as lore on the local decode screen, and the copy says plainly that they don't affect the result (Genesis §21: deception = 0).
- **RESULT:** Residual leakage = life path only (≈2,475 candidate dates in 1950–2010, same as the life path alone).
- **TRADE-OFF:** The birth date matters less mechanically than the Founder may have hoped. It still visibly picks the start class and the first question. Revisit if users ask for more birth influence. Any added influence must pass the same leakage test.
