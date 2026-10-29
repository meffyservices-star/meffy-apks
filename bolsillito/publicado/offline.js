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

  Store.offline = false;
  Store._noSession = false;
  Store.dirty = function () { return (Store.uid && lsGet('dirty:' + Store.uid)) || {}; };
  Store.setDirty = function (d) { if (Store.uid) lsSet('dirty:' + Store.uid, d); };
  Store.saveLocal = function () {
    if (!Store.uid) return;
    lsSet('docs:' + Store.uid, Store.docs);
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
      var rr = await withTimeout(sb.from('user_docs').select('doc_id, body').eq('user_id', this.uid), Object.keys(local).length ? 7000 : 10000);
      if (rr.error) throw rr.error;
      var server = {}; (rr.data || []).forEach(function (r) { server[r.doc_id] = r.body; });
      this.docs = Object.assign({}, server);
      Object.keys(dirty).forEach(function (id) { if (local[id] !== undefined) Store.docs[id] = local[id]; });
      Object.keys(dirty).forEach(function (id) { if (dirty[id] === 'del') delete Store.docs[id]; });
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
    document.addEventListener('visibilitychange', function () { if (!document.hidden && Object.keys(Store.dirty()).length) Store.tryReconnect(); });
  };

  Store.syncDirty = async function () {
    if (this._syncing || !navigator.onLine || this._noSession) return; this._syncing = true;
    var dirty = this.dirty(); var ids = Object.keys(dirty); var ok = 0;
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      try {
        var r;
        if (dirty[id] === 'del') r = await withTimeout(this.sb.from('user_docs').delete().eq('user_id', this.uid).eq('doc_id', id), 12000);
        else r = await withTimeout(this.sb.from('user_docs').upsert({ user_id: this.uid, doc_id: id, body: JSON.parse(JSON.stringify(this.docs[id] || {})), updated_at: new Date().toISOString() }), 12000);
        if (r.error) throw r.error;
        var d2 = this.dirty(); delete d2[id]; this.setDirty(d2); ok++;
      } catch (e) { if (isNetErr(e)) break; }
    }
    this._syncing = false;
    if (ok) { this.setStatus('saved'); }
  };

  var origFlush = Store.flush;
  Store.flush = function (id) {
    if (this.mode !== 'supa') return origFlush.call(this, id);
    var self = this;
    var body = JSON.parse(JSON.stringify(this.docs[id] || {}));
    var stored = this.saveLocal();
    var d = this.dirty(); d[id] = 1; this.setDirty(d);
    var run = async function () {
      if (!navigator.onLine || self._noSession) { self.setStatus('offline', 'Guardado en tu celular ✓ · se subirá con internet'); hideStatusSoon(); return; }
      try {
        var r = await withTimeout(self.sb.from('user_docs').upsert({ user_id: self.uid, doc_id: id, body: body, updated_at: new Date().toISOString() }), 12000);
        if (r.error) throw r.error;
        var d2 = self.dirty(); delete d2[id]; self.setDirty(d2);
        self.setStatus('saved');
      } catch (e) {
        if (isNetErr(e)) { self.setStatus('offline', 'Guardado en tu celular ✓ · se subirá con internet'); hideStatusSoon(); }
        else self.setStatus('error', 'No se pudo guardar en la nube. Queda guardado en tu celular.');
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
