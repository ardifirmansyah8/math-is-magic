// Gender option checks: node test/gender.js <outdir>
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [];
  const check = (cond, msg) => results.push((cond ? 'PASS ' : 'FAIL ') + msg);
  async function open(w, h) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await page.goto('file://' + path.resolve(__dirname, '../dist/preview.html'));
    await page.waitForTimeout(300);
    return page;
  }
  const hero = page => page.evaluate(() => Object.assign({}, window.MIM.state.save.hero));
  const pills = page => page.$$eval('[aria-labelledby="lbl-hair"] .pill', els => els.map(e => e.textContent.trim()));

  const page = await open(390, 844);
  await page.click('text=Start the adventure'); await page.waitForTimeout(150);
  check((await hero(page)).gender === 'girl', 'new mage starts as a girl');
  check(JSON.stringify(await pills(page)) === JSON.stringify(['Long', 'Bob', 'Braids', 'Buns', 'Hijab']), 'girl hairstyles listed');

  await page.click('[data-arg="gender:boy"]'); await page.waitForTimeout(120);
  let h = await hero(page);
  check(h.gender === 'boy' && h.hair === 'short', 'switching to boy picks a boy hairstyle: ' + h.hair);
  check(JSON.stringify(await pills(page)) === JSON.stringify(['Short', 'Spiky', 'Curly', 'Peci']), 'boy hairstyles listed');
  check(await page.$eval('[data-arg="gender:boy"]', el => el.getAttribute('aria-pressed')) === 'true', 'boy pill shows as selected');
  await page.fill('#hero-name', 'Aras');
  await page.click('button.pill:has-text("Peci")'); await page.waitForTimeout(100);
  h = await hero(page);
  check(h.hair === 'peci' && h.hat === false, 'picking the peci takes the wizard hat off');
  check(await page.$eval('#hero-name', el => el.value) === 'Aras', 'typed name survives the gender switch');
  await page.screenshot({ path: path.join(OUT, 'g1-wardrobe-boy.png') });

  await page.click('[data-arg="gender:girl"]'); await page.waitForTimeout(100);
  h = await hero(page);
  check(h.gender === 'girl' && h.hair === 'long', 'switching back to girl restores a girl hairstyle');
  await page.click('[data-arg="gender:boy"]'); await page.click('button.pill:has-text("Spiky")');
  await page.click('text=Ready!'); await page.waitForTimeout(150);
  check((await hero(page)).name === 'Aras', 'name saved');

  // A battle as a boy runs cleanly
  await page.click('.stop >> button:has-text("Fight")'); await page.click('button:has-text("Fight Mossling!")'); await page.waitForTimeout(200);
  for (let i = 0; i < 4; i++) {
    if (await page.evaluate(() => window.__mim.state.screen) !== 'battle') break;
    await page.click('.spell[data-arg="1"]'); await page.waitForTimeout(150);
    const p = await page.evaluate(() => { const b = window.__mim.state.battle; return { input: b.puzzle.input, answer: b.puzzle.answer, prompt: b.puzzle.prompt }; });
    if (/ she /i.test(p.prompt)) check(false, 'boy puzzle used "she": ' + p.prompt);
    if (p.input === 'number') { for (const ch of String(p.answer)) await page.click(`.key[data-arg="${ch}"]`); }
    else await page.click(`.choice[data-arg="${p.answer}"]`);
    await page.click('#cast-btn'); await page.waitForTimeout(600);
    if (await page.evaluate(() => window.__mim.state.screen) !== 'battle') break;
    await page.click('#next-btn'); await page.waitForTimeout(150);
  }
  await page.screenshot({ path: path.join(OUT, 'g2-battle-boy.png') });

  // Older saves without a gender load as a girl
  const p2 = await open(390, 844);
  await p2.evaluate(() => localStorage.setItem('math-is-magic-v1', JSON.stringify({ hero: { name: 'Rina', hair: 'braids' }, stars: [1, 0, 0, 0, 0], unlocked: 2, made: true })));
  await p2.reload(); await p2.waitForTimeout(300);
  const old = await p2.evaluate(() => window.MIM.state.save.hero);
  check(old.gender === 'girl' && old.hair === 'braids', 'older save keeps its look and defaults to girl');

  // Gallery of boy looks
  const g = await open(960, 760);
  await g.evaluate(() => {
    const looks = [
      { hair: 'short', hat: true }, { hair: 'short', hat: false, hairColor: '#4a3024' }, { hair: 'spiky', hat: false, hairColor: '#7a4a2e', robe: 'blue' },
      { hair: 'curly', hat: false, skin: '#734a33', robe: 'mint' }, { hair: 'peci', hat: false, glasses: true, robe: 'coral' }, { hair: 'spiky', hat: true, robe: 'yellow', skin: '#f6d5bf', hairColor: '#f5d561' }
    ];
    document.getElementById('board').innerHTML = '<section class="screen"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:900px;margin:auto">' +
      looks.map(l => window.Art.mage(Object.assign({}, window.Art.DEFAULT_HERO, { gender: 'boy', name: 'Aras' }, l))).join('') + '</div></section>';
  });
  await g.waitForTimeout(150);
  await g.screenshot({ path: path.join(OUT, 'g3-boy-looks.png') });

  await browser.close();
  console.log(results.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
