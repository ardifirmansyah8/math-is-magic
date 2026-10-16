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
  Art.sparkle = sparkle;
  Art.INK = INK;

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
<symbol id="i-snow" viewBox="0 0 40 40"><g style="fill:none;stroke:var(--blue);stroke-width:3;stroke-linecap:round"><path d="M20 4 V36 M6.1 12 L33.9 28 M6.1 28 L33.9 12"/><path style="stroke-width:2.4" d="M15 7 L20 11 L25 7 M15 33 L20 29 L25 33"/></g><circle cx="20" cy="20" r="3.2" style="fill:var(--chalk)"/></symbol>
<symbol id="i-bolt" viewBox="0 0 40 40"><path style="fill:var(--yellow);${S}" d="M23 3 L8 22 H18 L14 37 L32 15 H21 Z"/></symbol>
<symbol id="i-drop" viewBox="0 0 40 40"><path style="fill:var(--blue);${S}" d="M20 4 Q31 18 31 25 Q31 36 20 36 Q9 36 9 25 Q9 18 20 4 Z"/><path style="fill:none;stroke:var(--chalk);stroke-width:2;stroke-linecap:round;opacity:.8" d="M14 25 Q14 31 19 32"/></symbol>
<symbol id="i-rock" viewBox="0 0 40 40"><path style="fill:var(--sand);${S}" d="M6 30 L10 16 L20 9 L31 13 L35 27 L28 34 H12 Z"/><path style="fill:none;stroke:var(--ink);stroke-width:1.6;opacity:.4" d="M10 16 L19 21 L31 13 M19 21 L18 33"/></symbol>
<symbol id="i-swirl" viewBox="0 0 40 40"><g style="fill:none;stroke:var(--mint);stroke-width:3.2;stroke-linecap:round"><path d="M4 14 H25 Q31 14 31 9 Q31 5 27 5 Q24 5 23 8"/><path d="M4 22 H31 Q36 22 36 27 Q36 32 31 32 Q27 32 26 29"/><path d="M8 30 H17"/></g></symbol>
<symbol id="i-infinity" viewBox="0 0 40 40"><path style="fill:none;stroke:var(--lilac);stroke-width:4.2;stroke-linecap:round" d="M20 20 C14 9 3 10 3 20 C3 30 14 31 20 20 C26 9 37 10 37 20 C37 30 26 31 20 20 Z"/></symbol>
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

})(window);
