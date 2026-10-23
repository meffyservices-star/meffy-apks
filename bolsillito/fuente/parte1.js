// ===== Bolsillito 2026 · Parte 1: Billetera, cuotas, me deben/debo y resumen del mes =====
(function () {
const A = App, S = A.S, { $, $$, esc, money, uid, ymd, parseYmd, addDays, today, ym, toast, openSheet, closeSheet, iconHTML, px } = A;
const ACT = A.ACTIONS;
const loans = () => (S.fin.loans = S.fin.loans || []);
const insts = () => (S.fin.installments = S.fin.installments || []);
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
const r2 = n => Math.round(n * 100) / 100;
const liabilities = () => S.fin.accounts.filter(a => a.liability || a.type === 'tarjeta' || a.type === 'prestamo');

// ---------------- Cuotas ----------------
function cuotaAmt(c) {
  const r = (+c.rate || 0) / 100;
  if (!r) return r2(c.total / c.n);
  return r2(c.total * r / (1 - Math.pow(1 + r, -c.n)));
}
function cuotaDate(c, i) {
  const d = parseYmd(c.first); const day = d.getDate();
  const n = new Date(d.getFullYear(), d.getMonth() + i, 1);
  n.setDate(Math.min(day, new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate()));
  return ymd(n);
}
const paid = c => S.tx.filter(t => t.inst === c.id).length;
const left = c => r2(cuotaAmt(c) * (c.n - paid(c)));
function runCuotas() {
  const td = today(); const touched = [];
  insts().forEach(c => {
    for (let i = 0; i < c.n; i++) {
      const d = cuotaDate(c, i); if (d > td) break;
      if (S.tx.some(t => t.inst === c.id && t.idx === i)) continue;
      S.tx.push({ id: uid(), ts: Date.now().toString(36) + i, type: 'expense', amount: cuotaAmt(c), cat: c.cat, acct: c.acct, date: d, note: c.name + ' · cuota ' + (i + 1) + ' de ' + c.n, inst: c.id, idx: i });
      touched.push(ym(d));
    }
  });
  if (touched.length) { S.tx.sort((a, b) => b.date.localeCompare(a.date)); A.saveTxMonths(touched); }
  return touched.length;
}
A.runCuotas = runCuotas;
function nextCuota(c) { const k = paid(c); return k < c.n ? cuotaDate(c, k) : null; }

function cuotaSheet(acctId) {
  const cards = liabilities();
  const st = { name: '', total: '', n: 6, other: '', rate: '', cat: (S.fin.categories.find(c => c.id === 'compras') || S.fin.categories.find(c => c.type !== 'income') || {}).id, acct: acctId || (cards[0] && cards[0].id), first: today() };
  const draw = () => openSheet('Compra a cuotas', `<div class="formgrid">
<label class="f full">¿Qué compraste?<input class="in" id="cuN" value="${esc(st.name)}" placeholder="Ej. Zapatos, laptop, celular"></label>
<label class="f">Precio total<input class="in" id="cuT" type="number" inputmode="decimal" step="0.01" value="${esc(st.total)}" placeholder="0,00"></label>
<label class="f">Interés al mes (opcional)<input class="in" id="cuR" type="number" inputmode="decimal" step="0.01" value="${esc(st.rate)}" placeholder="0 %"></label>
<div class="f full">¿En cuántas cuotas?<div class="chips">${[3, 6, 12, 24].map(n => `<button type="button" class="chip" data-cn="${n}" aria-pressed="${st.n === n && !st.other}">${n} meses</button>`).join('')}<input class="in" id="cuO" type="number" min="2" max="60" value="${esc(st.other)}" placeholder="Otro" style="width:84px"></div></div>
<label class="f">Tarjeta<select class="in" id="cuA">${cards.map(a => `<option value="${a.id}" ${a.id === st.acct ? 'selected' : ''}>${esc(a.name)}</option>`).join('') || '<option value="">Primero agrega una tarjeta</option>'}</select></label>
<label class="f">Categoría<select class="in" id="cuC">${S.fin.categories.filter(c => c.type !== 'income').map(c => `<option value="${c.id}" ${c.id === st.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
<label class="f full">Primera cuota<input class="in" id="cuF" type="date" value="${st.first}"></label>
<div class="full cuota-preview" id="cuP"></div>
<button class="btn pink full" id="cuOk" style="justify-content:center;padding:12px">Guardar compra</button></div>`, sh => {
    const read = () => { st.name = $('#cuN').value.trim(); st.total = $('#cuT').value; st.rate = $('#cuR').value; st.other = $('#cuO').value; st.acct = $('#cuA').value; st.cat = $('#cuC').value; st.first = $('#cuF').value || today(); };
    const prev = () => {
      read(); const n = +st.other || st.n; const total = num(st.total);
      const c = { total, n, rate: num(st.rate), first: st.first };
      $('#cuP').innerHTML = total > 0 && n > 1 ? `<b>${n} cuotas de ${money(cuotaAmt(c), { real: true })}</b><span>La primera el ${A.fmtDate(st.first)} · la última el ${A.fmtDate(cuotaDate(c, n - 1))}${c.rate ? ' · en total pagas ' + money(cuotaAmt(c) * n, { real: true }) : ''}</span>` : '<span>Escribe el precio total para ver cuánto pagas cada mes.</span>';
    };
    $$('[data-cn]', sh).forEach(b => b.onclick = () => { st.n = +b.dataset.cn; $('#cuO').value = ''; st.other = ''; $$('[data-cn]', sh).forEach(x => x.setAttribute('aria-pressed', x === b)); prev(); });
    $$('input,select', sh).forEach(i => i.oninput = prev);
    prev();
    $('#cuOk', sh).onclick = () => {
      read(); const n = Math.round(+st.other || st.n); const total = num(st.total);
      if (!st.name) return toast('Ponle un nombre a la compra');
      if (!(total > 0)) return toast('Escribe el precio total');
      if (!(n >= 2 && n <= 60)) return toast('Elige entre 2 y 60 cuotas');
      if (!st.acct) return toast('Primero agrega una tarjeta en Billetera');
      insts().push({ id: uid(), name: st.name, total: r2(total), n, rate: num(st.rate), cat: st.cat, acct: st.acct, first: st.first, created: today() });
      A.saveFin(); const k = runCuotas(); closeSheet();
      toast(k ? `Listo. Ya se anotó ${k === 1 ? 'la primera cuota' : k + ' cuotas'}` : 'Listo. Las cuotas se anotan solas cada mes');
      A.render();
    };
  });
  draw();
}
function cuotaDetail(id) {
  const c = insts().find(x => x.id === id); if (!c) return;
  const k = paid(c), nx = nextCuota(c);
  openSheet(c.name, `<div class="stack">
<div class="card row" style="gap:12px"><span class="ic">${iconHTML((A.cat(c.cat) || {}).icon || 's:bolsa', 34)}</span><div style="flex:1"><b>${money(cuotaAmt(c))} al mes</b><div class="faint">Cuota ${Math.min(k, c.n)} de ${c.n} · precio ${money(c.total)}${c.rate ? ' · ' + c.rate + '% al mes' : ''}</div></div></div>
<div class="prog"><i style="width:${Math.round(k / c.n * 100)}%"></i></div>
<div class="faint">${nx ? 'Próxima cuota: ' + A.fmtDate(nx) + ' · te faltan ' + money(left(c)) : '¡Ya la terminaste de pagar!'}</div>
<button class="btn danger" id="cuDel" style="justify-content:center">Borrar compra</button>
<p class="faint" style="margin:0">Al borrarla, las cuotas que ya se anotaron se quedan en tus movimientos.</p></div>`, sh => {
    $('#cuDel', sh).onclick = () => { if (!confirm('¿Borrar esta compra a cuotas? Ya no se anotarán más cuotas.')) return; S.fin.installments = insts().filter(x => x.id !== id); A.saveFin(); closeSheet(); A.render(); };
  });
}
ACT.cuotaNew = a => cuotaSheet(a.dataset.acct);
ACT.cuota = a => cuotaDetail(a.dataset.id);

// ---------------- Detalle de una cuenta ----------------
A.PAGES.acctd = 'Cuenta';
ACT.acctd = a => { S.acctId = a.dataset.id; S.acctTab = null; A.go('acctd'); };
ACT.acctTab = a => { S.acctTab = a.dataset.v; A.render(); };
A.screens.acctd = () => {
  const a = A.acct(S.acctId); if (!a) { S.route = 'wallet'; return A.screens.wallet(); }
  const bal = A.acctBalance(a.id); const isCard = a.liability || a.type === 'tarjeta' || a.type === 'prestamo';
  const mine = insts().filter(c => c.acct === a.id);
  const tab = S.acctTab || (isCard && mine.length ? 'cuotas' : 'mov');
  const curK = ym(today());
  const thisMonth = r2(mine.reduce((s, c) => s + (S.tx.some(t => t.inst === c.id && ym(t.date) === curK) || (nextCuota(c) && ym(nextCuota(c)) === curK) ? cuotaAmt(c) : 0), 0));
  const future = r2(mine.reduce((s, c) => s + left(c), 0));
  const txs = S.tx.filter(t => t.acct === a.id || t.to === a.id).slice(0, 60);
  return `<div class="ph"><div class="ph-left"><button class="navarrow" data-go="wallet" aria-label="Volver a Billetera">‹</button><span class="pill">${esc(a.name)}</span></div>${A.privBtn()}</div>
<div class="card stack acct-hero ${isCard ? 'is-card' : ''}">
<div class="row" style="gap:12px"><span class="ic">${iconHTML(a.icon, 44)}</span><div style="flex:1"><h3 style="margin:0">${isCard ? 'Lo que debes' : 'Saldo de hoy'}</h3><div class="big num ${bal < 0 ? 'neg' : ''}">${money(bal)}</div></div></div>
${isCard ? `<div class="grid3"><div class="mini"><span>Cuotas de este mes</span><b class="num">${money(thisMonth)}</b></div><div class="mini"><span>Cuotas por venir</span><b class="num">${money(future)}</b></div><div class="mini"><span>Pagas el</span><b>${a.due ? 'día ' + a.due : '—'}</b></div></div>
${(() => { const pay = cardPay(a); return pay ? `<div class="card-pay ${pay.soon ? 'soon' : ''}"><b>${pay.amount > 0 ? 'Para tu próximo pago: ' + money(pay.amount) : 'No debes nada por ahora'}</b><span>${a.cut ? 'Corte el día ' + a.cut + ' · ' : ''}Pagas el ${A.fmtDate(pay.date)}${pay.soon ? ' · ¡en ' + (pay.days <= 0 ? 'hoy' : pay.days === 1 ? '1 día' : pay.days + ' días') + '!' : ''}</span></div>` : ''; })()}
<button class="btn sm" data-act="cardDates" data-id="${a.id}" style="align-self:flex-start">${a.due ? 'Cambiar fechas de corte y pago' : 'Poner fechas de corte y pago'}</button>` : ''}
</div>
${isCard ? `<div class="seg"><button data-act="acctTab" data-v="mov" aria-pressed="${tab === 'mov'}">Movimientos</button><button data-act="acctTab" data-v="cuotas" aria-pressed="${tab === 'cuotas'}">Cuotas${mine.length ? ' · ' + mine.length : ''}</button></div>` : ''}
${tab === 'cuotas' && isCard ? `
<div class="list">${mine.length ? mine.map(c => { const k = paid(c); return `<button class="li cuota-row" data-act="cuota" data-id="${c.id}"><span class="ic">${iconHTML((A.cat(c.cat) || {}).icon || 's:bolsa', 30)}</span><span class="tx-main"><span class="row between"><b>${esc(c.name)}</b><b class="num">${money(cuotaAmt(c))}/mes</b></span><span class="prog" style="margin:4px 0 2px"><i style="width:${Math.round(k / c.n * 100)}%"></i></span><span>${k >= c.n ? '¡Pagada completa!' : 'Cuota ' + k + ' de ' + c.n + ' · faltan ' + money(left(c))}</span></span></button>`; }).join('') : '<div class="card empty">Aquí verás tus compras a cuotas: cuánto pagas cada mes y cuánto te falta.</div>'}</div>
<button class="btn pink" data-act="cuotaNew" data-acct="${a.id}" style="justify-content:center;padding:12px">Nueva compra a cuotas</button>`
  : `<div class="list">${txs.length ? txs.map(A.txRow).join('') : '<div class="card empty">Esta cuenta todavía no tiene movimientos.</div>'}</div>
${isCard ? '<p class="faint" style="text-align:center;margin:0">Las cuotas se anotan solas cada mes en esta tarjeta.</p>' : ''}`}
<button class="btn" data-act="editacct" data-id="${a.id}" style="justify-content:center">Editar cuenta</button>`;
};

// ---------------- Me deben / Debo ----------------
A.PAGES.loans = 'Me deben / Debo';
const lLeft = l => r2(Math.max(0, (+l.amount || 0) - (+l.paid || 0)));
const initials = s => (s || '?').trim().charAt(0).toUpperCase();
const AV = ['#ffd8e4', '#e6dcfa', '#d6ecfb', '#e3f1d2', '#fff0b8', '#ffe0cc'];
const avColor = s => AV[[...(s || '')].reduce((h, c) => h + c.charCodeAt(0), 0) % AV.length];
function loanTotals() { const L = loans(); const inn = L.filter(l => l.dir === 'in'), out = L.filter(l => l.dir === 'out'); return { inn: r2(inn.reduce((s, l) => s + lLeft(l), 0)), out: r2(out.reduce((s, l) => s + lLeft(l), 0)), nIn: inn.filter(l => lLeft(l) > 0).length, nOut: out.filter(l => lLeft(l) > 0).length }; }
A.loanTotals = loanTotals;
ACT.loansGo = a => { S.loanTab = a.dataset.v; A.go('loans'); };
ACT.loanTab = a => { S.loanTab = a.dataset.v; A.render(); };
ACT.loanNew = a => loanSheet(a.dataset.dir || S.loanTab || 'in');
ACT.loanPay = a => paySheet(a.dataset.id, a.dataset.full === '1');
ACT.loanOpen = a => loanDetail(a.dataset.id);
A.screens.loans = () => {
  const tab = S.loanTab || 'in'; const t = loanTotals();
  const list = loans().filter(l => l.dir === tab).sort((a, b) => (lLeft(b) > 0) - (lLeft(a) > 0) || (b.date || '').localeCompare(a.date || ''));
  return `<div class="ph"><div class="ph-left"><button class="navarrow" data-go="wallet" aria-label="Volver a Billetera">‹</button><span class="pill">Me deben / Debo</span></div>${A.privBtn()}</div>
<div class="grid2">
<button class="card loan-tot in" data-act="loanTab" data-v="in"><h3>Me deben</h3><div class="mid num pos">${money(t.inn)}</div><div class="faint">${t.nIn} ${t.nIn === 1 ? 'persona' : 'personas'}</div></button>
<button class="card loan-tot" data-act="loanTab" data-v="out"><h3>Debo</h3><div class="mid num neg">${money(t.out)}</div><div class="faint">${t.nOut} ${t.nOut === 1 ? 'persona' : 'personas'}</div></button>
</div>
<div class="seg"><button data-act="loanTab" data-v="in" aria-pressed="${tab === 'in'}">Me deben</button><button data-act="loanTab" data-v="out" aria-pressed="${tab === 'out'}">Debo</button></div>
<div class="list">${list.length ? list.map(l => { const rest = lLeft(l), done = rest <= 0; const pc = l.amount ? Math.min(100, (l.paid || 0) / l.amount * 100) : 0; return `<div class="li loan ${done ? 'done' : ''}" style="flex-wrap:wrap">
<button class="loan-main" data-act="loanOpen" data-id="${l.id}"><span class="av" style="background:${avColor(l.who)}">${esc(initials(l.who))}</span><span class="tx-main"><b>${esc(l.who)}</b><span>${esc(l.note || (tab === 'in' ? 'Le presté' : 'Me prestó'))} · ${A.fmtDate(l.date || today())}</span>${l.paid && !done ? `<span class="prog" style="margin-top:4px"><i style="width:${pc}%"></i></span><span>${tab === 'in' ? 'Abonó' : 'Abonaste'} ${money(l.paid)} de ${money(l.amount)}</span>` : ''}</span><span class="amt num ${tab === 'in' ? 'pos' : 'neg'}">${done ? '✓' : money(rest)}</span></button>
${done ? '' : `<div class="row" style="width:100%;gap:8px;margin-top:6px"><button class="btn sm" data-act="loanPay" data-id="${l.id}" style="flex:1;justify-content:center">${tab === 'in' ? 'Abonó una parte' : 'Abonar una parte'}</button><button class="btn sm ok" data-act="loanPay" data-id="${l.id}" data-full="1" style="flex:1;justify-content:center">${tab === 'in' ? 'Ya me pagó' : 'Ya pagué'}</button></div>`}
</div>`; }).join('') : `<div class="card empty">${tab === 'in' ? 'Aquí anotas lo que le prestas a alguien, para no olvidarte.' : 'Aquí anotas lo que te prestaron, para saber cuánto devolver.'}</div>`}</div>
<button class="btn pink" data-act="loanNew" data-dir="${tab}" style="justify-content:center;padding:12px">${tab === 'in' ? 'Anotar algo que presté' : 'Anotar algo que me prestaron'}</button>`;
};
function acctOptions(sel, none) { return `${none ? `<option value="">${none}</option>` : ''}${S.fin.accounts.map(a => `<option value="${a.id}" ${a.id === sel ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}`; }
function loanSheet(dir) {
  const def = (S.settings.defaultAcct && A.acct(S.settings.defaultAcct)) ? S.settings.defaultAcct : (S.fin.accounts[0] || {}).id;
  openSheet(dir === 'in' ? 'Le presté a alguien' : 'Alguien me prestó', `<div class="formgrid">
<label class="f full">${dir === 'in' ? '¿A quién le prestaste?' : '¿Quién te prestó?'}<input class="in" id="loW" placeholder="Ej. Prima Ana" autofocus></label>
<label class="f">¿Cuánto?<input class="in" id="loM" type="number" inputmode="decimal" step="0.01" placeholder="0,00"></label>
<label class="f">Fecha<input class="in" id="loD" type="date" value="${today()}"></label>
<label class="f full">¿Para qué? (opcional)<input class="in" id="loN" placeholder="${dir === 'in' ? 'Ej. Almuerzo, entradas del cine' : 'Ej. Para el pasaje'}"></label>
<label class="f full">${dir === 'in' ? '¿De qué cuenta salió la plata?' : '¿A qué cuenta entró la plata?'}<select class="in" id="loA">${acctOptions(def, 'No mover ninguna cuenta')}</select></label>
<button class="btn pink full" id="loOk" style="justify-content:center;padding:12px">Guardar</button></div>`, sh => {
    $('#loOk', sh).onclick = () => {
      const who = $('#loW').value.trim(), amount = r2(num($('#loM').value)), date = $('#loD').value || today(), note = $('#loN').value.trim(), acc = $('#loA').value;
      if (!who) return toast('Escribe el nombre'); if (!(amount > 0)) return toast('Escribe cuánto');
      const l = { id: uid(), dir, who, amount, paid: 0, note, date, acct: acc || null, pays: [] };
      if (acc) A.addTx({ type: dir === 'in' ? 'loan_out' : 'loan_in', amount, acct: acc, date, note: (dir === 'in' ? 'Préstamo a ' : 'Préstamo de ') + who, loan: l.id });
      loans().push(l); A.saveFin(); closeSheet(); S.loanTab = dir; A.go('loans');
    };
  });
}
function paySheet(id, full) {
  const l = loans().find(x => x.id === id); if (!l) return; const rest = lLeft(l);
  const def = l.acct || (S.fin.accounts[0] || {}).id;
  openSheet(l.dir === 'in' ? `${l.who} te pagó` : `Le pagas a ${l.who}`, `<div class="formgrid">
<label class="f">¿Cuánto?<input class="in" id="lpM" type="number" inputmode="decimal" step="0.01" value="${full ? rest : ''}" placeholder="${rest}"></label>
<label class="f">Fecha<input class="in" id="lpD" type="date" value="${today()}"></label>
<label class="f full">${l.dir === 'in' ? '¿A dónde entra la plata?' : '¿De qué cuenta sale?'}<select class="in" id="lpA">${acctOptions(def, 'No mover ninguna cuenta')}</select></label>
<p class="faint full" style="margin:0">${l.dir === 'in' ? 'Se suma solita a esa cuenta y baja de "Me deben".' : 'Se resta de esa cuenta y baja de "Debo".'}</p>
<button class="btn ok full" id="lpOk" style="justify-content:center;padding:12px">Guardar pago</button></div>`, sh => {
    $('#lpOk', sh).onclick = () => {
      const amount = r2(Math.min(rest, num($('#lpM').value))), date = $('#lpD').value || today(), acc = $('#lpA').value;
      if (!(amount > 0)) return toast('Escribe cuánto');
      const p = { amount, date, acct: acc || null };
      if (acc) { const t = { type: l.dir === 'in' ? 'loan_in' : 'loan_out', amount, acct: acc, date, note: l.dir === 'in' ? l.who + ' te pagó' : 'Le pagaste a ' + l.who, loan: l.id }; A.addTx(t); p.tx = t.id; }
      l.paid = r2((+l.paid || 0) + amount); (l.pays = l.pays || []).push(p); A.saveFin(); closeSheet();
      toast(lLeft(l) <= 0 ? (l.dir === 'in' ? '¡Listo! Ya te pagó todo' : '¡Listo! Ya no le debes nada') : 'Abono guardado'); A.render();
    };
  });
}
function loanDetail(id) {
  const l = loans().find(x => x.id === id); if (!l) return;
  openSheet(l.who, `<div class="stack">
<div class="card"><div class="row between"><span class="faint">${l.dir === 'in' ? 'Le prestaste' : 'Te prestó'}</span><b class="num">${money(l.amount)}</b></div><div class="row between"><span class="faint">${l.dir === 'in' ? 'Ya te pagó' : 'Ya pagaste'}</span><b class="num">${money(l.paid || 0)}</b></div><div class="row between"><span class="faint">Falta</span><b class="num">${money(lLeft(l))}</b></div></div>
${(l.pays || []).length ? `<div class="list">${l.pays.map(p => `<div class="li"><span class="tx-main"><b>${money(p.amount)}</b><span>${A.fmtDate(p.date)}${p.acct && A.acct(p.acct) ? ' · ' + esc(A.acct(p.acct).name) : ''}</span></span></div>`).join('')}</div>` : ''}
<button class="btn danger" id="loDel" style="justify-content:center">Borrar</button>
<p class="faint" style="margin:0">Al borrarlo también se quitan los movimientos que se anotaron en tus cuentas.</p></div>`, sh => {
    $('#loDel', sh).onclick = () => {
      if (!confirm('¿Borrar este préstamo?')) return;
      const months = S.tx.filter(t => t.loan === id).map(t => ym(t.date)); S.tx = S.tx.filter(t => t.loan !== id); A.saveTxMonths(months);
      S.fin.loans = loans().filter(x => x.id !== id); A.saveFin(); closeSheet(); A.render();
    };
  });
}

// ---- fechas de la tarjeta ----
function nextDay(day) { const t = new Date(); const d0 = new Date(t.getFullYear(), t.getMonth(), Math.min(day, new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate())); if (ymd(d0) < today()) { const n = new Date(t.getFullYear(), t.getMonth() + 1, 1); n.setDate(Math.min(day, new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate())); return n; } return d0; }
function cardPay(a) {
  if (!a.due) return null; const d = nextDay(a.due); const days = Math.round((d - parseYmd(today())) / 864e5);
  const owed = r2(Math.max(0, -A.acctBalance(a.id)));
  return { date: ymd(d), days, amount: owed, soon: days <= 5 && owed > 0 };
}
A.cardPay = cardPay;
ACT.cardDates = a => {
  const ac = A.acct(a.dataset.id); if (!ac) return;
  openSheet('Fechas de ' + ac.name, `<div class="formgrid"><label class="f">Día de corte<input class="in" id="cdC" type="number" min="1" max="31" value="${ac.cut || ''}" placeholder="Ej. 5"></label><label class="f">Día de pago<input class="in" id="cdP" type="number" min="1" max="31" value="${ac.due || ''}" placeholder="Ej. 20"></label>
<p class="faint full" style="margin:0">El corte es el día en que el banco cierra tu cuenta del mes. El pago es el día límite para pagar. Te avisamos 5 días antes.</p>
<button class="btn pink full" id="cdOk" style="justify-content:center;padding:12px">Guardar</button></div>`, sh => {
    $('#cdOk', sh).onclick = () => { const c = Math.round(+$('#cdC').value), d = Math.round(+$('#cdP').value); ac.cut = c >= 1 && c <= 31 ? c : undefined; ac.due = d >= 1 && d <= 31 ? d : undefined; A.saveFin(); closeSheet(); A.render(); };
  });
};
// ---- gráfico de patrimonio (últimos 6 meses) ----
function netHistory(withA) {
  const now = A.netWorth(withA); const eff = t => t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : 0;
  const cur = ym(today()); const out = [];
  for (let i = 5; i >= 0; i--) { const k = A.addMonths(cur, -i); const end = k === cur ? today() : ymd(new Date(+k.slice(0, 4), +k.slice(5), 0)); const after = S.tx.filter(t => t.date > end).reduce((s, t) => s + eff(t), 0); out.push({ k, v: r2(now - after) }); }
  return out;
}
function netChart(withA) {
  const h = netHistory(withA); const vals = h.map(x => x.v); const max = Math.max(...vals, 0), min = Math.min(...vals, 0); const span = (max - min) || 1;
  const W = 300, H = 96, bw = 34, gap = (W - bw * 6) / 5; const y0 = H - (0 - min) / span * H;
  const diff = vals[5] - vals[4];
  return `<div class="nw-chart"><svg viewBox="0 -14 ${W} ${H + 30}" role="img" aria-label="Patrimonio de los últimos 6 meses">${h.map((x, i) => { const y = H - (x.v - min) / span * H; const top = Math.min(y, y0), hh = Math.max(2, Math.abs(y0 - y)); const last = i === 5; return `<rect x="${i * (bw + gap)}" y="${top}" width="${bw}" height="${hh}" rx="6" fill="${x.v < 0 ? '#f7a8c0' : last ? 'var(--accent)' : '#ffc4d6'}"/>${S.priv ? '' : `<text x="${i * (bw + gap) + bw / 2}" y="${top - 4}" text-anchor="middle" font-size="10" font-weight="800" fill="#9b6b6b">${Math.abs(x.v) >= 1000 ? (x.v / 1000).toFixed(1).replace('.', ',') + 'k' : Math.round(x.v)}</text>`}<text x="${i * (bw + gap) + bw / 2}" y="${H + 14}" text-anchor="middle" font-size="11" font-weight="800" fill="#9b6b6b">${A.cap(A.MON3[+x.k.slice(5) - 1])}</text>`; }).join('')}</svg>
<div class="faint" style="text-align:center">${diff >= 0 ? 'Este mes subió ' : 'Este mes bajó '}${money(Math.abs(diff))}</div></div>`;
}
// ---------------- Billetera ----------------
A.PAGES.wallet = 'Billetera';
A.screens.wallet = () => {
  const st = S.settings; const withA = st.assetsInNet !== false; const t = loanTotals();
  const td = today(); const lim = ymd(addDays(new Date(), 45));
  const up = S.fin.recurring.filter(r => r.active).map(r => ({ name: r.name, date: r.next, freq: r.freq, amount: +r.amount, income: r.type === 'income', icon: (A.cat(r.cat) || {}).icon || 's:repeat' }))
    .concat(insts().map(c => ({ c, d: nextCuota(c) })).filter(x => x.d && x.d >= td && x.d <= lim).map(({ c, d }) => ({ name: c.name + ' · cuota ' + (paid(c) + 1) + ' de ' + c.n, date: d, freq: 'cuota', amount: cuotaAmt(c), icon: 's:tarjeta' })))
    .concat(S.fin.accounts.map(a => ({ a, pay: cardPay(a) })).filter(x => x.pay && x.pay.amount > 0 && x.pay.date <= lim).map(({ a, pay }) => ({ name: 'Pagar ' + a.name, date: pay.date, freq: 'tarjeta', amount: pay.amount, icon: a.icon || 's:tarjeta' })))
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  return `${A.bannerHTML('wallet') || ''}
${A.header('wallet', `<div class="row" style="gap:6px">${A.privBtn()}<button class="btn sm" data-act="newacct">Agregar +</button></div>`)}
<section class="stack">
<div class="ph"><span class="pill sm">Patrimonio</span><div class="seg" style="min-width:190px"><button data-act="assetsToggle" data-v="0" aria-pressed="${!withA}">Sin activos</button><button data-act="assetsToggle" data-v="1" aria-pressed="${withA}">Con activos</button></div></div>
<div class="card row" style="gap:14px"><img class="pixel" alt="" src="${Pix.sprite('gem', 4)}" style="width:52px;height:52px"><div><div class="big num">${money(A.netWorth(withA))}</div><div class="faint">Lo que tienes menos lo que debes</div></div></div>
${netChart(withA)}
</section>
<section class="stack">
<div class="ph"><span class="pill sm">Mis cuentas</span></div>
${S.fin.accounts.length ? A.walletHTML(a => { const b = A.acctBalance(a.id); const nc = insts().filter(c => c.acct === a.id && paid(c) < c.n).length; return `<button class="acct" data-act="acctd" data-id="${a.id}" style="width:100%;background:none;border:0;border-bottom:1px dashed var(--glass-line);text-align:left;color:inherit;font:inherit;cursor:pointer"><span class="ic">${iconHTML(a.icon, 32)}</span><span class="n">${esc(a.name)}<small>${esc(A.typeName(a.type))}${a.liability && a.due ? ' · paga el día ' + a.due : ''}${nc ? ' · ' + nc + (nc === 1 ? ' compra' : ' compras') + ' a cuotas' : ''}</small></span><b class="num ${b < 0 ? 'neg' : ''}">${money(b)}</b></button>`; }) : '<div class="card empty">Agrega tu efectivo, bancos, tarjetas y cuentas virtuales.</div>'}
</section>
<section class="stack">
<div class="ph"><span class="pill sm">Me deben / Debo</span><button class="btn sm" data-go="loans">Ver</button></div>
<div class="grid2">
<button class="card loan-tot in" data-act="loansGo" data-v="in"><h3>Me deben</h3><div class="mid num pos">${money(t.inn)}</div><div class="faint">${t.nIn} ${t.nIn === 1 ? 'persona' : 'personas'}</div></button>
<button class="card loan-tot" data-act="loansGo" data-v="out"><h3>Debo</h3><div class="mid num neg">${money(t.out)}</div><div class="faint">${t.nOut} ${t.nOut === 1 ? 'persona' : 'personas'}</div></button>
</div>
</section>
<section class="stack">
<div class="ph"><span class="pill sm">Metas de ahorro</span><button class="btn sm" data-go="goals">Ver</button></div>
<div class="card stack">${S.fin.goals.slice(0, 3).map(A.goalMini).join('') || '<div class="empty">Crea tu primera meta en “Metas”.</div>'}</div>
</section>
${up.length ? `<section class="stack"><div class="ph"><span class="pill sm">Próximos pagos</span><button class="btn sm" data-go="recurring">Ver</button></div><div class="list">${up.map(r => `<div class="li recurring"><span class="ic">${iconHTML(r.icon, 28)}</span><span class="tx-main"><b>${esc(r.name)}</b><span>${A.fmtDate(r.date)} · ${esc(r.freq)}</span></span><span class="amt num ${r.income ? 'pos' : ''}">${r.income ? '+' : '−'}${money(r.amount)}</span></div>`).join('')}</div></section>` : ''}
<section class="stack">
<div class="ph"><span class="pill sm">Activos</span><button class="btn sm" data-act="newasset">Agregar +</button></div>
<div class="card">${S.fin.assets.map(a => `<button class="acct" style="width:100%;background:none;border:0;border-bottom:1px dashed var(--glass-line);text-align:left" data-act="editasset" data-id="${a.id}"><span class="ic">${iconHTML(a.icon, 32)}</span><span class="n">${esc(a.name)}<small>Valor estimado</small></span><b class="num">${money(a.value)}</b></button>`).join('') || '<div class="empty">No tienes activos anotados.</div>'}</div>
</section>`;
};

// ---------------- Resumen del mes en historias ----------------
const STORY_BG = [['cerezo', '#ffe3ee', '#ffc9da', '#c44a72'], ['nubes', '#dcefff', '#bfe1fb', '#2f5f85'], ['picnic', '#fff0de', '#ffd5b8', '#a34a24'], [null, '#efe4ff', '#d9c6fb', '#6a4fb0'], ['jardin', '#e8f8e4', '#cdeec3', '#3f7a2f']];
function monthData(k) {
  const real = A.txIn(k).filter(t => !t.example);
  const prevK = A.addMonths(k, -1); const prev = A.txIn(prevK).filter(t => !t.example);
  const spent = A.spentOf(real), prevSpent = A.spentOf(prev), inc = A.incomeOf(real);
  const bc = {}; real.filter(t => t.type === 'expense').forEach(t => { bc[t.cat] = (bc[t.cat] || 0) + t.amount; });
  const top = Object.entries(bc).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, v]) => ({ c: A.cat(id) || { name: 'Otros', icon: 's:moneda' }, v }));
  const days = [...new Set(real.filter(t => !t.recurring && !t.inst).map(t => t.date))].sort();
  let best = 0, run = 0, pd = null; days.forEach(x => { const d = parseYmd(x); run = pd && (d - pd) / 864e5 === 1 ? run + 1 : 1; best = Math.max(best, run); pd = d; });
  const saved = real.filter(t => t.type === 'expense' && A.isSaving(A.cat(t.cat))).reduce((s, t) => s + t.amount, 0) + real.filter(t => t.type === 'transfer' && (A.acct(t.to) || {}).type === 'alcancia').reduce((s, t) => s + t.amount, 0);
  const resist = (S.fin.antojos || []).filter(a => a.status === 'resistido' && (a.decided || '').slice(0, 7) === k).length;
  return { k, spent, prevSpent, inc, top, days: days.length, best, saved, resist, n: real.length };
}
function petSrc(scale) { const m = S.settings.mascot || 's:pudin'; return m.startsWith('i:') ? m.slice(2) : Pix.sprite(m.slice(2), scale || 6); }
function slides(d) {
  const mes = A.cap(A.MONTHS[+d.k.slice(5) - 1]); const diff = d.prevSpent ? d.prevSpent - d.spent : 0;
  const pets = ['gochi', 'pudin', 'shey'].map((n, i) => `<img class="pixel st-flota" style="animation-delay:${i * .3}s;width:${i === 1 ? 120 : 92}px" alt="" src="${Pix.sprite(n, 6)}">`).join('');
  return [
    `<div class="st-kick">TU MES EN BOLSILLITO</div><div class="st-huge">${esc(mes)}</div><img class="pixel st-pet st-flota" alt="" src="${petSrc(8)}"><div class="st-text">Fue un mes bonito. Te cuento cómo te fue.</div>`,
    `<div class="st-kick">EN ${esc(mes.toUpperCase())} GASTASTE</div><div class="st-huge">${money(d.spent)}</div>${d.prevSpent ? `<div class="st-box">${diff >= 0 ? money(diff) + ' menos que el mes anterior' : money(-diff) + ' más que el mes anterior'}</div>` : ''}<img class="pixel st-pet st-flota" alt="" src="${Pix.sprite('alcancia', 8)}">${d.inc ? `<div class="st-text">Te entraron ${money(d.inc)}${d.inc > d.spent ? ' y te quedaron ' + money(d.inc - d.spent) : ''}.</div>` : ''}`,
    `<div class="st-kick">LO QUE MÁS TE GUSTÓ</div>${d.top[0] ? `${iconHTML(d.top[0].c.icon, 110)}<div class="st-huge st-mid">${esc(d.top[0].c.name)} · ${money(d.top[0].v)}</div><div class="st-box st-bars">${d.top.map(x => `<div class="row" style="gap:8px">${iconHTML(x.c.icon, 22)}<b style="width:96px;text-align:left">${esc(x.c.name)}</b><span class="prog" style="flex:1"><i style="width:${Math.round(x.v / d.top[0].v * 100)}%"></i></span><b class="num">${money(x.v)}</b></div>`).join('')}</div>` : '<div class="st-text">Este mes casi no anotaste gastos.</div>'}`,
    `<div class="st-kick">TUS LOGROS DEL MES</div><img class="pixel st-pet st-flota" alt="" src="${Pix.sprite('trofeo', 8)}"><div class="st-grid"><div class="st-stat">${iconHTML('s:fuego', 30)}<b>${d.best} ${d.best === 1 ? 'día' : 'días'}</b><span>tu mejor racha</span></div><div class="st-stat">${iconHTML('s:alcancia', 30)}<b>${money(d.saved)}</b><span>ahorrados</span></div><div class="st-stat">${iconHTML('s:shey', 30)}<b>${d.resist}</b><span>antojos resistidos</span></div></div><div class="st-text">Anotaste ${d.days} ${d.days === 1 ? 'día' : 'días'} del mes.</div>`,
    `<div class="st-kick">NOS VEMOS EL PRÓXIMO MES</div><div class="st-pets">${pets}</div><div class="st-huge st-mid">¡Gracias por cuidarnos!</div><div class="st-box">Sigue anotando y tus mochis crecen contigo.</div>`
  ];
}
function showStory(k) {
  const d = monthData(k); if (!d.n) { toast('Ese mes no tiene movimientos para resumir'); return; }
  const S2 = slides(d); let i = 0;
  const ov = document.createElement('div'); ov.className = 'story'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Resumen del mes');
  const paint = () => {
    const [bn, c1, c2, ink] = STORY_BG[i];
    ov.style.background = (bn ? `url(${Pix.banner(bn)}) center bottom/100% auto no-repeat,` : 'radial-gradient(circle,rgba(255,255,255,.9) 1px,transparent 1.8px) 0 0/24px 24px,') + `linear-gradient(180deg,${c1},${c2})`;
    ov.style.setProperty('--st-ink', ink);
    ov.innerHTML = `<div class="st-bars-top">${S2.map((_, j) => `<span><i style="width:${j <= i ? 100 : 0}%"></i></span>`).join('')}</div>
<div class="st-head"><span class="row" style="gap:8px"><img class="pixel" alt="" src="${petSrc(3)}" style="width:30px;height:30px"><b>Tu resumen</b></span><button class="st-x" aria-label="Cerrar">×</button></div>
<div class="st-body">${S2[i]}</div>
<button class="st-tap l" aria-label="Historia anterior"></button><button class="st-tap r" aria-label="Siguiente historia"></button>
<div class="st-foot"><span>Toca a la derecha para seguir · ${i + 1} de ${S2.length}</span><button class="btn st-save">Guardar como imagen</button></div>`;
    $('.st-x', ov).onclick = close; $('.st-tap.l', ov).onclick = () => { if (i > 0) { i--; paint(); } }; $('.st-tap.r', ov).onclick = () => { if (i < S2.length - 1) { i++; paint(); } else close(); };
    $('.st-save', ov).onclick = () => saveImage(ov);
  };
  const close = () => { ov.remove(); document.removeEventListener('keydown', key); };
  const key = e => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') $('.st-tap.r', ov).click(); if (e.key === 'ArrowLeft') $('.st-tap.l', ov).click(); };
  document.addEventListener('keydown', key); document.body.appendChild(ov); paint();
}
A.showStory = showStory;
async function saveImage(ov) {
  // dibuja la historia actual en una imagen sencilla (fondo, mascota y textos)
  const W = 1080, H = 1920; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const cs = getComputedStyle(ov); const grd = g.createLinearGradient(0, 0, 0, H);
  const m = (cs.backgroundImage.match(/linear-gradient\([^)]*?(rgb[^)]*\)|#[0-9a-f]{3,6})[^)]*?(rgb[^)]*\)|#[0-9a-f]{3,6})/i) || []);
  grd.addColorStop(0, m[1] || '#ffe3ee'); grd.addColorStop(1, m[2] || '#ffc9da'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
  const load = src => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
  g.imageSmoothingEnabled = false;
  const bnm = (cs.backgroundImage.match(/url\("?(data:[^")]+)"?\)/) || [])[1]; if (bnm) { const im = await load(bnm); if (im) g.drawImage(im, 0, H - W * im.height / im.width, W, W * im.height / im.width); }
  const ink = cs.getPropertyValue('--st-ink').trim() || '#c44a72';
  g.textAlign = 'center'; let y = 260;
  for (const n of $$('.st-body > *', ov)) {
    if (n.tagName === 'IMG' || n.querySelector && n.querySelector('img') && !n.textContent.trim()) { const im = await load(n.tagName === 'IMG' ? n.src : n.querySelector('img').src); if (im) { const s = 420 / Math.max(im.width, im.height); g.drawImage(im, W / 2 - im.width * s / 2, y, im.width * s, im.height * s); y += im.height * s + 50; } continue; }
    const txt = n.textContent.replace(/\s+/g, ' ').trim(); if (!txt) continue;
    const big = n.classList.contains('st-huge'); const kick = n.classList.contains('st-kick');
    g.fillStyle = big || kick ? ink : '#5a3340'; g.font = `${big ? 600 : 800} ${big ? 110 : kick ? 44 : 52}px Fredoka, Nunito, sans-serif`;
    const words = txt.split(' '); let line = ''; const lines = [];
    words.forEach(w => { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > W - 160) { lines.push(line); line = w; } else line = t; }); if (line) lines.push(line);
    lines.forEach(l => { y += big ? 120 : 66; g.fillText(l, W / 2, y); }); y += 40;
  }
  g.fillStyle = '#5a3340'; g.font = '700 40px Nunito, sans-serif'; g.fillText('Bolsillito', W / 2, H - 80);
  const a = document.createElement('a'); a.download = 'mi-resumen-bolsillito.png'; a.href = cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
  toast('Imagen guardada');
}
ACT.story = a => showStory(a.dataset.k || A.addMonths(ym(today()), -1));
// botón en la pantalla de Mes
const monthScreen = A.screens.month;
A.screens.month = () => { const k = S.month; const cur = ym(today()); const html = monthScreen(); if (k > cur) return html; const bn = A.bannerHTML('month') || ''; const at = bn ? html.indexOf(bn) : -1; const cut = at >= 0 ? at + bn.length : 0; return html.slice(0, cut) + `<button class="card row story-btn" data-act="story" data-k="${k}"><img class="pixel" alt="" src="${petSrc(3)}" style="width:44px;height:44px"><div style="flex:1;text-align:left"><b>Ver el resumen de ${esc(A.monthLabel(k))}</b><div class="faint">En historias, como en Instagram</div></div><span class="faint">›</span></button>` + html.slice(cut); };

// ---------------- Avisos en el Inicio ----------------
function alertsHTML() {
  const k = ym(today()); const list = A.txIn(k).filter(t => !t.example); const by = A.byCat(list, 'expense');
  const seen = (S.settings.alertSeen || {})[k] || [];
  const cats = S.fin.categories.filter(c => c.type !== 'income' && +c.budget > 0 && (by[c.id] || 0) >= c.budget * .8 && !seen.includes(c.id)).map(c => ({ c, pc: Math.round((by[c.id] || 0) / c.budget * 100) })).sort((a, b) => b.pc - a.pc).slice(0, 3);
  const cards = S.fin.accounts.map(a => ({ a, pay: cardPay(a) })).filter(x => x.pay && x.pay.soon && !seen.includes('pay:' + x.a.id + ':' + x.pay.date));
  if (!cats.length && !cards.length) return '';
  return `<div class="card stack alerts">${cards.map(({ a, pay }) => `<div class="al-row">${iconHTML(a.icon || 's:tarjeta', 28)}<div style="flex:1"><b>Paga ${esc(a.name)} ${pay.days <= 0 ? 'hoy' : pay.days === 1 ? 'mañana' : 'en ' + pay.days + ' días'}</b><div class="faint">${money(pay.amount)} · ${A.fmtDate(pay.date)}</div></div><button class="iconbtn" data-act="alOk" data-k="pay:${a.id}:${pay.date}" aria-label="Ya lo vi">×</button></div>`).join('')}
${cats.map(({ c, pc }) => `<div class="al-row">${iconHTML(c.icon, 28)}<div style="flex:1"><b>${pc >= 100 ? 'Ya te pasaste en ' + esc(c.name) : 'Ya usaste el ' + pc + '% de ' + esc(c.name)}</b><span class="prog" style="margin-top:4px"><i style="width:${Math.min(100, pc)}%;${pc >= 100 ? 'background:#e0577f' : ''}"></i></span><div class="faint">${money(by[c.id] || 0)} de ${money(+c.budget)} este mes</div></div><button class="iconbtn" data-act="alOk" data-k="${c.id}" aria-label="Ya lo vi">×</button></div>`).join('')}</div>`;
}
ACT.alOk = a => { const k = ym(today()); const s = S.settings.alertSeen = S.settings.alertSeen || {}; Object.keys(s).forEach(m => { if (m !== k) delete s[m]; }); s[k] = (s[k] || []).concat(a.dataset.k); A.saveSettings(); A.render(); };
const homeScreen = A.screens.home;
A.screens.home = () => { const h = homeScreen(); const al = alertsHTML(); if (!al) return h; const i = h.indexOf('<div class="grid2">'); return i >= 0 ? h.slice(0, i) + al + h.slice(i) : al + h; };
// ---------------- Arranque ----------------
const st0 = A.start;
A.start = async () => {
  await st0();
  S.settings.banners = S.settings.banners || {}; if (!S.settings.banners.wallet) { S.settings.banners.wallet = { preset: 'menta' }; A.saveSettings(); }
  const n = runCuotas();
  if (n) toast(n === 1 ? 'Se anotó 1 cuota de tu tarjeta' : `Se anotaron ${n} cuotas de tu tarjeta`);
  // el primer día que abres la app en un mes nuevo, te muestra el resumen del mes pasado
  const cur = ym(today()), prev = A.addMonths(cur, -1);
  if (S.settings.lastStory !== cur && A.txIn(prev).some(t => !t.example)) { S.settings.lastStory = cur; A.saveSettings(); setTimeout(() => showStory(prev), 900); }
  else if (!S.settings.lastStory) { S.settings.lastStory = cur; A.saveSettings(); }
  A.renderNav(); A.render();
};
})();
