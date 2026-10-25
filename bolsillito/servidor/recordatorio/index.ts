// Manda los avisos de Bolsillito. Lo llama pg_cron cada 5 minutos con la llave x-cron-key.
// 1) El recordatorio diario para anotar (tabla push_subs, columna daily).
// 2) Los recordatorios que arma cada usuaria (tabla reminders): pago de tarjeta, suscripciones, cositas…
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import webpush from 'npm:web-push@3.6.7';

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const FRASES = [
  '¿Anotamos lo de hoy? {pet} te está esperando.',
  '{pet} quiere saber cómo te fue hoy con tu dinerito.',
  'Un ratito para anotar tus gastos y {pet} se pone feliz.',
  'No se te olvide anotar lo de hoy. ¡Tu racha te espera!',
  'Hoy también cuenta. Anota tus gastos con {pet}.'
];

type Sub = { endpoint: string; user_id: string; p256dh: string; auth: string; hour: number; tz: string; pet: string; enabled: boolean; daily: boolean; last_log: string; last_sent: string };
type Rem = { user_id: string; id: string; title: string; note: string | null; kind: string; repeat: string; date: string | null; dom: number | null; wdays: number[] | null; month: number | null; hour: number; minute: number; before: number[]; tz: string; sound: string | null; sent: string[] };

function localNow(tz: string): { date: string; hour: number; min: number } {
  try {
    const f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
    const p = Object.fromEntries(f.formatToParts(new Date()).map(x => [x.type, x.value]));
    return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24, min: Number(p.minute) };
  } catch (_) { return localNow('America/Guayaquil'); }
}
const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const plusDays = (s: string, n: number) => { const d = parse(s); d.setUTCDate(d.getUTCDate() + n); return fmt(d); };
const lastDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();

// ¿El recordatorio cae en esta fecha?
function occurs(r: Rem, s: string): boolean {
  const d = parse(s), day = d.getUTCDate(), last = lastDay(d);
  const sameDom = (dom: number) => day === Math.min(dom, last);
  switch (r.repeat) {
    case 'once': return r.date === s;
    case 'daily': return true;
    case 'weekly': return (r.wdays || []).includes(d.getUTCDay());
    case 'monthly': return !!r.dom && sameDom(r.dom);
    case 'yearly': return !!r.dom && !!r.month && d.getUTCMonth() + 1 === r.month && sameDom(r.dom);
  }
  return false;
}
const cuando = (b: number) => b === 0 ? 'hoy' : b === 1 ? 'mañana' : b === 7 ? 'en una semana' : `en ${b} días`;

Deno.serve(async (req: Request) => {
  const { data: sec } = await sb.from('app_secrets').select('name, value');
  const S = Object.fromEntries((sec || []).map((r: { name: string; value: string }) => [r.name, r.value]));
  if (!S.cron_key || req.headers.get('x-cron-key') !== S.cron_key) return new Response('no', { status: 401 });
  webpush.setVapidDetails('mailto:servicesffy@gmail.com', S.vapid_public, S.vapid_private);

  const { data: subsData } = await sb.from('push_subs').select('*').eq('enabled', true).limit(5000);
  const subs = (subsData || []) as Sub[];
  const byUser = new Map<string, Sub[]>();
  for (const s of subs) { const L = byUser.get(s.user_id) || []; L.push(s); byUser.set(s.user_id, L); }
  const dead = new Set<string>();
  let sent = 0, gone = 0, rems = 0;

  const push = async (s: Sub, payload: Record<string, unknown>, ttl: number) => {
    if (dead.has(s.endpoint)) return false;
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: ttl, urgency: 'high' });
      sent++; return true;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) { dead.add(s.endpoint); await sb.from('push_subs').delete().eq('endpoint', s.endpoint); gone++; }
      else console.error('push', code, String(e));
      return false;
    }
  };

  // 1) Aviso diario para anotar
  for (const s of subs) {
    if (s.daily === false) continue;
    const now = localNow(s.tz || 'America/Guayaquil');
    if (now.hour !== s.hour || s.last_sent === now.date || s.last_log === now.date) continue;
    const body = FRASES[Math.floor(Math.random() * FRASES.length)].replace('{pet}', s.pet || 'Tu mascota');
    if (await push(s, { title: 'Bolsillito', body, url: '/' }, 3600)) await sb.from('push_subs').update({ last_sent: now.date }).eq('endpoint', s.endpoint);
  }

  // 2) Recordatorios de cada usuaria
  const users = [...byUser.keys()];
  for (let i = 0; i < users.length; i += 200) {
    const { data: remData } = await sb.from('reminders').select('*').eq('enabled', true).in('user_id', users.slice(i, i + 200));
    for (const r of (remData || []) as Rem[]) {
      const now = localNow(r.tz || 'America/Guayaquil');
      const at = r.hour * 60 + r.minute, cur = now.hour * 60 + now.min;
      if (cur < at || cur > at + 180) continue; // si el servidor se atrasó, igual llega (hasta 3 horas después)
      const keys: string[] = [];
      for (const b of r.before && r.before.length ? r.before : [0]) {
        const key = now.date + ':' + b;
        if ((r.sent || []).includes(key) || !occurs(r, plusDays(now.date, b))) continue;
        const L = byUser.get(r.user_id) || [];
        const pet = (L.find(x => x.pet) || { pet: '' }).pet || 'Tu mascota';
        const title = b === 0 ? r.title : `${r.title} · ${cuando(b)}`;
        const body = r.note ? r.note : b === 0 ? `${pet} te lo recuerda.` : `${pet} te avisa con tiempo para que no se te pase.`;
        let ok = false;
        for (const s of L) ok = (await push(s, { title, body, url: `/?alarma=${encodeURIComponent(r.id)}&k=${encodeURIComponent(key)}`, tag: 'rem-' + r.id, rem: { id: r.id, title: r.title, note: r.note || '', kind: r.kind, sound: r.sound || '', b, key } }, 6 * 3600)) || ok;
        if (ok) { keys.push(key); rems++; }
      }
      if (keys.length) await sb.from('reminders').update({ sent: [...(r.sent || []), ...keys].slice(-20) }).eq('user_id', r.user_id).eq('id', r.id);
    }
  }
  return new Response(JSON.stringify({ sent, gone, rems }), { headers: { 'Content-Type': 'application/json' } });
});
