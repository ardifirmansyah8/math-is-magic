// Power-up checks: node test/powerups.js <outdir>
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [];
  const check = (cond, msg) => results.push((cond ? 'PASS ' : 'FAIL ') + msg);
  async function open(w, h, mobile) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errors.push(`[${w}] console: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`[${w}] pageerror: ${e.message}`));
    await page.goto('file://' + path.resolve(__dirname, '../dist/preview.html'));
    await page.waitForTimeout(300);
    return page;
  }
  const B = page => page.evaluate(() => { const b = window.__mim.state.battle; return b && JSON.parse(JSON.stringify(b)); });
  const items = page => page.evaluate(() => Object.assign({}, window.MIM.state.save.items));
  async function answer(page, correct) {
    const p = await page.evaluate(() => { const b = window.__mim.state.battle; return { input: b.puzzle.input, answer: b.puzzle.answer, n: b.puzzle.choices ? b.puzzle.choices.length : 0 }; });
    if (p.input === 'number') { for (const ch of String(correct ? p.answer : p.answer + 1)) await page.click(`.key[data-arg="${ch}"]`); }
    else await page.click(`.choice[data-arg="${correct ? p.answer : (p.answer + 1) % p.n}"]`);
    await page.click('#cast-btn');
    await page.waitForTimeout(650);
  }
  async function use(page, id) {
    await page.click(`.item[data-arg="${id}"]`);
    await page.click(`[data-act="useItem"][data-arg="${id}"]`);
    await page.waitForTimeout(250);
  }

  const page = await open(390, 844, true);
  await page.click('text=Start the adventure'); await page.click('text=Ready!'); await page.waitForTimeout(150);
  const mapInv = await page.textContent('.inv');
  check(/×1.*×1.*×1.*×1/.test(mapInv.replace(/\s+/g, '')), 'map shows starter kit: ' + mapInv.replace(/\s+/g, ' ').trim());
  await page.screenshot({ path: path.join(OUT, 'p1-map.png') });
  await page.click('.stop >> button:has-text("Fight")'); await page.click('button:has-text("Fight Mossling!")'); await page.waitForTimeout(250);
  check((await page.$$('.item')).length === 4, 'four power-up buttons in battle');

  // Jamu with full hearts is refused with a reason
  await page.click('.item[data-arg="jamu"]'); await page.waitForTimeout(100);
  const jamuWhy = await page.textContent('.item-info');
  check(/already full/.test(jamuWhy) && !(await page.$('[data-act="useItem"]')), 'jamu blocked at full hearts');
  await page.screenshot({ path: path.join(OUT, 'p2-info-blocked.png') });
  await page.click('.item[data-arg="jamu"]'); // close

  // Shield up, then a wrong answer costs nothing
  await use(page, 'shield');
  let b = await B(page);
  check(b.shield === true && (await items(page)).shield === 0, 'shield activates and is used up');
  check(await page.$eval('#f-mage', el => el.classList.contains('shielded')), 'mage shows the shield bubble');
  // Double Chalk on a Spark
  await use(page, 'double');
  await page.screenshot({ path: path.join(OUT, 'p3-shield-double-active.png') });
  await page.click('.spell[data-arg="0"]'); await page.waitForTimeout(250);
  const tag = await page.textContent('.pz-head .tag');
  check(/2 power/.test(tag) && /×2/.test(tag), 'puzzle tag shows doubled power: ' + tag.trim());
  await answer(page, true);
  b = await B(page);
  check(b.last.ok && b.last.dmg === 2 && b.last.doubled && !b.double, 'Double Chalk doubled Spark to 2 and was used up');
  check(b.hp === 4, 'monster hp 6 -> 4');
  await page.click('#next-btn'); await page.waitForTimeout(150);

  await page.click('.spell[data-arg="0"]'); await page.waitForTimeout(200);
  await answer(page, false);
  b = await B(page);
  check(b.hearts === 3 && b.last.blocked && !b.shield, 'shield blocked the hit, hearts still 3');
  const fbText = await page.textContent('.feedback');
  check(/Shield Charm blocks it/.test(fbText), 'feedback mentions the shield');
  await page.screenshot({ path: path.join(OUT, 'p4-blocked-feedback.png') });
  await page.click('#next-btn'); await page.waitForTimeout(150);

  // Eraser swaps the puzzle
  await page.click('.spell[data-arg="1"]'); await page.waitForTimeout(200);
  const before = await page.evaluate(() => window.__mim.state.battle.puzzle.prompt + window.__mim.state.battle.puzzle.html);
  await page.click('.item[data-arg="eraser"]'); await page.waitForTimeout(80);
  await page.screenshot({ path: path.join(OUT, 'p5-eraser-info.png') });
  await page.click('[data-act="useItem"][data-arg="eraser"]'); await page.waitForTimeout(250);
  const after = await page.evaluate(() => window.__mim.state.battle.puzzle.prompt + window.__mim.state.battle.puzzle.html);
  check(before !== after && (await items(page)).eraser === 0, 'eraser replaced the puzzle');
  await answer(page, false);
  b = await B(page);
  check(b.hearts === 2, 'wrong answer without shield costs a heart');
  await page.click('#next-btn'); await page.waitForTimeout(150);

  // Jamu brings the heart back
  await use(page, 'jamu');
  b = await B(page);
  check(b.hearts === 3 && (await items(page)).jamu === 0, 'jamu restored a heart');

  // Empty power-up explains how to get more
  await page.click('.item[data-arg="jamu"]'); await page.waitForTimeout(80);
  check(/none left/.test(await page.textContent('.item-info')), 'empty power-up explains how to earn more');
  await page.click('.item[data-arg="jamu"]');

  // Three in a row drops a power-up
  let dropSeen = null;
  for (let i = 0; i < 3; i++) {
    await page.click('.spell[data-arg="0"]'); await page.waitForTimeout(150);
    await answer(page, true);
    b = await B(page);
    if (b.last.drop) { dropSeen = b.last.drop; await page.screenshot({ path: path.join(OUT, 'p6-loot.png') }); }
    if (!b || b.hp === 0) break;
    await page.click('#next-btn'); await page.waitForTimeout(150);
  }
  check(!!dropSeen, 'third correct answer in a row dropped: ' + dropSeen);

  // Finish the fight and look for the victory prize
  for (let i = 0; i < 10 && await page.evaluate(() => window.__mim.state.screen) === 'battle'; i++) {
    const ph = await page.evaluate(() => window.__mim.state.battle.phase);
    if (ph === 'feedback') { await page.click('#next-btn'); await page.waitForTimeout(150); continue; }
    await page.click('.spell[data-arg="2"]'); await page.waitForTimeout(150);
    await answer(page, true);
  }
  await page.waitForTimeout(300);
  const res = await page.evaluate(() => window.MIM.state.result);
  check(res && res.won && !!res.drop, 'victory prize granted: ' + (res && res.drop));
  check(/Victory prize/.test(await page.textContent('.result')), 'result screen shows the prize');
  await page.screenshot({ path: path.join(OUT, 'p7-result.png') });

  // Inventory survives a reload
  const invBefore = await items(page);
  await page.reload(); await page.waitForTimeout(300);
  const invAfter = await page.evaluate(() => window.MIM.state.save.items);
  check(JSON.stringify(invBefore) === JSON.stringify(invAfter), 'inventory saved: ' + JSON.stringify(invAfter));

  // Overflow at phone width during battle with info strip open
  await page.evaluate(() => { window.MIM.state.realm = 0; window.MIM.actions.fight(); });
  await page.waitForTimeout(200);
  await page.click('.item[data-arg="double"]'); await page.waitForTimeout(100);
  const ov = await page.evaluate(() => { const s = document.querySelector('.screen'); return s.scrollWidth - s.clientWidth; });
  check(ov <= 1, 'no sideways scroll at 390px with info open');
  await page.screenshot({ path: path.join(OUT, 'p8-phone-kit.png') });

  // Old saves without items get the starter kit
  const p2 = await open(390, 844, true);
  await p2.evaluate(() => localStorage.setItem('math-is-magic-v1', JSON.stringify({ hero: { name: 'Rina' }, stars: [3, 0, 0, 0, 0], unlocked: 2, made: true })));
  await p2.reload(); await p2.waitForTimeout(300);
  check(JSON.stringify(await p2.evaluate(() => window.MIM.state.save.items)) === JSON.stringify({ shield: 1, jamu: 1, double: 1, eraser: 1 }), 'older save gets the starter kit');

  // Desktop look
  const d = await open(1280, 800, false);
  await d.click('text=Start the adventure'); await d.click('text=Ready!'); await d.waitForTimeout(100);
  await d.click('.stop >> button:has-text("Fight")'); await d.click('button:has-text("Fight Mossling!")'); await d.waitForTimeout(200);
  await use(d, 'shield');
  await d.click('.spell[data-arg="2"]'); await d.waitForTimeout(300);
  await d.click('.item[data-arg="eraser"]'); await d.waitForTimeout(100);
  await d.screenshot({ path: path.join(OUT, 'p9-desktop.png') });

  await browser.close();
  console.log(results.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
