# Math Is Magic

A chalkboard adventure where every spell is a math puzzle. Dress your mage, pick a spell, solve its puzzle to cast it, and beat ten monsters across two chapters.

**Play:** https://ardifirmansyah8.github.io/math-is-magic/

## What's in the game

- 13 olympiad-style puzzle types, each with 5 levels: number patterns, magic squares, potion algebra, heads and legs, calendar and clock, working backwards, clever sums, counting, odd one out, picture patterns, mystery numbers, shapes, and age puzzles. Puzzles are generated fresh every time.
- Three spells from your job's spellbook (Fire, Holy, Meteor and more). Harder puzzles hit harder, and every monster has a weak spot.
- Ranks from Trainee Mage to Grand Mage, with a job to pick after each stage (Flame, Shield, Wisdom, Nature, Time or Star), each with its own skill.
- Power-ups: Shield Charm, Jamu Potion, Double Chalk and Board Eraser.
- Hearts carry over from one fight to the next. Jamu Potions give hearts back, and losing a fight refills them for the retry.
- Chapter 2 monsters with tricks: armoured, thief, regrows and gusty.
- A monster notebook, and a parent page with practice history and recent mistakes.
- Girl or boy mage with hairstyles, hijab and peci options.
- Progress saves in the player's browser.

Plain HTML, CSS and JavaScript with inline SVG art. No framework and no runtime dependencies.

## Develop

```sh
node build.js               # builds docs/index.html (the site) and dist/ (claude.ai build + local preview)
node test/puzzles.test.js   # brute-force checks every puzzle generator's answers
```

Browser tests use Playwright:

```sh
npm install
node test/play.js test-output/play   # plays all ten stages and saves screenshots
```

An optional `local.json` (not committed) sets a default player name for the claude.ai build: `{ "defaultName": "..." }`.

## Cheat

Add `?cheat=onehit` to the address and every correct answer defeats the monster in one hit: https://ardifirmansyah8.github.io/math-is-magic/?cheat=onehit

`#onehit` on the end of the address does the same, and is the form to use on a claude.ai link. Wrong answers still cost hearts, progress saves as usual, and answers given with the cheat on are left out of the parent page.

## Layout

```
src/puzzles-*.js   puzzle generators (pure functions that also run in Node)
src/art.js         chalk-style SVG drawings
src/monsters-*.js  monster drawings
src/jobs.js        ranks, jobs, skills and spellbooks
src/app.js         screens, saving and sound
src/pages.js       parent page and answer tracking
src/battle.js      battles, power-ups, monster tricks and the cheat
src/style-*.css    styles
src/template.html  page shell
docs/index.html    the built site that GitHub Pages serves
```
