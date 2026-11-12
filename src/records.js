/* Personal records: fastest win, fewest mistakes and longest streak for every realm.
   Only wins count, and nothing is recorded while the one-hit cheat is on. */
(function () {
  const M = window.MIM, Art = window.Art;
  const { state, REALMS, CHAPTERS } = M;

  const fmtTime = ms => { const s = Math.max(1, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const show = (v, f) => (v === null || v === undefined ? '–' : f(v));
  const SHOW = { ms: fmtTime, misses: String, streak: String };
  const LABEL = { ms: 'Time', misses: 'Mistakes', streak: 'Streak' };
  const recs = () => state.save.records || (state.save.records = REALMS.map(() => null));
  const mistakes = n => (n === 0 ? 'no mistakes' : `${n} ${n === 1 ? 'mistake' : 'mistakes'}`);

  // Called by the battle when a realm is won. Returns what changed, for the result screen.
  M.recordWin = (i, run) => {
    const all = recs(), prev = all[i] ? Object.assign({}, all[i]) : null;
    const better = {
      ms: !prev || prev.ms === null || run.ms < prev.ms,
      misses: !prev || prev.misses === null || run.misses < prev.misses,
      streak: !prev || prev.streak === null || run.streak > prev.streak
    };
    const tie = { ms: false, misses: !!prev && prev.misses === run.misses, streak: !!prev && prev.streak === run.streak };
    all[i] = { ms: better.ms ? run.ms : prev.ms, misses: better.misses ? run.misses : prev.misses, streak: better.streak ? run.streak : prev.streak };
    return { first: !prev, prev, run, best: Object.assign({}, all[i]), better, tie };
  };
  M.newRecords = rc => (rc && !rc.first ? ['ms', 'misses', 'streak'].filter(k => rc.better[k]).length : 0);

  // Win screen: this fight's numbers, with new records highlighted
  M.recordsHTML = res => {
    if (res.cheat) return `<p class="rec-paused">${Art.icon('trophy')}<span>Records are paused while the cheat is on.</span></p>`;
    const rc = res.records;
    if (!rc) return '';
    const fresh = M.newRecords(rc);
    const head = rc.first ? 'First records for this realm!' : fresh ? (fresh > 1 ? 'New records!' : 'New record!') : 'Your records';
    const tile = k => {
      const isNew = !rc.first && rc.better[k];
      const note = rc.first ? 'First record'
        : isNew ? `New record!<span class="rec-was">was ${show(rc.prev[k], SHOW[k])}</span>`
          : rc.tie[k] ? 'Tied your best' : `Best ${show(rc.best[k], SHOW[k])}`;
      return `<div class="rec-tile${isNew ? ' is-new' : ''}"><span class="rec-label">${LABEL[k]}</span><b class="rec-val">${SHOW[k](rc.run[k])}</b><span class="rec-note">${note}</span></div>`;
    };
    return `<div class="records"><p class="records-head${fresh ? ' is-new' : ''}">${Art.icon('trophy')}<span>${head}</span></p>
      <div class="rec-tiles">${tile('ms')}${tile('misses')}${tile('streak')}</div>
      ${rc.first ? '<p class="dim rec-tip">Play this realm again to beat them.</p>' : ''}</div>`;
  };

  // Before a fight: the best to beat
  M.bestLine = i => {
    const r = recs()[i];
    if (!r) return '';
    const bits = [];
    if (r.ms !== null) bits.push(fmtTime(r.ms));
    if (r.misses !== null) bits.push(mistakes(r.misses));
    if (r.streak !== null) bits.push(`${r.streak} in a row`);
    return bits.length ? `<p class="best-chip">${Art.icon('trophy')}<span>Your best: ${bits.join(' · ')}</span></p>` : '';
  };

  M.screens.records = () => {
    const s = state.save, all = recs();
    const done = all.map((r, i) => (r ? { r, i } : null)).filter(Boolean);
    const fastest = done.filter(d => d.r.ms !== null).sort((a, b) => a.r.ms - b.r.ms)[0];
    const longest = done.filter(d => d.r.streak !== null).sort((a, b) => b.r.streak - a.r.streak)[0];
    const perfect = done.filter(d => d.r.misses === 0).length;
    const top = done.length ? `<div class="pp-tiles">
        <div class="pp-tile"><span class="pp-label">Fastest win</span><b class="pp-value">${fastest ? fmtTime(fastest.r.ms) : '–'}</b>${fastest ? `<span class="dim">${REALMS[fastest.i].name}</span>` : ''}</div>
        <div class="pp-tile"><span class="pp-label">Longest streak</span><b class="pp-value">${longest ? longest.r.streak : '–'}</b>${longest ? `<span class="dim">in a row, ${REALMS[longest.i].name}</span>` : ''}</div>
        <div class="pp-tile"><span class="pp-label">Wins with no mistakes</span><b class="pp-value">${perfect} of ${REALMS.length}</b><span class="dim">realms</span></div>
      </div>` : `<p class="empty-note">${Art.icon('trophy')}<span>No records yet. Win a realm to set your first one!</span></p>`;
    const row = i => {
      const r = REALMS[i], rec = all[i], open = i < s.unlocked;
      const body = rec
        ? `<dl class="rec-stats"><div><dt>Time</dt><dd>${show(rec.ms, fmtTime)}</dd></div><div><dt>Mistakes</dt><dd>${show(rec.misses, String)}${rec.misses === 0 ? Art.icon('trophy') : ''}</dd></div><div><dt>Streak</dt><dd>${show(rec.streak, String)}</dd></div></dl>`
        : `<p class="dim rec-empty">${!open ? 'Locked.' : s.stars[i] ? 'Win here again to set a record.' : 'Not beaten yet.'}</p>`;
      return `<article class="rec-row${rec ? '' : ' is-empty'}">
        <div class="rec-name"><p class="eyebrow">Realm ${i + 1}</p><p class="rec-realm">${open ? r.name : '???'}</p></div>
        ${open ? `<button class="btn btn-small" data-act="pickRealm" data-arg="${i}" aria-label="${rec ? 'Beat your record in' : 'Play'} ${r.name}">${rec ? 'Beat it' : 'Play'}</button>` : ''}
        ${body}</article>`;
    };
    const chapters = CHAPTERS.map((ch, ci) => `<h3 class="h3 rec-chapter">Chapter ${ci + 1}: ${ch.title}</h3>
      <div class="rec-list">${REALMS.map((_, i) => i).filter(i => i >= ch.first && i <= ch.last).map(row).join('')}</div>`).join('');
    return `<section class="screen" aria-labelledby="rec-title"><div class="wrap wrap-narrow">
      <div class="topbar"><button class="icon-btn" data-act="toMap" aria-label="Back to the map">${Art.icon('back')}</button><h2 id="rec-title" class="h2 grow">My records</h2></div>
      <p class="dim">Win a realm to set a record, then play it again to beat your fastest time, fewest mistakes and longest streak.</p>
      ${top}
      ${chapters}
    </div></section>`;
  };

  M.fmtTime = fmtTime;
  M.actions.openRecords = () => M.go('records');
})();
