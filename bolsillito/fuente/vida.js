// ================= Cuarto con más vida: misiones del día con tu mascota =================
(function () {
const A = App, S = A.S, { esc, toast } = A;
const ACT = A.ACTIONS;
const state = () => { const v = S.settings.vida = S.settings.vida || {}; if (v.day !== A.today()) { S.settings.vida = { day: A.today(), seen: {}, claimed: {}, bonus: false, streak: v.streak || 0, last: v.last || '' }; } return S.settings.vida; };
const MISSIONS = [
  { id: 'anotar', t: 'Anota un gasto o ingreso', hint: 'Cualquier movimiento de hoy cuenta', auto: () => S.tx.some(x => x.date === A.today() && x.type !== 'loan_out' && x.type !== 'loan_in') },
  { id: 'mimar', t: 'Dale cariño a tu mascota', hint: 'Tócala en el cuarto', auto: () => !!state().seen.mimar },
  { id: 'tienda', t: 'Pasa por la Tiendita', hint: 'Mira qué hay de nuevo', auto: () => !!state().seen.tienda },
  { id: 'amistad', t: 'Visita a una amistad', hint: 'Entra a Amistades o Visitas', auto: () => !!state().seen.amistad }
];
const done = m => m.auto();
const petName = () => { try { const k = A.petActive && A.petActive(); const i = k && A.petInfo(k); return (i && i.name) || ''; } catch (e) { return ''; } };
const say = (n, all) => {
  const p = petName() || 'Tu mascota';
  if (all) return `${p} está feliz: ¡hicieron todo hoy!`;
  if (n === 0) return `${p} te espera para empezar el día`;
  if (n === 1) return `${p} dice: ¡vamos bien!`;
  return `${p} está contenta, ya casi terminan`;
};
function card() {
  const v = state(), n = MISSIONS.filter(done).length, all = n === MISSIONS.length;
  return `<div class="card vd-card"><div class="row between"><b>Misiones de hoy</b><span class="faint">${n}/${MISSIONS.length}${v.streak > 1 ? ' · racha ' + v.streak + ' días' : ''}</span></div>
<div class="vd-say">${esc(say(n, all))}</div>
${MISSIONS.map(m => { const d = done(m), c = v.claimed[m.id]; return `<div class="vd-m ${d ? 'on' : ''}"><span class="vd-ck">${d ? '✓' : ''}</span><span class="vd-tx"><b>${m.t}</b><small>${m.hint}</small></span>${c ? '<span class="faint">+2 ✦</span>' : d ? `<button class="btn sm pink" data-act="vidaClaim" data-id="${m.id}">Recoger +2</button>` : ''}</div>`; }).join('')}
${all ? (v.bonus ? '<div class="vd-bonus">¡Premio del día recogido! ✦</div>' : '<button class="btn pink" data-act="vidaBonus" style="justify-content:center;width:100%">Premio del día +6 ✦</button>') : '<div class="faint" style="text-align:center">Completa las 4 para un premio extra</div>'}</div>`;
}
ACT.vidaClaim = a => { const v = state(), m = MISSIONS.find(x => x.id === a.dataset.id); if (!m || v.claimed[m.id] || !done(m)) return; v.claimed[m.id] = 1; A.giveStars(2); A.saveSettings(); toast('+2 estrellitas ✦'); A.render(); };
ACT.vidaBonus = () => {
  const v = state(); if (v.bonus || !MISSIONS.every(done)) return; v.bonus = true; A.giveStars(6);
  const y = new Date(A.parseYmd(A.today()).getTime() - 864e5), yk = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
  v.streak = v.last === yk ? (v.streak || 0) + 1 : 1; v.last = A.today();
  if (v.streak > 0 && v.streak % 7 === 0) { A.giveStars(10); toast(`¡${v.streak} días seguidos! +10 extra ✦`); } else toast('¡Premio del día! +6 estrellitas ✦');
  A.saveSettings(); A.render();
};
// marcar misiones: tocar mascota, entrar a tienda, entrar a amistades
document.addEventListener('click', e => { const pt = e.target.closest('.rm-pet[data-pk]'); if (pt && !pt.closest('.room.editing') && !pt.classList.contains('sleep')) { const v = state(); if (!v.seen.mimar) { v.seen.mimar = 1; A.saveSettings(); setTimeout(() => { if (['rincon', 'cuarto'].includes(S.route)) A.render(); }, 700); } } });
const mark = () => { const v = state(), r = S.route; let ch = false; if (r === 'tienda' && !v.seen.tienda) { v.seen.tienda = 1; ch = true; } if (['amigos', 'visitas', 'compartidas'].includes(r) && !v.seen.amistad) { v.seen.amistad = 1; ch = true; } if (ch) A.saveSettings(); };
const r0 = A.render; A.render = function () { try { mark(); } catch (e) { } return r0.apply(this, arguments); };
const c0 = A.screens.cuarto; A.screens.cuarto = function () { const h = c0.apply(this, arguments); const k = '<div class="seg"><button data-act="rmTab"'; const i = h.indexOf(k); return i < 0 || S.roomEdit ? h : h.slice(0, i) + card() + h.slice(i); };
})();
