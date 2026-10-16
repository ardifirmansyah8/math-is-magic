/* Math Is Magic: game shell (state, saving, sound, title, wardrobe, map, results) */
(function () {
  'use strict';
  const Pz = window.Puzzles, Art = window.Art, Jobs = window.Jobs, esc = Pz.esc;

  const REALMS = [
    { name: 'Whispering Woods', monster: 'lumutok', foe: 'Lumutok', title: 'the Mossback Brute', kind: 'Leaf Beast', weak: 'pattern', origin: 'from "lumut", Indonesian for moss', hp: 6, tiers: [1, 2, 3], pool: ['pattern', 'potion', 'odd', 'picture', 'sums', 'counting'], blurb: 'A grumpy shell-backed beast with a whole garden growing on its back. It tramples every neat pattern it finds.' },
    { name: 'Crystal Caves', monster: 'kristawar', foe: 'Kristawar', title: 'the Crystal Glider', kind: 'Cave Flyer', weak: 'magic', origin: 'from "kristal" and "kelelawar", Indonesian for crystal and bat', hp: 8, tiers: [1, 2, 3], pool: ['magic', 'pattern', 'backwards', 'counting', 'picture', 'sums'], blurb: 'It glides through the dark on crystal wings, humming magic squares to itself.' },
    { name: 'Clocktower', monster: 'detikron', foe: 'Detikron', title: 'the Clockwork Colossus', kind: 'Gear Golem', weak: 'calendar', origin: 'from "detik", Indonesian for a second of time', hp: 10, tiers: [2, 3, 4], pool: ['calendar', 'backwards', 'legs', 'potion', 'pattern', 'magic'], blurb: 'A clockwork giant that is always exactly one hour late, and very cross about it.' },
    { name: 'Ember Marsh', monster: 'katagma', foe: 'Katagma', title: 'the Magma Croaker', kind: 'Lava Toad', weak: 'odd', origin: 'from "katak", Indonesian for frog, and magma', hp: 12, tiers: [3, 4, 5], pool: ['legs', 'counting', 'magic', 'sums', 'odd', 'potion', 'calendar'], blurb: 'A volcano toad that only croaks in prime numbers. Very loudly.' },
    { name: 'Moonspire', monster: 'nolnaga', foe: 'Nolnaga', title: 'the Zero Devourer', kind: 'Ancient Dragon', weak: 'sums', origin: 'from "nol" and "naga", Indonesian for zero and dragon', hp: 15, tiers: [3, 4, 5], pool: Pz.CLASSIC_TYPES.slice(), blurb: 'An ancient crowned naga that swallowed every zero in the kingdom.' },
    { name: 'Coral Reef', monster: 'durinautus', foe: 'Durinautus', title: 'the Thornball of the Reef', kind: 'Reef Puffer', weak: 'mystery', origin: 'from "duri", Indonesian for thorn', hp: 14, tiers: [3, 4, 5], pool: ['mystery', 'area', 'pattern', 'potion', 'legs', 'sums', 'odd'], blurb: 'Its coral spikes are so tough that small spells bounce right off.', traits: ['armored'] },
    { name: 'Rice Terraces', monster: 'gagaklepto', foe: 'Gagaklepto', title: 'the Shiny Snatcher', kind: 'Thief Bird', weak: 'counting', origin: 'from "gagak", Indonesian for crow, and "klepto" for a thief', hp: 15, tiers: [3, 4, 5], pool: ['area', 'counting', 'ages', 'magic', 'calendar', 'picture'], blurb: 'A masked crow that steals anything shiny, especially power-ups.', traits: ['thief'] },
    { name: 'Komodo Isle', monster: 'komodrax', foe: 'Komodrax', title: 'the Island Knight', kind: 'Armoured Lizard', weak: 'ages', origin: 'from the Komodo dragons of Indonesia', hp: 16, tiers: [3, 4, 5], pool: ['ages', 'mystery', 'backwards', 'legs', 'potion', 'magic'], blurb: 'A giant knight lizard that grows back stronger every time you slip up.', traits: ['regrow'] },
    { name: 'Thunder Peaks', monster: 'gunturawa', foe: 'Gunturawa', title: 'the Storm Grumbler', kind: 'Storm Spirit', weak: 'area', origin: 'from "guntur" and "awan", Indonesian for thunder and cloud', hp: 17, tiers: [3, 4, 5], pool: ['mystery', 'area', 'ages', 'counting', 'sums', 'calendar', 'pattern'], blurb: 'A thundercloud spirit that huffs and puffs every hint away.', traits: ['gusty'] },
    { name: 'Starfall Observatory', monster: 'kakacau', foe: 'Kakacau', title: 'the Star Scrambler', kind: 'Cosmic Ancient', weak: 'potion', origin: 'from "kacau", Indonesian for muddled', hp: 20, tiers: [3, 4, 5], pool: Pz.TYPES.slice(), blurb: 'A cosmic manta that swims through the night sky, scrambling every number it passes.', traits: ['armored', 'regrow'] }
  ];
  const TOPICS = { pattern: 'Number patterns', magic: 'Magic squares', potion: 'Potion algebra', legs: 'Heads and legs', calendar: 'Calendar and clock', backwards: 'Working backwards', sums: 'Clever sums', counting: 'Counting', odd: 'Odd one out', picture: 'Picture patterns', mystery: 'Mystery numbers', area: 'Shapes', ages: 'Age puzzles' };
  const TRAITS = {
    armored: { name: 'Armoured', icon: 'shield', text: 'Your weakest spell bounces off its armour. Use your two stronger spells.' },
    thief: { name: 'Thief', icon: 'rate', text: 'Each wrong answer lets it snatch one of your power-ups. Win the fight to get them all back.' },
    regrow: { name: 'Regrows', icon: 'heart', text: 'Each wrong answer heals it by 1 hit point.' },
    gusty: { name: 'Gusty', icon: 'bulb', text: 'Its wind blows hints away, so there are no hints in this fight.' }
  };
  const CHAPTERS = [
    { title: 'The Stolen Zeros', first: 0, last: 4, key: 'champion', rank: 'Champion of Numbers', deed: 'defeated Nolnaga, the Zero Devourer, and brought every zero back to the Kingdom of Numbers.' },
    { title: 'The Muddled Sky', first: 5, last: 9, key: 'champion2', rank: 'Grand Mage', deed: 'outsmarted Kakacau, the Star Scrambler, and put every number in the sky back where it belongs.' }
  ];
  const SPELLS = [
    { name: 'Spark', power: 1, icon: 'spark', color: 'var(--yellow)' },
    { name: 'Flare', power: 2, icon: 'flare', color: 'var(--coral)' },
    { name: 'Comet', power: 3, icon: 'comet', color: 'var(--blue)' }
  ];
  const MAX_HEARTS = 3;
  const HAIR_NAMES = ['black', 'dark brown', 'brown', 'ginger', 'pink', 'lilac', 'blue', 'mint', 'yellow', 'white'];
  const SKIN_NAMES = ['light', 'light medium', 'medium', 'medium dark', 'dark'];

  /* ---------- Saving ---------- */
  const SAVE_KEY = 'math-is-magic-v1';
  const STARTER_KIT = () => ({ shield: 1, jamu: 1, double: 1, eraser: 1 });
  const freshSave = () => ({ hero: Object.assign({}, Art.DEFAULT_HERO), stars: REALMS.map(() => 0), unlocked: 1, sound: true, champion: false, champion2: false, made: false, items: STARTER_KIT(), job: null, jobPending: false, beaten: REALMS.map(() => 0) });
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        const save = Object.assign(freshSave(), s, {
          hero: Object.assign({}, Art.DEFAULT_HERO, s.hero || {}),
          items: Object.assign({ shield: 0, jamu: 0, double: 0, eraser: 0 }, s.items || STARTER_KIT()),
          stars: REALMS.map((_, i) => (s.stars && s.stars[i]) || 0),
          beaten: REALMS.map((_, i) => (s.beaten && s.beaten[i]) || ((s.stars && s.stars[i]) ? 1 : 0))
        });
        // Players who beat the dragon before Chapter 2 existed get it unlocked
        if (save.champion && save.unlocked < CHAPTERS[1].first + 1) save.unlocked = CHAPTERS[1].first + 1;
        // Players from before jobs existed get to pick one
        const done = save.stars.filter(x => x > 0).length;
        if (done >= REALMS.length && !save.job) save.job = 'grand';
        if (!save.job && done >= 1) save.jobPending = true;
        return save;
      }
    } catch (e) { /* storage blocked: play without saving */ }
    return freshSave();
  }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state.save)); } catch (e) { /* ignore */ } }

  const state = { save: freshSave(), screen: 'title', realm: 0, battle: null, result: null, confirmReset: false };

  /* ---------- Sound (synthesised, starts after the first tap) ---------- */
  const sfx = (() => {
    let ctx = null;
    const ac = () => {
      if (!state.save.sound) return null;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
      } catch (e) { return null; }
    };
    function tone(freq, dur, o) {
      const c = ac(); if (!c) return;
      o = o || {};
      const t = c.currentTime + (o.at || 0), osc = c.createOscillator(), g = c.createGain();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(freq, t);
      if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + o.slide), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.vol || 0.12, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(c.destination);
      osc.start(t); osc.stop(t + dur + 0.05);
    }
    function noise(dur, o) {
      const c = ac(); if (!c) return;
      o = o || {};
      const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      src.buffer = buf; f.type = 'bandpass'; f.frequency.value = o.freq || 1000; f.Q.value = 0.9; g.gain.value = o.vol || 0.12;
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start(c.currentTime + (o.at || 0));
    }
    return {
      tap: () => tone(700, 0.05, { type: 'triangle', vol: 0.04 }),
      cast: p => { noise(0.4, { freq: 900 + p * 350, vol: 0.1 }); tone(320, 0.38, { type: 'sawtooth', vol: 0.035, slide: 500 + p * 250 }); },
      hit: () => { noise(0.2, { freq: 320, vol: 0.22 }); tone(150, 0.22, { type: 'square', vol: 0.05, slide: -70 }); },
      correct: () => [523, 659, 784].forEach((f, i) => tone(f, 0.2, { type: 'triangle', vol: 0.12, at: i * 0.09 })),
      wrong: () => { tone(233, 0.26, { type: 'square', vol: 0.05, slide: -90 }); tone(175, 0.32, { type: 'square', vol: 0.045, at: 0.13, slide: -60 }); },
      win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.55 : 0.16, { type: 'triangle', vol: 0.12, at: i * 0.12 })),
      lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.09, at: i * 0.18 })),
      shield: () => [880, 1175].forEach((f, i) => tone(f, 0.3, { type: 'sine', vol: 0.09, at: i * 0.08 })),
      heal: () => [392, 523, 659, 880].forEach((f, i) => tone(f, 0.16, { type: 'sine', vol: 0.1, at: i * 0.07 })),
      power: () => tone(260, 0.45, { type: 'triangle', vol: 0.1, slide: 900 }),
      erase: () => noise(0.32, { freq: 2200, vol: 0.14 }),
      loot: () => [1319, 1568, 2093].forEach((f, i) => tone(f, 0.14, { type: 'triangle', vol: 0.07, at: 0.25 + i * 0.07 }))
    };
  })();

  /* ---------- Shared bits ---------- */
  const board = () => document.getElementById('board');
  const soundBtn = () => `<button class="icon-btn" data-act="sound" aria-pressed="${state.save.sound}" aria-label="Sound">${Art.icon(state.save.sound ? 'sound' : 'mute')}</button>`;
  const rateHTML = n => `<span class="rate" role="img" aria-label="${n} of 3 stars">${[0, 1, 2].map(i => Art.icon(i < n ? 'rate' : 'rate-empty')).join('')}</span>`;
  const totalStars = () => state.save.stars.reduce((a, b) => a + b, 0);
  const cleared = () => state.save.stars.filter(x => x > 0).length;
  const an = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
  const nextStage = () => { const s = state.save; for (let i = 0; i < REALMS.length; i++) if (i < s.unlocked && !s.stars[i]) return i; return -1; };
  const myTitle = () => Jobs.title(state.save.job, cleared());
  const myIcon = () => (state.save.job ? Jobs.JOBS[state.save.job].icon : 'spark');
  const heroName = () => (state.save.hero.name || '').trim() || Art.DEFAULT_HERO.name || 'Mage';
  function say(text) { const sr = document.getElementById('sr'); if (sr) { sr.textContent = ''; setTimeout(() => { sr.textContent = text; }, 30); } }

  const SCRIBBLES = [
    ['1 + 2 + … + 100 = 5050', 3, 4, -5], ['3² + 4² = 5²', 72, 9, 5], ['7 × 8 = 56', 80, 46, -4], ['½ + ½ = 1', 4, 50, 3],
    ['π ≈ 3.14', 10, 86, -3], ['2, 3, 5, 7, 11, 13…', 56, 91, 4], ['9 × 9 = 81', 84, 72, -6]
  ].map(([t, x, y, r]) => `<span style="left:${x}%;top:${y}%;transform:rotate(${r}deg)">${t}</span>`).join('');

  /* ---------- Screens ---------- */
  const screens = {};

  screens.title = () => {
    const s = state.save;
    const actions = s.made
      ? `<p class="title-rank">${Art.icon(myIcon())}${esc(myTitle())}</p>
         <button class="btn btn-primary" data-act="toMap">Continue as ${esc(heroName())}</button>
         <button class="btn" data-act="toWardrobe">Change outfit</button>` +
        (state.confirmReset
          ? `<div class="confirm"><p>Start over? This erases every star.</p><div class="row" style="justify-content:center"><button class="btn btn-small" data-act="doReset">Yes, start over</button><button class="btn btn-small btn-ghost" data-act="cancelReset">Keep my stars</button></div></div>`
          : `<button class="btn btn-ghost" data-act="askReset">Start over</button>`)
      : `<button class="btn btn-primary" data-act="start">Start the adventure</button>`;
    return `<section class="screen title-screen" aria-labelledby="t-title"><div class="wrap">
      <div class="scribbles" aria-hidden="true">${SCRIBBLES}</div>
      <div class="title-top">${soundBtn()}</div>
      <p class="eyebrow">A chalkboard adventure</p>
      <h1 id="t-title" class="display title-word">Math Is <em>Magic</em></h1>
      <p class="hand">Every spell is a puzzle. Solve it to cast it.</p>
      <div class="title-art">${Art.mage(s.hero, 'idle')}${Art.monster('nolnaga', '', 'Nolnaga')}</div>
      <div class="title-actions">${actions}</div>
    </div></section>`;
  };

  function wardrobeOptions() {
    const H = state.save.hero;
    const sw = (key, val, bg, label) => `<button class="swatch" style="background:${bg}" data-act="set" data-arg="${key}:${val}" aria-pressed="${H[key] === val}" aria-label="${label}"></button>`;
    return `
      <div class="opt"><label class="opt-label" for="hero-name">Name</label>
        <input id="hero-name" class="name-input" maxlength="14" autocomplete="off" spellcheck="false" placeholder="Type your name" value="${esc(H.name)}"></div>
      <div class="opt"><span class="opt-label" id="lbl-gender">Gender</span>
        <div class="pills" role="group" aria-labelledby="lbl-gender">${[['girl', 'Girl'], ['boy', 'Boy']].map(([id, label]) => `<button class="pill" data-act="set" data-arg="gender:${id}" aria-pressed="${H.gender === id}">${label}</button>`).join('')}</div></div>
      <div class="opt"><span class="opt-label" id="lbl-robe">Robe</span>
        <div class="swatches" role="group" aria-labelledby="lbl-robe">${Art.ROBES.map(r => sw('robe', r, `var(--${r})`, `${r} robe`)).join('')}</div></div>
      <div class="opt"><span class="opt-label" id="lbl-hair">Hair</span>
        <div class="pills" role="group" aria-labelledby="lbl-hair">${Art.stylesFor(H.gender).map(st => `<button class="pill" data-act="set" data-arg="hair:${st.id}" aria-pressed="${H.hair === st.id}">${st.label}</button>`).join('')}</div></div>
      <div class="opt"><span class="opt-label" id="lbl-hc">${H.hair === 'hijab' ? 'Hijab colour' : 'Hair colour'}</span>
        <div class="swatches" role="group" aria-labelledby="lbl-hc">${Art.HAIR_COLORS.map((c, i) => sw('hairColor', c, c, HAIR_NAMES[i])).join('')}</div></div>
      <div class="opt"><span class="opt-label" id="lbl-skin">Skin</span>
        <div class="swatches" role="group" aria-labelledby="lbl-skin">${Art.SKINS.map((c, i) => sw('skin', c, c, SKIN_NAMES[i] + ' skin')).join('')}</div></div>
      <div class="opt"><span class="opt-label" id="lbl-extra">Extras</span>
        <div class="pills" role="group" aria-labelledby="lbl-extra">
          <button class="pill" data-act="toggle" data-arg="glasses" aria-pressed="${H.glasses}">Glasses</button>
          <button class="pill" data-act="toggle" data-arg="hat" aria-pressed="${H.hat}">Wizard hat</button></div></div>
      <div class="row"><button class="btn btn-primary" data-act="wardDone">${state.save.made ? 'Done' : 'Ready!'}</button></div>`;
  }

  screens.wardrobe = () => `<section class="screen" aria-labelledby="w-title"><div class="wrap">
      <div class="topbar"><button class="icon-btn" data-act="wardBack" aria-label="Back">${Art.icon('back')}</button><h2 id="w-title" class="h2 grow">Dress your mage</h2></div>
      <div class="ward">
        <div class="ward-preview" id="ward-preview">${Art.mage(state.save.hero, 'idle')}</div>
        <div class="ward-opts" id="ward-opts">${wardrobeOptions()}</div>
      </div></div></section>`;

  function refreshWardrobe() {
    const prev = document.getElementById('ward-preview');
    if (prev) prev.innerHTML = Art.mage(state.save.hero, 'idle');
    const H = state.save.hero;
    document.querySelectorAll('#ward-opts [data-act="set"]').forEach(b => {
      const [k, v] = b.dataset.arg.split(':');
      b.setAttribute('aria-pressed', String(H[k] === v));
    });
    document.querySelectorAll('#ward-opts [data-act="toggle"]').forEach(b => b.setAttribute('aria-pressed', String(!!H[b.dataset.arg])));
    const lbl = document.getElementById('lbl-hc');
    if (lbl) lbl.textContent = H.hair === 'hijab' ? 'Hijab colour' : 'Hair colour';
  }

  screens.map = () => {
    const s = state.save, total = totalStars(), max = REALMS.length * 3;
    const stop = (r, i) => {
      const open = i < s.unlocked, stars = s.stars[i];
      const cls = !open ? 'locked' : stars ? 'done' : '';
      const row = open
        ? `${rateHTML(stars)}<button class="btn btn-small ${stars ? '' : 'btn-primary'}" data-act="pickRealm" data-arg="${i}">${stars ? 'Play again' : 'Fight'}</button>`
        : `<span class="locked-note">${Art.icon('lock')} Beat realm ${i} first</span>`;
      return `<li class="stop ${cls}"><span class="stop-num" aria-hidden="true">${i + 1}</span>${Art.monster(r.monster, '', r.foe)}
        <div class="stop-info"><h4 class="h3">${r.name}</h4><p class="stop-meta">${r.foe} · ${r.hp} hit points${r.traits ? ' · ' + r.traits.map(t => TRAITS[t].name).join(', ') : ''}</p><div class="stop-row">${row}</div></div></li>`;
    };
    const chapters = CHAPTERS.map((c, ci) => {
      const open = c.first < s.unlocked;
      return `<section class="chapter${open ? '' : ' chapter-locked'}" aria-labelledby="ch-${ci}">
        <div class="chapter-head"><span class="eyebrow">Chapter ${ci + 1}</span><h3 id="ch-${ci}" class="h3">${c.title}</h3>
        ${open ? '' : `<p class="locked-note">${Art.icon('lock')} Beat Nolnaga to open this chapter</p>`}</div>
        <ol class="stops">${REALMS.slice(c.first, c.last + 1).map((r, j) => stop(r, c.first + j)).join('')}</ol></section>`;
    }).join('');
    const story = !s.champion
      ? 'Nolnaga, the Zero Devourer, has swallowed every zero in the kingdom! Beat the four monsters on the way, then face Nolnaga at Moonspire.'
      : !s.champion2
        ? 'The zeros are back! But Kakacau, the Star Scrambler, is mixing up the numbers in the sky. Beat the four monsters on the way, then face Kakacau at Starfall Observatory.'
        : `${esc(heroName())} is a Grand Mage! Play any realm again to collect every star.`;
    const c = cleared(), t = Jobs.tierFor(c), J = s.job ? Jobs.JOBS[s.job] : null, k = Jobs.skills(s.job, c);
    const me = `<div class="me-strip${s.jobPending ? ' is-pending' : ''}">${Art.icon(myIcon())}
      <div class="me-text"><b>${esc(heroName())} · ${esc(myTitle())}</b>
        <span>${J ? `${J.skill}: ${J.desc(t)}` : 'Clear stage 1 to choose your first job.'}</span>
        <span class="dim">${k.maxHearts} hearts · Skill level ${t}</span></div>
      ${c >= 1 ? `<button class="btn btn-small${s.jobPending ? ' btn-primary' : ''}" data-act="openJobs">${s.jobPending ? 'Choose your job' : 'Change job'}</button>` : ''}</div>`;
    return `<section class="screen" aria-labelledby="m-title"><div class="wrap wrap-narrow">
      <div class="topbar"><button class="icon-btn" data-act="toTitle" aria-label="Back to the title screen">${Art.icon('back')}</button>
        <h2 id="m-title" class="h2 grow">Kingdom of Numbers</h2>
        <span class="star-count" role="img" aria-label="${total} of ${max} stars">${Art.icon('rate')}${total}/${max}</span></div>
      <p class="story hand">${story}</p>
      ${me}
      <div class="inv" role="group" aria-label="Your power-ups"><span class="eyebrow">Power-ups</span>${Object.keys(window.MIM.ITEMS).map(id => `<span title="${window.MIM.ITEMS[id].name}">${Art.icon(window.MIM.ITEMS[id].icon)}<span class="sr-only">${window.MIM.ITEMS[id].name}</span>×${s.items[id] || 0}</span>`).join('')}</div>
      ${chapters}
      <div class="map-foot row"><button class="btn btn-small" data-act="openNotebook">${Art.icon('book')} Monster notebook</button><button class="btn btn-small" data-act="openParents">Parent page</button><button class="btn btn-small" data-act="toWardrobe">Change outfit</button>${soundBtn()}</div>
    </div></section>`;
  };

  screens.intro = () => {
    const r = REALMS[state.realm], s = state.save, c = cleared(), t = Jobs.tierFor(c), k = Jobs.skills(s.job, c), J = s.job ? Jobs.JOBS[s.job] : null;
    return `<section class="screen" aria-labelledby="i-title"><div class="wrap wrap-narrow">
      <div class="topbar"><button class="icon-btn" data-act="toMap" aria-label="Back to the map">${Art.icon('back')}</button><span class="eyebrow grow">Realm ${state.realm + 1} · ${r.name}</span></div>
      <div class="intro enter">${Art.monster(r.monster, 'idle', r.foe)}
        <h2 id="i-title" class="h2">${r.foe}</h2>
        <p class="beast-title">${r.title} · ${r.kind}</p>
        <p class="hand">${r.blurb}</p>
        <p class="weak-chip">${Art.icon('rate')}Weak spot: ${TOPICS[r.weak]} puzzles hit for +1</p>
        ${r.traits ? `<div class="traits"><p class="eyebrow">Special tricks</p>${r.traits.map(t => `<p class="trait">${Art.icon(TRAITS[t].icon)}<span><b>${TRAITS[t].name}.</b> ${TRAITS[t].text}</span></p>`).join('')}</div>` : ''}
        <ul class="rules">
          ${J ? `<li>${Art.icon(J.icon)}<span>You are ${an(esc(myTitle()))}. <b>${J.skill}:</b> ${J.desc(t)}</span></li>` : ''}
          <li>${Art.icon('spark')}<span>Pick a spell. Stronger spells hit harder but come with harder puzzles.</span></li>
          <li>${Art.icon('rate')}<span>Solve the puzzle to cast the spell. Three right in a row gives every spell +1 power until you miss.</span></li>
          <li>${Art.icon('heart')}<span>A wrong answer lets ${r.foe} hit back. You have ${k.maxHearts} hearts.</span></li>
          <li>${Art.icon('bulb')}<span>Stuck? A hint helps${k.freeHints ? ', and your job makes hints free.' : ', but the spell loses 1 power.'}</span></li>
          <li>${Art.icon('shield')}<span>Power-ups: you find one for every ${k.dropEvery} right answers in a row and for every win. Tap one in battle to see what it does.</span></li>
        </ul>
        <button class="btn btn-primary" data-act="fight">Fight ${r.foe}!</button>
      </div></div></section>`;
  };

  screens.result = () => {
    const res = state.result, r = REALMS[res.realm];
    if (res.won) {
      const next = res.realm + 1 < REALMS.length;
      const line = res.stars === 3 ? 'Perfect! You did not lose a single heart.'
        : res.stars === 2 ? 'Great work. You lost one heart.'
          : 'You did it! Win without losing a heart to earn all 3 stars.';
      return `<section class="screen" aria-labelledby="r-title"><div class="wrap wrap-narrow"><div class="result enter">
        <p class="eyebrow">Realm ${res.realm + 1} · ${r.name}</p>
        <h2 id="r-title" class="h2">${r.foe} is beaten!</h2>
        ${Art.mage(state.save.hero, 'idle')}
        ${rateHTML(res.stars)}
        <p class="fb-line">${line}</p>
        <p class="dim">${res.cast} spells cast · ${res.misses} ${res.misses === 1 ? 'mistake' : 'mistakes'}${res.hints ? ` · ${res.hints} ${res.hints === 1 ? 'hint' : 'hints'}` : ''}</p>
        ${res.returned && res.returned.length ? `<p class="loot">${Art.icon('rate')}<span>${r.foe} dropped everything it stole: ${res.returned.map(id => window.MIM.ITEMS[id].name).join(', ')}.</span></p>` : ''}
        ${res.drops && res.drops.length ? `<p class="loot">${Art.icon(window.MIM.ITEMS[res.drops[0]].icon)}<span>Victory prize${res.drops.length > 1 ? 's' : ''}: ${res.drops.map(id => window.MIM.ITEMS[id].a + ' ' + window.MIM.ITEMS[id].name).join(' and ')}!</span></p>` : ''}
        ${res.rankUp ? `<div class="rankup-note"><p class="eyebrow">Rank up!</p><p>${rankUpText(res.rankUp)}</p></div>` : ''}
        ${res.unlockedNow && next && !res.rankUp ? `<p class="hand">${REALMS[res.realm + 1].name} is open now.</p>` : ''}
        <div class="row">${res.rankUp ? '<button class="btn btn-primary" data-act="openJobs">Choose your job</button>'
          : next ? `<button class="btn btn-primary" data-act="pickRealm" data-arg="${res.realm + 1}">Next realm</button>` : ''}<button class="btn" data-act="toMap">Map</button></div>
      </div></div></section>`;
    }
    return `<section class="screen" aria-labelledby="r-title"><div class="wrap wrap-narrow"><div class="result lost enter">
      <p class="eyebrow">Realm ${res.realm + 1} · ${r.name}</p>
      <h2 id="r-title" class="h2">${r.foe} won this round</h2>
      ${Art.monster(r.monster, 'idle', r.foe)}
      <p class="fb-line">Every mistake showed you a new trick. Have another go!</p>
      <p class="dim">${res.cast} spells cast · ${r.foe} had ${res.hpLeft} of ${r.hp} hit points left</p>
      <div class="row"><button class="btn btn-primary" data-act="fight">Try again</button><button class="btn" data-act="toMap">Map</button></div>
    </div></div></section>`;
  };

  screens.final = () => {
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const ci = state.finalChapter || 0, ch = CHAPTERS[ci];
    const chStars = state.save.stars.slice(ch.first, ch.last + 1).reduce((a, b) => a + b, 0);
    return `<section class="screen" aria-labelledby="c-title"><div class="wrap wrap-narrow"><div class="cert enter">
      <p class="eyebrow">Certificate of Magic</p>
      ${Art.mage(state.save.hero, 'idle')}
      <p class="dim">This certifies that</p>
      <h2 id="c-title" class="cert-name">${esc(heroName())}</h2>
      <p class="fb-line">${ch.deed}</p>
      <p class="h3">${ch.rank}</p>
      <div class="cert-meta"><span>Chapter ${ci + 1}: ${ch.title}</span><span>${chStars} of 15 stars</span><span>${date}</span></div>
      <p class="cert-sign">Signed by Grandmage Bintang</p>
      ${ci === 0 ? `<p class="hand">A new adventure is waiting. Chapter 2, ${CHAPTERS[1].title}, is open!</p>
      <div class="row" style="justify-content:center">${state.save.jobPending ? '<button class="btn btn-primary" data-act="openJobs">Choose your job</button>' : `<button class="btn btn-primary" data-act="pickRealm" data-arg="${CHAPTERS[1].first}">Start Chapter 2</button>`}<button class="btn" data-act="toMap">Map</button></div>`
        : `<div class="row" style="justify-content:center">${state.save.jobPending ? '<button class="btn btn-primary" data-act="openJobs">See your Grand Mage powers</button>' : ''}<button class="btn${state.save.jobPending ? '' : ' btn-primary'}" data-act="toMap">Back to the map</button></div>`}
    </div></div></section>`;
  };

  function rankUpText(ru) {
    const bits = [];
    const newJobs = Jobs.ORDER.filter(id => Jobs.JOBS[id].unlock === ru.after).map(id => Jobs.JOBS[id].school);
    if (ru.after >= REALMS.length) return 'You are a Grand Mage now, the highest rank of all!';
    if (ru.before === 0) bits.push('You are not a trainee any more. Time to choose a job!');
    if (newJobs.length && ru.before > 0) bits.push(`New job unlocked: ${newJobs.join(', ')}.`);
    if (Jobs.tierFor(ru.after) > Jobs.tierFor(ru.before)) bits.push(`Your skills grow to level ${Jobs.tierFor(ru.after)}.`);
    if (Jobs.baseHearts(ru.after) > Jobs.baseHearts(ru.before)) bits.push(`You now have ${Jobs.baseHearts(ru.after)} hearts.`);
    if (!bits.length) bits.push('You can pick a new job for the next stage, or keep your current one.');
    return bits.join(' ');
  }

  /* ---------- Monster notebook ---------- */
  screens.notebook = () => {
    const s = state.save;
    const cards = REALMS.map((r, i) => {
      if (i >= s.unlocked) {
        return `<article class="beast is-unknown">${Art.monster(r.monster, 'silhouette', 'Unknown monster')}
          <div class="beast-info"><p class="eyebrow">Stage ${i + 1}</p><h3 class="h3">???</h3><p class="dim">Reach stage ${i + 1} to learn about this monster.</p></div></article>`;
      }
      const n = s.beaten[i] || 0;
      const tricks = (r.traits || []).map(t => `<li><b>${TRAITS[t].name}.</b> ${TRAITS[t].text}</li>`).join('');
      return `<article class="beast">${Art.monster(r.monster, '', r.foe)}
        <div class="beast-info">
          <p class="eyebrow">${r.kind} · Stage ${i + 1}</p>
          <h3 class="h3">${r.foe}</h3><p class="beast-title">${r.title}</p>
          <dl class="beast-facts">
            <div><dt>Habitat</dt><dd>${r.name}</dd></div>
            <div><dt>Hit points</dt><dd>${r.hp}</dd></div>
            <div><dt>Weak spot</dt><dd>${TOPICS[r.weak]} puzzles (+1 damage)</dd></div>
            <div><dt>Beaten</dt><dd>${n ? `${n} time${n === 1 ? '' : 's'}` : 'Not yet'}${n ? ' ' + rateHTML(s.stars[i]) : ''}</dd></div>
          </dl>
          ${tricks ? `<ul class="beast-tricks">${tricks}</ul>` : ''}
          <p class="beast-origin">Name ${r.origin}.</p>
        </div></article>`;
    }).join('');
    return `<section class="screen" aria-labelledby="n-title"><div class="wrap wrap-narrow">
      <div class="topbar"><button class="icon-btn" data-act="toMap" aria-label="Back to the map">${Art.icon('back')}</button><h2 id="n-title" class="h2 grow">Monster notebook</h2></div>
      <p class="dim">Every monster has a weak spot. Solve a puzzle of that kind and your spell hits for 1 extra damage.</p>
      <div class="beasts">${cards}</div>
    </div></section>`;
  };

  /* ---------- Job Hall ---------- */
  screens.jobs = () => {
    const s = state.save, c = cleared(), t = Jobs.tierFor(c), k = Jobs.skills(s.job, c);
    const ids = (c >= REALMS.length ? ['grand'] : []).concat(Jobs.ORDER);
    const nextTier = c < 3 ? 3 : c < 5 ? 5 : c < 8 ? 8 : null;
    const cards = ids.map(id => {
      const J = Jobs.JOBS[id], locked = c < J.unlock, cur = s.job === id, name = J.titles[t - 1];
      const action = locked ? `<p class="locked-note">${Art.icon('lock')} Unlocks after stage ${J.unlock}</p>`
        : cur ? '<p class="job-current">Your job</p>'
          : `<button class="btn btn-small" data-act="pickJob" data-arg="${id}">Choose ${name}</button>`;
      return `<article class="job job-${id}${cur ? ' is-current' : ''}${locked ? ' is-locked' : ''}">
        <div class="job-top">${Art.icon(locked ? 'lock' : J.icon)}<div><p class="eyebrow">${J.school}${id === 'grand' ? ' rank' : ' school'}</p><h3 class="h3">${locked ? J.school + ' job' : name}</h3></div></div>
        <p class="job-skill">${locked ? J.blurb : `<b>${J.skill}.</b> ${J.desc(t)}`}</p>
        ${!locked && nextTier && id !== 'grand' ? `<p class="job-next">Becomes ${J.titles[Jobs.tierFor(nextTier) - 1]} after stage ${nextTier}</p>` : ''}
        ${action}</article>`;
    }).join('');
    const ns = nextStage();
    const cta = s.job
      ? `<button class="btn btn-primary" data-act="jobsDone">${ns >= 0 ? `Next stage: ${REALMS[ns].name}` : 'Back to the map'}</button>`
      : '<button class="btn btn-ghost" data-act="toMap">Decide later</button>';
    return `<section class="screen" aria-labelledby="j-title"><div class="wrap wrap-narrow">
      <div class="topbar"><button class="icon-btn" data-act="toMap" aria-label="Back to the map">${Art.icon('back')}</button>
        <div class="grow"><p class="eyebrow">${s.jobPending ? 'Rank up!' : 'Job Hall'}</p><h2 id="j-title" class="h2">${s.jobPending ? (c >= REALMS.length ? 'Grand Mage!' : 'Choose your job') : 'Job Hall'}</h2></div></div>
      <div class="power-box"><div>${Art.icon('heart')}<b>${Jobs.baseHearts(c)}</b><span>hearts</span></div><div>${Art.icon('rate')}<b>${c}</b><span>stages cleared</span></div><div>${Art.icon('spark')}<b>${t}</b><span>skill level</span></div></div>
      <p class="dim">Each job has its own skill. Skills get stronger as you clear more stages. You can switch jobs here any time.</p>
      <div class="jobs">${cards}</div>
      <div class="row">${cta}</div>
    </div></section>`;
  };

  /* ---------- Router ---------- */
  function render() {
    const fn = screens[state.screen] || screens.title;
    board().innerHTML = fn();
    const sc = board().firstElementChild;
    if (sc) sc.scrollTop = 0;
  }
  function go(screen) { state.screen = screen; render(); }

  /* ---------- Actions ---------- */
  const actions = {
    start: () => go('wardrobe'),
    toMap: () => { state.confirmReset = false; go('map'); },
    toTitle: () => go('title'),
    toWardrobe: () => go('wardrobe'),
    wardBack: () => go(state.save.made ? 'map' : 'title'),
    wardDone: () => {
      const input = document.getElementById('hero-name');
      if (input) state.save.hero.name = input.value.trim().slice(0, 14) || Art.DEFAULT_HERO.name;
      state.save.made = true; persist(); go('map');
    },
    set: arg => {
      const i = arg.indexOf(':'), k = arg.slice(0, i), v = arg.slice(i + 1);
      const H = state.save.hero;
      H[k] = v;
      if (k === 'gender') {
        const ids = Art.stylesFor(v).map(st => st.id);
        if (!ids.includes(H.hair)) H.hair = ids[0];
        const opts = document.getElementById('ward-opts');
        if (opts) opts.innerHTML = wardrobeOptions();
      }
      if (k === 'hair' && v === 'peci') H.hat = false;
      persist(); refreshWardrobe();
    },
    toggle: arg => { state.save.hero[arg] = !state.save.hero[arg]; persist(); refreshWardrobe(); },
    sound: () => {
      state.save.sound = !state.save.sound; persist();
      document.querySelectorAll('[data-act="sound"]').forEach(b => {
        b.setAttribute('aria-pressed', String(state.save.sound));
        b.innerHTML = Art.icon(state.save.sound ? 'sound' : 'mute');
      });
      if (state.save.sound) sfx.tap();
    },
    askReset: () => { state.confirmReset = true; render(); },
    cancelReset: () => { state.confirmReset = false; render(); },
    doReset: () => {
      const keep = { hero: state.save.hero, sound: state.save.sound };
      state.save = Object.assign(freshSave(), keep, { made: true });
      state.confirmReset = false; persist(); go('map');
    },
    openJobs: () => go('jobs'),
    openNotebook: () => go('notebook'),
    openParents: () => go('parents'),
    pickJob: arg => {
      if (!Jobs.JOBS[arg] || cleared() < Jobs.JOBS[arg].unlock) return;
      state.save.job = arg; state.save.jobPending = false; persist();
      sfx.correct(); render();
      say(`You are now ${an(myTitle())}.`);
    },
    jobsDone: () => {
      state.save.jobPending = false; persist();
      const ns = nextStage();
      if (ns >= 0) { state.realm = ns; go('intro'); } else go('map');
    },
    pickRealm: arg => {
      const i = Number(arg);
      if (i >= state.save.unlocked) return;
      state.realm = i; go('intro');
    }
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled || !board().contains(el)) return;
    const fn = actions[el.dataset.act];
    if (!fn) return;
    if (el.dataset.act !== 'sound') sfx.tap();
    fn(el.dataset.arg, el, e);
  });
  document.addEventListener('input', e => {
    if (e.target && e.target.id === 'hero-name') {
      state.save.hero.name = e.target.value.slice(0, 14);
      persist();
      const prev = document.querySelector('#ward-preview .mage');
      if (prev) prev.setAttribute('aria-label', `${heroName()} the mage`);
    }
  });

  window.MIM = { state, REALMS, TOPICS, SPELLS, MAX_HEARTS, TRAITS, CHAPTERS, totalStars, cleared, nextStage, an, myTitle, myIcon, sfx, screens, actions, render, go, persist, soundBtn, rateHTML, heroName, say, esc };

  /* ---------- Boot (keeps progress when the page is updated while open) ---------- */
  function start(data) {
    document.body.insertAdjacentHTML('afterbegin', Art.defs());
    data = data || {};
    state.save = data.save || loadSave();
    if (data.screen && screens[data.screen]) {
      state.screen = data.screen; state.realm = data.realm || 0;
      state.battle = data.battle || null; state.result = data.result || null; state.finalChapter = data.finalChapter || 0;
      if (state.battle && !state.battle.stolen) state.battle.stolen = [];
      if (state.battle && !state.battle.k) { state.battle = null; if (state.screen === 'battle') state.screen = 'map'; }
      if (state.battle) state.battle.busy = false;
      if (state.screen === 'battle' && !state.battle) state.screen = 'map';
      if (state.screen === 'result' && !state.result) state.screen = 'map';
    }
    render();
  }
  window.MIM.boot = function () {
    const hot = window.claude && window.claude.hot;
    if (hot && typeof hot.snapshot === 'function') {
      try { hot.snapshot(() => ({ save: state.save, screen: state.screen, realm: state.realm, battle: state.battle, result: state.result, finalChapter: state.finalChapter })); } catch (e) { /* ignore */ }
    }
    if (hot && typeof hot.ready === 'function') hot.ready(start);
    else start((hot && hot.data) || {});
  };
})();
