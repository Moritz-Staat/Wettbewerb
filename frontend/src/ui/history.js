import { getActivities } from '../api.js';
import { DISC_LABEL, DISC_ICON } from '../config.js';
import { getAppState } from '../main.js';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export async function renderHistory() {
  const el = document.getElementById('historyList');
  const state = getAppState();
  const me = state.me;

  try {
    const activities = await getActivities();
    if (!activities || !activities.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">\u{1F4CB}</div><p>Noch keine Eintr\u00E4ge.</p></div>`;
      return;
    }

    const sorted = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));
    const groups = {};
    sorted.forEach(a => {
      const d = new Date(a.date);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[k]) groups[k] = [];
      groups[k].push(a);
    });

    let html = '';
    for (const [k, acts] of Object.entries(groups)) {
      const [yr, mo] = k.split('-');
      const lbl = new Date(yr, mo - 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
      const ok = acts.filter(a => a.status === 'approved' || a.disc === 'steps');
      const mP = Math.round(ok.filter(a => a.user === me.username).reduce((s, a) => s + a.pts, 0));
      const rP = Math.round(ok.filter(a => a.user !== me.username).reduce((s, a) => s + a.pts, 0));
      const meName = me.displayName?.charAt(0) || 'M';
      const rivalName = state.rival?.displayName?.charAt(0) || 'R';

      html += `<div class="month-header">
        <div class="month-name">${lbl}</div>
        <div class="month-score-me">${meName}:${mP}</div>
        <div class="month-score-rival">${rivalName}:${rP}</div>
      </div><div class="month-divider"></div>`;

      acts.forEach(a => {
        const isMe = a.user === me.username;
        const userName = isMe ? me.displayName : (state.rival?.displayName || 'Rival');
        let badge = '';
        if (a.disc !== 'steps') {
          if (a.status === 'approved') badge = `<span class="badge badge-approved">\u2713</span>`;
          else if (a.status === 'pending') badge = `<span class="badge badge-pending">\u23F3</span>`;
        }
        html += `<div class="track-row">
          <div class="track-thumb ${isMe ? 'me-thumb' : 'rival-thumb'}">${DISC_ICON[a.disc] || ''}</div>
          <div class="track-info">
            <div class="track-title">${DISC_LABEL[a.disc] || a.disc} ${badge}</div>
            <div class="track-meta">${userName} \u00B7 ${fmtDate(a.date)}${a.note ? ' \u00B7 ' + a.note : ''}</div>
          </div>
          <div class="track-pts ${isMe ? 'me-pts' : 'rival-pts'}">+${a.pts}</div>
        </div>`;
      });
    }
    el.innerHTML = html;
  } catch (err) {
    console.error('renderHistory error:', err);
  }
}
