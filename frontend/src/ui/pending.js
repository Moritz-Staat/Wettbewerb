import { getActivities, approveActivity, rejectActivity } from '../api.js';
import { DISC_LABEL, DISC_ICON } from '../config.js';
import { ICON } from '../icons.js';
import { toast } from './toast.js';
import { openLightbox } from './lightbox.js';
import { renderScore } from './score.js';
import { getAppState } from '../main.js';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export async function renderPending() {
  updateBadge();
  const state = getAppState();
  const me = state.me;

  try {
    const activities = await getActivities();
    const pending = (activities || []).filter(a => a.status === 'pending');
    const el = document.getElementById('pendingList');

    if (!pending.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">${ICON.check}</div><p>Alles best\u00E4tigt!</p></div>`;
      return;
    }

    el.innerHTML = pending.map(a => {
      const isOwn = a.user === me.username;
      const userName = isOwn ? me.displayName : (state.rival?.displayName || 'Rival');
      const initial = userName.charAt(0).toUpperCase();
      const rivalName = isOwn ? (state.rival?.displayName || 'Rival') : me.displayName;
      const canApprove = !isOwn;
      const photoSrc = a.photo ? (a.photo.startsWith('http') || a.photo.startsWith('/') ? a.photo : '/uploads/' + a.photo) : null;

      return `<div class="pending-card">
        <div class="pending-card-body">
          <div class="pending-header">
            <div class="pending-who">
              <div class="avatar ${!isOwn ? 'rival-av' : ''}">${initial}</div>
              <div>
                <div class="pending-who-name">${userName}</div>
                <div class="pending-who-date">${fmtDate(a.date)}</div>
              </div>
            </div>
            <div class="pending-pts-big">${a.pts} Pkt</div>
          </div>
          <div class="pending-disc">${DISC_ICON[a.disc] || ''} ${DISC_LABEL[a.disc] || a.disc}</div>
          <div class="pending-detail">${a.valueLabel || ''}${a.note ? ' \u00B7 ' + a.note : ''}</div>
          ${photoSrc
            ? `<div class="pending-img"><img src="${photoSrc}" alt="Beweis"></div>`
            : `<div class="pending-img" style="border-radius:8px;margin-bottom:12px">${ICON.camera}</div>`}
          ${canApprove
            ? `<div class="pending-actions">
                <button class="btn-approve" data-approve-id="${a.id || a._id}">\u2713 Best\u00E4tigen</button>
                <button class="btn-reject" data-reject-id="${a.id || a._id}">\u2717 Ablehnen</button>
               </div>`
            : `<div class="pending-waiting">Warte auf Best\u00E4tigung von ${rivalName}</div>`}
        </div>
      </div>`;
    }).join('');

    // Attach event listeners for approve/reject buttons
    el.querySelectorAll('[data-approve-id]').forEach(btn => {
      btn.addEventListener('click', () => approve(btn.dataset.approveId));
    });
    el.querySelectorAll('[data-reject-id]').forEach(btn => {
      btn.addEventListener('click', () => reject(btn.dataset.rejectId));
    });

    el.querySelectorAll('.pending-img img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openLightbox(img.src));
    });
  } catch (err) {
    console.error('renderPending error:', err);
  }
}

export async function approve(id) {
  try {
    await approveActivity(id);
    toast('Best\u00E4tigt!');
    renderPending();
    renderScore();
  } catch (err) {
    toast(' Fehler: ' + err.message);
  }
}

export async function reject(id) {
  try {
    await rejectActivity(id);
    toast(' Abgelehnt');
    renderPending();
  } catch (err) {
    toast(' Fehler: ' + err.message);
  }
}

export async function updateBadge() {
  try {
    const activities = await getActivities();
    const state = getAppState();
    const me = state.me;
    const n = (activities || []).filter(a => a.status === 'pending' && a.user !== me?.username).length;
    const b = document.getElementById('pendingBadge');
    b.textContent = n;
    b.classList.toggle('on', n > 0);
  } catch {
    // silently fail
  }
}
