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

export function selectDisc(disc) {
  selDisc = disc;
  document.querySelectorAll('.disc-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('disc-' + disc).classList.add('selected');
  document.getElementById('logForm').style.display = 'block';
  photoFile = null;
  document.getElementById('photoPreview').style.display = 'none';
  document.getElementById('valueInput').value = '';
  document.getElementById('noteInput').value = '';
  together = false;
  document.getElementById('togetherToggle').classList.remove('on');
  document.getElementById('initiatorGroup').style.display = 'none';

  const vg = document.getElementById('valueGroup');
  const vl = document.getElementById('valueLabel');
  const tr = document.getElementById('togetherRow');
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dateInput').value = today;

  if (disc === 'steps') {
    vg.style.display = 'block'; vl.textContent = 'Anzahl Schritte';
    document.getElementById('valueInput').placeholder = '8000';
    tr.style.display = 'none';
    document.getElementById('photoZone').style.display = 'none';
    document.getElementById('submitBtn').textContent = 'Schritte eintragen';
  } else if (['run', 'bike', 'ebike'].includes(disc)) {
    vg.style.display = 'block'; vl.textContent = 'Kilometer';
    document.getElementById('valueInput').placeholder = '5.0';
    tr.style.display = 'flex'; document.getElementById('photoZone').style.display = 'block';
    document.getElementById('submitBtn').textContent = 'Eintragen & zur Best\u00E4tigung senden';
  } else if (disc === 'gym') {
    vg.style.display = 'none'; tr.style.display = 'flex';
    document.getElementById('photoZone').style.display = 'block';
    document.getElementById('submitBtn').textContent = 'Eintragen & zur Best\u00E4tigung senden';
  } else if (disc === 'physio') {
    vg.style.display = 'block'; vl.textContent = 'Minuten';
    document.getElementById('valueInput').placeholder = '30';
    tr.style.display = 'flex'; document.getElementById('photoZone').style.display = 'block';
    document.getElementById('submitBtn').textContent = 'Eintragen & zur Best\u00E4tigung senden';
  } else if (disc === 'circus') {
    vg.style.display = 'block'; vl.textContent = 'Minuten';
    document.getElementById('valueInput').placeholder = '60';
    tr.style.display = 'flex'; document.getElementById('photoZone').style.display = 'block';
    document.getElementById('submitBtn').textContent = 'Eintragen & zur Best\u00E4tigung senden';
  } else if (disc === 'free') {
    vg.style.display = 'block'; vl.textContent = 'Punkte (selbst vergeben)';
    document.getElementById('valueInput').placeholder = '20';
    tr.style.display = 'flex'; document.getElementById('photoZone').style.display = 'block';
    document.getElementById('submitBtn').textContent = 'Eintragen & zur Best\u00E4tigung senden';
  }
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
  const v = parseFloat(document.getElementById('valueInput').value) || (selDisc === 'gym' ? 1 : 0);
  const date = document.getElementById('dateInput').value;
  const note = document.getElementById('noteInput').value.trim();
  const ini = document.getElementById('initiatorSel').value;

  if (!['steps', 'gym'].includes(selDisc) && !photoFile) {
    toast('Bitte Beweisfoto hochladen!');
    return;
  }
  const pts = calcPts(selDisc, v, together, ini, 'me');
  if (pts <= 0 && selDisc !== 'gym') {
    toast('Bitte Wert eingeben!');
    return;
  }

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
