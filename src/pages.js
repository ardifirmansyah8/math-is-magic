/* Math Is Magic: answer tracking and the parent page */
(function () {
  'use strict';
  const M = window.MIM, Pz = window.Puzzles, Art = window.Art, Jobs = window.Jobs;
  const { state, esc } = M;
  const MAX_RECENT = 300, MAX_MISTAKES = 30, KEEP_DAYS = 60;

  const SKILLS = {
    pattern: 'Spotting the rule in a sequence: gaps, doubling, squares.',
    magic: 'Adding up and step-by-step logic in 3 × 3 grids.',
    potion: 'Solving equations where pictures stand for numbers.',
    legs: 'Two facts and two unknowns, an early form of simultaneous equations.',
    calendar: 'Remainders and cycles of 7 days and 12 hours.',
    backwards: 'Undoing steps with the opposite operation.',
    sums: 'Mental maths shortcuts: pairing, Gauss sums, 99 = 100 − 1.',
    counting: 'Combinations, handshakes, squares in a grid, paths.',
    odd: 'Number properties: primes, squares, multiples.',
    picture: 'Visual patterns with turning and repeating cycles.',
    mystery: 'Divisibility and remainders.',
    area: 'Area and perimeter, including L and U shapes.',
    ages: 'Word problems that build towards algebra.'
  };

  const pad = n => String(n).padStart(2, '0');
  const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const freshStats = () => ({ byType: {}, days: {}, recent: [], mistakes: [] });
  const stats = () => state.save.stats || (state.save.stats = freshStats());

  function givenText(p, given) {
    if (p.input === 'number') return String(given);
    const c = p.choices.find(x => x.id === given);
    if (!c) return '';
    return p.choiceStyle === 'tiles' ? 'the ' + c.aria : c.aria;
  }

  // Called by the battle for every answer
  M.track = function (p, ok, given, hint) {
    const st = stats(), now = Date.now();
    const T = st.byType[p.type] || (st.byType[p.type] = { n: 0, ok: 0, hints: 0, lvl: [0, 0, 0, 0, 0], okLvl: [0, 0, 0, 0, 0] });
    T.n++; T.lvl[p.tier - 1]++;
    if (ok) { T.ok++; T.okLvl[p.tier - 1]++; }
    if (hint) T.hints++;
    const k = dayKey(now), D = st.days[k] || (st.days[k] = { n: 0, ok: 0 });
    D.n++; if (ok) D.ok++;
    const cutoff = dayKey(now - KEEP_DAYS * 864e5);
    Object.keys(st.days).forEach(d => { if (d < cutoff) delete st.days[d]; });
    st.recent.push({ t: now, type: p.type, tier: p.tier, ok: ok ? 1 : 0 });
    if (st.recent.length > MAX_RECENT) st.recent.splice(0, st.recent.length - MAX_RECENT);
    if (!ok) {
      st.mistakes.unshift({ t: now, type: p.type, tier: p.tier, prompt: p.prompt, html: p.html, given: givenText(p, given), answer: Pz.answerText(p), explain: p.explain });
      if (st.mistakes.length > MAX_MISTAKES) st.mistakes.length = MAX_MISTAKES;
    }
    M.persist();
  };

  function lastDays(n) {
    const st = stats(), out = [], today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 864e5), k = dayKey(d), v = st.days[k] || { n: 0, ok: 0 };
      out.push({
        k, n: v.n, ok: v.ok,
        short: i === 0 ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'narrow' }),
        long: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
      });
    }
    return out;
  }

  function when(t) {
    const d = new Date(t), today = dayKey(Date.now()), yest = dayKey(Date.now() - 864e5), k = dayKey(t);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return k === today ? `Today, ${time}` : k === yest ? `Yesterday, ${time}` : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + `, ${time}`;
  }

  // Stacked columns: right answers (bottom) and not-yet answers (top), 2px surface gap between
  function activityChart(days) {
    const W = 336, H = 150, padL = 26, padB = 22, padT = 10, slot = (W - padL) / days.length, bw = Math.min(16, slot - 6);
    const max = Math.max(4, ...days.map(d => d.n)), top = Math.ceil(max / 4) * 4, y = v => H - padB - (v / top) * (H - padB - padT);
    const gap = 2, r = 4;
    let bars = '', labels = '';
    days.forEach((d, i) => {
      const x = padL + i * slot + (slot - bw) / 2, cx = x + bw / 2;
      const wrong = d.n - d.ok;
      let g = '';
      if (d.ok) {
        const y1 = y(d.ok), h = H - padB - y1;
        g += wrong ? `<rect x="${x.toFixed(1)}" y="${y1.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" class="viz-right"/>`
          : `<path d="${roundTop(x, y1, bw, h, r)}" class="viz-right"/>`;
      }
      if (wrong) {
        const yTop = y(d.n), yBot = d.ok ? y(d.ok) - gap : H - padB, h = yBot - yTop;
        if (h > 0.5) g += `<path d="${roundTop(x, yTop, bw, h, Math.min(r, h))}" class="viz-wrong"/>`;
      }
      const label = `${d.long}: ${d.n} answered, ${d.ok} right`;
      bars += `<g class="act-bar" tabindex="0" role="img" aria-label="${label}" data-tip="${esc(label)}" data-x="${cx.toFixed(1)}" data-y="${y(d.n).toFixed(1)}">` +
        `<rect x="${(padL + i * slot).toFixed(1)}" y="${padT}" width="${slot.toFixed(1)}" height="${H - padB - padT}" class="hit"/>${g}</g>`;
      labels += `<text x="${cx.toFixed(1)}" y="${H - 6}" class="viz-tick" text-anchor="middle">${d.short === 'Today' ? 'T' : d.short}</text>`;
    });
    const grid = [0, top / 2, top].map(v => `<line x1="${padL}" x2="${W}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="viz-grid"/><text x="${padL - 6}" y="${(y(v) + 4).toFixed(1)}" class="viz-tick" text-anchor="end">${v}</text>`).join('');
    return `<svg class="act-chart" viewBox="0 0 ${W} ${H}" role="group" aria-label="Puzzles answered each day for the last two weeks">${grid}${bars}${labels}</svg>`;
  }
  function roundTop(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h));
    return `M${x.toFixed(1)} ${(y + h).toFixed(1)} V${(y + r).toFixed(1)} Q${x.toFixed(1)} ${y.toFixed(1)} ${(x + r).toFixed(1)} ${y.toFixed(1)} H${(x + w - r).toFixed(1)} Q${(x + w).toFixed(1)} ${y.toFixed(1)} ${(x + w).toFixed(1)} ${(y + r).toFixed(1)} V${(y + h).toFixed(1)} Z`;
  }

  M.screens.parents = () => {
    const s = state.save, st = stats(), name = esc(M.heroName()), she = s.hero.gender === 'boy' ? 'he' : 'she', her = s.hero.gender === 'boy' ? 'his' : 'her';
    const types = Object.keys(M.TOPICS);
    let n = 0, ok = 0, hints = 0;
    types.forEach(k => { const T = st.byType[k]; if (T) { n += T.n; ok += T.ok; hints += T.hints; } });
    const days = lastDays(14), active = days.filter(d => d.n).length;
    const rows = types.filter(k => st.byType[k] && st.byType[k].n).map(k => {
      const T = st.byType[k], acc = Math.round(100 * T.ok / T.n);
      let best = 0; T.okLvl.forEach((v, i) => { if (v) best = i + 1; });
      return { k, label: M.TOPICS[k], n: T.n, ok: T.ok, acc, hints: T.hints, best };
    }).sort((a, b) => (a.n >= 3) === (b.n >= 3) ? a.acc - b.acc : (a.n >= 3 ? -1 : 1));
    const enough = rows.filter(r => r.n >= 3);
    const practise = enough.filter(r => r.acc < 70).slice(0, 2);
    const strong = enough.filter(r => r.acc >= 80).sort((a, b) => b.acc - a.acc || b.n - a.n).slice(0, 2);
    const unplayed = types.filter(k => !st.byType[k]).map(k => M.TOPICS[k]);

    const tiles = `<div class="pp-tiles">
      <div class="pp-tile"><span class="pp-label">Puzzles answered</span><b class="pp-value">${n}</b></div>
      <div class="pp-tile"><span class="pp-label">Answered correctly</span><b class="pp-value">${n ? Math.round(100 * ok / n) + '%' : '–'}</b></div>
      <div class="pp-tile"><span class="pp-label">Stages cleared</span><b class="pp-value">${M.cleared()} of ${M.REALMS.length}</b></div>
      <div class="pp-tile"><span class="pp-label">Days played, last 2 weeks</span><b class="pp-value">${active}</b></div>
    </div>`;

    const focus = n < 5
      ? `<p class="dim">Once ${name} has answered a few more puzzles, this shows what ${she} is strong at and what is worth practising.</p>`
      : `<div class="pp-focus">
          <div class="pp-card"><h4 class="pp-h">${Art.icon('rate')}Strong at</h4>${strong.length ? `<ul>${strong.map(r => `<li><p><b>${r.label}</b> · ${r.acc}% right</p><span>${SKILLS[r.k]}</span></li>`).join('')}</ul>` : '<p class="dim">No topic above 80% yet.</p>'}</div>
          <div class="pp-card"><h4 class="pp-h">${Art.icon('bulb')}Worth practising</h4>${practise.length ? `<ul>${practise.map(r => `<li><p><b>${r.label}</b> · ${r.acc}% right</p><span>${SKILLS[r.k]}</span></li>`).join('')}</ul>` : '<p class="dim">Nothing below 70%. Nice!</p>'}</div>
        </div>`;

    const table = `<details class="pp-table"><summary>Show as a table</summary><div class="pp-scroll"><table><thead><tr><th scope="col">Day</th><th scope="col">Answered</th><th scope="col">Right</th></tr></thead><tbody>${days.map(d => `<tr><td>${d.long}</td><td>${d.n}</td><td>${d.ok}</td></tr>`).join('')}</tbody></table></div></details>`;

    const topicRows = rows.length ? `<ul class="pp-topics">${rows.map(r => `<li class="pp-topic">
        <div class="pp-topic-name"><b>${r.label}</b><span>${SKILLS[r.k]}</span></div>
        <div class="pp-meter" role="img" aria-label="${r.acc}% right"><span style="width:${Math.max(2, r.acc)}%"></span></div>
        <div class="pp-topic-nums"><b>${r.acc}%</b><span>${r.ok} of ${r.n} right · up to level ${r.best || '–'}${r.hints ? ` · ${r.hints} hint${r.hints === 1 ? '' : 's'}` : ''}</span></div>
      </li>`).join('')}</ul>` : `<p class="dim">No puzzles answered yet.</p>`;

    const shown = state.ppAllMistakes ? st.mistakes : st.mistakes.slice(0, 6);
    const mistakes = st.mistakes.length ? `<div class="pp-mistakes">${shown.map(m => `<article class="pp-mistake">
        <p class="eyebrow">${M.TOPICS[m.type] || m.type} · Level ${m.tier} · ${when(m.t)}</p>
        <p class="pp-prompt">${esc(m.prompt)}</p>
        ${m.html ? `<div class="visual pp-visual">${m.html}</div>` : ''}
        <p class="pp-answers"><span>${name} answered <b>${esc(m.given)}</b></span><span>Correct answer <b>${esc(m.answer)}</b></span></p>
        <p class="pp-explain">${esc(m.explain)}</p>
      </article>`).join('')}</div>
      ${st.mistakes.length > 6 ? `<button class="btn btn-small" data-act="ppMore">${state.ppAllMistakes ? 'Show fewer' : `Show all ${st.mistakes.length}`}</button>` : ''}`
      : `<p class="dim">No mistakes to review yet.</p>`;

    const reset = state.ppConfirm
      ? `<div class="confirm"><p>Clear all answer history on this device? Stars and progress stay.</p><div class="row"><button class="btn btn-small" data-act="ppReset">Yes, clear it</button><button class="btn btn-small btn-ghost" data-act="ppCancel">Keep it</button></div></div>`
      : `<button class="btn btn-ghost btn-small" data-act="ppAsk">Clear answer history</button>`;

    return `<section class="screen pp" aria-labelledby="pp-title"><div class="wrap">
      <div class="topbar"><button class="icon-btn" data-act="toMap" aria-label="Back to the map">${Art.icon('back')}</button>
        <div class="grow"><p class="eyebrow">For grown-ups</p><h2 id="pp-title" class="h2">Parent page</h2></div></div>
      <p class="dim">How ${name} is getting on, ${esc(Jobs.title(s.job, M.cleared()))} with ${M.totalStars()} of ${M.REALMS.length * 3} stars. Everything here is saved only on this device.</p>
      ${tiles}
      <section class="pp-section" aria-labelledby="pp-focus"><h3 id="pp-focus" class="h3">Strengths and practice</h3>${focus}
        ${unplayed.length && n ? `<p class="dim">Not tried yet: ${unplayed.join(', ')}. Later stages bring these in.</p>` : ''}</section>
      <section class="pp-section" aria-labelledby="pp-act"><h3 id="pp-act" class="h3">Puzzles each day</h3>
        <div class="pp-legend"><span><i class="sw sw-right"></i>Right</span><span><i class="sw sw-wrong"></i>Not yet</span></div>
        <div class="pp-chart" id="pp-chart">${activityChart(days)}<div class="pp-tip" id="pp-tip" hidden></div></div>
        ${table}</section>
      <section class="pp-section" aria-labelledby="pp-topics"><h3 id="pp-topics" class="h3">By topic</h3>
        <p class="dim">Weakest first. Every topic is a classic maths olympiad skill.</p>${topicRows}</section>
      <section class="pp-section" aria-labelledby="pp-mis"><h3 id="pp-mis" class="h3">Recent mistakes to talk through</h3>
        <p class="dim">A good habit: ask ${name} to explain the trick in ${her} own words. Explaining a method is the fastest way to remember it.</p>${mistakes}</section>
      <div class="row">${reset}</div>
    </div></section>`;
  };

  Object.assign(M.actions, {
    ppMore: () => { state.ppAllMistakes = !state.ppAllMistakes; M.render(); },
    ppAsk: () => { state.ppConfirm = true; M.render(); },
    ppCancel: () => { state.ppConfirm = false; M.render(); },
    ppReset: () => { state.save.stats = freshStats(); state.ppConfirm = false; M.persist(); M.render(); }
  });

  // Tooltip for the activity chart (hover and keyboard focus)
  function showTip(bar) {
    const chart = document.getElementById('pp-chart'), tip = document.getElementById('pp-tip');
    if (!chart || !tip || !bar) return;
    const svg = chart.querySelector('svg'), box = svg.getBoundingClientRect(), cb = chart.getBoundingClientRect();
    const vb = svg.viewBox.baseVal, sx = box.width / vb.width, sy = box.height / vb.height;
    tip.textContent = bar.getAttribute('data-tip');
    tip.hidden = false;
    const x = (box.left - cb.left) + Number(bar.getAttribute('data-x')) * sx, y = (box.top - cb.top) + Number(bar.getAttribute('data-y')) * sy;
    const w = tip.offsetWidth;
    tip.style.left = Math.max(0, Math.min(cb.width - w, x - w / 2)) + 'px';
    tip.style.top = Math.max(0, y - tip.offsetHeight - 8) + 'px';
    document.querySelectorAll('.act-bar.is-hot').forEach(b => b.classList.remove('is-hot'));
    bar.classList.add('is-hot');
  }
  function hideTip() {
    const tip = document.getElementById('pp-tip');
    if (tip) tip.hidden = true;
    document.querySelectorAll('.act-bar.is-hot').forEach(b => b.classList.remove('is-hot'));
  }
  document.addEventListener('pointerover', e => { const b = e.target.closest && e.target.closest('.act-bar'); if (b) showTip(b); });
  document.addEventListener('pointerout', e => { const b = e.target.closest && e.target.closest('.act-bar'); if (b && !b.contains(e.relatedTarget)) hideTip(); });
  document.addEventListener('focusin', e => { const b = e.target.closest && e.target.closest('.act-bar'); if (b) showTip(b); });
  document.addEventListener('focusout', e => { if (e.target.closest && e.target.closest('.act-bar')) hideTip(); });
})();
