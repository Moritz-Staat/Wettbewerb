export function calcPts(disc, val, together, initiator, side) {
  let p = 0;
  if (disc === 'steps')  p = val >= 4000 ? Math.floor(val / 100) : 0;
  if (disc === 'run')    p = val * 5;
  if (disc === 'bike')   p = val * 2;
  if (disc === 'ebike')  p = val * 1;
  if (disc === 'gym')    p = 30;
  if (disc === 'physio') p = Math.floor(val / 15) * 10;
  if (disc === 'circus') p = Math.floor(val / 30) * 15;
  if (disc === 'free')   p = val;
  if (together && initiator === side) p += 2;
  return Math.max(0, Math.round(p * 10) / 10);
}
