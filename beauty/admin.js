let TAB = 'resumen', OST = 'todos', Q = '', ST = {}, CATS = [], PRODS = [], ORDS = [], ME = null;
const LS = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const M = n => money(n, ST.currency || '$');
const fdt = t => new Date(t).toLocaleDateString('es', { day: 'numeric', month: 'short' });
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }
function open(h) { $('#sheet').innerHTML = h; $('#scrim').hidden = false; document.body.style.overflow = 'hidden'; }
function close() { $('#scrim').hidden = true; document.body.style.overflow = ''; }
$('#scrim').addEventListener('click', e => { if (e.target.id === 'scrim') close(); });
async function login(email, pass) {
  const r = await api('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password: pass } });
  TOKEN = r.access_token; localStorage.setItem('bty_sess', JSON.stringify({ t: r.access_token, r: r.refresh_token }));
  const ok = await api('/rest/v1/rpc/cb_is_owner', { method: 'POST', body: {} }); if (ok !== true) { logout(); throw new Error('Esta cuenta no es la dueña de la tienda'); }
}
function logout() { TOKEN = null; localStorage.removeItem('bty_sess'); }
async function restore() {
  const s = LS('bty_sess'); if (!s) return false;
  TOKEN = s.t;
  try { const ok = await api('/rest/v1/rpc/cb_is_owner', { method: 'POST', body: {} }); if (ok === true) return true; } catch (e) {}
  try { const r = await api('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.r } }); TOKEN = r.access_token; localStorage.setItem('bty_sess', JSON.stringify({ t: r.access_token, r: r.refresh_token })); return true; } catch (e) { logout(); return false; }
}
function loginView(msg) {
  $('#app').innerHTML = `<div class="adm" style="max-width:380px;padding-top:12vh;text-align:center">${BOW.replace('class="bow"', 'class="bow" style="width:70px;height:42px"')}<h1 style="font-size:36px;font-style:italic;margin:6px 0 16px">Panel de la tienda</h1><div class="card" style="text-align:left"><label class="field">Correo<input id="lE" type="email" autocomplete="username"></label><label class="field">Contraseña<input id="lP" type="password" autocomplete="current-password"></label><button class="btn block" id="lB">Entrar</button><div class="note" id="lM" style="color:var(--deep)">${esc(msg || '')}</div></div></div>`;
  $('#lB').onclick = async () => { $('#lB').disabled = true; try { await login($('#lE').value.trim(), $('#lP').value); await start(); } catch (e) { loginView(e.message); } };
}
async function loadAll() {
  const [s, c, p, o] = await Promise.all([api('/rest/v1/bty_settings?id=eq.1'), api('/rest/v1/bty_categories?order=sort,name'), api('/rest/v1/bty_products?order=created_at.desc'), api('/rest/v1/bty_orders?order=created_at.desc&limit=500')]);
  ST = s[0] || {}; CATS = c; PRODS = p; ORDS = o;
}
async function start() { await loadAll(); draw(); }
const tabs = [['resumen', 'Resumen'], ['pedidos', 'Pedidos'], ['productos', 'Productos'], ['cats', 'Categorías'], ['ajustes', 'Ajustes']];
function draw() {
  const nuevos = ORDS.filter(o => o.status === 'nuevo').length;
  $('#app').innerHTML = `<div class="adm"><div class="head"><div class="logo">${BOW}${esc(ST.name || 'Tienda')}</div><div style="display:flex;gap:8px"><a class="sm" href="./" target="_blank" style="text-decoration:none">Ver tienda</a><button class="sm" id="out">Salir</button></div></div>
<div class="tabs">${tabs.map(([k, t]) => `<button aria-pressed="${TAB === k}" data-tab="${k}">${t}${k === 'pedidos' && nuevos ? ` · ${nuevos}` : ''}</button>`).join('')}</div>${({ resumen, pedidos, productos, cats, ajustes })[TAB]()}</div>${TAB === 'productos' ? '<div class="bar"><button class="btn" data-pn="">Agregar producto</button></div>' : ''}`;
  $('#out').onclick = () => { logout(); loginView(); };
}
const mes = o => o.created_at.slice(0, 7) === new Date().toISOString().slice(0, 7);
const vivo = o => o.status !== 'cancelado';
function resumen() {
  const mo = ORDS.filter(o => vivo(o) && mes(o)), ing = mo.reduce((a, o) => a + +o.total, 0), nue = ORDS.filter(o => o.status === 'nuevo'), low = PRODS.filter(p => p.active && p.stock <= 3);
  const by = {}; ORDS.filter(vivo).forEach(o => o.items.forEach(i => { by[i.n] = (by[i.n] || 0) + i.q; })); const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return `<div class="kp"><div class="k p"><span>Ventas del mes</span><b>${M(ing)}</b></div><div class="k"><span>Pedidos del mes</span><b>${mo.length}</b></div><div class="k"><span>Por atender</span><b>${nue.length}</b></div><div class="k"><span>Ticket promedio</span><b>${M(mo.length ? ing / mo.length : 0)}</b></div></div>
<div class="card"><h3>Necesita tu atención</h3>${nue.length ? `<div class="li" style="grid-template-columns:1fr auto"><span><b>${nue.length} pedido${nue.length > 1 ? 's' : ''} nuevo${nue.length > 1 ? 's' : ''}</b><br><small>Confírmalos por WhatsApp</small></span><button class="sm on" data-tab="pedidos">Ver</button></div>` : ''}${low.map(p => `<div class="li" style="grid-template-columns:1fr auto"><span><b>${esc(p.name)}</b><br><small>${p.stock <= 0 ? 'Agotado' : 'Quedan ' + p.stock}</small></span><button class="sm" data-pe="${p.id}">Reponer</button></div>`).join('')}${!nue.length && !low.length ? '<small style="color:var(--mute)">Todo en orden por ahora.</small>' : ''}</div>
<div class="card"><h3>Lo más vendido</h3>${top.map(([n, q], i) => `<div class="li" style="grid-template-columns:24px 1fr auto"><b style="color:var(--pink)">${i + 1}</b><span>${esc(n)}</span><small>${q} vend.</small></div>`).join('') || '<small style="color:var(--mute)">Aún no hay ventas.</small>'}</div>`;
}
const SL = { nuevo: 'Nuevo', confirmado: 'Confirmado', enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado' };
function pedidos() {
  const l = ORDS.filter(o => OST === 'todos' || o.status === OST);
  return `<div class="chips">${['todos', ...Object.keys(SL)].map(k => `<button class="chip" aria-pressed="${OST === k}" data-os="${k}">${k === 'todos' ? 'Todos' : SL[k]}</button>`).join('')}</div>${l.map(o => `<div class="card"><div class="row"><b>${esc(o.code)} · ${esc(o.customer)}</b><span class="st ${o.status}">${SL[o.status]}</span></div><small style="color:var(--mute)">${fdt(o.created_at)}${o.city ? ' · ' + esc(o.city) : ''}${o.address ? ' · ' + esc(o.address) : ''}</small>
<div style="margin:8px 0">${o.items.map(i => `<div class="row" style="font-size:14px"><span>${i.q} × ${esc(i.n)}${i.t ? ' <small style="color:var(--mute)">(' + esc(i.t) + ')</small>' : ''}</span><span>${M(i.p * i.q)}</span></div>`).join('')}</div>${o.notes ? `<small style="color:var(--mute)">Nota: ${esc(o.notes)}</small>` : ''}
<div class="row" style="margin-top:8px"><b style="color:var(--deep)">${M(o.total)}</b><a class="sm" style="text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/${esc(o.phone.replace(/\D/g, ''))}?text=${encodeURIComponent('Hola ' + o.customer + '! Te escribo por tu pedido ' + o.code)}">WhatsApp</a></div>
<div class="chips" style="padding-bottom:0;margin-top:6px">${Object.keys(SL).map(k => `<button class="sm ${o.status === k ? 'on' : ''}" data-ost="${o.id}" data-s="${k}">${SL[k]}</button>`).join('')}</div></div>`).join('') || '<div class="empty"><div>No hay pedidos aquí</div></div>'}`;
}
function productos() {
  const l = PRODS.filter(p => !Q || p.name.toLowerCase().includes(Q.toLowerCase()));
  return `<label class="field"><input id="q" placeholder="Buscar producto" value="${esc(Q)}"></label><div class="card">${l.map(p => `<button class="li" style="width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line)" data-pe="${p.id}"><div class="pimg">${p.images[0] ? `<img src="${esc(p.images[0])}" alt="">` : BOW}</div><span><b>${esc(p.name)}</b>${p.active ? '' : ' <span class="st cancelado">Oculto</span>'}<br><small>${(CATS.find(c => c.id === p.category_id) || {}).name || 'Sin categoría'} · ${M(p.price)}</small></span><span class="st ${p.stock <= 0 ? 'cancelado' : p.stock <= 3 ? 'nuevo' : 'entregado'}">${p.stock <= 0 ? 'Agotado' : p.stock + ' en stock'}</span></button>`).join('') || '<div class="empty"><div>Aún no hay productos. Agrega el primero.</div></div>'}</div>`;
}
function cats() {
  return `<div class="card"><h3>Categorías</h3>${CATS.map(c => `<div class="li" style="grid-template-columns:1fr auto auto"><b>${esc(c.name)}</b><button class="sm" data-ce="${c.id}">Renombrar</button><button class="sm" data-cd="${c.id}">Quitar</button></div>`).join('') || '<small style="color:var(--mute)">Crea categorías como Labiales, Rostro, Skincare…</small>'}<div class="row" style="margin-top:12px"><input class="in" id="cN" placeholder="Nueva categoría" style="flex:1;border:1.5px solid var(--line);border-radius:14px;padding:10px 12px;font:inherit"><button class="btn" id="cA">Agregar</button></div></div>`;
}
const F = (k, l, t = 'text', ph = '') => `<label class="field">${l}<input id="a_${k}" type="${t}" value="${esc(ST[k])}" placeholder="${ph}"></label>`;
function ajustes() {
  return `<div class="card"><h3>Tu tienda</h3>${F('name', 'Nombre de la tienda')}${F('tagline', 'Frase corta')}${F('whatsapp', 'WhatsApp para pedidos (con código de país)', 'tel', '593999999999')}${F('announce', 'Aviso arriba de la tienda (opcional)', 'text', 'Envío gratis en compras de $30')}${F('hero_title', 'Título principal')}${F('hero_sub', 'Subtítulo')}${F('ship_note', 'Nota de envíos')}${F('currency', 'Símbolo de moneda')}<button class="btn block" id="aS">Guardar</button></div>`;
}
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-tab]'); if (t) { TAB = t.dataset.tab; return draw(); }
  const os = e.target.closest('[data-os]'); if (os) { OST = os.dataset.os; return draw(); }
  const so = e.target.closest('[data-ost]'); if (so) { try { await api('/rest/v1/bty_orders?id=eq.' + so.dataset.ost, { method: 'PATCH', body: { status: so.dataset.s } }); ORDS.find(o => o.id === so.dataset.ost).status = so.dataset.s; draw(); } catch (er) { toast(er.message); } return; }
  const pe = e.target.closest('[data-pe]'); if (pe) return prodForm(pe.dataset.pe);
  const pn = e.target.closest('[data-pn]'); if (pn) return prodForm(null);
  if (e.target.id === 'cA') { const n = $('#cN').value.trim(); if (!n) return; try { await api('/rest/v1/bty_categories', { method: 'POST', body: { name: n, sort: CATS.length } }); await loadAll(); draw(); } catch (er) { toast(er.message); } return; }
  const ce = e.target.closest('[data-ce]'); if (ce) { const c = CATS.find(x => x.id === ce.dataset.ce), n = prompt('Nuevo nombre', c.name); if (n && n.trim()) { try { await api('/rest/v1/bty_categories?id=eq.' + c.id, { method: 'PATCH', body: { name: n.trim() } }); await loadAll(); draw(); } catch (er) { toast(er.message); } } return; }
  const cd = e.target.closest('[data-cd]'); if (cd) { if (!confirm('¿Quitar esta categoría? Los productos quedan sin categoría.')) return; try { await api('/rest/v1/bty_categories?id=eq.' + cd.dataset.cd, { method: 'DELETE' }); await loadAll(); draw(); } catch (er) { toast(er.message); } return; }
  if (e.target.id === 'aS') { const b = {}; ['name', 'tagline', 'whatsapp', 'announce', 'hero_title', 'hero_sub', 'ship_note', 'currency'].forEach(k => b[k] = $('#a_' + k).value.trim()); if (!b.name) return toast('Pon un nombre'); try { await api('/rest/v1/bty_settings?id=eq.1', { method: 'PATCH', body: b }); await loadAll(); draw(); toast('Guardado'); } catch (er) { toast(er.message); } }
});
document.addEventListener('input', e => { if (e.target.id === 'q') { Q = e.target.value; const pos = e.target.selectionStart; draw(); const n = $('#q'); n.focus(); n.setSelectionRange(pos, pos); } });
let PF = null;
function prodForm(id) {
  const p = id ? PRODS.find(x => x.id === id) : null;
  PF = { id, images: p ? [...p.images] : [] };
  open(`<button class="x" onclick="close()">×</button><h2>${p ? 'Editar producto' : 'Nuevo producto'}</h2>
<div class="field">Fotos</div><div class="imgs" id="imgs"></div><input type="file" id="fi" accept="image/*" multiple hidden>
<label class="field">Nombre<input id="p_n" maxlength="80" value="${esc(p && p.name)}"></label><label class="field">Descripción corta<input id="p_b" maxlength="90" value="${esc(p && p.brief)}"></label><label class="field">Descripción<textarea id="p_d" rows="3">${esc(p && p.description)}</textarea></label>
<div class="two"><label class="field">Precio<input id="p_p" inputmode="decimal" value="${p ? p.price : ''}"></label><label class="field">Precio antes (opcional)<input id="p_c" inputmode="decimal" value="${p && p.compare_price ? p.compare_price : ''}"></label></div>
<div class="two"><label class="field">Stock<input id="p_s" inputmode="numeric" value="${p ? p.stock : 1}"></label><label class="field">Categoría<select id="p_g"><option value="">Sin categoría</option>${CATS.map(c => `<option value="${c.id}" ${p && p.category_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label></div>
<label class="field">Tonos o variantes (separados por coma)<input id="p_t" value="${esc(p && p.tonos.join(', '))}" placeholder="Rosa, Coral, Nude"></label>
<label class="field">Etiqueta (opcional)<input id="p_e" maxlength="16" value="${esc(p && p.tag)}" placeholder="Nuevo, Oferta…"></label>
<label class="sw"><input type="checkbox" id="p_a" ${!p || p.active ? 'checked' : ''}> Visible en la tienda</label><label class="sw" style="margin:8px 0 14px"><input type="checkbox" id="p_f" ${p && p.featured ? 'checked' : ''}> Mostrar en favoritas</label>
<button class="btn block" id="pS">Guardar</button>${p ? '<button class="btn ghost block" id="pD" style="margin-top:10px">Eliminar producto</button>' : ''}<div class="note" id="pM" style="color:var(--deep)"></div>`);
  imgs();
  $('#fi').onchange = async e => { for (const f of e.target.files) { try { $('#pM').textContent = 'Subiendo foto…'; PF.images.push(await upload(f)); imgs(); $('#pM').textContent = ''; } catch (er) { $('#pM').textContent = er.message; } } e.target.value = ''; };
  $('#pS').onclick = async () => {
    const n = $('#p_n').value.trim(), pr = parseFloat(String($('#p_p').value).replace(',', '.')); if (!n || !(pr >= 0)) return $('#pM').textContent = 'Pon nombre y precio';
    const cp = parseFloat(String($('#p_c').value).replace(',', '.'));
    const b = { name: n, brief: $('#p_b').value.trim(), description: $('#p_d').value.trim(), price: pr, compare_price: cp > 0 ? cp : null, stock: Math.max(0, parseInt($('#p_s').value) || 0), category_id: $('#p_g').value || null, tonos: $('#p_t').value.split(',').map(x => x.trim()).filter(Boolean), tag: $('#p_e').value.trim(), active: $('#p_a').checked, featured: $('#p_f').checked, images: PF.images };
    try { if (PF.id) await api('/rest/v1/bty_products?id=eq.' + PF.id, { method: 'PATCH', body: b }); else await api('/rest/v1/bty_products', { method: 'POST', body: b }); await loadAll(); close(); draw(); toast('Guardado'); } catch (er) { $('#pM').textContent = er.message; }
  };
  const d = $('#pD'); if (d) d.onclick = async () => { if (!confirm('¿Eliminar este producto?')) return; try { await api('/rest/v1/bty_products?id=eq.' + PF.id, { method: 'DELETE' }); await loadAll(); close(); draw(); } catch (er) { $('#pM').textContent = er.message; } };
}
function imgs() { $('#imgs').innerHTML = PF.images.map((u, i) => `<div class="th"><img src="${esc(u)}" alt=""><button data-ri="${i}">×</button></div>`).join('') + '<button class="add" id="ad">+</button>'; $('#ad').onclick = () => $('#fi').click(); $('#imgs').onclick = e => { const r = e.target.closest('[data-ri]'); if (r) { PF.images.splice(+r.dataset.ri, 1); imgs(); } }; }
async function upload(file) {
  const bmp = await createImageBitmap(file), k = Math.min(1, 1000 / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k); c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .85)), path = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
  const r = await fetch(SB + '/storage/v1/object/bty/' + path, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'image/jpeg' }, body: blob });
  if (!r.ok) throw new Error('No se pudo subir la foto'); return SB + '/storage/v1/object/public/bty/' + path;
}
(async () => { if (await restore()) { try { await start(); } catch (e) { loginView(e.message); } } else loginView(); })();
