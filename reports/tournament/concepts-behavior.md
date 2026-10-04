# BEHAVIOR-001: concepts from the behavior lens

- **Date:** 2026-10-04
- **Author:** BEHAVIOR-001 (temporary agent)
- **Question owned:** Does the reveal have enough basis in player behavior to avoid feeling arbitrary?
- **Inputs:** `company/PRODUCT_RESET_2026-10-04.md`, `reports/CURRENT_STATE_SNAPSHOT_2026-10-04.md`, `reports/QA_v0.5.md`.
- **Stance:** no veto because a simpler game yields less psychometric data. The goal is the smallest signal that makes a reveal feel earned, plus honesty.

**What v0.5 taught us (evidence, not direction):**
- QA_v0.5 D5: the "main contradiction" fired in **86%** of realistic plays. A line that fires for almost everyone carries no information about you. That is the Barnum effect, even when wrapped in evidence quotes.
- D4: visible verdicts depended on hidden tie-breaks in 18–41% of plays. The player cannot feel a jitter.
- With 8 values and at most 4 signals per value, most of the result was the model talking, not the player.
- The founder's smoke-test verdicts ("no value", "empty", "too much text") are consistent with this: too many claims, each one weakly earned.

---

## Task A: the recognition engine

**1. Barnum, honest and dishonest.** Forer-style statements get rated around 4/5 accurate by almost everyone. They are *dishonest* when presented as derived from your input while being true of everyone. They are *honest* only as framing around a claim that could have come out differently. Test for every line: **would ≥30–40% of players get a different line?** A line that fires for more than ~70% is decoration, not a finding.

**2. Receipts beat traits.** People infer who they are from what they just did (Bem's self-perception theory). "You threw the money overboard before the old sweater" lands harder than "you are not materialistic", and the player draws the trait conclusion themselves. Choice-blindness studies (Johansson & Hall, 2005) show people defend choices they never made, so a misquote is a lie the player will believe. Never paraphrase a choice into something stronger.

**3. Tension beats flattery, but only if observed.** A contradiction feels truer than a compliment, but "you value freedom AND closeness" is Barnum when both are simply high. An honest contradiction is **two of the player's own answers pointing in opposite directions**. A **consistent player must get a different, equally good reveal**, not a forced crack.

**4. Forced choice between two goods** removes the "right answer", so every tap is a real trade-off. It shows the order *inside one person*, never a comparison with others. So: no percentiles.

**5. Hesitation as signal.** Phone reaction time mixes reading, text length and distraction. Use it only within one player, between items of similar length, when the gap is large (slowest ≥ 2× the player's median and ≥ 2.5 s), and **as a reported fact, never as the basis of a trait claim**. "You thought for 6 seconds" is honest; "so you are torn about family" is not.

**6. "You chose X over Y, even though…"** needs at least two linked choices. The "even though" must be the player's *other* answer, not a model assumption.

**Minimum number of binary choices**
- **(a) Top claim.** One choice supports only "X over Y here" (a fact). A top claim among *k* candidates needs the winner to beat every other candidate directly: a round-robin of 3 candidates takes **3 choices**, 4 candidates take **6**. A knockout bracket of 8 items takes **7 choices**, but its winner beats only 3 items directly, so the honest claim is "survived three cuts", not "your #1 value".
- **(b) Contradiction claim.** At least **2 choices on the same trade-off in different framings** (cheap vs costly, abstract vs concrete) with opposite answers. That is enough for an observed inconsistency stated as a fact. A trait-level "you are torn" would need 3 or more (an A-B-A pattern or a preference cycle), so don't use that wording with 2. Also fix the fire rate: the contradiction branch should fire for roughly 25–60% of players, not 86%.

**Claims a toy must never make**
- Diagnosis of any kind: disorders, attachment styles, trauma, "you have ADHD energy".
- Predictions of life outcomes: relationships, career, money, health.
- Astrology or numerology as cause or evidence.
- "Scientifically proven" or "validated".
- Rarity or percentiles computed from random simulations.
- Moral verdicts ("you are selfish").
- Claims about third parties.
- "We know you better than you do."

**Birth date, if used at all:** a **seed and lore only**. It may pick palette, sigil, creature name and question order. It must never change a claim. Ask for day and month only, never the year: that is enough for a seed and keeps privacy. Say it plainly: «Дата — только зерно для картинки. Результат — из твоих выборов.» Freeze the v0.5 "stars vs you" duel: it made astrology a pseudo-hypothesis.

---

## Task B: three concepts

### Concept 1: ДВОЙНОЕ ДНО (Double Bottom)
**Magic trick:** you answer the same four dilemmas twice, first as fast words and then as real life, and the game shows you where the two answers split.
**Birth date:** none.

**Flow (≈45 s, 8 taps)**
- **Round СЛОВА:** 4 word pairs with a 3-second bar: «Не думай».
- **Round ЖИЗНЬ:** the same 4 trade-offs as costly scenes, in a different order with sides shuffled, and no timer.
- Then the reveal.

**Choices**
- СЛОВА:
  - СВОБОДА / БЛИЗКИЕ
  - УСПЕХ / ПОКОЙ
  - ПРАВДА / МИР
  - НОВОЕ / СВОЁ
- ЖИЗНЬ:
  - «Год жить где хочешь, всё оплачено. Но без своих людей.» [ЕДУ] [ОСТАЮСЬ]
  - «Зарплата вдвое больше. Телефон звонит и в воскресенье.» [БЕРУ] [НЕТ]
  - «Друг сияет и показывает бизнес-план. План плохой.» [СКАЖУ КАК ЕСТЬ] [ПРОМОЛЧУ]
  - «Отпуск: место, где был пять раз, или страна, о которой ничего не знаешь.» [НОВАЯ] [ЛЮБИМОЕ]

**Reveal rule**
```
valid  = pairs where word[p] != null           // timeout -> pair excluded
flips  = [p in valid : word[p] != life[p]]
head   = argmax over flips of lifeRT[p]; tie -> fixed order (СВОБОДА, УСПЕХ, ПРАВДА, НОВОЕ)
n=0  -> МОНОЛИТ: "На словах и на деле — одно и то же." Quote the slowest life choice.
n=1  -> ТРЕЩИНА: NAME[head][direction] + "НА СЛОВАХ: A. НА ДЕЛЕ: B."
n=2  -> ДВОЙНОЕ ДНО: same as ТРЕЩИНА for head, plus a one-line mention of the second flip.
n>=3 -> ХАМЕЛЕОН: "Ты выбираешь по ситуации, а не по слову." Quote head.
```
- 8 names, one per pair and direction. Every branch quotes real choices, so it is never empty.

**Sample reveal**
> ТВОЁ ДВОЙНОЕ ДНО
> НА СЛОВАХ: СВОБОДА. НА ДЕЛЕ: БЛИЗКИЕ.
> За 0,8 с ты выбрал «свободу». Потом 5 секунд думал — и остался со своими.
> БЕГЛЕЦ, КОТОРЫЙ ВСЕГДА ВОЗВРАЩАЕТСЯ

**Honesty line:** «Это не тест. Это два твоих ответа рядом.»

**Biggest risk:** if words and scenes don't match closely, a split shows bad item design, not the player. Random answers flip at least once in 94% of plays; real players should flip less. Measure it, and keep МОНОЛИТ as attractive as the rest.

**Build cost:** about 2.5 h.

---

### Concept 2: ОРАКУЛ (The Oracle bets on you)
**Magic trick:** halfway through, the game seals a bet on what you will choose next, and the reveal is how readable you turned out to be.
**Birth date:** optional, as the oracle's "name" only.

**Flow (≈60 s, 7 taps)**
- Choices 1–3 set your side on 3 axes: Я/МЫ, СЕЙЧАС/ПОТОМ, ПРЫЖОК/ОПОРА.
- Before each of choices 4–7, a face-down card appears: «Я уже знаю, что ты выберешь.» It flips after your tap: УГАДАЛ or ПРОМАХ.

**Choices**
1. «Последний кусок торта.» [СЪЕМ] [ОСТАВЛЮ]
2. «100 000 сейчас или 200 000 через год.» [СЕЙЧАС] [ЧЕРЕЗ ГОД]
3. «Прыгнуть с парашютом завтра?» [ДА] [НЕТ]
4. «Вечер пятницы: свой план или друзья зовут.» [СВОЙ] [ДРУЗЬЯ]
5. «Бросить курс на середине, если он скучный?» [БРОШУ] [ДОТЕРПЛЮ]
6. «Работа мечты в незнакомом городе.» [ЕДУ] [ОСТАЮСЬ]
7. The boss card: the axis you were most consistent on, in its costliest form.

**Reveal rule**
```
bet(axis) = side the player chose on that axis so far (majority; with 1 data point, that point)
boss axis = axis with 2/2 consistency; tie -> fixed order (Я/МЫ, СЕЙЧАС/ПОТОМ, ПРЫЖОК/ОПОРА)
hits = count of correct bets over choices 4..7
label = {4:"ОТКРЫТАЯ КНИГА", 3:"ПОЧТИ ПРОЧИТАН", 2:"ДВА РЕЖИМА", 0|1:"НЕЧИТАЕМЫЙ"}
code  = latest side on each axis, e.g. "МЫ · ПОТОМ · ОПОРА"
receipt = first ПРОМАХ, quoted; if none, the boss choice
```
Every outcome is a count plus a quote, so there is no flat profile.

**Sample reveal**
> ОРАКУЛ УГАДАЛ ТЕБЯ 3 ИЗ 4
> МЫ · ПОТОМ · ОПОРА
> Сломал меня один раз: везде выбирал своих — а в пятницу ушёл в свой план.
> ПОЧТИ ПРОЧИТАН
> [ПРОВЕРЬ, УГАДАЕТ ЛИ ОН ТЕБЯ]

**Honesty line:** «Оракул не читает мысли — он просто ставит на то, что ты не изменишься.»

**Biggest risk:** players sense the bet and act randomly on purpose (Aaronson-oracle play). That is fine as a game, but the "code" then reflects defiance rather than preference. Tell the truth in the label: НЕЧИТАЕМЫЙ is reported as a fact about the bets, nothing more.

**Build cost:** about 3 h.

---

### Concept 3: ВОЗДУШНЫЙ ШАР (What goes overboard). No values at all.
**Magic trick:** a sinking balloon makes you throw seven things overboard, and the reveal is simply what you kept, what you dropped first, and what you hesitated over.
**Birth date:** none, or after play as a seed for the card's sky only.

**Flow (≈40 s, 7 taps)**
- 8 objects go into a knockout bracket.
- Each screen asks «Шар падает. Выкинь одно» and shows two objects.
- The bracket seeding is random.

**Objects**
- ДЕНЬГИ НА ГОД
- ТЕЛЕФОН СО ВСЕМИ ФОТО
- ПИСЬМО, КОТОРОЕ ТЫ ТАК И НЕ ОТПРАВИЛ
- ПАСПОРТ
- КЛЮЧИ ОТ ДОМА
- ЧУЖОЙ КОТ, КОТОРОГО ТЕБЕ ДОВЕРИЛИ
- НЕДОПИСАННАЯ РУКОПИСЬ
- КУБОК, КОТОРЫЙ ТЫ ВЫИГРАЛ

**Reveal rule**
```
kept     = bracket winner                     // survived 3 direct cuts
almost   = final loser
first    = loser of tap 1, with its reaction time
heavy    = slowest cut, shown only if RT >= 2 × median and >= 2.5 s
name     = NAME[family(kept)][family(first)]  // 8 families -> 56 playful titles
```
- Families: БЕЗОПАСНОСТЬ, ПАМЯТЬ, ЧУВСТВА, СВОБОДА, КОРНИ, ДОЛГ, МЕЧТА, ПРИЗНАНИЕ.
- Families are used only for the title. The page shows objects, not values.
- A bracket always has a winner, so there are no ties.

**Sample reveal**
> В ШАРЕ ОСТАЛОСЬ: ЧУЖОЙ КОТ
> Почти остался: НЕДОПИСАННАЯ РУКОПИСЬ.
> Первым за борт за 0,9 с: ДЕНЬГИ НА ГОД.
> Дольше всего держал: ТЕЛЕФОН СО ВСЕМИ ФОТО (7 с).
> ХРАНИТЕЛЬ ЧУЖОГО

**Honesty line:** «Мы ничего не вычисляли. Мы просто записали, что ты выкинул.»

**Biggest risk:** the bracket makes the result path-dependent, so the same person could keep a different object on a replay. Mitigation: the reveal says "kept", not "values most". Second risk: the objects need careful tuning (the cat may win too often). Track win rate per object and keep each under about 30%.

**Build cost:** about 2 h.

---

## 5 epistemic rules for all finalists

1. **Every load-bearing line must be one the player's taps could have changed.**
   - Simulate before shipping: no reveal line should fire for more than about 60% of players.
   - The headline should split players into at least three roughly comparable groups.
2. **Facts as facts, labels as play.**
   - "You chose / thought for 6 s / kept" is stated flatly.
   - Interpretations are titles and nicknames, never diagnoses or predictions.
3. **Quote exactly and never invent evidence.**
   - Birth date, seed and randomness may change costume: palette, name, order.
   - They may never change the claim or decide a tie the player can see.
4. **No empty branch and no forced drama.**
   - Consistent, flat or timed-out play gets its own specific, equally shareable reveal.
   - Never manufacture a contradiction that was not observed, and never answer with "not enough data".
5. **One honesty line, no walls, and no forbidden claims.** That means no diagnosis, life prediction, astrology-as-truth, fake rarity or "научно".

## Post-reveal recognition check (2 taps)

- **Tap 1, directly under the card:** «ПОПАЛ?» [В ТОЧКУ] [ПОЧТИ] [МИМО]
- **Tap 2:** the reveal's own lines (headline, receipt, title) become tappable chips. «Что именно?»
  - For В ТОЧКУ / ПОЧТИ it means "what hit".
  - For МИМО it means "what missed".
  - This measures *which component* carries recognition, with no typing and no survey feel.
- **Barnum control, test builds only:** in about 1 of 5 sessions, show a **yoked reveal** first, meaning another player's real result rendered as yours, and collect tap 1. Then immediately say «Это был чужой результат. Вот твой.» and show the real one.
  - If yoked reveals get about the same В ТОЧКУ rate as real ones, the engine is Barnum. That is the single most important number BEHAVIOR can give the tournament.
  - Run it only with human testers in moderated sessions, never on the public link.
