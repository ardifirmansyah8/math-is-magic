/* Math Is Magic: puzzle engine, part 2 (potion algebra, heads and legs, calendar and clock, working backwards) */
(function (root) {
  'use strict';
  const P = root.Puzzles;
  const { rnd, h, esc } = P;

  /* ---------- 3. Potion algebra ---------- */
  const ING = {
    mushroom: { one: 'mushroom', many: 'mushrooms' },
    crystal: { one: 'crystal', many: 'crystals' },
    star: { one: 'star', many: 'stars' },
    potion: { one: 'potion', many: 'potions' }
  };
  const icon = s => `<svg class="ico" viewBox="0 0 40 40" role="img" aria-label="${s}"><use href="#i-${s}"/></svg>`;
  P.icon = icon;
  const an = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
  const cap = w => w.charAt(0).toUpperCase() + w.slice(1);
  const rep = (s, n) => { const out = []; for (let i = 0; i < n; i++) { if (i) out.push('+'); out.push(s); } return out; };
  const OPS = { '+': '+', '-': '−', '*': '×' };

  function eqHTML(eq) {
    return '<div class="eq">' + eq.terms.map(x => OPS[x] ? `<span class="op">${OPS[x]}</span>` : icon(x)).join('') +
      `<span class="op">=</span><span class="num">${eq.rhs}</span></div>`;
  }

  function genPotion(t) {
    const { int, pick, shuffle } = rnd;
    const [A, B, C] = shuffle(Object.keys(ING));
    const one = s => ING[s].one, many = s => ING[s].many;
    let eqs, ask, vals, explain, hint;
    if (t === 1) {
      const a = int(2, 9), n = pick([2, 3]);
      eqs = [{ terms: rep(A, n), rhs: a * n }];
      ask = A; vals = { [A]: a };
      explain = `${n === 2 ? 'Two' : 'Three'} ${many(A)} make ${a * n}, so one ${one(A)} is ${a * n} ÷ ${n} = ${a}.`;
      hint = `All the ${many(A)} are worth the same. Share ${a * n} equally between them.`;
    } else if (t === 2) {
      const a = int(2, 9), b = int(1, 12);
      eqs = [{ terms: rep(A, 2), rhs: 2 * a }, { terms: [A, '+', B], rhs: a + b }];
      ask = B; vals = { [A]: a, [B]: b };
      explain = `Two ${many(A)} make ${2 * a}, so one ${one(A)} is ${a}. Then ${a} + ${one(B)} = ${a + b}, so one ${one(B)} is ${a + b} − ${a} = ${b}.`;
      hint = 'Start with the line that has only one kind of ingredient.';
    } else if (t === 3) {
      if (rnd.chance(0.5)) {
        const a = int(2, 12), b = int(1, 12);
        eqs = [{ terms: [A, '+', A, '+', B], rhs: 2 * a + b }, { terms: [A, '+', B], rhs: a + b }];
        ask = pick([A, B]); vals = { [A]: a, [B]: b };
        explain = `The first line has one extra ${one(A)} and is ${2 * a + b} − ${a + b} = ${a} bigger, so one ${one(A)} is ${a}.` +
          (ask === B ? ` Then one ${one(B)} is ${a + b} − ${a} = ${b}.` : '');
        hint = 'Compare the two lines. What is the difference between them?';
      } else {
        const a = int(5, 15), b = int(1, a - 1);
        eqs = [{ terms: [A, '+', B], rhs: a + b }, { terms: [A, '-', B], rhs: a - b }];
        ask = pick([A, B]); vals = { [A]: a, [B]: b };
        explain = `Add the two lines together. The ${many(B)} cancel out, so two ${many(A)} make ${a + b} + ${a - b} = ${2 * a}, and one ${one(A)} is ${a}.` +
          (ask === B ? ` Then one ${one(B)} is ${a + b} − ${a} = ${b}.` : '');
        hint = 'What happens if you add the two lines together?';
      }
    } else if (t === 4) {
      const a = int(1, 15), b = int(1, 15), c = int(1, 15);
      eqs = [{ terms: [A, '+', B], rhs: a + b }, { terms: [B, '+', C], rhs: b + c }, { terms: [A, '+', C], rhs: a + c }];
      ask = pick([A, B, C]); vals = { [A]: a, [B]: b, [C]: c };
      const T = a + b + c, total = 2 * T;
      const other = { [A]: [B, C, b + c], [B]: [A, C, a + c], [C]: [A, B, a + b] }[ask];
      explain = `Add all three lines. Each ingredient appears twice, so double the full set is ${a + b} + ${b + c} + ${a + c} = ${total}. ` +
        `One of each makes ${total} ÷ 2 = ${T}. Take away ${one(other[0])} + ${one(other[1])} = ${other[2]}: ${T} − ${other[2]} = ${vals[ask]}.`;
      hint = 'Try adding all three lines together. How many of each ingredient do you get?';
    } else {
      if (rnd.chance(0.5)) {
        const a = int(2, 9), b = int(2, 9), c = int(2, 9);
        eqs = [{ terms: [A, '*', A], rhs: a * a }, { terms: [A, '+', B], rhs: a + b }, { terms: [B, '*', C], rhs: b * c }];
        ask = C; vals = { [A]: a, [B]: b, [C]: c };
        explain = `${a} × ${a} = ${a * a}, so one ${one(A)} is ${a}. Then one ${one(B)} is ${a + b} − ${a} = ${b}. Finally, ${b} times ${an(one(C))} makes ${b * c}, so one ${one(C)} is ${b * c} ÷ ${b} = ${c}.`;
        hint = 'Which number times itself makes the first answer?';
      } else {
        const a = int(2, 9), b = int(2, 9), c = b + int(1, 9);
        eqs = [{ terms: rep(A, 3), rhs: 3 * a }, { terms: [A, '*', B], rhs: a * b }, { terms: [C, '-', B], rhs: c - b }];
        ask = C; vals = { [A]: a, [B]: b, [C]: c };
        explain = `Three ${many(A)} make ${3 * a}, so one ${one(A)} is ${a}. Then ${a} times ${an(one(B))} makes ${a * b}, so one ${one(B)} is ${b}. Finally, ${an(one(C))} minus ${b} leaves ${c - b}, so one ${one(C)} is ${c - b} + ${b} = ${c}.`;
        hint = 'Solve the lines from top to bottom. Each one gives you a new ingredient.';
      }
    }
    return {
      type: 'potion', label: 'Potion puzzle',
      prompt: `Each ingredient has a secret number. What is one ${one(ask)} worth?`,
      html: '<div class="eqs">' + eqs.map(eqHTML).join('') + `<div class="eq eq-ask">${icon(ask)}<span class="op">=</span><span class="num num-q">?</span></div></div>`,
      input: 'number', answer: vals[ask], hint, explain,
      data: { eqs, ask, vals }
    };
  }

  /* ---------- 4. Heads and legs ---------- */
  const HERDS = {
    owls: { small: ['owl', 'owls', 2], big: ['unicorn', 'unicorns', 4], unit: 'legs', place: 'In the magic stable', animals: true },
    pixies: { small: ['pixie', 'pixies', 2], big: ['griffin', 'griffins', 4], unit: 'legs', place: 'At the Moon Festival', animals: true },
    stools: { small: ['stool', 'stools', 3], big: ['chair', 'chairs', 4], unit: 'legs', place: "In the wizard's kitchen", animals: false },
    bikes: { small: ['broom-bike', 'broom-bikes', 2], big: ['tricycle', 'tricycles', 3], unit: 'wheels', place: 'At the sky race', animals: false },
    bugs: { small: ['beetle', 'beetles', 6], big: ['spider', 'spiders', 8], unit: 'legs', place: 'In the crystal cave', animals: true }
  };
  const LEGS_CFG = {
    1: { herds: ['owls'], H: [3, 6], askBig: true },
    2: { herds: ['owls', 'pixies'], H: [6, 12] },
    3: { herds: ['owls', 'stools', 'bikes'], H: [10, 20] },
    4: { herds: ['bugs', 'stools', 'bikes'], H: [12, 30] },
    5: { herds: ['owls', 'pixies', 'bugs'], H: [20, 40] }
  };

  function genLegs(t) {
    const { int, pick } = rnd;
    const cfg = LEGS_CFG[t];
    const herd = HERDS[pick(cfg.herds)];
    const [s1, sMany, L1] = herd.small, [b1, bMany, L2] = herd.big;
    const unit = herd.unit;
    const H = int(cfg.H[0], cfg.H[1]);
    const nBig = int(1, H - 1), nSmall = H - nBig;
    // Level 5 sometimes adds a known group of spiders to the scene
    const spiders = (t === 5 && herd.animals && herd !== HERDS.bugs && rnd.chance(0.5)) ? int(2, 5) : 0;
    const legs = nSmall * L1 + nBig * L2 + spiders * 8;
    const heads = H + spiders;
    const askBig = cfg.askBig || rnd.chance(0.5);
    const askMany = askBig ? bMany : sMany;

    let text;
    if (herd.animals) {
      text = `${herd.place} there are ${sMany} (${L1} legs each) and ${bMany} (${L2} legs each)` +
        (spiders ? `, plus ${spiders} spiders (8 legs each)` : '') +
        `. Altogether there are ${heads} heads and ${legs} legs. How many ${askMany} are there?`;
    } else {
      text = `${herd.place} there are ${H} ${sMany} and ${bMany} altogether, with ${legs} ${unit} in total. ` +
        `${cap(an(s1))} has ${L1} ${unit} and ${an(b1)} has ${L2}. How many ${askMany} are there?`;
    }
    const extra = (legs - spiders * 8) - H * L1, diff = L2 - L1;
    let explain = '';
    if (spiders) explain += `First take away the spiders: ${heads} − ${spiders} = ${H} heads and ${legs} − ${spiders * 8} = ${legs - spiders * 8} legs are left. `;
    explain += `If all ${H} were ${sMany}, there would be ${H} × ${L1} = ${H * L1} ${unit}. There are ${legs - spiders * 8}, so ${extra} ${unit} are extra. ` +
      `Each ${b1} has ${diff} more than ${an(s1)}, so there are ${extra} ÷ ${diff} = ${nBig} ${bMany}` +
      (askBig ? '.' : ` and ${H} − ${nBig} = ${nSmall} ${sMany}.`);

    return {
      type: 'legs', label: 'Heads and legs',
      prompt: text,
      html: h.facts(herd.animals ? [[heads, 'heads'], [legs, 'legs']] : [[H, 'things'], [legs, unit]]),
      input: 'number', answer: askBig ? nBig : nSmall,
      hint: `Pretend they are all ${sMany} first. How many ${unit} would that be?`,
      explain,
      data: { H, L1, L2, legs, spiders, nBig, nSmall, askBig }
    };
  }

  /* ---------- 5. Calendar and clock ---------- */
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  P.DAYS = DAYS;
  const ord = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'));
  const mod = (a, m) => ((a % m) + m) % m;

  function weekHTML(start, label) {
    return '<div class="week">' + DAYS.map((d, i) =>
      `<span class="wday${i === start ? ' wday-on' : ''}">${d.slice(0, 2)}</span>`).join('') + '</div>' +
      h.note(label);
  }

  function clockSVG(hour) {
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const x1 = 50 + Math.sin(a) * 38, y1 = 50 - Math.cos(a) * 38, x2 = 50 + Math.sin(a) * 44, y2 = 50 - Math.cos(a) * 44;
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }
    const a = (hour % 12) * Math.PI / 6;
    const hx = 50 + Math.sin(a) * 24, hy = 50 - Math.cos(a) * 24;
    return `<svg class="clock" viewBox="0 0 100 100" role="img" aria-label="${hour} o'clock">` +
      `<circle cx="50" cy="50" r="46" class="clock-face"/><g class="clock-ticks">${ticks}</g>` +
      `<line x1="50" y1="50" x2="50" y2="14" class="clock-min"/>` +
      `<line x1="50" y1="50" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" class="clock-hour"/>` +
      `<circle cx="50" cy="50" r="3.5" class="clock-pin"/></svg>`;
  }

  function genClock(t) {
    const { int } = rnd;
    const s = int(1, 12);
    const n = { 2: int(3, 11), 3: int(13, 30), 4: int(25, 60), 5: int(61, 200) }[t];
    const back = t >= 4 && rnd.chance(0.4);
    let ans = mod(back ? s - n : s + n, 12); if (ans === 0) ans = 12;
    const q = Math.floor(n / 12), r = n % 12;
    const explain = (n >= 12 ? `Every 12 hours the hands come back to the same place. ${n} = ${q} × 12 + ${r}, so ` : 'Count ') +
      `${n >= 12 ? 'move ' : ''}${r} hour${r === 1 ? '' : 's'} ${back ? 'back' : 'on'} from ${s} o'clock: the clock shows ${ans} o'clock.`;
    return {
      type: 'calendar', label: 'Clock',
      prompt: `The clock shows ${s} o'clock. ${back ? `What did it show ${n} hours ago?` : `What will it show ${n} hours from now?`} Type the hour.`,
      html: clockSVG(s),
      input: 'number', answer: ans,
      hint: n >= 12 ? 'After 12 hours the clock looks exactly the same. Take away 12s first.' : 'Count the hours around the clock face.',
      explain,
      data: { kind: 'clock', s, n, back, ans }
    };
  }

  function genCalendar(t) {
    const { int, pick } = rnd;
    if (t >= 2 && rnd.chance(0.35)) return genClock(t);
    const start = int(0, 6);
    let mode = 'forward', n, ans, prompt, explain, label = `Today is ${DAYS[start]}.`;
    if (t === 3 && rnd.chance(0.4)) mode = 'ago';
    if (t === 4) mode = pick(['month', 'forward']);
    if (t === 5) mode = pick(['forward', 'ago', 'year']);
    n = { 1: int(2, 6), 2: int(8, 20), 3: mode === 'ago' ? int(8, 30) : int(25, 100), 4: int(100, 365), 5: mode === 'ago' ? int(50, 400) : int(400, 1000) }[t];

    if (mode === 'month') {
      const d = int(10, 31);
      ans = mod(start + d - 1, 7);
      const base = [1, 8, 15, 22, 29].filter(x => x <= d).pop(), r = d - base;
      prompt = `The 1st of the month is a ${DAYS[start]}. What day of the week is the ${ord(d)}?`;
      label = `The 1st is a ${DAYS[start]}.`;
      explain = `Every 7 days it is ${DAYS[start]} again, so the 1st, 8th, 15th, 22nd and 29th are all ${DAYS[start]}s. ` +
        (r ? `The ${ord(d)} is ${r} day${r === 1 ? '' : 's'} after the ${ord(base)}, so it is a ${DAYS[ans]}.` : `So the ${ord(d)} is a ${DAYS[ans]}.`);
      return dayPuzzle(prompt, weekHTML(start, label), ans, 'Which dates fall on the same day as the 1st?', explain, { mode, start, d, ans });
    }
    if (mode === 'year') {
      n = 365;
      ans = mod(start + 1, 7);
      prompt = `Today is ${DAYS[start]}. In a year that is not a leap year, what day will it be exactly 365 days from now?`;
      explain = `365 = 52 × 7 + 1. The 52 full weeks bring you back to ${DAYS[start]}, and 1 more day makes it ${DAYS[ans]}.`;
      return dayPuzzle(prompt, weekHTML(start, label), ans, 'How many full weeks fit into 365 days? What is left over?', explain, { mode: 'forward', start, n, ans });
    }
    const q = Math.floor(n / 7), r = n % 7;
    if (mode === 'ago') {
      ans = mod(start - n, 7);
      prompt = `Today is ${DAYS[start]}. What day was it ${n} days ago?`;
      explain = (n >= 7 ? `Every 7 days it is ${DAYS[start]} again. ${n} = ${q} × 7 + ${r}, so count ` : 'Count ') +
        (r ? `${r} day${r === 1 ? '' : 's'} back from ${DAYS[start]}: ${DAYS[ans]}.` : `0 days back: it was a ${DAYS[ans]}.`);
    } else {
      ans = mod(start + n, 7);
      prompt = `Today is ${DAYS[start]}. What day will it be in ${n} days?`;
      explain = (n >= 7 ? `Every 7 days it is ${DAYS[start]} again. ${n} = ${q} × 7 + ${r}, so count ` : 'Count ') +
        (r ? `${r} day${r === 1 ? '' : 's'} on from ${DAYS[start]}: ${DAYS[ans]}.` : `0 days on: it will be ${DAYS[ans]} again.`);
    }
    return dayPuzzle(prompt, weekHTML(start, label), ans,
      n >= 7 ? 'Every 7 days the week starts over. Take away full weeks first.' : 'Count the days one at a time.',
      explain, { mode, start, n, ans });
  }

  function dayPuzzle(prompt, html, ans, hint, explain, data) {
    return {
      type: 'calendar', label: 'Calendar', prompt, html,
      input: 'choice', answer: ans,
      choices: DAYS.map((d, i) => ({ id: i, label: d.slice(0, 3), aria: d })),
      choiceStyle: 'days',
      hint, explain, data
    };
  }

  /* ---------- 6. Working backwards ---------- */
  const OP_TEXT = {
    add: k => `adds ${k}`, sub: k => `takes away ${k}`, double: () => 'doubles it', triple: () => 'multiplies it by 3', halve: () => 'halves it'
  };
  const OP_CHIP = { add: k => '+' + k, sub: k => '−' + k, double: () => '×2', triple: () => '×3', halve: () => '÷2' };

  function genDragonGold() {
    const { int } = rnd;
    const nights = int(2, 3), k = int(1, 3), end = int(1, 5);
    const trail = [end];
    for (let i = 0; i < nights; i++) trail.push((trail[trail.length - 1] + k) * 2);
    const start = trail[trail.length - 1];
    let explain = `Work backwards. Before the last night the dragon had (${end} + ${k}) × 2 = ${trail[1]} coins.`;
    for (let i = 1; i < nights; i++) explain += ` The night before: (${trail[i]} + ${k}) × 2 = ${trail[i + 1]}.`;
    explain += ` So it started with ${start} coins.`;
    return {
      type: 'backwards', label: 'Work backwards',
      prompt: `Each night a greedy dragon spends half of its gold coins, and then ${k} more coin${k > 1 ? 's' : ''}. After ${nights} nights it has ${end} coin${end > 1 ? 's' : ''} left. How many coins did it start with?`,
      html: h.facts([[nights, 'nights'], [end, 'coins left']]),
      input: 'number', answer: start,
      hint: `Start from the end. Before spending ${k} more, how many did it have? And before spending half?`,
      explain,
      data: { kind: 'dragon', nights, k, end, start }
    };
  }

  function genBackwards(t, ctx) {
    const { int, pick } = rnd;
    if (t === 5 && rnd.chance(0.5)) return genDragonGold();
    const steps = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 4 }[t];
    const pool = t === 1 ? ['add', 'sub'] : t === 2 ? ['add', 'sub', 'double', 'triple'] : ['add', 'sub', 'double', 'triple', 'halve'];
    for (let attempt = 0; attempt < 500; attempt++) {
      const ops = [];
      for (let i = 0; i < steps; i++) {
        const op = pick(pool);
        ops.push({ op, k: op === 'add' || op === 'sub' ? int(2, t <= 2 ? 9 : 15) : 0 });
      }
      if (t >= 2 && !ops.some(o => o.op === 'double' || o.op === 'triple' || o.op === 'halve')) continue;
      const x = int(2, t <= 2 ? 15 : 30);
      let cur = x, ok = true;
      const trail = [x];
      for (const o of ops) {
        if (o.op === 'add') cur += o.k;
        else if (o.op === 'sub') { cur -= o.k; if (cur <= 0) ok = false; }
        else if (o.op === 'double') cur *= 2;
        else if (o.op === 'triple') cur *= 3;
        else if (o.op === 'halve') { if (cur % 2) ok = false; cur /= 2; }
        trail.push(cur);
        if (!ok) break;
      }
      if (!ok || cur > 999 || cur === x) continue;

      const who = rnd.chance(0.3) && ctx && ctx.name ? { name: ctx.name, he: ctx.he || 'She', his: ctx.he === 'He' ? 'his' : 'her' } : pick(P.NPCS);
      const said = ops.map((o, i) => (i === 0 ? '' : i === ops.length - 1 ? 'and then ' : 'then ') + OP_TEXT[o.op](o.k));
      const sentence = `${who.he} ${said.join(', ')}.`;
      const undo = [];
      for (let i = ops.length - 1; i >= 0; i--) {
        const o = ops[i], after = trail[i + 1], before = trail[i];
        const step = { add: `${after} − ${o.k}`, sub: `${after} + ${o.k}`, double: `${after} ÷ 2`, triple: `${after} ÷ 3`, halve: `${after} × 2` }[o.op];
        undo.push(`${step} = ${before}`);
      }
      const chain = '<div class="chain"><span class="chip chip-q">?</span>' +
        ops.map(o => `<span class="arrow" aria-hidden="true">→</span><span class="chip chip-op">${OP_CHIP[o.op](o.k)}</span>`).join('') +
        `<span class="arrow" aria-hidden="true">→</span><span class="chip">${cur}</span></div>`;
      return {
        type: 'backwards', label: 'Work backwards',
        prompt: `${who.name} thinks of a number. ${sentence} The answer is ${cur}. What number did ${who.he.toLowerCase()} start with?`,
        html: chain,
        input: 'number', answer: x,
        hint: 'Start at the end and undo the last step first. The opposite of doubling is halving.',
        explain: `Start at ${cur} and undo each step, last one first: ${undo.join(', ')}. The starting number was ${x}.`,
        data: { kind: 'ops', ops, x, end: cur }
      };
    }
    throw new Error('backwards generation failed');
  }

  P.gen.potion = genPotion;
  P.gen.legs = genLegs;
  P.gen.calendar = genCalendar;
  P.gen.backwards = genBackwards;
  P.clockSVG = clockSVG;
})(typeof window !== 'undefined' ? window : globalThis);
