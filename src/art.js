/* Math Is Magic: chalk drawings (shared defs, the mage, monsters, small icons) */
(function (root) {
  'use strict';
  const Art = root.Art = {};

  Art.SKINS = ['#f6d5bf', '#e9b48f', '#cf9168', '#a86c46', '#734a33'];
  Art.HAIR_COLORS = ['#2b2422', '#4a3024', '#7a4a2e', '#c46a3a', '#f39ac0', '#c3a6f0', '#8fd0f0', '#9fe0b4', '#f5d561', '#f3efe4'];
  Art.ROBES = ['lilac', 'pink', 'blue', 'mint', 'yellow', 'coral'];
  Art.GIRL_STYLES = [
    { id: 'long', label: 'Long' }, { id: 'bob', label: 'Bob' }, { id: 'braids', label: 'Braids' },
    { id: 'buns', label: 'Buns' }, { id: 'hijab', label: 'Hijab' }
  ];
  Art.BOY_STYLES = [
    { id: 'short', label: 'Short' }, { id: 'spiky', label: 'Spiky' }, { id: 'curly', label: 'Curly' }, { id: 'peci', label: 'Peci' }
  ];
  Art.STYLES = Art.GIRL_STYLES;
  Art.stylesFor = g => (g === 'boy' ? Art.BOY_STYLES : Art.GIRL_STYLES);
  Art.DEFAULT_HERO = { name: '', gender: 'girl', robe: 'lilac', hair: 'long', hairColor: '#2b2422', skin: '#cf9168', glasses: false, hat: true };

  const INK = '#2a2320';
  const fill = c => `style="fill:${c}"`;
  const starPts = (cx, cy, R, r) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R;
      pts.push((cx + Math.cos(a) * rad).toFixed(1) + ',' + (cy + Math.sin(a) * rad).toFixed(1));
    }
    return pts.join(' ');
  };
  const sparkle = (cx, cy, s) =>
    `M${cx} ${cy - s} Q${cx + s * 0.15} ${cy - s * 0.15} ${cx + s} ${cy} Q${cx + s * 0.15} ${cy + s * 0.15} ${cx} ${cy + s} ` +
    `Q${cx - s * 0.15} ${cy + s * 0.15} ${cx - s} ${cy} Q${cx - s * 0.15} ${cy - s * 0.15} ${cx} ${cy - s} Z`;
  Art.starPts = starPts;

  // Hidden sprite sheet: chalk filter + reusable icons
  Art.defs = function () {
    const S = 'stroke:var(--chalk);stroke-width:1.6;stroke-linejoin:round';
    return `<svg class="sprites" width="0" height="0" aria-hidden="true" focusable="false"><defs>
<filter id="chalk" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="noise"/>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" result="rough"/>
  <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.75" result="speckle"/>
  <feComposite in="rough" in2="speckle" operator="in"/>
</filter>
<symbol id="i-mushroom" viewBox="0 0 40 40"><path style="fill:var(--chalk);${S}" d="M14 22 L13 34 Q20 37 27 34 L26 22 Z"/><path style="fill:var(--coral);${S}" d="M5 23 Q5 6 20 6 Q35 6 35 23 Z"/><circle cx="14" cy="15" r="2.6" style="fill:var(--chalk)"/><circle cx="24" cy="11" r="3" style="fill:var(--chalk)"/><circle cx="28" cy="18" r="2" style="fill:var(--chalk)"/></symbol>
<symbol id="i-crystal" viewBox="0 0 40 40"><path style="fill:var(--blue);${S}" d="M20 4 L31 14 L27 36 L13 36 L9 14 Z"/><path style="fill:none;${S};opacity:.7" d="M9 14 L31 14 M20 4 L16 14 L20 36 M20 4 L24 14 L20 36"/></symbol>
<symbol id="i-star" viewBox="0 0 40 40"><polygon style="fill:var(--yellow);${S}" points="${starPts(20, 21, 16, 7)}"/></symbol>
<symbol id="i-potion" viewBox="0 0 40 40"><rect x="15" y="2" width="10" height="5" rx="1.5" style="fill:var(--wood-light);${S}"/><path style="fill:var(--mint);${S}" d="M16 7 L24 7 L24 14 Q34 19 33 28 Q32 37 20 37 Q8 37 7 28 Q6 19 16 14 Z"/><path style="fill:none;${S};opacity:.6" d="M10 25 Q20 21 30 25"/></symbol>
<symbol id="i-spark" viewBox="0 0 40 40"><path style="fill:var(--yellow);${S}" d="${sparkle(20, 20, 16)}"/><path style="fill:var(--chalk)" d="${sparkle(31, 9, 4)}"/></symbol>
<symbol id="i-flare" viewBox="0 0 40 40"><path style="fill:var(--coral);${S}" d="M20 3 Q31 15 29 23 Q34 21 33 29 Q31 38 20 38 Q9 38 7 30 Q5 22 13 16 Q14 24 18 24 Q14 12 20 3 Z"/><path style="fill:var(--yellow)" d="M20 22 Q26 28 24 33 Q22 36 19 35 Q14 33 16 28 Z"/></symbol>
<symbol id="i-comet" viewBox="0 0 40 40"><path style="fill:none;stroke:var(--blue);stroke-width:3;stroke-linecap:round" d="M19 21 L5 35 M23 25 L13 36 M15 17 L4 27"/><circle cx="26" cy="14" r="9" style="fill:var(--blue);${S}"/><circle cx="23" cy="12" r="2.4" style="fill:var(--chalk)"/></symbol>
<symbol id="i-heart" viewBox="0 0 40 40"><path style="fill:var(--coral);${S}" d="M20 35 Q4 23 5 13 Q7 5 14 5.5 Q18.5 6 20 11 Q21.5 6 26 5.5 Q33 5 35 13 Q36 23 20 35 Z"/></symbol>
<symbol id="i-heart-empty" viewBox="0 0 40 40"><path style="fill:none;stroke:var(--chalk-dim);stroke-width:2;stroke-dasharray:3 3;stroke-linejoin:round" d="M20 35 Q4 23 5 13 Q7 5 14 5.5 Q18.5 6 20 11 Q21.5 6 26 5.5 Q33 5 35 13 Q36 23 20 35 Z"/></symbol>
<symbol id="i-rate" viewBox="0 0 40 40"><polygon style="fill:var(--yellow);${S}" points="${starPts(20, 21, 17, 7.5)}"/></symbol>
<symbol id="i-rate-empty" viewBox="0 0 40 40"><polygon style="fill:none;stroke:var(--chalk-dim);stroke-width:1.8;stroke-dasharray:3 2.5;stroke-linejoin:round" points="${starPts(20, 21, 17, 7.5)}"/></symbol>
<symbol id="i-lock" viewBox="0 0 40 40"><path style="fill:none;stroke:var(--chalk-dim);stroke-width:3" d="M13 18 V13 Q13 6 20 6 Q27 6 27 13 V18"/><rect x="9" y="18" width="22" height="17" rx="3" style="fill:var(--chalk-dim)"/></symbol>
<symbol id="i-sound" viewBox="0 0 40 40"><path style="fill:var(--chalk)" d="M6 15 H13 L22 7 V33 L13 25 H6 Z"/><path style="fill:none;stroke:var(--chalk);stroke-width:2.6;stroke-linecap:round" d="M27 14 Q31 20 27 26 M31 10 Q38 20 31 30"/></symbol>
<symbol id="i-mute" viewBox="0 0 40 40"><path style="fill:var(--chalk)" d="M6 15 H13 L22 7 V33 L13 25 H6 Z"/><path style="fill:none;stroke:var(--chalk);stroke-width:2.6;stroke-linecap:round" d="M27 15 L35 25 M35 15 L27 25"/></symbol>
<symbol id="i-back" viewBox="0 0 40 40"><path style="fill:none;stroke:var(--chalk);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round" d="M24 8 L12 20 L24 32"/></symbol>
<symbol id="i-shield" viewBox="0 0 40 40"><path style="fill:var(--blue);${S}" d="M20 3 L34 8.5 V19 Q34 30.5 20 37 Q6 30.5 6 19 V8.5 Z"/><polygon style="fill:var(--chalk)" points="${starPts(20, 19.5, 7.5, 3.2)}"/></symbol>
<symbol id="i-jamu" viewBox="0 0 40 40"><rect x="15" y="2" width="10" height="5" rx="1.5" style="fill:var(--wood-light);${S}"/><path style="fill:var(--chalk);${S};opacity:.9" d="M16 7 H24 V12 Q30 15 30 21 V33 Q30 37 26 37 H14 Q10 37 10 33 V21 Q10 15 16 12 Z"/><path style="fill:var(--yellow)" d="M11.2 22 H28.8 V33 Q28.8 35.8 26 35.8 H14 Q11.2 35.8 11.2 33 Z"/><path style="fill:var(--mint);${S}" d="M24 26 Q33 18 37 25 Q31 32 24 26 Z"/></symbol>
<symbol id="i-double" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" style="fill:rgba(245,213,97,.16);stroke:var(--yellow);stroke-width:2.4;stroke-dasharray:4 3"/><text x="20" y="21" text-anchor="middle" dominant-baseline="central" style="font:700 17px Andika,'Trebuchet MS',sans-serif;fill:var(--yellow)">×2</text></symbol>
<symbol id="i-eraser" viewBox="0 0 40 40"><path style="fill:var(--wood-light);${S}" d="M7 12 H33 Q36 12 36 15 V21 H4 V15 Q4 12 7 12 Z"/><path style="fill:var(--chalk-dim);${S}" d="M4 21 H36 V27 Q36 29.5 33.5 29.5 H6.5 Q4 29.5 4 27 Z"/><path style="fill:none;stroke:var(--chalk);stroke-width:2;stroke-linecap:round;opacity:.8" d="M7 34 H13 M17 35.5 H25 M29 34 H33"/></symbol>
<symbol id="i-book" viewBox="0 0 40 40"><path style="fill:var(--chalk);${S}" d="M20 10 Q12 5 4 7.5 V32 Q12 29.5 20 34 Z"/><path style="fill:var(--lilac);${S}" d="M20 10 Q28 5 36 7.5 V32 Q28 29.5 20 34 Z"/><path style="fill:none;stroke:var(--ink);stroke-width:1.4;opacity:.45" d="M8 14 Q12 13 16 15 M8 19 Q12 18 16 20 M8 24 Q12 23 16 25"/></symbol>
<symbol id="i-leaf" viewBox="0 0 40 40"><path style="fill:var(--mint);${S}" d="M8 33 Q5 11 32 5 Q36 29 12 35 Z"/><path style="fill:none;stroke:var(--chalk);stroke-width:1.8;stroke-linecap:round" d="M6 37 Q17 24 29 9 M15 25 L13 17 M20 19 L25 21"/></symbol>
<symbol id="i-hourglass" viewBox="0 0 40 40"><path style="fill:var(--wood-light);${S}" d="M8 3 H32 V8 H8 Z M8 32 H32 V37 H8 Z"/><path style="fill:rgba(243,239,228,.22);${S}" d="M11 8 H29 Q29 16 22 20 Q29 24 29 32 H11 Q11 24 18 20 Q11 16 11 8 Z"/><path style="fill:var(--yellow)" d="M14 11 H26 Q24.5 15.5 20 18 Q15.5 15.5 14 11 Z M13 31 Q13.8 25.5 20 23.5 Q26.2 25.5 27 31 Z"/></symbol>
<symbol id="i-crown" viewBox="0 0 40 40"><path style="fill:var(--yellow);${S}" d="M5 29 L7 11 L14 19 L20 7 L26 19 L33 11 L35 29 Z"/><rect x="5" y="29" width="30" height="5.5" rx="1.5" style="fill:var(--yellow);${S}"/><circle cx="20" cy="22" r="2.8" style="fill:var(--pink)"/><circle cx="12" cy="24.5" r="2" style="fill:var(--blue)"/><circle cx="28" cy="24.5" r="2" style="fill:var(--mint)"/></symbol>
<symbol id="i-bulb" viewBox="0 0 40 40"><path style="fill:var(--yellow);${S}" d="M20 4 Q31 4 31 15 Q31 21 25 25 L25 29 L15 29 L15 25 Q9 21 9 15 Q9 4 20 4 Z"/><rect x="15" y="31" width="10" height="5" rx="2" style="fill:var(--chalk)"/></symbol>
</defs></svg>`;
  };

  Art.icon = (name, cls) => `<svg class="ico ${cls || ''}" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;

  /* ---------- The mage ---------- */
  Art.mage = function (hero, cls) {
    const H = Object.assign({}, Art.DEFAULT_HERO, hero || {});
    const robe = `var(--${H.robe})`, hair = H.hairColor, skin = H.skin;
    const isHijab = H.hair === 'hijab';
    let back = '';
    const cap = `<path class="ch" ${fill(hair)} d="M62 94 Q60 114 66 120 L134 120 Q140 114 138 94 Q136 56 100 54 Q64 56 62 94 Z"/>`;
    if (H.hair === 'long') back = `<path class="ch" ${fill(hair)} d="M62 96 Q55 150 70 180 L130 180 Q145 150 138 96 Q136 58 100 56 Q64 58 62 96 Z"/>`;
    if (H.hair === 'bob') back = `<path class="ch" ${fill(hair)} d="M59 94 Q55 128 68 138 L132 138 Q145 128 141 94 Q138 55 100 53 Q62 55 59 94 Z"/>`;
    if (H.hair === 'braids') {
      const braid = xs => xs.map((x, i) => `<ellipse class="ch" ${fill(hair)} cx="${x}" cy="${120 + i * 17}" rx="9" ry="10"/>`).join('');
      back = cap + braid([64, 62, 61, 61]) + braid([136, 138, 139, 139]) +
        `<rect x="55" y="184" width="12" height="6" rx="2" style="fill:var(--pink)"/><rect x="133" y="184" width="12" height="6" rx="2" style="fill:var(--pink)"/>`;
    }
    if (H.hair === 'buns') back = `<circle class="ch" ${fill(hair)} cx="60" cy="74" r="16"/><circle class="ch" ${fill(hair)} cx="140" cy="74" r="16"/>` + cap;
    if (H.hair === 'short' || H.hair === 'spiky' || H.hair === 'peci') back = `<path class="ch" ${fill(hair)} d="M63 100 Q58 58 100 51 Q142 58 137 100 Z"/>`;
    if (H.hair === 'curly') back = `<path class="ch" ${fill(hair)} d="M61 106 Q55 57 100 49 Q145 57 139 106 Z"/>`;

    const robeBody = `<path class="ch" style="fill:${robe}" d="M66 142 Q100 128 134 142 L160 238 Q100 252 40 238 Z"/>` +
      `<path class="ch" style="fill:none" d="M88 137 L100 155 L112 137"/>` +
      `<path style="fill:none;stroke:var(--yellow);stroke-width:4;stroke-linecap:round" d="M56 189 Q100 201 144 189"/>` +
      `<path style="fill:var(--yellow)" d="${sparkle(80, 214, 6)}"/><path style="fill:var(--chalk)" d="${sparkle(122, 224, 5)}"/><path style="fill:var(--yellow)" d="${sparkle(114, 168, 4)}"/>`;
    const arms = `<path class="ch" style="fill:${robe}" d="M70 146 Q50 172 48 204 L66 208 Q70 182 82 162 Z"/>` +
      `<circle class="ch" ${fill(skin)} cx="57" cy="211" r="8"/>` +
      `<path style="fill:none;stroke:var(--wood-light);stroke-width:5;stroke-linecap:round" d="M163 134 L186 66"/>` +
      `<path class="ch" style="fill:${robe}" d="M128 146 Q150 142 163 121 L178 131 Q162 158 136 168 Z"/>` +
      `<circle class="ch" ${fill(skin)} cx="171" cy="125" r="8"/>` +
      `<g class="wand-tip"><polygon class="ch" style="fill:var(--yellow)" points="${starPts(188, 58, 11, 4.6)}"/>` +
      `<path style="fill:var(--chalk)" d="${sparkle(172, 44, 4)}"/><path style="fill:var(--chalk)" d="${sparkle(199, 76, 3)}"/></g>`;
    const neck = isHijab ? '' : `<rect ${fill(skin)} x="91" y="118" width="18" height="22"/>`;
    const drape = isHijab ? `<path class="ch" ${fill(hair)} d="M56 100 Q52 44 100 42 Q148 44 144 100 Q150 128 154 152 Q100 172 46 152 Q50 128 56 100 Z"/>` : '';
    const face = isHijab
      ? `<ellipse class="ch" ${fill(skin)} cx="100" cy="97" rx="28" ry="31"/>`
      : `<ellipse class="ch" ${fill(skin)} cx="100" cy="94" rx="33" ry="35"/>`;
    const fy = isHijab ? 98 : 96;
    const features =
      `<path style="fill:none;stroke:${INK};stroke-width:2.2;stroke-linecap:round" d="M81 ${fy - 11} Q87 ${fy - 14} 93 ${fy - 11} M107 ${fy - 11} Q113 ${fy - 14} 119 ${fy - 11}"/>` +
      `<ellipse cx="88" cy="${fy}" rx="4" ry="5" style="fill:${INK}"/><ellipse cx="112" cy="${fy}" rx="4" ry="5" style="fill:${INK}"/>` +
      `<circle cx="89.6" cy="${fy - 2}" r="1.5" style="fill:#fff"/><circle cx="113.6" cy="${fy - 2}" r="1.5" style="fill:#fff"/>` +
      `<ellipse cx="79" cy="${fy + 10}" rx="5" ry="3" style="fill:var(--pink);opacity:.6"/><ellipse cx="121" cy="${fy + 10}" rx="5" ry="3" style="fill:var(--pink);opacity:.6"/>` +
      `<path style="fill:none;stroke:${INK};stroke-width:2.5;stroke-linecap:round" d="M91 ${fy + 14} Q100 ${fy + 21} 109 ${fy + 14}"/>`;
    const shortFringe = `<path class="ch" ${fill(hair)} d="M66 94 Q63 55 100 53 Q137 55 134 94 Q131 78 122 72 Q110 79 98 73 Q86 79 76 74 Q69 80 66 94 Z"/>`;
    const FRONT = {
      short: shortFringe,
      spiky: `<path class="ch" ${fill(hair)} d="M65 92 Q62 66 70 58 L64 44 L80 52 L82 36 L94 49 L101 32 L109 49 L120 37 L121 53 L136 46 L131 60 Q139 70 135 92 Q128 76 100 73 Q72 76 65 92 Z"/>`,
      curly: [[68, 80, 10], [72, 64, 11], [84, 54, 11], [100, 50, 11], [116, 54, 11], [128, 64, 11], [132, 80, 10]]
        .map(([x, y, r]) => `<circle class="ch" ${fill(hair)} cx="${x}" cy="${y}" r="${r}"/>`).join(''),
      peci: shortFringe +
        `<path class="ch" style="fill:#26222a" d="M68 71 L70 47 Q100 40 130 47 L132 71 Q100 64 68 71 Z"/>` +
        `<path style="fill:none;stroke:#514a5c;stroke-width:2" d="M71 51 Q100 45 129 51"/>`
    };
    const bangs = isHijab ? '' : (FRONT[H.hair] || `<path class="ch" ${fill(hair)} d="M66 98 Q60 53 100 53 Q140 53 134 98 Q130 78 114 72 Q102 84 84 76 Q72 82 66 98 Z"/>`);
    const glasses = H.glasses ? `<g style="fill:rgba(255,255,255,.18);stroke:${INK};stroke-width:2.4"><circle cx="88" cy="${fy}" r="9.5"/><circle cx="112" cy="${fy}" r="9.5"/></g>` +
      `<path style="fill:none;stroke:${INK};stroke-width:2.4" d="M97.5 ${fy - 1} Q100 ${fy - 4} 102.5 ${fy - 1}"/>` : '';
    const hatY = isHijab ? 62 : 66;
    const hat = H.hat ? `<ellipse class="ch" style="fill:${robe}" cx="100" cy="${hatY}" rx="48" ry="9"/>` +
      `<path class="ch" style="fill:${robe}" d="M65 ${hatY} Q86 ${hatY - 22} 96 ${hatY - 58} Q104 ${hatY - 64} 108 ${hatY - 54} Q114 ${hatY - 22} 135 ${hatY} Z"/>` +
      `<path style="fill:none;stroke:var(--yellow);stroke-width:4;stroke-linecap:round" d="M70 ${hatY - 5} Q100 ${hatY - 13} 130 ${hatY - 5}"/>` +
      `<polygon style="fill:var(--yellow)" points="${starPts(101, hatY - 28, 7, 3)}"/>` : '';

    return `<svg class="mage ${cls || ''}" viewBox="0 0 200 260" role="img" aria-label="${esc(H.name || 'Mage')} the mage">` +
      `<ellipse cx="100" cy="247" rx="64" ry="8" style="fill:rgba(0,0,0,.28)"/>` +
      `<g filter="url(#chalk)">${back}${robeBody}${arms}${neck}${drape}${face}${features}${bangs}${glasses}${hat}</g></svg>`;
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Monsters (all face left, towards the mage) ---------- */
  const eye = (x, y, r, px) => `<circle class="ch" cx="${x}" cy="${y}" r="${r}" style="fill:var(--chalk)"/><circle cx="${x - px}" cy="${y + 1}" r="${r * 0.45}" style="fill:${INK}"/>`;
  const MONSTERS = {
    mossling: () =>
      `<path class="ch" style="fill:var(--mint)" d="M28 160 Q16 98 58 76 Q78 42 112 52 Q148 46 162 84 Q192 112 176 160 Q100 184 28 160 Z"/>` +
      `<path style="fill:none;stroke:var(--chalk);stroke-width:3;stroke-linecap:round" d="M108 52 Q104 34 112 20"/>` +
      `<path class="ch" style="fill:var(--yellow)" d="M112 20 Q130 10 136 24 Q124 34 112 20 Z"/>` +
      `<g style="fill:rgba(20,50,30,.28)"><circle cx="148" cy="130" r="7"/><circle cx="160" cy="112" r="4"/><circle cx="46" cy="150" r="5"/><circle cx="132" cy="70" r="4"/></g>` +
      eye(72, 106, 14, 5) + eye(114, 106, 14, 5) +
      `<path style="fill:none;stroke:${INK};stroke-width:4.5;stroke-linecap:round" d="M56 86 L86 94 M130 86 L102 94"/>` +
      `<path style="fill:none;stroke:${INK};stroke-width:4;stroke-linecap:round" d="M74 140 Q94 128 114 140"/>` +
      `<path style="fill:none;stroke:var(--chalk);stroke-width:2.5;stroke-linecap:round" d="M46 168 q6 -9 12 0 q6 -9 12 0 M120 172 q6 -9 12 0 q6 -9 12 0"/>`,
    bat: () =>
      `<path class="ch" style="fill:var(--lilac)" d="M72 100 Q32 66 6 90 Q22 98 18 116 Q34 108 40 126 Q54 112 72 126 Z"/>` +
      `<path class="ch" style="fill:var(--lilac)" d="M128 100 Q168 66 194 90 Q178 98 182 116 Q166 108 160 126 Q146 112 128 126 Z"/>` +
      `<path class="ch" style="fill:var(--lilac)" d="M74 82 L68 46 L94 72 Z M126 82 L132 46 L106 72 Z"/>` +
      `<ellipse class="ch" style="fill:var(--lilac)" cx="100" cy="112" rx="35" ry="42"/>` +
      `<path class="ch" style="fill:var(--blue)" d="M100 70 L107 81 L100 92 L93 81 Z"/>` +
      `<circle class="ch" cx="87" cy="104" r="10" style="fill:var(--yellow)"/><circle cx="83" cy="105" r="4.5" style="fill:${INK}"/>` +
      `<circle class="ch" cx="113" cy="104" r="10" style="fill:var(--yellow)"/><circle cx="109" cy="105" r="4.5" style="fill:${INK}"/>` +
      `<path style="fill:none;stroke:${INK};stroke-width:3;stroke-linecap:round" d="M84 126 Q100 133 116 126"/>` +
      `<path style="fill:var(--chalk)" d="M90 127 L94 138 L98 128 Z M102 128 L106 138 L110 127 Z"/>` +
      `<path style="fill:none;stroke:var(--chalk);stroke-width:3;stroke-linecap:round" d="M90 152 L86 164 M110 152 L114 164"/>`,
    golem: () =>
      `<rect class="ch" x="24" y="84" width="26" height="64" rx="12" style="fill:var(--sand)"/><rect class="ch" x="150" y="84" width="26" height="64" rx="12" style="fill:var(--sand)"/>` +
      `<rect class="ch" x="64" y="164" width="26" height="26" rx="6" style="fill:var(--sand)"/><rect class="ch" x="110" y="164" width="26" height="26" rx="6" style="fill:var(--sand)"/>` +
      `<rect class="ch" x="52" y="74" width="96" height="96" rx="14" style="fill:var(--sand)"/>` +
      `<rect class="ch" x="72" y="26" width="56" height="44" rx="9" style="fill:var(--sand)"/>` +
      `<path style="fill:none;stroke:var(--chalk);stroke-width:3" d="M100 26 V12"/><circle class="ch" cx="100" cy="10" r="6" style="fill:var(--coral)"/>` +
      `<rect x="80" y="42" width="13" height="9" rx="2" style="fill:var(--coral)"/><rect x="107" y="42" width="13" height="9" rx="2" style="fill:var(--coral)"/>` +
      `<path style="fill:none;stroke:${INK};stroke-width:3.5;stroke-linecap:round" d="M86 60 H114"/>` +
      `<circle class="ch" cx="100" cy="122" r="31" style="fill:var(--chalk)"/>` +
      `<g style="stroke:${INK};stroke-width:2.5;stroke-linecap:round">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => { const a = i * Math.PI / 6; return `<line x1="${(100 + Math.sin(a) * 25).toFixed(1)}" y1="${(122 - Math.cos(a) * 25).toFixed(1)}" x2="${(100 + Math.sin(a) * 29).toFixed(1)}" y2="${(122 - Math.cos(a) * 29).toFixed(1)}"/>`; }).join('')}</g>` +
      `<path class="golem-hands" style="fill:none;stroke:${INK};stroke-width:4;stroke-linecap:round" d="M100 122 L100 100 M100 122 L86 114"/>` +
      `<circle cx="100" cy="122" r="3.5" style="fill:${INK}"/>`,
    toad: () =>
      `<path style="fill:none;stroke:var(--chalk);stroke-width:2.5;stroke-linecap:round;opacity:.8" d="M70 40 q-8 -8 0 -16 q8 -8 0 -16 M128 44 q-8 -8 0 -16 q8 -8 0 -16"/>` +
      `<ellipse class="ch" cx="56" cy="174" rx="20" ry="9" style="fill:var(--coral)"/><ellipse class="ch" cx="144" cy="174" rx="20" ry="9" style="fill:var(--coral)"/>` +
      `<ellipse class="ch" cx="100" cy="130" rx="74" ry="47" style="fill:var(--coral)"/>` +
      `<circle class="ch" cx="64" cy="88" r="21" style="fill:var(--coral)"/><circle class="ch" cx="136" cy="88" r="21" style="fill:var(--coral)"/>` +
      eye(64, 88, 12, 4) + eye(136, 88, 12, 4) +
      `<path style="fill:none;stroke:${INK};stroke-width:4;stroke-linecap:round" d="M42 126 Q100 152 158 126"/>` +
      `<g style="fill:var(--yellow)"><circle cx="122" cy="152" r="7"/><circle cx="80" cy="160" r="5"/><circle cx="152" cy="124" r="5"/><circle cx="48" cy="140" r="4"/></g>`,
    dragon: () =>
      `<path class="ch" style="fill:var(--blue);opacity:.9" d="M118 98 Q126 38 180 22 Q172 48 192 58 Q168 66 182 88 Q158 86 162 108 Q140 96 120 108 Z"/>` +
      `<path class="ch" style="fill:var(--lilac)" d="M166 160 Q196 150 192 116 Q200 120 198 104 Q186 112 186 118 Q186 140 166 146 Z"/>` +
      `<path class="ch" style="fill:var(--lilac)" d="M70 172 Q50 122 80 98 Q100 82 130 92 Q172 106 174 152 Q174 178 152 184 L84 184 Q72 182 70 172 Z"/>` +
      `<path class="ch" style="fill:var(--yellow);opacity:.85" d="M88 152 Q100 134 126 142 Q122 172 106 182 Q92 178 88 152 Z"/>` +
      `<path style="fill:none;stroke:${INK};stroke-width:2;opacity:.5" d="M94 150 Q106 146 120 150 M92 162 Q104 158 118 162 M96 173 Q104 170 112 173"/>` +
      `<path class="ch" style="fill:var(--chalk)" d="M98 88 L106 74 L114 88 L124 74 L132 90 L142 80 L146 96 Z"/>` +
      `<path class="ch" style="fill:var(--lilac)" d="M90 112 Q86 74 64 60 Q34 46 18 62 Q8 74 20 84 L44 88 Q58 100 72 118 Z"/>` +
      `<path class="ch" style="fill:var(--chalk)" d="M62 56 Q66 30 84 20 Q76 38 76 56 Z M48 52 Q46 30 58 16 Q56 34 62 50 Z"/>` +
      `<circle class="ch" cx="50" cy="66" r="8" style="fill:var(--yellow)"/><ellipse cx="49" cy="66" rx="2.4" ry="6" style="fill:${INK}"/>` +
      `<circle cx="22" cy="68" r="2.4" style="fill:${INK}"/>` +
      `<path style="fill:none;stroke:${INK};stroke-width:3;stroke-linecap:round" d="M18 80 Q32 86 48 82"/>` +
      `<path style="fill:var(--chalk)" d="M26 82 L29 89 L32 83 Z M36 84 L39 90 L42 84 Z"/>` +
      `<path style="fill:none;stroke:var(--chalk);stroke-width:3;stroke-linecap:round" d="M84 186 l-6 6 M92 186 l-2 7 M146 186 l6 6 M138 186 l2 7"/>`,
    grumpfish: () => {
      let spikes = '';
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2, p = (r, o) => (100 + Math.cos(a + o) * r).toFixed(1) + ',' + (104 + Math.sin(a + o) * r).toFixed(1);
        spikes += `<polygon points="${p(56, -0.13)} ${p(74, 0)} ${p(56, 0.13)}"/>`;
      }
      return `<path class="ch" style="fill:var(--coral)" d="M154 104 L190 78 Q183 104 190 130 Z"/>` +
        `<g class="ch" style="fill:var(--chalk)">${spikes}</g>` +
        `<circle class="ch" cx="100" cy="104" r="60" style="fill:var(--yellow)"/>` +
        `<path style="fill:var(--chalk);opacity:.5" d="M52 124 Q100 170 148 124 Q100 148 52 124 Z"/>` +
        `<g style="fill:var(--coral);opacity:.7"><circle cx="124" cy="80" r="6"/><circle cx="142" cy="100" r="4"/><circle cx="120" cy="130" r="5"/></g>` +
        `<path class="ch" style="fill:var(--coral)" d="M110 110 Q132 96 140 118 Q124 124 110 110 Z"/>` +
        eye(72, 92, 15, 6) +
        `<path style="fill:none;stroke:${INK};stroke-width:4.5;stroke-linecap:round" d="M54 72 L86 82"/>` +
        `<ellipse class="ch" cx="47" cy="120" rx="8" ry="7" style="fill:var(--coral)"/>` +
        `<g style="fill:none;stroke:var(--blue);stroke-width:2.5"><circle cx="24" cy="94" r="6"/><circle cx="14" cy="72" r="4"/><circle cx="26" cy="54" r="3"/></g>`;
    },
    magpie: () =>
      `<path class="ch" style="fill:#2f3644" d="M126 118 L192 148 L185 162 L118 136 Z"/>` +
      `<path style="fill:var(--blue);opacity:.6" d="M140 128 L186 150 L183 156 L138 135 Z"/>` +
      `<path class="ch" style="fill:var(--sand)" d="M150 162 Q140 188 163 191 Q187 190 178 162 Q170 156 164 158 Q156 156 150 162 Z"/>` +
      `<path style="fill:none;stroke:var(--coral);stroke-width:3;stroke-linecap:round" d="M152 164 Q164 170 176 164"/>` +
      `<polygon style="fill:var(--yellow)" points="${starPts(164, 176, 7, 3)}"/>` +
      `<ellipse class="ch" cx="104" cy="112" rx="50" ry="38" style="fill:#2f3644"/>` +
      `<path class="ch" style="fill:var(--chalk)" d="M64 116 Q70 152 112 148 Q90 136 92 112 Q80 102 64 116 Z"/>` +
      `<path class="ch" style="fill:#2f3644" d="M100 96 Q142 84 162 112 Q134 128 104 120 Z"/>` +
      `<path style="fill:var(--chalk)" d="M112 102 Q130 97 141 108 Q126 113 112 102 Z"/>` +
      `<path style="fill:none;stroke:var(--blue);stroke-width:3;stroke-linecap:round;opacity:.85" d="M118 117 Q138 119 153 112"/>` +
      `<path style="fill:none;stroke:var(--yellow);stroke-width:3.5;stroke-linecap:round" d="M96 148 L92 178 M112 148 L114 178 M84 178 H100 M106 178 H122"/>` +
      `<circle class="ch" cx="62" cy="80" r="26" style="fill:#2f3644"/>` +
      `<path class="ch" style="fill:var(--yellow)" d="M39 74 L13 83 L39 90 Z"/>` +
      `<polygon class="ch" style="fill:var(--yellow)" points="${starPts(14, 96, 10, 4.2)}"/>` +
      eye(57, 76, 8, 3) +
      `<path style="fill:none;stroke:var(--chalk);stroke-width:3;stroke-linecap:round" d="M45 63 L67 69"/>`,
    komodo: () =>
      `<path class="ch" style="fill:var(--sand)" d="M140 128 Q182 128 197 102 Q192 142 150 152 Z"/>` +
      `<path class="ch" style="fill:var(--sand)" d="M126 138 L122 176 L146 176 L148 138 Z"/>` +
      `<ellipse class="ch" cx="104" cy="126" rx="58" ry="30" style="fill:var(--sand)"/>` +
      `<path class="ch" style="fill:var(--sand)" d="M64 136 L56 176 L78 176 L84 138 Z"/>` +
      `<path style="fill:none;stroke:var(--chalk);stroke-width:2.5;stroke-linecap:round" d="M56 176 l-5 5 M64 177 l-2 6 M72 177 l1 6 M122 176 l-5 5 M130 177 l-2 6 M138 177 l1 6"/>` +
      `<g style="fill:rgba(60,40,20,.25)"><circle cx="112" cy="116" r="5"/><circle cx="130" cy="124" r="4"/><circle cx="98" cy="134" r="4"/><circle cx="144" cy="114" r="3"/></g>` +
      `<path class="ch" style="fill:var(--chalk-dim)" d="M70 106 Q106 82 150 104 L144 114 Q106 96 76 116 Z"/>` +
      `<path class="ch" style="fill:var(--sand)" d="M82 132 Q64 104 34 108 Q14 112 16 124 Q20 136 42 136 Q62 136 82 132 Z"/>` +
      `<path class="ch" style="fill:var(--chalk-dim)" d="M42 108 Q46 82 72 84 Q90 88 86 112 Q64 104 42 108 Z"/>` +
      `<path class="ch" style="fill:var(--coral)" d="M70 86 Q78 62 96 56 Q88 72 86 90 Z"/>` +
      `<path style="fill:none;stroke:${INK};stroke-width:2.5;opacity:.6" d="M52 98 H80"/>` +
      eye(50, 116, 6, 2) +
      `<path style="fill:none;stroke:${INK};stroke-width:2.5;stroke-linecap:round" d="M18 128 Q34 132 50 130"/>` +
      `<path style="fill:none;stroke:var(--coral);stroke-width:3;stroke-linecap:round" d="M16 126 L5 124 M5 124 L0 119 M5 124 L0 129"/>`,
    cloud: () =>
      `<path style="fill:none;stroke:var(--blue);stroke-width:3;stroke-linecap:round" d="M58 150 l-6 14 M82 156 l-6 14 M128 156 l-6 14 M152 150 l-6 14"/>` +
      `<path class="ch" style="fill:var(--yellow)" d="M104 138 L90 170 L104 168 L95 196 L125 156 L109 158 L119 138 Z"/>` +
      `<g class="ch" style="fill:#cdd7e3"><circle cx="64" cy="108" r="30"/><circle cx="100" cy="84" r="40"/><circle cx="140" cy="104" r="32"/><rect x="48" y="104" width="108" height="42" rx="21"/></g>` +
      `<g style="fill:#cdd7e3"><circle cx="64" cy="108" r="28.4"/><circle cx="100" cy="84" r="38.4"/><circle cx="140" cy="104" r="30.4"/><rect x="49.6" y="105.6" width="104.8" height="38.8" rx="19.4"/></g>` +
      eye(84, 100, 10, 4) + eye(118, 100, 10, 4) +
      `<path style="fill:none;stroke:${INK};stroke-width:4;stroke-linecap:round" d="M70 82 L94 90 M132 82 L108 90"/>` +
      `<path style="fill:none;stroke:${INK};stroke-width:4;stroke-linecap:round" d="M86 129 Q101 119 116 129"/>` +
      `<path style="fill:none;stroke:var(--chalk);stroke-width:3;stroke-linecap:round" d="M32 94 Q14 95 14 85 Q14 77 22 79 M26 118 Q8 120 5 110"/>`,
    muddle: () =>
      `<g style="font:700 24px Andika,'Trebuchet MS',sans-serif;fill:var(--yellow)"><text x="20" y="62" transform="rotate(-14 20 62)">7</text><text x="168" y="72" transform="rotate(12 168 72)">3</text><text x="174" y="134" transform="rotate(-8 174 134)">?</text><text x="10" y="146" transform="rotate(10 10 146)">0</text></g>` +
      `<path class="ch" style="fill:var(--pink)" d="M60 100 Q40 150 46 186 L154 186 Q160 150 140 100 Z"/>` +
      `<path style="fill:var(--lilac);opacity:.85" d="M80 108 Q72 150 76 186 L124 186 Q128 150 120 108 Z"/>` +
      `<g style="fill:var(--yellow)"><circle cx="100" cy="128" r="3"/><circle cx="100" cy="146" r="3"/><circle cx="100" cy="164" r="3"/></g>` +
      `<path style="fill:none;stroke:var(--wood-light);stroke-width:5;stroke-linecap:round" d="M58 152 L34 96"/>` +
      `<circle class="ch" cx="31" cy="88" r="11" style="fill:var(--yellow)"/>` +
      `<text x="31" y="93.5" text-anchor="middle" style="font:700 15px Andika,'Trebuchet MS',sans-serif;fill:${INK}">?</text>` +
      `<circle class="ch" cx="58" cy="152" r="8" style="fill:var(--blue)"/>` +
      `<circle class="ch" cx="100" cy="82" r="30" style="fill:var(--blue)"/>` +
      `<path class="ch" style="fill:var(--coral)" d="M74 66 Q60 28 26 30 Q50 44 62 72 Z"/>` +
      `<path class="ch" style="fill:var(--mint)" d="M126 66 Q140 28 174 30 Q150 44 138 72 Z"/>` +
      `<circle class="ch" cx="26" cy="30" r="6" style="fill:var(--yellow)"/><circle class="ch" cx="174" cy="30" r="6" style="fill:var(--yellow)"/>` +
      `<path class="ch" style="fill:var(--yellow)" d="M68 70 Q100 54 132 70 L130 78 Q100 64 70 78 Z"/>` +
      eye(88, 86, 7, 3) + eye(112, 86, 7, 3) +
      `<circle cx="88" cy="86" r="10.5" style="fill:none;stroke:var(--yellow);stroke-width:2.5"/>` +
      `<path style="fill:none;stroke:var(--yellow);stroke-width:1.5" d="M78 90 Q72 104 76 116"/>` +
      `<path style="fill:var(--chalk);stroke:${INK};stroke-width:2.5;stroke-linejoin:round" d="M86 100 Q100 114 114 100 Z"/>` +
      `<path style="fill:none;stroke:${INK};stroke-width:3.5;stroke-linecap:round" d="M100 98 Q90 91 82 97 Q78 101 83 103 M100 98 Q110 91 118 97 Q122 101 117 103"/>`
  };

  Art.monster = function (id, cls, label) {
    return `<svg class="monster m-${id} ${cls || ''}" viewBox="0 0 200 200" role="img" aria-label="${esc(label || id)}">` +
      `<ellipse cx="100" cy="190" rx="70" ry="8" style="fill:rgba(0,0,0,.28)"/>` +
      `<g filter="url(#chalk)">${MONSTERS[id]()}</g></svg>`;
  };
})(window);
