# BORN WEIRD

**A tiny internet toy that happens to reveal something weird about you.**

Status (2026-10-04): Product Reset (Genesis §74). v0.5 stays live at https://dimacloud.github.io/born-weird/ as an archived reference (tag `v0.5-archive`). A prototype tournament runs at https://dimacloud.github.io/born-weird/lab/ to find the smallest Born Weird people actually want to play and pass on.

BORN WEIRD is also an experiment in running a company with AI agents. The Founder owns intent; agents own execution. Everything is in this repo:

- `BORN_WEIRD_GENESIS.md`: the constitution
- `company/`: live state (`STATE.json`), agents (`AGENTS.md`), decisions, experiments, ledger, work queue, Founder time
- `product/site/`: the product (static; `engine.js` is the deterministic generator)
- `product/test/`: automated tests (run on every deploy)
- `operations/`: `metrics.mjs` (analytics), `serve.mjs` (local preview)

Privacy: no accounts, no cookies, no birth dates leave your device. Only anonymous event counts are recorded.
Nothing BORN WEIRD generates is a prediction. Birth creates the seed. Choices create the timeline.
