const fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const css = ['style-base.css', 'style-battle.css', 'style-pages.css'].map(src).join('\n');
const local = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'local.json'), 'utf8')); } catch (e) { return {}; } })();
const baseJs = ['puzzles-core.js', 'puzzles-more.js', 'puzzles-extra.js', 'puzzles-new.js', 'art.js', 'monsters-1.js', 'monsters-2.js', 'jobs.js', 'app.js', 'pages.js', 'battle.js'].map(src).join('\n;\n');
// The claude.ai copy can start with a personal default name kept in local.json (not committed)
const js = local.defaultName ? baseJs.replace("name: '', gender:", () => `name: ${JSON.stringify(String(local.defaultName))}, gender:`) : baseJs;
if (/<\/script/i.test(js)) throw new Error('closing script tag inside JS');
const page = src('template.html').replace('/*CSS*/', () => css).replace('/*JS*/', () => js);
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'math-is-magic.html'), page);
// Local preview that mimics the artifact skeleton (doctype, viewport, small reset)
const skeleton = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>`;
fs.writeFileSync(path.join(__dirname, 'dist', 'preview.html'), skeleton + page + '</body></html>');
console.log('built', (page.length / 1024).toFixed(1) + ' KB');

// Standalone site for static hosting (Netlify, Vercel, GitHub Pages, Cloudflare Pages)
const publicJs = baseJs;
const favicon = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#1e3a30"/><path d="M32 8l6.5 15.6 16.9 1.4-12.9 11 4 16.5L32 43.6 17.5 52.5l4-16.5-12.9-11 16.9-1.4z" fill="#f5d561" stroke="#f3efe4" stroke-width="2" stroke-linejoin="round"/></svg>');
// Link previews (WhatsApp, Facebook, X, LinkedIn, Telegram) need an absolute image URL.
// tools/og-image.js renders docs/og-image.jpg; the ?v= hash makes sites fetch it again when it changes.
const SITE = 'https://ardifirmansyah8.github.io/math-is-magic/';
const DESC = 'A chalkboard adventure where every spell is a math puzzle. Dress your mage, collect power-ups and beat ten monsters.';
const ogFile = path.join(__dirname, 'docs', 'og-image.jpg');
const ogImage = fs.existsSync(ogFile) ? `${SITE}og-image.jpg?v=${require('crypto').createHash('sha1').update(fs.readFileSync(ogFile)).digest('hex').slice(0, 8)}` : '';
const ogAlt = 'Math Is Magic written in chalk on a blackboard, with a young mage in a purple robe and a crowned purple serpent.';
const ogImageTags = ogImage ? `
<meta property="og:image" content="${ogImage}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${ogAlt}">
<meta name="twitter:image" content="${ogImage}">
<meta name="twitter:image:alt" content="${ogAlt}">` : '';
const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Math Is Magic</title>
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#4a2c17">
<link rel="canonical" href="${SITE}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Math Is Magic">
<meta property="og:url" content="${SITE}">
<meta property="og:title" content="Math Is Magic">
<meta property="og:description" content="${DESC}">
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="Math Is Magic">
<meta name="twitter:description" content="${DESC}">${ogImageTags}
<link rel="icon" href="${favicon}">
<style>:root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
`;
const publicPage = src('template.html')
  .replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
  .replace('<title>Math Is Magic</title>\n', '')
  .replace('/*CSS*/', () => css)
  .replace('/*JS*/', () => publicJs);
const [headPart, bodyPart] = (() => { const i = publicPage.indexOf('<div class="app">'); return [publicPage.slice(0, i), publicPage.slice(i)]; })();
fs.mkdirSync(path.join(__dirname, 'docs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'docs', 'index.html'), head + headPart + '</head>\n<body>\n' + bodyPart + '</body>\n</html>\n');
console.log('built docs/index.html', ((head + publicPage).length / 1024).toFixed(1) + ' KB');

