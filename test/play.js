// Headless play-through: node test/play.js <outdir>
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  async function open(w, h, mobile) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errors.push(`[${w}] console: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`[${w}] pageerror: ${e.message}`));
    await page.goto('file://' + path.resolve(__dirname, '../dist/preview.html'));
    await page.waitForTimeout(300);
    return page;
  }
  const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') });
  async function overflow(page, label) {
    const o = await page.evaluate(() => {
      const r = [], de = document.documentElement;
      if (de.scrollWidth > de.clientWidth + 1) r.push('document ' + de.scrollWidth + '>' + de.clientWidth);
      document.querySelectorAll('.screen').forEach(s => { if (s.scrollWidth > s.clientWidth + 1) r.push('screen ' + s.scrollWidth + '>' + s.clientWidth); });
      return r;
    });
    if (o.length) errors.push(`[overflow ${label}] ${o.join(', ')}`);
  }
  async function answer(page, correct) {
    const p = await page.evaluate(() => { const b = window.__mim.state.battle; return { input: b.puzzle.input, answer: b.puzzle.answer, n: b.puzzle.choices ? b.puzzle.choices.length : 0, type: b.puzzle.type }; });
    if (p.input === 'number') {
      for (const ch of String(correct ? p.answer : p.answer + 1)) await page.click(`.key[data-arg="${ch}"]`);
    } else {
      await page.click(`.choice[data-arg="${correct ? p.answer : (p.answer + 1) % p.n}"]`);
    }
    await page.click('#cast-btn');
    return p.type;
  }
  const screenName = page => page.evaluate(() => window.__mim.state.screen);

  // ---------- Phone flow ----------
  const page = await open(390, 844, true);
  await shot(page, '01-title'); await overflow(page, 'title');
  await page.click('text=Start the adventure'); await page.waitForTimeout(200);
  await shot(page, '02-wardrobe'); await overflow(page, 'wardrobe');
  await page.click('button.pill:has-text("Hijab")'); await page.click('button.pill:has-text("Glasses")');
  await page.click('[data-arg="hairColor:#f39ac0"]'); await page.waitForTimeout(100);
  await page.evaluate(() => document.querySelector('.screen').scrollTo(0, 0));
  await shot(page, '03-wardrobe-hijab');
  await page.click('button.pill:has-text("Braids")'); await page.click('[data-arg="hairColor:#2b2422"]'); await page.waitForTimeout(80);
  const braids = await page.$('#ward-preview'); await braids.screenshot({ path: path.join(OUT, '03b-braids.png') });
  await page.click('button.pill:has-text("Buns")'); await page.click('button.pill:has-text("Wizard hat")'); await page.waitForTimeout(80);
  await braids.screenshot({ path: path.join(OUT, '03c-buns-nohat.png') });
  await page.click('button.pill:has-text("Long")'); await page.click('button.pill:has-text("Glasses")'); await page.click('button.pill:has-text("Wizard hat")');
  await page.click('text=Ready!'); await page.waitForTimeout(200);
  await shot(page, '04-map'); await overflow(page, 'map');
  await page.click('.stop >> button:has-text("Fight")'); await page.waitForTimeout(200);
  await shot(page, '05-intro'); await overflow(page, 'intro');
  await page.click('.intro >> button.btn-primary'); await page.waitForTimeout(300);
  await shot(page, '06-battle-spells'); await overflow(page, 'battle');

  await page.click('.spell[data-arg="2"]'); await page.waitForTimeout(400);
  await shot(page, '07-puzzle'); await overflow(page, 'puzzle');
  const t1 = await answer(page, true); await page.waitForTimeout(1000);
  await shot(page, '08-feedback-good');
  await page.click('#next-btn'); await page.waitForTimeout(200);
  await page.click('.spell[data-arg="0"]'); await page.waitForTimeout(250);
  const t2 = await answer(page, false); await page.waitForTimeout(1000);
  await shot(page, '09-feedback-bad');
  await page.click('#next-btn'); await page.waitForTimeout(200);
  for (let i = 0; i < 12 && await screenName(page) === 'battle'; i++) {
    await page.click('.spell[data-arg="1"]'); await page.waitForTimeout(120);
    await answer(page, true); await page.waitForTimeout(550);
    await page.click('#next-btn'); await page.waitForTimeout(150);
  }
  await page.waitForTimeout(300);
  await shot(page, '10-result'); await overflow(page, 'result');
  const save1 = await page.evaluate(() => JSON.stringify(window.MIM.state.save.stars) + ' unlocked=' + window.MIM.state.save.unlocked);

  for (let realm = 1; realm < 5; realm++) {
    await page.evaluate(r => { window.MIM.state.realm = r; window.MIM.actions.fight(); }, realm);
    await page.waitForTimeout(200);
    if (realm === 4) await shot(page, '11-dragon');
    for (let i = 0; i < 30 && await screenName(page) === 'battle'; i++) {
      await page.click('.spell[data-arg="2"]'); await page.waitForTimeout(60);
      await answer(page, true); await page.waitForTimeout(480);
      await page.click('#next-btn'); await page.waitForTimeout(60);
    }
    await page.waitForTimeout(250);
  }
  await shot(page, '12-final'); await overflow(page, 'final');
  await page.click('.cert >> button:has-text("Map")'); await page.waitForTimeout(200);
  for (let realm = 5; realm < 10; realm++) {
    await page.evaluate(r => { window.MIM.state.realm = r; window.MIM.actions.fight(); }, realm);
    await page.waitForTimeout(200);
    for (let i = 0; i < 40 && await screenName(page) === 'battle'; i++) {
      await page.click('.spell[data-arg="2"]'); await page.waitForTimeout(60);
      await answer(page, true); await page.waitForTimeout(480);
      await page.click('#next-btn'); await page.waitForTimeout(60);
    }
    await page.waitForTimeout(250);
  }
  await shot(page, '12b-final-ch2'); await overflow(page, 'final ch2');
  await page.click('text=Back to the map'); await page.waitForTimeout(200);
  await shot(page, '13-map-done');
  const save2 = await page.evaluate(() => JSON.stringify(window.MIM.state.save));

  // reload keeps progress
  await page.reload(); await page.waitForTimeout(300);
  const titleText = await page.textContent('.title-actions');

  // ---------- Desktop ----------
  const d = await open(1280, 800, false);
  await d.click('text=Start the adventure'); await d.waitForTimeout(150);
  await shot(d, '20-desk-wardrobe');
  await d.click('text=Ready!'); await d.waitForTimeout(150);
  await d.click('.stop >> button:has-text("Fight")'); await d.click('.intro >> button.btn-primary'); await d.waitForTimeout(200);
  await d.click('.spell[data-arg="2"]'); await d.waitForTimeout(400);
  await shot(d, '21-desk-puzzle'); await overflow(d, 'desk puzzle');
  // keyboard: type the answer
  const da = await d.evaluate(() => window.__mim.state.battle.puzzle);
  if (da.input === 'number') { await d.keyboard.type(String(da.answer)); await d.keyboard.press('Enter'); }
  else { await d.keyboard.press(String(da.choices.findIndex(c => c.id === da.answer) + 1)); await d.keyboard.press('Enter'); }
  await d.waitForTimeout(900);
  await shot(d, '22-desk-feedback');
  const kbOk = await d.evaluate(() => window.__mim.state.battle.last && window.__mim.state.battle.last.ok);

  // ---------- Puzzle gallery (every type, three levels) ----------
  const g = await open(1280, 900, false);
  await g.evaluate(() => {
    const P = window.Puzzles, cards = [];
    for (const type of P.TYPES) for (const t of [1, 3, 5]) {
      const p = P.make(type, t, { name: 'Rina' });
      const choices = p.input === 'choice'
        ? `<div class="choices ${p.choiceStyle === 'days' ? 'days' : p.choiceStyle === 'tiles' ? 'tiles-choice' : ''}">${p.choices.map(c => `<button class="choice" aria-pressed="${c.id === p.answer}">${c.svg || c.label}</button>`).join('')}</div>`
        : `<div class="answer-box">${p.answer}</div>`;
      cards.push(`<div class="puzzle" style="border:1px dashed rgba(255,255,255,.25);padding:10px;border-radius:8px"><span class="tag">${p.label} · Level ${t}</span><p class="prompt" style="font-size:15px">${P.esc(p.prompt)}</p><div class="visual">${p.html}</div>${choices}</div>`);
    }
    document.getElementById('board').innerHTML = `<section class="screen"><div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px">${cards.join('')}</div></section>`;
  });
  await g.setViewportSize({ width: 1600, height: 2600 }); await g.waitForTimeout(200);
  await shot(g, '30-gallery');

  await browser.close();
  console.log('types seen:', t1, t2);
  console.log('stars after realm 1:', save1);
  console.log('final save:', save2);
  console.log('title after reload:', titleText.replace(/\s+/g, ' ').trim());
  console.log('keyboard answer accepted:', kbOk);
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors or overflow.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
