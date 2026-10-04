# QA-EVAL-A: prototype A «ШАР»

Evaluator: QA-EVAL-A (independent, did not build). Date: 2026-10-04.
Under test: `product/site/lab/a/` (index.html, game.js, og.json, og/, r/), kit `lab.js`/`lab.css`, `product/test/lab-a.test.mjs`.
Method:
- I ran `node --test 'product/test/*.test.mjs'`: 52/52 pass.
- I served the site with `node operations/serve.mjs 8431`.
- I drove headless Chrome 154 over raw CDP (`Emulation.setDeviceMetricsOverride` with touch emulation, real touch events, not demo hooks) at 375×812 and 320×568. Every test run used `?qa=1`. For the one network check without `qa`, abacus was blocked with `Network.setBlockedURLs`, so no real counters were polluted.
- I looked at every screenshot by eye.

## VERDICT: PASS WITH FIXES

There are no blockers. The game is playable end to end with real taps, and every branch behaves:
- jump and drop;
- timeouts, including a game where every fused throw times out;
- the gust;
- friend guess ✓ and ✗;
- the friend reveal comparison;
- «ещё раз»;
- broken fragments, reload, back, tab hide/show;
- the whole share chain.

Nothing showed `undefined` or `NaN`, and there were no console errors during real play. The fixes below should land before or alongside the human test, but none of them stops it.

## BLOCKERS

None.

## SHOULD-FIX

1. **A headline the fuse decides is presented as the player's own.**
   - Repro: open `/lab/a/?qa=1`, tap any tile, then don't touch anything for about 20 s.
   - All six fused throws auto-drop. The twist appears, and after [ПРЫГАЮ Я] the reveal reads «В ШАРЕ ОСТАЛАСЬ: НЕДОПИСАННАЯ РУКОПИСЬ… ПРЫЖОК РАДИ: 📜». The kept item was chosen 100% by `Math.random`.
   - The builder's sim says throw 7 is auto in about 10% of games.
   - The headline is technically a fact, but «ПРЫЖОК РАДИ» an item the player never chose violates the spirit of "facts as facts".
   - Fix: when throw 7 (or ≥3 throws) was auto, add a small «шар выбрал сам: N из 7» line or soften the headline. Alternatively, never auto-drop below 2 remaining items: hold the last fuse and let the twist wait.
2. **Kept-item art on the drop card is wrong.**
   - Repro: finish with [ВЫКИДЫВАЮ] (or open `?qa=1&demo=reveal-drop`) and open the card image.
   - The thrown-away item is still drawn inside the basket, under «ДО ПОСЛЕДНЕГО В ШАРЕ:». The story says everything went overboard.
   - Fix: on a drop, draw the kept item falling, or draw an empty basket.
3. **The share button is far below the fold.**
   - At 375×812, [ПОКАЗАТЬ ДРУГУ] starts at about y=840. At 320×568 it is about 2.5 screens down, below the recog chips and the 62%-wide card.
   - This follows the spec's order, but it is the single biggest risk to the share rate.
   - Fix: consider a compact share button directly under the title box (in the kit's order, the recog stays where it is), or shrink the card preview.
4. **The choice screen overflows by 18 px.**
   - Repro: at 375×812 and at 320×568, `scrollHeight - innerHeight = 18`.
   - The cause is `#game { height: calc(100dvh - 20px) }` plus `main` padding of 10 + 28 px.
   - Nothing is cut off (the twist buttons end at 549/568), but the page rubber-bands and can scroll mid-game, against "choice screens fit without scrolling".
   - Fix: use `calc(100dvh - 38px)`, or zero the bottom padding while `#game` is visible.
5. **Role nouns in the title are masculine.** The titles are БЕГЛЕЦ, ДОМОСЕД, КАЗНАЧЕЙ, ЧЕМПИОН and so on. The spec allowed «ХРАНИТЕЛЬ», but «БЕГЛЕЦ»/«ДОМОСЕД» read clearly male to about half the players. Consider common-gender or neutral nouns, for example «ДУША БЕЗ ВИЗЫ», «СТОРОЖ…», «ВЕЧНЫЙ ДОМОСЕД», or abstract nouns like «ПОБЕГ БЕЗ АДРЕСА».
6. **A friend can re-guess after a reload.** Repro: arrive via `#s=5j`, guess wrong, reload. The guess screen comes back and the answer is now known, so a second `guess_ok` is counted in a new page load. This pollutes the `guess_ok/guess_no` metric slightly. Fix: remember in `sessionStorage` that this `s` was already guessed and skip straight to «ТЕПЕРЬ ТВОЙ ШАР».

## NITS

- The «ВЫКИНУТО ВСЁ. ПОСЛЕДНИМ: ДЕНЬГИ НА ГОД / КЛЮЧИ / РУКОПИСЬ» headline has no case agreement («последними/последней»). It is acceptable as a colon label, but the builder already agrees «ОСТАЛСЯ/ОСТАЛАСЬ», so the drop line could use the same `g` table.
- «ОСТАЛСЯ ОДИН.» on the twist can be read as «ты остался один» (masculine, about the player). An alternative is «ОСТАЛАСЬ ОДНА ВЕЩЬ.»
- The receipt «(за 1,3 с)» wraps as «(за / 1,3 с)» at 320 px. Put an NBSP after «за».
- At 375 px the «НЕОТПРАВЛЕННОЕ» tile label touches the tile's right border (scrollWidth > clientWidth by a pixel or two). It is still readable, but tighten the padding or letter-spacing.
- **Card:**
  - The address line spans x=152–927 of 1080. That is slightly outside the central 70% horizontally (162–918). Drop the size from 38 to 36 px.
  - The decorative streaks pass through the big text on the card («ПОСЛЕДНЕГО», «С МОИМ»). Skip the streaks in the text band.
- **Leaked clock.** `reset()` creates a new `LAB.timer(600000)` clock without stopping the previous one, so on the friend path one 10-minute rAF clock leaks. It is harmless, but call `if (clock) clock.stop()` in `reset`.
- **Rapid multi-taps record `ms: 0`.** Taps on different tiles within the 280 ms gap before the fuse starts record `ms: 0`. They are never quoted, but they pull the hesitation median down. Count from the previous throw instead of from the fuse start.
- **The redirect drops `?qa=1`.** `r/<code>/?qa=1#…` redirects to `../../#…` and loses `?qa=1`, so QA of the real share path fires counters. Append `location.search` in the redirect.
- **OG preview on a drop.** The OG page always says «В ШАРЕ ОСТАЛСЯ: X» even when the sender threw X overboard (a documented simplification). The friend's guess screen then shows the truth. This is fine, just know it.
- **Kit-level (not A's fault, logged for the kit owner):**
  - The chain order is share → clipboard → Telegram, while review-qa item 6 says share → t.me → copy.
  - The `tg` fallback counts `share_ok` before anything is shared.
  - «ПОПАЛ?» is a past-tense masculine form; it refers to the game, but a reader may take it as being about themselves.
- **Demo hooks are noisy.** `?demo=` states log «Blocked call to navigator.vibrate» errors because there is no user gesture. Real play has no console errors.

## Verified OK

- **Tests:** 52/52 pass. The sim gate is in the build notes: under the preference model no kept item is above 16.9% (target ≤ 30%). With cat ×3 it reaches 33.9% (stress only).
- **First screen:**
  - 4 instruction words plus 8 tile labels, no button, no field, no sound before the tap.
  - The first tap is throw 1 and `start`.
  - Tiles are 164×72 at 375 px and 136×56 at 320 px, all at least 44 px.
  - No horizontal scroll at either size.
- **Gust:** at throw 4. The banner, shake and 0.9 s tap lock work, then a 2 s fuse.
- **Timeout:** «ШАР НЕ ЖДЁТ» drops a random item, which is never quoted. In the `reveal-drop` demo the auto-throw at position 5 is absent from the receipts. In the all-auto game the reveal has only «Первым за борт».
- **Visibility:** `LAB.timer` pauses correctly. The fuse was frozen at 0.822 through 6 s hidden, then resumed. There was no auto-throw while hidden. The scene loop also stops while hidden.
- **Double taps:** 8 rapid taps produce exactly 3 throws, then the gust lock. A double tap on [ПРЫГАЮ Я] and [ВЫКИДЫВАЮ] produces one outcome (the `phase` guard). During the guess, the tiles are disabled after the first tap.
- **Friend entry from a real share URL:**
  - URL built exactly as the kit does it: `/lab/a/r/cat/#ref=cat&s=5j`.
  - `location.replace` keeps the fragment, so the guess screen shows immediately.
  - Guess ✓/✗ and «и прыжок за борт ради него/неё/них» agree with the item.
  - After 1.7 s comes «ТЕПЕРЬ ТВОЙ ШАР…».
  - The reveal adds «У друга остался: КОТ. У тебя: КУБОК.»
  - «ещё раз» clears the friend.
- **Broken fragments:** `#s=garbage`, `%ZZ`, `#ref`, `#ref=cat`, `9j`, `5J`, `5j%00` and an empty `s` all show the normal first screen silently. A mangled pair next to a valid `s` still works.
- **Back:** the redirect uses `location.replace`, so back from the game returns to the previous page. There is no redirect loop.
- **Reload:** a reload mid-game restarts cleanly. There is no blank or stuck state.
- **Share chain:**
  - `navigator.share` OK shows «Отправлено.», with text and URL passed separately.
  - AbortError shows no status, no copy and no count.
  - NotAllowedError, or a missing `navigator.share`, copies text + URL and shows «Ссылка скопирована».
  - If the clipboard fails too, the page goes to `t.me/share/url`.
- **Share text:** «В моём шаре остался ЧУЖОЙ КОТ, а за борт прыгаю я. А что останется в твоём?» It is first person, present tense, ends with a question and has no link in the text.
- **Card:**
  - The `<img>` is 1080×1920 with Cyrillic in Plex (all four faces `loaded` before drawing).
  - It has 3 lines plus the brand, and the hint «удерживай картинку, чтобы сохранить».
- **Network and weight:**
  - With `?qa=1`: zero external requests (the only non-localhost entry is the card's data: URL).
  - Without `qa`: only `abacus.jasoncameron.dev` (`a_view`, `a_ref_view`, `a_start`, `a_ref_start`, `a_guess_ok`).
  - Total transfer is 81.6 KB including fonts; index + game.js is about 36 KB, well under 150 KB.
- **Copy grep:** no «(а)», no past-tense verbs about the player, and no gendered adjectives about the player. Verb agreement with items (остался/осталась/осталось/остались, держался…) is correct in every case I saw.
- **Privacy:** the share state is two characters (`5j`, the kept index plus jump/drop). Nothing personal is in the URL.
- **OG:**
  - There are 8 `r/<code>/index.html` pages plus the default.
  - `og:title`/`og:description`/`og:image` are correct, and the image paths exist in `og/` at 1200×630.
  - The Cyrillic renders.
  - The redirect keeps the fragment.
  - Missing `og:url` is harmless.
- **Not verified (needs real devices, review-qa items 1 and 8):** Telegram and Instagram webviews, iOS sound and vibration, the emoji font on the card on Android, and the OG preview in a real Telegram chat.

## STRANGER NOTES

- **Comprehension:** «ШАР ПАДАЕТ. ВЫКИДЫВАЙ ЛИШНЕЕ.» plus a basket of 8 big tiles is understood in under 3 s, and it is obvious that you tap a tile. There is one moment of doubt: the basket grid sits under the green ground strip, apart from the balloon's tiny basket, so "is this the basket?" takes a beat.
- **Hesitation points:**
  - The 4 s fuse on throw 2 surprises people; they don't know a timer exists until it hits.
  - «ВЫКИДЫВАЮ / ПРЫГАЮ Я» needs a second's read, which is a good dilemma.
  - After the gust some taps land on the 0.9 s lock and feel dead.
- **Fun:** the pacing is real. The gust, the rising ground and the counter falling to about 165 m make the last two throws tense, and the jump-or-drop twist is the best moment.
- **Reveal:** it is specific (your kept item, what went first, what almost stayed) but not surprising. It mirrors what you just did, plus a playful title («ХРАНИТЕЛЬ БЕЗ ВИЗЫ» lands, «ДОМОСЕД БЕЗ ЧЕРНОВИКОВ» is a shrug). The "huh" factor comes from the title and «Почти осталась».
- **Share impulse:** moderate for a solo player. It is strong for the friend loop, because «У ДРУГА В ШАРЕ ОСТАЛОСЬ ОДНО. УГАДАЕШЬ?» is a great hook, and I would send it to get exactly that guess. The share button needs to be closer to the headline to cash it in.
