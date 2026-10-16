// Chapter 2 checks: node test/chapter2.js <outdir>
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [];
  const check = (cond, msg) => results.push((cond ? 'PASS ' : 'FAIL ') + msg);
  async function open(w, h, seed) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await page.goto('file://' + path.resolve(__dirname, '../dist/preview.html'));
    if (seed) { await page.evaluate(s => localStorage.setItem('math-is-magic-v1', JSON.stringify(s)), seed); await page.reload(); }
    await page.waitForTimeout(300);
    return page;
  }
  const B = page => page.evaluate(() => { const b = window.__mim.state.battle; return b && JSON.parse(JSON.stringify(b)); });
  async function answer(page, correct) {
    const p = await page.evaluate(() => { const b = window.__mim.state.battle; return { input: b.puzzle.input, answer: b.puzzle.answer, n: b.puzzle.choices ? b.puzzle.choices.length : 0 }; });
    if (p.input === 'number') { for (const ch of String(correct ? p.answer : p.answer + 1)) await page.click(`.key[data-arg="${ch}"]`); }
    else await page.click(`.choice[data-arg="${correct ? p.answer : (p.answer + 1) % p.n}"]`);
    await page.click('#cast-btn'); await page.waitForTimeout(900);
  }
  async function fight(page, realm) {
    await page.evaluate(r => { window.MIM.state.realm = r; window.MIM.go('intro'); }, realm);
    await page.waitForTimeout(150);
    await page.click('.intro >> button.btn-primary'); await page.waitForTimeout(200);
  }
  async function winOut(page) {
    for (let i = 0; i < 40 && await page.evaluate(() => window.__mim.state.screen) === 'battle'; i++) {
      const ph = await page.evaluate(() => window.__mim.state.battle.phase);
      if (ph === 'feedback') { await page.click('#next-btn'); await page.waitForTimeout(120); continue; }
      await page.click('.spell[data-arg="2"]'); await page.waitForTimeout(120);
      await answer(page, true);
    }
    await page.waitForTimeout(300);
  }

  // Fresh player: chapter 2 is visible but locked
  const fresh = await open(390, 844);
  await fresh.click('text=Start the adventure'); await fresh.click('text=Ready!'); await fresh.waitForTimeout(150);
  check((await fresh.$$('.chapter')).length === 2, 'map shows two chapters');
  check(/Beat Nolnaga to open this chapter/.test(await fresh.textContent('.chapter-locked')), 'chapter 2 locked for a new player');
  check(/0\/30/.test(await fresh.textContent('.star-count')), 'star total is out of 30');
  await fresh.evaluate(() => document.querySelectorAll('.chapter')[1].scrollIntoView());
  await fresh.screenshot({ path: path.join(OUT, 'c1-map-locked.png') });

  // Returning champion from the 5-realm version gets chapter 2 unlocked
  const page = await open(390, 844, { hero: { name: 'Rina' }, stars: [3, 2, 3, 3, 2], unlocked: 5, champion: true, made: true, items: { shield: 1, jamu: 2, double: 1, eraser: 1 } });
  const sv = await page.evaluate(() => window.MIM.state.save);
  check(sv.unlocked === 6 && sv.stars.length === 10, 'old champion save unlocks realm 6 and pads stars');
  await page.click('text=Continue as'); await page.waitForTimeout(150);
  await page.evaluate(() => document.querySelectorAll('.chapter')[1].scrollIntoView());
  await page.screenshot({ path: path.join(OUT, 'c2-map-open.png') });

  // Realm 6: armoured
  await page.evaluate(() => { window.MIM.state.realm = 5; window.MIM.go('intro'); }); await page.waitForTimeout(150);
  check(/Armoured/.test(await page.textContent('.traits')), 'intro explains the armoured trick');
  await page.screenshot({ path: path.join(OUT, 'c3-intro-armoured.png') });
  await page.click('.intro >> button.btn-primary'); await page.waitForTimeout(200);
  check(await page.$eval('.spell[data-arg="0"]', el => el.disabled), 'Spark is disabled against armour');
  await page.keyboard.press('1'); await page.waitForTimeout(100);
  check((await B(page)).phase === 'spell', 'keyboard cannot pick Spark against armour');
  await page.screenshot({ path: path.join(OUT, 'c4-battle-armoured.png') });
  await winOut(page);
  check(await page.evaluate(() => window.MIM.state.result.won && window.MIM.state.save.unlocked === 7), 'beat realm 6, realm 7 open');

  // Realm 7: thief
  await fight(page, 6);
  const before = await page.evaluate(() => Object.values(window.MIM.state.save.items).reduce((a, b) => a + b, 0));
  await page.click('.spell[data-arg="1"]'); await page.waitForTimeout(150);
  await answer(page, false);
  let b = await B(page);
  const after = await page.evaluate(() => Object.values(window.MIM.state.save.items).reduce((a, b) => a + b, 0));
  check(!!b.last.stole && after === before - 1 && b.stolen.length === 1, 'magpie stole a power-up: ' + b.last.stole);
  check(/snatches your/.test(await page.textContent('.feedback')), 'feedback says what was stolen');
  await page.screenshot({ path: path.join(OUT, 'c5-thief.png') });
  await page.click('#next-btn'); await page.waitForTimeout(150);
  await winOut(page);
  const res7 = await page.evaluate(() => window.MIM.state.result);
  check(res7.won && res7.returned.length === 1, 'stolen power-up returned on victory');
  check(/dropped everything it stole/.test(await page.textContent('.result')), 'result screen lists returned loot');

  // Realm 8: regrows
  await fight(page, 7);
  await page.click('.spell[data-arg="2"]'); await page.waitForTimeout(150);
  await answer(page, true); await page.click('#next-btn'); await page.waitForTimeout(150);
  const hp1 = (await B(page)).hp;
  await page.click('.spell[data-arg="1"]'); await page.waitForTimeout(150);
  await answer(page, false);
  b = await B(page);
  check(b.hp === hp1 + 1 && b.last.regrew, `komodo regrew 1 hp (${hp1} -> ${b.hp})`);
  await page.click('#next-btn'); await page.waitForTimeout(150);
  await winOut(page);

  // Realm 9: gusty
  await fight(page, 8);
  await page.click('.spell[data-arg="1"]'); await page.waitForTimeout(150);
  check(!(await page.$('[data-act="hint"]')) && /blows hints away/.test(await page.textContent('.puzzle')), 'no hint button in the gusty fight');
  await page.screenshot({ path: path.join(OUT, 'c6-gusty.png') });
  await answer(page, true); await page.click('#next-btn'); await page.waitForTimeout(150);
  await winOut(page);

  // Realm 10: boss, then the chapter 2 certificate
  await fight(page, 9);
  await page.screenshot({ path: path.join(OUT, 'c7-boss.png') });
  await winOut(page);
  check(await page.evaluate(() => window.MIM.state.screen === 'final' && window.MIM.state.save.champion2), 'beating Kakacau shows the chapter 2 certificate');
  check(/Grand Mage/.test(await page.textContent('.cert')), 'certificate names the new rank');
  await page.screenshot({ path: path.join(OUT, 'c8-cert2.png') });

  // Gallery: new monsters and new puzzle types
  const g = await open(1280, 900);
  await g.evaluate(() => {
    const P = window.Puzzles, cards = [];
    ['grumpfish', 'magpie', 'komodo', 'cloud', 'muddle'].forEach(m => cards.push(`<div>${window.Art.monster(m, '', m)}</div>`));
    for (const type of ['mystery', 'area', 'ages']) for (const t of [1, 3, 4, 5]) {
      const p = P.make(type, t, { name: 'Rina', he: 'She' });
      cards.push(`<div class="puzzle" style="border:1px dashed rgba(255,255,255,.25);padding:10px;border-radius:8px"><span class="tag">${p.label} · Level ${t}</span><p class="prompt" style="font-size:14px">${P.esc(p.prompt)}</p><div class="visual">${p.html}</div><div class="answer-box">${p.answer}</div></div>`);
    }
    document.getElementById('board').innerHTML = `<section class="screen"><div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px">${cards.join('')}</div></section>`;
  });
  await g.setViewportSize({ width: 1600, height: 1500 }); await g.waitForTimeout(200);
  await g.screenshot({ path: path.join(OUT, 'c9-gallery.png') });

  await browser.close();
  console.log(results.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
