// ================= Cuarto con más vida: misiones del día con tu mascota =================
(function () {
const A = App, S = A.S, { esc, toast } = A;
const ACT = A.ACTIONS;
A.pxi = (n, w) => Pix.has(n) ? `<img class="pixel" alt="" src="${Pix.sprite(n, 2)}" style="width:${w || 20}px;height:auto;vertical-align:middle">` : '';
const state = () => { const v = S.settings.vida = S.settings.vida || {}; if (v.day !== A.today()) { S.settings.vida = { day: A.today(), seen: {}, claimed: {}, bonus: false, vis: 0, streak: v.streak || 0, last: v.last || '' }; } return S.settings.vida; };
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
const MIC = { anotar: 'billetera', mimar: 'corazon_rosa', tienda: 'bolsa', amistad: 'casita' };
function card() {
  if (A.pnStyles) A.pnStyles();
  const v = state(), n = MISSIONS.filter(done).length, all = n === MISSIONS.length, sp = (k, s) => Pix.sprite(k, s);
  const stars = MISSIONS.map((m, i) => `<img class="pixel vd-st ${i < n ? 'on' : ''}" alt="" src="${sp('estrellita', 2)}">`).join('');
  return `<div class="vd-board"><div class="vd-head pn pn-wood"><span class="vd-ttl">Misiones de hoy</span><span class="vd-stars">${stars}</span>${v.streak > 1 ? `<span class="vd-streak"><img class="pixel" alt="" src="${sp('fuego', 2)}">${v.streak}</span>` : ''}</div>
<div class="vd-body pn pn-cream"><div class="vd-say"><img class="pixel" alt="" src="${sp('brillito', 2)}">${esc(say(n, all))}</div>
${MISSIONS.map(m => { const d = done(m), c = v.claimed[m.id]; return `<div class="vd-m pn pn-slot ${d ? 'on' : ''}"><span class="vd-ico"><img class="pixel" alt="" src="${sp(MIC[m.id] || 'estrellita', 3)}"></span><span class="vd-tx"><b>${m.t}</b><small>${m.hint}</small></span>${c ? `<span class="vd-got pn pn-tag">+2</span>` : d ? `<button class="vd-claim pn pn-pink" data-act="vidaClaim" data-id="${m.id}">Recoger +2</button>` : '<span class="vd-ring"></span>'}</div>`; }).join('')}
${all ? (v.bonus ? '<div class="vd-bonus pn pn-tag">¡Premio del día recogido!</div>' : '<button class="vd-prize pn pn-pink" data-act="vidaBonus">Premio del día +6</button>') : '<div class="vd-hint">Completa las 4 para un premio extra</div>'}</div></div>`;
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
const c0 = A.screens.cuarto; A.screens.cuarto = function () { const h = c0.apply(this, arguments); const k = '<div class="seg"><button data-act="rmTab"'; const i = h.indexOf(k); return i < 0 || S.roomEdit || (S.settings.cfg || {}).misiones === false ? h : h.slice(0, i) + card() + h.slice(i); };

// ---------- Vida en el cuarto: mascotas que pasean, visitas sorpresa, reacciones y muebles que responden ----------
const roomEl = () => { if (!['rincon', 'cuarto'].includes(S.route)) return null; const r = document.querySelector('.room:not(.editing)'); return r && r.offsetParent ? r : null; };
const rnd = (a, b) => a + Math.random() * (b - a);
const float = (room, html, x, y, cls) => { const e = document.createElement('span'); e.className = 'vd-fl ' + (cls || ''); e.innerHTML = html; e.style.left = x + '%'; e.style.top = y + '%'; room.appendChild(e); setTimeout(() => e.remove(), 1700); };
// 1) las mascotas despiertas pasean por el piso
const wander = () => { const room = roomEl(); if (!room || document.hidden) return; room.querySelectorAll('.rm-pet:not(.sleep)').forEach((p, i) => { if (Math.random() < .35) return; const top = parseFloat(p.style.top) || 60; p.style.transition = 'left 3.2s ease-in-out, top 3.2s ease-in-out'; p.style.left = rnd(8, 74).toFixed(1) + '%'; p.style.top = Math.max(52, Math.min(80, top + rnd(-7, 7))).toFixed(1) + '%'; }); };
// 2) visitas sorpresa que se recogen tocándolas
const VIS = [['mariposa', 1, 'Una mariposa te trajo una estrellita'], ['campanita', 1, 'Una campanita te trajo una estrellita'], ['flower', 1, 'Una florecita te dejó una estrellita'], ['regalo_cerrado', 2, 'Te llegó un regalito con estrellitas']];
const visit = () => { const room = roomEl(); if (!room || document.hidden) return; const v = state(); if ((v.vis || 0) >= 5 || room.querySelector('.vd-vis')) return; const t = VIS[Math.floor(Math.random() * (Math.random() < .15 ? VIS.length : VIS.length - 1))];
  const e = document.createElement('button'); e.type = 'button'; e.className = 'vd-vis'; e.innerHTML = A.pxi(t[0], 30); e.style.top = rnd(18, 70).toFixed(0) + '%'; e.style.setProperty('--dx', rnd(-30, 30).toFixed(0) + 'px'); room.appendChild(e);
  const bye = setTimeout(() => e.remove(), 14000);
  e.onclick = ev => { ev.stopPropagation(); clearTimeout(bye); const v2 = state(); v2.vis = (v2.vis || 0) + 1; A.giveStars(t[1]); A.saveSettings(); const r = e.getBoundingClientRect(), rr = room.getBoundingClientRect(); float(room, '+' + t[1] + ' ✦', ((r.left - rr.left) / rr.width * 100), ((r.top - rr.top) / rr.height * 100)); e.remove(); toast(t[2] + ' ✦'); };
};
// 3) la mascota reacciona a cómo vas con tu dinero
const mes = () => { const k = A.today().slice(0, 7); let inc = 0, exp = 0; S.tx.forEach(x => { if (x.date.slice(0, 7) !== k) return; if (x.type === 'income') inc += +x.amount || 0; else if (x.type === 'expense') exp += +x.amount || 0; }); return { inc, exp }; };
const mood = () => { const { inc, exp } = mes(), hoy = S.tx.filter(x => x.date === A.today() && x.type === 'expense').length;
  if (!inc && !exp) return ['¡Anotemos algo hoy!', 'flower'];
  if (inc && exp > inc) return ['Uy, este mes va gastado… pero tú puedes', 'gota'];
  if (inc && exp < inc * .5) return ['¡Vas ahorrando muy bien!', 'estrellita'];
  if (!hoy) return ['Hoy no has gastado nada, ¡qué bien!', 'brillito'];
  return ['Vamos paso a paso, tú puedes', 'corazon_rosa']; };
document.addEventListener('click', e => {
  const room = roomEl(); if (!room) return;
  const pet = e.target.closest('.rm-pet[data-pk]');
  if (pet && !pet.classList.contains('sleep')) { room.querySelectorAll('.vd-bub').forEach(x => x.remove()); const [msg, em] = mood(); const b = document.createElement('div'); b.className = 'vd-bub'; b.innerHTML = A.pxi(em, 16) + ' ' + esc(msg); const rr = room.getBoundingClientRect(), pr = pet.getBoundingClientRect(); b.style.left = Math.max(4, Math.min(52, (pr.left - rr.left) / rr.width * 100 - 6)) + '%'; b.style.top = Math.max(2, (pr.top - rr.top) / rr.height * 100 - 14) + '%'; room.appendChild(b); setTimeout(() => b.remove(), 3200); return; }
  const it = e.target.closest('.rm-it'); if (it) { const n = (it.alt || '').toLowerCase(); const rr = room.getBoundingClientRect(), r = it.getBoundingClientRect(); const x = (r.left - rr.left + r.width / 2) / rr.width * 100, y = (r.top - rr.top) / rr.height * 100;
    it.classList.remove('vd-pop'); void it.offsetWidth; it.classList.add('vd-pop'); setTimeout(() => it.classList.remove('vd-pop'), 700);
    const em = /l[aá]mpara|vela|luz|farol/.test(n) ? 'foco' : /tele|tv|pantalla/.test(n) ? 'laptop' : /radio|tocadisco|bocina|piano|guitarra|m[uú]sica/.test(n) ? 'music' : /planta|flor|maceta|cactus|jard/.test(n) ? 'brote' : /cama|sof[aá]|sill|puff|coj[ií]n/.test(n) ? 'zzz' : /libro|librero|escritorio/.test(n) ? 'book' : /espejo/.test(n) ? 'brillito' : /cocina|mesa|caf|t[eé]/.test(n) ? 'coffee' : 'corazon_rosa';
    float(room, A.pxi(em, 22), x, y); }
});
setInterval(wander, 7000); setInterval(() => { if (Math.random() < .5) visit(); }, 22000); setTimeout(visit, 6000);
})();

// ---------- Vida en el cuarto: mascotas que pasean, mariposas, burbujas y muebles que reaccionan ----------
(function () {
const A = App, S = A.S, { toast } = A;
const st = () => { const v = S.settings.vida; return v; };
let timers = [];
const stop = () => { timers.forEach(clearInterval); timers.forEach(clearTimeout); timers = []; };
const pnum = s => parseFloat(String(s)) || 0;
const BUB = {
  rico: ['¡Este mes vas ganando!', 'Qué bien se siente ahorrar', 'Guardaste más de lo que gastaste'],
  justo: ['Vamos con calma este mes', 'Cuidemos juntas el presupuesto', 'Un día a la vez'],
  hoy: ['¡Anotaste hoy, qué orgullo!', 'Gracias por anotar hoy'],
  nada: ['¿Anotamos algo hoy?', 'Te extrañaba', 'Aquí estoy contigo'],
  noche: ['Qué sueño…', 'Hora de descansar']
};
const pick = a => a[Math.floor(Math.random() * a.length)];
function mood() {
  const hoy = S.tx.some(x => x.date === A.today() && x.type !== 'loan_out' && x.type !== 'loan_in');
  const m = A.today().slice(0, 7); let inc = 0, exp = 0; S.tx.forEach(x => { if (x.date.slice(0, 7) !== m) return; if (x.type === 'income') inc += +x.amount || 0; else if (x.type === 'expense') exp += +x.amount || 0; });
  if (new Date().getHours() >= 22) return pick(BUB.noche);
  if (inc > 0 && inc > exp * 1.15) return pick(BUB.rico);
  if (exp > 0 && inc > 0) return pick(BUB.justo);
  return hoy ? pick(BUB.hoy) : pick(BUB.nada);
}
function bubble(box, anchor, txt) {
  box.querySelectorAll('.vd-bub').forEach(b => b.remove());
  const b = document.createElement('div'); b.className = 'vd-bub'; b.textContent = txt;
  const x = Math.max(8, Math.min(62, pnum(anchor.style.left) - 10)); b.style.left = x + '%'; b.style.top = Math.max(2, pnum(anchor.style.top) - 16) + '%'; box.appendChild(b); setTimeout(() => b.remove(), 2800);
}
function floatEmoji(box, x, y, e) { const s = document.createElement('span'); s.className = 'vd-fl'; if (/^[a-z_]+$/.test(e)) s.innerHTML = A.pxi(e, 22); else s.textContent = e; s.style.left = x + '%'; s.style.top = y + '%'; box.appendChild(s); setTimeout(() => s.remove(), 1400); }
const FEMO = [[/tele|tv|pantalla|compu/, 'laptop'], [/lamp|luz|vela|farol/, 'foco'], [/radio|tocadisc|music|piano|bocina/, 'music'], [/planta|maceta|flor|jard/, 'brote'], [/cama|sofa|sillon|puff|cojin/, 'zzz'], [/libro|estante|librero/, 'book'], [/pastel|cocina|mesa|taza|cafe/, 'coffee']];
function wander(box) {
  const pets = [...box.querySelectorAll('.rm-pet:not(.sleep):not(.guest)')].filter(p => { const n = p.nextElementSibling; return !(n && /rm-(note|food)/.test(n.className)); });
  pets.forEach(p => { if (!p.dataset.hx) { p.dataset.hx = pnum(p.style.left); p.dataset.hy = pnum(p.style.top); p.style.transition = 'left 2.6s ease-in-out, top 2.6s ease-in-out'; } });
  const go = () => { if (!box.isConnected) return stop(); pets.forEach(p => {
    if (Math.random() < .35) return; const hx = +p.dataset.hx, hy = +p.dataset.hy; const nx = Math.max(4, Math.min(76, hx + (Math.random() * 30 - 15))), ny = Math.max(38, Math.min(82, hy + (Math.random() * 10 - 5)));
    const dir = nx < pnum(p.style.left) ? -1 : 1; p.querySelectorAll('img').forEach(i => i.style.transform = dir < 0 ? 'scaleX(-1)' : ''); p.style.left = nx + '%'; p.style.top = ny + '%';
  }); };
  timers.push(setInterval(go, 5200)); timers.push(setTimeout(go, 900));
}
function butterflies(box) {
  const spawn = () => {
    if (!box.isConnected) return stop(); const v = S.settings.vida; if (!v) return; const left = 5 - (v.bf || 0); if (left <= 0 || document.hidden) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'vd-bf'; b.setAttribute('aria-label', 'Mariposa'); b.innerHTML = A.pxi('mariposa', 26); b.style.top = (25 + Math.random() * 40) + '%';
    b.onclick = e => { e.stopPropagation(); b.remove(); const vv = S.settings.vida; vv.bf = (vv.bf || 0) + 1; A.giveStars(1); A.saveSettings(); floatEmoji(box, pnum(b.style.left) || 50, pnum(b.style.top), '+1 ✦'); };
    box.appendChild(b); setTimeout(() => b.remove(), 9000);
  };
  timers.push(setInterval(spawn, 32000)); timers.push(setTimeout(spawn, 9000));
}
const a0 = A.after.cuarto;
A.after.cuarto = function (el) {
  a0 && a0.apply(this, arguments); stop();
  const box = el.querySelector('#roomBox'); if (!box || S.roomEdit || box.dataset.vida) return; box.dataset.vida = 1; if (S.settings.vida) { const v = state2(); }
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cf = S.settings.cfg || {}; if (cf.paseo !== false) wander(box); if (cf.mariposas !== false) butterflies(box);
  box.addEventListener('click', e => {
    if ((S.settings.cfg || {}).reacciones === false) return;
    const pet = e.target.closest('.rm-pet:not(.guest)'); if (pet && !pet.classList.contains('sleep')) { bubble(box, pet, mood()); return; }
    const it = e.target.closest('.rm-it'); if (!it) return; it.classList.remove('vd-wig'); void it.offsetWidth; it.classList.add('vd-wig');
    const k = (it.alt || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); const e0 = (FEMO.find(([r]) => r.test(k)) || [0, 'brillito'])[1]; floatEmoji(box, pnum(it.style.left) + 4, pnum(it.style.top) - 4, e0);
  });
};
function state2() { return S.settings.vida; }
})();
