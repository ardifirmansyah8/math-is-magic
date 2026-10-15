// Brute-force checks for every puzzle generator: node test/puzzles.test.js
require('../src/puzzles-core.js');
require('../src/puzzles-more.js');
require('../src/puzzles-extra.js');
require('../src/puzzles-new.js');
const P = globalThis.Puzzles;

const N = Number(process.argv[2] || 1500);
const failures = [];
const fail = (p, msg) => { if (failures.length < 60) failures.push(`[${p.type} t${p.tier}] ${msg} :: ${JSON.stringify(p.data).slice(0, 300)}`); };
const sum = a => a.reduce((s, x) => s + x, 0);

function extrapolate(seq) {
  const rows = [seq.slice()];
  while (new Set(rows[rows.length - 1]).size > 1) {
    const r = rows[rows.length - 1];
    if (r.length < 2) return NaN;
    rows.push(r.slice(1).map((v, i) => v - r[i]));
  }
  let next = rows[rows.length - 1][0];
  for (let i = rows.length - 2; i >= 0; i--) next = rows[i][rows[i].length - 1] + next;
  return next;
}

function checkPattern(p) {
  const { kind, seq } = p.data, last = seq[seq.length - 1];
  const d = seq.slice(1).map((v, i) => v - seq[i]);
  let exp;
  switch (kind) {
    case 'add': case 'sub': if (new Set(d).size !== 1) fail(p, 'not arithmetic'); exp = last + d[0]; break;
    case 'double': case 'triple': { const r = seq[1] / seq[0]; if (!seq.every((v, i) => !i || v === seq[i - 1] * r)) fail(p, 'not geometric'); exp = last * r; break; }
    case 'growing': case 'squares': case 'triangle': case 'squarePlus': case 'cubes': exp = extrapolate(seq); break;
    case 'interleave': exp = seq[4] + (seq[4] - seq[2]); if (seq[2] - seq[0] !== seq[4] - seq[2]) fail(p, 'interleave broken'); break;
    case 'fib': if (!seq.every((v, i) => i < 2 || v === seq[i - 1] + seq[i - 2])) fail(p, 'not fib'); exp = seq[4] + seq[5]; break;
    case 'doublePlus': { const c = seq[1] - 2 * seq[0]; if (!seq.every((v, i) => !i || v === 2 * seq[i - 1] + c)) fail(p, 'not 2x+c'); exp = 2 * last + c; break; }
    case 'doublingGaps': if (!d.every((x, i) => !i || x === 2 * d[i - 1])) fail(p, 'gaps not doubling'); exp = last + 2 * d[d.length - 1]; break;
    default: fail(p, 'unknown kind ' + kind);
  }
  if (exp !== p.answer) fail(p, `expected ${exp} got ${p.answer}`);
  if (seq.some(v => v <= 0)) fail(p, 'non-positive term');
}

function checkMagic(p) {
  const { vals, hidden, target, showSum } = p.data;
  const lines = P.MAGIC_LINES.map(L => sum(L.cells.map(c => vals[c])));
  if (new Set(lines).size !== 1) fail(p, 'not magic');
  if (new Set(vals).size !== 9) fail(p, 'repeated values');
  if (p.answer !== vals[target]) fail(p, 'answer mismatch');
  // independent deduction
  const known = vals.map((v, i) => hidden.includes(i) ? null : v);
  let S = showSum ? lines[0] : null, progress = true;
  while (progress) {
    progress = false;
    for (const L of P.MAGIC_LINES) {
      const unk = L.cells.filter(c => known[c] === null);
      if (S === null && unk.length === 0) { S = sum(L.cells.map(c => known[c])); progress = true; }
      else if (S !== null && unk.length === 1) {
        const v = S - sum(L.cells.filter(c => c !== unk[0]).map(c => known[c]));
        if (v !== vals[unk[0]]) fail(p, 'deduction mismatch');
        known[unk[0]] = v; progress = true;
      }
    }
  }
  if (known[target] === null) fail(p, 'target not deducible');
  if (!p.html.includes('cell-q')) fail(p, 'no ? cell');
}

function checkPotion(p) {
  const { eqs, ask, vals } = p.data;
  const vars = Object.keys(vals);
  const fns = eqs.map(e => new Function('v', 'return (' + e.terms.map(x => ({ '+': '+', '-': '-', '*': '*' }[x] || `v["${x}"]`)).join('') + ') === ' + e.rhs));
  if (!fns.every(f => f(vals))) fail(p, 'values do not satisfy equations');
  const seen = new Set(); let count = 0;
  const v = {};
  const rec = i => {
    if (i === vars.length) { if (fns.every(f => f(v))) { count++; seen.add(v[ask]); } return; }
    for (let x = 0; x <= 30; x++) { v[vars[i]] = x; rec(i + 1); }
  };
  rec(0);
  if (count === 0) fail(p, 'no solution in range');
  if (seen.size !== 1 || !seen.has(p.answer)) fail(p, `ask not unique: ${[...seen].join(',')}`);
}

function checkLegs(p) {
  const { H, L1, L2, legs, spiders } = p.data;
  const sols = [];
  for (let s = 0; s <= H; s++) if (s * L1 + (H - s) * L2 + spiders * 8 === legs) sols.push({ small: s, big: H - s });
  if (sols.length !== 1) fail(p, 'not unique');
  else if (p.answer !== (p.data.askBig ? sols[0].big : sols[0].small)) fail(p, 'wrong answer');
  if (sols.length && (sols[0].small < 1 || sols[0].big < 1)) fail(p, 'zero group');
}

function checkCalendar(p) {
  const d = p.data, m = (a, k) => ((a % k) + k) % k;
  let exp;
  if (d.kind === 'clock') { exp = m(d.back ? d.s - d.n : d.s + d.n, 12) || 12; }
  else if (d.mode === 'month') exp = m(d.start + d.d - 1, 7);
  else if (d.mode === 'ago') exp = m(d.start - d.n, 7);
  else exp = m(d.start + d.n, 7);
  if (exp !== p.answer) fail(p, `expected ${exp}`);
}

function checkBackwards(p) {
  const d = p.data;
  if (d.kind === 'dragon') {
    let c = d.start;
    for (let i = 0; i < d.nights; i++) { if (c % 2) fail(p, 'odd coins'); c = c / 2 - d.k; if (c < 0) fail(p, 'negative'); }
    if (c !== d.end || p.answer !== d.start) fail(p, 'dragon mismatch');
    return;
  }
  let c = d.x;
  for (const o of d.ops) {
    if (o.op === 'add') c += o.k; else if (o.op === 'sub') c -= o.k; else if (o.op === 'double') c *= 2; else if (o.op === 'triple') c *= 3;
    else { if (c % 2) fail(p, 'halving odd'); c /= 2; }
    if (c <= 0 || !Number.isInteger(c)) fail(p, 'bad intermediate ' + c);
  }
  if (c !== d.end || p.answer !== d.x) fail(p, 'ops mismatch');
}

function checkSums(p) {
  const d = p.data;
  const exp = d.terms ? sum(d.terms) : d.factors.reduce((s, x) => s * x, 1);
  if (exp !== p.answer) fail(p, `expected ${exp}`);
}

function checkCounting(p) {
  const d = p.data;
  let exp = 0;
  if (d.kind === 'outfits' || d.kind === 'outfits3') exp = d.sizes.reduce((s, x) => s * x, 1);
  else if (d.kind === 'handshakes') { for (let i = 0; i < d.n; i++) for (let j = i + 1; j < d.n; j++) exp++; }
  else if (d.kind === 'squares') { for (let s = 1; s <= d.n; s++) for (let x = 0; x + s <= d.n; x++) for (let y = 0; y + s <= d.n; y++) exp++; }
  else if (d.kind === 'digits') {
    const set = new Set();
    for (const a of d.digits) for (const b of d.digits) if (d.repeat || a !== b) set.add(a * 10 + b);
    exp = set.size;
  } else if (d.kind === 'paths') {
    const g = [];
    for (let y = 0; y <= d.h; y++) { g.push([]); for (let x = 0; x <= d.w; x++) g[y][x] = (x === 0 || y === 0) ? 1 : g[y - 1][x] + g[y][x - 1]; }
    exp = g[d.h][d.w];
  } else if (d.kind === 'strip' || d.kind === 'rects') {
    for (let x1 = 0; x1 <= d.cols; x1++) for (let x2 = x1 + 1; x2 <= d.cols; x2++) for (let y1 = 0; y1 <= d.rows; y1++) for (let y2 = y1 + 1; y2 <= d.rows; y2++) exp++;
  } else fail(p, 'unknown counting kind');
  if (exp !== p.answer) fail(p, `expected ${exp}`);
}

function checkOdd(p) {
  const { prop, nums, odd } = p.data;
  if (new Set(nums).size !== 4) fail(p, 'duplicate numbers');
  const flags = nums.map(P.ODD_PROPS[prop].test), cnt = flags.filter(Boolean).length;
  if (cnt !== 1 && cnt !== 3) fail(p, 'property does not single out one');
  const lone = nums[cnt === 1 ? flags.indexOf(true) : flags.indexOf(false)];
  if (lone !== odd || nums[p.answer] !== odd) fail(p, 'wrong odd one');
  for (const k of Object.keys(P.ODD_PROPS)) {
    const f = nums.map(P.ODD_PROPS[k].test), c = f.filter(Boolean).length;
    if ((c === 1 || c === 3) && nums[c === 1 ? f.indexOf(true) : f.indexOf(false)] !== odd) fail(p, 'ambiguous via ' + k);
  }
}

function checkPicture(p) {
  const { seq, correct, options } = p.data;
  const keys = options.map(P.tileKey);
  if (new Set(keys).size !== 4) fail(p, 'duplicate options');
  if (P.tileKey(options[p.answer]) !== P.tileKey(correct)) fail(p, 'answer not correct tile');
  const full = seq.concat([correct]);
  for (const attr of ['s', 'c']) {
    const preds = new Set();
    for (const per of [1, 2, 3]) {
      if (seq.every((x, i) => i < per || x[attr] === seq[i - per][attr])) preds.add(seq[5 - per][attr]);
    }
    if (preds.size !== 1 || !preds.has(correct[attr])) fail(p, `attr ${attr} ambiguous/wrong`);
  }
  const norm = r => ((r % 360) + 360) % 360;
  if (correct.s === 'arrow') {
    const d = norm(full[1].r - full[0].r);
    if (!full.every((x, i) => !i || norm(x.r - full[i - 1].r) === d)) fail(p, 'rotation not constant');
  }
}


function checkMystery(p) {
  const { lo, hi, x, clues } = p.data;
  const T = { parity: c => n => (n % 2 === 0) === c.even, mult: c => n => n % c.k === 0, rem: c => n => n % c.k === c.r,
    ends: c => n => n % 10 === c.d, dsum: c => n => String(n).split('').reduce((a, d) => a + +d, 0) === c.s };
  const tests = clues.map(c => T[c.kind](c));
  const pool = []; for (let n = lo; n <= hi; n++) pool.push(n);
  const fits = ts => pool.filter(n => ts.every(f => f(n)));
  const sol = fits(tests);
  if (sol.length !== 1 || sol[0] !== x || p.answer !== x) fail(p, 'not unique: ' + sol.join(','));
  tests.forEach((_, i) => { if (fits(tests.filter((__, j) => j !== i)).length < 2) fail(p, 'clue ' + i + ' is not needed'); });
}
function checkArea(p) {
  const d = p.data;
  let cells = [];
  if (d.kind === 'cells') cells = d.cells;
  else for (let x = 0; x < d.W; x++) for (let y = 0; y < d.H; y++) {
    if (d.kind === 'L' && x >= d.W - d.w && y < d.h) continue;
    if (d.kind === 'U') { const a = (d.W - d.n) / 2; if (x >= a && x < a + d.n && y < d.d) continue; }
    cells.push([x, y]);
  }
  const set = new Set(cells.map(c => c.join(',')));
  if (set.size !== cells.length) fail(p, 'duplicate cells');
  let per = 0;
  cells.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (!set.has((x + dx) + ',' + (y + dy))) per++; }));
  // connected?
  const seen = new Set([cells[0].join(',')]), st = [cells[0]];
  while (st.length) { const [x, y] = st.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const k = (x + dx) + ',' + (y + dy); if (set.has(k) && !seen.has(k)) { seen.add(k); st.push([x + dx, y + dy]); } }); }
  if (seen.size !== cells.length) fail(p, 'shape not connected');
  const exp = d.ask === 'area' ? cells.length : per;
  if (exp !== p.answer) fail(p, `expected ${exp} got ${p.answer}`);
}
function checkAges(p) {
  const d = p.data, sols = [];
  if (d.kind === 'later') { const exp = d.a + d.d + (d.past ? -d.t : d.t); if (exp !== p.answer || exp < 1) fail(p, 'later wrong'); return; }
  for (let y = 0; y <= 200; y++) {
    if (d.kind === 'sumdiff' && 2 * y + d.d === d.S) sols.push(d.older ? y + d.d : y);
    if (d.kind === 'times' && y * (d.k + 1) === d.S) sols.push(d.askA ? d.k * y : y);
    if (d.kind === 'ratio' && y >= 1 && d.k1 * y + d.t === d.k2 * (y + d.t)) sols.push(y);
    if (d.kind === 'self' && y > d.b && y + d.a === d.k * (y - d.b)) sols.push(y);
  }
  if (sols.length !== 1 || sols[0] !== p.answer) fail(p, 'ages: ' + sols.join(','));
}

const CHECK = { pattern: checkPattern, magic: checkMagic, potion: checkPotion, legs: checkLegs, calendar: checkCalendar, backwards: checkBackwards, sums: checkSums, counting: checkCounting, odd: checkOdd, picture: checkPicture, mystery: checkMystery, area: checkArea, ages: checkAges };

const stats = {};
for (const type of P.TYPES) {
  for (let t = 1; t <= 5; t++) {
    const n = type === 'potion' ? Math.min(N, 300) : N;
    const t0 = Date.now();
    const answers = new Set();
    for (let i = 0; i < n; i++) {
      const p = P.make(type, t, { name: 'Rina' });
      if (p.input === 'number') {
        if (!Number.isInteger(p.answer) || p.answer < 0 || p.answer > 99999) fail(p, 'bad numeric answer ' + p.answer);
        if (!new RegExp('(^|[^0-9])' + p.answer + '([^0-9]|$)').test(p.explain)) fail(p, 'explanation never states the answer');
      } else if (!p.choices.some(c => c.id === p.answer)) fail(p, 'answer not among choices');
      const text = [p.prompt, p.hint, p.explain, p.html].join(' ');
      if (/undefined|NaN|\[object/.test(text)) fail(p, 'bad text: ' + text.slice(0, 200));
      if (!p.prompt || !p.hint || !p.explain || !p.label) fail(p, 'missing text field');
      CHECK[type](p);
      answers.add(p.input === 'number' ? p.answer : 'c');
    }
    stats[`${type} t${t}`] = `${n} ok-ish, ${answers.size} distinct answers, ${((Date.now() - t0) / n).toFixed(2)} ms each`;
  }
}

console.log(Object.entries(stats).map(([k, v]) => k.padEnd(14) + v).join('\n'));
if (failures.length) { console.log('\nFAILURES:\n' + failures.join('\n')); process.exit(1); }
console.log('\nAll puzzle checks passed.');
