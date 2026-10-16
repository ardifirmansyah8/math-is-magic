/* Math Is Magic: monster drawings, part 1 (Chapter 1). Original designs, all facing left. */
(function (root) {
  'use strict';
  const Art = root.Art, INK = Art.INK, starPts = Art.starPts;
  const M = Art.MONSTER_ART = Art.MONSTER_ART || {};
  const eye = (x, y, r, px) => `<circle class="ch" cx="${x}" cy="${y}" r="${r}" style="fill:var(--chalk)"/><circle cx="${x - px}" cy="${y + 1}" r="${(r * 0.45).toFixed(1)}" style="fill:${INK}"/>`;
  const ink = (d, w) => `<path style="fill:none;stroke:${INK};stroke-width:${w || 4};stroke-linecap:round;stroke-linejoin:round" d="${d}"/>`;
  const chalkLine = (d, w, extra) => `<path style="fill:none;stroke:var(--chalk);stroke-width:${w || 3};stroke-linecap:round;${extra || ''}" d="${d}"/>`;

  // Lumutok, the Mossback Brute: a shell-backed boar beast with a garden growing on it
  M.lumutok = () =>
    `<path class="ch" style="fill:var(--sand)" d="M140 140 L138 180 L160 180 L163 140 Z"/>` +
    `<path class="ch" style="fill:var(--mint)" d="M180 128 Q198 118 196 98 Q184 110 177 124 Z"/>` +
    `<path class="ch" style="fill:var(--mint)" d="M38 150 Q30 96 80 76 Q124 60 162 88 Q190 108 182 152 Q110 166 38 150 Z"/>` +
    `<path style="fill:none;stroke:rgba(20,60,35,.45);stroke-width:3;stroke-linecap:round" d="M50 146 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0"/>` +
    `<g style="fill:rgba(20,60,35,.3)"><circle cx="122" cy="102" r="7"/><circle cx="152" cy="120" r="5"/><circle cx="98" cy="122" r="5"/><circle cx="162" cy="98" r="4"/></g>` +
    `<path class="ch" style="fill:var(--chalk)" d="M113 70 L112 83 L120 83 L119 70 Z"/><path class="ch" style="fill:var(--coral)" d="M103 73 Q116 54 129 73 Z"/>` +
    `<path class="ch" style="fill:var(--chalk)" d="M147 82 L146 92 L152 92 L151 82 Z"/><path class="ch" style="fill:var(--coral)" d="M140 84 Q149 70 158 84 Z"/>` +
    `<g style="fill:var(--chalk)"><circle cx="111" cy="66" r="2.2"/><circle cx="121" cy="64" r="2"/><circle cx="149" cy="78" r="1.8"/></g>` +
    chalkLine('M88 76 Q86 58 92 46') +
    `<path class="ch" style="fill:var(--yellow)" d="M92 46 Q106 38 110 50 Q100 58 92 46 Z"/><path class="ch" style="fill:var(--mint)" d="M90 58 Q76 50 72 60 Q82 66 90 58 Z"/>` +
    `<path class="ch" style="fill:var(--sand)" d="M58 146 L54 182 L78 182 L81 146 Z"/><path class="ch" style="fill:var(--sand)" d="M101 150 L99 182 L121 182 L123 150 Z"/>` +
    chalkLine('M54 182 l-4 4 M62 183 l-1 5 M70 183 l2 5 M99 182 l-4 4 M107 183 l-1 5 M115 183 l2 5', 2.4) +
    `<path class="ch" style="fill:var(--sand)" d="M80 108 Q62 92 38 100 Q12 108 14 130 Q16 150 40 152 Q66 154 84 138 Z"/>` +
    `<path class="ch" style="fill:var(--mint)" d="M42 102 Q48 84 66 88 Q74 78 86 92 Q82 106 70 106 Q58 98 42 102 Z"/>` +
    `<ellipse class="ch" cx="21" cy="133" rx="12" ry="9.5" style="fill:var(--pink)"/><circle cx="17" cy="132" r="2" style="fill:${INK}"/><circle cx="25" cy="132" r="2" style="fill:${INK}"/>` +
    `<path class="ch" style="fill:var(--chalk)" d="M31 144 Q24 152 28 160 Q33 152 37 146 Z"/><path class="ch" style="fill:var(--chalk)" d="M45 146 Q41 156 47 161 Q49 153 51 147 Z"/>` +
    eye(50, 117, 7.5, 3) + ink('M38 105 L60 111', 4.5);

  // Kristawar, the Crystal Glider: a great cave flyer with crystals growing from its wings
  M.kristawar = () =>
    `<path class="ch" style="fill:var(--lilac)" d="M80 96 Q40 56 8 70 Q20 84 14 100 Q30 94 34 112 Q48 102 58 118 Q66 106 80 116 Z"/>` +
    `<path class="ch" style="fill:var(--lilac)" d="M120 96 Q160 56 192 70 Q180 84 186 100 Q170 94 166 112 Q152 102 142 118 Q134 106 120 116 Z"/>` +
    `<g class="ch" style="fill:var(--blue)"><polygon points="20,74 27,50 34,76"/><polygon points="40,66 49,38 56,68"/><polygon points="180,74 173,50 166,76"/><polygon points="160,66 151,38 144,68"/></g>` +
    `<path class="ch" style="fill:var(--lilac)" d="M80 84 L70 42 L97 72 Z M120 84 L130 42 L103 72 Z"/>` +
    `<ellipse class="ch" cx="100" cy="114" rx="33" ry="41" style="fill:var(--lilac)"/>` +
    `<ellipse cx="100" cy="128" rx="18" ry="22" style="fill:var(--chalk);opacity:.3"/>` +
    `<g class="ch" style="fill:var(--blue)"><polygon points="91,76 95,54 100,76"/><polygon points="97,74 103,44 109,74"/><polygon points="105,76 110,56 114,77"/></g>` +
    `<circle class="ch" cx="87" cy="104" r="10.5" style="fill:var(--yellow)"/><circle cx="83" cy="105" r="4.5" style="fill:${INK}"/>` +
    `<circle class="ch" cx="113" cy="104" r="10.5" style="fill:var(--yellow)"/><circle cx="109" cy="105" r="4.5" style="fill:${INK}"/>` +
    ink('M75 90 L95 96 M125 90 L105 96', 3.5) +
    ink('M84 128 Q100 136 116 128', 3) +
    `<path style="fill:var(--chalk)" d="M90 129 L94 141 L98 131 Z M102 131 L106 141 L110 129 Z"/>` +
    chalkLine('M88 154 L84 168 l-5 4 M88 168 l3 5 M112 154 L116 168 l5 4 M112 168 l-3 5', 3);

  // Detikron, the Clockwork Colossus: an armoured giant built around a clock
  M.detikron = () => {
    let teeth = '';
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5, x = 150 + Math.cos(a) * 30, y = 58 + Math.sin(a) * 30;
      teeth += `<rect x="${(x - 6).toFixed(1)}" y="${(y - 6).toFixed(1)}" width="12" height="12" rx="2" transform="rotate(${(a * 180 / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      ticks += `<line x1="${(100 + Math.sin(a) * 24).toFixed(1)}" y1="${(124 - Math.cos(a) * 24).toFixed(1)}" x2="${(100 + Math.sin(a) * 28).toFixed(1)}" y2="${(124 - Math.cos(a) * 28).toFixed(1)}"/>`;
    }
    return `<g class="ch" style="fill:var(--chalk-dim)">${teeth}</g><circle class="ch" cx="150" cy="58" r="28" style="fill:var(--chalk-dim)"/><circle cx="150" cy="58" r="9" style="fill:var(--slate)"/>` +
      `<path class="ch" style="fill:var(--sand)" d="M62 160 L56 190 L86 190 L88 160 Z"/><path class="ch" style="fill:var(--sand)" d="M112 160 L114 190 L144 190 L138 160 Z"/>` +
      `<path class="ch" style="fill:var(--sand)" d="M50 88 Q26 94 24 128 L46 132 Q48 110 60 102 Z"/><rect class="ch" x="10" y="126" width="40" height="32" rx="10" style="fill:var(--sand)"/>` +
      `<path class="ch" style="fill:var(--sand)" d="M150 88 Q174 94 176 128 L154 132 Q152 110 140 102 Z"/><rect class="ch" x="150" y="126" width="40" height="32" rx="10" style="fill:var(--sand)"/>` +
      `<path class="ch" style="fill:var(--sand)" d="M50 80 Q100 64 150 80 L144 166 Q100 176 56 166 Z"/>` +
      `<g style="fill:var(--chalk-dim)"><circle cx="62" cy="90" r="3"/><circle cx="138" cy="90" r="3"/><circle cx="64" cy="156" r="3"/><circle cx="136" cy="156" r="3"/></g>` +
      `<circle class="ch" cx="100" cy="124" r="31" style="fill:var(--chalk)"/>` +
      `<g style="stroke:${INK};stroke-width:2.5;stroke-linecap:round">${ticks}</g>` +
      ink('M100 124 L100 102 M100 124 L114 132', 4) + `<circle cx="100" cy="124" r="3.5" style="fill:${INK}"/>` +
      `<path class="ch" style="fill:var(--chalk-dim)" d="M42 78 Q60 64 80 74 L76 90 Q58 84 44 92 Z"/><path class="ch" style="fill:var(--chalk-dim)" d="M158 78 Q140 64 120 74 L124 90 Q142 84 156 92 Z"/>` +
      `<path class="ch" style="fill:var(--chalk-dim)" d="M78 36 L68 12 L90 30 Z M122 36 L132 12 L110 30 Z"/>` +
      `<rect class="ch" x="73" y="28" width="54" height="42" rx="9" style="fill:var(--sand)"/>` +
      `<rect x="79" y="40" width="42" height="13" rx="4" style="fill:${INK}"/><rect x="83" y="43.5" width="13" height="6" rx="2" style="fill:var(--coral)"/><rect x="104" y="43.5" width="13" height="6" rx="2" style="fill:var(--coral)"/>` +
      ink('M88 60 H112 M90 64.5 H110', 2.5);
  };

  // Katagma, the Magma Croaker: a volcano toad with lava running through its cracks
  M.katagma = () =>
    chalkLine('M64 40 q-8 -8 0 -16 q8 -8 0 -16 M136 44 q-8 -8 0 -16 q8 -8 0 -16', 2.5, 'opacity:.8') +
    `<ellipse class="ch" cx="54" cy="176" rx="22" ry="9" style="fill:var(--coral)"/><ellipse class="ch" cx="146" cy="176" rx="22" ry="9" style="fill:var(--coral)"/>` +
    `<ellipse class="ch" cx="100" cy="132" rx="76" ry="48" style="fill:var(--coral)"/>` +
    `<path style="fill:none;stroke:var(--yellow);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round" d="M50 122 L62 134 L56 148 M138 112 L150 126 L144 142 M96 158 L106 166 L118 160 M160 140 L168 150"/>` +
    `<g class="ch" style="fill:var(--chalk-dim)"><circle cx="78" cy="152" r="5"/><circle cx="128" cy="150" r="6"/><circle cx="40" cy="140" r="4"/><circle cx="164" cy="124" r="4"/></g>` +
    `<circle class="ch" cx="62" cy="88" r="22" style="fill:var(--coral)"/><circle class="ch" cx="138" cy="88" r="22" style="fill:var(--coral)"/>` +
    `<g class="ch" style="fill:var(--chalk-dim)"><path d="M82 86 L89 64 L96 86 Z"/><path d="M95 84 L102 56 L109 84 Z"/><path d="M108 86 L115 66 L120 87 Z"/></g>` +
    eye(62, 88, 13, 4) + eye(138, 88, 13, 4) +
    ink('M46 72 L74 80 M154 72 L126 80', 4) +
    ink('M40 128 Q100 156 160 128', 4.5) +
    `<ellipse cx="100" cy="148" rx="24" ry="9" style="fill:var(--yellow);opacity:.75"/>`;

  // Nolnaga, the Zero Devourer: an ancient crowned naga coiled around a stolen zero
  M.nolnaga = () => {
    const body = 'M80 66 C130 42, 178 76, 152 110 S68 126, 98 160 S168 184, 190 150';
    return `<ellipse cx="118" cy="104" rx="66" ry="80" style="fill:none;stroke:var(--chalk);stroke-width:3;stroke-dasharray:6 7;opacity:.5"/>` +
      `<path d="${body}" style="fill:none;stroke:var(--chalk);stroke-width:37;stroke-linecap:round"/>` +
      `<path d="${body}" style="fill:none;stroke:var(--lilac);stroke-width:31;stroke-linecap:round"/>` +
      `<path d="${body}" style="fill:none;stroke:var(--yellow);stroke-width:9;stroke-linecap:round;stroke-dasharray:10 7;opacity:.8"/>` +
      `<path class="ch" style="fill:var(--yellow)" d="M184 146 L200 126 L194 152 L200 164 Z"/>` +
      `<path class="ch" style="fill:var(--blue)" d="M128 54 L140 36 L144 58 Z M160 82 L178 76 L168 96 Z M84 128 L66 120 L78 140 Z"/>` +
      `<path class="ch" style="fill:var(--lilac)" d="M90 62 Q82 36 56 36 Q30 36 18 50 Q10 62 22 70 L44 72 Q62 84 88 78 Z"/>` +
      `<path class="ch" style="fill:var(--yellow)" d="M48 40 L50 18 L59 32 L67 13 L74 32 L83 19 L84 44 Q66 35 48 40 Z"/>` +
      `<g style="fill:var(--pink)"><circle cx="59" cy="31" r="2.4"/><circle cx="74" cy="31" r="2.4"/></g>` +
      chalkLine('M26 66 Q10 76 6 94 M34 70 Q24 88 27 104', 2.4) +
      `<circle class="ch" cx="58" cy="50" r="7.5" style="fill:var(--yellow)"/><ellipse cx="57" cy="50" rx="2.3" ry="5.6" style="fill:${INK}"/>` +
      `<circle cx="22" cy="54" r="2.4" style="fill:${INK}"/>` + ink('M20 64 Q34 69 49 66', 3) +
      `<path style="fill:var(--chalk)" d="M28 66 L31 73 L34 67 Z M38 67 L41 74 L44 67 Z"/>` +
      `<g style="font:700 24px Kalam,'Comic Sans MS',cursive;fill:var(--chalk)"><text x="2" y="38">0</text><text x="10" y="126">0</text><text x="172" y="36">0</text></g>`;
  };
})(window);
