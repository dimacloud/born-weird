# Tournament finalists and build specs (CEO-001, 2026-10-04)

## Review tally

| Concept | Game design | Behavior | Growth | QA | Picked |
|---|---|---|---|---|---|
| C1 ШАР | #1 | #2 | #1 | #1 | **A** |
| C9 ОРАКУЛ | #2 | #3 | – | #2 | **B** (+ birth-date arm) |
| C8 ДВОЙНОЕ ДНО | sceptical | #1 | – | #3 | **C** |
| C3 ЦЕНА ВОПРОСА | #3 | – | #2 | 4th | reserve (round 2) |
| C7 ПУСТОЕ МЕСТО | trap | most dishonest | #3 | late-risk | out |
| C2 ПАУЗА | near miss | Barnum | forgettable | technical trap | out |
| C4, C5, C6 | – | – | C6 as share mode only | – | out; C6 idea merged into A's friend entry |

## Why these three (not the average score)

They test three different answers to "what is the magic trick?":

- **A — ШАР:** *you reveal yourself by playing, not answering.* Objects, pressure, absurd headline. No values on screen. No birth date.
- **B — ОРАКУЛ:** *the game bets on you and you try to beat it.* An opponent, a score, a prediction you confirm or break. Carries the birth-date variable (H2) as a 50/50 arm.
- **C — ДВОЙНОЕ ДНО:** *the game shows where your words and your choices split.* The Founder's own magic-trick hypothesis (an observed contradiction), built the honest way.

Common share and analytics plumbing (`lab/lab.js`, per-result preview pages) is identical, so the tournament compares the games and not the share buttons.

C3 ЦЕНА ВОПРОСА is the reserve for round 2 (it had growth's #2 and game design's #3 scores, but carries the highest copy risk).

---

## Build contract (all finalists)

**Files.** Each finalist has exactly these files; nothing else changes.
- `product/site/lab/<p>/index.html`: the UI.
- `product/site/lab/<p>/game.js`: pure logic in a UMD wrapper like `product/site/engine.js`, so node tests can `require` it.
- `product/site/lab/<p>/og.json`: share previews (format in `operations/lab-og.mjs`).
- `product/test/lab-<p>.test.mjs`: the simulation gate.
- `reports/tournament/build-<p>.md`: build notes and the simulation table.

**Kit.** Include `../lab.css` and `../lab.js` and use `LAB.init('<p>')`. The kit gives `track`, `share`, `recog`, `SND`, `timer` (pauses while hidden), `canvasImg` and `rng`. Do not edit the kit; if you need a change, describe it in your build notes.

**Events.**
- `track('view')` on load, `track('start')` on the first game tap, `track('done')` when the reveal shows.
- `L.recog(el, chips)` under the reveal; the chips are 2–3 short labels of the reveal's own lines.
- `L.share({ code, state, text })`: `code` is a Latin slug that matches an `og.json` result; `state` is a compact string the friend page can decode.

**Friend entry.**
- If `L.hash.s` decodes to a valid state, show the sender's result in at most 2 lines at the top, and put the first game choice on screen immediately: no intro and no extra button.
- A broken state silently falls back to the normal game.
- The friend's reveal adds one comparison line with the sender.

**First screen.** At most 12 words before the first tap, and no field before the first tap (except B's birth arm). The first tap should already be a game move.

**Russian copy.**
- No «(а)», no past-tense verbs about the player, no gendered adjectives about the player. Use the present tense, nouns and receipts («Первым за борт: …»).
- Short options: 1–5 words where possible.
- One honesty line at most.

**Mobile.**
- Taps only: no swipes, no gestures near the screen edges.
- Targets of at least 44 px. Choice screens fit 320×568 without scrolling.
- Timers use `LAB.timer`. A timeout always produces a valid reveal and is never quoted as a choice.

**Card.**
- Canvas 1080×1920 (stories), drawn after `document.fonts.ready`, shown via `LAB.canvasImg` with the hint «удерживай картинку, чтобы сохранить».
- At most 3 text lines plus the brand, and the readable address `dimacloud.github.io/born-weird/lab` inside the central 70% of the frame.

**Reveal.** The headline block fits one phone screen. Below it come the card, one share button (`.lab-share`, label «ПОКАЗАТЬ ДРУГУ» or similar) and a small «ещё раз».

**Share text.** One first-person line ending with a question to the recipient, gender-neutral, with no link inside the text (the kit appends the URL).

**Simulation gate** (BEHAVIOR rules), in `product/test/lab-<p>.test.mjs` with 10,000 runs.
- Player models: uniform random, plus at least one plausible structured model (consistent players with noise, or item-preference players).
- No headline above 35% under the structured model, at least 3 headline groups of 10% or more, and any contradiction or split line firing for 25–60%. If a target can't be met by design, say so and why in the build notes.
- Every branch is reachable, there is never `undefined`, `NaN` or an empty line, and a broken friend state falls back safely.

**Honesty.** Facts as facts; titles as play. No diagnosis, prediction, astrology-as-evidence, rarity, percentiles or «научно». Hesitation time is shown only when it is at least 2× the player's median and at least 2.5 s, and it is shown as a fact.

**Weight.** Under 150 KB excluding the shared fonts, with no external requests except the kit's counters.

**Verify.**
- Run `node operations/serve.mjs <port>` (pick a free port), use `?qa=1`, and take headless Chrome screenshots at 375×812 and 320×568 of the first screen, a mid-game screen and the reveal.
- `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=375,812 --screenshot=out.png URL` works; for mid-game states, add a `?qa=1&demo=<state>` hook if needed.
- Then run `node operations/lab-og.mjs <p>`.
- Do not commit.

---

## A — ШАР (folder `a`)

**Magic trick:** your balloon is falling, you throw your life overboard, and what stays in the basket is who you are.

**Items.** 8 tiles on one screen in a 2×4 grid, big, each a word plus an emoji. The family is hidden and used only for the title.
- ДЕНЬГИ НА ГОД 💵 — БЕЗОПАСНОСТЬ
- ТЕЛЕФОН СО ВСЕМИ ФОТО 📱 — ПАМЯТЬ
- НЕОТПРАВЛЕННОЕ ПИСЬМО ✉️ — ЧУВСТВА
- ЗАГРАНПАСПОРТ 🛂 — СВОБОДА
- КЛЮЧИ ОТ ДОМА 🔑 — КОРНИ
- ЧУЖОЙ КОТ 🐈 — ДОЛГ (someone trusted you with it)
- НЕДОПИСАННАЯ РУКОПИСЬ 📜 — МЕЧТА
- КУБОК С ТВОИМ ИМЕНЕМ 🏆 — ПРИЗНАНИЕ

**Flow (about 40 s).**
- **Screen 1.** «ШАР ПАДАЕТ. ВЫКИДЫВАЙ ЛИШНЕЕ.» A pixel or CSS balloon with the basket of 8 tiles. Tapping any tile throws it: that is the first move and `start`. There is no start button.
- **7 throws.**
  - Each throw has a fuse: 4 s for throw 1, then shorter, with a floor of 2 s.
  - The thrown tile falls with `SND.fall`, the balloon rises slightly, then sinks again.
  - **Throw 4 escalation:** «ПОРЫВ ВЕТРА!»: screen shake, the fuse halves for the remaining throws, faster ticks.
  - On timeout, a random remaining item falls with «ШАР НЕ ЖДЁТ». It is logged as auto and excluded from every receipt.
- **Twist.** «Остался один. Шар всё ещё падает.» [ВЫКИДЫВАЮ] / [ПРЫГАЮ Я]. No timer.
- **Reveal.**

**Reveal.**
- **Headline:** «В ШАРЕ ОСТАЛСЯ: X» if the player jumps («ПРЫЖОК РАДИ: X» as a second big line), or «ВЫКИНУТО ВСЁ. ПОСЛЕДНИМ: X» if they throw it.
- **Receipts,** all player choices only:
  - «Первым за борт: Y» with the time if it's under 1.5 s («за 0,8 с»);
  - «Почти остались: Z» (the 7th throw);
  - «Дольше всего в руках: W (4,1 с)» only under the hesitation rule.
- **Title:** adjective by family(first thrown) plus noun by family(kept), 8 + 8 words; e.g. «ХРАНИТЕЛЬ ЧУЖОГО». Fun, never moral.
- **Honesty line:** «Тут ничего не вычислено — только то, что полетело за борт.»
- **Chips:** «что осталось», «что первым за борт», «прозвище».

**Code** = kept item slug (8 result pages: `money phone letter passport keys cat manuscript cup`). Also `track('kept_<code>')` and `track('jump')` / `track('drop')`.

**Friend entry (C6 merge).**
- «У ДРУГА В ШАРЕ ОСТАЛОСЬ ОДНО. УГАДАЕШЬ?» shows the 8 tiles; one tap gives instant ✓/✗ with the answer, `track('guess_ok'|'guess_no')`.
- Then «ТЕПЕРЬ ТВОЙ ШАР» and the normal game.
- Reveal comparison line: «У друга осталось: X. У тебя: Y.»

**Sim gate.** Headline = kept item. Model: per-player random preference weights drawn from a Dirichlet-like distribution with a mild population bias, for example the cat and the phone slightly favoured. Report the kept-rate per item; target: no item above 30%.

**Share text:** «В моём шаре остался ЧУЖОЙ КОТ. А что останется в твоём?»

## B — ОРАКУЛ (folder `b`)

**Magic trick:** the game bets on what you'll choose, and you find out how readable you are.

**Axes:** Я / МЫ · СЕЙЧАС / ПОТОМ · ПРЫЖОК / ОПОРА.

**Taps 1–3: one per axis.**
- An "eye" panel shows «ОРАКУЛ ИЗУЧАЕТ…» with a scanning animation, so the opponent is visible from tap 1.
- The live scoreboard «ОРАКУЛ 0 : 0 ТЫ» is shown but doesn't count yet.

**Taps 4–7: bets.**
- A face-down card «СТАВКА СДЕЛАНА» appears before each choice. It is visibly inert: no tap handler, a label, a dashed frame.
- After the tap: a plain content swap to УГАДАЛ / ПРОМАХ with a sound, and the score updates (the oracle scores on a hit, ТЫ scores on a miss).
- Item 4 = Я/МЫ, 5 = СЕЙЧАС/ПОТОМ, 6 = ПРЫЖОК/ОПОРА. Bet = the side chosen on that axis earlier.
- Item 7 = **boss:** the axis that is consistent so far (tie order: Я/МЫ, СЕЙЧАС/ПОТОМ, ПРЫЖОК/ОПОРА), in a costlier form; bet = the same side.
- Each axis has 2 everyday items and one boss item per side, all short (options 1–4 words, situation ≤ 8 words). Draft from `concepts-behavior.md` C2 and tighten; e.g. «Последний кусок торта» [СЪЕМ] [ОСТАВЛЮ]. Options must be roughly balanced (neither side obviously "right").

**Reveal.**
- **Headline:** «ОРАКУЛ УГАДАЛ 3 ИЗ 4».
- **Label by hits:** 4 ОТКРЫТАЯ КНИГА · 3 КНИГА С ЗАГАДКОЙ · 2 ДВОЙНОЙ АГЕНТ · 0–1 ШИФР. Keep these or improve them as gender-neutral nouns.
- **Code:** latest side per axis, «МЫ · ПОТОМ · ОПОРА».
- **Receipt:** the first miss quoted («Промах на „Вечер пятницы“: ставка — ДРУЗЬЯ, выбор — СВОЙ ПЛАН»); if there is no miss, the boss choice.
- **Honesty line:** «Оракул не читает мысли — он ставит на то, что ты не меняешься.»
- **Code slug** = label (`book riddle agent cipher`).

**Birth arm (H2).**
- Each new visitor (sessionStorage) is randomly assigned `birth` or `none`, 50/50; `?arm=birth|none` forces an arm.
- In `birth`, before tap 1: «ОРАКУЛУ НУЖЕН ТВОЙ ДЕНЬ РОЖДЕНИЯ.» Two big selects, day and month (never the year), [ГОТОВО] and a small «без даты».
- The date only sets the oracle's persona: a name like «ОРАКУЛ 17 МАЯ», a colour and a sigil on the eye and the card. It never changes bets or claims, and never leaves the device or enters the share state.
- Tracks: `arm_birth` / `arm_none` on view, `birth_given` / `birth_skip`, `start_birth` / `start_none`, `done_birth` / `done_none`.

**Friend entry.** «ОРАКУЛ УГАДАЛ ДРУГА 3 ИЗ 4. ТЕБЯ — ПОСМОТРИМ.» then tap 1 immediately (the birth arm still applies). Comparison line on the reveal.

**Sim gate.** Model: players with a per-axis true side and per-item consistency p ∈ [0.55, 0.9], plus uniform random. Report the hit-band distribution; target: no band above 40%.

**Share text:** «Оракул угадал меня 3 из 4. Тебя он угадает?»

## C — ДВОЙНОЕ ДНО (folder `c`)

**Magic trick:** the game asks the same thing twice without saying so, and shows where your quick word and your costly choice split.

**Pairs.**
- СВОБОДА/СВОИ ЛЮДИ · УСПЕХ/ПОКОЙ · ПРАВДА/МИР · НОВОЕ/ПРИВЫЧНОЕ.
- Each pair has a WORD item (two words, a 3 s bar, «не думай») and a SCENE item (≤ 14 words, two short buttons, a 7 s bar).

**Stream.**
- 8 taps as ONE interleaved stream; the word and scene of the same pair are never adjacent.
- Words and scenes look the same, so the player doesn't notice the doubling.
- No "next": the tap advances.
- On timeout the pair is excluded and never quoted.

**Twist at reveal.** «8 вопросов были 4 вопросами, заданными дважды: словом и делом.»

**Reveal by number of splits** among the valid pairs.
- **МОНОЛИТ (0):** «Словом и делом — одно и то же, 4 из 4.» Quote the strongest scene choice.
- **ТРЕЩИНА (1)** and **ДВОЙНОЕ ДНО (2):** headline «СЛОВОМ: СВОБОДА. КОГДА ДОРОГО: СВОИ ЛЮДИ.», and quote the scene text and the chosen button verbatim. Use the slowest-scene split as the head, with a fixed order on ties; the second split gets one line.
- **ХАМЕЛЕОН (3+):** «Выбор зависит от цены, а не от слова.» Quote the head split.
- **Title:** one of 8 named splits (pair × direction), for example «БЕГЛЕЦ, КОТОРЫЙ ВОЗВРАЩАЕТСЯ». Noun phrases only. Never «на деле», never «думал».
- **Honesty line:** «Это не тест. Это два твоих ответа рядом.»
- **Code slug** = tier (`monolith crack double chameleon`).

**Friend entry.** «У ДРУГА: ДВОЙНОЕ ДНО. А У ТЕБЯ?» then item 1 immediately. Comparison line on the reveal.

**Sim gate.**
- Model: each player has a true side per pair; the word answer matches it with p_w ∈ [0.7, 0.95] and the scene answer with p_s ∈ [0.6, 0.9], independently, plus a timeout rate of about 5%.
- Report the tier distribution and the per-pair flip rate; target: no tier above 45% (4 tiers), and "any split" at 25–60%.
- Note that real flip rates need humans (the per-pair flip rate is a counter, `flip_<pair>`).

**Share text:** «У меня ДВОЙНОЕ ДНО: словом одно, когда дорого — другое. А у тебя?» (Adapt it per tier.)

---

## Hub (CEO-001)

- `/lab/` lists A, B and C in a random order, with letters only and one line: «Три маленькие игры. Сыграй каждую. Не анализируй. Потом скажи, какая живая.»
- The Founder's link carries `?f=1`, so the Founder's plays are counted separately.
