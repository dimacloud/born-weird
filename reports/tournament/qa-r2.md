# QA-EVAL-R2: A ШАР, round 2 reveal (v1 «СМЫСЛ» / v2 «КОМПАС»)

Evaluator: QA-EVAL-R2 (independent, no product code touched). Date: 2026-10-04.
Inputs: DECISION #020, `ROUND2_A_REVEAL.md`, `build-a.md` (round 2 section), code in `product/site/lab/a/`, kit `lab.js`, hub `lab/index.html`.
Method: `node operations/serve.mjs 8451` + headless Chrome 154 over raw CDP (`Emulation.setDeviceMetricsOverride` 375×812 and 320×568, real `Input.dispatchMouseEvent` taps), always `?qa=1` (zero external requests observed in every run). Reveal texts generated in Node from `game.js` (12 per variant, seeded random orders, jump/drop alternating, v2 split 6 contradiction / 6 none) plus an exhaustive sweep of all 40 320 throw orders × jump/drop.

## VERDICT: **GO WITH FIXES**

The Founder's complaint is answered: every reveal now says, in plain words, what you hold on to and what you let go of. Nothing is broken. It may go to the Founder now. Before real strangers, apply the copy fixes S1–S5 (copy-only, under an hour). Without them, roughly 1 reveal in 4 contains a line that makes a stranger pause.

## BLOCKERS

None.

- Full play, timeouts, honest auto branch, friend entry via a real share URL, broken fragments, cards, and the hub all work.
- No console errors, `undefined` or `NaN` anywhere.

## SHOULD-FIX (proposed copy verbatim)

| # | Where | Now | Proposed | Why |
|---|---|---|---|---|
| S1 | `DROP_LINE` (v1, drop) | «Ради себя можно отпустить и это.» | **«Но себя ты бережёшь ещё больше.»** | Now it reads like advice or permission («можно»), not a statement about you. It is the most puzzling line in the build and appears on every v1 drop. |
| S2 | cup `hold` / `holdMe` | «то, что тебя замечают» / «то, что меня замечают» | **«своё имя»** (both) | «Держишься за то, что тебя замечают» is clumsy Russian. «Ты держишься за своё имя» is short, plain, and ties back to «кубок с твоим именем». The contradiction line stays as is. |
| S3 | manuscript `hold` | «своё большое недоделанное дело» | **«свою большую мечту»** | It's three heavy words, and «дело» makes it read like paperwork. The new phrase matches v2's МЕЧТА. |
| S4 | letter `hold` and `drop` | «то, что так и не сказано» | **«несказанное»** (both, as the spec had) | It's half the length, and the longest reveal drops from 183 to about 165 characters. «Держишься за то, что так и не сказано» makes readers stop and parse. |
| S5 | keys `drop` | «привычное место» | **«насиженное место»** | «Отпускаешь привычное место» is not idiomatic. «Насиженное место» is the natural collocation. |
| S6 | v2 value word for cat | «ДОЛГ» | **«ЗАБОТА»** (pair head becomes «ПРИЗНАНИЕ × ЗАБОТА») | In a bare chain («ДОЛГ > ДОМ > СВОБОДА»), «долг» reads as *debt* first. That makes the share text «Мой компас: ДОЛГ > …» misleading. |
| S7 | v2 label | «ТВОЙ КОМПАС» | **«ТВОЙ КОМПАС — ЧТО ТЕБЕ ВАЖНЕЕ:»** | «>» is never explained, and a stranger may read the chain as a sequence rather than a ranking. Four words fix that without explaining *how* it was computed. |
| S8 | Friend "sees sender's variant first" | The v2 sender's compass shows as a small line for 1.7 s on the guess result, then the screen resets. A v1 sender's meaning is never shown to the friend. | Hold the guess result until a tap («ТЕПЕРЬ ТЫ →») or for ≥3 s. For v1 senders, show «У друга: 🔑 КЛЮЧИ — держится за своё место». The state already carries the kept item, so no state change is needed. | This conforms to the letter of the spec but barely; the friend can't actually read it. Needs a CEO call on intent. |
| S9 | Typography | «… своё место. А / легче …» and «… МЕЧТА / > ДОМ» orphan at line ends (seen at 375 and 320) | NBSP after «А», and NBSP before « >» in the compass join | It looks unfinished on the most-read lines. |

**Nits (no action needed for the Founder test):**
- The drop card's falling emoji touches the left of «ВЫКИНУТО ВСЁ…».
- When both sides are v2, the friend compare line replaces «У друга остались: КЛЮЧИ. У тебя: КУБОК.» with the compass only, so the item comparison is lost.
- OG previews show the item («В ШАРЕ ОСТАЛИСЬ: КЛЮЧИ ОТ ДОМА») while the v2 share text shows the compass. They don't conflict, but they don't match either.
- `navigator.vibrate` "blocked" console warnings appear only with synthetic taps before user activation. They don't occur with real taps.

**Builder-flagged issues, judged:**
- **Identical «держишься/отпускаешь» phrase for ДЕНЬГИ and ПИСЬМО: does not hurt.**
  - The kept item is never the first-thrown one, so one reveal can never show the same phrase twice.
  - A reader only notices across two different people's reveals, where it reads as consistent.
  - The money phrase works well both ways («легче всего отпускаешь запас на чёрный день» earns a nod).
  - The letter phrase is the weaker one, and that is an S4 issue, not a duplication issue.
- **Compass shows the never-chosen kept item first: does not hurt.**
  - «ПРЫЖОК РАДИ: ключи» directly under the chain makes #1 read as "what you saved", which is intuitive.
  - The real soft spot is positions 2–4. They are the 7th, 6th and 5th throws, all made post-gust on a 1.7–2 s fuse, so the "value order" beyond #1 is mostly panic.
  - Strangers won't see this, but it makes the chain feel arbitrary to anyone who remembers their throws. Watch `v2_rec_kinda`/`no` and the «порядок» chip.

## Spec conformance

| Requirement | Result |
|---|---|
| No nickname, no honesty line | PASS. No «НЯНЬКА…» or «вычислено» in any reveal, card or exhaustive text sweep. |
| One-screen reveal, share button visible, 375×812 | PASS. Share bottom: v1 261 (friend 291–322), v2 282 / 383–403 (contra) / 452 (contra + friend compass). |
| Same, 320×568 | PASS. v1 252–325; v2 286 / 405–424 / worst case 458 of 568 (v2 + longest contradiction + friend compass). No horizontal scroll (scrollWidth = viewport). |
| v2 contradiction only for observed opposite pairs | PASS. Exhaustive 80 640 reveals: contradiction fires iff an opposite pair is in the top 3 (0 mismatches). Rate 42.9%, inside the 25–60% gate. No fake contradiction on the other 57%. |
| v1 meaning-sentence gate ≤15% | PASS per builder sim (max 5.6% under the stress model). 56/56 sentences are reachable. |
| Share text per variant | PASS. v1: «В моём шаре остались КЛЮЧИ ОТ ДОМА. А что спасёшь ты?» (drop: «…до последнего держались…»). v2: «Мой компас: ДОМ > СВОБОДА > ДОЛГ. А твой?». The cup becomes «С МОИМ ИМЕНЕМ» in shares. |
| Variant carried in share state | PASS. `4d1` (v1), `4j235` (v2 + next two compass items). Round-trips match `compass()` top 3 exhaustively. Round-1 `5j` still decodes. |
| Friend sees sender's variant, then own 50/50 | PASS (weak, see S8). Without `?v` the friend's tab is assigned its own variant (stored in `bw_lab_a_v`). `?v=1/2` on a friend link forces it. |
| `?v=1|2` forces; junk falls back | PASS. `v=3` and `v=` fall back to random assignment. |
| Card: v1 = headline + item + first-person sentence; v2 = order + contradiction, else meaning | PASS. Cyrillic, «×» and «»» render correctly (checked 4 decoded card PNGs). The first-person card copy («Держусь… отпускаю», «хочу… боюсь») is gender-neutral. |
| Analytics `v1_/v2_` view/done/share_ok/rec_*, `contra_shown/none` | PASS by code review. Not fired, because `?qa=1` was on throughout and 0 external requests were seen. |

## Regression

- **Tests:** `node --test 'product/test/*.test.mjs'` gives **56/56 pass**.
- **Full real-tap plays at 375×812, v1 and v2:** throw, gust, twist, jump/drop, reveal, share (clipboard path, «Ссылка скопирована — вставь в чат.»).
- **Idle play** (only throw 1 tapped, all fuses run out) correctly gives «ШАР РЕШИЛ ЗА ТЕБЯ: 📱 ТЕЛЕФОН СО ВСЕМИ ФОТО / Без тебя за борт: 6 из 7 / Это выбор шара, не твой. Ещё раз — быстрее?». It has no share, card or recog, and its button is «ЕЩЁ РАЗ — БЫСТРЕЕ».
- **Friend entry via the actual copied share URL** (rewritten to localhost) through `r/keys/` (both senders, all 3 friend variant modes):
  - The redirect keeps `?qa=1` and the fragment.
  - The guess screen shows «✗ МИМО. У ДРУГА: 🔑 КЛЮЧИ и прыжок за борт ради них / компас друга: ДОМ > СВОБОДА > ДОЛГ», then «ТЕПЕРЬ ТВОЙ ШАР».
  - The friend's own reveal has the correct compare line, and the friend's share produces a new valid state.
- **Broken fragments:** `%7Bzz`, `9j`, `4j2`, `4j244` (duplicate), `4j1x`, `%ZZ`, `44j`, `4j3`, `4d2` all show the normal first screen with 0 errors.
- **Text sweep** of all 80 640 reveals: no `undefined`/`NaN`/`null`/«(а)».
- **OG:** all 8 `r/*/` pages and `index.html` point to existing `*-2.png`, which render Cyrillic.
- **Hub:** random order, numbers only («ФИНАЛ X» = `a/?v=1`, «ФИНАЛ Y» = `a/?v=2`).
  - `?f=1` and `?qa=1` propagate (`a/?v=2&f=1&qa=1`).
  - The founder flag persists in the tab after navigation.
- **Console:** clean in every run, apart from the synthetic-tap vibrate/audio autoplay warnings.

## Meaning test (stranger's read, Russian)

Legend: **N** = nod (instantly clear, feels true-ish), **~** = clear but flat or Barnum, **?** = puzzles.

### v1 «СМЫСЛ»

| # | Kept / twist | Sentence (+ extra line) | Read |
|---|---|---|---|
| 1 | КЛЮЧИ, jump | Ты держишься за своё место. А легче всего отпускаешь чужую похвалу. / Ради этого не жалко и себя. | N |
| 2 | КОТ, drop | Ты держишься за тех, кто на тебя рассчитывает. А легче всего отпускаешь запас на чёрный день. / Ради себя можно отпустить и это. | N + **?** (extra) |
| 3 | ПИСЬМО, jump | Ты держишься за то, что так и не сказано. А легче всего отпускаешь чужие ожидания. | ? / N (2nd half strong) |
| 4 | РУКОПИСЬ, drop | Ты держишься за своё большое недоделанное дело. А легче всего отпускаешь прошлое. / Ради себя можно отпустить и это. | ~ / ? |
| 5 | ПАСПОРТ, jump | Ты держишься за возможность в любой момент уехать. А легче всего отпускаешь мечту «на потом». | N |
| 6 | ТЕЛЕФОН, drop | Ты держишься за своё прошлое. А легче всего отпускаешь то, что так и не сказано. | ~ / ? |
| 7 | ПИСЬМО, jump | Ты держишься за то, что так и не сказано. А легче всего отпускаешь чужую похвалу. | ? |
| 8 | КУБОК, drop | Ты держишься за то, что тебя замечают. А легче всего отпускаешь привычное место. | ? (both halves clumsy) |
| 9 | КУБОК, jump | Ты держишься за то, что тебя замечают. А легче всего отпускаешь мечту «на потом». / Ради этого не жалко и себя. | ~ (funny: jump for a trophy) |
| 10 | ДЕНЬГИ, drop | Ты держишься за запас на чёрный день. А легче всего отпускаешь привычное место. | N / ~ |
| 11 | ПАСПОРТ, jump | Ты держишься за возможность в любой момент уехать. А легче всего отпускаешь то, что так и не сказано. | N / ? |
| 12 | КЛЮЧИ, drop | Ты держишься за своё место. А легче всего отпускаешь прошлое. | N |

**v1 score:** 6 nods, 2 flat, 4 puzzles. Every puzzle comes from S1/S2/S4/S5 phrasing, not from the idea. The structure ("hold X, drop Y", from what you actually did) works and is gender-neutral throughout.

**Worst 3:**
1. «Ради себя можно отпустить и это.» (sounds like permission or advice; on every drop).
2. «Ты держишься за то, что тебя замечают.» (clumsy).
3. «А легче всего отпускаешь привычное место.» (not idiomatic).

**Best 3:**
1. «А легче всего отпускаешь чужие ожидания.»
2. «Ты держишься за возможность в любой момент уехать.»
3. «Ради этого не жалко и себя.» (on the jump; lands, and it's funny on ДЕНЬГИ or КУБОК).

### v2 «КОМПАС»

| # | Compass (top 4) / twist | Contradiction | Read |
|---|---|---|---|
| 1 | ПРИЗНАНИЕ > ЧУВСТВА > МЕЧТА > ПАМЯТЬ, jump | — | ~ (the chain is abstract; the sentence carries it) |
| 2 | ПАМЯТЬ > ДОМ > МЕЧТА > СВОБОДА, drop | — | N (coherent "rooted" profile) |
| 3 | ДОЛГ > ДОМ > МЕЧТА > СВОБОДА, jump | — | ? (ДОЛГ = debt?) |
| 4 | ДОМ > МЕЧТА > БЕЗОПАСНОСТЬ > ЧУВСТВА, drop | МЕЧТА × БЕЗОПАСНОСТЬ: «тянет к большой мечте — но без запаса страшно.» | **N** (strong) |
| 5 | СВОБОДА > БЕЗОПАСНОСТЬ > ПАМЯТЬ > МЕЧТА, jump | — | ~ |
| 6 | СВОБОДА > ЧУВСТВА > БЕЗОПАСНОСТЬ > ПАМЯТЬ, drop | — | ~ |
| 7 | ПРИЗНАНИЕ > ЧУВСТВА > МЕЧТА > ДОЛГ, jump | — | ~ / ? (ДОЛГ) |
| 8 | ПРИЗНАНИЕ > БЕЗОПАСНОСТЬ > ДОЛГ > ПАМЯТЬ, drop | ПРИЗНАНИЕ × ДОЛГ: «хочешь, чтобы тебя заметили, — и не можешь подвести тех, кто на тебя рассчитывает.» | N (long but true-feeling) |
| 9 | СВОБОДА > ДОМ > ПРИЗНАНИЕ > БЕЗОПАСНОСТЬ, jump | СВОБОДА × ДОМ: «хочешь уехать — и боишься потерять своё место.» | **N** (best line in the build) |
| 10 | ЧУВСТВА > БЕЗОПАСНОСТЬ > ПАМЯТЬ > ДОМ, drop | ПАМЯТЬ × ЧУВСТВА: «бережёшь всё, как было, — и носишь в себе то, что так и не сказано.» | ~ (doesn't read as an opposition) |
| 11 | ЧУВСТВА > БЕЗОПАСНОСТЬ > МЕЧТА > ДОЛГ, jump | МЕЧТА × БЕЗОПАСНОСТЬ | N |
| 12 | СВОБОДА > ДОМ > ЧУВСТВА > ДОЛГ, drop | СВОБОДА × ДОМ | N |

**v2 score:** 6 nods (5 of them where a contradiction fired), 5 flat, 1 puzzle.

- With a contradiction (43%), v2 gives the strongest "that's weirdly me" moment in the build.
- Without one, the reveal is an abstract chain plus the same v1 sentence (without the jump/drop line), so it's flatter than v1.
- The chain of value nouns leans Barnum («ПРИЗНАНИЕ > ЧУВСТВА > МЕЧТА» could be anyone).

**Worst 3:**
1. «ДОЛГ > ДОМ > МЕЧТА…» (ДОЛГ reads as debt, S6).
2. «ПРОТИВОРЕЧИЕ: ПАМЯТЬ × ЧУВСТВА — бережёшь всё, как было, — и носишь в себе то, что так и не сказано» (not an opposition; double dash, long).
3. «ТВОЙ КОМПАС» with an unexplained «>» (S7).

**Best 3:**
1. «Хочешь уехать — и боишься потерять своё место.»
2. «Тянет к большой мечте — но без запаса страшно.»
3. «Хочешь, чтобы тебя заметили, — и не можешь подвести тех, кто на тебя рассчитывает.»

**Gender and Barnum check, both variants:**
- No gendered forms about the player anywhere: «держишься / отпускаешь / хочешь / боишься», and first-person «держусь / хочу / боюсь».
- Item-agreeing verbs are correct («ПОСЛЕДНИМИ: КЛЮЧИ», «держалась РУКОПИСЬ»).
- The v1 sentences are specific because both halves come from the player's own acts.
- v2's value chain is the most Barnum element. Its contradiction is the least Barnum, because it names a real tension in what the player kept.

## Which variant a stranger would more likely send

**v1.** «В моём шаре остался ЧУЖОЙ КОТ. А что спасёшь ты?» is concrete, funny and readable in a chat without context. «Мой компас: ДОЛГ > ДОМ > СВОБОДА. А твой?» reads like a horoscope to someone who hasn't played.

v2 wins on self-recognition when a contradiction fires, so the stronger long-term product may be v1's share text plus v2's contradiction line. Low confidence: settle it with `v1_share_ok/v1_done` vs `v2_share_ok/v2_done`.
