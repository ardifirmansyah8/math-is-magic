// Renders docs/og-image.jpg, the picture social sites show when the game's link is shared.
// Run after a build:  node build.js && node tools/og-image.js
//
// Fonts come from Google Fonts. To render offline, install @fontsource/andika, @fontsource/kalam and
// @fontsource/fredericka-the-great somewhere Node can find them (node_modules or NODE_PATH).
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'og-image.jpg');
const W = 1200, H = 630;

function localFonts() {
  const faces = [
    ['Andika', 400, '@fontsource/andika/files/andika-latin-400-normal.woff2'],
    ['Andika', 700, '@fontsource/andika/files/andika-latin-700-normal.woff2'],
    ['Kalam', 400, '@fontsource/kalam/files/kalam-latin-400-normal.woff2'],
    ['Kalam', 700, '@fontsource/kalam/files/kalam-latin-700-normal.woff2'],
    ['Fredericka the Great', 400, '@fontsource/fredericka-the-great/files/fredericka-the-great-latin-400-normal.woff2']
  ];
  const find = rel => (require.resolve.paths(rel) || []).map(dir => path.join(dir, rel)).find(p => fs.existsSync(p));
  const files = faces.map(f => find(f[2]));
  if (files.some(f => !f)) return null;
  return faces.map(([family, weight], i) =>
    `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;src:url(data:font/woff2;base64,${fs.readFileSync(files[i]).toString('base64')}) format("woff2")}`).join('\n');
}

const CSS = `
.og { position: absolute; inset: 0; display: grid; grid-template-columns: 270px 1fr 270px; align-items: center; gap: 8px; padding: 18px 44px 10px 34px; }
.og-mage, .og-monster { position: relative; display: grid; justify-items: center; align-self: end; }
.og-mage .mage { width: 270px; height: auto; }
.og-monster .monster { width: 250px; height: auto; margin-bottom: 34px; }
.og-text { position: relative; display: grid; justify-items: center; gap: 12px; text-align: center; }
.og-eyebrow { font: 700 17px var(--font-body); letter-spacing: .2em; text-transform: uppercase; color: var(--chalk); opacity: .7; }
.og-title { margin: 0; font-size: 132px; line-height: .88; }
.og-title em { display: block; font-style: normal; color: var(--yellow); }
.og-tag { margin: 6px 0 0; font: 400 31px/1.25 var(--font-hand); color: var(--yellow); white-space: nowrap; }
.og-facts { margin: 0; padding: 7px 18px; border: 2px dashed rgba(243, 239, 228, .45); border-radius: var(--wobble); font: 700 20px var(--font-body); color: var(--chalk); white-space: nowrap; }
.og .scribbles span { opacity: .12; }
`;

(async () => {
  const fonts = localFonts();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  if (fonts) await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
  await page.goto('file://' + path.join(ROOT, 'docs', 'index.html'));
  await page.waitForFunction(() => window.MIM && window.Art && document.querySelector('.scribbles'));
  await page.evaluate(({ fonts, css }) => {
    if (fonts) { const st = document.createElement('style'); st.textContent = fonts; document.head.appendChild(st); }
    const Art = window.Art, hero = Object.assign({}, Art.DEFAULT_HERO);
    const scribbles = document.querySelector('.scribbles').outerHTML;
    document.getElementById('board').innerHTML = `<style>${css}</style><section class="og">${scribbles}
      <div class="og-mage">${Art.mage(hero, '')}</div>
      <div class="og-text">
        <p class="og-eyebrow">A chalkboard adventure</p>
        <h1 class="display og-title">Math Is <em>Magic</em></h1>
        <p class="og-tag">Every spell is a puzzle.<br>Solve it to cast it.</p>
        <p class="og-facts">13 puzzle types · 10 monsters · Free to play</p>
      </div>
      <div class="og-monster">${Art.monster('nolnaga', '', 'Nolnaga')}</div>
    </section>`;
  }, { fonts, css: CSS });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const missing = await page.evaluate(() => ['Fredericka the Great', 'Kalam', 'Andika'].filter(f => !document.fonts.check(`20px "${f}"`)));
  if (missing.length) console.warn('Warning: these fonts did not load, so the image uses fallbacks:', missing.join(', '));
  await page.screenshot({ path: OUT, type: 'jpeg', quality: 86, animations: 'disabled' });
  await browser.close();
  console.log('wrote', path.relative(ROOT, OUT), (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB');
})().catch(e => { console.error(e); process.exit(1); });
