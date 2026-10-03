# BORN WEIRD // EXPERIMENT LOG

## EXP-001 — Does the v0.1 loop make a human share?
- **BOTTLENECK:** No evidence that any human completes and shares (Phase 0 / ALIVE).
- **OWNER:** CEO-001 · **EVALUATION:** ANALYST-SCRIPT-001 (`operations/metrics.mjs`)
- **HYPOTHESIS:** A ~2-minute, 5-choice deterministic simulation that ends in a pixel "lost DOS game" artifact, a useful 7-day experiment and a Reality Seed will make ≥1 of the first 5 non-Founder completers share it with a specific person.
- **CONTROL:** none (first version).
- **VARIANT:** Product v0.1 (5 choices, LOST DOS GAME artifact, English).
- **PRIMARY METRIC:** `share_completed + link_copied` per completion; ALIVE = `referred_simulation_completed ≥ 1` confirmed as a non-Founder.
- **SECONDARY:** completion rate, per-stage drop-off, worth (1–5), feel (MEH/WEIRD/WTF), seed copy/download.
- **GUARDRAILS:** artifact_generation_failed = 0; no complaints of deception or prediction claims; $0 spend.
- **START:** on deploy · **END:** 14 days after deploy or 30 completions, whichever is first.
- **SAMPLE:** target 5–30 non-Founder completions.
- **RESULT / UNCERTAINTY / DECISION / LEARNING:** pending.
- **STOP CONDITION:** 0 shares after 10 completions. Then the artifact or the share prompt is the bottleneck; iterate on the artifact protocol first.

## EXP-002 — Does native-language copy change completion and sharing?
- **BOTTLENECK:** B-002 (first humans are Russian-speaking; EN-only risked silent drop-off).
- **OWNER:** CEO-001 · **EVALUATION:** ANALYST-SCRIPT-001 (`by_language` block in metrics.json)
- **HYPOTHESIS:** RU speakers given a RU entry link complete at ≥70% and share at a rate within 0.5–1.5× of EN users.
- **CONTROL:** EN flow · **VARIANT:** RU flow (same engine, same seed → same reality).
- **PRIMARY METRIC:** completion rate and share rate per language (`ru_*` counters vs total − ru).
- **GUARDRAILS:** artifact_generation_failed = 0 in both; no untranslated strings reported.
- **START:** RU deploy · **END:** 20 RU completions or 14 days.
- **RESULT:** pending.

## EXP-003 — Is there demand for AI depth? (gate for runtime AI)
- **BOTTLENECK:** Utility. Users need a practical next step; runtime AI costs money and requires credentials.
- **HYPOTHESIS:** If ≥15% of completions click a "continue with AI" deep link, runtime AI personalization is worth its ~$0.011/reality.
- **METRIC:** `ai_open_*` / `simulation_completed` (metrics.json → `ai_handoff`).
- **DECISION RULE:** ≥15% after 20 completions → issue HR-003 and build the hybrid (deterministic core + LLM final future and plan, A/B behind a flag). <5% → AI depth is not the bottleneck; invest in the card and sharing instead.
- **START:** v0.3 deploy · **RESULT:** pending.
