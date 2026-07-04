import { renderScore } from './score.js';
import { renderPending } from './pending.js';
import { renderHistory } from './history.js';
import { renderStats } from './stats.js';

let currentPeriod = 'month';

export function getPeriod() {
  return currentPeriod;
}

export function go(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('nav-' + page).classList.add('active');
  if (page === 'score')   renderScore();
  if (page === 'pending') renderPending();
  if (page === 'history') renderHistory();
  if (page === 'stats')   renderStats();
}

export function setPeriod(period) {
  currentPeriod = period;
  document.querySelectorAll('.period-chip').forEach(c => c.classList.remove('active'));
  document.getElementById('period-' + period).classList.add('active');
  renderScore();
}
