# QA v0.5 "Value Compass": independent evaluation (QA-EVAL-001)

Date: 2026-10-03. Build checked: `engine.js` / `index.html` / `ru/index.html` as of 23:30:43. These files changed while QA was running: an RU copy pass landed at about 23:30. Every finding below was re-checked against that version.

**Verdict: PASS WITH FIXES.** Privacy, key handling, flow mechanics and card layout are solid. The result texts are not. Within one result they often contradict each other, and that is exactly the "pretty but empty" risk. Fix D1–D4 before deploy. D5 and later can follow.

## Method
- Unit tests: `node --test 'product/test/*.test.mjs'` gives 23/23 pass, before and after the RU edit.
- Engine simulation:
  - 100k random plays (EN and RU, 9 dates);
  - 50k "realistic" plays: latent utilities plus noise, with shadow answers consistent with those utilities.
  - Each play checks the result rules: stars, contradiction, protect/easy, hidden/fragile, confidence and key round-trip.
- Key fuzzing: 300k random 25-char keys, 20k 30-char (v0.4-length) keys, and garbage inputs.
- Browser (localhost:8417, `?qa=1&fast=1`):
  - full EN and RU runs, including undo, the price-round order and the Next labels;
  - garbage and valid `?k=` landings;
  - 375 px width, both languages;
  - card renderer measured with the real fonts on 4,000 results, plus 38 RU "near" cards rendered.

## Defects (ranked)

### D1 — HIGH: "Never give up X" and "X is fragile" in the same result
- **Where:** `engine.js:598` (protect) and `engine.js:613-617` (fragile). The texts are at `:185` and `:340`.
- **What happens:** `fragile` is any top-3 leader the player answered NO to in the shadow round. Nothing checks it against `protect` or against the price round. As a result, the fragile text ("leads while it is free / once it had a price, no") is shown for a value the player *protected* in the PRICE round.
- **How often:**
  - random play: fragile in 47%; fragile equals "YOU WOULD NEVER GIVE UP" in 19k/100k; the fragile value was picked "never pay" in round II in 32k/100k;
  - realistic play: fragile equals protect in 2.2% of results, about 1 in 4 fragile results.
- **Repro:** `?k=26P75-DAZVT-P0NAG-348H2-4D9R1` (EN). It shows "NEVER GIVE UP: NOVELTY", "Almost all your choices point one way: NOVELTY" and "NOVELTY leads while it is free… the answer was no" together.
- **Live RU run** (born 1977-11-29) showed four of these at once: «Ясный курс: МИР», «НИ ЗА ЧТО НЕ ОТДАШЬ: МИР», «МИР — в лидерах, пока это бесплатно… “нет”», «Пока не ясно, что важнее: МИР или БЛИЗКИЕ».
- **Fix:**
  - Only mark a value fragile if it was never picked "never pay" in round II (`sc.pricePlus[v] === 0`).
  - Otherwise reword it as an honest conflict: "You protected X in PRICE but said no to it in SHADOW: it depends on the price."
  - Never show it for the value used by `clear`, or soften the clear text in that case.

### D2 — HIGH: "Clear direction" overclaims when nothing is clear
- **Where:** `engine.js:620` and `:637-640`.
- **What happens:** `clear` is the fallback whenever no opposite or near pair has net ≥1. Its text then says "Almost all your choices point one way: X", even when:
  - the top value's net is 0 (970/100k random plays): all eight are between −1 and 0;
  - the top value's net is 1 (11k/100k);
  - X is tied with #2.
- **Repro:** `?k=27CMT-1CBTN-ARNJJ-EG8H2-4D84T`. The nets are INFLUENCE 0, ROOTS 0, PEOPLE 0, NOVELTY 0, SUCCESS 0, FREEDOM −1, SECURITY −1, WORLD −1, but the result says INFLUENCE "drives you".
- **Fix:**
  - Use `clear` only when `net[top] >= 2 && net[top] > net[second]`.
  - Otherwise add a fourth kind, `flat`: "No single direction yet: your choices are spread out. Take it again in a week." Give it a neutral quest.

### D3 — HIGH: Stars "miss" text claims votes that did not happen
- **Where:** `engine.js:610`. The texts are at `:181` and `:336`.
- **What happens:** `n` counts positive signals for the top value, and that can be 0. RU also says «чаще всего», which is false in about 8% of misses: another value got more "open/never pay/take it" picks than the top value.
- **Repro:** the D2 key gives "Your choices voted for INFLUENCE 0 times out of 9" (48/100k random plays).
- **Also:** "out of 9" overstates the chances. Any one value can collect at most 4 votes (3 appearances plus 1 shadow).
- **Fix:**
  - Phrase it by rank instead: "The stars expected a rebel. Your compass is led by X." Give the count only when n ≥ 2, as "n of its 4 chances".
  - Drop «чаще всего», or compute the value with the most votes.

### D4 — MEDIUM-HIGH: Stars verdict and "drives" depend on a hidden tie-break
- **Where:** `engine.js:604` and `:657`.
- **What happens:**
  - Ranks 3 and 4 are tied in 41% of realistic plays.
  - In 18% of realistic plays, the stars verdict (MATCH / HALF / AWKWARD) depends on that tie. The tie-break is minus count, then plus count, then seeded jitter.
  - "Drives you" lists a value with net ≤0 in 49% of random plays. It can even list a negative one: "MATCH… FREEDOM and SECURITY are both in your top three" with SECURITY at −1.
  - The stars "half" text says "only #4 for you" for a value tied with #3.
- **Fix:**
  - Count a star as a hit when `net[star] >= net[rank[2]] && net[star] >= 1`.
  - Limit "drives" to values with net ≥1, and show 1–3 of them.

### D5 — MEDIUM: Contradiction can skip the top value and use weak values
- **Where:** `engine.js:620-631`.
- **What happens:**
  - `strong` is every value with net ≥1, which can include ranks 4–5. About 5.9k/100k pairs include a value ranked 4th or lower.
  - In realistic play, an opposite or near pair is found 86% of the time. The "main contradiction" therefore almost always fires, which reads as Barnum-like.
- **Fix:** pick pairs from the top 3 only, and require one of the two to have net ≥2.

### D6 — MEDIUM: The shadow round doesn't explain the stars check
- **Where:** `index.html:645`, intro text at `engine.js:83` / `:238`.
- **What happens:** All three shadow screens say "Testing your leaders". The third is often the *stars'* value, which the player may have rejected twice already. The item has a `hiddenCheck` flag, but the UI never uses it. On a live RU run, the player got a NOVELTY statement after ranking NOVELTY 6th, with no explanation.
- **Fix:** when `it.hiddenCheck`, set the intro or title to "The stars insist: one more chance for X?" (RU: «Звёзды настаивают: ещё один шанс для X?»).

### D7 — MEDIUM: The key-landing banner speaks to the wrong person
- **Where:** `index.html:561`, using `keyRef`.
- **What happens:** The banner shows the friend's `stars.text` word for word, so the visitor reads "…only #6 **for you**" or «**твои** выборы…» about someone else's result.
- **Fix:** use a third-person line for the banner, e.g. "The stars expected X + Y. Their choices said A · B · C — HALF RIGHT."

### D8 — LOW-MEDIUM: Contradiction text on the card is unreadable on a phone
- **Where:** `index.html:993-995`.
- **What happens:** RU "near" texts always drop to the minimum size (Plex about 18 px on a 1080-wide card, about 6 px when viewed on a phone). No text was truncated in 4,000 results and there was no footer overflow, but most of the card is spent on a long first sentence that nobody can read.
- **Fix:** put a short one-liner on the card (for example, the `near.short` text plus "pull in different directions") and leave the full text on the page.

### D9 — LOW: Small copy and UI issues
- The stars word is repeated: "AWKWARD. The stars expected… Awkward." (`index.html:768` plus the text's ending). Drop the trailing word from `stars.*`.
- `fragile` in EN ("leads while it is free") is wrong whenever D1 applies. Covered by D1.
- RU «голосовали за СВОБОДА / НОВИЗНА / НАДЁЖНОСТЬ» uses the nominative after «за». Rephrase as «…за ценность СВОБОДА» or «лидер выборов — СВОБОДА».
- "NOT SURE" in the shadow round is styled green, like "take it" (`index.html:684`). Use a neutral cyan style.
- The persona names only the life-path value ("expected a rebel"). The element value is never named in the stars text.
- Keys don't accept the common look-alike letters (O for 0, I/L for 1). Matters only if keys are ever typed by hand.
- An old v0.4 key or an invalid `?k=` is silently ignored. That is graceful, but the visitor gets no "this link is from an older version" message.
- RU archetype titles (ВОЛЬНЫЙ СТРАННИК, …) and personas (бунтаря, лидера) are grammatically masculine. This is a known style choice, flagged for the RU editor only.

## Passed
- **Privacy:**
  - Card, share text (EN and RU), key, passport, JSON profile, AI prompts and analytics event names depend on the birth date only through life path (1–9) and element (4).
  - The existing deep-equality test plus code review confirm it. The run seed comes from `Math.random` only.
  - Retake date, weeks, age, zodiac sign, milestone and world-at-birth stay on the private screens. `?k=` has no date.
- **Key:**
  - Round-trip gives an identical result (checked every 50th of 100k plays) and works across languages.
  - Random 25-char keys: 0 of 300k accepted. 30-char (v0.4) keys: 0 accepted. `null`, `{}` and numbers return `null`. Nothing throws.
  - Garbage `?k=` gives no banner and no errors. A valid friend key shows the banner and card in RU.
- **Flow:**
  - INSTINCT asks for "open" first. PRICE asks "easily" first, then "never". The hints update correctly.
  - Undo works (tap the same option again) and restores the hint.
  - Next labels are NEXT → / ROUND III: SHADOW → / SHOW MY COMPASS → (and the RU equivalents).
  - Re-entry is guarded. Restart works.
- **Layout:** 375 px wide in EN and RU with no horizontal scroll on the birth, item and result screens. Card labels (THE WORLD, MY PEOPLE, НАДЁЖНОСТЬ, ★ marks) fit, and no block truncates.
- **RU build:** `ru/index.html` is back in sync with `index.html`. Before the 23:30 rebuild it had a stale `.stars .v small` CSS line, so `build-ru` must keep running before deploy. Consider a test that compares the two files once meta/base lines are stripped.
- **RU gender:** the earlier «решать самому» and «решение сам» are fixed in the current build. The automated test doesn't catch сам/самому, so add them to the banned list in `engine.test.mjs`.

## Suggested regression tests
1. `fragile !== protect`, and `fragile` is never a value with `pricePlus > 0`.
2. `clear` ⇒ `net[top] >= 2 && net[top] > net[second]`.
3. The stars text never says "0 time(s)" / «0 раз».
4. The contradiction pair ⊆ the top 3.
5. Every value in "drives" has `net >= 1`.
6. A stars hit is decided by net value, not by tie-break.
