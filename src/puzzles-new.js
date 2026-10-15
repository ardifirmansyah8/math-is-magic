/* Math Is Magic: puzzle engine, part 4 (mystery numbers, shapes, ages) */
(function (root) {
  'use strict';
  const P = root.Puzzles;
  const { rnd, h } = P;
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  const aN = n => (/^(8|11|18)/.test(String(n)) ? 'an ' : 'a ') + n;
  const digitSum = n => String(n).split('').reduce((a, c) => a + Number(c), 0);

  /* ---------- 11. Mystery numbers ---------- */
  const COND = {
    parity: even => ({ kind: 'parity', even, test: n => (n % 2 === 0) === even, text: `I am an ${even ? 'even' : 'odd'} number.`, many: `are ${even ? 'even' : 'odd'}`, one: `is ${even ? 'even' : 'odd'}` }),
    mult: k => ({ kind: 'mult', k, test: n => n % k === 0, text: `I am in the ${k} times table.`, many: `are in the ${k} times table`, one: `is in the ${k} times table` }),
    rem: (k, r) => ({ kind: 'rem', k, r, test: n => n % k === r, text: `If you share me into groups of ${k}, ${r} ${r === 1 ? 'is' : 'are'} left over.`, many: `leave ${r} over in groups of ${k}`, one: `leaves ${r} over in groups of ${k}` }),
    ends: d => ({ kind: 'ends', d, test: n => n % 10 === d, text: `My last digit is ${d}.`, many: `end in ${d}`, one: `ends in ${d}` }),
    dsum: s => ({ kind: 'dsum', s, test: n => digitSum(n) === s, text: `My digits add up to ${s}.`, many: `have digits that add up to ${s}`, one: `has digits that add up to ${s}` })
  };
  P.MYSTERY_COND = COND;
  const MYSTERY_CFG = {
    1: { lo: 10, hi: 40, kinds: ['parity', 'mult', 'ends'], ks: [3, 4, 5], n: 2 },
    2: { lo: 10, hi: 60, kinds: ['mult', 'ends', 'dsum', 'parity'], ks: [3, 4, 6, 7, 8, 9], n: 2 },
    3: { lo: 1, hi: 30, kinds: ['rem', 'mult'], ks: [3, 4, 5, 6, 7], n: 2, needRem: true },
    4: { lo: 1, hi: 60, kinds: ['rem'], ks: [4, 5, 6, 7, 8, 9], n: 2 },
    5: { lo: 1, hi: 100, kinds: ['rem'], ks: [2, 3, 4, 5, 7], n: 3 }
  };
  function clueFor(kind, x, ks) {
    if (kind === 'parity') return COND.parity(x % 2 === 0);
    if (kind === 'ends') return COND.ends(x % 10);
    if (kind === 'dsum') return x >= 10 ? COND.dsum(digitSum(x)) : null;
    if (kind === 'mult') { const o = ks.filter(k => x % k === 0); return o.length ? COND.mult(rnd.pick(o)) : null; }
    if (kind === 'rem') { const o = ks.filter(k => x % k !== 0); if (!o.length) return null; const k = rnd.pick(o); return COND.rem(k, x % k); }
    return null;
  }

  function genMystery(t) {
    const cfg = MYSTERY_CFG[t], pool = range(cfg.lo, cfg.hi);
    const fits = cs => pool.filter(n => cs.every(c => c.test(n)));
    for (let attempt = 0; attempt < 5000; attempt++) {
      const x = rnd.int(cfg.lo, cfg.hi), clues = [], usedK = new Set();
      for (let tries = 0; clues.length < cfg.n && tries < 25; tries++) {
        const kind = rnd.pick(cfg.kinds);
        if (kind !== 'mult' && kind !== 'rem' && clues.some(c => c.kind === kind)) continue;
        const c = clueFor(kind, x, cfg.ks.filter(k => !usedK.has(k)));
        if (!c) continue;
        clues.push(c);
        if (c.k) usedK.add(c.k);
      }
      if (clues.length < cfg.n) continue;
      if (cfg.needRem && !clues.some(c => c.kind === 'rem')) continue;
      if (fits(clues).length !== 1) continue;
      // every clue must matter
      if (clues.some((c, i) => fits(clues.filter((_, j) => j !== i)).length < 2)) continue;

      const order = clues.slice().sort((a, b) => fits([a]).length - fits([b]).length);
      const list = fits([order[0]]), idx = list.indexOf(x);
      const cut = Math.max(idx + 2, 6);
      const shown = list.slice(0, cut).join(', ') + (list.length > cut ? ', …' : '.');
      const rest = order.slice(1);
      return {
        type: 'mystery', label: 'Mystery number',
        prompt: `I am a mystery number from ${cfg.lo} to ${cfg.hi}. Read my clues. What number am I?`,
        html: '<ul class="clues">' + clues.map(c => `<li>${c.text}</li>`).join('') + '</ul>',
        input: 'number', answer: x,
        hint: 'List the numbers that fit one clue. Then cross out the ones that break the other clues.',
        explain: `Numbers from ${cfg.lo} to ${cfg.hi} that ${order[0].many}: ${shown} Of these, only ${x} ${rest.map(c => c.one).join(' and ')}.`,
        data: { lo: cfg.lo, hi: cfg.hi, x, clues: clues.map(c => ({ kind: c.kind, even: c.even, k: c.k, r: c.r, d: c.d, s: c.s })) }
      };
    }
    if (t > 1) return genMystery(t - 1);
    throw new Error('mystery generation failed');
  }

  /* ---------- 12. Shapes: area and perimeter ---------- */
  function hasHole(cells, W, H) {
    const set = new Set(cells.map(c => c.join(',')));
    const seen = new Set(), stack = [[-1, -1]];
    while (stack.length) {
      const [x, y] = stack.pop(), k = x + ',' + y;
      if (x < -1 || y < -1 || x > W || y > H || seen.has(k) || set.has(k)) continue;
      seen.add(k);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    return seen.size !== (W + 2) * (H + 2) - cells.length;
  }
  function polyomino(n, maxW, maxH) {
    for (let attempt = 0; attempt < 1000; attempt++) {
      const list = [[0, 0]], set = new Set(['0,0']);
      while (list.length < n) {
        const [x, y] = rnd.pick(list), [dx, dy] = rnd.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
        const k = (x + dx) + ',' + (y + dy);
        if (!set.has(k)) { set.add(k); list.push([x + dx, y + dy]); }
      }
      const minX = Math.min(...list.map(c => c[0])), minY = Math.min(...list.map(c => c[1]));
      const cells = list.map(([x, y]) => [x - minX, y - minY]);
      const W = Math.max(...cells.map(c => c[0])) + 1, H = Math.max(...cells.map(c => c[1])) + 1;
      if (W > maxW || H > maxH || W < 2 || H < 2 || hasHole(cells, W, H)) continue;
      return { cells, W, H };
    }
    throw new Error('polyomino failed');
  }
  const perimeterOf = cells => {
    const set = new Set(cells.map(c => c.join(',')));
    let p = 0;
    cells.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (!set.has((x + dx) + ',' + (y + dy))) p++; }));
    return p;
  };
  function polySVG(cells, W, H) {
    const u = 30, pad = 8, set = new Set(cells.map(c => c.join(',')));
    let grid = '', fills = '', edges = '';
    for (let i = 0; i <= W; i++) grid += `<line x1="${pad + i * u}" y1="${pad}" x2="${pad + i * u}" y2="${pad + H * u}"/>`;
    for (let j = 0; j <= H; j++) grid += `<line x1="${pad}" y1="${pad + j * u}" x2="${pad + W * u}" y2="${pad + j * u}"/>`;
    cells.forEach(([x, y]) => {
      const X = pad + x * u, Y = pad + y * u;
      fills += `<rect x="${X}" y="${Y}" width="${u}" height="${u}"/>`;
      if (!set.has(x + ',' + (y - 1))) edges += `<line x1="${X}" y1="${Y}" x2="${X + u}" y2="${Y}"/>`;
      if (!set.has(x + ',' + (y + 1))) edges += `<line x1="${X}" y1="${Y + u}" x2="${X + u}" y2="${Y + u}"/>`;
      if (!set.has((x - 1) + ',' + y)) edges += `<line x1="${X}" y1="${Y}" x2="${X}" y2="${Y + u}"/>`;
      if (!set.has((x + 1) + ',' + y)) edges += `<line x1="${X + u}" y1="${Y}" x2="${X + u}" y2="${Y + u}"/>`;
    });
    const w = W * u + pad * 2, hh = H * u + pad * 2;
    return `<svg class="shape" viewBox="0 0 ${w} ${hh}" style="width:${w}px" role="img" aria-label="a shape made of squares"><g class="sh-grid">${grid}</g><g class="sh-fill">${fills}</g><g class="sh-edge">${edges}</g></svg>`;
  }
  // Right-angled outline with side labels. pts in cm, labels: [x, y, text, anchor]
  function outlineSVG(pts, labels, W, H) {
    const s = Math.min(24, 230 / W, 170 / H), pad = 30, padL = 54;
    const d = pts.map(([x, y], i) => (i ? 'L' : 'M') + (padL + x * s).toFixed(1) + ' ' + (pad + y * s).toFixed(1)).join(' ') + ' Z';
    const txt = labels.map(([x, y, t, a]) => `<text x="${(padL + x * s).toFixed(1)}" y="${(pad + y * s).toFixed(1)}" text-anchor="${a || 'middle'}" class="sh-lbl">${t}</text>`).join('');
    const w = W * s + padL + pad, hh = H * s + pad * 2;
    return `<svg class="shape" viewBox="0 0 ${w.toFixed(0)} ${hh.toFixed(0)}" style="width:${w.toFixed(0)}px" role="img" aria-label="a shape with labelled sides"><path class="sh-out" d="${d}"/>${txt}</svg>`;
  }
  function lShape(W, H, w, hh) {
    const pts = [[0, 0], [W - w, 0], [W - w, hh], [W, hh], [W, H], [0, H]];
    const labels = [[W / 2, H + 0.9, `${W} cm`], [-0.4, H / 2 + 0.3, `${H} cm`, 'end'], [W - w / 2, hh + 0.9, `${w} cm`], [W - w - 0.3, hh / 2 + 0.3, `${hh} cm`, 'end']];
    return outlineSVG(pts, labels, W, H);
  }
  function uShape(W, H, n, dd) {
    const a = (W - n) / 2;
    const pts = [[0, 0], [a, 0], [a, dd], [a + n, dd], [a + n, 0], [W, 0], [W, H], [0, H]];
    const labels = [[W / 2, H + 0.9, `${W} cm`], [-0.4, H / 2 + 0.3, `${H} cm`, 'end'], [a + n / 2, dd - 0.4, `${n} cm`], [a + n + 0.3, dd / 2 + 0.3, `${dd} cm`, 'start']];
    return outlineSVG(pts, labels, W, H);
  }

  function genArea(t) {
    const { int, pick } = rnd;
    if (t <= 3) {
      const shape = t === 1 ? polyomino(int(4, 6), 4, 3) : t === 2 ? polyomino(int(7, 11), 5, 4) : polyomino(int(4, 8), 4, 3);
      const n = shape.cells.length;
      if (t <= 2) {
        const rows = [];
        for (let y = 0; y < shape.H; y++) rows.push(shape.cells.filter(c => c[1] === y).length);
        return {
          type: 'area', label: 'Shapes',
          prompt: 'How many small squares make up this shape?',
          html: polySVG(shape.cells, shape.W, shape.H),
          input: 'number', answer: n,
          hint: 'Count one row at a time, then add the rows together.',
          explain: `Count row by row: ${rows.join(' + ')} = ${n} squares.`,
          data: { kind: 'cells', cells: shape.cells, ask: 'area' }
        };
      }
      const p = perimeterOf(shape.cells), touches = (4 * n - p) / 2;
      return {
        type: 'area', label: 'Shapes',
        prompt: 'Each small square has sides of 1 cm. What is the perimeter of this shape, in cm?',
        html: polySVG(shape.cells, shape.W, shape.H),
        input: 'number', answer: p,
        hint: 'The perimeter is the distance all the way around the outside. Trace it with your finger and count the sides.',
        explain: `Every square has 4 sides, so ${n} squares have ${n} × 4 = ${4 * n} sides. Each place where two squares touch hides 2 of those sides. There are ${touches} touching places, so the perimeter is ${4 * n} − ${2 * touches} = ${p} cm.`,
        data: { kind: 'cells', cells: shape.cells, ask: 'perimeter' }
      };
    }
    const kind = t === 4 ? pick(['Larea', 'Uarea']) : pick(['Lper', 'Uper']);
    if (kind[0] === 'L') {
      const W = int(6, 12), H = int(5, 10), w = int(2, W - 3), hh = int(2, H - 3);
      const area = W * H - w * hh, per = 2 * (W + H);
      const isArea = kind === 'Larea';
      return {
        type: 'area', label: 'Shapes',
        prompt: `Every corner of this shape is a right angle. What is its ${isArea ? 'area, in square cm' : 'perimeter, in cm'}?`,
        html: lShape(W, H, w, hh),
        input: 'number', answer: isArea ? area : per,
        hint: isArea ? 'Imagine the full rectangle, then take away the missing corner.' : 'Can you slide the two inner edges so they fill the missing corner?',
        explain: isArea
          ? `Imagine the whole ${W} × ${H} rectangle: ${W} × ${H} = ${W * H} square cm. The missing corner is ${w} × ${hh} = ${w * hh} square cm. So the area is ${W * H} − ${w * hh} = ${area} square cm.`
          : `Slide the two inner edges outwards and they fill the missing corner exactly. So the perimeter is the same as ${aN(W)} × ${H} rectangle: 2 × (${W} + ${H}) = ${per} cm.`,
        data: { kind: 'L', W, H, w, h: hh, ask: isArea ? 'area' : 'perimeter' }
      };
    }
    let W, n;
    do { W = int(7, 12); n = int(2, W - 4); } while ((W - n) % 2);
    const H = int(5, 10), dd = int(2, H - 3);
    const area = W * H - n * dd, per = 2 * (W + H) + 2 * dd;
    const isArea = kind === 'Uarea';
    return {
      type: 'area', label: 'Shapes',
      prompt: `A notch is cut from the top of a rectangle. Every corner is a right angle. What is the shape's ${isArea ? 'area, in square cm' : 'perimeter, in cm'}?`,
      html: uShape(W, H, n, dd),
      input: 'number', answer: isArea ? area : per,
      hint: isArea ? 'Work out the full rectangle, then take away the notch.' : 'The outside edges add up like a full rectangle. What does the notch add?',
      explain: isArea
        ? `The full rectangle is ${W} × ${H} = ${W * H} square cm. The notch is ${n} × ${dd} = ${n * dd} square cm. So the area is ${W * H} − ${n * dd} = ${area} square cm.`
        : `The outside edges add up like ${aN(W)} × ${H} rectangle: 2 × (${W} + ${H}) = ${2 * (W + H)} cm. The notch adds its two inner sides: 2 × ${dd} = ${2 * dd} cm. Total: ${2 * (W + H)} + ${2 * dd} = ${per} cm.`,
      data: { kind: 'U', W, H, n, d: dd, ask: isArea ? 'area' : 'perimeter' }
    };
  }

  /* ---------- 13. Ages ---------- */
  function genAges(t, ctx) {
    const { int, pick, shuffle } = rnd;
    const cast = shuffle(P.NPCS.slice());
    if (ctx && ctx.name && rnd.chance(0.35)) cast[0] = { name: ctx.name, he: ctx.he || 'She' };
    const A = cast[0], B = cast[1];
    const yrs = n => (n === 1 ? 'year' : 'years');
    const twice = k => (k === 2 ? 'twice' : k === 3 ? 'three times' : k + ' times');
    if (t === 1) {
      const a = int(5, 12), d = int(2, 9), past = rnd.chance(0.4), tt = past ? int(1, a + d - 2) : int(2, 9);
      const now = a + d, ans = past ? now - tt : now + tt;
      return agePuzzle(`${A.name} is ${a} years old. ${B.name} is ${d} years older than ${A.name}. How old ${past ? `was ${B.name} ${tt} ${yrs(tt)} ago` : `will ${B.name} be in ${tt} ${yrs(tt)}`}?`,
        h.facts([[a, 'years old'], [d, 'years older'], [tt, past ? `${yrs(tt)} ago` : `${yrs(tt)} later`]]), ans,
        'First work out how old they are now.',
        `${B.name} is ${a} + ${d} = ${now} now. ${past ? `${tt} ${yrs(tt)} ago ${B.he.toLowerCase()} was ${now} − ${tt}` : `In ${tt} ${yrs(tt)} ${B.he.toLowerCase()} will be ${now} + ${tt}`} = ${ans}.`,
        { kind: 'later', a, d, t: tt, past });
    }
    if (t === 2) {
      const y = int(3, 15), d = int(1, 9), S = 2 * y + d, older = rnd.chance(0.5);
      return agePuzzle(`${A.name} and ${B.name} are ${S} years old altogether. ${A.name} is ${d} years older than ${B.name}. How old is ${older ? A.name : B.name}?`,
        h.facts([[S, 'altogether'], [d, 'years apart']]), older ? y + d : y,
        'If you take away the difference, the two ages are the same.',
        `Take away the difference first: ${S} − ${d} = ${S - d}. Now the two ages are equal, so ${B.name} is ${S - d} ÷ 2 = ${y}` + (older ? ` and ${A.name} is ${y} + ${d} = ${y + d}.` : '.'),
        { kind: 'sumdiff', S, d, older });
    }
    if (t === 3) {
      const y = int(3, 14), k = int(2, 5), S = y * (k + 1), askA = rnd.chance(0.4);
      return agePuzzle(`${A.name} is ${twice(k)} as old as ${B.name}. Together they are ${S} years old. How old is ${askA ? A.name : B.name}?`,
        h.facts([[k + '×', 'as old'], [S, 'altogether']]), askA ? k * y : y,
        `Think of ${B.name}'s age as 1 part. How many parts make ${S}?`,
        `Think of ${B.name}'s age as 1 part. ${A.name}'s age is ${k} parts, so together they make ${k + 1} parts, which is ${S}. One part is ${S} ÷ ${k + 1} = ${y}` + (askA ? `, so ${A.name} is ${k} × ${y} = ${k * y}.` : `, so ${B.name} is ${y}.`),
        { kind: 'times', S, k, askA });
    }
    if (t === 4) {
      const opts = [];
      for (let y = 2; y <= 15; y++) for (const k1 of [3, 4, 5]) for (let tt = 1; tt <= 15; tt++) {
        const top = k1 * y + tt, bot = y + tt;
        if (top % bot === 0) { const k2 = top / bot; if (k2 >= 2 && k2 < k1) opts.push({ y, k1, tt, k2 }); }
      }
      const { y, k1, tt, k2 } = pick(opts);
      return agePuzzle(`${A.name} is ${twice(k1)} as old as ${B.name}. In ${tt} years, ${A.name} will be ${twice(k2)} as old as ${B.name}. How old is ${B.name} now?`,
        h.facts([[k1 + '×', 'now'], [k2 + '×', `in ${tt} years`]]), y,
        'Both of them get older by the same number of years. Try a few ages for ' + B.name + ' and check.',
        `Call ${B.name}'s age y, so ${A.name} is ${k1}y. In ${tt} years: ${k1}y + ${tt} = ${k2} × (y + ${tt}), which means ${k1 - k2 === 1 ? `y = ${(k2 - 1) * tt}` : `${k1 - k2}y = ${(k2 - 1) * tt}, so y = ${y}`}. Check: ${k1 * y} + ${tt} = ${k1 * y + tt}, and ${k2} × ${y + tt} = ${k2 * (y + tt)}.`,
        { kind: 'ratio', k1, k2, t: tt });
    }
    const opts = [];
    for (const k of [2, 3]) for (let b = 2; b <= 10; b++) for (let a = 2; a <= 20; a++) {
      if ((a + k * b) % (k - 1) === 0) { const x = (a + k * b) / (k - 1); if (x > b + 1 && x <= 40) opts.push({ k, a, b, x }); }
    }
    const { k, a, b, x } = pick(opts);
    return agePuzzle(`In ${a} years, ${A.name} will be ${twice(k)} as old as ${A.he.toLowerCase()} was ${b} years ago. How old is ${A.name} now?`,
      h.facts([[a, 'years ahead'], [b, 'years ago']]), x,
      'Call the age now x. Write down the age in the future and the age in the past.',
      `Call the age now x. In ${a} years: x + ${a}. ${b} years ago: x − ${b}. So x + ${a} = ${k} × (x − ${b}) = ${k}x − ${k * b}, which gives ${k - 1 > 1 ? `${k - 1}x = ${a + k * b}, so x = ${x}` : `x = ${a} + ${k * b} = ${x}`}. Check: ${x} + ${a} = ${x + a}, and ${k} × ${x - b} = ${k * (x - b)}.`,
      { kind: 'self', k, a, b });
  }
  function agePuzzle(prompt, html, answer, hint, explain, data) {
    return { type: 'ages', label: 'Age puzzle', prompt, html, input: 'number', answer, hint, explain, data };
  }

  P.gen.mystery = genMystery;
  P.gen.area = genArea;
  P.gen.ages = genAges;
  P.TYPES = Object.keys(P.gen);
  P.CLASSIC_TYPES = ['pattern', 'magic', 'potion', 'legs', 'calendar', 'backwards', 'sums', 'counting', 'odd', 'picture'];
})(typeof window !== 'undefined' ? window : globalThis);
