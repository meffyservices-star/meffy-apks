let ST = {}, CATS = [], PRODS = [], CAT = 'all', CART = [];
try { CART = JSON.parse(localStorage.getItem('bty_cart') || '[]'); } catch (e) {}
const saveCart = () => { try { localStorage.setItem('bty_cart', JSON.stringify(CART)); } catch (e) {} $('#cn').textContent = CART.reduce((a, i) => a + i.q, 0); };
const M = n => money(n, ST.currency || '$');
const P = id => PRODS.find(p => p.id === id);
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }
function open(html) { $('#sheet').innerHTML = html; $('#scrim').hidden = false; document.body.style.overflow = 'hidden'; }
function close() { $('#scrim').hidden = true; document.body.style.overflow = ''; }
$('#scrim').addEventListener('click', e => { if (e.target.id === 'scrim') close(); });
const img = (p, big) => p.images && p.images[0] ? `<img src="${esc(p.images[0])}" alt="${esc(p.name)}" loading="lazy">` : BOW;
function card(p) { const out = p.stock <= 0; return `<button class="pc" data-p="${p.id}"><div class="pimg">${img(p)}${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}${out ? '<div class="agotado">Agotado</div>' : ''}</div><div class="pb"><b>${esc(p.name)}</b><small>${esc(p.brief)}</small><div class="price">${M(p.price)}${p.compare_price > p.price ? `<s>${M(p.compare_price)}</s>` : ''}</div></div></button>`; }
function draw() {
  $('#chips').innerHTML = [['all', 'Todo'], ...CATS.map(c => [c.id, c.name])].map(([k, t]) => `<button class="chip" aria-pressed="${CAT === k}" data-c="${k}">${esc(t)}</button>`).join('');
  const list = PRODS.filter(p => CAT === 'all' || p.category_id === CAT);
  const f = CAT === 'all' ? PRODS.filter(p => p.featured && p.stock > 0).slice(0, 4) : [];
  $('#feat').innerHTML = f.length ? `<div class="sec"><h2>Favoritas</h2></div><div class="grid">${f.map(card).join('')}</div>` : '';
  $('#catT').textContent = CAT === 'all' ? 'Todo' : (CATS.find(c => c.id === CAT) || {}).name;
  $('#grid').innerHTML = list.map(card).join('');
  $('#none').hidden = !!list.length; $('#none').innerHTML = BOW + '<div>Pronto habrá cositas lindas por aquí</div>';
  saveCart();
}
document.addEventListener('click', e => {
  const c = e.target.closest('[data-c]'); if (c) { CAT = c.dataset.c; return draw(); }
  const p = e.target.closest('[data-p]'); if (p) return prod(p.dataset.p);
  if (e.target.closest('#cartBtn')) return cart();
});
let SEL = { t: '', q: 1 };
function prod(id) {
  const p = P(id); if (!p) return; SEL = { t: p.tonos[0] || '', q: 1 };
  const gal = p.images.length ? p.images.map(u => `<img src="${esc(u)}" alt="">`).join('') : `<div class="pimg">${BOW}</div>`;
  open(`<button class="x" onclick="close()">×</button><h2>${esc(p.name)}</h2><div class="gal">${gal}</div>
<div class="row"><div class="price" style="font-size:22px;padding:0">${M(p.price)}${p.compare_price > p.price ? `<s>${M(p.compare_price)}</s>` : ''}</div>${p.stock > 0 && p.stock <= 5 ? `<span class="st">Quedan ${p.stock}</span>` : ''}</div>
<p style="color:var(--mute);white-space:pre-line">${esc(p.description || p.brief)}</p>
${p.tonos.length ? `<div class="field" style="margin-bottom:0">Tono / variante</div><div class="opts">${p.tonos.map((t, i) => `<button class="chip" aria-pressed="${i === 0}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
${p.stock > 0 ? `<div class="row" style="margin:8px 0 14px"><div class="qty"><button data-q="-1">−</button><b id="q">1</b><button data-q="1">+</button></div><button class="btn" id="addb" style="flex:1">Agregar a mi bolsita</button></div>` : '<div class="empty">Este producto está agotado por ahora</div>'}`);
  const sh = $('#sheet');
  sh.onclick = e => {
    const t = e.target.closest('[data-t]'); if (t) { SEL.t = t.dataset.t; sh.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', b === t)); }
    const q = e.target.closest('[data-q]'); if (q) { SEL.q = Math.max(1, Math.min(p.stock, 20, SEL.q + +q.dataset.q)); $('#q').textContent = SEL.q; }
    if (e.target.closest('#addb')) { const k = CART.find(i => i.id === p.id && i.t === SEL.t); if (k) k.q = Math.min(p.stock, 20, k.q + SEL.q); else CART.push({ id: p.id, t: SEL.t, q: SEL.q }); saveCart(); close(); toast('Agregado a tu bolsita'); }
  };
}
function cart() {
  CART = CART.filter(i => P(i.id)); const tot = CART.reduce((a, i) => a + P(i.id).price * i.q, 0);
  if (!CART.length) return open(`<button class="x" onclick="close()">×</button><h2>Mi bolsita</h2><div class="empty">${BOW}<div>Tu bolsita está vacía</div></div>`);
  open(`<button class="x" onclick="close()">×</button><h2>Mi bolsita</h2>${CART.map((i, n) => { const p = P(i.id); return `<div class="ci"><div class="pimg">${img(p)}</div><div><b>${esc(p.name)}</b>${i.t ? `<br><small style="color:var(--mute)">${esc(i.t)}</small>` : ''}<div class="price" style="padding:0">${M(p.price * i.q)}</div></div><div class="qty"><button data-m="${n}" data-d="-1">−</button><b>${i.q}</b><button data-m="${n}" data-d="1">+</button></div></div>`; }).join('')}
<div class="tot"><span>Total</span><span>${M(tot)}</span></div><button class="btn block" id="go">Continuar</button><div class="note">${esc(ST.ship_note || '')}</div>`);
  $('#sheet').onclick = e => {
    const m = e.target.closest('[data-m]'); if (m) { const i = CART[+m.dataset.m]; i.q += +m.dataset.d; if (i.q < 1) CART.splice(+m.dataset.m, 1); else i.q = Math.min(i.q, P(i.id).stock, 20); saveCart(); return cart(); }
    if (e.target.closest('#go')) form();
  };
}
function form() {
  let sv = {}; try { sv = JSON.parse(localStorage.getItem('bty_me') || '{}'); } catch (e) {}
  open(`<button class="x" onclick="close()">×</button><h2>Tus datos</h2><div class="note" style="text-align:left">Te llevaremos a WhatsApp para confirmar tu pedido.</div>
<label class="field">Nombre<input id="fN" maxlength="80" autocomplete="name" value="${esc(sv.n)}"></label><label class="field">WhatsApp<input id="fP" inputmode="tel" maxlength="30" autocomplete="tel" value="${esc(sv.p)}"></label>
<div class="two"><label class="field">Ciudad<input id="fC" maxlength="60" value="${esc(sv.c)}"></label><label class="field">Dirección<input id="fA" maxlength="200" value="${esc(sv.a)}"></label></div>
<label class="field">Notas (opcional)<textarea id="fO" rows="2" maxlength="300"></textarea></label><button class="btn block" id="send">Enviar pedido por WhatsApp</button><div class="note" id="err" style="color:var(--deep)"></div>`);
  $('#sheet').onclick = async e => {
    if (!e.target.closest('#send')) return; const b = e.target.closest('#send');
    const n = $('#fN').value.trim(), p = $('#fP').value.trim(); if (!n || !p) return $('#err').textContent = 'Escribe tu nombre y tu WhatsApp';
    b.disabled = true; b.textContent = 'Enviando…';
    try {
      const c = $('#fC').value.trim(), a = $('#fA').value.trim(), o = $('#fO').value.trim();
      const r = await api('/rest/v1/rpc/bty_create_order', { method: 'POST', body: { p_name: n, p_phone: p, p_city: c, p_address: a, p_notes: o, p_items: CART.map(i => ({ id: i.id, q: i.q, t: i.t })) } });
      try { localStorage.setItem('bty_me', JSON.stringify({ n, p, c, a })); } catch (er) {}
      const lines = r.items.map(i => `• ${i.q} × ${i.n}${i.t ? ' (' + i.t + ')' : ''} — ${M(i.p * i.q)}`).join('\n');
      const msg = `Hola! Quiero hacer este pedido (${r.code})\n\n${lines}\n\nTotal: ${M(r.total)}\n\nNombre: ${n}${c ? '\nCiudad: ' + c : ''}${a ? '\nDirección: ' + a : ''}${o ? '\nNotas: ' + o : ''}`;
      CART = []; saveCart();
      const wa = (ST.whatsapp || '').replace(/\D/g, '');
      open(`<div class="ok">${BOW}<h2>¡Pedido recibido!</h2><p style="color:var(--mute)">Tu código es <b>${esc(r.code)}</b>.<br>Envíanos el mensaje por WhatsApp para confirmarlo.</p>${wa ? `<a class="btn block" style="display:block;text-decoration:none;text-align:center" href="https://wa.me/${wa}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Abrir WhatsApp</a>` : '<div class="note">La tienda te escribirá pronto.</div>'}<button class="btn ghost block" style="margin-top:10px" onclick="close()">Seguir mirando</button></div>`);
      $('#sheet').onclick = null; load();
    } catch (er) { b.disabled = false; b.textContent = 'Enviar pedido por WhatsApp'; $('#err').textContent = er.message; }
  };
}
async function load() {
  try {
    const [s, c, p] = await Promise.all([api('/rest/v1/bty_settings?id=eq.1&select=*'), api('/rest/v1/bty_categories?select=*&order=sort,name'), api('/rest/v1/bty_products?select=*&active=eq.true&order=sort,created_at.desc')]);
    ST = s[0] || {}; CATS = c; PRODS = p;
  } catch (e) { $('#none').hidden = false; $('#none').textContent = 'No pude cargar la tienda. Revisa tu conexión.'; return; }
  document.title = ST.name || 'Tienda';
  $('#logo').innerHTML = BOW + esc(ST.name || 'Tienda'); $('#flogo').innerHTML = BOW + esc(ST.name || '');
  $('#heroBow').innerHTML = BOW; $('#hT').textContent = ST.hero_title || ''; $('#hS').textContent = ST.hero_sub || '';
  $('#ann').hidden = !ST.announce; $('#ann').textContent = ST.announce || ''; $('#fnote').textContent = ST.tagline || '';
  draw();
}
load();
