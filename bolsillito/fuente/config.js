// ================= Personalizar: elegir qué ver y qué no en la app =================
(function () {
const A = App, S = A.S, { esc } = A;
const sc = A.screens, ACT = A.ACTIONS;
A.PAGES.personalizar = 'Personalizar';
Object.values(A.PACKS || {}).forEach(p => { if (p.map && !p.map.personalizar) p.map.personalizar = p.map.settings || p.map.appearance || 's:gear'; });
const cfg = () => S.settings.cfg = S.settings.cfg || {};
const on = k => cfg()[k] !== false;
const hid = k => (S.settings.hidden || []).includes(k);
const GAMES = [['calle', 'Cruzar la calle'], ['saltar', 'Saltar hasta las nubes'], ['monedas', 'Ahorra monedas, no antojos'], ['carrera', 'Carreritas'], ['cocina', 'Cafecito kawaii']];
const MENUS = ['rincon', 'logros', 'tienda', 'juegos', 'jardin', 'amigos', 'visitas', 'tarrito', 'cuentas', 'tablero', 'estudio', 'sobres', 'planes', 'compras', 'shey', 'suscripciones', 'recordatorio', 'year', 'goals', 'recurring', 'projections', 'rules'];
const LABEL = { shey: 'Antojos', recordatorio: 'Avisos', rincon: 'Mi mascota y cuarto', logros: 'Logros', tienda: 'Tiendita' };
const CUARTO = [['misiones', 'Misiones de hoy', 'La tarjeta con tareas del día en tu cuarto'], ['paseo', 'Mascotas que pasean', 'Se mueven solas por el cuarto'], ['mariposas', 'Mariposas y bichitos', 'Pasan de vez en cuando y dan estrellitas'], ['reacciones', 'Burbujitas y muebles que reaccionan', 'Al tocar a tu mascota o un mueble']];
const row = (label, sub, attrs, checked) => `<div class="setrow"><span>${esc(label)}${sub ? `<small class="faint" style="display:block">${esc(sub)}</small>` : ''}</span><span class="toggle"><input type="checkbox" ${attrs} ${checked ? 'checked' : ''}><span></span></span></div>`;
sc.personalizar = () => `${A.header('personalizar')}
<p class="faint" style="margin:0 4px 8px">Elige qué quieres ver. Lo que apagues se esconde, pero no se pierde nada: puedes volver a prenderlo cuando quieras.</p>
<div class="card"><h3>En el menú Más</h3>${MENUS.filter(k => A.screens[k] || k === 'rincon').map(k => row(LABEL[k] || A.PAGES[k] || k, '', `data-pz-menu="${k}"`, !hid(k))).join('')}</div>
<div class="card"><h3>Juegos</h3>${GAMES.map(([k, n]) => row(n, '', `data-pz-game="${k}"`, !((S.settings.hiddenGames || []).includes(k)))).join('')}</div>
<div class="card"><h3>Tu cuarto</h3>${CUARTO.map(([k, n, d]) => row(n, d, `data-pz-cfg="${k}"`, on(k))).join('')}</div>
<div class="card"><h3>Inicio</h3>${row('Tarjeta “Primeros pasitos”', 'La guía para empezar', 'data-pz-tour', !((S.settings.tour || {}).hide))}</div>`;
A.after.personalizar = el => {
  el.querySelectorAll('[data-pz-menu]').forEach(i => i.onchange = () => { const k = i.dataset.pzMenu; S.settings.hidden = (S.settings.hidden || []).filter(x => x !== k); if (!i.checked) S.settings.hidden.push(k); A.saveSettings(); });
  el.querySelectorAll('[data-pz-game]').forEach(i => i.onchange = () => { const k = i.dataset.pzGame; S.settings.hiddenGames = (S.settings.hiddenGames || []).filter(x => x !== k); if (!i.checked) S.settings.hiddenGames.push(k); A.saveSettings(); });
  el.querySelectorAll('[data-pz-cfg]').forEach(i => i.onchange = () => { cfg()[i.dataset.pzCfg] = i.checked; A.saveSettings(); });
  const t = el.querySelector('[data-pz-tour]'); if (t) t.onchange = () => { const T = S.settings.tour = S.settings.tour || {}; T.hide = t.checked ? 0 : 1; if (t.checked) T.on = 1; A.saveSettings(); };
};
// los juegos apagados no salen en la lista
const j0 = A.screens.juegos;
A.screens.juegos = function () {
  let h = j0.apply(this, arguments); const off = S.settings.hiddenGames || [];
  off.forEach(k => { h = h.replace(new RegExp('<button class="gm-row[^"]*" data-act="gmPlay" data-g="' + k + '">[\\s\\S]*?</button>'), ''); });
  return h;
};
A.hiddenGame = k => (S.settings.hiddenGames || []).includes(k);
})();
