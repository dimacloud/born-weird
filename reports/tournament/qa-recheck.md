# QA-EVAL-RECHECK: lab A / B / C, deploy gate (2026-10-04)

Evaluator: QA-EVAL-RECHECK. I did not build these prototypes and changed nothing except this file.

**Method:**
- `node --test 'product/test/*.test.mjs'`: **54/54 pass**.
- Served the site with `node operations/serve.mjs 8441` (stopped at the end).
- Drove headless Chrome over raw CDP with `Emulation.setDeviceMetricsOverride` and touch emulation, at **375×812 and 320×568**. Taps were real touch events.
- **Every URL carried `?qa=1`**, including the friend links through `r/<code>/`. Across all runs there were zero requests to non-localhost hosts, so no counters were hit.
- I checked screenshots and card PNGs by eye. For the date test, cards and reveal screenshots were compared by pixel diff.
- Tab hiding was simulated by overriding `document.hidden` and dispatching `visibilitychange`.

## Gate verdict

| Prototype | Verdict | Blockers |
|---|---|---|
| A ШАР | **GO** | none |
| B ОРАКУЛ | **GO** (one fairness fix strongly advised, see B-F1) | none (B1 is closed) |
| C ДВОЙНОЕ ДНО | **GO** | none |

## B — ОРАКУЛ

**B1 (privacy blocker): CLOSED.**

**Setup.**
- I seeded `Math.random` identically, then entered 5 dates through the real form: 17.05, 01.01, 29.02, 31.12 and 13.07.
- I played the same 7 answers at both sizes (10 runs).
- I intercepted `navigator.share`.

**What the date does and does not reach.**
- **Reveal text:** identical hash in all 10 runs.
- **Share payload:** identical in all runs: «Оракул угадал меня 1 из 4. Тебя он угадает?» plus `…/lab/b/r/cipher/#ref=cipher&s=11100`.
- **Card PNG (1080×1920), pixel diff across dates:**
  - 0 to 5 differing pixels, with a maximum channel delta of 3/765.
  - The diffs sit in the antialiasing of «1 ИЗ 4».
  - The same date also varies this way between runs (raster noise, not data).
- **Reveal screenshots:** they differ only in the same noise, at most 3/765, in the card preview. The 17.05 and 31.12 shots are byte-identical.
- **Reveal styling:** `--oc` is `#55ffff` and the eye SVG is the default in every run.
- **Network:** only localhost page, kit and fonts.
- **Storage:** `sessionStorage` and `localStorage` are empty, cookies are empty, and the URL is unchanged.
- **Logic:** bets, hits and receipts were identical for every date. In the code, `newRun`, `itemAt`, `answer` and `finish` take no date. `cardSpec(res)` is the card's only input.

**S1: FIXED.** I played 6 random real runs and checked each «Почему ставка» line against the taps I logged. Every one quotes the player's earlier choice verbatim and links it to the right axis. Example: taps «Последний кусок торта → СЪЕМ» and «Пятница → СВОЙ ПЛАН» produced «Почему ставка ОТДЫХАЮ: раньше «Последний кусок торта» → СЪЕМ и «Пятница» → СВОЙ ПЛАН.» The no-consistent-axis fallback quotes the single latest answer, which is correct.

**S2: FIXED.**
- I tapped bet 4 and hid the tab within 100 ms.
- After 4 s hidden the suspense was frozen at «··» with progress unchanged (3 done).
- On return it resolved «УГАДАЛ» and advanced about 1.6 s later.

**S3: FIXED.**
- The reveal reads plain «ОРАКУЛ УГАДАЛ / N ИЗ 4» with no persona name.
- The birth hint now reads «только день и месяц · никуда не отправляется».

**Also OK:**
- **Friend entry:** `/lab/b/r/riddle/?qa=1&arm=birth#ref=riddle&s=13101` lands on `/lab/b/?qa=1&arm=birth#…`, so `?qa=1` is kept. It shows «ОРАКУЛ УГАДАЛ ДРУГА 3 ИЗ 4. ТЕБЯ — ПОСМОТРИМ.» above the date form. The reveal adds «Друга — 3 из 4, тебя — 1 из 4. Код друга: …».
- **Date form:** 31 → 30 when April is picked.
- **Broken fragments:** `#s=garbage`, `#s=%ZZ&ref=x`, `#%ZZ`, `#ref`, `#s=15101` and `r/cipher/` with no hash all play a normal game with no errors. A duplicate `s` uses the valid one.
- **Layout:** play screens never scroll at 320×568, boss included.

**B-F1 (SHOULD-FIX, tournament fairness): [ПОКАЗАТЬ ДРУГУ] is far below the fold.**
- It sits at **y ≈ 1150–1172 at 375×812**, under the recognition chips and the full card.
- In A and C it is now on the first screen of the reveal: A at y ≈ 240–350, C at y ≈ 460–615.
- Share rate is a tournament metric, so B's share numbers would be depressed by layout, not by the game.
- Fix: move `#share` directly under the receipt/why block, as A and C did. Do this before comparing `share_click` across A/B/C.

**B nits:**
- During play (taps 1–3) the eye line still reads «ОРАКУЛ 9 АПРЕЛЯ ИЗУЧАЕТ…», and the star and colour are derived from the date. That is acceptable: it is on-screen only and never shared, but a mid-game screenshot would show it.
- `→` renders in the fallback font.

## A — ШАР

All seven claimed fixes verified by real play. There were no overflow, no console errors and no `undefined`/`NaN` in 8 full games and the friend run.

- **Timeout-decided games make no claim.**
  - In a game with no touches after tap 1 (6 autos), the reveal reads «ШАР РЕШИЛ ЗА ТЕБЯ: 📜 НЕДОПИСАННАЯ РУКОПИСЬ · Первым за борт: … · Без тебя за борт: 6 из 7 · Это выбор шара, не твой.»
  - There is no title, card, share or recognition check, only [ЕЩЁ РАЗ — БЫСТРЕЕ].
  - A game where only throw 7 timed out gets the same honest branch («1 из 7»).
  - With 3 autos and throw 7 chosen, the normal reveal is correct: the kept item is the player's pick from the last two.
- **Drop-ending card:** the basket is empty, the kept item is drawn falling beside it, and the heading reads «ДО ПОСЛЕДНЕГО В ШАРЕ: КУБОК С МОИМ ИМЕНЕМ».
  - Nit: the falling emoji clips the top of «ДО» by a few pixels.
- **Share button on the first screen:** at 375×812 it sits at y = 239–351 across jump and drop. At 320×568 it sits at y = 286–378.
- **No scroll during play:** `scrollHeight − innerHeight = 0`, with no horizontal scroll and `scrollY` = 0. Checked before every throw, at the gust and at the twist, at both sizes.
- **«ПРЫЖОК РАДИ» shows the name:** «ПРЫЖОК РАДИ: 🛂 ПАСПОРТ», «… ✉️ ПИСЬМО».
- **Gender-neutral nicknames:** for example БРОДЯГА БЕЗ НАГРАД, ТИХОНЯ БЕЗ ПРОШЛОГО, НЯНЬКА БЕЗ НАГРАД, ЧЕРНОВИК БЕЗ НАГРАД, ЯКОРЬ БЕЗ ЗАПАСА, ЗВЕЗДА БЕЗ ЗАПАСА. They are common-gender nouns or things.
- **One friend guess per tab:**
  - Via `/lab/a/r/manuscript/?qa=1#ref=manuscript&s=6j`, a wrong guess shows «✗ МИМО. У ДРУГА: 📜 РУКОПИСЬ и прыжок за борт ради неё».
  - After 1.7 s comes «ТЕПЕРЬ ТВОЙ ШАР…».
  - A reload goes straight to «ТЕПЕРЬ ТВОЙ ШАР». A fresh tab gets the guess again.
  - The friend reveal reads «У друга осталась: РУКОПИСЬ. У тебя: КУБОК.»
  - The drop share text is «В моём шаре до последнего держался КУБОК С МОИМ ИМЕНЕМ. А что останется в твоём?»
- **Broken fragments:** `#s=garbage`, `%ZZ`, `#ref`, `9j`, `5j%00`, `r/cat/` with no hash and `#%ZZ&s=5j` (the friend guess still works) all show the normal first screen with no errors.

## C — ДВОЙНОЕ ДНО

- **The doubling isn't guessable mid-stream: FIXED (as far as copy allows).**
  - I fuzzed 200k streams. They produce 9 type patterns, none above 26.5%.
  - Item 3 never re-asks item 1 (0 of 200k).
  - The scene order mirrors the word order in only 3.4% of streams.
  - The scene for item 1's pair lands at item 4 (6.8%), 5 (46.6%), 6 (23.4%), 7 (10%) or 8 (13.3%).
  - The first scene appears before its word 93% of the time.
  - I watched 5 real orders, all different.
  - The semantic link between a word and its scene is inherent to the concept.
- **No own-pair vocabulary reuse: FIXED.** A stem check finds none.
  - Nit: there is one cross-pair echo. «Друг горит **своим** планом» (ПРАВДА/МИР) can recall «**СВОИ** ЛЮДИ».
- **Buttons are unambiguous:** ПЕРЕЕЗЖАЮ/ОСТАЮСЬ, СОГЛАШАЮСЬ/ОТКАЗЫВАЮСЬ, СКАЖУ/ПРОМОЛЧУ and НАУГАД/ЛЮБИМОЕ МЕСТО.
- **«ещё раз» mid-animation: FIXED.**
  - I clicked it at 30, 300, 800, 1500, 2300 and 2600 ms into the reveal, both by tap and by JS `click()`.
  - There was no TypeError, and the restarted game is never overwritten by a stale reveal.
  - The button cannot be tapped while hidden: `pointer-events:none`, and it is below the fold anyway.
- **Share button on the first screen:** at 375×812 it sits at y = 509–615 for ТРЕЩИНА and ХАМЕЛЕОН. At 320×568 it sits at y = 459–513 for ДВОЙНОЕ ДНО.
  - Nit: a ХАМЕЛЕОН with a receipt at 320×568 puts it at y = 535–589. The button is visible and tappable, but its label is clipped at the bottom edge.
- **Hidden tab:** the bar froze at 83.5% for 8 s hidden, then resumed with no skip.
- **Friend entry:** `/lab/c/r/crack/?qa=1#ref=crack&s=113030` shows «У ДРУГА: ТРЕЩИНА. А У ТЕБЯ?» with item 1 on screen.
- **Broken fragments:** `garbage`, `%ZZ`, `#ref`, `1zz%`, an invalid head (`103030`) and `r/double/` with no hash all play a normal game.
- **Ledger:** every row I checked matches the taps.

**C nits:**
- **Friend comparison for the same tier with a different head:** it reads «У друга тоже ТРЕЩИНА. У тебя — ТРЕЩИНА (МИР → ПРАВДА).» That is redundant and drops the friend's split. Better: «У друга тоже ТРЕЩИНА, но другая: СВОБОДА → СВОИ ЛЮДИ.»
- **Twist wording:** the twist now says «словом и ценой», but the МОНОЛИТ card still says «СЛОВОМ И ДЕЛОМ».
- **Titles:** they are still masculine-generic nouns (БЕГЛЕЦ, КАРЬЕРИСТ, ОТШЕЛЬНИК…). The contract allows this and it is a CEO call, but A dropped them.

## Regression (all three)

- **Tests:** 54/54 pass.
- **Real share URLs through `r/<code>/`:** all 16 `r/` pages contain `location.search`, and the redirect keeps both `?qa=1` and the fragment (verified live for A, B and C).
- **Console:** no errors or exceptions in any run. The only entries were `favicon.ico` 404s from the local server.
- **Text:** no `undefined`, `NaN` or `null` in any visible text.
- **Copy scan of all lab js/html/json:**
  - No «(а)».
  - Past-tense forms are only about the oracle (УГАДАЛ, говорил), items (остался/держался/полетело), the balloon (РЕШИЛ) or questions (были).
  - Remaining kit nit: «ПОПАЛ?» in `lab.js` `recog` is masculine past tense. It refers to the game, but a reader may take it as being about themselves. Consider «В ТОЧКУ?» or «ПОХОЖЕ?».
- **Hub `/lab/`:**
  - 24 loads gave all 6 orders.
  - The links carry `?f=1`, `?qa=1` or both, and drop other params.
  - A tap opens the game with `?qa=1` and nothing scrolls at 320×568.

## Nothing new broke

I found no new blockers.

The only new finding of weight is B-F1: inconsistent share-button placement across the three prototypes, which confounds the share-rate comparison.

Still unverified, because it needs real devices: Telegram and Instagram webviews, iOS sound, the emoji font on Android cards, and the OG preview in a real chat.
