/* Math Is Magic: battles (spell choice, puzzles, answers, power-ups, animations) */
(function () {
  'use strict';
  const M = window.MIM, Pz = window.Puzzles, Art = window.Art;
  const { state, REALMS, SPELLS, sfx, esc } = M;
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const PRAISE = ['Correct!', 'Brilliant!', 'Spot on!', 'Yes!', 'Nailed it!'];

  // One-hit cheat: ?cheat=onehit (or ?onehit) on a normal site, #onehit where only the hash gets through
  function cheatOn() {
    try {
      const q = new URLSearchParams(window.location.search);
      const c = (q.get('cheat') || '').toLowerCase();
      const h = (window.location.hash || '').replace(/^#/, '').toLowerCase();
      return q.has('onehit') || c === 'onehit' || h === 'onehit';
    } catch (e) { return false; }
  }

  /* ---------- Power-ups ---------- */
  const MAX_ITEM = 3;
  const ITEMS = {
    shield: { name: 'Shield Charm', short: 'Shield', a: 'a', icon: 'shield', what: 'Adds a shield that blocks the next hit from the monster, so a wrong answer costs no heart.',
      why: b => b.shield >= 3 ? 'You already have 3 shields up.' : '' },
    jamu: { name: 'Jamu Potion', short: 'Jamu', a: 'a', icon: 'jamu', what: 'A warm herbal jamu that brings back 1 heart.',
      why: b => b.hearts >= b.maxHearts ? 'Your hearts are already full. Save it for later!' : '' },
    double: { name: 'Double Chalk', short: 'Double', a: 'a', icon: 'double', what: 'Your next correct spell hits twice as hard.',
      why: b => b.double ? 'Double Chalk is already waiting for your next spell.' : '' },
    eraser: { name: 'Board Eraser', short: 'Eraser', a: 'a', icon: 'eraser', what: 'Wipes away the puzzle on the board and gives you a new one.',
      why: b => b.phase !== 'puzzle' ? 'Pick a spell first, then use it on the puzzle.' : '' }
  };
  const ITEM_IDS = Object.keys(ITEMS);
  M.ITEMS = ITEMS;
  const inv = () => state.save.items;

  function grantRandom() {
    const bag = inv();
    const open = ITEM_IDS.filter(id => (bag[id] || 0) < MAX_ITEM);
    if (!open.length) return null;
    const id = Pz.rnd.pick(open);
    bag[id] = (bag[id] || 0) + 1;
    M.persist();
    return id;
  }
  function blocked(id) {
    const b = state.battle;
    if (!b) return 'Power-ups only work in battles.';
    if ((inv()[id] || 0) < 1) return `You have none left. Get ${b.k.dropEvery} right in a row to find more.`;
    if (b.phase === 'feedback' || b.busy) return 'Wait for your next spell.';
    return ITEMS[id].why(b);
  }

  function newBattle(realm) {
    const r = REALMS[realm], k = window.Jobs.skills(state.save.job, M.cleared()), h = M.heartsNow();
    state.battle = {
      realm, hp: r.hp, hearts: h.now, startHearts: h.now, maxHearts: k.maxHearts, k, streak: 0, recent: [],
      phase: 'spell', spell: 0, puzzle: null, hintUsed: false, input: '', choice: null,
      cast: 0, misses: 0, hints: 0, last: null, busy: false,
      shield: k.shieldStart, double: k.startDouble, info: null, stolen: [],
      swaps: k.swaps, rewinds: k.rewinds
    };
  }

  // Hearts carry over, so the save follows every change. Running out means a rest: the next fight starts full
  function syncHearts() {
    const b = state.battle;
    if (!b) return;
    state.save.hurt = b.hearts > 0 ? Math.max(0, b.maxHearts - b.hearts) : 0;
    M.persist();
  }

  function makePuzzle(spell) {
    const b = state.battle, r = REALMS[b.realm];
    let pool = r.pool.filter(t => !b.recent.includes(t));
    if (!pool.length) pool = r.pool;
    const type = Pz.rnd.pick(pool);
    b.recent.push(type);
    while (b.recent.length > Math.min(3, r.pool.length - 1)) b.recent.shift();
    return Pz.make(type, r.tiers[spell], { name: M.heroName(), he: state.save.hero.gender === 'boy' ? 'He' : 'She' });
  }

  const has = trait => (REALMS[state.battle.realm].traits || []).includes(trait);
  const basePower = (spell, hint) => {
    const b = state.battle;
    return Math.max(1, SPELLS[spell].power + (b.streak >= 2 ? 1 : 0) - (hint && !b.k.freeHints ? 1 : 0)) + b.k.dmg;
  };
  // Spell names, icons and colours come from the job's spellbook; power comes from the slot
  const SP = i => Object.assign({}, SPELLS[i], window.Jobs.spells(state.save.job)[i]);
  const weakBonus = () => (state.battle.puzzle && state.battle.puzzle.type === REALMS[state.battle.realm].weak ? 1 : 0);
  const power = () => basePower(state.battle.spell, state.battle.hintUsed) * (state.battle.double ? 2 : 1) + weakBonus();

  /* ---------- Pieces ---------- */
  function heartsHTML() {
    const b = state.battle;
    let out = '';
    for (let i = 0; i < b.maxHearts; i++) out += Art.icon(i < b.hearts ? 'heart' : 'heart-empty');
    return out;
  }
  function statusHTML() {
    const b = state.battle, chips = [];
    if (b.shield > 0) chips.push(`<span class="chip-s" title="Shields">${Art.icon('shield')}×${b.shield}</span>`);
    if (b.k.swaps) chips.push(`<span class="chip-s" title="Free puzzle swaps">${Art.icon('book')}×${b.swaps}</span>`);
    if (b.k.rewinds) chips.push(`<span class="chip-s" title="Rewinds">${Art.icon('hourglass')}×${b.rewinds}</span>`);
    return chips.join('');
  }
  function tallyHTML() {
    const b = state.battle, max = REALMS[b.realm].hp;
    let lines = '';
    for (let i = 0; i < max; i++) {
      const g = Math.floor(i / 5), pos = i % 5, x0 = 4 + g * 38;
      const cls = i < b.hp ? 'on' : 'off';
      lines += pos < 4
        ? `<line class="${cls}" x1="${x0 + pos * 7}" y1="4" x2="${x0 + pos * 7}" y2="22"/>`
        : `<line class="${cls}" x1="${x0 - 4}" y1="19" x2="${x0 + 25}" y2="7"/>`;
    }
    const w = 4 + Math.ceil(max / 5) * 38;
    return `<svg class="tally" id="tally" viewBox="0 0 ${w} 26" role="img" aria-label="${b.hp} of ${max} hit points left" style="max-width:${w * 1.15}px">${lines}</svg>`;
  }
  const comboText = () => state.battle.streak >= 3 ? `${state.battle.streak} in a row! +1 power` : state.battle.streak === 2 ? 'One more for a combo!' : '';
  const mageClass = () => 'fighter' + (state.battle.shield ? ' shielded' : '') + (state.battle.double ? ' doubled' : '');

  function kitHTML() {
    const b = state.battle, bag = inv();
    const buttons = ITEM_IDS.map(id => {
      const it = ITEMS[id], n = bag[id] || 0;
      const active = (id === 'shield' && b.shield) || (id === 'double' && b.double);
      const cls = 'item' + (active ? ' is-active' : '') + (b.info === id ? ' is-open' : '') + (n || active ? '' : ' is-empty');
      return `<button class="${cls}" data-act="itemInfo" data-arg="${id}" aria-expanded="${b.info === id}" aria-label="${it.name}: ${n} left${active ? ', in use' : ''}">` +
        `${Art.icon(it.icon)}<span class="item-name">${it.short}</span><span class="item-count">${n}</span></button>`;
    }).join('');
    let info = '';
    if (b.info) {
      const it = ITEMS[b.info], why = blocked(b.info);
      info = `<div class="item-info enter">${Art.icon(it.icon)}<div class="item-text"><b>${it.name}</b><span>${it.what}</span>${why ? `<span class="item-why">${why}</span>` : ''}</div>` +
        `<div class="item-btns">${why ? '' : `<button class="btn btn-primary btn-small" data-act="useItem" data-arg="${b.info}">Use it</button>`}<button class="btn btn-ghost btn-small" data-act="itemInfo" data-arg="">Close</button></div></div>`;
    }
    return `<div class="items" role="group" aria-label="Power-ups">${buttons}</div>${info}`;
  }

  function spellHTML() {
    const b = state.battle, r = REALMS[b.realm];
    const notes = [];
    if (b.double) notes.push('Double Chalk is ready, so your next correct spell hits twice as hard.');
    if (b.streak >= 2) notes.push('Combo! Every spell gets +1 power.');
    if (has('armored')) notes.push(`${r.foe} is armoured, so ${SP(0).name} bounces off.`);
    return `<div class="enter"><h3 class="h3">Choose a spell</h3><p class="dim">Stronger spells hit harder, but their puzzles are tougher.</p>${notes.map(n => `<p class="hand">${n}</p>`).join('')}</div>
      <div class="spells enter">${SPELLS.map((_, i) => {
        const s = SP(i), bounce = i === 0 && has('armored');
        return `<button class="spell" data-act="chooseSpell" data-arg="${i}"${bounce ? ' disabled' : ''}>${Art.icon(s.icon)}<span class="spell-name">${s.name}</span><span class="spell-power">${bounce ? 'Bounces off' : (basePower(i, false) * (b.double ? 2 : 1)) + ' power'}</span><span class="spell-level">Level ${r.tiers[i]}</span></button>`;
      }).join('')}</div>`;
  }

  function answerHTML() {
    const b = state.battle, p = b.puzzle;
    if (p.input === 'number') {
      const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" data-act="key" data-arg="${n}">${n}</button>`).join('');
      return `<div class="answer-box" id="answer-box" role="status" aria-label="Your answer">${b.input ? esc(b.input) : '<span class="placeholder">Type your answer</span>'}<span class="caret" aria-hidden="true"></span></div>
        <div class="keypad" role="group" aria-label="Number pad">${keys}
          <button class="key" data-act="key" data-arg="del" aria-label="Delete">${Art.icon('back')}</button>
          <button class="key" data-act="key" data-arg="0">0</button>
          <button class="key key-cast" id="cast-btn" data-act="cast" ${b.input ? '' : 'disabled'}>Cast!</button></div>`;
    }
    const style = p.choiceStyle === 'days' ? 'days' : p.choiceStyle === 'tiles' ? 'tiles-choice' : '';
    return `<div class="choices ${style}" role="group" aria-label="Answers">${p.choices.map(c =>
      `<button class="choice" data-act="choose" data-arg="${c.id}" aria-pressed="${b.choice === c.id}" aria-label="${esc(c.aria)}">${c.svg || esc(c.label)}</button>`).join('')}</div>
      <button class="btn btn-primary" id="cast-btn" data-act="cast" ${b.choice === null ? 'disabled' : ''}>Cast!</button>`;
  }

  function puzzleHTML() {
    const b = state.battle, p = b.puzzle, s = SP(b.spell);
    const pw = power();
    const loss = pw - (basePower(b.spell, true) * (b.double ? 2 : 1) + weakBonus());
    const hintBtn = b.hintUsed ? '' : has('gusty') ? `<p class="hand">The wind blows hints away in this fight.</p>` :
      `<button class="btn btn-ghost btn-small" data-act="hint">${Art.icon('bulb')} Show a hint${loss > 0 ? ` (−${loss} power)` : ''}</button>`;
    return `<div class="puzzle enter">
      <div class="pz-head"><span class="tag">${Art.icon(s.icon)} ${s.name} · ${pw} power${b.streak >= 2 ? ' · combo' : ''}${b.double ? ' · ×2' : ''}</span><span class="tag">${esc(p.label)} · Level ${p.tier}</span>${weakBonus() ? '<span class="tag tag-weak">Weak spot! +1</span>' : ''}</div>
      <p class="prompt">${esc(p.prompt)}</p>
      <div class="visual">${p.html}</div>
      ${b.hintUsed ? `<div class="hint-note">${Art.icon('bulb')}<p class="hand">${esc(p.hint)}</p></div>` : ''}
      <div class="answer" id="answer">${answerHTML()}</div>
      ${hintBtn || b.k.swaps ? `<div class="pz-actions">${hintBtn}${b.k.swaps ? `<button class="btn btn-ghost btn-small" data-act="swap"${b.swaps ? '' : ' disabled'}>${Art.icon('book')} Swap puzzle (${b.swaps} left)</button>` : ''}</div>` : ''}
    </div>`;
  }

  function feedbackHTML() {
    const b = state.battle, p = b.puzzle, r = REALMS[b.realm], L = b.last, s = SP(b.spell);
    if (L.rewound) {
      return `<div class="feedback rewind enter">
        <h3 class="fb-title">${L.title}</h3>
        <p class="fb-line">That answer was not right, but your Rewind skill turned back time before ${r.foe} could hit you. Have another go at the same puzzle.${b.rewinds ? ` (${b.rewinds} rewind${b.rewinds === 1 ? '' : 's'} left)` : ''}</p>
        <button class="btn btn-primary" id="next-btn" data-act="retry">Try again</button>
      </div>`;
    }
    let line;
    if (L.ok) {
      const helpers = [];
      if (L.cheat) helpers.push('the one-hit cheat');
      if (L.weak && !L.cheat) helpers.push('its weak spot');
      if (L.doubled && !L.cheat) helpers.push('Double Chalk');
      if (L.bonus && !L.cheat) helpers.push('your combo');
      line = `${s.name} hits ${r.foe} for ${L.dmg}${helpers.length ? `, thanks to ${helpers.join(' and ')}` : ''}.` + (b.hp === 0 ? ` ${r.foe} is beaten!` : '') +
        (L.healed ? ' Your Mend skill heals 1 heart.' : '') + (L.shieldUp ? ' Your Ward skill raises a new shield.' : '');
    } else {
      const picked = p.input === 'number' ? null : (p.choices.find(c => c.id === L.given) || {}).aria || '';
      const given = p.input === 'number' ? L.given : (p.choiceStyle === 'tiles' ? 'the ' + picked : picked);
      line = `You answered ${esc(given)}, but the answer is ${esc(Pz.answerText(p))}. ` +
        (L.blocked ? `${r.foe} hits back, but your shield blocks it. No heart lost!`
          : `${r.foe} hits back and you lose a heart.` + (b.hearts === 0 ? ' That was your last heart.' : '')) +
        (L.stole ? ` ${r.foe} snatches your ${ITEMS[L.stole].name}!` : '') +
        (L.regrew ? ` ${r.foe} regrows 1 hit point.` : '');
    }
    const loot = L.drop ? `<p class="loot">${Art.icon(ITEMS[L.drop].icon)}<span>${L.streak} in a row! You found ${ITEMS[L.drop].a} ${ITEMS[L.drop].name}.</span></p>` : '';
    const btn = b.hp === 0 ? 'Claim victory' : b.hearts === 0 ? 'Continue' : 'Next spell';
    return `<div class="feedback ${L.ok ? 'good' : 'bad'} enter">
      <h3 class="fb-title">${L.title}</h3>
      <p class="fb-line">${line}</p>
      ${loot}
      <div class="fb-explain"><span class="eyebrow">${L.ok ? 'The trick' : 'How to solve it'}</span>${esc(p.explain)}</div>
      <button class="btn btn-primary" id="next-btn" data-act="next">${btn}</button>
    </div>`;
  }

  function panelHTML() {
    const ph = state.battle.phase;
    return ph === 'spell' ? spellHTML() : ph === 'puzzle' ? puzzleHTML() : feedbackHTML();
  }

  M.screens.battle = () => {
    const b = state.battle, r = REALMS[b.realm], H = state.save.hero;
    const foeCls = b.hp === 0 ? 'is-beaten' : 'idle';
    return `<section class="screen battle" id="battle-screen" aria-labelledby="b-title"><div class="wrap">
      <div class="topbar">
        <button class="icon-btn" data-act="quitBattle" aria-label="Leave the battle">${Art.icon('back')}</button>
        <div class="grow"><p class="eyebrow">Realm ${b.realm + 1}</p><h2 id="b-title" class="realm-name">${r.name}</h2></div>
        ${cheatOn() ? '<span class="cheat-chip" title="Every correct answer defeats the monster">One-hit cheat</span>' : ''}
        ${M.soundBtn()}
      </div>
      <div class="battle-body">
        <div class="side">
          <div class="arena" id="arena">
            <div class="${mageClass()}" id="f-mage">${Art.mage(H, 'idle')}<span class="fighter-name">${esc(M.heroName())}</span><span class="job-title">${Art.icon(M.myIcon())}${esc(M.myTitle())}</span><div class="hearts${b.maxHearts > 4 ? ' many' : ''}" id="hearts" role="img" aria-label="${b.hearts} of ${b.maxHearts} hearts">${heartsHTML()}</div><div class="status" id="status">${statusHTML()}</div></div>
            <div class="fighter" id="f-foe">${Art.monster(r.monster, foeCls, r.foe)}<span class="fighter-name">${r.foe}</span>${tallyHTML()}<div class="trait-tags">${(r.traits || []).map(t => `<span class="trait-tag">${M.TRAITS[t].name}</span>`).join('')}<span class="trait-tag weak-tag">Weak: ${M.TOPICS[r.weak]}</span></div></div>
            <div class="combo" id="combo">${comboText()}</div>
          </div>
          <div class="kit" id="kit">${kitHTML()}</div>
        </div>
        <div class="panel" id="panel">${panelHTML()}</div>
      </div>
    </div></section>`;
  };

  /* ---------- Partial updates ---------- */
  // On phones the puzzle panel sits below the arena, so new panels glide into view. The glide is our own
  // animation and stops the moment a finger, mouse or wheel touches the board, so it never fights a swipe.
  // (A browser smooth scroll could keep running and pull the board back down while the player scrolls up.)
  let glide = 0;
  ['touchstart', 'pointerdown', 'wheel'].forEach(ev => window.addEventListener(ev, () => { glide = 0; }, { passive: true, capture: true }));
  function glideTo(sc, to) {
    const from = sc.scrollTop, dist = to - from;
    if (Math.abs(dist) < 2) return;
    if (reduced()) { sc.scrollTop = to; return; }
    const id = glide = (glide % 1e6) + 1, t0 = performance.now(), dur = Math.min(420, 160 + Math.abs(dist) * 0.45);
    const step = now => {
      if (glide !== id) return;
      const k = Math.min(1, Math.max(0, (now - t0) / dur));
      sc.scrollTop = from + dist * (1 - Math.pow(1 - k, 3));
      if (k < 1) requestAnimationFrame(step); else glide = 0;
    };
    requestAnimationFrame(step);
  }
  // scroll: 'panel' shows the new panel from its top; true only scrolls back up if the panel's top is hidden above
  function refreshPanel(scroll) {
    const panel = $('panel');
    if (!panel) return;
    panel.innerHTML = panelHTML();
    const sc = $('battle-screen');
    if (!scroll || !sc || (window.innerWidth >= 860 && window.innerHeight > 500)) return; // big screens show the panel beside the arena
    const top = Math.max(0, panel.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 8);
    if (scroll === 'panel' ? Math.abs(sc.scrollTop - top) > 2 : sc.scrollTop > top) glideTo(sc, top);
  }
  function refreshKit() { const kit = $('kit'); if (kit) kit.innerHTML = kitHTML(); }
  function refreshStatus() {
    const b = state.battle;
    const hearts = $('hearts');
    if (hearts) { hearts.innerHTML = heartsHTML(); hearts.setAttribute('aria-label', `${b.hearts} of ${b.maxHearts} hearts`); }
    const status = $('status');
    if (status) status.innerHTML = statusHTML();
    const tally = $('tally');
    if (tally) tally.outerHTML = tallyHTML();
    const combo = $('combo');
    if (combo) combo.textContent = comboText();
    const mage = $('f-mage');
    if (mage) mage.className = mageClass();
  }
  function refreshAnswer() {
    const b = state.battle, box = $('answer-box'), btn = $('cast-btn');
    if (box) box.innerHTML = (b.input ? esc(b.input) : '<span class="placeholder">Type your answer</span>') + '<span class="caret" aria-hidden="true"></span>';
    if (btn) btn.disabled = b.puzzle.input === 'number' ? !b.input : b.choice === null;
    document.querySelectorAll('#answer .choice').forEach(c => c.setAttribute('aria-pressed', String(Number(c.dataset.arg) === b.choice)));
  }

  /* ---------- Animation helpers ---------- */
  function restart(el, cls) {
    if (!el) return;
    el.classList.remove(cls, 'idle');
    void el.getBoundingClientRect();
    el.classList.add(cls);
    el.addEventListener('animationend', function done(ev) {
      if (ev.target !== el) return;
      el.classList.remove(cls);
      if (!el.classList.contains('is-beaten')) el.classList.add('idle');
      el.removeEventListener('animationend', done);
    });
  }
  function pop(text, target, kind) {
    const arena = $('arena');
    if (!arena || !target) return;
    const a = arena.getBoundingClientRect(), t = target.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'dmg-pop' + (kind ? ' ' + kind : '');
    el.textContent = text;
    el.style.left = (t.left - a.left + t.width * 0.36) + 'px';
    el.style.top = (t.top - a.top + t.height * 0.12) + 'px';
    arena.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
  function bolt(color, width, done) {
    const arena = $('arena'), mage = document.querySelector('#f-mage .mage'), foe = document.querySelector('#f-foe .monster');
    if (!arena || !mage || !foe || reduced() || !Element.prototype.animate) { done(); return; }
    const a = arena.getBoundingClientRect(), m = mage.getBoundingClientRect(), f = foe.getBoundingClientRect();
    const x1 = m.left - a.left + m.width * 0.94, y1 = m.top - a.top + m.height * 0.22;
    const x2 = f.left - a.left + f.width * 0.42, y2 = f.top - a.top + f.height * 0.5;
    const cy = Math.min(y1, y2) - Math.max(40, a.height * 0.25);
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'bolt'); svg.setAttribute('viewBox', `0 0 ${a.width} ${a.height}`); svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', `M${x1} ${y1} Q${(x1 + x2) / 2} ${cy} ${x2} ${y2}`);
    path.setAttribute('pathLength', '1');
    path.setAttribute('filter', 'url(#chalk)');
    path.style.cssText = `stroke:${color};stroke-width:${width};stroke-dasharray:1;stroke-dashoffset:1`;
    svg.appendChild(path); arena.appendChild(svg);
    const anim = path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 420, easing: 'ease-in', fill: 'forwards' });
    anim.onfinish = () => {
      done();
      const fade = svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
      fade.onfinish = () => svg.remove();
    };
  }

  function playHit(dmg, doubled) {
    const b = state.battle, mage = document.querySelector('#f-mage .mage'), foe = document.querySelector('#f-foe .monster');
    restart(mage, 'is-cast');
    sfx.cast(SPELLS[b.spell].power);
    bolt(doubled ? 'var(--chalk)' : SP(b.spell).color, 4 + Math.min(dmg, 8) * 2, () => {
      sfx.hit();
      if (b.hp === 0 && foe) { foe.classList.remove('idle'); foe.classList.add('is-beaten'); }
      else restart(foe, 'is-hit');
      pop('−' + dmg, foe, '');
      refreshStatus();
    });
  }
  function playAttack(shielded, regrew, stole) {
    const mage = document.querySelector('#f-mage .mage'), foe = document.querySelector('#f-foe .monster');
    restart(foe, 'is-lunge');
    setTimeout(() => {
      if (shielded) { sfx.shield(); pop('Blocked!', mage, 'buff'); }
      else { sfx.hit(); restart(mage, 'is-hurt'); pop('−1', mage, 'hurt'); }
      refreshStatus();
    }, reduced() ? 0 : 260);
    if (regrew || stole) setTimeout(() => {
      if (regrew) { sfx.heal(); pop('+1', foe, 'heal'); }
      else { sfx.erase(); pop('Snatch!', foe, 'buff'); }
      refreshStatus(); refreshKit();
    }, reduced() ? 0 : 700);
  }

  /* ---------- Turn logic ---------- */
  function chooseSpell(i) {
    const b = state.battle;
    if (b.phase !== 'spell' || b.busy || (i === 0 && has('armored'))) return;
    b.spell = i; b.puzzle = makePuzzle(i);
    b.hintUsed = false; b.input = ''; b.choice = null; b.phase = 'puzzle';
    if (b.info && b.info !== 'eraser') b.info = null;
    refreshPanel('panel'); refreshKit();
  }
  function press(k) {
    const b = state.battle;
    if (b.phase !== 'puzzle' || b.puzzle.input !== 'number' || b.busy) return;
    if (k === 'del') b.input = b.input.slice(0, -1);
    else if (b.input.length < 5) b.input = b.input === '0' ? k : b.input + k;
    refreshAnswer();
  }
  function choose(id) {
    const b = state.battle;
    if (b.phase !== 'puzzle' || b.puzzle.input !== 'choice' || b.busy) return;
    b.choice = id; refreshAnswer();
  }
  function cast() {
    const b = state.battle;
    if (!b || b.phase !== 'puzzle' || b.busy) return;
    const p = b.puzzle;
    const val = p.input === 'number' ? b.input : b.choice;
    if (val === '' || val === null) return;
    const ok = Pz.check(p, p.input === 'number' ? Number(val) : val);
    if (M.track && !cheatOn()) M.track(p, ok, val, b.hintUsed); // cheat answers stay off the parent page
    b.cast++; b.info = null;
    if (ok) {
      const cheat = cheatOn(), doubled = b.double, dmg = cheat ? b.hp : power(), bonus = b.streak >= 2, weak = weakBonus() > 0;
      b.double = false;
      b.streak++;
      b.hp = Math.max(0, b.hp - dmg);
      const drop = b.streak % b.k.dropEvery === 0 ? grantRandom() : null;
      let healed = false, shieldUp = false;
      if (b.k.healEvery && b.streak % b.k.healEvery === 0 && b.hearts < b.maxHearts && b.hp > 0) { b.hearts++; healed = true; }
      if (b.k.shieldOnStreak && b.streak % 3 === 0 && b.shield < 3 && b.hp > 0) { b.shield++; shieldUp = true; }
      b.last = { ok: true, dmg, bonus, doubled, weak, cheat, drop, healed, shieldUp, streak: b.streak, given: val, title: Pz.rnd.pick(PRAISE) };
      sfx.correct();
      if (drop) sfx.loot();
      playHit(dmg, doubled);
      M.say(`Correct! ${SP(b.spell).name} hits for ${dmg}.` + (drop ? ` You found ${ITEMS[drop].a} ${ITEMS[drop].name}.` : ''));
    } else if (b.rewinds > 0) {
      b.rewinds--;
      if (!b.k.rewindKeepsCombo) b.streak = 0;
      b.last = { ok: false, rewound: true, given: val, title: 'Time rewinds!' };
      sfx.power();
      pop('Rewind!', document.querySelector('#f-mage .mage'), 'buff');
      M.say('Not quite, but time rewinds. Try the same puzzle again.');
      refreshStatus();
    } else {
      const shielded = b.shield > 0;
      b.streak = 0; b.misses++;
      if (shielded) b.shield--; else b.hearts = Math.max(0, b.hearts - 1);
      let regrew = false, stole = null;
      if (has('regrow') && b.hp < REALMS[b.realm].hp) { b.hp += 1; regrew = true; }
      if (has('thief') && !shielded) {
        const bag = inv(), owned = ITEM_IDS.filter(id => (bag[id] || 0) > 0);
        if (owned.length) { stole = Pz.rnd.pick(owned); bag[stole]--; b.stolen.push(stole); M.persist(); }
      }
      b.last = { ok: false, blocked: shielded, regrew, stole, given: val, title: 'Not quite' };
      sfx.wrong();
      playAttack(shielded, regrew, stole);
      M.say(`Not quite. The answer is ${Pz.answerText(p)}.` + (shielded ? ' Your shield blocked the hit.' : ''));
    }
    syncHearts();
    b.phase = 'feedback';
    b.busy = true;
    setTimeout(() => { b.busy = false; refreshKit(); }, reduced() ? 0 : 450);
    refreshPanel(true); refreshKit();
  }
  function next() {
    const b = state.battle;
    if (!b || b.phase !== 'feedback' || b.busy) return;
    if (b.last && b.last.rewound) return retry();
    if (b.hp === 0) return finish(true);
    if (b.hearts === 0) return finish(false);
    b.phase = 'spell'; b.puzzle = null; b.info = null;
    refreshPanel('panel'); refreshKit();
  }
  function retry() {
    const b = state.battle;
    if (!b || b.phase !== 'feedback' || !b.last || !b.last.rewound) return;
    b.phase = 'puzzle'; b.input = ''; b.choice = null; b.last = null;
    refreshPanel('panel'); refreshKit();
  }
  function swap() {
    const b = state.battle;
    if (!b || b.phase !== 'puzzle' || b.busy || b.swaps < 1) return;
    b.swaps--;
    b.puzzle = makePuzzle(b.spell); b.hintUsed = false; b.input = ''; b.choice = null;
    sfx.erase();
    M.say('Here is a new puzzle.');
    refreshPanel('panel'); refreshStatus();
  }
  function useItem(id) {
    const b = state.battle;
    if (!b || !ITEMS[id] || blocked(id)) return;
    inv()[id]--;
    M.persist();
    b.info = null;
    const mage = document.querySelector('#f-mage .mage');
    if (id === 'shield') { b.shield = Math.min(3, b.shield + 1); sfx.shield(); pop('Shield!', mage, 'buff'); M.say('Shield Charm is up. It blocks the next hit.'); }
    if (id === 'jamu') { b.hearts = Math.min(b.maxHearts, b.hearts + 1); sfx.heal(); pop('+1', mage, 'heal'); M.say('Jamu Potion. You got a heart back.'); }
    if (id === 'double') { b.double = true; sfx.power(); pop('×2', mage, ''); M.say('Double Chalk is ready for your next correct spell.'); }
    if (id === 'eraser') { b.puzzle = makePuzzle(b.spell); b.hintUsed = false; b.input = ''; b.choice = null; sfx.erase(); M.say('The board is wiped. Here is a new puzzle.'); }
    if (id === 'jamu') syncHearts();
    refreshStatus();
    refreshKit();
    if (id === 'eraser' || id === 'double') refreshPanel(id === 'eraser' ? 'panel' : false);
  }
  function finish(won) {
    const b = state.battle, s = state.save, i = b.realm;
    let unlockedNow = false, firstWin = false, rankUp = null;
    const drops = [], before = M.cleared(), stars = Math.max(1, 3 - Math.max(0, (b.startHearts ?? b.maxHearts) - b.hearts));
    if (won) {
      s.stars[i] = Math.max(s.stars[i], stars);
      s.beaten[i] = (s.beaten[i] || 0) + 1;
      if (i + 1 < REALMS.length && s.unlocked < i + 2) { s.unlocked = i + 2; unlockedNow = true; }
      const ci = M.CHAPTERS.findIndex(c => c.last === i);
      if (ci >= 0 && !s[M.CHAPTERS[ci].key]) {
        s[M.CHAPTERS[ci].key] = true; firstWin = true; state.finalChapter = ci;
        if (ci + 1 < M.CHAPTERS.length && s.unlocked < M.CHAPTERS[ci + 1].first + 1) s.unlocked = M.CHAPTERS[ci + 1].first + 1;
      }
      b.stolen.forEach(id => { inv()[id] = Math.min(MAX_ITEM, (inv()[id] || 0) + 1); });
      for (let n = 0; n < b.k.prizes; n++) { const d = grantRandom(); if (d) drops.push(d); }
      const after = M.cleared();
      if (after > before) {
        s.jobPending = true;
        if (after >= REALMS.length) s.job = 'grand';
        rankUp = { before, after };
      }
      sfx.win();
    } else sfx.lose();
    s.hurt = won ? Math.max(0, b.maxHearts - b.hearts) : 0;
    M.persist();
    state.result = { realm: i, won, stars: won ? stars : 0, cast: b.cast, misses: b.misses, hints: b.hints, hpLeft: b.hp, unlockedNow, drops, rankUp, returned: won ? b.stolen.slice() : [] };
    state.battle = null;
    M.go(firstWin ? 'final' : 'result');
  }

  Object.assign(M.actions, {
    fight: () => { newBattle(state.realm); M.go('battle'); },
    quitBattle: () => { syncHearts(); state.battle = null; M.go('map'); },
    chooseSpell: arg => chooseSpell(Number(arg)),
    key: arg => press(arg),
    choose: arg => choose(Number(arg)),
    cast: () => cast(),
    next: () => next(),
    hint: () => {
      const b = state.battle;
      if (!b || b.phase !== 'puzzle' || b.hintUsed || has('gusty')) return;
      b.hintUsed = true; b.hints++;
      refreshPanel(false);
    },
    itemInfo: arg => {
      const b = state.battle;
      if (!b) return;
      b.info = arg && b.info !== arg ? arg : null;
      refreshKit();
    },
    useItem: arg => useItem(arg),
    retry: () => retry(),
    swap: () => swap()
  });

  document.addEventListener('keydown', e => {
    const b = state.battle;
    if (state.screen !== 'battle' || !b || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (b.phase === 'puzzle') {
      const p = b.puzzle;
      if (p.input === 'number') {
        if (/^[0-9]$/.test(e.key)) { e.preventDefault(); press(e.key); }
        else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); press('del'); }
        else if (e.key === 'Enter') { e.preventDefault(); cast(); }
      } else {
        const n = Number(e.key);
        if (n >= 1 && n <= p.choices.length) { e.preventDefault(); choose(p.choices[n - 1].id); }
        else if (e.key === 'Enter') { e.preventDefault(); if (b.choice !== null) cast(); }
      }
    } else if (b.phase === 'spell' && /^[1-3]$/.test(e.key)) {
      e.preventDefault(); chooseSpell(Number(e.key) - 1);
    } else if (b.phase === 'feedback' && e.key === 'Enter') {
      e.preventDefault(); next();
    }
  });

  // Small hook for automated play-testing
  window.__mim = { state, cast, press, choose, chooseSpell, next, useItem, retry, swap };
  M.boot();
})();
