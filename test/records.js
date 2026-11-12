// Personal records: node test/records.js <outdir>
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.resolve(__dirname, '../test-output/records');
fs.mkdirSync(OUT, { recursive: true });

const KEY = 'math-is-magic-v1';
const SEED = { hero: { name: 'Rina' }, made: true, stars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], unlocked: 3, job: 'flame' };
const fmt = ms => { const s = Math.max(1, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [];
  const check = (cond, msg) => results.push((cond ? 'PASS ' : 'FAIL ') + msg);
  async function open(suffix, seed) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await page.goto('file://' + path.resolve(__dirname, '../dist/preview.html') + (suffix || ''));
    await page.waitForTimeout(250);
    await page.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [KEY, seed]);
    await page.reload(); await page.waitForTimeout(250);
    return page;
  }
  const save = page => page.evaluate(() => JSON.parse(JSON.stringify(window.MIM.state.save)));
  const screen = page => page.evaluate(() => window.MIM.state.screen);
  const text = async (page, sel) => ((await page.textContent(sel)) || '').replace(/\s+/g, ' ').trim();
  const tiles = page => page.$$eval('.rec-tile', els => els.map(e => ({ isNew: e.classList.contains('is-new'), text: e.textContent.replace(/\s+/g, ' ').trim() })));
  async function answer(page, correct) {
    const p = await page.evaluate(() => { const b = window.__mim.state.battle; return { input: b.puzzle.input, answer: b.puzzle.answer, n: b.puzzle.choices ? b.puzzle.choices.length : 0 }; });
    if (p.input === 'number') { for (const ch of String(correct ? p.answer : p.answer + 1)) await page.click(`.key[data-arg="${ch}"]`); }
    else await page.click(`.choice[data-arg="${correct ? p.answer : (p.answer + 1) % p.n}"]`);
    await page.click('#cast-btn');
    await page.waitForTimeout(550);
  }
  async function spell(page, i, correct) { await page.click(`.spell[data-arg="${i}"]`); await page.waitForTimeout(120); await answer(page, correct); }
  async function nextBtn(page) { await page.click('#next-btn'); await page.waitForTimeout(180); }
  async function winOut(page) {
    for (let i = 0; i < 30 && await screen(page) === 'battle'; i++) {
      if (await page.evaluate(() => window.__mim.state.battle.phase) === 'feedback') { await nextBtn(page); continue; }
      await spell(page, 2, true);
    }
    await page.waitForTimeout(300);
  }
  const fight = async (page, realm) => { await page.evaluate(i => { window.MIM.state.realm = i; window.MIM.actions.fight(); }, realm); await page.waitForTimeout(200); };
  // Make the running battle look this many seconds older
  const pretend = (page, secs) => page.evaluate(s => { window.__mim.state.battle.started -= s * 1000; }, secs);

  // 1. First win: all three records are set
  let page = await open('', SEED);
  await fight(page, 0); await pretend(page, 95);
  await spell(page, 0, false); await nextBtn(page);
  await winOut(page);
  let s = await save(page);
  const r0 = s.records[0];
  check(await screen(page) === 'result' && r0 && r0.misses === 1 && r0.ms >= 95000 && r0.ms < 130000 && r0.streak >= 1, 'first win sets time, mistakes and streak: ' + JSON.stringify(r0));
  check(/First records for this realm/.test(await text(page, '.records-head')), 'win screen says these are the first records');
  let t = await tiles(page);
  check(t.length === 3 && t.every(x => !x.isNew && /First record/.test(x.text)) && t[0].text.includes(fmt(r0.ms)), 'three tiles show this fight, none marked new: ' + t.map(x => x.text).join(' | '));
  check(await page.evaluate(() => { const s = document.querySelector('.screen'); return s.scrollWidth - s.clientWidth; }) <= 1, 'win screen fits the phone');
  await page.screenshot({ path: path.join(OUT, 'rec1-first.png'), fullPage: false });

  // 2. A faster win with no mistakes beats two records
  await fight(page, 0); await pretend(page, 20);
  await winOut(page);
  s = await save(page);
  const r1 = s.records[0];
  check(r1.misses === 0 && r1.ms < r0.ms && r1.ms >= 20000, 'faster mistake-free win replaces the time and mistakes: ' + JSON.stringify(r1));
  t = await tiles(page);
  check(t[0].isNew && t[0].text.includes('was ' + fmt(r0.ms)) && t[1].isNew && /was 1/.test(t[1].text), 'time and mistakes tiles say New record with the old value: ' + t.map(x => x.text).join(' | '));
  check(/New records!/.test(await text(page, '.records-head')), 'headline says New records!');
  await page.evaluate(() => document.querySelector('.records').scrollIntoView());
  await page.screenshot({ path: path.join(OUT, 'rec2-new.png') });

  // 3. A slower win with a mistake leaves the records alone
  await fight(page, 0); await pretend(page, 300);
  await spell(page, 0, false); await nextBtn(page);
  await winOut(page);
  s = await save(page);
  check(JSON.stringify(s.records[0]) === JSON.stringify(r1), 'records unchanged after a worse run');
  t = await tiles(page);
  check(/Your records/.test(await text(page, '.records-head')) && t.every(x => !x.isNew) && t[0].text.includes('Best ' + fmt(r1.ms)), 'tiles show the bests to beat: ' + t.map(x => x.text).join(' | '));

  // 4. The stage intro shows the best to beat
  await page.evaluate(() => window.MIM.actions.pickRealm(0)); await page.waitForTimeout(150);
  const best = await text(page, '.best-chip');
  check(best === `Your best: ${fmt(r1.ms)} · no mistakes · ${r1.streak} in a row`, 'intro shows: ' + best);
  await page.screenshot({ path: path.join(OUT, 'rec3-intro.png') });

  // 5. The records page
  await page.evaluate(() => window.MIM.go('map')); await page.waitForTimeout(150);
  await page.click('text=My records'); await page.waitForTimeout(150);
  check(await screen(page) === 'records', 'map button opens My records');
  const top = await page.$$eval('.pp-tile', els => els.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  check(top[0].includes(fmt(r1.ms)) && top[0].includes('Whispering Woods') && top[2].includes('1 of 10'), 'highlights: ' + top.join(' | '));
  const rows = await page.$$eval('.rec-row', els => els.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  check(rows.length === 10 && rows[0].includes(fmt(r1.ms)) && /Beat it/.test(rows[0]) && /Not beaten yet/.test(rows[1]) && /\?\?\?/.test(rows[3]) && /Locked/.test(rows[3]), 'one row per realm with records, open and locked states');
  check(await page.evaluate(() => { const s = document.querySelector('.screen'); return s.scrollWidth - s.clientWidth; }) <= 1, 'records page fits the phone');
  await page.screenshot({ path: path.join(OUT, 'rec4-page.png') });
  await page.click('.rec-row >> text=Beat it'); await page.waitForTimeout(150);
  check(await screen(page) === 'intro' && await page.evaluate(() => window.MIM.state.realm) === 0, 'Beat it opens that realm');
  await page.close();

  // 6. Nothing is recorded with the one-hit cheat on
  const kept = { ms: 50000, misses: 0, streak: 3 };
  page = await open('?cheat=onehit', Object.assign({}, SEED, { stars: [3, 0, 0, 0, 0, 0, 0, 0, 0, 0], records: [kept, null, null, null, null, null, null, null, null, null] }));
  await fight(page, 0); await spell(page, 0, true); await nextBtn(page); await page.waitForTimeout(250);
  s = await save(page);
  check(/Records are paused while the cheat is on/.test(await text(page, '.rec-paused')) && JSON.stringify(s.records[0]) === JSON.stringify(kept), 'cheat wins leave the records alone');
  await page.close();

  // 7. Time in the background does not count
  page = await open('', SEED);
  await fight(page, 0); await pretend(page, 70); // 70 s old, 60 s of it in the background
  await page.evaluate(() => {
    const flip = v => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => v }); document.dispatchEvent(new Event('visibilitychange')); };
    flip(true); window.__mim.state.battle.hiddenAt -= 60000; flip(false);
  });
  await winOut(page);
  s = await save(page);
  check(s.records[0] && s.records[0].ms >= 10000 && s.records[0].ms < 40000, 'a minute in the background is left out: ' + (s.records[0] && fmt(s.records[0].ms)));

  // 8. Losing records nothing
  await page.evaluate(() => { window.MIM.state.save.records[1] = null; });
  await fight(page, 1);
  for (let i = 0; i < 8 && await screen(page) === 'battle'; i++) {
    if (await page.evaluate(() => window.__mim.state.battle.phase) === 'feedback') { await nextBtn(page); continue; }
    await spell(page, 0, false);
  }
  await page.waitForTimeout(250);
  s = await save(page);
  check(await page.evaluate(() => window.MIM.state.result && !window.MIM.state.result.won) && s.records[1] === null && !(await page.$('.records')), 'a lost fight sets no record');
  await page.close();

  // 9. Saves from before records existed
  page = await open('', { hero: { name: 'Rina' }, made: true, stars: [3, 0, 0, 0, 0, 0, 0, 0, 0, 0], unlocked: 2, job: 'flame' });
  s = await save(page);
  check(Array.isArray(s.records) && s.records.length === 10 && s.records.every(r => r === null), 'older save starts with empty records');
  await page.evaluate(() => window.MIM.go('records')); await page.waitForTimeout(150);
  check(/No records yet/.test(await text(page, '.empty-note')) && /Win here again to set a record/.test((await page.$$eval('.rec-row', els => els[0].textContent))), 'records page explains how to set one');
  await page.evaluate(() => window.MIM.actions.pickRealm(0)); await page.waitForTimeout(120);
  check(!(await page.$('.best-chip')), 'no best line before the first record');

  await browser.close();
  console.log(results.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
