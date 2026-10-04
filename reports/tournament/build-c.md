# Build C — ДВОЙНОЕ ДНО (BUILDER-C, 2026-10-04)

## What was built
- `product/site/lab/c/index.html` (UI), `game.js` (pure logic, UMD → `window.GAME_C` / `require`), `og.json`, `product/test/lab-c.test.mjs`. `node operations/lab-og.mjs c` → 4 result pages (`monolith crack double chameleon`) + default preview. Total size: about 41 KB including the kit, with no external requests except the kit counters.
- **Stream (v2, after QA).** There are 8 taps in one interleaved stream, drawn at random each run.
  - Item 1 is a WORD item.
  - A pair's word and scene are at least 3 apart, in either order: about 23% of scenes come before their word.
  - Exactly one scene falls in items 2–4; the other scenes are in the second half. There are never 4 of a kind in a row.
  - Result: 9 type patterns and gaps of 3–7 (or −3 to −6). The scene order mirrors the word order in only about 3% of runs, and item 3 never re-asks item 1.
  - The left/right side order is randomised per item.
- **Same look for words and scenes.** Both use the same frame, the same two big yellow buttons, the same «НЕ ДУМАЙ» header and the same bar. A word item shows «ЧТО БЛИЖЕ?» and two words, with a 3 s bar. A scene item shows the scene (≤ 14 words) with a 7 s bar. A tap advances instantly with a tick sound and a 160 ms flash. The bar turns red in the last second, with ticks at 2 s and 1 s. Timers use `LAB.timer`, and reaction time is taken from the timer, so time spent hidden is excluded.
- **Item 1 has no bar.** Its bar blinks idle until the first tap, because the first tap is the start. Every later item runs its bar, including item 1 on «ещё раз».
- **Double-tap guard.** A tap within 180 ms of a new item is ignored, because the buttons sit in the same place on every item.
- **Timeout.** The screen shows «ВРЕМЯ!» with a low buzz, the pair is excluded, it shows as «— · —» in the ledger and it is never quoted.
- **Reveal choreography.**
  1. The twist types in: «8 вопросов были 4 вопросами, заданными дважды: словом и делом.»
  2. The ledger drops in one row at a time (СЛОВОМ | КОГДА ДОРОГО, `=` green / `≠` magenta, each with its own sound). This is the "wait, those were the same questions?" moment.
  3. The tier slams in with `SND.reveal`.
  4. Then the headline «СЛОВОМ: X. / КОГДА ДОРОГО: Y.», the scene quoted verbatim with the chosen button, the fact receipts, the second split (ДВОЙНОЕ ДНО only), the title, the honesty line, the card, «ПОКАЗАТЬ ДРУГУ», «ещё раз» and `recog`.
- **Tiers.**
  - МОНОЛИТ (0 splits): «Словом и делом — одно и то же, N из N.» plus the fastest scene choice quoted with its time.
  - ТРЕЩИНА (1) and ДВОЙНОЕ ДНО (2): the head split is the slowest-scene split, with ties broken in the fixed order СВОБОДА, УСПЕХ, ПРАВДА, НОВОЕ.
  - ХАМЕЛЕОН (3+): adds «Выбор зависит от цены, а не от слова.»
  - The 8 titles are noun phrases, for example БЕГЛЕЦ С ОБРАТНЫМ БИЛЕТОМ and ОТШЕЛЬНИК С ВИЗИТКОЙ.
- **Receipts are facts only.**
  - «Словом — за 0,7 с.» appears when the word answer took under 1.5 s.
  - «Когда дорого — 5,6 с.» appears only when the time is at least 2.5 s and at least 2× the player's own median scene time.
- **Share.**
  - The state is 6 characters: `1` + one character per pair (`x`, or word×2+scene) + the head pair. Decoding re-validates it: at least one valid pair, and the head must be a split.
  - The share text is per tier, for example «У меня ТРЕЩИНА: словом СВОБОДА, когда дорого — СВОИ ЛЮДИ. А у тебя?»
- **Friend.** The top line is «У ДРУГА: ДВОЙНОЕ ДНО. А У ТЕБЯ?» and item 1 is already on screen. The reveal adds «У друга — ДВОЙНОЕ ДНО (СВОБОДА → СВОИ ЛЮДИ). У тебя — МОНОЛИТ.» (or «У друга то же дно: …»). A broken fragment silently gives the normal game (checked: `s=1zz%`).
- **Card.** 1080×1920, drawn after `document.fonts.load`/`ready`. It has the brand, 3 lines (the tier, then СЛОВОМ: X / КОГДА ДОРОГО: Y, or for МОНОЛИТ: НИ ОДНОГО ДВОЙНОГО ДНА / СЛОВОМ И ДЕЛОМ: N ИЗ N) and the address. Everything sits inside the central 70%, in a frame with a magenta "second bottom" line.
- **Tracking.**
  - Kit events: `view`, `start` and `done`.
  - Result events: `tier_<code>` or `tier_blank`, plus `flip_<pair>` / `same_<pair>` for each valid pair, which give the real per-pair flip rate as flip/(flip+same).
  - Other events: `to_<pair>` on a timeout and `again`.
- **QA hooks:** `?qa=1&demo=word|scene|monolith|crack|double|chameleon|blank`. Demo mode turns off animations so screenshots are deterministic.

## Items (side a / side b; scene buttons map a / b)
| Pair | Word | Scene (≤14 words) | Buttons |
|---|---|---|---|
| free | СВОБОДА / СВОИ ЛЮДИ | Жить у моря, как хочется. Но семья и друзья — за тысячу километров. | ПЕРЕЕЗЖАЮ / ОСТАЮСЬ |
| succ | УСПЕХ / ПОКОЙ | Большое повышение. Но рабочий телефон звонит и в воскресенье. | СОГЛАШАЮСЬ / ОТКАЗЫВАЮСЬ |
| truth | ПРАВДА / МИР | Друг горит своим планом. План слабый. Скажешь — поссоритесь. | СКАЖУ / ПРОМОЛЧУ |
| new | НОВОЕ / ПРИВЫЧНОЕ | Один отпуск в году. Проверенное любимое место — или страна наугад. | НАУГАД / ЛЮБИМОЕ МЕСТО |

Matching notes:
- **No echo.** No scene or button reuses its own pair's vocabulary: the old «своих людей» and «НОВАЯ» are gone. A test enforces this.
- **СВОБОДА rebalanced.** The old scene (a free paid year away) was an easy ЕДУ. It is now a permanent move (a life by the sea, family 1000 km away), with a real price on both sides.
- **УСПЕХ/ПОКОЙ verbs.** The buttons are now СОГЛАШАЮСЬ/ОТКАЗЫВАЮСЬ. БЕРУ/НЕ БЕРУ read as "answer the phone".
- **НОВОЕ/ПРИВЫЧНОЕ now has a cost:** the only holiday of the year is bet on chance.
- Each scene puts a concrete price on exactly one side.
- ПРАВДА/МИР was rewritten away from «друг сияет» (behavior flagged the kindness confound). The cost is now a quarrel, not hurting someone happy.
- УСПЕХ is a promotion, not a pay rise, so money doesn't hijack the pair.

## Simulation (10,000 runs per model, `node --test product/test/lab-c.test.mjs`)
| Model | blank | МОНОЛИТ | ТРЕЩИНА | ДВОЙНОЕ ДНО | ХАМЕЛЕОН | any split | flip per pair (free/succ/truth/new) |
|---|---|---|---|---|---|---|---|
| uniform random, 5% timeouts | 0.0% | 9.3% | 29.1% | 37.4% | 24.1% | 90.7% | 49.9 / 50.1 / 50.6 / 49.9% |
| **spec**: p_w∈[.7,.95], p_s∈[.6,.9], 5% timeouts | 0.0% | 24.0% | **39.8%** | 26.5% | 9.8% | **76.0%** | 34.2 / 34.2 / 33.6 / 34.2% |
| tight: p_w∈[.85,.98], p_s∈[.8,.95] | 0.0% | 47.3% | 38.3% | 12.3% | 2.1% | 52.7% | 19.7 / 19.8 / 18.6 / 18.5% |

Gate results:
- **Spec model:** no tier is above 45% (the maximum is 39.8%), and 3 tiers are at 10% or more (ХАМЕЛЕОН is at 9.8%). **Pass.**
- **"Any split" 25–60% under the spec model: fails, by design.** The spec's own noise model gives a per-pair flip of about 34% (0.825·0.25 + 0.175·0.75). That makes 1 − 0.66⁴ ≈ 75–80% of players show a split.
  - The 25–60% band needs a per-pair flip of about 12–20%. The tight row shows that level gives 52%.
  - The two gates also pull against each other: "any split ≤ 60%" forces МОНОЛИТ ≥ 40%, which sits right at the 45% tier cap (the tight row shows МОНОЛИТ at 48%).
  - I did not fudge the rule (for example, by counting only fast-word splits). A split is two of the player's own answers pointing opposite ways. The real flip rate is an item property, and only humans can measure it. Read `flip_<pair>` / `same_<pair>`.
  - The pilot target per pair is the behavior reviewer's 15–45%.
- **Line rates under the spec model:** the receipt appears in about 36% of runs and the second-split line in about 26%. No line is above 60%.
- **Blank:** 0 valid pairs (every pair has a timeout) is rare (about 1 in 10k under uniform play) and reachable.
- **Tests:** every branch is reachable, including all 8 titles, both receipt kinds and the second line. There is never `undefined`, `NaN` or an empty line. The state round-trips, 18 broken states decode to `null`, and a timed-out pair is never quoted. The copy lint finds no «(а)», «думал» or «на деле», and the word-count limits hold.
- `node --test 'product/test/*.test.mjs'`: 54 pass, 0 fail (after the QA fixes). The engine tests are still green.

## Deviations from spec
1. **A 5th "blank" branch** (all pairs timed out): the reveal shows «ВРЕМЯ БЫСТРЕЕ — Ни одна пара не собралась целиком — сравнивать нечего.» with only «ещё раз», and no share or card. Claiming МОНОЛИТ "0 из 0" would be false.
2. **Item 1 has no running bar** until it is tapped. The first screen must be readable, and the first tap is the start. All other items are timed.
3. **«Словом и делом» is kept** in the twist and in the МОНОЛИТ line, as the spec writes it. «на деле» appears nowhere, and every split headline uses «КОГДА ДОРОГО».
4. **The ХАМЕЛЕОН headline** shows the head split headline as well as «Выбор зависит от цены…», so even ХАМЕЛЕОН quotes the player's own act.
5. **The share text** names the actual split, not the generic one, for ТРЕЩИНА and ДВОЙНОЕ ДНО. МОНОЛИТ is a brag: «ни одного двойного дна».

## Verification
- Screenshots were checked by eye at true 375×812 and 320×568: the first screen, a word item, a scene item, all 5 reveal tiers, the friend entry, the friend reveal comparison and a broken fragment.
  - Headless Chrome `--headless=new` has a minimum window width of about 500 px, so a bare `--window-size=375,…` lays out at 500 px. I rendered the page inside a 375/320 iframe instead.
  - Choice screens fit 320×568 without scrolling. The reveal headline block fits 375×812, down to the honesty line.
- A real play-through in the browser pane (7 taps and 1 deliberate scene timeout) produced a correct ДВОЙНОЕ ДНО, with the timed-out pair excluded and no console errors. «ещё раз» restarts correctly.

## QA fixes (qa-c.md, round 2)
- **SF1:** the random stream and the no-echo scenes (above). Both are tested.
- **SF2:** the СВОБОДА scene is rebalanced.
- **SF3:** the УСПЕХ/ПОКОЙ verbs are unambiguous.
- **SF5:** every reveal timer is tied to a run token, so «ещё раз» mid-animation drops the stale timers (no TypeError, verified in the browser). The `.after` block also takes no taps until it is visible.
- **CEO #5:** «ПОКАЗАТЬ ДРУГУ» now sits right under the headline block (tier, headline, quote, receipt, title). It is on the first screen at 375×812 and also at 320×568 (ТРЕЩИНА checked).
- **SF6:** the twist and ledger are more compact on short screens.
- **Nits fixed:**
  - Long button labels use a smaller font.
  - The index page has `og:image:width`/`height`.
  - `og.json` is now v2, which fixes the «Один / раз» widow in the preview.
  - The friend comparison reads «У друга тоже МОНОЛИТ…» when the tiers match, and «У тебя пары не собрались» for blank.
  - The blank reveal button now has a top margin.
- **Not changed:** «словом и делом» and the ХАМЕЛЕОН line stay as the spec wrote them (QA SF4 is a CEO call). The `→`/`≠` glyphs still come from the fallback font. The titles stay masculine-generic nouns.

## Known issues
- **Run the real flip rate on humans first.** If ПРАВДА/МИР or УСПЕХ/ПОКОЙ flips above about 45%, the item is the cause, not the player. Rewrite that scene.
- **ХАМЕЛЕОН is thin under consistent players** (2–10%).
- **Scene reading time is part of the scene reaction time**, so the "slowest scene" head choice partly tracks text length. The scenes are 9–13 words to keep this small, and the time is shown only under the 2×-median rule.
- **The card is plain:** text in a frame, with no illustration.
- **The 3-second word bar may feel harsh** on first contact. Item 1 is untimed for that reason.

## Kit / tooling change needed (not done; not my files)
- QA reports the serve.mjs CSS MIME fix is now in the working tree.
- **`operations/serve.mjs` serves `.css` (and `.json`) as `application/octet-stream`.** Chrome's strict MIME check then refuses `lab/lab.css`, so every lab page renders unstyled locally (verified). GitHub Pages is fine.
  - Fix: add `'.css': 'text/css'` and `'.json': 'application/json'` to `types`.
  - I verified on `python3 -m http.server` (same root) because of this.
- **The headless-Chrome screenshot recipe in FINALISTS.md** needs the iframe trick, or `--window-size` ≥ 500, to give real phone widths.
