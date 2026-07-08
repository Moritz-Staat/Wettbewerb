import { createActivity } from '../api.js';
import { calcPts } from '../scoring.js';
import { DISC_LABEL } from '../config.js';
import { ICON } from '../icons.js';
import { toast } from './toast.js';
import { updateBadge } from './pending.js';
import { getAppState } from '../main.js';

let selDisc = null;
let together = false;
let photoFile = null;

const DISC_CONFIG = {
  steps:  { label: 'Anzahl Schritte', placeholder: '8000', step: '1', inputmode: 'numeric', unit: 'Schritte', needsPhoto: false, needsTogether: false, minVal: 4000, minMsg: 'Mindestens 4.000 Schritte f\u00FCr Punkte' },
  run:    { label: 'Kilometer',       placeholder: '5.0',  step: '0.1', inputmode: 'decimal', unit: 'km', needsPhoto: true, needsTogether: true, minVal: 0.1, minMsg: 'Bitte Kilometer eingeben' },
  bike:   { label: 'Kilometer',       placeholder: '15',   step: '0.1', inputmode: 'decimal', unit: 'km', needsPhoto: true, needsTogether: true, minVal: 0.1, minMsg: 'Bitte Kilometer eingeben' },
  ebike:  { label: 'Kilometer',       placeholder: '20',   step: '0.1', inputmode: 'decimal', unit: 'km', needsPhoto: true, needsTogether: true, minVal: 0.1, minMsg: 'Bitte Kilometer eingeben' },
  gym:    { label: null,              placeholder: null,   step: null,  inputmode: null,      unit: null, needsPhoto: true, needsTogether: true, minVal: null, minMsg: null },
  physio: { label: 'Minuten',         placeholder: '30',   step: '1', inputmode: 'numeric', unit: 'Min', needsPhoto: true, needsTogether: true, minVal: 15, minMsg: 'Mindestens 15 Minuten f\u00FCr Punkte' },
  circus: { label: 'Minuten',         placeholder: '60',   step: '1', inputmode: 'numeric', unit: 'Min', needsPhoto: true, needsTogether: true, minVal: 30, minMsg: 'Mindestens 30 Minuten f\u00FCr Punkte' },
  free:   { label: 'Punkte',          placeholder: '20',   step: '1', inputmode: 'numeric', unit: 'Pkt', needsPhoto: true, needsTogether: true, minVal: 1, minMsg: 'Bitte Punkte eingeben' },
};

export function selectDisc(disc) {
  selDisc = disc;
  const cfg = DISC_CONFIG[disc];
  if (!cfg) return;

  document.querySelectorAll('.disc-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('disc-' + disc).classList.add('selected');
  document.getElementById('logForm').style.display = 'block';

  // Reset state
  photoFile = null;
  together = false;
  document.getElementById('photoPreview').style.display = 'none';
  document.getElementById('noteInput').value = '';
  document.getElementById('togetherToggle').classList.remove('on');
  document.getElementById('initiatorGroup').style.display = 'none';

  // Date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dateInput').value = today;

  // Value input
  const vg = document.getElementById('valueGroup');
  const vi = document.getElementById('valueInput');
  const vl = document.getElementById('valueLabel');

  if (cfg.label) {
    vg.style.display = 'block';
    vl.textContent = cfg.label;
    vi.value = '';
    vi.placeholder = cfg.placeholder;
    vi.step = cfg.step;
    vi.inputMode = cfg.inputmode;
    vi.min = cfg.minVal > 0 ? '0' : '0';
  } else {
    vg.style.display = 'none';
    vi.value = '';
  }

  // Together toggle
  document.getElementById('togetherRow').style.display = cfg.needsTogether ? 'flex' : 'none';

  // Photo
  document.getElementById('photoZone').style.display = cfg.needsPhoto ? 'block' : 'none';
  document.getElementById('photoInput').value = '';

  // Submit button
  document.getElementById('submitBtn').textContent =
    disc === 'steps' ? 'Schritte eintragen' : 'Eintragen & zur Best\u00E4tigung senden';

  calcPreview();
  document.getElementById('logForm').scrollIntoView({ behavior: 'smooth' });
}

export function flipTogether() {
  together = !together;
  document.getElementById('togetherToggle').classList.toggle('on', together);
  document.getElementById('initiatorGroup').style.display = together ? 'block' : 'none';
  calcPreview();
}

export function calcPreview() {
  if (!selDisc) return;
  const v = parseFloat(document.getElementById('valueInput').value) || (selDisc === 'gym' ? 1 : 0);
  const ini = document.getElementById('initiatorSel').value;
  document.getElementById('ptsNum').textContent = calcPts(selDisc, v, together, ini, 'me');
}

export function onPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  photoFile = file;
  const r = new FileReader();
  r.onload = ev => {
    const p = document.getElementById('photoPreview');
    p.src = ev.target.result;
    p.style.display = 'block';
  };
  r.readAsDataURL(file);
}

export async function submitActivity() {
  if (!selDisc) return;
  const cfg = DISC_CONFIG[selDisc];
  if (!cfg) return;

  const v = parseFloat(document.getElementById('valueInput').value) || (selDisc === 'gym' ? 1 : 0);
  const date = document.getElementById('dateInput').value;
  const note = document.getElementById('noteInput').value.trim();
  const ini = document.getElementById('initiatorSel').value;

  // Validate value
  if (cfg.minVal !== null && v < cfg.minVal) {
    toast(cfg.minMsg);
    return;
  }

  // Validate photo
  if (cfg.needsPhoto && !photoFile) {
    toast('Bitte Beweisfoto hochladen!');
    return;
  }

  // Validate date
  if (!date) {
    toast('Bitte Datum ausw\u00E4hlen');
    return;
  }

  const pts = calcPts(selDisc, v, together, ini, 'me');

  const formData = new FormData();
  formData.append('disc', selDisc);
  formData.append('value', v);
  formData.append('date', date);
  formData.append('note', note);
  formData.append('together', together);
  if (together) formData.append('initiator', ini);
  if (photoFile) formData.append('photo', photoFile);

  try {
    await createActivity(formData);
    updateBadge();
    toast(selDisc === 'steps' ? 'Schritte eingetragen!' : 'Gesendet! Warte auf Best\u00E4tigung.');

    selDisc = null;
    photoFile = null;
    document.querySelectorAll('.disc-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('logForm').style.display = 'none';
  } catch (err) {
    toast('Fehler: ' + err.message);
  }
}
