/* Math Is Magic: monster drawings, part 2 (Chapter 2) and the drawing function. Original designs, all facing left. */
(function (root) {
  'use strict';
  const Art = root.Art, INK = Art.INK, starPts = Art.starPts;
  const M = Art.MONSTER_ART = Art.MONSTER_ART || {};
  const eye = (x, y, r, px) => `<circle class="ch" cx="${x}" cy="${y}" r="${r}" style="fill:var(--chalk)"/><circle cx="${x - px}" cy="${y + 1}" r="${(r * 0.45).toFixed(1)}" style="fill:${INK}"/>`;
  const ink = (d, w) => `<path style="fill:none;stroke:${INK};stroke-width:${w || 4};stroke-linecap:round;stroke-linejoin:round" d="${d}"/>`;
  const line = (d, color, w, extra) => `<path style="fill:none;stroke:${color};stroke-width:${w || 3};stroke-linecap:round;stroke-linejoin:round;${extra || ''}" d="${d}"/>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Durinautus, the Thornball of the Reef: a spiked puffer with a coral crown
  M.durinautus = () => {
    let spikes = '';
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2, p = (r, o) => (100 + Math.cos(a + o) * r).toFixed(1) + ',' + (108 + Math.sin(a + o) * r).toFixed(1);
      if (a > 4.3 && a < 5.1) continue; // leave room for the coral crown
      spikes += `<polygon points="${p(56, -0.12)} ${p(76, 0)} ${p(56, 0.12)}"/>`;
    }
    return `<path class="ch" style="fill:var(--coral)" d="M154 108 L192 82 Q184 108 192 134 Z"/>` +
      `<g class="ch" style="fill:var(--chalk)">${spikes}</g>` +
      line('M100 50 L96 22 M97 32 L84 22 M99 38 L112 18 M106 28 L120 28 M96 22 L90 10 M112 18 L118 8', 'var(--pink)', 7) +
      `<g style="fill:var(--chalk)"><circle cx="90" cy="10" r="2.6"/><circle cx="118" cy="8" r="2.6"/><circle cx="84" cy="22" r="2.2"/><circle cx="120" cy="28" r="2.2"/></g>` +
      `<circle class="ch" cx="100" cy="108" r="60" style="fill:var(--yellow)"/>` +
      `<path style="fill:var(--chalk);opacity:.5" d="M52 128 Q100 174 148 128 Q100 152 52 128 Z"/>` +
      `<g style="fill:var(--coral);opacity:.7"><circle cx="126" cy="84" r="6"/><circle cx="144" cy="104" r="4"/><circle cx="122" cy="134" r="5"/><circle cx="96" cy="76" r="3.5"/></g>` +
      `<path class="ch" style="fill:var(--coral)" d="M112 114 Q134 100 142 122 Q126 128 112 114 Z"/>` +
      eye(72, 96, 15, 6) + ink('M52 76 L88 86', 4.5) + line('M78 74 L90 104', 'var(--chalk)', 2.2, 'opacity:.8') +
      `<ellipse class="ch" cx="46" cy="124" rx="8" ry="7" style="fill:var(--coral)"/>` +
      line('M24 98 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M14 76 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0', 'var(--blue)', 2.5);
  };

  // Gagaklepto, the Shiny Snatcher: a masked thief crow with a sack of loot
  M.gagaklepto = () =>
    `<path class="ch" style="fill:#2f3644" d="M126 116 L194 142 L188 158 L118 136 Z"/>` +
    `<path style="fill:var(--blue);opacity:.6" d="M140 126 L188 146 L185 152 L138 133 Z"/>` +
    `<path class="ch" style="fill:var(--sand)" d="M148 158 Q136 190 162 193 Q190 192 180 158 Q172 151 164 154 Q156 151 148 158 Z"/>` +
    line('M150 160 Q164 168 178 160', 'var(--coral)', 3) +
    `<g class="ch" style="fill:var(--yellow)"><circle cx="152" cy="190" r="5"/><circle cx="174" cy="192" r="4.5"/></g>` +
    `<polygon style="fill:var(--yellow)" points="${starPts(164, 174, 7, 3)}"/>` +
    `<ellipse class="ch" cx="104" cy="112" rx="51" ry="39" style="fill:#2f3644"/>` +
    `<path class="ch" style="fill:#3d4656" d="M100 94 Q144 82 164 112 Q134 128 104 120 Z"/>` +
    line('M114 106 Q134 104 150 112 M116 115 Q136 117 154 112', 'var(--blue)', 2.6, 'opacity:.8') +
    `<path style="fill:none;stroke:var(--yellow);stroke-width:2;stroke-dasharray:1 7;stroke-linecap:round" d="M70 120 Q86 142 112 140"/>` +
    `<g class="ch" style="fill:var(--yellow)"><circle cx="78" cy="132" r="4"/><circle cx="94" cy="140" r="4"/><circle cx="110" cy="141" r="3.5"/></g>` +
    line('M96 148 L92 178 M112 148 L114 178 M84 178 H100 M106 178 H122', 'var(--yellow)', 3.5) +
    `<path class="ch" style="fill:#2f3644" d="M58 58 L52 38 L64 52 L68 32 L74 54 L82 42 L80 60 Z"/>` +
    `<circle class="ch" cx="64" cy="80" r="27" style="fill:#2f3644"/>` +
    `<path style="fill:${INK}" d="M38 70 Q64 62 90 70 L88 86 Q64 80 40 86 Z"/>` +
    `<path class="ch" style="fill:var(--yellow)" d="M40 78 L12 86 L40 93 Z"/>` +
    `<circle class="ch" cx="12" cy="98" r="8" style="fill:var(--yellow)"/>` + `<polygon style="fill:var(--chalk)" points="${starPts(12, 98, 4.5, 2)}"/>` +
    eye(58, 77, 7.5, 3) + eye(80, 77, 6, 2);

  // Komodrax, the Island Knight: an armoured giant lizard with a round shield
  M.komodrax = () =>
    `<path class="ch" style="fill:var(--sand)" d="M140 128 Q184 128 197 100 Q194 140 152 152 Z"/>` +
    `<path class="ch" style="fill:var(--chalk-dim)" d="M188 108 L199 92 L196 114 Z"/>` +
    `<path class="ch" style="fill:var(--sand)" d="M126 138 L122 178 L146 178 L148 138 Z"/>` +
    `<ellipse class="ch" cx="104" cy="126" rx="60" ry="31" style="fill:var(--sand)"/>` +
    `<g style="fill:rgba(60,40,20,.25)"><circle cx="112" cy="132" r="5"/><circle cx="132" cy="138" r="4"/><circle cx="94" cy="140" r="4"/></g>` +
    `<g class="ch" style="fill:var(--chalk-dim)"><path d="M66 106 Q78 90 94 96 L92 110 Q80 106 70 114 Z"/><path d="M94 96 Q110 86 126 94 L122 108 Q108 102 92 110 Z"/><path d="M126 94 Q142 92 154 104 L146 114 Q136 106 122 108 Z"/></g>` +
    `<path class="ch" style="fill:var(--sand)" d="M64 136 L56 178 L78 178 L84 138 Z"/>` +
    line('M56 178 l-5 5 M64 179 l-2 6 M72 179 l1 6 M122 178 l-5 5 M130 179 l-2 6 M138 179 l1 6', 'var(--chalk)', 2.5) +
    `<circle class="ch" cx="110" cy="140" r="20" style="fill:var(--blue)"/><polygon style="fill:var(--chalk)" points="${starPts(110, 141, 10, 4.2)}"/>` +
    `<path class="ch" style="fill:var(--sand)" d="M82 132 Q64 104 34 108 Q14 112 16 124 Q20 136 42 136 Q62 136 82 132 Z"/>` +
    `<path class="ch" style="fill:var(--chalk-dim)" d="M40 108 Q44 80 72 82 Q92 86 88 112 Q64 102 40 108 Z"/>` +
    `<path class="ch" style="fill:var(--coral)" d="M68 84 Q74 58 96 50 Q88 68 86 88 Z"/>` +
    ink('M50 98 H82', 2.5) + eye(50, 117, 6, 2) +
    ink('M18 128 Q34 132 52 130', 2.5) +
    line('M16 126 L5 124 M5 124 L0 119 M5 124 L0 129', 'var(--coral)', 3);

  // Gunturawa, the Storm Grumbler: a thundercloud spirit with lightning horns
  M.gunturawa = () =>
    line('M54 152 l-6 14 M80 158 l-6 14 M130 158 l-6 14 M156 152 l-6 14', 'var(--blue)', 3) +
    `<path class="ch" style="fill:var(--yellow)" d="M150 132 L170 150 L160 154 L178 176 L148 156 L158 152 Z"/>` +
    `<path class="ch" style="fill:var(--yellow)" d="M66 62 L48 26 L62 32 L56 10 L80 46 L68 42 Z"/>` +
    `<path class="ch" style="fill:var(--yellow)" d="M134 62 L152 26 L138 32 L144 10 L120 46 L132 42 Z"/>` +
    `<g class="ch" style="fill:#c9d4e2"><circle cx="62" cy="110" r="31"/><circle cx="100" cy="86" r="42"/><circle cx="142" cy="106" r="33"/><rect x="44" y="106" width="114" height="44" rx="22"/></g>` +
    `<g style="fill:#c9d4e2"><circle cx="62" cy="110" r="29.4"/><circle cx="100" cy="86" r="40.4"/><circle cx="142" cy="106" r="31.4"/><rect x="45.6" y="107.6" width="110.8" height="40.8" rx="20.4"/></g>` +
    `<g style="fill:#aebdd0;opacity:.7"><circle cx="120" cy="70" r="10"/><circle cx="70" cy="128" r="8"/><circle cx="146" cy="126" r="7"/></g>` +
    eye(84, 102, 11, 4) + eye(118, 102, 11, 4) +
    ink('M68 82 L95 91 M134 82 L107 91', 4.5) +
    `<path style="fill:${INK}" d="M84 126 Q101 116 118 126 Q101 134 84 126 Z"/>` +
    line('M30 96 Q12 97 12 87 Q12 79 20 81 M24 120 Q6 122 3 112', 'var(--chalk)', 3);

  // Kakacau, the Star Scrambler: a cosmic manta that swims through the night sky
  M.kakacau = () =>
    `<g style="font:700 24px Andika,'Trebuchet MS',sans-serif;fill:var(--yellow)"><text x="10" y="40" transform="rotate(-14 10 40)">7</text><text x="176" y="36" transform="rotate(12 176 36)">3</text><text x="182" y="168" transform="rotate(-8 182 168)">?</text><text x="6" y="176" transform="rotate(10 6 176)">5</text></g>` +
    line('M100 140 Q104 170 128 186', 'var(--lilac)', 6) + `<polygon class="ch" style="fill:var(--yellow)" points="${starPts(130, 186, 9, 4)}"/>` +
    `<path class="ch" style="fill:var(--lilac)" d="M100 62 Q150 40 198 94 Q162 102 148 130 Q122 122 100 142 Q78 122 52 130 Q38 102 2 94 Q50 40 100 62 Z"/>` +
    `<path style="fill:var(--blue);opacity:.45" d="M100 74 Q138 60 176 94 Q150 102 140 120 Q120 114 100 128 Q80 114 60 120 Q50 102 24 94 Q62 60 100 74 Z"/>` +
    `<g style="fill:none;stroke:var(--chalk);stroke-width:1.4;opacity:.75"><path d="M30 92 L48 80 L64 96 L58 110"/><path d="M170 92 L152 80 L136 96 L142 110"/></g>` +
    `<g style="fill:var(--chalk)"><circle cx="30" cy="92" r="2.4"/><circle cx="48" cy="80" r="2.4"/><circle cx="64" cy="96" r="2.4"/><circle cx="58" cy="110" r="2.4"/><circle cx="170" cy="92" r="2.4"/><circle cx="152" cy="80" r="2.4"/><circle cx="136" cy="96" r="2.4"/><circle cx="142" cy="110" r="2.4"/></g>` +
    `<path class="ch" style="fill:var(--lilac)" d="M80 66 Q70 46 76 30 Q88 46 90 64 Z M120 66 Q130 46 124 30 Q112 46 110 64 Z"/>` +
    `<g class="ch" style="fill:var(--yellow)"><polygon points="${starPts(88, 48, 7, 3)}"/><polygon points="${starPts(100, 40, 9, 3.8)}"/><polygon points="${starPts(112, 48, 7, 3)}"/></g>` +
    `<circle class="ch" cx="86" cy="86" r="9" style="fill:var(--yellow)"/><circle cx="83" cy="87" r="4" style="fill:${INK}"/>` +
    `<circle class="ch" cx="114" cy="86" r="9" style="fill:var(--yellow)"/><circle cx="111" cy="87" r="4" style="fill:${INK}"/>` +
    ink('M88 106 Q100 114 114 104', 3);

  Art.monster = function (id, cls, label) {
    const draw = M[id] || M.lumutok;
    return `<svg class="monster m-${id} ${cls || ''}" viewBox="0 0 200 200" role="img" aria-label="${esc(label || id)}">` +
      `<ellipse cx="100" cy="192" rx="70" ry="7" style="fill:rgba(0,0,0,.28)"/>` +
      `<g filter="url(#chalk)">${draw()}</g></svg>`;
  };
})(window);
