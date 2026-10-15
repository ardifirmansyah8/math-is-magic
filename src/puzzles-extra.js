/* Math Is Magic: puzzle engine, part 3 (clever sums, counting, odd one out, picture patterns, registry) */
(function (root) {
  'use strict';
  const P = root.Puzzles;
  const { rnd, h } = P;
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  const gauss = n => n * (n + 1) / 2;

  /* ---------- 7. Clever sums ---------- */
  const SUM_KINDS = { 1: ['tens'], 2: ['gaussSmall', 'times25'], 3: ['gauss', 'consecutive'], 4: ['odds', 'times99', 'evens'], 5: ['gaussBig', 'alternating', 'mountain'] };

  function genSums(t) {
    const { int, pick, shuffle } = rnd;
    const kind = pick(SUM_KINDS[t]);
    let terms = null, factors = null, display, ans, explain, hint;
    switch (kind) {
      case 'tens': {
        const a = int(1, 9), b = int(1, 9), c = int(1, 9);
        terms = shuffle([a, 10 - a, b, 10 - b, c]); ans = 20 + c;
        display = terms.join(' + ');
        explain = `Pair up numbers that make 10: ${a} + ${10 - a} = 10 and ${b} + ${10 - b} = 10. That makes 20, and 20 + ${c} = ${ans}.`;
        hint = 'Look for two numbers that add up to 10.';
        break;
      }
      case 'gaussSmall': case 'gauss': case 'gaussBig': {
        const n = kind === 'gaussSmall' ? int(5, 10) : kind === 'gauss' ? int(11, 30) : pick([40, 50, 60, 80, 100]);
        terms = range(1, n); ans = gauss(n);
        display = n <= 6 ? terms.join(' + ') : `1 + 2 + 3 + … + ${n}`;
        explain = n % 2 === 0
          ? `Pair the ends: 1 + ${n}, 2 + ${n - 1}, and so on. Each pair makes ${n + 1} and there are ${n / 2} pairs, so the total is ${n / 2} × ${n + 1} = ${ans}.`
          : `Write the sum forwards and backwards, then add the two rows. Every column makes ${n + 1} and there are ${n} columns, so double the sum is ${n} × ${n + 1} = ${n * (n + 1)}. Half of that is ${ans}.`;
        hint = `Pair the first and last numbers: 1 + ${n} = ${n + 1}. What about 2 + ${n - 1}?`;
        break;
      }
      case 'times25': {
        const k = int(2, 9);
        factors = [25, k, 4]; ans = 100 * k; display = `25 × ${k} × 4`;
        explain = `Multiply 25 × 4 first: that makes 100. Then 100 × ${k} = ${ans}.`;
        hint = 'You can multiply in any order. Which two numbers make a round number?';
        break;
      }
      case 'consecutive': {
        const a = int(11, 40), len = int(5, 11), b = a + len - 1;
        terms = range(a, b); ans = terms.reduce((s, x) => s + x, 0);
        display = `${a} + ${a + 1} + ${a + 2} + … + ${b}`;
        explain = `There are ${len} numbers. The first and last make ${a} + ${b} = ${a + b}, and so does every pair from the outside in. So the total is ${len} × ${a + b} ÷ 2 = ${ans}.`;
        hint = 'Pair the first and last numbers. How many numbers are there altogether?';
        break;
      }
      case 'odds': {
        const n = int(5, 15);
        terms = range(1, n).map(i => 2 * i - 1); ans = n * n;
        display = `1 + 3 + 5 + … + ${2 * n - 1}`;
        explain = `Adding odd numbers in order always makes a square number: 1 + 3 = 2 × 2 and 1 + 3 + 5 = 3 × 3. Here there are ${n} odd numbers, so the total is ${n} × ${n} = ${ans}.`;
        hint = 'Try small cases first: 1 + 3, then 1 + 3 + 5. What kind of numbers do you get?';
        break;
      }
      case 'evens': {
        const n = int(5, 15);
        terms = range(1, n).map(i => 2 * i); ans = n * (n + 1);
        display = `2 + 4 + 6 + … + ${2 * n}`;
        explain = `This is double 1 + 2 + … + ${n}. That sum is ${n} × ${n + 1} ÷ 2 = ${gauss(n)}, so the answer is 2 × ${gauss(n)} = ${ans}.`;
        hint = `Every number here is double something. What is 1 + 2 + … + ${n}?`;
        break;
      }
      case 'times99': {
        const k = int(3, 12);
        factors = [99, k]; ans = 99 * k; display = `99 × ${k}`;
        explain = `99 is 100 − 1. So 99 × ${k} = 100 × ${k} − ${k} = ${100 * k} − ${k} = ${ans}.`;
        hint = '99 is very close to 100.';
        break;
      }
      case 'alternating': {
        const n = int(10, 50) * 2;
        terms = []; for (let i = n; i >= 1; i--) terms.push((n - i) % 2 === 0 ? i : -i);
        ans = n / 2;
        display = `${n} − ${n - 1} + ${n - 2} − ${n - 3} + … + 2 − 1`;
        explain = `Group the numbers in pairs: (${n} − ${n - 1}) + (${n - 2} − ${n - 3}) + … + (2 − 1). Each pair makes 1 and there are ${n / 2} pairs, so the answer is ${ans}.`;
        hint = 'Look at the numbers two at a time.';
        break;
      }
      case 'mountain': {
        const n = int(8, 25);
        terms = range(1, n).concat(range(1, n - 1).reverse()); ans = n * n;
        display = `1 + 2 + … + ${n - 1} + ${n} + ${n - 1} + … + 2 + 1`;
        explain = `Each side of the mountain is 1 + 2 + … + ${n - 1} = ${gauss(n - 1)}. The two sides make ${2 * gauss(n - 1)}, and adding the top number ${n} gives ${ans}. That is ${n} × ${n}!`;
        hint = 'Try a small mountain first: 1 + 2 + 1, then 1 + 2 + 3 + 2 + 1.';
        break;
      }
    }
    return {
      type: 'sums', label: 'Clever sums',
      prompt: kind === 'tens' ? 'Add them up. Can you do it in your head?' : 'Work it out. There is a shortcut!',
      html: h.expr(display),
      input: 'number', answer: ans, hint, explain,
      data: { kind, terms, factors, ans }
    };
  }

  /* ---------- 8. Counting ---------- */
  function gridSVG(cols, rows, ab) {
    const cell = 30, pad = 14, W = cols * cell + pad * 2, H = rows * cell + pad * 2;
    let lines = '';
    for (let i = 0; i <= cols; i++) lines += `<line x1="${pad + i * cell}" y1="${pad}" x2="${pad + i * cell}" y2="${pad + rows * cell}"/>`;
    for (let j = 0; j <= rows; j++) lines += `<line x1="${pad}" y1="${pad + j * cell}" x2="${pad + cols * cell}" y2="${pad + j * cell}"/>`;
    let marks = '';
    if (ab) {
      const pt = (x, y, l) => `<circle cx="${x}" cy="${y}" r="9" class="g-dot"/><text x="${x}" y="${y + 0.5}" class="g-lbl">${l}</text>`;
      marks = pt(pad, pad, 'A') + pt(pad + cols * cell, pad + rows * cell, 'B');
    }
    return `<svg class="gridsvg" viewBox="0 0 ${W} ${H}" style="width:${Math.round(W * 1.5)}px" role="img" aria-label="${cols} by ${rows} grid"><g class="g-lines">${lines}</g>${marks}</svg>`;
  }
  P.gridSVG = gridSVG;

  const COUNT_KINDS = { 1: ['outfits'], 2: ['outfits3', 'handshakes'], 3: ['handshakes', 'squares', 'digits'], 4: ['squares', 'paths', 'handshakes', 'strip'], 5: ['squares', 'paths', 'handshakes', 'rects'] };

  function genCounting(t, ctx) {
    const { int, pick, shuffle } = rnd;
    const kind = pick(COUNT_KINDS[t]);
    const name = (ctx && ctx.name) || 'The mage', pron = ((ctx && ctx.he) || 'She').toLowerCase();
    let prompt, html = '', ans, explain, hint, data;
    switch (kind) {
      case 'outfits': {
        const a = int(2, 3), b = int(2, 4);
        ans = a * b;
        prompt = `${name} has ${a} magic hats and ${b} cloaks. How many different hat-and-cloak outfits can ${pron} make?`;
        html = h.facts([[a, 'hats'], [b, 'cloaks']]);
        explain = `Each of the ${a} hats can go with each of the ${b} cloaks: ${a} × ${b} = ${ans} outfits.`;
        hint = 'Pick one hat. How many cloaks could go with it?';
        data = { kind, sizes: [a, b] };
        break;
      }
      case 'outfits3': {
        const a = int(2, 3), b = int(2, 3), c = int(2, 4);
        ans = a * b * c;
        prompt = `${name} has ${a} hats, ${b} cloaks and ${c} wands. An outfit is one of each. How many different outfits can ${pron} make?`;
        html = h.facts([[a, 'hats'], [b, 'cloaks'], [c, 'wands']]);
        explain = `${a} hats × ${b} cloaks = ${a * b} hat-and-cloak pairs. Each pair can take any of the ${c} wands: ${a * b} × ${c} = ${ans}.`;
        hint = 'First count the hat-and-cloak pairs. Then add a wand to each.';
        data = { kind, sizes: [a, b, c] };
        break;
      }
      case 'handshakes': {
        const n = { 2: int(4, 5), 3: int(6, 10), 4: int(10, 15), 5: int(15, 25) }[t];
        ans = n * (n - 1) / 2;
        prompt = `${n} wizards meet at the Moon Festival. Every wizard shakes hands with every other wizard exactly once. How many handshakes are there?`;
        html = h.facts([[n, 'wizards']]);
        explain = `Each wizard shakes ${n - 1} hands, which gives ${n} × ${n - 1} = ${n * (n - 1)}. But that counts every handshake twice, once for each wizard, so there are ${n * (n - 1)} ÷ 2 = ${ans} handshakes.`;
        hint = n <= 5 ? 'Try drawing the wizards as dots and joining every pair with a line.' : 'How many hands does one wizard shake? Careful not to count a handshake twice.';
        data = { kind, n };
        break;
      }
      case 'squares': {
        const n = { 3: 2, 4: 3, 5: pick([4, 4, 5]) }[t];
        ans = 0; const parts = [];
        for (let s = 1; s <= n; s++) { const c = (n - s + 1) ** 2; ans += c; parts.push(`${c} of size ${s}×${s}`); }
        prompt = `How many squares of any size can you find in this ${n} × ${n} grid?`;
        html = gridSVG(n, n, false);
        explain = `Count the squares by size: ${parts.join(', ')}. ${range(1, n).reverse().map(k => k * k).join(' + ')} = ${ans}.`;
        hint = 'Do not forget the bigger squares made from several small ones, and the whole grid itself.';
        data = { kind, n };
        break;
      }
      case 'digits': {
        const m = pick([3, 4]), repeat = m === 3 ? rnd.chance(0.5) : false;
        const digits = shuffle(range(1, 9)).slice(0, m).sort((x, y) => x - y);
        ans = repeat ? m * m : m * (m - 1);
        const list = digits.slice(0, -1).join(', ') + ' and ' + digits[digits.length - 1];
        prompt = `Using only the digits ${list}, how many different 2-digit numbers can you make? You ${repeat ? 'may' : 'may not'} use the same digit twice.`;
        html = '<div class="seq">' + digits.map(d => `<span class="chip">${d}</span>`).join('') + '</div>';
        explain = repeat
          ? `There are ${m} choices for the first digit and ${m} choices for the second: ${m} × ${m} = ${ans}.`
          : `There are ${m} choices for the first digit, then ${m - 1} digits left for the second: ${m} × ${m - 1} = ${ans}.`;
        hint = 'How many choices are there for the tens digit? And then for the ones digit?';
        data = { kind, digits, repeat };
        break;
      }
      case 'paths': {
        const [w, hh] = t === 4 ? pick([[2, 2], [3, 2]]) : pick([[3, 3], [4, 3]]);
        const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
        ans = C(w + hh, hh);
        prompt = 'Bulan the owl flies along the lines from A to B. She only ever moves right or down. How many different paths can she take?';
        html = gridSVG(w, hh, true);
        explain = `Write at each corner how many ways there are to reach it. Every corner on the top edge and the left edge has just 1 way. Every other corner is the sum of the corner above it and the corner to its left. At B you get ${ans}.`;
        hint = 'Start at A and write a number at each corner: how many ways can you get there?';
        data = { kind, w, h: hh };
        break;
      }
      case 'strip': {
        const n = int(4, 6);
        ans = gauss(n);
        prompt = 'How many rectangles can you find in this strip? Squares count as rectangles too.';
        html = gridSVG(n, 1, false);
        explain = `Count by length: ${n} rectangles of length 1, ${n - 1} of length 2, and so on, down to 1 of length ${n}. ${range(1, n).reverse().join(' + ')} = ${ans}.`;
        hint = 'Count the rectangles that are 1 square long, then 2 squares long, and so on.';
        data = { kind, cols: n, rows: 1 };
        break;
      }
      case 'rects': {
        const n = pick([2, 3, 4]);
        const cv = gauss(n);
        ans = 3 * cv;
        prompt = 'How many rectangles of any size are in this grid? Squares count too.';
        html = gridSVG(n, 2, false);
        explain = `Every rectangle uses 2 of the 3 horizontal lines and 2 of the ${n + 1} vertical lines. There are 3 ways to pick the horizontal pair and ${cv} ways to pick the vertical pair, so there are 3 × ${cv} = ${ans} rectangles.`;
        hint = 'A rectangle is fixed by its top and bottom lines and its left and right lines.';
        data = { kind, cols: n, rows: 2 };
        break;
      }
    }
    return { type: 'counting', label: 'Counting', prompt, html, input: 'number', answer: ans, hint, explain, data };
  }

  /* ---------- 9. Odd one out ---------- */
  const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const isSquare = n => Number.isInteger(Math.sqrt(n));
  const isTri = n => { const k = Math.round((Math.sqrt(8 * n + 1) - 1) / 2); return k * (k + 1) / 2 === n; };
  const isCube = n => { const k = Math.round(Math.cbrt(n)); return k * k * k === n; };
  const mult = k => ({ test: n => n % k === 0, pl: [`in the ${k} times table`, `not in the ${k} times table`], one: [`in the ${k} times table`, `not in the ${k} times table`], why: n => `${n} = ${k} × ${n / k}`, hint: 'Think about times tables.' });
  const PROPS = {
    even: { test: n => n % 2 === 0, pl: ['even', 'odd'], one: ['even', 'odd'], hint: 'Try splitting each number into two equal halves.' },
    m3: mult(3), m4: mult(4), m5: mult(5), m7: mult(7), m9: mult(9), m10: mult(10),
    square: { test: isSquare, pl: ['square numbers', 'not square numbers'], one: ['a square number', 'not a square number'], why: n => `${Math.sqrt(n)} × ${Math.sqrt(n)} = ${n}`, hint: 'Can you make any of these by multiplying a number by itself?' },
    prime: { test: isPrime, pl: ['prime', 'not prime'], one: ['prime', 'not prime'], hint: 'Which numbers can only be divided evenly by 1 and themselves?' },
    tri: { test: isTri, pl: ['triangle numbers', 'not triangle numbers'], one: ['a triangle number', 'not a triangle number'], why: n => { const k = Math.round((Math.sqrt(8 * n + 1) - 1) / 2); return `${n} = 1 + 2 + … + ${k}`; }, hint: 'Think of numbers of balls you can stack into a triangle: 1, 3, 6, 10…' },
    cube: { test: isCube, pl: ['cube numbers', 'not cube numbers'], one: ['a cube number', 'not a cube number'], why: n => { const k = Math.round(Math.cbrt(n)); return `${k} × ${k} × ${k} = ${n}`; }, hint: 'Think of 2 × 2 × 2.' }
  };
  P.ODD_PROPS = PROPS;
  const ODD_CFG = {
    1: [{ p: 'even', r: [2, 40], both: true }],
    2: [{ p: 'm5', r: [5, 60] }, { p: 'm10', r: [10, 99] }, { p: 'm3', r: [3, 60] }],
    3: [{ p: 'square', r: [4, 100] }, { p: 'm4', r: [8, 60] }],
    4: [{ p: 'prime', r: [11, 60] }, { p: 'm7', r: [14, 99] }],
    5: [{ p: 'tri', r: [6, 78] }, { p: 'm9', r: [18, 99] }, { p: 'cube', r: [1, 216] }]
  };

  function genOdd(t) {
    const { pick, shuffle } = rnd;
    for (let attempt = 0; attempt < 3000; attempt++) {
      const cfg = pick(ODD_CFG[t]), prop = PROPS[cfg.p];
      const pool = range(cfg.r[0], cfg.r[1]);
      const has = rnd.chance(cfg.both ? 0.5 : 1);
      const major = pool.filter(n => prop.test(n) === has);
      let minor = pool.filter(n => prop.test(n) !== has);
      if (cfg.p === 'prime') minor = minor.filter(n => n % 2 === 1 && n % 5 !== 0);
      if (major.length < 3 || !minor.length) continue;
      const three = shuffle(major).slice(0, 3), odd = pick(minor);
      const nums = shuffle(three.concat(odd));
      const clash = Object.keys(PROPS).some(key => {
        if (key === cfg.p) return false;
        const flags = nums.map(PROPS[key].test), cnt = flags.filter(Boolean).length;
        if (cnt !== 1 && cnt !== 3) return false;
        return nums[cnt === 1 ? flags.indexOf(true) : flags.indexOf(false)] !== odd;
      });
      if (clash) continue;
      const others = nums.filter(n => n !== odd);
      const ix = has ? 0 : 1;
      let explain = `${others.join(', ')} are all ${prop.pl[ix]}, but ${odd} is ${prop.one[1 - ix]}.`;
      const facts = [];
      if (prop.why) nums.forEach(n => { if (prop.test(n)) facts.push(prop.why(n)); });
      if (cfg.p === 'prime') { let f = 2; while (odd % f) f++; facts.push(`${odd} = ${f} × ${odd / f}`); }
      if (facts.length) explain += ' ' + facts.join(', ') + '.';
      return {
        type: 'odd', label: 'Odd one out',
        prompt: 'Three of these numbers belong together. Which one is the odd one out?',
        html: '',
        input: 'choice', choiceStyle: 'numbers',
        choices: nums.map((n, i) => ({ id: i, label: String(n), aria: String(n) })),
        answer: nums.indexOf(odd),
        hint: prop.hint, explain,
        data: { prop: cfg.p, nums, odd, has }
      };
    }
    throw new Error('odd-one-out generation failed');
  }

  /* ---------- 10. Picture patterns ---------- */
  const SHAPES = ['circle', 'triangle', 'square', 'star', 'diamond'];
  const TCOLORS = ['yellow', 'pink', 'blue', 'mint', 'chalk'];
  const COLOR_NAME = { yellow: 'yellow', pink: 'pink', blue: 'blue', mint: 'green', chalk: 'white' };
  const SHAPE_SVG = {
    circle: '<circle cx="20" cy="20" r="13"/>',
    triangle: '<polygon points="20,6 34,32 6,32"/>',
    square: '<rect x="8" y="8" width="24" height="24" rx="2"/>',
    star: '<polygon points="20,4 23.8,14.7 35.2,15.1 26.2,22 29.4,32.9 20,26.5 10.6,32.9 13.8,22 4.8,15.1 16.2,14.7"/>',
    diamond: '<polygon points="20,4 34,20 20,36 6,20"/>',
    arrow: '<polygon points="20,4 33,19 24.5,19 24.5,36 15.5,36 15.5,19 7,19"/>'
  };
  const DIRS = ['up', 'up-right', 'right', 'down-right', 'down', 'down-left', 'left', 'up-left'];
  const norm = r => ((r % 360) + 360) % 360;
  const tileKey = tl => tl.s + '|' + tl.c + '|' + (tl.s === 'arrow' ? norm(tl.r) : 0);
  const tileName = tl => `${COLOR_NAME[tl.c]} ${tl.s}` + (tl.s === 'arrow' ? ` pointing ${DIRS[norm(tl.r) / 45]}` : '');
  function tileSVG(tl) {
    return `<svg class="tile" viewBox="0 0 40 40" role="img" aria-label="${tileName(tl)}"><g class="t-${tl.c}" transform="rotate(${norm(tl.r)} 20 20)">${SHAPE_SVG[tl.s]}</g></svg>`;
  }
  P.tileKey = tileKey;

  const PIC_KINDS = {
    1: ['shapeAB', 'colorAB'],
    2: ['shapeABC', 'shapeAAB', 'colorABC'],
    3: ['rot90', 'shapeABC_colorAB'],
    4: ['rot90_color3', 'shapeABC_colorAB', 'rotBack90_colorAB'],
    5: ['rot45_color3', 'rot135_colorAB', 'rotBack45_colorAB']
  };

  function genPicture(t) {
    const { pick, shuffle } = rnd;
    const kind = pick(PIC_KINDS[t]);
    const [A, B, C] = shuffle(SHAPES), [X, Y, Z] = shuffle(TCOLORS);
    const r0 = pick([0, 90, 180, 270]);
    const rules = {
      shapeAB: i => ({ s: [A, B][i % 2], c: X, r: 0 }),
      colorAB: i => ({ s: A, c: [X, Y][i % 2], r: 0 }),
      shapeABC: i => ({ s: [A, B, C][i % 3], c: X, r: 0 }),
      shapeAAB: i => ({ s: [A, A, B][i % 3], c: X, r: 0 }),
      colorABC: i => ({ s: A, c: [X, Y, Z][i % 3], r: 0 }),
      rot90: i => ({ s: 'arrow', c: X, r: r0 + 90 * i }),
      shapeABC_colorAB: i => ({ s: [A, B, C][i % 3], c: [X, Y][i % 2], r: 0 }),
      rot90_color3: i => ({ s: 'arrow', c: [X, Y, Z][i % 3], r: r0 + 90 * i }),
      rotBack90_colorAB: i => ({ s: 'arrow', c: [X, Y][i % 2], r: r0 - 90 * i }),
      rot45_color3: i => ({ s: 'arrow', c: [X, Y, Z][i % 3], r: r0 + 45 * i }),
      rot135_colorAB: i => ({ s: 'arrow', c: [X, Y][i % 2], r: r0 + 135 * i }),
      rotBack45_colorAB: i => ({ s: 'arrow', c: [X, Y][i % 2], r: r0 - 45 * i })
    };
    const rule = rules[kind];
    const seq = [0, 1, 2, 3, 4].map(rule);
    const correct = rule(5);
    const used = new Set([tileKey(correct)]);
    const distract = [];
    const offer = tl => { const k = tileKey(tl); if (!used.has(k) && distract.length < 3) { used.add(k); distract.push(tl); } };
    shuffle([rule(4), rule(6), rule(3)]).forEach(offer);
    const extras = [];
    TCOLORS.forEach(c => extras.push(Object.assign({}, correct, { c })));
    if (correct.s === 'arrow') [45, 90, 180, 270].forEach(d => extras.push(Object.assign({}, correct, { r: correct.r + d })));
    else SHAPES.forEach(s => extras.push(Object.assign({}, correct, { s })));
    shuffle(extras).forEach(offer);
    const options = shuffle([correct].concat(distract));

    const turning = correct.s === 'arrow';
    const step = turning ? norm(rule(1).r - rule(0).r) : 0;
    const turnText = turning ? (step === 90 ? 'a quarter turn clockwise' : step === 270 ? 'a quarter turn anticlockwise' : step === 45 ? 'an eighth of a turn clockwise' : step === 315 ? 'an eighth of a turn anticlockwise' : 'three eighths of a turn clockwise') : '';
    const cycleC = new Set(seq.map(x => x.c)).size, cycleS = new Set(seq.map(x => x.s)).size;
    const parts = [];
    if (turning) parts.push(`the arrow turns ${turnText} each time`);
    if (cycleS > 1) parts.push(`the shapes repeat in a cycle of ${kind === 'shapeAAB' ? 3 : cycleS}`);
    if (cycleC > 1) parts.push(`the colours repeat in a cycle of ${cycleC}`);
    const sentence = parts.join(', and ');

    return {
      type: 'picture', label: 'Picture pattern',
      prompt: 'Which picture comes next?',
      html: '<div class="tiles">' + seq.map(tileSVG).join('') + '<span class="tile tile-q">?</span></div>',
      input: 'choice', choiceStyle: 'tiles',
      choices: options.map((o, i) => ({ id: i, svg: tileSVG(o), aria: tileName(o) })),
      answer: options.indexOf(correct),
      hint: turning ? 'Watch which way the arrow points each time. Then check the colours.' : 'Look for the part of the pattern that repeats.',
      explain: sentence.charAt(0).toUpperCase() + sentence.slice(1) + `. So next comes the ${tileName(correct)}.`,
      data: { kind, seq, correct, options }
    };
  }

  /* ---------- Registry ---------- */
  P.gen.sums = genSums;
  P.gen.counting = genCounting;
  P.gen.odd = genOdd;
  P.gen.picture = genPicture;
  P.TYPES = Object.keys(P.gen);

  P.make = function (type, tier, ctx) {
    const t = Math.max(1, Math.min(5, tier | 0));
    const p = P.gen[type](t, ctx || {});
    p.tier = t;
    return p;
  };
  P.check = function (p, value) {
    if (p.input === 'number') return value !== '' && value !== null && value !== undefined && Number(value) === p.answer;
    return value === p.answer;
  };
  P.answerText = function (p) {
    if (p.input === 'number') return String(p.answer);
    const c = p.choices.find(x => x.id === p.answer);
    return c ? (p.choiceStyle === 'tiles' ? 'the ' + c.aria : c.aria) : '';
  };
})(typeof window !== 'undefined' ? window : globalThis);
