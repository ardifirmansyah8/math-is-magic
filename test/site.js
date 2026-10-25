// Standalone site checks over HTTP: node test/site.js <outdir> <port>
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const OUT = process.argv[2], PORT = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [];
  const check = (c, m) => results.push((c ? 'PASS ' : 'FAIL ') + m);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(`http://127.0.0.1:${PORT}/`); await page.waitForTimeout(400);
  check(await page.evaluate(() => document.compatMode) === 'CSS1Compat', 'page renders in standards mode');
  check(await page.title() === 'Math Is Magic', 'page title set');
  const meta = await page.evaluate(() => { const m = n => { const el = document.querySelector(`meta[property="${n}"], meta[name="${n}"]`); return el && el.content; }; return { img: m('og:image'), tw: m('twitter:image'), url: m('og:url'), card: m('twitter:card'), title: m('og:title') }; });
  check(/^https:\/\/ardifirmansyah8\.github\.io\/math-is-magic\/og-image\.jpg\?v=[0-9a-f]{8}$/.test(meta.img) && meta.tw === meta.img && meta.card === 'summary_large_image' && meta.url === 'https://ardifirmansyah8.github.io/math-is-magic/' && meta.title === 'Math Is Magic', 'link-preview tags are set: ' + meta.img);
  check(await page.evaluate(() => document.querySelectorAll('title').length) === 1, 'exactly one <title>');
  const img = await page.evaluate(async () => { const r = await fetch('og-image.jpg'); const b = await r.blob(); const im = new Image(); im.src = URL.createObjectURL(b); await im.decode(); return { status: r.status, type: r.headers.get('content-type'), w: im.naturalWidth, h: im.naturalHeight, kb: Math.round(b.size / 1024) }; });
  check(img.status === 200 && img.type === 'image/jpeg' && img.w === 1200 && img.h === 630 && img.kb < 300, 'preview image is served at 1200x630 and under 300 KB: ' + JSON.stringify(img));
  await page.screenshot({ path: path.join(OUT, 's1-title.png') });
  await page.click('text=Start the adventure'); await page.waitForTimeout(150);
  check(await page.$eval('#hero-name', el => el.value === '' && el.placeholder === 'Type your name'), 'name starts blank with a placeholder');
  await page.click('text=Ready!'); await page.waitForTimeout(150);
  await page.reload(); await page.waitForTimeout(300);
  check(/Continue as Mage/.test(await page.textContent('.title-actions')), 'blank name falls back to "Mage"');
  await page.click('text=Change outfit'); await page.fill('#hero-name', 'Rina'); await page.click('text=Done'); await page.waitForTimeout(150);
  check(await page.evaluate(() => window.MIM.state.save.hero.name) === 'Rina', 'typed name is saved');
  await page.click('.stop >> button:has-text("Fight")'); await page.click('.intro >> button.btn-primary'); await page.waitForTimeout(200);
  for (let i = 0; i < 12 && await page.evaluate(() => window.__mim.state.screen) === 'battle'; i++) {
    const ph = await page.evaluate(() => window.__mim.state.battle.phase);
    if (ph === 'feedback') { await page.click('#next-btn'); await page.waitForTimeout(120); continue; }
    await page.click('.spell[data-arg="2"]'); await page.waitForTimeout(150);
    const p = await page.evaluate(() => { const b = window.__mim.state.battle; return { input: b.puzzle.input, answer: b.puzzle.answer }; });
    if (p.input === 'number') { for (const ch of String(p.answer)) await page.click(`.key[data-arg="${ch}"]`); } else await page.click(`.choice[data-arg="${p.answer}"]`);
    await page.click('#cast-btn'); await page.waitForTimeout(650);
  }
  await page.waitForTimeout(300);
  check(await page.evaluate(() => window.MIM.state.result && window.MIM.state.result.won), 'a full battle works on the hosted page');
  const ov = await page.evaluate(() => { const s = document.querySelector('.screen'); return s.scrollWidth - s.clientWidth + (document.documentElement.scrollWidth - document.documentElement.clientWidth); });
  check(ov <= 1, 'no sideways scrolling on a phone');
  await browser.close();
  console.log(results.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
