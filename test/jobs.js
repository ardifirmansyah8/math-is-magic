// Ranks and jobs: node test/jobs.js <outdir>
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [];
  const check = (c, m) => results.push((c ? 'PASS ' : 'FAIL ') + m);
  async function open(seed, w = 390, h = 844) {
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
  const seed = (cleared, job, extra) => Object.assign({ hero: { name: 'Rina' }, made: true, job, jobPending: false,
    stars: Array.from({ length: 10 }, (_, i) => (i < cleared ? 3 : 0)), unlocked: Math.min(10, cleared + 1), champion: cleared >= 5, champion2: cleared >= 10,
    items: { shield: 0, jamu: 0, double: 0, eraser: 0 } }, extra || {});
  const B = page => page.evaluate(() => { const b = window.__mim.state.battle; return b && JSON.parse(JSON.stringify(b)); });
  async function fight(page, realm) { await page.evaluate(r => { window.MIM.state.realm = r; window.MIM.actions.fight(); }, realm); await page.waitForTimeout(200); }
  async function answer(page, correct) {
    const p = await page.evaluate(() => { const b = window.__mim.state.battle; return { input: b.puzzle.input, answer: b.puzzle.answer, n: b.puzzle.choices ? b.puzzle.choices.length : 0 }; });
    if (p.input === 'number') { for (const ch of String(correct ? p.answer : p.answer + 1)) await page.click(`.key[data-arg="${ch}"]`); }
    else await page.click(`.choice[data-arg="${correct ? p.answer : (p.answer + 1) % p.n}"]`);
    await page.click('#cast-btn'); await page.waitForTimeout(700);
  }
  async function spell(page, i) { await page.click(`.spell[data-arg="${i}"]`); await page.waitForTimeout(150); }
  async function nextTurn(page) { await page.click('#next-btn'); await page.waitForTimeout(150); }
  async function winOut(page) {
    for (let i = 0; i < 40 && await page.evaluate(() => window.__mim.state.screen) === 'battle'; i++) {
      const ph = await page.evaluate(() => window.__mim.state.battle.phase);
      if (ph === 'feedback') { await nextTurn(page); continue; }
      await spell(page, 2); await answer(page, true);
    }
    await page.waitForTimeout(300);
  }

  // 1. New player: Trainee Mage, then the first job after stage 1
  let page = await open();
  await page.click('text=Start the adventure'); await page.click('text=Ready!'); await page.waitForTimeout(150);
  check(/Trainee Mage/.test(await page.textContent('.me-strip')), 'new player is a Trainee Mage');
  await page.click('.stop >> button:has-text("Fight")'); await page.click('.intro >> button.btn-primary'); await page.waitForTimeout(200);
  await winOut(page);
  check(/Rank up!/.test(await page.textContent('.result')), 'result shows Rank up after stage 1');
  await page.click('text=Choose your job'); await page.waitForTimeout(150);
  const cards = await page.$$eval('.job', els => els.map(e => ({ locked: e.classList.contains('is-locked'), text: e.textContent.replace(/\s+/g, ' ') })));
  check(cards.filter(c => !c.locked).length === 3 && cards.filter(c => c.locked).length === 3, 'three jobs open and three locked after stage 1');
  check(cards.some(c => /Unlocks after stage 4/.test(c.text)), 'locked jobs say when they unlock');
  await page.screenshot({ path: path.join(OUT, 'j1-job-hall.png'), fullPage: false });
  await page.click('[data-act="pickJob"][data-arg="flame"]'); await page.waitForTimeout(150);
  check(await page.evaluate(() => window.MIM.state.save.job === 'flame' && !window.MIM.state.save.jobPending), 'picked Flame');
  check(/Next stage: Crystal Caves/.test(await page.textContent('[data-act="jobsDone"]')), 'Job Hall leads on to the next stage');
  await page.click('[data-act="jobsDone"]'); await page.waitForTimeout(150);
  check(/You are an Ember Apprentice/.test(await page.textContent('.rules')), 'intro reminds you of your job');
  await page.click('.intro >> button.btn-primary'); await page.waitForTimeout(200);
  check(/Ember Apprentice/.test(await page.textContent('#f-mage')), 'job title shows under the mage');
  await spell(page, 0); await answer(page, true);
  check((await B(page)).last.dmg === 2, 'Blaze: Spark hits for 1 + 1 = 2');

  // 2. Shield, tier 3: two shields, wrong answer uses one
  page = await open(seed(5, 'shield'));
  await fight(page, 5);
  let b = await B(page);
  check(b.shield === 2 && b.maxHearts === 4, 'Paladin starts with 2 shields and 4 hearts');
  await spell(page, 1); await answer(page, false);
  b = await B(page);
  check(b.shield === 1 && b.hearts === 4, 'a shield blocked the hit');
  await page.screenshot({ path: path.join(OUT, 'j2-shield.png') });

  // 3. Wisdom, tier 2: free hints and one swap
  page = await open(seed(3, 'wisdom'));
  await fight(page, 3);
  await spell(page, 1);
  const p0 = await page.evaluate(() => document.querySelector('.pz-head .tag').textContent);
  await page.click('[data-act="hint"]'); await page.waitForTimeout(120);
  const p1 = await page.evaluate(() => document.querySelector('.pz-head .tag').textContent);
  check(p0 === p1 && /2 power/.test(p1), 'hint did not cost power');
  const before = await page.evaluate(() => window.__mim.state.battle.puzzle.prompt + window.__mim.state.battle.puzzle.html);
  await page.click('[data-act="swap"]'); await page.waitForTimeout(150);
  b = await B(page);
  check(b.swaps === 0 && (b.puzzle.prompt + b.puzzle.html) !== before, 'Insight swap gave a new puzzle');
  check(await page.$eval('[data-act="swap"]', e => e.disabled), 'swap button disabled when used up');

  // 4. Nature, tier 4: 6 hearts and healing every 2 in a row
  page = await open(seed(8, 'nature'));
  await fight(page, 8);
  b = await B(page);
  check(b.maxHearts === 6 && b.hearts === 6, 'Life Weaver has 6 hearts');
  await spell(page, 1); await answer(page, false); await nextTurn(page);
  check((await B(page)).hearts === 5, 'lost a heart');
  await spell(page, 2); await answer(page, true); await nextTurn(page);
  await spell(page, 2); await answer(page, true);
  b = await B(page);
  check(b.hearts === 6 && b.last.healed, 'Mend healed after 2 in a row');
  await page.screenshot({ path: path.join(OUT, 'j3-nature.png') });

  // 5. Time, tier 2: one rewind
  page = await open(seed(3, 'time'));
  await fight(page, 3);
  await spell(page, 1);
  const prompt = await page.evaluate(() => window.__mim.state.battle.puzzle.prompt);
  await answer(page, false);
  b = await B(page);
  check(b.last.rewound && b.hearts === 3 && b.rewinds === 0, 'Rewind saved the heart');
  check(/Try again/.test(await page.textContent('.feedback')) && !/How to solve it/.test(await page.textContent('.feedback')), 'rewind does not give the answer away');
  await page.screenshot({ path: path.join(OUT, 'j4-rewind.png') });
  await page.click('#next-btn'); await page.waitForTimeout(150);
  b = await B(page);
  check(b.phase === 'puzzle' && b.puzzle.prompt === prompt, 'same puzzle comes back');
  await answer(page, false);
  check((await B(page)).hearts === 2, 'second miss costs a heart');

  // 6. Star, tier 3: starts with Double Chalk, drops every 2
  page = await open(seed(5, 'star'));
  await fight(page, 5);
  check((await B(page)).double === true, 'Astrologer starts with Double Chalk');
  await spell(page, 1); await answer(page, true); await nextTurn(page);
  await spell(page, 1); await answer(page, true);
  check(!!(await B(page)).last.drop, 'Lucky Star dropped a power-up after 2 in a row');

  // 7. Stars use hearts lost (4 hearts, lost 1 -> 2 stars)
  page = await open(seed(5, 'flame'));
  await fight(page, 0);
  await spell(page, 1); await answer(page, false); await nextTurn(page);
  await winOut(page);
  check(await page.evaluate(() => window.MIM.state.result.stars) === 2, 'lost 1 of 4 hearts gives 2 stars');

  // 8. Older save without a job is asked to pick one
  page = await open(seed(3, null, { jobPending: undefined }));
  check(await page.evaluate(() => window.MIM.state.save.jobPending === true), 'older save gets a job prompt');
  await page.click('text=Continue as'); await page.waitForTimeout(150);
  check(/Choose your job/.test(await page.textContent('.me-strip')), 'map asks to choose a job');
  await page.screenshot({ path: path.join(OUT, 'j5-map.png') });

  // 9. Clearing the last stage makes you a Grand Mage
  page = await open(seed(9, 'flame'));
  await fight(page, 9);
  await winOut(page);
  const s9 = await page.evaluate(() => ({ screen: window.MIM.state.screen, job: window.MIM.state.save.job, pending: window.MIM.state.save.jobPending }));
  check(s9.screen === 'final' && s9.job === 'grand' && s9.pending, 'final stage makes you a Grand Mage');
  check(/Grand Mage/.test(await page.textContent('.cert')), 'certificate says Grand Mage');
  await page.click('text=See your Grand Mage powers'); await page.waitForTimeout(150);
  check(await page.$eval('.job.job-grand', e => e.classList.contains('is-current')), 'Grand Mage is your job in the Job Hall');
  await page.screenshot({ path: path.join(OUT, 'j6-grand.png') });
  await fight(page, 0);
  b = await B(page);
  check(b.maxHearts === 6 && b.shield === 2 && b.swaps === 2 && b.rewinds === 1, 'Grand Mage battle setup');
  await page.screenshot({ path: path.join(OUT, 'j7-grand-battle.png') });

  // Desktop look at the Job Hall
  page = await open(seed(5, 'wisdom', { jobPending: true }), 1280, 800);
  await page.evaluate(() => window.MIM.go('jobs')); await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, 'j8-desktop-jobs.png') });
  const ov = await page.evaluate(() => { const s = document.querySelector('.screen'); return s.scrollWidth - s.clientWidth; });
  check(ov <= 1, 'no sideways scroll on the Job Hall');

  await browser.close();
  console.log(results.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
