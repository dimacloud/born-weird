# Build notes: A — ШАР (BUILDER-A, 2026-10-04)

## What was built

- `product/site/lab/a/index.html`: the UI, a single static page (27 KB) with CSS art and no images. It uses `../lab.css`, `../lab.js` and `LAB.init('a')`.
- `product/site/lab/a/game.js`: pure logic (9 KB, UMD `window.SHAR` / `module.exports`). It covers items, the fuse schedule, the throw log, the hesitation rule, the reveal, the share text, the card lines and the friend state.
- `product/site/lab/a/og.json`: 8 result previews, one per kept item. `node operations/lab-og.mjs a` generated `og/` (8 + default PNG) and `r/<code>/`.
- `product/test/lab-a.test.mjs`: the 10k simulation gate plus logic and page checks. `SIM_TABLE=1 node --test product/test/lab-a.test.mjs` prints the table.

**Flow as played**

1. **Screen 1.** «ШАР ПАДАЕТ. ВЫКИДЫВАЙ ЛИШНЕЕ.» A striped CSS balloon sways, particles stream upward (so the balloon is falling) and the altitude counter ticks down. Ropes run into the basket, which is the 2×4 grid of 8 tiles. Tapping a tile throws it: the tile flies off with gravity and rotation, `SND.fall` plays, the sky flashes, the balloon bumps up and the phone vibrates (Android). That tap is `start`.
2. **Throws 2–7** each run a fuse bar via `LAB.timer`, with beeps every 0.5 s. The altitude drops faster as the fuse runs down, and the bar turns red under 35%. The header counts «за бортом N из 7».
3. **The gust before throw 4.** «ПОРЫВ ВЕТРА!» appears with a screen shake, a sawtooth burst and stronger sway. Taps are locked for 0.9 s, then the fuse is halved and the beeps double in speed.
4. **Timeout.** «ШАР НЕ ЖДЁТ» plus `SND.bad` drops a random remaining item. It is logged as `auto`, counted with `track('auto')` and never quoted.
5. **Twist.** «ОСТАЛАСЬ ОДНА ВЕЩЬ. ШАР ВСЁ ЕЩЁ ПАДАЕТ.» The last tile is shown big with [ВЫКИДЫВАЮ] / [ПРЫГАЮ Я] and no timer. Meanwhile the ground has risen visibly, which supplies the tension.
6. **Reveal.**
   - The headline, which comes in two forms:
     - Jump: «В ШАРЕ ОСТАЛСЯ:» / «🐈 ЧУЖОЙ КОТ» / «ПРЫЖОК РАДИ: 🐈».
     - Drop: «ВЫКИНУТО ВСЁ. ПОСЛЕДНИМ:» / item.
   - Receipts: «Первым за борт: X (за 0,8 с)», «Почти остался: Z» and «Дольше всего в руках: W (3,6 с)».
   - The title box «ПРОЗВИЩЕ — НЯНЬКА БЕЗ ВИЗЫ».
   - The friend comparison and the honesty line.
   - Then `L.recog` (chips «что осталось», «что первым за борт», «прозвище»), the 1080×1920 card, «удерживай картинку…», [ПОКАЗАТЬ ДРУГУ] and «ещё раз».
7. **Friend entry** (`#s=5j`).
   - «У ДРУГА В ШАРЕ ОСТАЛОСЬ ОДНО. УГАДАЕШЬ?» shows over the same 8 tiles, and one tap marks ✓/✗ and lights up the answer, plus «и прыжок за борт ради него» if the sender jumped.
   - After 1.7 s comes «ТЕПЕРЬ ТВОЙ ШАР. ВЫКИДЫВАЙ ЛИШНЕЕ.» and the normal game, so the next tap is throw 1.
   - The reveal adds «У друга остался: КОТ. У тебя: КУБОК.» (or «… У тебя тоже.»).

**Events:**
- `view`, `start` (first game tap: the guess for friends, throw 1 otherwise), `done`, `kept_<code>`, `jump` / `drop`, `guess_ok` / `guess_no`, `auto`.
- The kit also sends `share_*` and `rec_*`.

**State:** `<keptIdx 0–7><j|d>`, for example `5j`. Code = kept item slug (`money phone letter passport keys cat manuscript cup`).

**QA hooks:** `?qa=1&demo=mid|gust|twist|reveal|reveal-drop|guess|guessed|friend-reveal` freezes the timers and builds the state.

## Simulation (10,000 runs per model; seeds fixed)

**Models:**
- **uniform:** random throws and a random twist.
- **preference:** each player gets Dirichlet(1) weights × a mild population bias (cat ×1.35, phone ×1.25) and throws the least-wanted item with Gumbel noise.
- **Timing (both models):**
  - Throw 1 takes a median 2.2 s, because it includes reading.
  - Throws 2–7 follow a lognormal with median 0.45 + 0.25·log2(tiles left) s, so fewer tiles means faster.
  - There is a 15% chance of a ×2.6 "dilemma" spike.
  - A time at or above the fuse is a timeout and becomes a random auto-throw, as in the UI.
- **Stress column (not gated):** cat ×3.

| Item | kept, uniform | kept, preference | first thrown, preference | kept, cat ×3 (stress) |
|---|---|---|---|---|
| ДЕНЬГИ НА ГОД | 12.3% | 11.1% | 13.1% | 9.2% |
| ТЕЛЕФОН СО ВСЕМИ ФОТО | 12.0% | 14.9% | 10.7% | 12.9% |
| НЕОТПРАВЛЕННОЕ ПИСЬМО | 12.7% | 11.1% | 13.6% | 8.3% |
| ЗАГРАНПАСПОРТ | 12.7% | 11.6% | 13.2% | 9.3% |
| КЛЮЧИ ОТ ДОМА | 12.4% | 11.2% | 13.2% | 8.3% |
| ЧУЖОЙ КОТ | 13.1% | **16.9%** | 9.8% | **33.9%** |
| НЕДОПИСАННАЯ РУКОПИСЬ | 12.8% | 11.3% | 12.9% | 9.2% |
| КУБОК С ТВОИМ ИМЕНЕМ | 12.0% | 11.9% | 13.4% | 8.9% |

| Line / rate | uniform | preference |
|---|---|---|
| jump (ПРЫГАЮ Я) | 50.8% | 59.4% |
| «за X с» on the first throw (<1.5 s) | 22.0% | 22.0% |
| «Почти остался» (throw 7 chosen) | 90.0% | 89.2% |
| «Дольше всего в руках» (hesitation rule) | 10.5% | 10.8% |
| any auto-throw in the game | 52.4% | 52.8% |
| auto-throws per fused throw | 11.5% | 11.7% |
| throw 7 was auto (kept item partly by chance) | 10.0% | 10.8% |
| honest «ШАР РЕШИЛ ЗА ТЕБЯ» reveal (throw 7 auto or ≥4 autos) | 10.1% | 10.8% |
| most common title | 2.0% | 2.5% |
| distinct titles seen | 56 | 56 |

**Gate results:**
- **Passed.**
  - No kept item is above 30% under the preference model (max 16.9%), and all 8 items are headline groups at ≥10%.
  - All 56 titles are reachable, and none exceeds 2.7%.
  - Every branch is reachable: each kept item, jump/drop, every receipt present and absent, an auto at each throw position, and the friend same/different line.
  - A 20k-reveal text sweep found no `undefined`, `NaN`, empty lines, «(а)» or past-tense verbs about the player.
  - Broken friend states decode to `null`.
- **"Contradiction/split fires 25–60%": not applicable by design.** A has no contradiction line; the spec chose objects as facts and the title as play. The closest optional line, hesitation, fires for about 12%. That is low because it can only happen on throws 2–3; the fuse is under 2.5 s after the gust. The jump/drop split is a human choice the sim can't predict. Read `jump` vs `drop` from the counters.
- **The stress case breaks the cap.** If real players protect the cat much more than modelled (×3), the cat is kept by about 34%. The behavior reviewer estimated 40–60% for the cat in the old item set. Watch `kept_cat` / `done` in the first human round. The fix is copy, not code: make another item as tempting.

`node --test 'product/test/*.test.mjs'`: 52/52 pass, including the engine tests and the B and C tests present at the time.

## Deviations from spec (with reasons)

1. **Fuse schedule.** There is no fuse on throw 1, because that throw is the start tap and an idle reader must not be auto-thrown. The fuse runs 4 s on throw 2, then 3 s, and the gust halves it to 2 s, then 1.9, 1.8 and 1.7 s.
   - "Halves for the remaining throws" from the shrinking schedule would mean about 1.1 s. In the model that gave 70% of games an auto-throw and 28% of kept items decided by chance at throw 7.
   - With a 1.7 s floor it is 11.7% per throw and 10.8% at throw 7.
2. **Headline verb agrees with the item.** «ОСТАЛСЯ / ОСТАЛАСЬ / ОСТАЛОСЬ / ОСТАЛИСЬ» (and «Почти остался/…») replace the fixed «ОСТАЛСЯ»/«остались», because «ОСТАЛСЯ: ДЕНЬГИ» is broken Russian. The drop headline is split «ВЫКИНУТО ВСЁ. ПОСЛЕДНИМ:» (small) plus the item (big), for layout.
3. **Jump second line.** «ПРЫЖОК РАДИ: 🐈 КОТ» uses the emoji plus the short name, so the full name isn't printed twice in a row.
4. **Title = noun + «без …» tail, not adjective + noun.** Noun by family(kept): КОПИЛКА, АРХИВ, ТИХОНЯ, БРОДЯГА, ЯКОРЬ, НЯНЬКА, ЧЕРНОВИК, ЗВЕЗДА. Tail by family(first thrown): БЕЗ ЗАПАСА, БЕЗ ПРОШЛОГО, БЕЗ ПРИЗНАНИЙ, БЕЗ ВИЗЫ, БЕЗ АДРЕСА, БЕЗ ОБЯЗАТЕЛЬСТВ, БЕЗ ЧЕРНОВИКОВ, БЕЗ НАГРАД.
   - An adjective about the player must agree in gender. A «без …» tail never does.
   - The nouns are either common-gender (ТИХОНЯ, БРОДЯГА, НЯНЬКА) or things (КОПИЛКА, АРХИВ, ЯКОРЬ, ЧЕРНОВИК, ЗВЕЗДА), so none reads as male or female. Round 1 used masculine role nouns; QA-A asked for them to go.
5. **The cup is «С МОИМ ИМЕНЕМ» on the card, share text and OG** (the reveal keeps «С ТВОИМ»). Otherwise the recipient reads «КУБОК С ТВОИМ ИМЕНЕМ» as their own name. The friend comparison uses short names (КОТ, КУБОК).
6. **Share text per twist.**
   - Jump: «В моём шаре остался ЧУЖОЙ КОТ, а за борт прыгаю я. А что останется в твоём?»
   - Drop: «В моём шаре до последнего держался ЧУЖОЙ КОТ. А что останется в твоём?» The verb refers to the item, not the player.
7. **Card line 1** is «В ШАРЕ ОСТАЛСЯ:» on a jump and «ДО ПОСЛЕДНЕГО В ШАРЕ:» on a drop. The OG pages use the «В ШАРЕ ОСТАЛСЯ: …» form for both, because there are 8 pages, not 16.
8. **The 12-word limit** is met by the instruction copy (4 words). The 8 tile labels (about 21 words) are the game pieces the spec fixes for A.
9. **The guess tap counts as `start`**, because it is the first game tap for friends. Their own throw 1 then follows with no button.
10. **Throw 1's time** is counted from when the tiles appear (for friends, from «ТЕПЕРЬ ТВОЙ ШАР»), and it is quoted only when under 1.5 s. The hesitation rule ignores throw 1, because that time includes reading.

## Round 2: QA-A fixes (qa-a.md, CEO-001)

1. **The honest branch for a basket the fuse decided.** It fires if throw 7 was auto or at least 4 of the 6 fused throws were auto (about 10.8% of plays in the model).
   - The reveal reads «ШАР РЕШИЛ ЗА ТЕБЯ:» plus the item, «Первым за борт: …» (if quick) and «Без тебя за борт: N из 7».
   - It ends with «Это выбор шара, не твой. Ещё раз — быстрее?» and a big [ЕЩЁ РАЗ — БЫСТРЕЕ].
   - There is no jump line, title, card, share or recog. It tracks `done` plus `auto_reveal` (not `kept_*`).
2. **Drop card.** The basket is empty, and the kept item is drawn falling beside it.
3. **[ПОКАЗАТЬ ДРУГУ] sits directly under the title box** and the friend comparison, before the honesty line, recog and card. At 375×812 the button ends at y≈380.
4. **No scroll during play.** `body.playing` removes the bottom padding and hides overflow, giving `scrollHeight − innerHeight = 0` at 320×568 and 375×812 on the first, mid and twist screens.
5. **Jump line:** «ПРЫЖОК РАДИ: 🐈 КОТ».
6. **Gender-neutral nicknames** (see deviation 4).
7. **One guess per tab.** `sessionStorage['bw_lab_a_guessed_<s>']` is set on the guess. A reload skips straight to «ТЕПЕРЬ ТВОЙ ШАР».

**Nits also fixed:**
- The drop headline agrees with the item (ПОСЛЕДНИМ/ПОСЛЕДНЕЙ/ПОСЛЕДНИМИ).
- The twist reads «ОСТАЛАСЬ ОДНА ВЕЩЬ.».
- There is an NBSP after «за».
- Tile padding and letter-spacing are tightened.
- The card address is 35 px (inside the central 70%), and the streaks skip the text band.
- The clock no longer leaks in `reset`.
- Throws before the fuse starts are timed from the previous throw.
- The demo hooks no longer call `vibrate`.

**Not fixed** (outside A's files):
- the `?qa=1` loss in the `lab-og.mjs` redirect;
- the kit's share-chain order;
- the kit's «ПОПАЛ?».

## Verification

- Screenshots at 375×812 and 320×568 cover the first screen, mid-game, the gust, the twist, the reveal (jump and drop), the friend guess before and after, the friend reveal and a full click-through with a real timeout.
  - They were taken through a small CDP script with `Emulation.setDeviceMetricsOverride`. The plain `--window-size=375,812` flag does not work: headless Chrome clamps the layout viewport to 500 px wide, so the screenshots crop instead of reflowing.
  - Every choice screen fits 320×568 with no horizontal scroll. Tiles are at least 56 px tall.
- **Friend entry.**
  - `/lab/a/r/cat/#ref=cat&s=5j` redirects and shows the guess screen.
  - `#s=%7Bzz` and `#s=9j` silently show the normal first screen.
- **Weight:** 36 KB (index + game.js). The only external requests are the kit's counters, which are off under `?qa=1`.

## Known issues

- **About 1 play in 9 ends in the honest «ШАР РЕШИЛ ЗА ТЕБЯ» reveal**, which has no share. The threshold is in `AUTO_MIN`; tune it after humans play.

- **The cat may still dominate with real humans** (see the stress column). Measure `kept_cat` before tuning.
- **About half of all games include at least one auto-throw**, mostly from post-gust "dilemma" pauses. That is intended panic, but 1 game in 10 keeps an item that the fuse, not the player, decided between the last two. The headline is still a fact («осталось»), the twist is the player's own choice, and the auto-throw is never quoted.
- **Sound and vibration were not verified** in headless Chrome; the code calls `SND.*` after the kit's first-touch unlock. Vibration does nothing on iOS.
- **Card emoji** use the system emoji font (Apple, Noto). On a device without colour emoji they fall back to monochrome glyphs.
- **The scene animation loop** runs only while the game screen is visible and stops on the reveal and in hidden tabs.

## Kit notes (no kit edits made)

- At the start of the build, `operations/serve.mjs` served `.css` as `application/octet-stream`, so `lab.css` didn't load locally. Someone has since added `.css`/`.json` to it. I used `python3 -m http.server` until then, and re-checked with `serve.mjs` afterwards.
- **Suggestion:** `FINALISTS.md`'s `--window-size` screenshot recipe silently renders at 500 px wide. Builders should use device-metrics emulation (CDP/puppeteer) for 375/320 shots.
- **Nice to have:** `SND.wind()` and `SND.jump()` presets. A builds both from `SND.tone`.
