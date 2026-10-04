# Prototype tournament: game-design concepts

- **Author:** GAME-DESIGN-001 (temporary agent)
- **Date:** 2026-10-04
- **Brief:** `company/PRODUCT_RESET_2026-10-04.md`
- **Evidence:** `reports/CURRENT_STATE_SNAPSHOT_2026-10-04.md`
- **My one question:** is this actually fun to play?

## What v0.5 teaches a game designer (5 lines)

1. **About 27 taps and 2.5–4 minutes before any payoff.** The "НЕ ДУМАЙ" round asks you to read 4 options of about 15 words, twice. That is reading, not playing.
2. **The visible 8-bar HUD and the "+1 СВОБОДА" deltas show the scoring.** From screen 2 the player is modelling the questionnaire, which is the exact failure the reset names.
3. **No escalation.** Screen 9 feels the same as screen 1, and nothing in the game reacts to what you did except a typewriter line.
4. **A "ДАЛЬШЕ" button after every answer kills rhythm.** A game is a loop. v0.5 is a form with pauses.
5. **Assets worth reusing:** the DOS/pixel look, PC-speaker beeps (already unlocked on mobile), the 1080×1920 canvas card renderer, the opposite pairs of the value circle (СВОБОДА↔НАДЁЖНОСТЬ, НОВИЗНА↔КОРНИ, УСПЕХ↔БЛИЗКИЕ, ВЛИЯНИЕ↔МИР) and the 8×8 adjective+noun title table.

**The design move behind all four concepts.** Stop asking "what do you value?" Put the player under light, comic **pressure**, such as a timer, a loss or an escalating bribe. Read the value from what they **do**: the order they act in, how long they hesitate, and where they break. The player is busy playing, so they cannot model the test.

---

## Concept 1: ШАР (The Balloon) [the absurd one]

**Magic trick:** your balloon is falling, you throw your life overboard one item at a time, and the order you dump things in says who you are.

**Birth date:** **none.** Nothing should come between the player and the first tap. (Variant B of the reset.)

**Flow (about 45 s)**
- **0–3 s.** Title screen with a pixel balloon and 8 items in the basket. «ШАР ПАДАЕТ. СБРАСЫВАЙ ЛИШНЕЕ.» Then [ПОЛЕТЕЛИ].
- **3–35 s.** 7 throws. Each throw: the balloon dips, the speaker beeps faster, and a 4-second fuse runs. You tap an item and it falls with a sound. The fuse shortens: 4 s, then 3.5 s, down to 2 s. If time runs out, the balloon drops a random item ("ШАР РЕШИЛ ЗА ТЕБЯ"), which is logged too.
- **35–40 s.** Twist. One item is left: «Остался один. Шар всё равно падает. Сбросить его — или прыгнуть самому?» [СБРОСИТЬ] or [ПРЫГНУТЬ].
- **40–45 s.** Reveal.

**Items** (each is a hidden value; show 1–2 words plus a pixel icon, never sentences)
- Кот — БЛИЗКИЕ
- Загранпаспорт — СВОБОДА
- Ноутбук с проектом — УСПЕХ
- Корона из фольги — ВЛИЯНИЕ
- Заначка в носке — НАДЁЖНОСТЬ
- Бабушкин сервиз — КОРНИ
- Билет в неизвестность — НОВИЗНА
- Семена для чужого сада — МИР

**How the reveal is computed**
- The throw order is the ranking: first thrown is lowest, last kept is highest.
- **Slowest throw:** the item you hovered over longest is the "держал(а) дольше всех" item.
- **Contradiction:** if an item sits on the opposite side of the circle from the kept item, comes from the first 3 throws and took more than 1.5 s, it becomes the contradiction. Otherwise the template "first thrown vs kept" is used.
- **Title:** adjective from the slowest item plus noun from the kept item (8×8 table).
- **Jumping** adds the "ПРЫГНУЛ(А) РАДИ" line.

**Sample reveal**
```
ТВОЙ WEIRD
ТЫ ПРЫГНУЛ(А) РАДИ БАБУШКИНОГО СЕРВИЗА.
Первым за борт: кот.
Дольше всего в руках: загранпаспорт (2.8 с).
ПРОТИВОРЕЧИЕ: хочешь уехать — но тащишь с собой весь дом.
— СЕНТИМЕНТАЛЬНЫЙ БЕГЛЕЦ —
[ПОКАЗАТЬ, ЧТО ВЫБРОСИЛ ТЫ]
```

**Share artifact:** a pixel card with the balloon, the falling items in your order and one big line, «Я прыгнул(а) ради сервиза». The recipient sees an absurd verdict without context and immediately wonders what they would keep.

**Biggest risk:** the items read as "just objects", so the reveal feels like a joke rather than a mirror. Mitigation: the copy names the meaning ("кот = твои люди") only on the reveal, in one line.

**Build:** about 3.5 h (CSS fall animation, timer, canvas card reuse).

---

## Concept 2: ПАУЗА (Hesitation)

**Magic trick:** 8 quick "this or that" swipes, and the reveal is not what you chose but **where you hesitated**.

**Birth date:** **after, optional** (variant C): «Хочешь знать, что про паузу думают звёзды?» It is tested as an enhancement, not a gate.

**Flow (about 35 s)**
- **0–2 s.** «8 ПАР. 2 СЕКУНДЫ НА КАЖДУЮ. НЕ ДУМАЙ.» Then [СТАРТ].
- **2–28 s.** 8 cards. Swipe ← or →, with a 2-second bar. No ДАЛЬШЕ, no reactions; the next card slams in on a beep. Pairs 1–4 are light warm-ups. Pairs 5–8 are hidden value oppositions.
- **28–30 s.** «Ты быстр(а). Кроме одного места…»
- **30–35 s.** Reveal.

**Sample pairs**
1. Кофе ← → Чай
2. Горы ← → Море
3. Позвонить ← → Написать
4. Опоздать ← → Прийти на час раньше
5. Быть правым ← → Быть любимым
6. Уехать навсегда ← → Остаться навсегда
7. Свой бизнес ← → Своя семья в 25
8. Знать правду ← → Спать спокойно

**How the reveal is computed**
- Log the reaction time (ms) for each card. Normalize against the player's own median from warm-ups 1–4.
- **Slowest value pair = "твоя трещина".** The side you chose there is "что победило, но с боем".
- **Fastest value pair = "твоя аксиома".**
- A timeout counts as maximum hesitation, with the "ты не смог(ла) выбрать" line.
- **Text:** one template per value pair (4 pairs × 2 winners = 8 lines). Title comes from the pair.

**Sample reveal**
```
ТВОЯ ПАУЗА: 1.9 с
«Быть правым ← → Быть любимым»
Везде ты решал(а) за 0.6 с. Здесь — застрял(а) втрое дольше.
Выбрал(а): любимым. Но правота не отпускает.
АКСИОМА: «уехать» — за 0.4 с, не моргнув.
— ВЕЖЛИВЫЙ СПОРЩИК —
```

**Share artifact:** a bar chart of your 8 reaction times with one spike and a caption: «Я споткнулся(лась) на: Быть правым / Быть любимым». The recipient asks: "where would *I* stall?"

**Biggest risk:** reaction time on phones is noisy (thumb position, a swipe mis-read). The reveal can hang on one fumble. Mitigation: ignore anything over 3× the median as "отвлёкся", and use median normalization.

**Build:** about 2.5 h. It is the cheapest concept.

---

## Concept 3: ЦЕНА ВОПРОСА (The Bribe Ladder)

**Magic trick:** you pick what you will never give up, then the game keeps raising the bribe until you sell it, and it shows your price.

**Birth date:** **none.** The hook is the dare, not the seed.

**Flow (about 60 s)**
- **0–5 s.** «Выбери то, что не продашь ни за что.» 4 big pixel tiles: СВОБОДА, СВОИ ЛЮДИ, ДЕЛО ЖИЗНИ, ПОКОЙ. That is 1 tap.
- **5–45 s.** The ladder. Absurd and tempting offers rise. Each offer is 1 tap: [ДЕРЖУСЬ] or [ПРОДАЮ]. There are 6 rungs maximum, with a coin sound that gets louder each rung.
- **45–50 s.** If you held all 6: «Ладно. Тогда так:» and one last offer that attacks a different value, the player's likely second choice.
- **50–60 s.** Reveal.

**Sample ladder (for СВОБОДА)**
1. Бесплатная шаурма каждый день, но ужинаешь только по расписанию.
2. 300 000 ₽ в месяц, но отпуск согласует начальник.
3. Квартира в центре, но в ней живёт тёща с ключами.
4. Миллион долларов, но 5 лет без права уехать из города.
5. Все твои мечты сбылись, но решения за тебя принимает ИИ.
6. Вечная молодость, но каждое утро тебе говорят, что надеть.

**How the reveal is computed**
- Your **price** is the rung where you sold, from 1 to 6, or 7 if you held everything.
- The rung picks the verdict tier: 1–2 «дёшево», 3–4 «рыночно», 5–6 «дорого», 7 «не продаётся».
- The last-offer reaction picks the contradiction.
- There are 4 ladders with 6 rungs and 4 tiers each: about 16 verdict lines plus 4 short-copy contradiction lines.

**Sample reveal**
```
ТВОЯ ЦЕНА
СВОБОДА → продана за квартиру с тёщей.
Ступень 3 из 6. Рыночная цена.
ПРОТИВОРЕЧИЕ: ты выбрал(а) свободу первой —
и отдал(а) её за квадратные метры.
— ДОМАШНИЙ БУНТАРЬ —
[А ЗА СКОЛЬКО ПРОДАШЬСЯ ТЫ?]
```

**Share artifact:** a pixel "price tag" on the value, «СВОБОДА — ЦЕНА: КВАРТИРА С ТЁЩЕЙ», with the ladder drawn as a stairs icon. "For how much would *you* sell?" is a natural dare to a friend.

**Biggest risk:** players who "hold" through everything get a boring all-7 result and feel tested, not played. The 7th "attack another value" offer exists to fix that. Copy quality is load-bearing: the rungs must be funny and tempting.

**Build:** about 3 h (simple screens; most of the time goes into 24 good rungs).

---

## Concept 4: ЧУЖАЯ ЖИЗНЬ (The Other Life)

**Magic trick:** your birth date drops you into a life you didn't live, and 6 one-tap moments in it show what you would do with a second chance.

**Birth date:** **first, seed only.** The date picks the life (city, era, occupation), so two people's runs differ, and it creates mystery in about 5 s. It never "explains" anything astrologically. The birth field stays a single text input (ДД.ММ.ГГГГ), not the native picker. This is the honest test of variant A.

**Flow (about 70 s)**
- **0–10 s.** Date, then «ТЫ РОДИЛСЯ(АСЬ) ЗАНОВО: Владивосток, 1974, сын смотрителя маяка».
- **10–60 s.** 6 vignettes, one line each, plus 2 big buttons. Ages jump by about 10 years each scene (7 → 17 → 27 → 37 → 57 → 77). Pacing goes from quick to heavy. The final scene is quiet.
- **60–70 s.** Reveal: an epitaph.

**Sample moments** (one line plus 2 buttons)
1. **7 лет.** На маяке гроза. → [Остаться с отцом] / [Убежать смотреть шторм]
2. **17.** Письмо из Москвы: приняли. → [Ехать] / [Порвать]
3. **27.** Тебе предлагают команду судна. → [Капитан] / [Свой человек в команде]
4. **37.** Друг просит в долг всё, что есть. → [Дать] / [Отказать]
5. **57.** Можно вернуться в город детства. → [Вернуться] / [Никогда]
6. **77.** Последнее письмо. Кому? → [Тем, кто остался] / [Тем, кого не знаешь]

**How the reveal is computed**
- Each button carries a value tag. Count the tags into a top-1 value plus a tag "broken" against it, meaning the opposite of the top-1 was chosen once anyway.
- The epitaph template is chosen by the top-1 value plus whether the player broke the pattern (8 × 2 = 16 epitaphs).
- The seed only changes the setting and nouns (6 lives), never the verdict.

**Sample reveal**
```
ЗДЕСЬ ЛЕЖИТ ТОТ, КТО ВСЮ ЖИЗНЬ УЕЗЖАЛ —
И ВСЁ РАВНО ВЕРНУЛСЯ К МАЯКУ.
Владивосток, 1974 – 2051
Ты выбирал(а) свободу 4 раза из 6. А в 57 — вернулся(лась).
— БЛУДНЫЙ СМОТРИТЕЛЬ —
```

**Share artifact:** a pixel gravestone or postcard showing a city, years and the epitaph. It is dark-funny and very screenshot-able. "What would *my* other life be?" is reinforced by the visible seed: a different date gives a different life.

**Biggest risk:** this is the most writing (6 lives × 6 scenes = 36 lines) and the longest play time. The date gate may depress starts. The epitaph framing may feel morbid to some players.

**Build:** about 4 h, on the edge of budget. It can be cut to 3 lives to get to about 3 h.

---

## Ranking and my bet

| Rank | Concept | Fun | Surprise | Share pull | Cost |
|---|---|---|---|---|---|
| 1 | **ШАР** | highest: a real micro-game with escalation and a twist | "прыгнул ради сервиза" | absurd one-liner | 3.5 h |
| 2 | **ПАУЗА** | fast, rhythmic | high: "it noticed where I paused" | spike chart | 2.5 h |
| 3 | **ЦЕНА ВОПРОСА** | good if the copy is funny | medium-high | dare format | 3 h |
| 4 | **ЧУЖАЯ ЖИЗНЬ** | story, slower | medium | postcard | 4 h |

**My single bet is ШАР.** It is the only concept where the player plays: physical tapping, falling objects, a fuse, and panic that escalates. Players don't stop to model the questionnaire, because there is no questionnaire.

The ranking it produces is complete (a full order of 8) and costs only 7 taps. The final "сбросить или прыгнуть" is a genuine surprise beat. The result line is absurd enough to share and true enough to sting.

**Pair it with ПАУЗА** as the second finalist. It tests a different hypothesis ("the game reads my body, not my answers"), and its hesitation signal can be stolen into ШАР later.

## 5 game-design rules for every finalist

1. **The first tap is play, not reading.** No more than 12 words on screen before the first interaction. No onboarding paragraph.
2. **Each choice costs at most about 3 seconds and fits on the screen without reading.** That means 1–4 words per option, or an icon. No "ДАЛЬШЕ" buttons: the answer itself advances the game.
3. **Escalate.** Each choice must feel heavier, faster or stranger than the previous one, and the loop needs exactly **one twist** (a rule break or last-moment reversal) before the reveal.
4. **Hide the scoring until the reveal.** No HUD, no "+1", no value names during play. The reveal names a **concrete act the player did** (an item, a pause, a price), not an abstract trait: "ты выбросил кота первым" beats "низкая ценность БЛИЗКИЕ".
5. **One screen, one sentence that is screenshot-worthy without context.** The reveal must have a single headline line that a stranger finds funny or provocative on its own. If the share card needs an explanation, it fails.
