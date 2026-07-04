import './styles/main.css';
import { isLoggedIn, getMe, getRival, clearToken } from './api.js';
import { renderScore } from './ui/score.js';
import { updateBadge } from './ui/pending.js';
import { go, setPeriod } from './ui/navigation.js';
import { selectDisc, flipTogether, calcPreview, onPhoto, submitActivity } from './ui/log.js';
import { initAuth } from './ui/auth.js';
import { toast } from './ui/toast.js';

// App state
const appState = {
  me: null,
  rival: null,
};

export function getAppState() {
  return appState;
}

function showAuth() {
  document.getElementById('auth-screen').style.display = 'block';
  document.getElementById('app-wrapper').style.display = 'none';
}

function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-wrapper').style.display = 'block';
}

async function loadUserData() {
  try {
    const [me, rival] = await Promise.all([getMe(), getRival().catch(() => null)]);
    appState.me = me;
    appState.rival = rival;

    // Update topbar
    const initial = me.displayName?.charAt(0)?.toUpperCase() || '?';
    document.getElementById('topAvatar').textContent = initial;
    document.getElementById('topName').textContent = me.displayName || me.username;

    // Update initiator select
    const iniSel = document.getElementById('initiatorSel');
    iniSel.querySelector('option[value="me"]').textContent = `Ich (${me.displayName})`;
    if (rival) {
      iniSel.querySelector('option[value="rival"]').textContent = rival.displayName;
    }
  } catch (err) {
    console.error('Failed to load user data:', err);
    clearToken();
    showAuth();
    return false;
  }
  return true;
}

async function initApp() {
  const ok = await loadUserData();
  if (!ok) return;
  showApp();
  renderScore();
  updateBadge();
}

// Wire up event listeners
function wireEvents() {
  // Navigation
  document.getElementById('nav-score').addEventListener('click', () => go('score'));
  document.getElementById('nav-log').addEventListener('click', () => go('log'));
  document.getElementById('nav-pending').addEventListener('click', () => go('pending'));
  document.getElementById('nav-history').addEventListener('click', () => go('history'));

  // Period chips
  document.getElementById('period-month').addEventListener('click', () => setPeriod('month'));
  document.getElementById('period-all').addEventListener('click', () => setPeriod('all'));

  // Discipline cards
  ['steps', 'run', 'bike', 'ebike', 'gym', 'physio', 'circus', 'free'].forEach(disc => {
    document.getElementById('disc-' + disc).addEventListener('click', () => selectDisc(disc));
  });

  // Log form
  document.getElementById('valueInput').addEventListener('input', calcPreview);
  document.getElementById('initiatorSel').addEventListener('change', calcPreview);
  document.getElementById('togetherToggle').addEventListener('click', flipTogether);
  document.getElementById('photoInput').addEventListener('change', onPhoto);
  document.getElementById('submitBtn').addEventListener('click', submitActivity);

  // User pill - logout on click
  document.getElementById('userPill').addEventListener('click', () => {
    if (confirm('Ausloggen?')) {
      clearToken();
      window.location.reload();
    }
  });
}

// Boot
wireEvents();
initAuth(async () => {
  await initApp();
});

if (isLoggedIn()) {
  initApp();
} else {
  showAuth();
}
