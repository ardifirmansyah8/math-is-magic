/* Math Is Magic: puzzle engine, part 1 (helpers, number patterns, magic squares) */
(function (root) {
  'use strict';
  const P = root.Puzzles = root.Puzzles || {};

  const rnd = {
    int(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },
    chance(p) { return Math.random() < p; }
  };
  P.rnd = rnd;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  P.esc = esc;

  // Friendly cast for story puzzles (Indonesian names: star, moon, rainbow, dew)
  P.NPCS = [
    { name: 'Wizard Bintang', he: 'He', his: 'his' },
    { name: 'Bulan the owl', he: 'She', his: 'her' },
    { name: 'Professor Pelangi', he: 'She', his: 'her' },
    { name: 'Embun the fox', he: 'He', his: 'his' }
  ];

  // HTML helpers. They return strings so the engine also runs in Node tests.
  const h = {
    seq(items) {
      return '<div class="seq">' + items.map(v =>
        v === '?' ? '<span class="chip chip-q">?</span>' : '<span class="chip">' + esc(v) + '</span>'
      ).join('') + '</div>';
    },
    expr(text) { return '<div class="expr">' + text + '</div>'; },
    facts(pairs) {
      return '<div class="facts">' + pairs.map(([n, label]) =>
        '<div class="fact"><b>' + esc(n) + '</b><span>' + esc(label) + '</span></div>'
      ).join('') + '</div>';
    },
    note(text) { return '<p class="pz-note">' + text + '</p>'; }
  };
  P.h = h;

  /* ---------- 1. Number patterns ---------- */
  const PATTERN_KINDS = {
    1: ['add'],
    2: ['sub', 'double'],
    3: ['growing', 'interleave'],
    4: ['fib', 'squares', 'triangle', 'triple'],
    5: ['squarePlus', 'doublePlus', 'doublingGaps', 'cubes']
  };

  function genPattern(t) {
    const { int, pick } = rnd;
    const kind = pick(PATTERN_KINDS[t]);
    let seq, ans, rule, hint = 'Look at how each number changes from the one before.';
    const last = () => seq[seq.length - 1];
    switch (kind) {
      case 'add': {
        const a = int(1, 20), d = int(2, 9);
        seq = [0, 1, 2, 3].map(i => a + i * d); ans = a + 4 * d;
        rule = `Each number is ${d} more than the one before, so the next is ${last()} + ${d} = ${ans}.`;
        break;
      }
      case 'sub': {
        const d = int(3, 9), a = int(5 * d, 99);
        seq = [0, 1, 2, 3].map(i => a - i * d); ans = a - 4 * d;
        rule = `Each number is ${d} less than the one before, so the next is ${last()} − ${d} = ${ans}.`;
        break;
      }
      case 'double': {
        const a = int(1, 6);
        seq = [0, 1, 2, 3].map(i => a * 2 ** i); ans = a * 16;
        rule = `Each number is double the one before, so the next is ${last()} × 2 = ${ans}.`;
        hint = 'Try multiplying instead of adding.';
        break;
      }
      case 'growing': {
        const a = int(1, 12), s = int(1, 3);
        seq = [a]; let gap = s;
        for (let i = 0; i < 4; i++) { seq.push(last() + gap); gap++; }
        ans = last() + gap;
        rule = `The gaps grow by 1 each time: +${s}, +${s + 1}, +${s + 2}, +${s + 3}. The next gap is +${s + 4}, so ${last()} + ${s + 4} = ${ans}.`;
        hint = 'Write down the gaps between neighbours. What do you notice about the gaps?';
        break;
      }
      case 'interleave': {
        const a = int(1, 9), d = int(2, 5), b = int(30, 50), e = int(2, 5);
        seq = [a, b, a + d, b - e, a + 2 * d, b - 2 * e]; ans = a + 3 * d;
        rule = `Two patterns take turns. The 1st, 3rd and 5th numbers go ${a}, ${a + d}, ${a + 2 * d}, adding ${d} each time. The others go down by ${e}. The 7th number belongs to the first pattern: ${a + 2 * d} + ${d} = ${ans}.`;
        hint = 'Read every other number. Two patterns are mixed together.';
        break;
      }
      case 'fib': {
        const a = int(1, 5), b = int(a, a + 4);
        seq = [a, b];
        while (seq.length < 6) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
        ans = seq[4] + seq[5];
        rule = `Each number is the sum of the two before it, so the next is ${seq[4]} + ${seq[5]} = ${ans}.`;
        hint = 'Try adding two neighbours together.';
        break;
      }
      case 'squares': {
        const k = int(1, 6);
        seq = [0, 1, 2, 3, 4].map(i => (k + i) ** 2); ans = (k + 5) ** 2;
        rule = `These are square numbers: ${k} × ${k}, ${k + 1} × ${k + 1}, and so on. The next is ${k + 5} × ${k + 5} = ${ans}.`;
        hint = 'Is something special about 4, 9, 16 and 25?';
        break;
      }
      case 'triangle': {
        const k = int(1, 5), T = n => n * (n + 1) / 2;
        seq = [0, 1, 2, 3, 4].map(i => T(k + i)); ans = T(k + 5);
        rule = `The gaps are +${k + 1}, +${k + 2}, +${k + 3}, +${k + 4}, so the next gap is +${k + 5}: ${last()} + ${k + 5} = ${ans}. These are triangle numbers.`;
        hint = 'Look at the gaps between neighbours.';
        break;
      }
      case 'triple': {
        const a = int(1, 3);
        seq = [0, 1, 2, 3].map(i => a * 3 ** i); ans = a * 81;
        rule = `Each number is 3 times the one before, so the next is ${last()} × 3 = ${ans}.`;
        hint = 'Try multiplying instead of adding.';
        break;
      }
      case 'squarePlus': {
        const c = int(1, 6), k = int(1, 3);
        seq = [0, 1, 2, 3, 4].map(i => (k + i) ** 2 + c); ans = (k + 5) ** 2 + c;
        rule = `Each number is a square number plus ${c}: ${k} × ${k} + ${c}, ${k + 1} × ${k + 1} + ${c}, and so on. The next is ${k + 5} × ${k + 5} + ${c} = ${ans}.`;
        hint = 'Take the same amount away from every number. Do you see square numbers?';
        break;
      }
      case 'doublePlus': {
        const c = pick([1, -1]), a = int(2, 5);
        seq = [a];
        while (seq.length < 5) seq.push(last() * 2 + c);
        ans = last() * 2 + c;
        rule = `Double the number, then ${c > 0 ? 'add' : 'take away'} 1. So the next is ${last()} × 2 ${c > 0 ? '+' : '−'} 1 = ${ans}.`;
        hint = 'Compare each number with double the one before it.';
        break;
      }
      case 'doublingGaps': {
        const a = int(1, 20);
        seq = [a, a + 1, a + 3, a + 7, a + 15]; ans = a + 31;
        rule = `The gaps double each time: +1, +2, +4, +8. The next gap is +16, so ${last()} + 16 = ${ans}.`;
        hint = 'Write the gaps between neighbours. How do the gaps change?';
        break;
      }
      case 'cubes': {
        const k = int(1, 3);
        seq = [0, 1, 2, 3].map(i => (k + i) ** 3); ans = (k + 4) ** 3;
        rule = `These are cube numbers (a number times itself, times itself again). The next is ${k + 4} × ${k + 4} × ${k + 4} = ${ans}.`;
        hint = 'Think about 2 × 2 × 2 and 3 × 3 × 3.';
        break;
      }
    }
    return {
      type: 'pattern', label: 'Number pattern',
      prompt: 'What number comes next?',
      html: h.seq(seq.concat('?')),
      input: 'number', answer: ans, hint, explain: rule,
      data: { kind, seq, ans }
    };
  }

  /* ---------- 2. Magic squares ---------- */
  const LO_SHU = [2, 7, 6, 9, 5, 1, 4, 3, 8];
  const LINES = [
    { name: 'top row', cells: [0, 1, 2] }, { name: 'middle row', cells: [3, 4, 5] }, { name: 'bottom row', cells: [6, 7, 8] },
    { name: 'left column', cells: [0, 3, 6] }, { name: 'middle column', cells: [1, 4, 7] }, { name: 'right column', cells: [2, 5, 8] },
    { name: 'diagonal from the top left', cells: [0, 4, 8] }, { name: 'diagonal from the top right', cells: [2, 4, 6] }
  ];
  P.MAGIC_LINES = LINES;

  function symmetries(g) {
    const rot = a => [a[6], a[3], a[0], a[7], a[4], a[1], a[8], a[5], a[2]];
    const flip = a => [a[2], a[1], a[0], a[5], a[4], a[3], a[8], a[7], a[6]];
    const out = []; let cur = g;
    for (let i = 0; i < 4; i++) { out.push(cur, flip(cur)); cur = rot(cur); }
    return out;
  }

  // Fill the grid using only "a line with one gap" steps. Records the round in which each cell is found.
  function magicRounds(vals, hidden, showSum) {
    const known = vals.map((v, i) => hidden.includes(i) ? null : v);
    let sumLine = null;
    if (!showSum) {
      sumLine = LINES.find(L => L.cells.every(c => known[c] !== null));
      if (!sumLine) return null;
    }
    const S = vals[0] + vals[1] + vals[2];
    const round = {}, via = {};
    for (let r = 1; r < 10; r++) {
      const found = [];
      for (const L of LINES) {
        const unk = L.cells.filter(c => known[c] === null);
        if (unk.length === 1 && !found.some(f => f.cell === unk[0])) found.push({ cell: unk[0], line: L });
      }
      if (!found.length) break;
      for (const f of found) { known[f.cell] = vals[f.cell]; round[f.cell] = r; via[f.cell] = f.line; }
    }
    return { S, sumLine, round, via };
  }

  const MAGIC_CFG = {
    1: { m: [1, 1], k: [0, 0], hide: 1, showSum: true, chain: 0 },
    2: { m: [1, 1], k: [1, 9], hide: 2, showSum: true, chain: 0 },
    3: { m: [1, 2], k: [0, 10], hide: 3, showSum: false, chain: 0 },
    4: { m: [2, 3], k: [0, 12], hide: 4, showSum: false, chain: 2 },
    5: { m: [2, 5], k: [0, 20], hide: 5, showSum: false, chain: 3 }
  };

  function genMagic(t) {
    const { int, pick, shuffle } = rnd;
    const cfg = MAGIC_CFG[t];
    for (let attempt = 0; attempt < 2000; attempt++) {
      const chain = attempt > 1500 ? 0 : cfg.chain;
      const m = int(cfg.m[0], cfg.m[1]), k = int(cfg.k[0], cfg.k[1]);
      const vals = pick(symmetries(LO_SHU)).map(v => v * m + k);
      const hidden = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, cfg.hide);
      const res = magicRounds(vals, hidden, cfg.showSum);
      if (!res || hidden.some(c => !(c in res.round))) continue;
      const maxR = Math.max(...hidden.map(c => res.round[c]));
      if (maxR < chain) continue;
      const target = pick(hidden.filter(c => res.round[c] === maxR));

      // Steps needed to reach the target, in a sensible order
      const order = [];
      const need = c => {
        if (order.includes(c)) return;
        res.via[c].cells.forEach(o => { if (o !== c && hidden.includes(o)) need(o); });
        order.push(c);
      };
      need(target);
      const lines = [];
      if (cfg.showSum) lines.push(`The magic total is ${res.S}.`);
      else {
        const L = res.sumLine;
        lines.push(`The ${L.name} is complete: ${L.cells.map(c => vals[c]).join(' + ')} = ${res.S}. So every line adds up to ${res.S}.`);
      }
      order.forEach(c => {
        const others = res.via[c].cells.filter(o => o !== c).map(o => vals[o]);
        lines.push(`In the ${res.via[c].name}: ${res.S} − ${others[0]} − ${others[1]} = ${vals[c]}.`);
      });
      lines.push(`So the ? box is ${vals[target]}.`);

      const grid = '<div class="magic">' + vals.map((v, i) =>
        i === target ? '<span class="cell cell-q">?</span>'
          : hidden.includes(i) ? '<span class="cell cell-empty"></span>'
            : '<span class="cell">' + v + '</span>'
      ).join('') + '</div>';

      return {
        type: 'magic', label: 'Magic square',
        prompt: 'Every row, column and diagonal adds up to the same magic total. What number goes in the ? box?',
        html: grid + (cfg.showSum ? h.note('Magic total: <b>' + res.S + '</b>') : ''),
        input: 'number', answer: vals[target],
        hint: cfg.showSum
          ? 'Find a line through the ? box where the other two numbers are already filled in.'
          : (t >= 4 ? 'Add up a full line to find the magic total. Then fill the empty boxes one at a time.' : 'Add up a full line first to find the magic total.'),
        explain: lines.join(' '),
        data: { vals, hidden, target, showSum: cfg.showSum }
      };
    }
    throw new Error('magic square generation failed');
  }

  P.gen = P.gen || {};
  P.gen.pattern = genPattern;
  P.gen.magic = genMagic;
})(typeof window !== 'undefined' ? window : globalThis);
