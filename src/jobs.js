/* Math Is Magic: ranks and jobs (pure data and rules, no DOM) */
(function (root) {
  'use strict';
  const S = n => (n === 1 ? '' : 's');

  // Skill tier grows with the number of different stages cleared
  const tierFor = cleared => (cleared >= 8 ? 4 : cleared >= 5 ? 3 : cleared >= 3 ? 2 : 1);
  // Base hearts grow too
  const baseHearts = cleared => (cleared >= 10 ? 5 : cleared >= 5 ? 4 : 3);

  const JOBS = {
    flame: {
      school: 'Flame', skill: 'Blaze', icon: 'flare', unlock: 1,
      titles: ['Ember Apprentice', 'Fire Mage', 'Flame Wizard', 'Inferno Sorcerer'],
      blurb: 'For mages who like to hit hard.',
      desc: t => `Every correct spell hits for +${[1, 2, 2, 3][t - 1]} extra damage.`
    },
    shield: {
      school: 'Shield', skill: 'Ward', icon: 'shield', unlock: 1,
      titles: ['Ward Apprentice', 'Guardian', 'Paladin', 'Aegis Keeper'],
      blurb: 'For mages who never want to lose a heart.',
      desc: t => { const n = [1, 1, 2, 3][t - 1]; return `Start every battle with ${n} shield${S(n)}.` + (t >= 2 ? ' Get a shield back after every 3 right answers in a row.' : ''); }
    },
    wisdom: {
      school: 'Wisdom', skill: 'Insight', icon: 'book', unlock: 1,
      titles: ['Owl Apprentice', 'Scholar', 'Sage', 'Oracle'],
      blurb: 'For mages who love clues and a fresh start.',
      desc: t => { const n = [0, 1, 2, 3][t - 1]; return 'Hints never cost power.' + (n ? ` Swap a puzzle for a new one ${n === 1 ? 'once' : n + ' times'} per battle.` : ''); }
    },
    nature: {
      school: 'Nature', skill: 'Mend', icon: 'leaf', unlock: 2,
      titles: ['Jamu Apprentice', 'Healer', 'Druid', 'Life Weaver'],
      blurb: 'For mages who like to keep going.',
      desc: t => { const n = [1, 1, 2, 2][t - 1]; return `+${n} extra heart${S(n)}.` + (t >= 2 ? ` Heal 1 heart after every ${t === 4 ? 2 : 3} right answers in a row.` : ''); }
    },
    time: {
      school: 'Time', skill: 'Rewind', icon: 'hourglass', unlock: 3,
      titles: ['Clock Apprentice', 'Time Mage', 'Chronomancer', 'Time Keeper'],
      blurb: 'For mages who want a second try.',
      desc: t => { const n = [1, 1, 2, 2][t - 1]; return `When you get one wrong, time rewinds so you can try the same puzzle again. Works ${n === 1 ? 'once' : n + ' times'} per battle.` + (t >= 3 ? ' Rewinds keep your combo going.' : ''); }
    },
    star: {
      school: 'Star', skill: 'Lucky Star', icon: 'rate', unlock: 4,
      titles: ['Star Apprentice', 'Stargazer', 'Astrologer', 'Star Caller'],
      blurb: 'For mages who love collecting power-ups.',
      desc: t => 'Find a power-up every 2 right answers in a row.' + (t >= 2 ? ' Win 2 prizes after every victory.' : '') + (t >= 3 ? ` Start every battle with Double Chalk${t >= 4 ? ' and a shield' : ''}.` : '')
    },
    grand: {
      school: 'Grand', skill: 'Mastery', icon: 'crown', unlock: 10,
      titles: ['Grand Mage', 'Grand Mage', 'Grand Mage', 'Grand Mage'],
      blurb: 'The highest rank. All the schools of magic at once.',
      desc: () => '+2 damage, 2 shields, free hints and 2 swaps, +1 heart and healing, 1 rewind, and lucky power-ups.'
    }
  };
  const ORDER = ['flame', 'shield', 'wisdom', 'nature', 'time', 'star'];

  function title(job, cleared) {
    if (!job || !JOBS[job]) return 'Trainee Mage';
    return JOBS[job].titles[tierFor(cleared) - 1];
  }

  // Everything a battle needs to know about the player's job, at their current tier
  function skills(job, cleared) {
    const t = tierFor(cleared);
    const k = { tier: t, dmg: 0, shieldStart: 0, shieldOnStreak: false, freeHints: false, swaps: 0, extraHearts: 0, healEvery: 0, rewinds: 0, rewindKeepsCombo: false, dropEvery: 3, prizes: 1, startDouble: false };
    switch (job) {
      case 'flame': k.dmg = [1, 2, 2, 3][t - 1]; break;
      case 'shield': k.shieldStart = [1, 1, 2, 3][t - 1]; k.shieldOnStreak = t >= 2; break;
      case 'wisdom': k.freeHints = true; k.swaps = [0, 1, 2, 3][t - 1]; break;
      case 'nature': k.extraHearts = [1, 1, 2, 2][t - 1]; k.healEvery = t === 1 ? 0 : t === 4 ? 2 : 3; break;
      case 'time': k.rewinds = [1, 1, 2, 2][t - 1]; k.rewindKeepsCombo = t >= 3; break;
      case 'star': k.dropEvery = 2; k.prizes = t >= 2 ? 2 : 1; k.startDouble = t >= 3; if (t >= 4) k.shieldStart = 1; break;
      case 'grand': Object.assign(k, { dmg: 2, shieldStart: 2, shieldOnStreak: true, freeHints: true, swaps: 2, extraHearts: 1, healEvery: 3, rewinds: 1, rewindKeepsCombo: true, dropEvery: 2, prizes: 2 }); break;
    }
    k.maxHearts = baseHearts(cleared) + k.extraHearts;
    return k;
  }

  root.Jobs = { JOBS, ORDER, tierFor, baseHearts, title, skills };
})(typeof window !== 'undefined' ? window : globalThis);
