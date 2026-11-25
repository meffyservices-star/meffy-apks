// ===== Pregúntale a tu mascota: chat con IA que conoce tus números =====
(function () {
const A = App, S = A.S, { esc, money, toast } = A, ACT = A.ACTIONS;
A.PAGES.ia = 'Tu mascota';
const spr = (n, k) => Pix.sprite(n, k || 3);
const online = () => window.Store && Store.mode === 'supa' && Store.sb;
const pet = () => { try { const p = A.petInfo(A.petActive ? A.petActive() : 'gochi'); return { name: p.name || 'Mochi', sprite: p.sprite || 'gochi' }; } catch (e) { return { name: 'Mochi', sprite: 'gochi' }; } };
const chat = () => (S.settings.iaChat = S.settings.iaChat || []);
let busy = false, left = null;
(function () { Pix.define && Object.values(A.PACKS || {}).forEach(p => { if (p.map) p.map.ia = 's:foco'; }); })();
// ---------- lo que la mascota sabe ----------
function ctx() {
  const k = A.ym(A.today()), l = A.txIn(k), ex = l.filter(t => t.type === 'expense'), inc = l.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const sv = ex.filter(t => A.cat(t.cat) && A.isSaving(A.cat(t.cat))), gas = ex.filter(t => !sv.includes(t)), tot = gas.reduce((a, t) => a + t.amount, 0), by = {};
  gas.forEach(t => { by[t.cat] = (by[t.cat] || 0) + t.amount; });
  const cats = S.fin.categories.filter(c => c.type !== 'income');
  const L = [];
  L.push(`Hoy: ${A.today()}. Mes: ${k}. Quedan ${Math.max(0, A.daysIn(k) - new Date().getDate())} días del mes.`);
  L.push(`Ingresos del mes: ${money(inc)}. Gastos del mes (sin ahorro): ${money(tot)}. Ahorrado este mes: ${money(sv.reduce((a, t) => a + t.amount, 0))}.`);
  L.push('Gasto por categoría (gastado / tope mensual):');
  cats.filter(c => by[c.id] || +c.budget).slice(0, 18).forEach(c => L.push(`- ${c.name}: ${money(by[c.id] || 0)} / ${+c.budget ? money(c.budget) : 'sin tope'}`));
  const hm = gas.filter(t => A.hormigaOk ? A.hormigaOk(t) : false); if (hm.length) L.push(`Gastos hormiga (compras chicas) este mes: ${money(hm.reduce((a, t) => a + t.amount, 0))} en ${hm.length} compras.`);
  const gl = (S.fin.goals || []).filter(g => !g.example); if (gl.length) { L.push('Metas de ahorro:'); gl.slice(0, 8).forEach(g => L.push(`- ${g.name}: ${money(g.saved || 0)} de ${money(g.target || 0)}`)); }
  const P = S.settings.planes || {}; if ((P.debts || []).length) { L.push('Deudas:'); P.debts.slice(0, 8).forEach(d => L.push(`- ${d.name}: faltan ${money(Math.max(0, d.total - (d.paid || 0)))} de ${money(d.total)}${d.cuota ? ', cuota ' + money(d.cuota) : ''}`)); }
  const lo = S.fin.loans || []; const me = lo.filter(x => x.dir === 'in').reduce((a, x) => a + Math.max(0, x.amount - (x.paid || 0)), 0), yo = lo.filter(x => x.dir === 'out').reduce((a, x) => a + Math.max(0, x.amount - (x.paid || 0)), 0); if (me || yo) L.push(`Le deben ${money(me)}. Ella debe ${money(yo)}.`);
  if (A.acctBalance) { try { L.push('Cuentas: ' + S.fin.accounts.slice(0, 8).map(a => `${a.name} ${money(A.acctBalance(a.id))}`).join('; ')); } catch (e) { } }
  L.push('Últimos movimientos:'); S.tx.slice(0, 25).forEach(t => L.push(`- ${t.date} ${t.type === 'income' ? 'ingreso' : t.type === 'expense' ? 'gasto' : t.type} ${money(t.amount)} ${(A.cat(t.cat) || {}).name || ''} ${t.note || ''}`.trim()));
  L.push('Categorías para anotar (id: nombre): ' + cats.map(c => `${c.id}: ${c.name}`).join(', ') + '. Ingresos: ' + S.fin.categories.filter(c => c.type === 'income').map(c => `${c.id}: ${c.name}`).join(', '));
  return L.join('\n').slice(0, 6800);
}
// ---------- pantalla ----------
const CH = ['¿Cómo voy este mes?', '¿Dónde se me va más plata?', '¿Puedo comprarme algo de $50?', 'Anota un gasto de $3 en café'];
const bubble = (m, i) => {
  if (m.role === 'user') return `<div class="ia-b me">${esc(m.content)}</div>`;
  const p = pet(), act = m.act && !m.done ? `<div class="ia-act"><b>${m.act.tipo === 'ingreso' ? 'Anotar ingreso' : 'Anotar gasto'}: ${money(m.act.monto)}</b><small>${esc(m.act.nota || '')}${A.cat(m.act.categoria) ? ' · ' + esc(A.cat(m.act.categoria).name) : ''}</small><div><button class="pl-btn" data-act="iaDo" data-i="${i}">Sí, anótalo</button><button class="pl-btn ghost" data-act="iaNo" data-i="${i}">No</button></div></div>` : m.act && m.done === 1 ? '<div class="ia-ok">Anotado</div>' : '';
  return `<div class="ia-row"><img class="pixel ia-av" alt="" src="${spr(p.sprite, 3)}"><div class="ia-b pet">${esc(m.content)}${act}</div></div>`;
};
A.screens.ia = () => {
  if (A.pnStyles) A.pnStyles(); const p = pet(), c = chat(); const nm = S.settings.name ? S.settings.name.split(' ')[0] : '';
  const hello = `<div class="ia-hero"><img class="pixel" alt="" src="${spr(p.sprite, 6)}"><b>Hola${nm ? ', ' + esc(nm) : ''}. Soy ${esc(p.name)}.</b><span>Pregúntame lo que quieras de tu plata. Me sé tus números.</span><div class="ia-chips">${CH.map(t => `<button class="ia-chip" data-act="iaChip" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;
  return `${A.header('ia')}<div class="ia-chat" id="iaChat">${c.length ? c.map(bubble).join('') : hello}${busy ? `<div class="ia-row"><img class="pixel ia-av" alt="" src="${spr(p.sprite, 3)}"><div class="ia-b pet typing"><i></i><i></i><i></i></div></div>` : ''}</div>
<div class="ia-bar"><div class="ia-in"><input id="iaIn" class="in" maxlength="300" placeholder="Escríbele a ${esc(p.name)}…" autocomplete="off"><button class="ia-send" data-act="iaSend" aria-label="Enviar">›</button></div>${left != null ? `<small>Te quedan ${left} preguntas hoy</small>` : ''}${c.length ? '<button class="ia-clear" data-act="iaClear">Empezar de nuevo</button>' : ''}</div>`;
};
A.after.ia = el => { const i = el.querySelector('#iaIn'); if (i) { i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); send(i.value); } }; } const c = el.querySelector('#iaChat'); setTimeout(() => { const last = c && c.lastElementChild; if (last) last.scrollIntoView({ block: 'end' }); }, 30); };
// ---------- enviar ----------
async function send(txt) {
  txt = (txt || '').trim(); if (!txt || busy) return;
  const c = chat(); if (!online()) { c.push({ role: 'user', content: txt }, { role: 'assistant', content: 'Para hablar conmigo necesitas internet y tener tu cuenta abierta. En cuanto vuelvas, aquí estoy.' }); return A.render(); }
  c.push({ role: 'user', content: txt }); while (c.length > 40) c.shift(); busy = true; A.render();
  let res;
  try { res = await Store.sb.functions.invoke('mascota-ia', { body: { messages: c.filter(m => !m.err).map(m => ({ role: m.role, content: m.content })), ctx: ctx(), pet: pet().name, name: (S.settings.name || '').split(' ')[0], plus: A.isPlus() } }); } catch (e) { res = { error: e }; }
  busy = false; let msg = { role: 'assistant', content: '' };
  const d = res && res.data, er = res && res.error; let code = d && d.error; if (!code && er && er.context && er.context.json) { try { const j = await er.context.json(); code = j.error; if (j.left != null) left = j.left; } catch (e) { } }
  if (d && d.reply) { left = d.left; let r = d.reply; const m = r.match(/<accion>([\s\S]*?)<\/accion>/); if (m) { r = r.replace(m[0], '').trim(); try { const a = JSON.parse(m[1]); if (a && +a.monto > 0) msg.act = { tipo: a.tipo === 'ingreso' ? 'ingreso' : 'gasto', monto: +a.monto, nota: String(a.nota || '').slice(0, 60), categoria: a.categoria }; } catch (e) { } } msg.content = r || 'Listo.'; }
  else if (code === 'limite') { left = 0; msg.content = 'Hoy ya hablamos mucho. Mañana me vuelves a preguntar lo que quieras.'; msg.err = 1; }
  else if (code === 'sin_clave') { msg.content = 'Todavía no tengo mi cerebrito conectado. Falta que se configure mi clave.'; msg.err = 1; }
  else { msg.content = 'Uy, no pude pensar bien. ¿Probamos otra vez en un ratito?'; msg.err = 1; }
  c.push(msg); A.saveSettings(); A.render();
}
ACT.iaSend = () => { const i = document.getElementById('iaIn'); if (i) send(i.value); };
ACT.iaChip = a => send(a.dataset.t);
ACT.iaClear = () => { S.settings.iaChat = []; A.saveSettings(); A.render(); };
ACT.iaNo = a => { const m = chat()[+a.dataset.i]; if (m) { m.done = 2; A.saveSettings(); A.render(); } };
ACT.iaDo = a => {
  const m = chat()[+a.dataset.i]; if (!m || !m.act) return; const x = m.act, cats = S.fin.categories;
  let cat = cats.find(c => c.id === x.categoria) || cats.find(c => (x.tipo === 'ingreso') === (c.type === 'income'));
  A.addTx({ type: x.tipo === 'ingreso' ? 'income' : 'expense', amount: x.monto, cat: cat ? cat.id : null, acct: S.settings.defaultAcct || (S.fin.accounts[0] || {}).id, date: A.today(), note: x.nota });
  m.done = 1; A.saveSettings(); toast('Anotado'); A.render();
};
// el chat no se queda abierto si cambias de pantalla con algo pendiente
})();
