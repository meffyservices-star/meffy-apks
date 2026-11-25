const SB = 'https://nhyxgfnjjzrdwshiuoyo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oeXhnZm5qanpyZHdzaGl1b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MDU2MjQsImV4cCI6MjEwNzE4MTYyNH0.S31nLaZ4qNgxAPLsYEzXhBMHeIemwbLTl5IFkIVQfUA';
let TOKEN = null;
async function api(path, opt = {}) {
  const h = { apikey: KEY, Authorization: 'Bearer ' + (TOKEN || KEY), ...(opt.headers || {}) };
  if (opt.body && !(opt.body instanceof Blob) && typeof opt.body !== 'string') { opt.body = JSON.stringify(opt.body); h['Content-Type'] = 'application/json'; }
  const r = await fetch(SB + path, { ...opt, headers: h });
  const t = await r.text(); let j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = t; }
  if (!r.ok) throw new Error((j && (j.message || j.msg || j.error_description || j.error)) || 'Error de conexión');
  return j;
}
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n, c = '$') => c + (Math.round((+n || 0) * 100) / 100).toFixed(2).replace('.', ',');
const $ = (s, r = document) => r.querySelector(s);
const BOW = '<svg viewBox="0 0 40 24" class="bow" aria-hidden="true"><path d="M20 12C14 2 3 1 2 8c-1 7 10 9 18 4Zm0 0c6-10 17-11 18-4 1 7-10 9-18 4Z" fill="currentColor" opacity=".9"/><circle cx="20" cy="12" r="3.4" fill="currentColor"/><path d="M18 14l-5 9M22 14l5 9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>';
const HEART = '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11Z" fill="currentColor"/></svg>';
