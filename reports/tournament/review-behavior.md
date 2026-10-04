# Behavior review of C1–C9 (BEHAVIOR-REVIEW-002)

2026-10-04, independent reviewer. Question: is the reveal earned by the player's taps, and is it honest? Psychometric depth is not a criterion. Baseline (QA_v0.5 D5): a contradiction firing for 86% is Barnum; a headline passes only if ≥30–40% of players would get a different one. Scores 1–5: EARNED (taps can change the headline), SPEC (players get visibly different reveals), HONEST (5 = safe). Fire rates are my estimates from the specs, not simulations.

| # | Concept | EARNED | SPEC | HONEST | Distinct headlines / dominance |
|---|---|---|---|---|---|
| C1 | ШАР | 5 | 3 | 3 (4 with the bracket rule) | 8 kept items × jump/drop. The cat is likely kept by 40–60%. |
| C2 | ПАУЗА | 2 | 2 | 2 | 8 nominal. The longest or heaviest pair probably wins for most players. |
| C3 | ЦЕНА | 4 | 3 | 3 | 4 values × 7 rungs. Clusters on 1–2 rungs, decided by joke quality. |
| C4 | ЧУЖАЯ ЖИЗНЬ | 3 | 2 | 2 | 8 values from 6 binaries, so ties are frequent. Leave/stay is over-sampled. |
| C5 | ГЛИФ | 4 | 4 | 3 | 27 codes. At least one crack in about 75% of plays. |
| C6 | СПОРИМ? | 3 | 3 | 3 | 4 score bands. About 55% of chance-level guessers land in "фасад". |
| C7 | ПУСТОЕ МЕСТО | 2 | 2 | **1** | 8 Weirds from tied axes. The contradiction fires for 100%. |
| C8 | ДВОЙНОЕ ДНО | 5 | 4 | 4 | 4 tiers × 8 named splits. Plausible spread. |
| C9 | ОРАКУЛ | 4 | 4 | 4 | Hits 0–4 × 8 codes. About 13/35/35/18% at a cross-item hit rate of ~0.6. |

**Flagged: most players get the same result.**
- C7: a "conflicting" pair for everyone.
- C4: "broke the pattern" fires almost always.
- C2: a slowest pair always exists, so it always shows a "трещина".
- C1, game-design rule: the fallback is still labelled ПРОТИВОРЕЧИЕ (100%), and the cat dominates.
- C3: every seller gets "you chose it, then sold it".
- C5: borderline at about 75%.

## Per concept

**C1 ШАР.** Full ranking of 8 from 7 acts; every headline word is something the player did.
- *Barnum:* "кот" is a moral choice, so "kept" converges; the game-design rule labels every result ПРОТИВОРЕЧИЕ; auto-drops risk being quoted as choices.
- *Fix:* behavior merge (objects as facts, title as play); no living beings or no item kept >30%; contradiction only if a slow (≥2× median) early throw opposes the kept item; auto-drop = «не выбрал(а)».

**C2 ПАУЗА.** Reaction-time argmax over 4 items mostly measures text length, order, thumb and 2 s timeout ties.
- *Barnum:* "трещина" fires for 100%; «правота не отпускает» turns noise into a trait.
- *Fix:* headline = the choice, RT only a receipt; equal option lengths, random order; pause shown only at ≥2× median, else a «РОВНЫЙ» card.

**C3 ЦЕНА.** The sell rung is a real act, but rungs mix confounds (тёща, шаурма) and players hold out of consistency.
- *Barnum:* escalation guarantees a sale, then calls it a contradiction.
- *Fix:* label it ЦЕНА; a proud НЕ ПРОДАЁТСЯ card; each rung costs only the chosen value; sales must spread over ≥3 tiers.

**C4 ЧУЖАЯ ЖИЗНЬ.** 6 binaries over 8 tagged values: the top value is a tie-break or tagging artefact.
- *Barnum:* "broke the pattern" fires for almost everyone; a gravestone with a death year seeded by birth date reads as fortune-telling.
- *Fix:* 3 axes × 2 scenes (tie-free), split only within an axis; no death year; day+month as lore only.

**C5 ГЛИФ.** Two taps per axis is the honest minimum for an observed split.
- *Barnum:* at p≈0.4 per axis, ~78% get a crack (the v0.5 mistake again); "завис = ответ" is undefined.
- *Fix:* tune items until "any crack" is 25–60%; quote both answers under the cracked letter; timeout = «?».

**C6 СПОРИМ?** The score is a fact, but majority-answer items (Маме, Кухня) make it measure sender typicality; chance gives 2–3/6.
- *Barnum:* «кто тебя на самом деле видит» is a relationship verdict on coin flips.
- *Fix:* ~50/50 items; show "наугад ≈ 3" by the score; labels as jokes.

**C7 ПУСТОЕ МЕСТО.** 1–2 items per axis, so "two strongest" is a hidden tie-break (v0.5 D4).
- *Barnum:* the model picks the conflict, so everyone gets one; loaded attacks («а если это трусость?») induce flips; "звёздная поправка к паре" is astrology-as-truth about a third party.
- *Fix:* contradiction only on an actual flip of a neutral attack; odd item counts; delete the star adjustment; pair line describes cards, not the relationship.

**C8 ДВОЙНОЕ ДНО.** Cleanest rule: every branch quotes two real answers; МОНОЛИТ is a real, unforced outcome.
- *Barnum:* splits can come from word/scene mismatch (ПРАВДА/МИР scene adds kindness and may flip for most); «5 секунд думал» counts reading as thinking; «НА ДЕЛЕ» oversells a hypothetical.
- *Fix:* pilot per-pair flip rate (15–45%); «КОГДА ДОРОГО» not «НА ДЕЛЕ»; drop «думал».

**C9 ОРАКУЛ.** Hits are real, honesty line excellent; but hits partly measure item correlation, and the boss bet on a consistent axis inflates them.
- *Barnum:* «Я уже знаю» / ОТКРЫТАЯ КНИГА attribute an item property to the player.
- *Fix:* pilot hit bands (none >40%); «ставка сыграла 3 из 4»; always quote the miss.

## Verdict

- **Top 3:**
  1. **C8 ДВОЙНОЕ ДНО.**
  2. **C1 ШАР with the behavior rule and item balancing.**
  3. **C9 ОРАКУЛ.**
- **Runner-up:** C5, if the crack rate is tuned.
- **Most dishonest-risk:** **C7 ПУСТОЕ МЕСТО.** It has a contradiction for 100% of players, hidden tie-breaks, loaded attacks and astrological compatibility. **C4 is second**, because of the death year and a near-universal "broke".

## Minimum reveal rules for builders

1. **Simulation gate.**
   - Run 10k plays: random, single-value-biased and consistent profiles.
   - No headline above 35%, and no line above 60%.
   - At least 3 headline groups at 10% or more.
   - A contradiction or crack fires for 25–60%.
   - Ship the table with the prototype.
2. **A contradiction must be observed.**
   - It needs two of the player's own answers on the same trade-off pointing opposite ways.
   - Consistent players get their own equally good card.
   - No fallback may be labelled a contradiction.
3. **Receipts are verbatim.**
   - The headline quotes the player's act, never a stronger paraphrase.
   - Timeouts and auto-picks show as «не выбрал(а)».
4. **Reaction time is a fact, not a trait.**
   - Compare only within one player and only between similar-length items.
   - Report it only at ≥2× the median.
   - It never decides the headline alone. Never use «думал» or «сомневался».
5. **No hidden tie-breaks on visible claims.** Use odd counts, brackets or full orders.
6. **Seed, birth date and randomness change costume only.** Day and month only. No star adjustments, death years or compatibility verdicts.
7. **Forbidden claims:** diagnosis, life prediction, astrology as evidence, rarity or percentiles, «научно», moral verdicts, claims about third parties.
8. **Yoked-reveal Barnum control in moderated tests.** If another player's result gets «ПОПАЛ» as often as the player's own, the engine is Barnum.
