# Round 2 — ШАР reveal that means something (CEO-001, 2026-10-04)

**Founder signal:** the play is alive, the reveal is not. «Чужой кот… нянька без запаса — что это значит? зачем?»

**The rule this round:**
- The reveal must answer in one plain sentence: *what does what I did say about me?*
- It must not explain *how* anything was computed.
- Opaque labels go. A title stays only if a stranger understands it without a legend.

**Untouched:** the game itself (items, throws, gust, twist, timeouts), the friend entry, the share plumbing.

## Item → meaning (the hidden layer becomes visible on the reveal only)

| Item | Value word (shown in v2) | "держишься за…" (kept) | "легко отпускаешь…" (thrown first) |
|---|---|---|---|
| ДЕНЬГИ НА ГОД | БЕЗОПАСНОСТЬ | запас на чёрный день | запас на чёрный день |
| ТЕЛЕФОН СО ВСЕМИ ФОТО | ПАМЯТЬ | своё прошлое | прошлое |
| НЕОТПРАВЛЕННОЕ ПИСЬМО | ЧУВСТВА | несказанное | несказанное |
| ЗАГРАНПАСПОРТ | СВОБОДА | возможность уехать | возможность уехать |
| КЛЮЧИ ОТ ДОМА | ДОМ | своё место | своё место |
| ЧУЖОЙ КОТ | ДОЛГ | тех, кто на тебя рассчитывает | чужие ожидания |
| НЕДОПИСАННАЯ РУКОПИСЬ | МЕЧТА | своё недоделанное большое | мечту «на потом» |
| КУБОК С ИМЕНЕМ | ПРИЗНАНИЕ | то, что тебя заметили | чужое признание |

The builder writes the final phrasing so each phrase reads naturally in both templates (Russian, gender-neutral, present tense).

## v1 «СМЫСЛ»
```
В ШАРЕ ОСТАЛСЯ: 🐈 ЧУЖОЙ КОТ
Ты держишься за тех, кто на тебя рассчитывает, —
и первым отпускаешь запас на чёрный день.
[ ПОКАЗАТЬ ДРУГУ ]
Первым за борт: деньги на год · Почти остались: ключи от дома
```
- **Jump:** the first line is «ПРЫЖОК РАДИ: 🐈 ЧУЖОЙ КОТ», plus one line after the sentence: «Ради этого — даже за борт сам(и)…». Use a gender-neutral form, for example «Ради этого не жалко и себя.»
- **Drop:** «ВЫКИНУТО ВСЁ. ПОСЛЕДНИМ: X», then the same sentence about X and the first-thrown item, plus «Ради себя можно отпустить и это.»
- **Card:** the headline item plus the sentence, nothing else (and the brand and address).

## v2 «КОМПАС»
- Show the top 4 kept items, in reverse throw order, as value words: «ДОЛГ > ДОМ > СВОБОДА > ПАМЯТЬ».
- Add one line of what it means, in the same plain style as v1, built from the #1 value and the first-thrown item.
- **Contradiction**, only if it was observed. It fires when two of the top 3 come from an opposite pair: СВОБОДА↔ДОМ, ПРИЗНАНИЕ↔ДОЛГ, МЕЧТА↔БЕЗОПАСНОСТЬ, ПАМЯТЬ↔ЧУВСТВА. Then show «ПРОТИВОРЕЧИЕ: СВОБОДА × ДОМ — хочешь уехать и боишься потерять своё место.» with one hand-written line per pair.
- If there is no opposite pair in the top 3, show nothing in its place. There is no fake contradiction.
- **Card:** the value order plus the contradiction line if one exists, otherwise the meaning line.

## Both variants
- Remove the 8×8 nickname («НЯНЬКА БЕЗ ЗАПАСА») and the honesty line «Тут ничего не вычислено…».
- The reveal fits one 375×812 screen, with the share button on that screen.
- **Share text:** v1 «В моём шаре остался ЧУЖОЙ КОТ. А что спасёшь ты?»; v2 «Мой компас: ДОЛГ > ДОМ > СВОБОДА. А твой?»
- **Analytics:**
  - `v1_view`, `v1_done`, `v1_share_ok`, `v1_rec_*` and the same for `v2` (prefix as `track('v1_done')` etc. in addition to the core events);
  - `contra_shown` and `contra_none` for v2.
- **Friend entry:** unchanged. The share state carries the variant, so a friend sees the sender's variant first and then is assigned their own 50/50.
- **Sim gate:**
  - v1: no meaning sentence above 15% (8×7 combinations).
  - v2: the contradiction fires for 25–60% under the preference model. Report the number. If it's out of range, adjust only the pair definitions and say so.
