// ================= Pronombres: la app habla en femenino, masculino o neutro según lo que elija cada persona =================
(function () {
const A = App, S = A.S, { esc, toast } = A, ACT = A.ACTIONS, sc = A.screens;
// lo neutro es la base; aquí van las formas para "ella" y "él" (las más largas primero)
const DIC = [
  ['TUS AMISTADES', 'TUS AMIGAS', 'TUS AMIGOS'], ['Tus amistades', 'Tus amigas', 'Tus amigos'], ['tus amistades', 'tus amigas', 'tus amigos'],
  ['Amistades', 'Amigas', 'Amigos'], ['amistades', 'amigas', 'amigos'],
  ['Tu amistad', 'Tu amiga', 'Tu amigo'], ['tu amistad', 'tu amiga', 'tu amigo'], ['Una amistad', 'Una amiga', 'Un amigo'], ['una amistad', 'una amiga', 'un amigo'],
  ['Te damos la bienvenida', 'Bienvenida', 'Bienvenido'],
  ['En calma', 'Tranquila', 'Tranquilo'], ['Con emoción', 'Emocionada', 'Emocionado'], ['Con cansancio', 'Cansada', 'Cansado'], ['Con aburrimiento', 'Aburrida', 'Aburrido'], ['Con estrés', 'Estresada', 'Estresado'], ['Con ansiedad', 'Ansiosa', 'Ansioso'],
  ['¡Muy equilibrado!', '¡Muy equilibrada!', '¡Muy equilibrado!'], ['esa persona', 'ella', 'él']
];
const idx = () => (S.settings && S.settings.pronoun === 'ella' ? 1 : S.settings && S.settings.pronoun === 'el' ? 2 : 0);
function adapt(root) {
  const k = idx(); if (!k || !root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentNode && /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  const todo = []; while (w.nextNode()) todo.push(w.currentNode);
  todo.forEach(n => { let t = n.nodeValue, c = false; if (!t || t.length < 4) return; for (const d of DIC) { if (t.includes(d[0])) { t = t.split(d[0]).join(d[k]); c = true; } } if (c) n.nodeValue = t; });
}
A.adaptText = adapt;
let tm = null;
const run = () => { adapt(document.body); }; // sin demora: así nunca se ve primero "amistades" y luego "amigas"
const st0 = A.start;
A.start = async () => {
  await st0();
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  run();
};
// elegir cómo te hablamos (también para quien ya tenía cuenta)
const chips = () => `<div class="chips">${[['ella', 'Ella'], ['el', 'Él'], ['neutro', 'Sin preferencia']].map(([k, l]) => `<button class="chip" data-act="setPronoun" data-v="${k}" aria-pressed="${(S.settings.pronoun || '') === k}">${l}</button>`).join('')}</div>`;
ACT.setPronoun = a => { S.settings.pronoun = a.dataset.v; A.saveSettings(); A.render(); toast('Listo, te hablaremos así'); };
ACT.setAge = () => { const i = document.getElementById('ageIn'); const v = Math.round(+(i && i.value)); if (v >= 5 && v <= 99) { S.settings.age = v; A.saveSettings(); toast('Edad guardada'); } else toast('Escribe una edad entre 5 y 99'); };
const card = () => `<div class="card stack"><b>Cómo te hablamos</b><span class="faint">Así la app te dice amiga, amigo o amistad.</span>${chips()}<div class="row" style="gap:8px"><input class="in" id="ageIn" type="number" inputmode="numeric" min="5" max="99" placeholder="Tu edad" value="${esc(S.settings.age || '')}"><button class="btn sm" data-act="setAge">Guardar edad</button></div></div>`;
const d0 = sc.data; if (d0) sc.data = () => d0() + card();
ACT.pronLater = () => { S.settings.pronAsked = 1; S.settings.pronoun = S.settings.pronoun || 'neutro'; A.saveSettings(); A.render(); };
})();
