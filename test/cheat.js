// One-hit cheat: node test/cheat.js
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [];
  const check = (c, m) => results.push((c ? 'PASS ' : 'FAIL ') + m);
  async function run(suffix, correct) {
    const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await page.goto('file://' + path.resolve(__dirname, '../dist/preview.html') + suffix);
    await page.waitForTimeout(300);
    await page.evaluate(() => { localStorage.setItem('math-is-magic-v1', JSON.stringify({ hero: { name: 'Rina' }, made: true, stars: [3, 3, 3, 3, 0, 0, 0, 0, 0, 0], unlocked: 5, job: 'flame' })); });
    await page.reload(); await page.waitForTimeout(300);
    await page.evaluate(() => { window.MIM.state.realm = 4; window.MIM.actions.fight(); }); await page.waitForTimeout(200);
    const chip = !!(await page.$('.cheat-chip'));
    await page.click('.spell[data-arg="0"]'); await page.waitForTimeout(150);
    const p = await page.evaluate(() => { const b = window.__mim.state.battle; return { input: b.puzzle.input, answer: b.puzzle.answer, n: b.puzzle.choices ? b.puzzle.choices.length : 0 }; });
    if (p.input === 'number') { for (const ch of String(correct ? p.answer : p.answer + 1)) await page.click(`.key[data-arg="${ch}"]`); }
    else await page.click(`.choice[data-arg="${correct ? p.answer : (p.answer + 1) % p.n}"]`);
    await page.click('#cast-btn'); await page.waitForTimeout(700);
    const b = await page.evaluate(() => JSON.parse(JSON.stringify(window.__mim.state.battle)));
    const text = await page.textContent('.feedback');
    const tracked = await page.evaluate(() => { const st = window.MIM.state.save.stats; return st && st.recent ? st.recent.length : 0; });
    if (suffix === '?cheat=onehit' && correct) await page.screenshot({ path: process.argv[2] ? path.join(process.argv[2], 'cheat.png') : '/dev/null' }).catch(() => {});
    await page.close();
    return { chip, hp: b.hp, hearts: b.hearts, maxHearts: b.maxHearts, text, tracked };
  }
  let r = await run('?cheat=onehit', true);
  check(r.chip && r.hp === 0 && /one-hit cheat/.test(r.text), '?cheat=onehit: one correct answer beats Nolnaga (15 HP)');
  r = await run('?onehit', true);
  check(r.hp === 0, '?onehit works too');
  r = await run('#onehit', true);
  check(r.chip && r.hp === 0, '#onehit works (for the claude.ai link)');
  r = await run('?cheat=onehit', false);
  check(r.hp === 15 && r.hearts === r.maxHearts - 1, `wrong answers still cost a heart with the cheat on (hp ${r.hp}, hearts ${r.hearts}/${r.maxHearts})`);
  check(r.tracked === 0, 'answers given with the cheat on are not added to the parent page');
  r = await run('', true);
  check(!r.chip && r.hp > 0, 'no cheat without the parameter');
  check(r.tracked === 1, 'without the cheat, answers are tracked as usual');
  await browser.close();
  console.log(results.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
