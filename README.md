# Math Is Magic

A chalkboard adventure where every spell is a math puzzle. Dress your mage, pick a spell, solve its puzzle to cast it, and beat ten monsters across two chapters.

**Play:** https://ardifirmansyah8.github.io/math-is-magic/

## What's in the game

- 13 olympiad-style puzzle types, each with 5 levels: number patterns, magic squares, potion algebra, heads and legs, calendar and clock, working backwards, clever sums, counting, odd one out, picture patterns, mystery numbers, shapes, and age puzzles. Puzzles are generated fresh every time.
- Three spells (Spark, Flare, Comet). Harder puzzles hit harder.
- Power-ups: Shield Charm, Jamu Potion, Double Chalk and Board Eraser.
- Chapter 2 monsters with tricks: armoured, thief, regrows and gusty.
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

## Layout

```
src/puzzles-*.js   puzzle generators (pure functions that also run in Node)
src/art.js         chalk-style SVG drawings
src/app.js         screens, saving and sound
src/battle.js      battles, power-ups and monster tricks
src/style-*.css    styles
src/template.html  page shell
docs/index.html    the built site that GitHub Pages serves
```
