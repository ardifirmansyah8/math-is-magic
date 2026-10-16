// Monster notebook, weak spots, spellbooks and the parent page: node test/pages.js <outdir>
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [];
  const check = (c, m) => results.push((c ? 'PASS ' : 'FAIL ') + m);
  async function open(w = 390, h = 844) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await page.goto('file://' + path.resolve(__dirname, '../dist/preview.html'));
    await page.waitForTimeout(300);
    return page;
  }
  const B = page => page.evaluate(() => { const b = window.__mim.state.battle; return b && JSON.parse(JSON.stringify(b)); });
  async function answer(page, correct) {
    const p = await page.evaluate(() => { const b = window.__mim.state.battle; return { input: b.puzzle.input, answer: b.puzzle.answer, n: b.puzzle.choices ? b.puzzle.choices.length : 0 }; });
    if (p.input === 'number') { for (const ch of String(correct ? p.answer : p.answer + 1)) await page.click(`.key[data-arg="${ch}"]`); }
    else await page.click(`.choice[data-arg="${correct ? p.answer : (p.answer + 1) % p.n}"]`);
    await page.click('#cast-btn'); await page.waitForTimeout(650);
  }

  const page = await open();
  await page.click('text=Start the adventure'); await page.click('text=Ready!'); await page.waitForTimeout(150);
  check(/Nolnaga/.test(await page.textContent('.story')), 'map story names Nolnaga');

  // Notebook before playing
  await page.click('[data-act="openNotebook"]'); await page.waitForTimeout(150);
  check((await page.$$('.beast')).length === 10 && (await page.$$('.beast.is-unknown')).length === 9, 'notebook: 1 known monster, 9 unknown');
  const known = await page.textContent('.beast:not(.is-unknown)');
  check(/Lumutok/.test(known) && /Number patterns puzzles \(\+1 damage\)/.test(known) && /lumut/.test(known), 'notebook entry shows weak spot and name origin');
  await page.screenshot({ path: path.join(OUT, 'p1-notebook.png') });
  await page.click('[data-act="toMap"]'); await page.waitForTimeout(100);

  // Parent page before playing
  await page.click('[data-act="openParents"]'); await page.waitForTimeout(150);
  check(/No puzzles answered yet/.test(await page.textContent('.pp')), 'parent page handles no data');
  await page.click('[data-act="toMap"]'); await page.waitForTimeout(100);

  // Spell names for a trainee, weak spot bonus on a pattern puzzle
  await page.evaluate(() => { window.MIM.REALMS[0].pool = ['pattern']; });
  await page.click('.stop >> button:has-text("Fight")'); await page.click('.intro >> button.btn-primary'); await page.waitForTimeout(200);
  const names = await page.$$eval('.spell-name', els => els.map(e => e.textContent));
  check(names.join(',') === 'Fire,Blizzard,Thunder', 'trainee spells: ' + names.join(', '));
  await page.click('.spell[data-arg="0"]'); await page.waitForTimeout(150);
  check(/Weak spot! \+1/.test(await page.textContent('.pz-head')), 'weak spot tag on a matching puzzle');
  await page.screenshot({ path: path.join(OUT, 'p2-weakspot.png') });
  await answer(page, false);          // one mistake
  await page.click('#next-btn'); await page.waitForTimeout(150);
  await page.click('.spell[data-arg="0"]'); await page.waitForTimeout(150);
  await answer(page, true);
  let b = await B(page);
  check(b.last.dmg === 2 && b.last.weak, 'weak spot: Fire hits for 1 + 1 = 2');
  check(/its weak spot/.test(await page.textContent('.feedback')), 'feedback mentions the weak spot');
  await page.evaluate(() => { window.MIM.REALMS[0].pool = ['pattern', 'potion', 'odd', 'picture', 'sums', 'counting']; });
  await page.click('#next-btn'); await page.waitForTimeout(150);
  let casts = 0;
  for (let i = 0; i < 16 && await page.evaluate(() => window.__mim.state.screen) === 'battle'; i++) {
    const ph = await page.evaluate(() => window.__mim.state.battle.phase);
    if (ph === 'feedback') { await page.click('#next-btn'); await page.waitForTimeout(120); continue; }
    await page.click('.spell[data-arg="2"]'); await page.waitForTimeout(120);
    await answer(page, casts++ !== 0);   // a second mistake on the first cast here
  }
  await page.waitForTimeout(300);

  // Pick Flame and check the spellbook changes
  await page.click('text=Choose your job'); await page.click('[data-act="pickJob"][data-arg="flame"]'); await page.waitForTimeout(120);
  await page.evaluate(() => { window.MIM.state.realm = 1; window.MIM.actions.fight(); }); await page.waitForTimeout(200);
  const names2 = await page.$$eval('.spell-name', els => els.map(e => e.textContent));
  check(names2.join(',') === 'Fire,Firestorm,Inferno', 'Flame spells: ' + names2.join(', '));
  await page.click('[data-act="quitBattle"]'); await page.waitForTimeout(150);

  // Parent page with data
  const st = await page.evaluate(() => window.MIM.state.save.stats);
  const totalN = Object.values(st.byType).reduce((a, t) => a + t.n, 0);
  await page.click('[data-act="openParents"]'); await page.waitForTimeout(200);
  const tiles = await page.$$eval('.pp-value', els => els.map(e => e.textContent));
  check(tiles[0] === String(totalN), `tile shows ${totalN} puzzles answered (${tiles[0]})`);
  check(st.mistakes.length >= 2 && (await page.$$('.pp-mistake')).length === Math.min(6, st.mistakes.length), 'mistakes listed: ' + st.mistakes.length);
  check(/answered/.test(await page.textContent('.pp-mistake')) && /Correct answer/.test(await page.textContent('.pp-mistake')), 'mistake card shows both answers');
  check((await page.$$('.pp-topic')).length >= 1, 'topic rows shown');
  const today = await page.$$eval('.act-bar', els => els[els.length - 1].getAttribute('data-tip'));
  check(new RegExp(`: ${totalN} answered`).test(today), 'today bar: ' + today);
  await page.hover('.act-bar:last-of-type'); await page.waitForTimeout(100);
  check(await page.$eval('#pp-tip', e => !e.hidden && /answered/.test(e.textContent)), 'tooltip appears on hover');
  await page.screenshot({ path: path.join(OUT, 'p3-parents-top.png') });
  await page.evaluate(() => document.querySelector('#pp-topics').scrollIntoView());
  await page.screenshot({ path: path.join(OUT, 'p4-parents-topics.png') });
  const ov = await page.evaluate(() => { const s = document.querySelector('.screen'); return s.scrollWidth - s.clientWidth; });
  check(ov <= 1, 'no sideways scroll on the parent page');
  await page.click('[data-act="ppAsk"]'); await page.click('[data-act="ppReset"]'); await page.waitForTimeout(120);
  check(await page.evaluate(() => Object.keys(window.MIM.state.save.stats.byType).length === 0), 'history cleared');

  // Desktop parent page with seeded data, and a gallery of all monsters
  const d = await open(1280, 900);
  await d.evaluate(() => {
    const day = n => { const x = new Date(Date.now() - n * 864e5); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
    const days = {}; [0, 1, 2, 4, 5, 8, 11].forEach((n, i) => { days[day(n)] = { n: 6 + i * 2, ok: 4 + i }; });
    const byType = { pattern: { n: 20, ok: 18, hints: 1, lvl: [8, 8, 4, 0, 0], okLvl: [8, 7, 3, 0, 0] }, magic: { n: 12, ok: 7, hints: 3, lvl: [4, 5, 3, 0, 0], okLvl: [4, 2, 1, 0, 0] }, potion: { n: 9, ok: 8, hints: 0, lvl: [2, 4, 3, 0, 0], okLvl: [2, 4, 2, 0, 0] }, calendar: { n: 7, ok: 3, hints: 2, lvl: [0, 4, 3, 0, 0], okLvl: [0, 2, 1, 0, 0] } };
    const P = window.Puzzles, mk = P.make('magic', 3, {});
    window.MIM.state.save = Object.assign(window.MIM.state.save, { made: true, stars: [3, 2, 3, 0, 0, 0, 0, 0, 0, 0], unlocked: 4, job: 'wisdom',
      stats: { byType, days, recent: [], mistakes: [{ t: Date.now() - 3600e3, type: 'magic', tier: 3, prompt: mk.prompt, html: mk.html, given: '12', answer: String(mk.answer), explain: mk.explain }] } });
    window.MIM.go('parents');
  });
  await d.waitForTimeout(200);
  await d.screenshot({ path: path.join(OUT, 'p5-parents-desktop.png'), fullPage: false });
  await d.evaluate(() => {
    const ids = ['lumutok', 'kristawar', 'detikron', 'katagma', 'nolnaga', 'durinautus', 'gagaklepto', 'komodrax', 'gunturawa', 'kakacau'];
    document.getElementById('board').innerHTML = '<section class="screen"><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">' +
      ids.map(id => `<div style="text-align:center">${window.Art.monster(id, '', id)}<p>${id}</p></div>`).join('') + '</div></section>';
  });
  await d.waitForTimeout(150);
  await d.screenshot({ path: path.join(OUT, 'p6-monsters.png') });

  await browser.close();
  console.log(results.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
