# Growth review of C1–C9 (GROWTH-REVIEW-002, 2026-10-04)

Independent reviewer; I wrote none of the concepts. Audience: Russian-speaking, Telegram chats and Instagram stories, static hosting. Scores 1–5: SHARE (would I send it unprompted, to whom), CURIOSITY ("what would mine be?" from the artifact alone), ENTRY (5 = first tap under 3 s, zero fields).

| # | Concept | SHARE | CURIOSITY | ENTRY | Who I'd send it to |
|---|---|---|---|---|---|
| C1 | ШАР | 4 | 5 | 4 | group chat of close friends ("я прыгнул ради сервиза, лол") |
| C2 | ПАУЗА | 2 | 3 | 5 | nobody unprompted; maybe a partner if the stalled pair is about us |
| C3 | ЦЕНА ВОПРОСА | 4 | 5 | 4 | the friend I argue with: "за сколько продашься ты?" |
| C4 | ЧУЖАЯ ЖИЗНЬ | 3 | 3 | 2 | Instagram story for the dark-funny gravestone, rarely a DM |
| C5 | ГЛИФ | 3 | 4 | 5 | Telegram bio or status, or one friend "у тебя тоже Ж?" |
| C6 | СПОРИМ? | 5 | 2 | 5 | one named person, in a DM. The highest actual-send rate, but no identity object |
| C7 | ПУСТОЕ МЕСТО | 4 | 4 | 4 | partner, best friend or crush: "займи место" |
| C8 | ДВОЙНОЕ ДНО | 3 | 4 | 4 | a close friend who will "get" the confession |
| C9 | ОРАКУЛ | 3 | 4 | 5 | the competitive friend: "меня угадали 3/4, тебя?" |

## Per-concept weakness and fix

- **C1 ШАР**
  - *Weakness:* the card brags about the sender but says nothing to the recipient. The behavior bracket variant is less playable than the basket throw.
  - *Fix:* ship the basket version with behavior's honesty rules. Make "В ШАРЕ ОСТАЛОСЬ: КОТ" (or "Я ПРЫГНУЛ ВМЕСТО…") the OG headline, with 8 kept items × jump/drop = 16 static pages. The share line is «А ты что оставишь?».
- **C2 ПАУЗА**
  - *Weakness:* the identity object is a millisecond chart. Nobody posts their reaction time, and a spike chart is unreadable as a Telegram preview.
  - *Fix:* drop the chart from the artifact. Put the stalled pair in the headline as a question: «Я завис на "Быть правым / Быть любимым". А ты где?»
- **C3 ЦЕНА ВОПРОСА**
  - *Weakness:* players who hold all 6 rungs get a smug, flat «не продаётся» card.
  - *Fix:* the friend lands on the same ladder as the sender ("Дима продал свободу на 3-й ступени") and climbs it. The result line is "держался дольше / сдался раньше Димы". The 7th-offer attack must fire for every holder.
- **C4 ЧУЖАЯ ЖИЗНЬ**
  - *Weakness:* the date gate costs the friend 10–40 s before the first tap. The epitaph is about a fictional person, so it reads as "a story I got", not "my Weird".
  - *Fix:* keep it only as the birth-first (A) arm. Ask for day and month in one numeric field, and make the epitaph quote the player's own act.
- **C5 ГЛИФ**
  - *Weakness:* «ЖЫЩ» can read as a typo or meme with no recognition behind it. The combining crack (Ж̸) renders inconsistently across Telegram and Instagram fonts.
  - *Fix:* draw the crack only in images and OG cards. Share text uses plain letters plus «трещина: Ы».
- **C6 СПОРИМ?**
  - *Weakness:* the recipient plays *about the sender*, so "what would mine be?" never forms. DM-only, 2018 genre.
  - *Fix:* the friend's score screen has one button, «Теперь спорим на тебя», with their own 6 answers pre-asked.
- **C7 ПУСТОЕ МЕСТО**
  - *Weakness:* there is one slot "for you", but a story has 200 viewers. 36 hand-written pair labels risk sounding like horoscope compatibility.
  - *Fix:* use two copy variants: «занято для тебя» in a DM and «место свободно — кто первый?» in stories. Cut the birth add-on.
- **C8 ДВОЙНОЕ ДНО**
  - *Weakness:* the result is earnest and confessional ("therapy energy"), and a МОНОЛИТ card is dull to post.
  - *Fix:* make МОНОЛИТ a brag: «Ни одного двойного дна. Проверь себя.» Share text: «На словах — X. На деле — Y. А у тебя?»
- **C9 ОРАКУЛ**
  - *Weakness:* the identity is a predictability score, and the code «МЫ · ПОТОМ · ОПОРА» is bland.
  - *Fix:* lead the card with the miss: «Сломал оракула на пятнице». The friend line is "Диму угадали 3/4. Тебя?"

## Top 3 (growth lens, keeping hypotheses diverse)

1. **C1 ШАР.** It has the best artifact in the set: an absurd, concrete, quotable one-liner ("прыгнул ради сервиза"). Zero context needed; "what would *I* keep?" is automatic.
2. **C3 ЦЕНА ВОПРОСА.** The dare is native to the result, so no bolt-on is needed. A price is comparable between two people, and the sender-relative friend result falls out naturally (same ladder, "held longer than Дима").
3. **C7 ПУСТОЕ МЕСТО.** It tests a different share hypothesis: a relational slot that only the recipient can fill. Risk: copy volume.

**Strong runner-up as a mechanic, not a concept:** C6. It will likely post the highest send rate and the lowest "my Weird" recognition. Don't mistake its K for a better toy.

## Most likely played-and-forgotten: C2 ПАУЗА

Fast and pleasant, but the payoff is a timing fact, not an identity; nothing on the card is worth keeping, and one thumb fumble can decide it. Expect high completion, near-zero shares, no recall tomorrow.

## Share mechanics: in all finalists vs only one

The tournament should vary the *game*. These pieces are hygiene, so they go in every finalist identically, or share rates will measure plumbing instead of concepts:

- **Per-result static OG pages, in ALL.**
  - Finite result space, one path and preview per result, exact state in the `#` fragment.
  - A readable short URL and code on the 9:16 story image.
  - The same share button stack in every finalist: `navigator.share`, then `t.me/share`, then copy, plus an `<img>` that can be held to save.
- **Friend entry, in ALL.** Sender's card on top, the first choice already on screen, zero fields, under 150 KB.
- **Sender-relative friend result as ONE line, in ALL.** Examples: "same kept item as Дима", "sold earlier than Дима", "shared letter Ж".
  - No return link: a send-back link is a loop mechanic (below).

Only one finalist each, so their effect is not confounded:

- **The dare (СПОРИМ-style "guess the sender" + send score back).** At most one finalist. Best as a 50/50 share-button split *inside* one finalist (dare vs plain share, same game), which isolates "does the dare lift referred starts?".
- **The code/glyph naming layer.** Only in C5, if C5 goes forward at all. If every finalist gets a 3-letter code, we cannot tell whether the game or the code drove sharing.
- **The pair slot and return link (send our pair back).** Only in C7. That is C7's hypothesis.
- **The birth-date seed.** Only in one arm (C4, or a C1 B/A split), never mixed in by default.

**Measure per finalist:** `share_done/complete`, `ref_start/ref_land` and the recognition tap, read together.
