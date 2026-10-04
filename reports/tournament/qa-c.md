# QA-EVAL-C — ДВОЙНОЕ ДНО (prototype C), 2026-10-04

Evaluator: QA-EVAL-C (independent; nothing under test was modified).
Method:
- Ran `node --test 'product/test/*.test.mjs'`: 52 pass, 0 fail.
- Served with `node operations/serve.mjs 8433`. The CSS MIME fix the builder asked for is already in the working tree.
- Played in headless Chrome 154 over CDP with real mouse events, at a true 375×812 and 320×568 (device-metrics override) with `?qa=1`.
- Played 5 real runs: random taps, all left, slow, all timeouts, and a friend run. Also captured all `demo=` tiers and fuzzed `game.js` with 200,000 runs at a 15% timeout rate.
- Screenshots were checked by eye.

## VERDICT: PASS WITH FIXES

The game is technically solid. I found no crash and no broken state, and it is safe to put in front of humans.

The weak spot is the magic trick itself. The stream order is fully predictable, so the doubling shows by item 3, and one scene is badly matched to its word (see SHOULD-FIX 1–3). Fix those before the human test, or the test measures item design instead of the concept.

## BLOCKERS

None.

## SHOULD-FIX

1. **The doubling is exposed by item 3, every game.**
   - The stream generator only ever produces two type orders, `wwswswss` and `wwsswwss` (200k fuzz: 99,715 / 100,285).
   - Combined with "word before scene" and "never adjacent", the pair mapping is forced: the scenes always come in the same order as the words, exactly 2 positions later (`A B a C b D c d` or `A B a b C D c d`).
   - So **item 3 always re-asks item 1**: the one untimed item that everyone reads carefully.
   - Item 3 also echoes it lexically for СВОБОДА/СВОИ ЛЮДИ: «…Но без **своих людей**.» comes 2 taps after **СВОИ ЛЮДИ**.
   - Repro: `?qa=1`, any run. Note items 1 and 3. In my 3 recorded runs, item 3 was the СВОБОДА scene each time item 1 was СВОБОДА/СВОИ ЛЮДИ.
   - Effect: an attentive player sees "same question again" in 10 s and may then answer consistently on purpose. That costs the reveal its "wait, those were the same" beat and biases toward МОНОЛИТ.
   - Fix direction:
     - Allow some scenes before their word (the spec doesn't require word-first).
     - Require a distance of at least 3, and don't keep the order.
     - Never put item 1's pair at item 3.
     - Remove literal echoes from the scenes.
2. **The СВОБОДА / СВОИ ЛЮДИ scene is lopsided and will likely flip for most people.**
   - «Год жить где хочешь, всё оплачено. Но без своих людей.» is one year, fully paid, at low cost, so ЕДУ is the easy yes.
   - The word item, by contrast, asks about values in the abstract.
   - Expect a high СВОИ ЛЮДИ → ЕДУ flip rate (ДОМОСЕД С ЧЕМОДАНОМ НАГОТОВЕ) that reflects the item, not the player.
   - Make the price real on both sides, for example "move for good" or "a year, and you miss someone's big event".
   - Watch `flip_free` first in the pilot.
3. **УСПЕХ/ПОКОЙ buttons are ambiguous.**
   - The scene ends on «…рабочий телефон звонит и в воскресенье.», then offers БЕРУ / НЕ БЕРУ, which reads as "pick up the phone or not".
   - Use СОГЛАШАЮСЬ / ОТКАЗЫВАЮСЬ, or ПОВЫШЕНИЕ: ДА / НЕТ.
4. **«КОГДА ДОРОГО» doesn't fit every pair.**
   - НОВОЕ/ПРИВЫЧНОЕ has no real cost (a choice of vacation spot), so «КОГДА ДОРОГО: НОВОЕ.» reads odd on the reveal.
   - Also, both "word" and "deed" are hypothetical taps. «словом и делом» (spec-mandated twist) and «Выбор зависит от цены, а не от слова.» lean toward claims about the person from 3 hypothetical items.
   - Keep the twist if the CEO wants it, but consider «словом и в ситуации» or soften the ХАМЕЛЕОН line.
5. **«ещё раз» / «ПОКАЗАТЬ ДРУГУ» are clickable while invisible during the reveal animation.**
   - `.after` is only `opacity:0`. Tapping «ещё раз» before the tier slams throws `TypeError` in `slam()`, because `$('tier')` is null after `startGame()` clears `#rev`.
   - The game keeps working, but it is a console error.
   - Repro: `?qa=1`, answer all 8, then click `#again` within about 1.5 s of the reveal. The console shows "Uncaught … at slam".
   - Fix: add `pointer-events:none` until `.on`, or guard the timers with a run token.
6. **The reveal headline block at 320×568 (ТРЕЩИНА / ДВОЙНОЕ ДНО / ХАМЕЛЕОН) pushes the title and the honesty line below the fold.**
   - The title's bottom is at 533–585 px and the honesty line at 581–633 px. The twist and the ledger take the top 260 px.
   - At 375×812 everything fits (honesty line at 552 px).
   - The headline, quote and receipt do fit at 320. This is acceptable, but tighten it if possible.

## NITS

- **Item order and side are randomized, but the screen types are not equal.** A word item has a centered, dim «ЧТО БЛИЖЕ?» and a scene has big text, so the "same look" claim in the build notes is only partly true. This is fine for play.
- **`→` (U+2192) and `≠` (U+2260)** are outside the Plex `unicode-range` and render in the fallback font: on the ledger, in the quote and in the comparison line. Barely visible.
- **The МОНОЛИТ quote «Быстрее всего: … (3,2 с)»**: the scene time includes reading time, so "fastest" mostly tracks the shortest scene. The same reading-length confound affects the "slowest scene = head" rule (the builder noted it).
- **Commas**: «Год жить, где хочешь» needs a comma.
- **The OG crack image** wraps «Один / раз.» as a widow line.
- **`lab/c/index.html`** lacks `og:image:width/height` (the r/ pages have them).
- **Friend comparison when the player is blank**: «У тебя — время быстрее.» reads oddly. For МОНОЛИТ vs МОНОЛИТ it says «У друга — МОНОЛИТ. У тебя — МОНОЛИТ.» rather than «то же».
- **Blank reveal**: the «ещё раз» button touches the line above it (no top margin).
- **Card**: it is generic (tier plus two words), while the strongest material, the quoted scene and the title, isn't on it. The line sizes differ because of fit-shrinking.
- **Titles use masculine-generic nouns** (БЕГЛЕЦ, КАРЬЕРИСТ, ОТШЕЛЬНИК). These are allowed by the contract (it bans adjectives and verbs), but worth a look.
- **Kit (not C's file):**
  - The share chain is share → clipboard → t.me. The QA checklist order is share → t.me → copy.
  - The t.me fallback is counted as `share_ok` before anything is actually sent.
  - «ПОПАЛ?» is a masculine past-tense verb, though it refers to the game.
- **Sim gate**: "any split" is 75.6% under the spec model (target 25–60%). The builder documented this as an inherent property of the spec's noise model, and I agree it can't be settled without humans.

## Verified OK

- **Tests**: 52/52 pass. My own 200k fuzz with 15% timeouts:
  - 0 `undefined`/NaN.
  - The quote is always from a valid pair, with the button verbatim.
  - The state always round-trips (same tier and head).
  - Item 1 is always a word, and a pair's word and scene are never adjacent.
  - All 5 outcomes occur, including ВРЕМЯ БЫСТРЕЕ (0.6%).
- **Real play**:
  - Random → ХАМЕЛЕОН; slow and consistent → МОНОЛИТ.
  - All timeouts → ВРЕМЯ БЫСТРЕЕ, with only «ещё раз», no share and no card.
  - The friend run → ДВОЙНОЕ ДНО with the comparison line.
  - No console errors in any normal run.
- **Layout**: no horizontal scroll at 320/375. Choice screens fit 320×568 (buttons end at 300–313 px). Buttons are 139×92 px or larger.
- **Timing**:
  - The 3 s word items are readable: 2 words plus «ЧТО БЛИЖЕ?».
  - The 7 s scenes (9–12 words, short buttons) are tight but fine for normal readers.
  - Item 1 is untimed by design.
- **Friend entry**:
  - The real share URL is `…/lab/c/r/crack/#ref=crack&s=113030`. The `r/` redirect preserves the fragment, and the top line «У ДРУГА: ТРЕЩИНА. А У ТЕБЯ?» shows with item 1 already on screen.
  - All of these fall back silently to a normal game: `#s=garbage`, `%ZZ`, `#ref` only, `#ref=crack`, `s=`, `1zz%`, `1xxxx-`, a head that is not a split, a wrong length, a duplicate `s`, and a trailing `%`.
  - A reload mid-game restarts cleanly at 1/8 and keeps the friend line.
  - Back, then forward (bfcache), resumes mid-item with the timer paused and continues normally.
- **Double tap**: the guard advanced exactly one item.
- **Visibility**: the bar froze at 88.1% while hidden for 4 s and then resumed.
- **Share**:
  - With `navigator.share`, it sends the correct first-person, gender-neutral text and the URL, with no link in the text.
  - With no `navigator.share`, it falls back to the clipboard and shows «Ссылка скопирована.».
  - AbortError shows no status and is not counted.
- **Card**: a 1080×1920 `<img>` with Cyrillic in Plex rendered correctly and the address inside the frame.
- **Counters**: with `?qa=1`, zero external requests. Without `qa`, only the abacus counters fire (I blocked them during testing).
- **Weight**: about 42 KB (index, game, lab.js, lab.css), excluding fonts.
- **OG**: 4 result pages plus the default. og:title, description and image are present, and every image exists at 1200×630.
- **Copy grep**: no «(а)», «думал», «на деле», or past-tense or gendered forms about the player in the C files.

## STRANGER NOTES

1. First screen: «НЕ ДУМАЙ / ЧТО БЛИЖЕ? / СВОИ ЛЮДИ | СВОБОДА». I get it in under 2 s and tap. The first timed item then springs a bar on me with no warning, but that's fine.
2. At item 3: "wait, this is the СВОИ ЛЮДИ question again". After that I watch for the echo in every scene. The trick is half-spoiled before the reveal.
3. The reveal ledger (СЛОВОМ | КОГДА ДОРОГО with ≠ in magenta) is the best moment, and the quoted scene with my button is specific and mine.
4. "Free paid year abroad → ЕДУ" doesn't feel like it contradicts "СВОИ ЛЮДИ"; it feels like a trick question. If my headline is that one, I'd shrug and press МИМО.
5. Would I send it? ТРЕЩИНА or ДВОЙНОЕ ДНО with a real split: yes, the share line «словом СВОБОДА, когда дорого — СВОИ ЛЮДИ» is a good tease. МОНОЛИТ: maybe, as a brag.
