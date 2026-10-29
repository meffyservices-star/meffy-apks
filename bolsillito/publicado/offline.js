/* Bolsillito — offline-first layer for the Supabase store.
   Everything is saved on the phone first; changes are uploaded when there is internet. */

window.__offline = function (Store) {
  var K = 'bolsillito:off:';
  function lsGet(k) { try { var v = localStorage.getItem(K + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function isNetErr(err) { var m = String((err && (err.message || err.details)) || err || ''); return !navigator.onLine || /fetch|network|load failed|timeout|offline/i.test(m); }
  function withTimeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); })]); }
  function hideStatusSoon() { setTimeout(function () { var n = document.querySelector('.statusbar'); if (n) n.style.opacity = 0; }, 2600); }
  // ¿Hay internet de verdad? (el celular puede decir "conectado" aunque no cargue nada)
  function reachable(C) {
    if (!navigator.onLine) return Promise.resolve(false);
    return withTimeout(fetch(C.url + '/auth/v1/health', { headers: { apikey: C.key }, cache: 'no-store' }).then(function (r) { return r.ok; }), 4000).catch(function () { return false; });
  }

  // ---------- que nada se pierda: juntar cambios de dos celulares en vez de pisarlos ----------
  // "base" = la última versión de cada documento que este celular vio en la nube (con su hora).
  function stable(o) { if (o === null || typeof o !== 'object') return JSON.stringify(o); if (Array.isArray(o)) return '[' + o.map(stable).join(',') + ']'; return '{' + Object.keys(o).sort().filter(function (k) { return o[k] !== undefined; }).map(function (k) { return JSON.stringify(k) + ':' + stable(o[k]); }).join(',') + '}'; }
  function eq(a, b) { return stable(a) === stable(b); }
  function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  function keyOf(arr) {
    if (arr.every(function (x) { return isObj(x) && (typeof x.id === 'string' || typeof x.id === 'number'); })) return function (x) { return 'i:' + x.id; };
    if (arr.every(function (x) { return x === null || typeof x !== 'object'; })) return function (x) { return 'p:' + stable(x); };
    return function (x) { return 'v:' + stable(x); };
  }
  function mergeArr(b, l, r) {
    var kf = keyOf([].concat(b, l, r)); var B = {}, L = {}, R = {}, out = [], seen = {};
    b.forEach(function (x) { B[kf(x)] = x; }); l.forEach(function (x) { L[kf(x)] = x; }); r.forEach(function (x) { R[kf(x)] = x; });
    l.forEach(function (x) { var k = kf(x); if (seen[k]) return; seen[k] = 1;
      if (k in R) out.push(mergeV(B[k], x, R[k]));
      else if (k in B) { if (!eq(x, B[k])) out.push(x); } // la otra lo borró: solo se queda si aquí lo cambiaste
      else out.push(x); });
    r.forEach(function (x) { var k = kf(x); if (seen[k]) return; seen[k] = 1;
      if (k in B) { if (!eq(x, B[k])) out.push(x); } // aquí lo borraste: solo vuelve si allá lo cambiaron
      else out.push(x); });
    return out;
  }
  function mergeV(b, l, r) {
    if (eq(l, r)) return l; if (eq(l, b)) return r; if (eq(r, b)) return l;
    if (l === undefined) return r; if (r === undefined) return l;
    if (Array.isArray(l) && Array.isArray(r)) return mergeArr(Array.isArray(b) ? b : [], l, r);
    if (isObj(l) && isObj(r)) {
      var o = {}, bb = isObj(b) ? b : {}, hasB = isObj(b);
      Object.keys(l).concat(Object.keys(r).filter(function (k) { return !(k in l); })).forEach(function (k) {
        if (!(k in r)) { if (hasB && k in bb && eq(l[k], bb[k])) return; o[k] = l[k]; return; }
        if (!(k in l)) { if (hasB && k in bb && eq(r[k], bb[k])) return; o[k] = r[k]; return; }
        o[k] = mergeV(bb[k], l[k], r[k]);
      });
      return o;
    }
    return l; // el mismo dato cambiado en los dos: gana este celular
  }
  Store.mergeDocs = mergeV;
  function at(t) { var n = Date.parse(t); return isNaN(n) ? 0 : n; }
  Store.base = function () { return (Store.uid && lsGet('base:' + Store.uid)) || {}; };
  Store.setBase = function (id, when, body) { if (!Store.uid) return; var b = Store.base(); if (when == null) delete b[id]; else b[id] = { at: when, body: body }; lsSet('base:' + Store.uid, b); };
  // otro celular cambió algo mientras esta app estaba abierta: no subimos encima; se recarga apenas no estés escribiendo
  Store.holdUploads = false;
  function busy() { var a = document.activeElement; var sc = document.getElementById('scrim'); return (sc && !sc.hidden) || document.body.classList.contains('gaming') || (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)); }
  Store.reloadSoon = function (msg) {
    Store.holdUploads = true;
    if (Store._reloadT) return;
    var n = document.querySelector('.statusbar'); if (n) { n.textContent = msg || 'Trayendo los cambios de tu otro celular…'; n.style.opacity = 1; }
    var tick = function () { if (busy() || document.hidden) { Store._reloadT = setTimeout(tick, 1500); return; } try { sessionStorage.setItem('bolsillito:route', (window.App && App.S && App.S.route) || ''); } catch (e) {} location.reload(); };
    Store._reloadT = setTimeout(tick, 900);
  };
  // revisar si la nube tiene algo más nuevo que lo que este celular conoce (al volver a la app)
  Store.checkRemote = async function () {
    if (!this.sb || !navigator.onLine || this._noSession || this.mode !== 'supa' || this.holdUploads) return;
    try {
      var r = await withTimeout(this.sb.from('user_docs').select('doc_id, updated_at').eq('user_id', this.uid), 6000); if (r.error) return;
      var b = this.base(); var newer = (r.data || []).some(function (x) { return !b[x.doc_id] || at(x.updated_at) !== b[x.doc_id].at; });
      if (newer) this.reloadSoon();
    } catch (e) {}
  };
  // subir un documento revisando antes que nadie lo haya cambiado desde la última vez
  Store.upload = async function (id) {
    if (this.holdUploads) return 'hold';
    var b = this.base()[id];
    var cur = await withTimeout(this.sb.from('user_docs').select('updated_at').eq('user_id', this.uid).eq('doc_id', id).maybeSingle(), 8000);
    if (cur.error) throw cur.error;
    if (cur.data && (!b || at(cur.data.updated_at) !== b.at)) { this.reloadSoon(); return 'hold'; }
    var body = JSON.parse(JSON.stringify(this.docs[id] || {})); var when = new Date().toISOString();
    var r = await withTimeout(this.sb.from('user_docs').upsert({ user_id: this.uid, doc_id: id, body: body, updated_at: when }), 12000);
    if (r.error) throw r.error;
    this.setBase(id, at(when), body);
    var d2 = this.dirty(); if (stable(this.docs[id]) === stable(body)) { delete d2[id]; this.setDirty(d2); }
    return 'ok';
  };
  Store.pendingCount = function () { return Object.keys(this.dirty()).length; };

  Store.offline = false;
  Store._noSession = false;
  Store.dirty = function () { return (Store.uid && lsGet('dirty:' + Store.uid)) || {}; };
  Store.setDirty = function (d) { if (Store.uid) lsSet('dirty:' + Store.uid, d); };
  Store.saveLocal = function () {
    if (!Store.uid) return true;
    var ok = lsSet('docs:' + Store.uid, Store.docs);
    if (!ok) { Store.setStatus && Store.setStatus('error', 'Tu celular está sin espacio: libera un poquito para que todo quede guardado.'); }
    return ok;
  };

  Store.initSupa = async function () {
    var C = window.MEFFY_SUPA;
    var sb = this.sb = supabase.createClient(C.url, C.key, { auth: { persistSession: true, autoRefreshToken: true } });
    var self = this;
    var cachedCfg = lsGet('config'); if (cachedCfg) this.config = cachedCfg;
    // la configuración guardada se usa para abrir rápido; cuando llega la nueva (muebles, ropa y comida que agregó la admin) se aplica en vivo
    self.refreshConfig = async function () { try { var rc = await withTimeout(sb.from('app_config').select('body').eq('id', 1).single(), 6000); if (rc.data && rc.data.body && Object.keys(rc.data.body).length) { var changed = JSON.stringify(rc.data.body) !== JSON.stringify(self.config || null); self.config = rc.data.body; lsSet('config', rc.data.body); if (changed && window.App && App.reloadConfig && App._ready) { try { App.reloadConfig(); } catch (e) {} } return true; } } catch (e) {} return false; };
    var cfgP = self.refreshConfig();
    if (!cachedCfg && navigator.onLine) await cfgP;

    var lastUid = lsGet('lastUid');
    var known = !!(lastUid && lsGet('profile:' + lastUid));
    // ya entraste antes en este celular y no hay red: abrir directo con lo guardado
    if (known && !navigator.onLine) { this._noSession = true; return this.openOffline(lastUid); }

    var session = null;
    try { session = (await withTimeout(sb.auth.getSession(), known ? 4000 : 6000)).data.session; } catch (e) {}
    if (!session && known) {
      // sin sesión válida: solo pedimos entrar de nuevo si de verdad hay internet
      if (!(await reachable(C))) { this._noSession = true; return this.openOffline(lastUid); }
      try { session = (await withTimeout(sb.auth.refreshSession(), 6000)).data.session; } catch (e) { this._noSession = true; return this.openOffline(lastUid); }
    }
    if (!session) {
      if (!navigator.onLine && !lastUid) { this.noNet(); return new Promise(function () {}); }
      await window.Auth.show(this);
      session = (await sb.auth.getSession()).data.session;
    }
    this.uid = session.user.id; lsSet('lastUid', this.uid);

    var hasProf = !!lsGet('profile:' + this.uid);
    var prof = null, pe = null;
    try { var rp = await withTimeout(sb.from('profiles').select('*').eq('id', this.uid).single(), hasProf ? 5000 : 8000); prof = rp.data; pe = rp.error; } catch (e) { pe = e; }
    if (pe || !prof) {
      // internet lento o caído: abrir con lo guardado (solo cerramos sesión si el perfil de verdad no existe)
      if (hasProf && (isNetErr(pe) || !(pe && pe.code === 'PGRST116'))) return this.openOffline(this.uid);
      if (isNetErr(pe)) { this.noNet(); return new Promise(function () {}); }
      await sb.auth.signOut(); location.reload(); return new Promise(function () {});
    }
    if (prof.blocked) { await sb.auth.signOut(); window.Auth.blocked(); return new Promise(function () {}); }
    lsSet('profile:' + this.uid, prof);
    this.profile = prof; this.isOwner = prof.role === 'admin'; this.mode = 'supa';

    // start from what is on the phone, then merge the server copy (phone wins for unsent changes)
    var local = lsGet('docs:' + this.uid) || {}; var dirty = this.dirty();
    try {
      var rr = await withTimeout(sb.from('user_docs').select('doc_id, body, updated_at').eq('user_id', this.uid), Object.keys(local).length ? 7000 : 10000);
      if (rr.error) throw rr.error;
      var server = {}, sAt = {}; (rr.data || []).forEach(function (r) { server[r.doc_id] = r.body; sAt[r.doc_id] = at(r.updated_at); });
      var base = this.base(), nb = {}, merged = 0;
      this.docs = Object.assign({}, server);
      Object.keys(server).forEach(function (id) { nb[id] = { at: sAt[id], body: server[id] }; });
      Object.keys(dirty).forEach(function (id) {
        if (dirty[id] === 'del' || local[id] === undefined) return;
        if (server[id] === undefined) { Store.docs[id] = local[id]; return; }
        var bs = base[id];
        if (bs && bs.at === sAt[id]) { Store.docs[id] = local[id]; return; } // nadie más lo tocó
        Store.docs[id] = mergeV(bs ? bs.body : undefined, local[id], server[id]); merged++; // lo de los dos celulares
      });
      Object.keys(dirty).forEach(function (id) { if (dirty[id] === 'del') delete Store.docs[id]; });
      lsSet('base:' + this.uid, nb);
      if (merged) setTimeout(function () { var n = document.querySelector('.statusbar'); if (n) { n.textContent = 'Se juntaron los cambios de tus dos celulares ✓'; n.style.opacity = 1; } hideStatusSoon(); }, 1500);
    } catch (e) { this.docs = local; this.offline = true; }
    this.saveLocal();
    sb.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', this.uid).then(function () {}, function () {});
    sb.auth.onAuthStateChange(function (ev) { if (ev === 'SIGNED_OUT' && navigator.onLine && !Store._signingOut) { /* se queda con lo guardado; al volver a abrir con internet pedirá entrar */ Store._noSession = true; } });
    this.watchNet();
    if (Object.keys(dirty).length) setTimeout(function () { Store.syncDirty(); }, 1500);
    return this;
  };

  Store.openOffline = function (uid) {
    this.uid = uid; var prof = lsGet('profile:' + uid);
    this.profile = prof; this.isOwner = prof.role === 'admin'; this.mode = 'supa'; this.offline = true;
    this.docs = lsGet('docs:' + uid) || {};
    this.watchNet();
    setTimeout(function () { var n = document.querySelector('.statusbar'); if (n) { n.textContent = 'Sin internet · todo se guarda en tu celular'; n.style.opacity = 1; } hideStatusSoon(); }, 1200);
    // si el internet vuelve mientras la app está abierta, intentamos subir lo pendiente
    setTimeout(function () { Store.tryReconnect(); }, 8000);
    return this;
  };

  Store.tryReconnect = function () {
    if (!navigator.onLine || !this.sb) return;
    this.sb.auth.getSession().then(function (r) {
      var s = r && r.data && r.data.session;
      if (s && s.user && s.user.id === Store.uid) { Store._noSession = false; Store.offline = false; Store.syncDirty(); }
    }, function () {});
  };

  Store.noNet = function () {
    var boot = document.getElementById('boot'); if (boot) boot.hidden = true;
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;padding:24px;text-align:center;font-weight:800;color:#6b3b3f;background:#fbeed3;z-index:50';
    d.innerHTML = '<div><p style="font-size:18px">Para entrar la primera vez necesitas internet.</p><p style="font-weight:600">Después podrás anotar tus gastos sin conexión.</p><button style="margin-top:12px;border:0;border-radius:99px;padding:10px 18px;background:#f27ea1;color:#fff;font-weight:800" onclick="location.reload()">Intentar otra vez</button></div>';
    document.body.appendChild(d);
    window.addEventListener('online', function () { location.reload(); });
  };

  Store.watchNet = function () {
    if (this._watch) return; this._watch = true;
    // al volver el internet: subir lo pendiente; nunca sacar a la persona de la app
    window.addEventListener('online', function () { setTimeout(function () { Store.tryReconnect(); }, 1500); });
    window.addEventListener('offline', function () { Store.offline = true; });
    document.addEventListener('visibilitychange', function () { if (document.hidden) return; if (Object.keys(Store.dirty()).length) Store.tryReconnect(); else Store.checkRemote(); });
  };

  Store.syncDirty = async function () {
    if (this._syncing || !navigator.onLine || this._noSession) return; this._syncing = true;
    var dirty = this.dirty(); var ids = Object.keys(dirty); var ok = 0, bad = 0;
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      try {
        if (dirty[id] === 'del') {
          var r = await withTimeout(this.sb.from('user_docs').delete().eq('user_id', this.uid).eq('doc_id', id), 12000);
          if (r.error) throw r.error;
          var d2 = this.dirty(); delete d2[id]; this.setDirty(d2); this.setBase(id, null); ok++;
        } else { var res = await this.upload(id); if (res === 'hold') break; ok++; }
      } catch (e) { if (isNetErr(e)) break; bad++; }
    }
    this._syncing = false;
    if (bad) this.setStatus('error', 'Hay cambios que no se pudieron subir. Siguen guardados en tu celular y se reintentan solos.');
    else if (ok) { this.setStatus('saved'); }
    if (this.pendingCount() && !this.holdUploads && !bad) { clearTimeout(this._retryT); this._retryT = setTimeout(function () { Store.syncDirty(); }, 20000); }
  };

  var origFlush = Store.flush;
  Store.flush = function (id) {
    if (this.mode !== 'supa') return origFlush.call(this, id);
    var self = this;
    var stored = this.saveLocal();
    var d = this.dirty(); d[id] = 1; this.setDirty(d);
    var run = async function () {
      if (!navigator.onLine || self._noSession) { self.setStatus('offline', 'Guardado en tu celular ✓ · se subirá con internet'); hideStatusSoon(); return; }
      if (self.holdUploads) return;
      try {
        var res = await self.upload(id);
        if (res === 'ok') self.setStatus('saved');
      } catch (e) {
        if (isNetErr(e)) { self.setStatus('offline', 'Guardado en tu celular ✓ · se subirá con internet'); hideStatusSoon(); }
        else { self.setStatus('error', 'No se pudo guardar en la nube. Queda guardado en tu celular y se reintenta solo.'); clearTimeout(self._retryT); self._retryT = setTimeout(function () { Store.syncDirty(); }, 30000); }
      }
    };
    this.chains[id] = (this.chains[id] || Promise.resolve()).then(run).catch(function () {});
    return this.chains[id];
  };

  var origRemove = Store.remove;
  Store.remove = async function (id) {
    if (this.mode !== 'supa') return origRemove.call(this, id);
    delete this.docs[id]; clearTimeout(this.timers[id]); this.saveLocal();
    var d = this.dirty(); d[id] = 'del'; this.setDirty(d);
    if (navigator.onLine) this.syncDirty();
  };

  var origSaveConfig = Store.saveConfig;
  Store.saveConfig = async function (cfg) { var r = await origSaveConfig.call(this, cfg); lsSet('config', cfg); return r; };

  var origSignOut = Store.signOut;
  Store.signOut = async function () {
    Store._signingOut = true;
    try { if (Store.uid && !Object.keys(Store.dirty()).length) { localStorage.removeItem(K + 'docs:' + Store.uid); localStorage.removeItem(K + 'profile:' + Store.uid); } localStorage.removeItem(K + 'lastUid'); } catch (e) {}
    return origSignOut.call(this);
  };
};
