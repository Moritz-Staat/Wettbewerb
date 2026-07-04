import { getActivities, getScores } from '../api.js';
import { DISC_LABEL, DISC_ICON } from '../config.js';
import { getPeriod } from './navigation.js';
import { getAppState } from '../main.js';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function trackRowHTML(a, me) {
  const isMe = a.user === me.username;
  const userName = isMe ? me.displayName : (getAppState().rival?.displayName || 'Rival');
  return `<div class="track-row">
    <div class="track-thumb ${isMe ? 'me-thumb' : 'rival-thumb'}">${DISC_ICON[a.disc] || ''}</div>
    <div class="track-info">
      <div class="track-title">${DISC_LABEL[a.disc] || a.disc}</div>
      <div class="track-meta">${userName} \u00B7 ${fmtDate(a.date)}${a.note ? ' \u00B7 ' + a.note : ''}</div>
    </div>
    <div class="track-pts ${isMe ? 'me-pts' : 'rival-pts'}">+${a.pts}</div>
  </div>`;
}

export async function renderScore() {
  const state = getAppState();
  const me = state.me;
  const rival = state.rival;
  const period = getPeriod();

  if (!me) return;

  const meName = me.displayName || me.username;
  const rivalName = rival?.displayName || 'Rival';

  // Update name labels
  document.getElementById('scoreMeName').textContent = meName;
  document.getElementById('scoreRivalName').textContent = rivalName;
  document.getElementById('statMeName').textContent = meName;
  document.getElementById('statRivalName').textContent = rivalName;

  try {
    const [scores, activities] = await Promise.all([
      getScores(period),
      getActivities(period),
    ]);

    const myScore = scores.me || 0;
    const rivalScore = scores.rival || 0;

    document.getElementById('scoreMe').textContent = myScore;
    document.getElementById('scoreRival').textContent = rivalScore;

    // dim loser
    const meEl = document.getElementById('scoreMe');
    const rivEl = document.getElementById('scoreRival');
    meEl.classList.remove('dimmed');
    rivEl.classList.remove('dimmed');
    if (rivalScore > myScore) meEl.classList.add('dimmed');
    if (myScore > rivalScore) rivEl.classList.add('dimmed');

    // leader bar
    const total = myScore + rivalScore;
    const pct = total === 0 ? 50 : Math.round(myScore / total * 100);
    document.getElementById('leaderFill').style.width = pct + '%';

    // stats
    const approved = (activities || []).filter(a => a.status === 'approved' || a.disc === 'steps');
    const myCount = approved.filter(a => a.user === me.username).length;
    const rivalCount = approved.filter(a => a.user !== me.username).length;
    document.getElementById('statMe').textContent = myCount;
    document.getElementById('statRival').textContent = rivalCount;

    // recent
    const recent = [...(activities || [])]
      .filter(a => a.status === 'approved' || a.disc === 'steps')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    const el = document.getElementById('recentList');
    el.innerHTML = recent.length
      ? recent.map(a => trackRowHTML(a, me)).join('')
      : `<div class="empty-state"><div class="empty-icon">\u{1F3C5}</div><p>Noch keine Aktivit\u00E4ten.<br>Leg los!</p></div>`;
  } catch (err) {
    console.error('renderScore error:', err);
  }
}
