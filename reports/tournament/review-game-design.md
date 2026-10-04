# Game-design review of C1–C9

- **Reviewer:** GAME-DESIGN-REVIEW-002 (independent; wrote none of these)
- **Date:** 2026-10-04
- **Scale:** 1–5; 5 = I'd bet money. LOW LOAD 5 = very light on the brain.

## Scores

| # | Concept | FUN | PACING | LOW LOAD | Where a real player hesitates or gets bored | The one change that makes it more fun |
|---|---|---|---|---|---|---|
| C1 | ШАР | **4** | **4** | **4** | Throws 3–6 are the same action with nothing new happening. Panic peaks on throw 1 and then turns into routine. | Something happens mid-flight at throw 4 (a gust, a bird steals one item), then the "прыгнуть" twist. Use the basket of 8 on one screen, not the pairwise bracket: two cards on a screen is a questionnaire again. |
| C2 | ПАУЗА | 3 | **5** | 3 | Pairs 5–8 («Свой бизнес / Своя семья в 25») can't be read in 2 s. The timer measures reading speed, and the player feels the jump from "coffee/tea" to "знать правду". | Equalize every option to 1–2 words, so the pause measures the dilemma and not the sentence. Make the deck rhythmic: cards land on the beat, like a rhythm game. |
| C3 | ЦЕНА ВОПРОСА | **4** | 3 | 3 | Rung 2–3: each offer is a "X, but Y" clause to parse. By rung 3 the player sees the ladder and starts **performing integrity**: "I'm someone who holds." From there it's a boring row of ДЕРЖУСЬ. | Cut to 4 rungs and make every rung a different, ludicrous temptation that's fun to accept, so selling feels like a laugh, not a confession. |
| C4 | ЧУЖАЯ ЖИЗНЬ | 3 | 2 | 3 | The date field comes before any play. Then six scenes of reading context before a binary choice, about 70 s. Scene 4–5 is where attention drops. | Seed the life from the first tap instead of the date, and cut to 4 scenes. Keep the gravestone: it's the best artifact in the set. |
| C5 | ГЛИФ | 2 | 4 | 3 | Screen 3–4: «Жить без адреса / Быть тем, кому звонят в 3 ночи» under a 3 s timer is too long to read. Two questions per axis, so the player notices "this is the same question again" and starts modelling. | Replace the 7 dilemmas with a real mechanic (steal ШАР's throws or ПАУЗА's spikes) and keep the code only as the output. As written, the play is v0.5 with a timer. |
| C6 | СПОРИМ? | 3 (sender 2 / friend 4) | 4 | **5** | The sender's ending: «Твой Weird запечатан» is an anticlimax. Player 1 gets no payoff, so player 1 may never send. | Give the sender an instant reveal and make "я ставлю на 2 из 6" an active, cocky choice. The friend's guessing with instant ✓/✗ is already the most gamey 30 seconds in the whole set. |
| C7 | ПУСТОЕ МЕСТО | 2 | 3 | 2 | Question 5: «Ты трижды выбрал(а) свободу… Всё ещё?» The game shows its scoring and argues with you. That's the exact moment the player stops playing and starts defending a profile. | Drop the spoken attacks. If a later dilemma must push against the pattern, do it silently through what's offered, never by telling the player what they chose. |
| C8 | ДВОЙНОЕ ДНО | 2 | 3 | 3 | The start of round 2: the player recognizes the same 4 trade-offs and consciously tries to stay consistent. Round 2 also has no timer and asks you to read scenes, so pace drops right when it should rise. | Interleave the 8 items as one stream, and make the "it was the same question" the twist at the reveal, not something the player discovers mid-game. |
| C9 | ОРАКУЛ | **4** | **4** | **4** | Choices 1–3 are "nothing yet": three plain questions before the game starts. Once bets appear, players stop answering honestly and play rock-paper-scissors against the oracle. That's fine for fun, bad for the reveal. | Show the face-down card from tap 1 (the first bet is a taunt or coin flip), so there is an opponent from the start. Keep a live «2:1» score in the corner. |

## Top 3

1. **C1 ШАР.** The only concept where the hands are busy: a fuse, falling objects, sound, a twist. The output is a complete order of 8 for 7 taps, and the headline («прыгнул ради сервиза») can be screenshotted without context. Risk: the middle is flat (fix above). Use the behavior lens's objects (unsent letter, someone else's cat): they hit harder.
2. **C9 ОРАКУЛ.** An opponent is the cheapest source of fun there is. "It thinks it knows me" creates instant motivation and a built-in escalation ("can I break it?"). «Угадал 3 из 4» is a score, and scores get shared. Weak signal (defiance replaces preference) is the behavior reviewer's problem.
3. **C3 ЦЕНА ВОПРОСА.** Push-your-luck is a proven loop (Deal or No Deal) with real tension rising rung by rung. The price tag («СВОБОДА — ЦЕНА: КВАРТИРА С ТЁЩЕЙ») is a perfect dare. It lives or dies on copy and on breaking the "hold everything" strategy.

**Near misses:** C2 (best pacing, but the play is a Tinder quiz) and C6 (great for the friend, weak for whoever starts the chain).

## The trap: C7 ПУСТОЕ МЕСТО

On paper it ticks every box in the brief: binary dilemmas, progressive contradiction, a pair loop, a birth-date variant C, an empty slot as a curiosity gap. In hand it's 7 abstract word pairs («Победить / Понравиться»), then a game that **lectures you about your own answers**, then a card that is half empty by design. The player gets half a payoff and a homework assignment («найди друга»). It's also the most expensive to make good (8 + 36 texts, 44 OG pages). It's an assessment engine again, with a social wrapper.

## Merges: stronger single toys

- **Best merge: ШАР (C1) + one-tap СПОРИМ entry (C6).**
  - A friend opens the link and sees the sender's sinking balloon: «Что Дима оставил в шаре?» That's one tap on one of 8 objects, with instant ✓/✗ and a sound.
  - Then the friend's own balloon starts.
  - Zero-field entry, an ego hook in second one, a relational line on the reveal. About one extra screen of build, and the sender keeps a full reveal (C6's weak point is gone).
- **ШАР + ОРАКУЛ twist.** At throw 5 the balloon says «Я знаю, что ты выкинешь следующим» and shows a face-down card. The reveal adds «Шар угадал тебя 1 из 2». This fixes C1's flat middle with a mid-game opponent. The cost is a little more load, so test it as a variant, not the default.
- **ДВОЙНОЕ ДНО's split as ЦЕНА's contradiction.** C3 already pairs "word" (the value you pick as unsellable) with "deed" (the rung where you sell). State it in C8's language: «НА СЛОВАХ: СВОБОДА. НА ДЕЛЕ: КВАРТИРА С ТЁЩЕЙ.» That gives C3 an honest contradiction without adding screens.
