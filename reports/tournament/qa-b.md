# QA-EVAL-B — ОРАКУЛ (prototype B), 2026-10-04

**Evaluator:** QA-EVAL-B. I did not build this prototype and did not change any file except this report.

**Scope:**
- Code under test: `product/site/lab/b/` (index.html, game.js, og.json, og/, r/), the kit (`lab.js`, `lab.css`) and `product/test/lab-b.test.mjs`.
- Spec: FINALISTS.md, sections "Build contract" and "B — ОРАКУЛ".
- Checklist: the pre-flight list in review-qa.md.

**How it was tested:**
- `node --test 'product/test/*.test.mjs'`: 52/52 pass (A, B and C).
- Real play in headless Chrome 154 over CDP with device-metrics emulation at 375×812 and 320×568 (emulation, not window size), with `?qa=1`, both `&arm=birth` and `&arm=none`.
- Screenshots were checked by eye: the first screen, the birth screen, bet 4 before and after, the boss before and after, the reveal, the card and the friend reveal at 320.
- An independent node script ran all 131,072 combinations (8 item orders × 128 button orders × 128 answer patterns) against `game.js`.

## VERDICT: PASS WITH FIXES

The game logic is correct and robust, and the build follows the contract well. One privacy defect must be fixed before real people see it; it is a one-line fix and needs no re-review. Everything else is should-fix or polish.

## BLOCKERS

### B1. The card's sigil gives away the birthday, although the page promises the date «остаётся на телефоне»

**Where:** `game.js` `persona()`, used by `drawCard` → `drawEye` in index.html.

**What is wrong:**
- `persona()` derives `color = (day*37+month*101) % 6`, `points = 3+(day+month)%6` and `rot = (month*30+day*7) % 360`.
- `drawEye` paints that colour, number of points and rotation onto the shareable 1080×1920 card (the frame is drawn in the colour too).
- I enumerated all 366 dates:
  - Including rotation, every date gets a unique costume (366 of 366).
  - Even after accounting for the star's rotational symmetry, there are 276 visually distinct sigils. 186 dates are uniquely identifiable from the card, and no group is larger than 2.
  - The formula is public in `game.js`, so anyone can decode a shared card back to day and month.
- The builder notes say "The sigil and colour are a 36-way costume and do not reveal the date." That is wrong because of `rot`.
- The spec says the date "never leaves the device". The card is the thing that leaves the device.

**Repro:**
1. `node -e` with `require('./product/site/lab/b/game.js')`.
2. Map every valid (day, month) to `color + points + (rot mod 360/points)`.
3. Result: 186 singletons.

**Fix (any one of these):**
- Pick `rot` (and ideally `points` and `color`) from `Math.random()` once per session instead of from the date.
- Or don't draw the sigil or persona colour on the card (draw it on screen only).

The arm still works either way: the persona name on screen is what makes the date feel used.

## SHOULD-FIX

### S1. The reveal never shows why the oracle bet, which is the magic trick itself

**Current receipt:** «Промах на „Последний кусок торта“: ставка — СЪЕМ, выбор — ОСТАВЛЮ.» The player already saw this exact swap live, and the score was visible the whole game. So the reveal adds nothing new except the label: «2 ИЗ 4» was already on the scoreboard as 2:2.

**What is missing:** the evidence pair, for example «Ставил на СЪЕМ, потому что в „Пятнице“ — СВОЙ ПЛАН. А тут — ОСТАВЛЮ.» That line is what makes it specific and surprising ("it linked my cake to my Friday!"), and it is pure fact. It is the strongest available upgrade for "would you send it".

### S2. Auto-advance runs while the tab is hidden

**Where:** `later()` uses `setTimeout`.

**Repro:**
1. Tap a bet item (k ≥ 3).
2. Within 1.6 s, hide the page (Telegram sheet or app switch).
3. Come back. The game is already on the next item (verified: the progress index went 4 → 5 while hidden), so the player missed the УГАДАЛ/ПРОМАХ moment.

Nothing gets stuck and the reveal stays valid. The contract's timer rule targets countdowns, so this isn't a contract breach.

**Fix:** pause the pending advance on `visibilitychange` (or use `LAB.timer`).

### S3. The birthday is printed on the reveal next to the eye («ОРАКУЛ 17 МАЯ»)

Most people screenshot the screen rather than long-press the card, and that screenshot shows the date. This is the user's own action, but the screen also says «остаётся на телефоне».

**Options:**
- Show the name only during the game (the eye panel) and use plain «ОРАКУЛ» on the reveal.
- Or change the hint to something accurate, such as «никуда не отправляется».

### S4. The code line «Я · СЕЙЧАС · ПРЫЖОК» is unexplained

**The problem:**
- A stranger never saw these axis words during play.
- On the friend reveal, «Совпадений в коде: 1 из 3» is jargon on top of it.

**Fix:**
- Give the code a 1-word lead such as «Твой код:».
- Phrase the friend comparison in plain words, for example «В двух из трёх — как друг».

### S5. Receipt grammar

- **Case:** «Промах на „Пятница“» and «Промах на „Последний кусок торта“» leave the title in the nominative after «на». It reads machine-made.
  - Fix: «Промах — „Пятница“: ставка…» or «„Пятница“: ставил на ДРУЗЬЯ, выбор — СВОЙ ПЛАН.»
- **Quotes:** the same receipt and the card use German-style „…“. Russian outer quotes are «…».

### S6. Option balance: three items lean to one side

- **«Друг переезжает. У тебя единственный выходной.» [ОТДЫХАЮ/ПОМОГАЮ]:** ПОМОГАЮ is the socially "right" answer. It is the Я-side boss, so the cost is intended, but it borders on a morality test.
- **«Работа лучше, но в чужом городе.»:** the word «лучше» tilts the choice towards ЕДУ.
- **«Своё дело. Денег — на полгода.» [УХОЖУ/ОСТАЮСЬ]:** it is unclear what you leave. Something like «Уйти в своё дело? Денег — на полгода.» would be clearer.

### S7. The r/ redirect drops the query string

**Where:** `location.replace('../../' + hash)` in `r/*/index.html`.

**Why it matters:**
- `?qa=1` is lost. My QA run through `/lab/b/r/riddle/?qa=1#…` and `/lab/b/r/cipher/` fired real counters (see the Counter contamination note at the end).
- `?f=1` would also be lost on a first visit.

**Fix:** `'../../' + location.search + hash`. This is in the lab-og generator, so it applies to A and C too.

## NITS

- **Duplicate «ОРАКУЛ».** The birth screen and the reveal show it twice: the name label above «ОРАКУЛ ИЗУЧАЕТ…», and «ОРАКУЛ» beside the eye above «ОРАКУЛ УГАДАЛ».
- **First-screen word count is 12–13.** «BORN WEIRD · ОРАКУЛ ИЗУЧАЕТ… · ОРАКУЛ 0:0 ТЫ · Пятница. Друзья зовут. · СВОЙ ПЛАН · ДРУЗЬЯ» is 13 tokens if «0:0» counts. That is at the limit; the test passes.
- **Empty gap on taps 1–3.** The hidden bet card (`visibility:hidden`) leaves a ~80 px empty band. It avoids layout jump, but the first screen looks unfinished.
- **The «?» on the bet card.** The dashed card with the label reads as a status panel; nobody I'd expect would tap it, and a tap does nothing (`pointer-events:none`, verified by hit-test). A big centred «?» is the one tappable-looking element; a small «откроется после выбора» or a lock glyph would remove any doubt.
- **Clean runs always quote the same boss pair.** With 4/4 the boss is always on the Я/МЫ axis (every axis is consistent and the tie order picks Я/МЫ), so «Без промахов» always quotes «Друг переезжает» or «Отпуск уже оплачен».
- **Stale workaround.** `index.html` still carries its own `%ZZ` workaround although `lab.js` `parseHash` now has try/catch. It is harmless; its comment is stale.
- **OG tags.** `index.html` has no `og:image:width`/`height` (the r/ pages do).
- **Hint text on desktop.** «остаётся на телефоне» is inaccurate on a desktop.
- **Kit behaviour (A, B and C, not B's code):**
  - The share chain order is share → clipboard → Telegram. The checklist says share → Telegram → copy.
  - `share_ok` is counted just before navigating to t.me, before anything is actually shared.

## Verified OK

**Logic** (131,072 runs):
- Hit bands 0–4 are all reachable: 8,192 / 32,768 / 49,152 / 32,768 / 8,192.
- All 6 boss items are reachable on their correct axis and bet side.
- The boss bet always equals the first consistent axis's side (tie order Я/МЫ → СЕЙЧАС → ПРЫЖОК). The fallback (no consistent axis) goes to Я/МЫ with the latest side, in 12.5% of uniform patterns.
- Bets 4–6 always equal the answers 1–3 on the same axis. No item repeats within a run.
- The score is always 4 in total. There is never `undefined`, `NaN` or an empty string, and every state round-trips.
- Each boss item makes the bet side costly: ОТДЫХАЮ vs. helping a friend, ЛЕЧУ vs. the team, the concert at half a salary, 3 years without holidays, the own business with half a year of money, the same job 5 more years.

**Friend entry:**
- The link shape built by `L.share` (`/lab/b/r/riddle/#ref=riddle&s=13101`) redirects with the fragment kept.
- It shows «ОРАКУЛ УГАДАЛ ДРУГА 3 ИЗ 4. ТЕБЯ — ПОСМОТРИМ.» and item 1 immediately.
- The reveal adds «Друга — 3 из 4, тебя — 2 из 4. Совпадений в коде: 1 из 3.»
- In the birth arm the friend line shows above the date form, and «без даты» leads to item 1.

**Broken fragments:** each one plays the normal game with no exception.
- `#s=garbage`, `#s=`, `#s=%ZZ&ref=x` (the broken part is stripped and the ref kept), `#%ZZ`, `#ref` only, and `r/cipher/` with no hash.
- `decodeState` rejects `15101`, `1310`, `131011`, `03101`, `1410a`, null, undefined and the number 13101.

**Reload and back:**
- A reload mid-game restarts cleanly. In the birth arm it re-asks the date, and the arm and ref persist in sessionStorage.
- The page adds no history entries, so back leaves the page; nothing gets stuck.

**Double-tap races:**
- Triple taps on learn items and 6 taps during the 380 ms suspense and the 1.6 s result: exactly one answer was registered each time. The score and progress stay correct.
- A tap on the bet card's position does nothing.
- Double «ещё раз» followed by an immediate option tap: a clean game at item 1 with the friend line cleared.

**Share:**
- With `navigator.share` OK, the payload is the text «Оракул угадал меня 3 из 4. Тебя он угадает?» plus the URL `…/lab/b/r/riddle/#ref=riddle&s=13111`.
- AbortError: nothing is copied and no message is shown.
- NotAllowedError: falls back to the clipboard, «Ссылка скопирована.»
- No share and a failing clipboard: navigates to `t.me/share/url` with the correct URL and text.

**Birth privacy, apart from B1:**
- Day and month only.
- Impossible days are disabled; 31 → 30 when April is picked; 29.02 is allowed. `persona()` rejects 31.4, 30.2, 0.1, 32.1, 1.13, NaN and 1.5.
- ГОТОВО stays disabled until the date is valid.
- The date is not in any URL, the share state, the share text, the card alt («ОРАКУЛ УГАДАЛ 3 ИЗ 4»), any track key or any network request.
- sessionStorage holds only `bw_lab_b_arm` and `bw_lab_ref_b`. localStorage and cookies are empty.
- `newRun`, `itemAt`, `answer`, `finish` and `encodeState` take no birth input, so the date cannot change bets, hits, labels or receipts (read in code and asserted by the test).
- The `bd=` QA hook is gated by `qa=1`.

**Network:** with `?qa=1` there are zero external requests (only the page, kit, game.js and 4 Plex woff2). Without it, only abacus.

**Console:** no errors except the favicon 404 from the local server. AudioContext warnings appear only in the `demo=` QA mode, which plays sound without a gesture.

**Layout:**
- At 320×568 every one of the 12 items fits with the boss card shown, with options 68 px tall and the page not scrolling.
- The reveal headline block, including the friend line and the longest receipt, ends at 415 px of 568.
- At 375×812 it ends at 340 px.

**Card:**
- 1080×1920, drawn after `fonts.ready`. The Cyrillic font renders (Й, Ё, Ъ in «СЪЕМ» checked).
- 3 text lines plus the brand, and the address at y = 1580, inside the central 70%.
- It is an `<img>` with the long-press hint.

**Copy:**
- No «(а)» anywhere.
- Past tense is used only for the oracle («УГАДАЛ», «Я же говорил»).
- No gendered adjectives about the player.
- No diagnosis, rarity, percentiles or «научно».
- One honesty line. The labels are gender-neutral nouns.

**Weight:** 47 KB (index 23 + game 12 + lab.js 9 + lab.css 3), excluding fonts.

**OG:**
- og.json is valid. `og/` has `_default-1.png` plus 4 result PNGs, 1200×630, and the Cyrillic renders correctly (agent-1.png checked by eye).
- Each `r/<code>/index.html` has og:title, og:description, an absolute og:image, width and height, and noindex.
- The redirect preserves the fragment and defaults to `#ref=<code>`.

**Events:**
- view, arm_<arm>, birth_given/skip, start and start_<arm> on the first option tap (not on ГОТОВО), done, done_<arm>, res_<code> and again.
- Observed on the wire in the referred run, including ref_view, ref_start and ref_done.

## STRANGER NOTES

1. **Under 3 s:** mostly. The eye, «ОРАКУЛ ИЗУЧАЕТ…» and «ОРАКУЛ 0:0 ТЫ» say "someone is watching and keeping score", and the situation plus two big buttons say "tap one". What I don't get yet is *why* I'm choosing; it becomes clear at tap 4.
2. **The bet card:** clearly a status panel, not a button: dashed, labelled «СТАВКА СДЕЛАНА», with nothing pressable. The big «?» is the only thing that invites a poke, and a poke is harmless.
3. **Opponent feel:** yes, the best of the three mechanics on this axis. There are taunts («Я знаю, что ты выберешь.», «Ладно, этот твой.»), a red УГАДАЛ, a green ПРОМАХ with a chirp, a score bump and a yellow boss card «Финал. Тут дороже.» It plays like a duel.
4. **The reveal:** specific but not surprising. I already watched every hit and miss and saw the score, so «2 ИЗ 4 / ДВОЙНОЙ АГЕНТ» is a recap. The aha («it bet on cake because of my Friday answer») is never shown; see S1.
5. **Would I send it?** Yes, as a challenge («Тебя он угадает?» is a good hook and the card is clean), not as a self-portrait. The birth form adds friction without visible payoff beyond a name and a star on the eye.

---

## Counter contamination

My QA run fired real counters, because the r/ redirect strips `?qa=1` (see S7). Subtract these from round-1 data for b:

| Counter | Extra hits |
|---|---|
| `b_view` | +2 |
| `b_ref_view` | +2 |
| `b_arm_none` | +2 |
| `b_start` | +1 |
| `b_ref_start` | +1 |
| `b_start_none` | +1 |
| `b_done` | +1 |
| `b_ref_done` | +1 |
| `b_done_none` | +1 |
| `b_res_agent` | +1 |
