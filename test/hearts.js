// Hearts carry over between stages: node test/hearts.js <outdir>
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.resolve(__dirname, '../test-output/hearts');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [];
  const check = (cond, msg) => results.push((cond ? 'PASS ' : 'FAIL ') + msg);
  async function open(suffix) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await page.goto('file://' + path.resolve(__dirname, '../dist/preview.html') + (suffix || ''));
    await page.waitForTimeout(300);
    return page;
  }
  const B = page => page.evaluate(() => { const b = window.__mim.state.battle; return b && JSON.parse(JSON.stringify(b)); });
  const save = page => page.evaluate(() => JSON.parse(JSON.stringify(window.MIM.state.save)));
  const screen = page => page.evaluate(() => window.MIM.state.screen);
  const hearts = page => page.evaluate(() => window.MIM.heartsNow());
  const text = async (page, sel) => ((await page.textContent(sel)) || '').replace(/\s+/g, ' ').trim();
  const overflow = page => page.evaluate(() => { const s = document.querySelector('.screen'); return s.scrollWidth - s.clientWidth; });
  async function answer(page, correct) {
    const p = await page.evaluate(() => { const b = window.__mim.state.battle; return { input: b.puzzle.input, answer: b.puzzle.answer, n: b.puzzle.choices ? b.puzzle.choices.length : 0 }; });
    if (p.input === 'number') { for (const ch of String(correct ? p.answer : p.answer + 1)) await page.click(`.key[data-arg="${ch}"]`); }
    else await page.click(`.choice[data-arg="${correct ? p.answer : (p.answer + 1) % p.n}"]`);
    await page.click('#cast-btn');
    await page.waitForTimeout(600);
  }
  async function spell(page, i, correct) { await page.click(`.spell[data-arg="${i}"]`); await page.waitForTimeout(150); await answer(page, correct); }
  async function nextBtn(page) { await page.click('#next-btn'); await page.waitForTimeout(200); }
  async function winOut(page) {
    for (let i = 0; i < 30 && await screen(page) === 'battle'; i++) {
      if (await page.evaluate(() => window.__mim.state.battle.phase) === 'feedback') { await nextBtn(page); continue; }
      await spell(page, 2, true);
    }
    await page.waitForTimeout(300);
  }
  const fight = (page, realm) => page.evaluate(i => { window.MIM.state.realm = i; window.MIM.actions.fight(); }, realm);

  // 1. Lose a heart in stage 1, win, and the next stage starts with what is left
  let page = await open();
  await page.click('text=Start the adventure'); await page.fill('#hero-name', 'Rina'); await page.click('text=Ready!'); await page.waitForTimeout(150);
  check(/3 hearts/.test(await text(page, '.me-hearts')), 'new game: map shows 3 full hearts');
  await page.click('.stop >> button:has-text("Fight")'); await page.click('.intro >> button.btn-primary'); await page.waitForTimeout(200);
  await spell(page, 0, false);
  let b = await B(page), s = await save(page);
  check(b.hearts === 2 && s.hurt === 1, 'a wrong answer is saved straight away (hurt 1)');
  await nextBtn(page);
  await winOut(page);
  s = await save(page);
  check(await screen(page) === 'result' && s.stars[0] === 2, 'stage 1 won with 2 stars');
  check(s.hurt === 1 && /come with you/.test(await text(page, '.carry')), 'result screen says the 2 hearts carry on');
  check(await page.getAttribute('.carry .mini-hearts', 'aria-label') === '2 of 3 hearts', 'result shows 2 of 3 hearts');
  check(await overflow(page) <= 1, 'no sideways scroll on the result screen');
  await page.screenshot({ path: path.join(OUT, 'h1-result-carry.png') });

  await page.click('text=Choose your job'); await page.waitForTimeout(150);
  await page.click('[data-act="pickJob"][data-arg="flame"]'); await page.waitForTimeout(150);
  await page.click('[data-act="jobsDone"]'); await page.waitForTimeout(150);
  check(await screen(page) === 'intro' && /2 of 3 hearts left from your last fight/.test(await text(page, '.rules')), 'stage 2 intro says 2 of 3 hearts are left');
  await page.screenshot({ path: path.join(OUT, 'h2-intro.png') });
  await page.click('.intro >> button.btn-primary'); await page.waitForTimeout(200);
  b = await B(page);
  check(b.hearts === 2 && b.maxHearts === 3, 'stage 2 battle starts with 2 of 3 hearts');
  check(await page.getAttribute('#hearts', 'aria-label') === '2 of 3 hearts', 'battle heart row shows 2 of 3');
  await page.screenshot({ path: path.join(OUT, 'h3-battle.png') });
  await winOut(page);
  s = await save(page);
  check(s.stars[1] === 3 && s.hurt === 1, 'winning without a new mistake still gives 3 stars, hearts stay at 2');

  // 2. Map shows the carried hearts; Jamu brings one back and that is saved too
  await page.click('[data-act="toMap"]'); await page.waitForTimeout(150);
  check(/2 of 3 hearts/.test(await text(page, '.me-hearts')), 'map shows 2 of 3 hearts');
  check(await overflow(page) <= 1, 'no sideways scroll on the map');
  await page.screenshot({ path: path.join(OUT, 'h4-map.png') });
  await fight(page, 2); await page.waitForTimeout(200);
  await page.click('.item[data-arg="jamu"]'); await page.click('[data-act="useItem"][data-arg="jamu"]'); await page.waitForTimeout(250);
  b = await B(page); s = await save(page);
  check(b.hearts === 3 && s.hurt === 0, 'Jamu Potion restores a heart and it is saved');
  await page.click('[data-act="quitBattle"]'); await page.waitForTimeout(150);
  check(/3 hearts/.test(await text(page, '.me-hearts')) && !/of 3/.test(await text(page, '.me-hearts')), 'leaving the battle keeps the healed hearts');

  // 3. Leaving mid-battle keeps the hearts lost there, and so does a reload
  await fight(page, 2); await page.waitForTimeout(200);
  await spell(page, 0, false);
  await page.click('[data-act="quitBattle"]'); await page.waitForTimeout(150);
  check(/2 of 3 hearts/.test(await text(page, '.me-hearts')), 'running away keeps the lost heart');
  await page.reload(); await page.waitForTimeout(300);
  let h = await hearts(page);
  check(h.now === 2 && h.max === 3, 'hearts survive a reload: ' + JSON.stringify(h));

  // 4. Running out of hearts: the fight is lost and hearts are full for the retry
  await page.click('[data-act="toMap"]'); await page.waitForTimeout(150);
  await fight(page, 2); await page.waitForTimeout(200);
  for (let i = 0; i < 4 && await screen(page) === 'battle'; i++) {
    if (await page.evaluate(() => window.__mim.state.battle.phase) === 'feedback') { await nextBtn(page); continue; }
    await spell(page, 0, false);
  }
  await page.waitForTimeout(300);
  s = await save(page);
  const lost = await page.evaluate(() => window.MIM.state.result);
  check(await screen(page) === 'result' && lost && !lost.won, 'two wrong answers from 2 hearts lose the fight');
  check(s.hurt === 0 && /full again/.test(await text(page, '.carry')), 'loss screen: hearts are full again');
  await page.screenshot({ path: path.join(OUT, 'h5-lost.png') });
  await page.click('[data-act="fight"]'); await page.waitForTimeout(200);
  b = await B(page);
  check(b.hearts === 3 && b.maxHearts === 3, 'Try again starts with full hearts');
  await page.close();

  // 5. A rank-up that adds a heart adds it full
  page = await open('?cheat=onehit');
  await page.evaluate(() => localStorage.setItem('math-is-magic-v1', JSON.stringify({ hero: { name: 'Rina' }, made: true, stars: [3, 3, 3, 0, 3, 0, 0, 0, 0, 0], unlocked: 6, champion: true, job: 'flame', hurt: 1 })));
  await page.reload(); await page.waitForTimeout(300);
  h = await hearts(page);
  check(h.now === 2 && h.max === 3, 'seeded save: 2 of 3 hearts with 4 stages cleared');
  await fight(page, 3); await page.waitForTimeout(200);
  await spell(page, 0, true); await nextBtn(page); await page.waitForTimeout(300);
  s = await save(page);
  check(s.stars[3] === 3 && await page.getAttribute('.carry .mini-hearts', 'aria-label') === '3 of 4 hearts', 'the 5th stage cleared adds a 4th heart, full: 3 of 4');
  await page.screenshot({ path: path.join(OUT, 'h6-rankup.png') });

  // 6. Extra hearts from the Nature job also arrive full
  await page.click('text=Choose your job'); await page.waitForTimeout(150);
  await page.click('[data-act="pickJob"][data-arg="nature"]'); await page.waitForTimeout(150);
  h = await hearts(page);
  check(h.now === 5 && h.max === 6, 'Nature job (+2 hearts) gives 5 of 6: ' + JSON.stringify(h));
  await page.close();

  // 7. Saves from before this change start full
  page = await open();
  await page.evaluate(() => localStorage.setItem('math-is-magic-v1', JSON.stringify({ hero: { name: 'Rina' }, made: true, stars: [3, 2, 0, 0, 0, 0, 0, 0, 0, 0], unlocked: 3, job: 'shield' })));
  await page.reload(); await page.waitForTimeout(300);
  h = await hearts(page);
  check(h.now === h.max && (await save(page)).hurt === 0, 'older save starts with full hearts');

  await browser.close();
  console.log(results.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
