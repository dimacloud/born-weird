# QA review of tournament concepts C1–C9

- **Reviewer:** QA-REVIEW-002 (independent; wrote and builds none of these)
- **Date:** 2026-10-04
- **Question:** would a stranger on a phone understand and finish this without explanation? What will break?
- **Context:** static GitHub Pages, opened mostly in Telegram and Instagram in-app browsers, Russian UI.
- **Scales:** SELF = first screen understood in under 3 s (5 = instantly). MOBILE = robustness in in-app browsers (5 = nothing fragile). BUILD RISK = risk of missing the ~3 h budget or shipping broken (5 = highest).

| # | Concept | SELF | MOBILE | BUILD RISK |
|---|---|---|---|---|
| C1 | ШАР | 4 | 3 | 3 |
| C2 | ПАУЗА | 4 | 2 | 2 (see trap) |
| C3 | ЦЕНА ВОПРОСА | 4 | 5 | 3 |
| C4 | ЧУЖАЯ ЖИЗНЬ | 2 | 3 | 4 |
| C5 | ГЛИФ | 3 | 3 | 4 |
| C6 | СПОРИМ? | 3 sender / 5 friend | 4 | 3 |
| C7 | ПУСТОЕ МЕСТО | 3 | 3 | 5 |
| C8 | ДВОЙНОЕ ДНО | 3 | 4 | 2 |
| C9 | ОРАКУЛ | 3 | 5 | 2 |

## Per concept

**C1 ШАР.** Build the bracket variant: two big objects per screen, not 8 small icons.
- *Confused first:* which of 8 icons are tappable, and did the tap register? Then «прыгнуть самому?» with no idea what it changes.
- *Breaks:* the fuse keeps running while the Telegram sheet is minimised, so «ШАР РЕШИЛ ЗА ТЕБЯ» fires on throws the player never made. The canvas card renders in a fallback font if drawn before the pixel font loads.
- *Gender:* «прыгнул(а)», «держал(а)», «не отправил». Use receipts instead: «Первым за борт: кот».

**C2 ПАУЗА.**
- *Confused first:* swipe or tap? Pair 7 takes longer to read than «Кофе / Чай», so the 2 s bar runs out while the player is still reading.
- *Breaks:* horizontal swipes. A left-edge swipe means "back" on iOS, and a diagonal drag minimises Telegram's sheet. Reaction time includes gesture jitter and reading length, so the "spike" is often a fumble.
- *Gender:* «быстр(а)», «застрял(а)», «споткнулся(лась)», and they appear on the share card itself.

**C3 ЦЕНА ВОПРОСА.** Taps only, no timer.
- *Confused first:* «ПРОДАЮ» is ambiguous ("I accept the deal" or "I'm selling"?). Six rungs of 12–15 words each read like homework.
- *Breaks:* little. Long rungs wrap and push the buttons below the fold on 320 px. Players who hold all six rungs get a flat ending.
- *Gender:* «выбрал(а)», «отдал(а)».

**C4 ЧУЖАЯ ЖИЗНЬ.**
- *Confused first:* "why do they want my birthday?" The date is the gate.
- *Breaks:* the keyboard covers the button in Instagram's webview, and the ДД.ММ.ГГГГ mask breaks on autofill and paste. With 36 lines to write, it won't fit 3 h.
- *Gender:* «родился(ась)». The fix is built in: write all copy in the *other life's* fixed gender («сын смотрителя»), not the player's.

**C5 ГЛИФ.**
- *Confused first:* the cracked «Ж̸» reads as a rendering bug.
- *Breaks:* the combining slash U+0338 renders as tofu or a separate glyph in Android, pixel fonts and Telegram previews. Draw the crack as a graphic. Building 27 OG pages by script is the real cost. Cyrillic paths turn into %D0%96 in chat, so use Latin slugs.
- *Gender:* «ты завис».

**C6 СПОРИМ?** The friend's entry («ДИМА СПОРИТ…») is the clearest first screen in the tournament.
- *Confused first (sender):* "where is my result?" It stays sealed until someone else plays, so a stranger playing alone never gets a payoff.
- *Breaks:* the answers sit in the URL fragment, so a curious friend can read them. A Cyrillic name gives a long encoded link. The return trip depends on the friend sharing back from inside the webview.
- *Gender:* the worst case. «Что выбрал(а) Дима?» and «не угадаешь его» need the sender's gender. Use «Выбор Димы:» and «Дима спорит: не угадаешь».

**C7 ПУСТОЕ МЕСТО.**
- *Confused first:* «Всё ещё? Да / Уже нет» needs parsing. «ЗАПОЛНИТЬ ПУСТОЕ МЕСТО» reads as "fill it yourself".
- *Breaks:* 44 static pages and OG images across two link hops. Telegram caches previews, so an OG fix after the first share is invisible. Most likely to blow the budget.
- *Gender:* «выбрал(а)», «Оля оставила».

**C8 ДВОЙНОЕ ДНО.**
- *Confused first:* "same questions again?" looks like a bug. It needs a bridge line: «Теперь то же — по-настоящему».
- *Breaks:* only the 3 s timer, which needs pause-on-hidden.
- *Gender:* the sample «выбрал… думал… остался» is masculine.

**C9 ОРАКУЛ.**
- *Confused first:* strangers will tap the face-down card or think they must guess it. Make it visibly inert.
- *Breaks:* a 3D flip using `backface-visibility` flickers in older iOS webviews. Use a plain content swap.
- *Gender:* «Сломал меня», «ушёл». Use «Промах: пятница — свой план».

**All nine** address the player in the past tense. The «(а)» makes the page look like a form, and bare masculine forms exclude about half of players. The rule: present tense, nouns or receipts, and no pronoun for a named sender.

## Verdicts

**Top 3 for "a stranger finishes it":**
1. **C1 ШАР** (bracket variant): the premise is clear in under 3 s and the game pulls you forward.
2. **C9 ОРАКУЛ:** taps only and built-in tension.
3. **C8 ДВОЙНОЕ ДНО:** 8 short taps, plus one bridge line.

C3 is the most robust technically, but its reading load puts it 4th.

**Highest technical trap: C2 ПАУЗА.** It looks like the cheapest build, but the whole reveal is a millisecond measurement taken through swipes in in-app webviews. Those swipes collide with back-navigation and sheet dismissal, and the timing is confounded by reading length. It will ship on time and present noise as insight. C7 is a different failure: the highest risk of shipping late.

## Pre-flight checklist (every finalist)

1. Play to the share screen from a real Telegram chat and an Instagram DM, on a real iPhone and a real Android.
2. At 320×568 nothing scrolls on choice or reveal screens. Tap targets are at least 44 px. Ё, Щ and Ы render in the pixel font.
3. No swipe-only input, no gestures within 24 px of a side edge, no vertical drags.
4. Timers pause on `visibilitychange`/`pagehide`. A timeout always yields a valid reveal.
5. Reload or "back" mid-game never leaves a blank or stuck screen.
6. Share chain: `navigator.share` in try/catch, then `t.me/share/url`, then copy link. The card is an `<img>` for long-press. A cancelled share (AbortError) is not counted.
7. A grep of the copy finds no «(а)», no past-tense verbs about the player, and no pronoun for a named sender.
8. The canvas card waits for `document.fonts.ready`, and has been checked by eye on both platforms.
9. A script plays 10,000 random runs: every branch is reachable, no line appears in more than 60% of runs, and nothing shows `undefined` or `NaN`. A friend link with a broken fragment falls back to the normal game.
10. The first screen has at most 12 words, no field, consent or sound before the first tap, and weighs under 150 KB. The OG preview is checked in Telegram on a fresh URL.
