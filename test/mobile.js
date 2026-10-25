// Phone and tablet checks: node test/mobile.js <outdir>
// Visits every screen and every puzzle type at common screen sizes and looks for sideways overflow,
// content that cannot be scrolled to, the page scrolling behind the board, small tap targets and tiny
// text. It also swipes during battles to make sure scrolling up is never pulled back.
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.resolve(__dirname, '../test-output/mobile');
fs.mkdirSync(OUT, { recursive: true });

const SIZES = [
  [320, 568, 'small phone'], [360, 740, 'Android phone'], [375, 667, 'iPhone SE'], [390, 844, 'iPhone'],
  [430, 932, 'large phone'], [844, 390, 'phone sideways'], [768, 1024, 'tablet']
];
const SAVE = { hero: { name: 'Rina' }, made: true, stars: [3, 2, 3, 0, 0, 0, 0, 0, 0, 0], unlocked: 4, job: 'flame', hurt: 1, items: { shield: 2, jamu: 1, double: 3, eraser: 1 } };

// Runs in the page. Lists layout problems on the current screen.
function auditScreen() {
  const vw = innerWidth, vh = innerHeight, de = document.scrollingElement || document.documentElement;
  const res = { page: [], over: [], above: [], small: [], tiny: [] };
  if (de.scrollWidth - vw > 1) res.page.push(`page scrolls sideways by ${de.scrollWidth - vw}px`);
  if (de.scrollHeight - vh > 1) res.page.push(`page itself scrolls by ${de.scrollHeight - vh}px`);
  const sc = document.querySelector('.screen');
  if (!sc) return res;
  if (sc.scrollWidth - sc.clientWidth > 1) res.page.push(`board scrolls sideways by ${sc.scrollWidth - sc.clientWidth}px`);
  const box = sc.getBoundingClientRect(), originTop = box.top - sc.scrollTop;
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const skip = el => el.ownerSVGElement || el.closest('.scribbles, .sprites, .dmg-pop, .sr-only, .bolt, [aria-hidden="true"]');
  for (const el of sc.querySelectorAll('*')) {
    if (skip(el)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.right > box.left + sc.clientWidth + 1 || r.left < box.left - 1) res.over.push(`${name(el)} spans ${Math.round(r.left - box.left)}..${Math.round(r.right - box.left)} of ${sc.clientWidth}px`);
    if (r.top < originTop - 1) res.above.push(`${name(el)} starts ${Math.round(originTop - r.top)}px above the top`);
  }
  for (const el of sc.querySelectorAll('button, a[href], input, select, textarea, [role="button"]')) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === 'hidden') continue;
    if (r.width < 40 || r.height < 40) res.small.push(`${name(el)} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 22)}" is ${Math.round(r.width)}×${Math.round(r.height)}`);
  }
  const walker = document.createTreeWalker(sc, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode, el = t.parentElement;
    if (!t.textContent.trim() || !el || el.closest('.scribbles, .sr-only, [aria-hidden="true"]')) continue;
    if (el.ownerSVGElement || el.tagName.toLowerCase() === 'text') {
      if (el.closest('.monster, .mage, .ico')) continue; // part of a drawing, not something to read
      const h = el.getBoundingClientRect().height;
      if (h && h < 10) res.tiny.push(`drawing label "${t.textContent.trim().slice(0, 12)}" is ${h.toFixed(1)}px tall`);
    } else {
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 12) res.tiny.push(`${name(el)} text "${t.textContent.trim().slice(0, 16)}" is ${size}px`);
    }
  }
  return res;
}

(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [], notes = [];
  const check = (c, m) => results.push((c ? 'PASS ' : 'FAIL ') + m);
  const file = 'file://' + path.resolve(__dirname, '../dist/preview.html');
  const uniq = a => [...new Set(a)];

  async function open(w, h) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errors.push(`[${w}x${h}] console: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`[${w}x${h}] pageerror: ${e.message}`));
    await page.goto(file); await page.waitForTimeout(300);
    return page;
  }
  const showPuzzle = (page, type, tier) => page.evaluate(([type, tier]) => {
    const b = window.__mim.state.battle;
    Object.assign(b, { puzzle: window.Puzzles.make(type, tier, { name: 'Rina', he: 'She' }), phase: 'puzzle', input: '', choice: null, hintUsed: false, busy: false, last: null });
    window.MIM.render();
  }, [type, tier]);

  // 1. Every screen at every size
  for (const [w, h, label] of SIZES) {
    const tag = `${w}x${h}`, page = await open(w, h), found = { page: [], over: [], above: [], small: [], tiny: [] };
    let n = 0;
    const snap = async screen => {
      await page.waitForTimeout(250);
      const a = await page.evaluate(auditScreen);
      Object.keys(found).forEach(k => a[k].forEach(x => found[k].push(`${screen}: ${x}`)));
      await page.screenshot({ path: path.join(OUT, `${tag}-${String(++n).padStart(2, '0')}-${screen}.png`) });
    };
    await snap('title');
    await page.click('text=Start the adventure'); await snap('wardrobe');
    await page.evaluate(s => localStorage.setItem('math-is-magic-v1', JSON.stringify(s)), SAVE);
    await page.reload(); await page.waitForTimeout(300);
    await page.evaluate(() => window.MIM.go('map')); await snap('map');
    await page.evaluate(() => window.MIM.actions.pickRealm(1)); await snap('intro');
    await page.evaluate(() => window.MIM.actions.fight()); await snap('battle');
    await showPuzzle(page, 'potion', 3); await snap('keypad');
    await showPuzzle(page, 'odd', 3); await snap('choices');
    await page.evaluate(() => { const b = window.__mim.state.battle, p = b.puzzle; if (p.input === 'number') b.input = String(p.answer); else b.choice = p.answer; window.__mim.cast(); });
    await page.waitForTimeout(900); await snap('feedback');
    await page.evaluate(() => { const b = window.__mim.state.battle; b.busy = false; b.hp = 0; window.__mim.next(); }); await snap('result');
    await page.evaluate(() => window.MIM.go('jobs')); await snap('jobs');
    await page.evaluate(() => window.MIM.go('notebook')); await snap('notebook');
    await page.evaluate(() => window.MIM.go('parents')); await snap('parents');
    await page.evaluate(() => { window.MIM.state.finalChapter = 0; window.MIM.go('final'); }); await snap('certificate');
    check(!found.page.length, `${tag} ${label}: no sideways or double scrolling` + (found.page.length ? '\n    ' + uniq(found.page).join('\n    ') : ''));
    check(!found.over.length, `${tag} ${label}: nothing cut off at the sides` + (found.over.length ? '\n    ' + uniq(found.over).slice(0, 12).join('\n    ') : ''));
    check(!found.above.length, `${tag} ${label}: nothing stuck above the top` + (found.above.length ? '\n    ' + uniq(found.above).slice(0, 12).join('\n    ') : ''));
    check(!found.tiny.length, `${tag} ${label}: no text under 12px` + (found.tiny.length ? '\n    ' + uniq(found.tiny).slice(0, 12).join('\n    ') : ''));
    if (found.small.length) notes.push(`${tag} small tap targets:\n    ` + uniq(found.small).join('\n    '));
    const osb = await page.evaluate(() => getComputedStyle(document.querySelector('.screen')).overscrollBehaviorY);
    check(osb === 'contain' || osb === 'none', `${tag}: board keeps swipes to itself (overscroll-behavior: ${osb})`);
    await page.context().close();
  }

  // 2. Every puzzle type and level on the narrowest phones
  for (const [w, h] of [[320, 568], [360, 740]]) {
    const page = await open(w, h), probs = [];
    await page.evaluate(s => localStorage.setItem('math-is-magic-v1', JSON.stringify(s)), SAVE);
    await page.reload(); await page.waitForTimeout(300);
    await page.evaluate(() => { window.MIM.state.realm = 1; window.MIM.actions.fight(); });
    const types = await page.evaluate(() => window.Puzzles.TYPES);
    for (const type of types) for (let tier = 1; tier <= 5; tier++) for (let rep = 0; rep < 3; rep++) {
      await showPuzzle(page, type, tier); await page.waitForTimeout(40);
      const a = await page.evaluate(auditScreen);
      [...a.page, ...a.over, ...a.above, ...a.tiny].forEach(x => probs.push(`${type} L${tier}: ${x}`));
      if (rep === 0 && tier === 5) await page.screenshot({ path: path.join(OUT, `puzzle-${w}-${type}.png`), fullPage: false });
    }
    check(!probs.length, `${w}x${h}: all ${types.length} puzzle types at all 5 levels fit` + (probs.length ? '\n    ' + uniq(probs).slice(0, 20).join('\n    ') : ''));
    await page.context().close();
  }

  // 3. Battle auto-scroll never fights the player. (Headless Chromium cannot scroll a page with a simulated
  //    finger, so a touch is used to interrupt the glide and the mouse wheel stands in for scrolling.)
  for (const [w, h] of [[390, 844], [320, 568]]) {
    const page = await open(w, h);
    await page.evaluate(s => localStorage.setItem('math-is-magic-v1', JSON.stringify(s)), SAVE);
    await page.reload(); await page.waitForTimeout(300);
    await page.evaluate(() => { window.MIM.state.realm = 1; window.MIM.actions.fight(); }); await page.waitForTimeout(300);
    const cdp = await page.context().newCDPSession(page);
    const pos = () => page.evaluate(() => { const sc = document.getElementById('battle-screen'), p = document.getElementById('panel'); return { top: Math.round(sc.scrollTop), max: sc.scrollHeight - sc.clientHeight, panel: Math.max(0, Math.round(p.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 8)) }; });
    // (a) Picking a spell glides the puzzle into view, and a touch stops the glide where it is
    await page.tap('.spell[data-arg="1"]'); await page.waitForTimeout(900);
    let p = await pos();
    check(Math.abs(p.top - Math.min(p.panel, p.max)) <= 2, `${w}x${h}: picking a spell brings the puzzle into view (${p.top} of ${p.panel})`);
    await page.evaluate(() => { const b = window.__mim.state.battle; b.phase = 'spell'; b.puzzle = null; b.busy = false; window.MIM.render(); });
    await page.waitForTimeout(100);
    await page.evaluate(() => {
      const sc = document.getElementById('battle-screen');
      window.__atTouch = null;
      window.addEventListener('touchstart', () => { window.__atTouch = Math.round(sc.scrollTop); }, { capture: true, once: true });
      window.__mim.chooseSpell(1);
    });
    await page.waitForTimeout(20);
    await cdp.send('Input.synthesizeScrollGesture', { x: Math.round(w / 2), y: Math.round(h * 0.4), yDistance: 120, gestureSourceType: 'touch', speed: 1400, preventFling: true });
    await page.waitForTimeout(800);
    const t = await page.evaluate(() => ({ atTouch: window.__atTouch, top: Math.round(document.getElementById('battle-screen').scrollTop) }));
    check(t.atTouch !== null && t.top === t.atTouch, `${w}x${h}: once a finger touches the board, the auto-scroll leaves it alone (${t.atTouch} -> ${t.top})`);
    // (b) Casting keeps the view where the player left it when the answer area is on screen
    await page.evaluate(() => { const sc = document.getElementById('battle-screen'), pn = document.getElementById('panel'); sc.scrollTop = Math.max(0, pn.offsetTop - 120); });
    await page.waitForTimeout(100);
    const before = (await pos()).top;
    await page.evaluate(() => { const b = window.__mim.state.battle, pz = b.puzzle; if (pz.input === 'number') b.input = String(pz.answer); else b.choice = pz.answer; window.__mim.cast(); });
    await page.waitForTimeout(900); p = await pos();
    check(p.top === Math.min(before, p.max), `${w}x${h}: casting does not move the board (${before} -> ${p.top})`);
    // (c) Scrolling up straight after a cast works and stays
    await page.evaluate(() => { document.getElementById('battle-screen').scrollTop = 99999; });
    const low = (await pos()).top;
    await page.mouse.move(Math.round(w / 2), Math.round(h * 0.5)); await page.mouse.wheel(0, -150); await page.waitForTimeout(900);
    p = await pos();
    check(low < 60 || p.top <= low - 100, `${w}x${h}: scrolling up after casting works and stays (${low} -> ${p.top})`);
    check(await page.evaluate(() => (document.scrollingElement || document.documentElement).scrollTop === 0), `${w}x${h}: the page behind the board stays put`);
    await page.context().close();
  }

  await browser.close();
  console.log(results.join('\n'));
  if (notes.length) console.log('\nNotes:\n' + notes.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
