// Vuelve a crear publicado/p0.bin … p5.bin a partir de fuente/ (app.js, estilos.css, cuerpo.html).
// Uso: node bolsillito/empaquetar.js
// Después, sube a Vercel la carpeta bolsillito/publicado (por ejemplo: vercel deploy --prod).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = __dirname;
const src = path.join(dir, 'fuente');
const out = path.join(dir, 'publicado');

// app.js + los módulos nuevos (parte1.js…), que se meten antes de la última línea que arranca la app
function juntarJS() {
  const app = fs.readFileSync(path.join(src, 'app.js'), 'utf8');
  const extra = ['parte1.js', 'sprites2.js', 'sprites3.js', 'parte2.js', 'mas.js', 'parte3.js'].filter(f => fs.existsSync(path.join(src, f))).map(f => '\n;' + fs.readFileSync(path.join(src, f), 'utf8') + '\n');
  const cut = app.lastIndexOf(';document.getElementById(\'bootImg\')');
  return app.slice(0, cut) + extra.join('') + app.slice(cut);
}
const payload = JSON.stringify({
  css: fs.readFileSync(path.join(src, 'estilos.css'), 'utf8'),
  body: fs.readFileSync(path.join(src, 'cuerpo.html'), 'utf8'),
  js: juntarJS(),
});
const gz = zlib.gzipSync(Buffer.from(payload, 'utf8'), { level: 9 });

// index.html siempre pide 6 partes (p0.bin … p5.bin)
const parts = 6;
const size = Math.ceil(gz.length / parts);
for (let i = 0; i < parts; i++) {
  fs.writeFileSync(path.join(out, `p${i}.bin`), gz.subarray(i * size, (i + 1) * size));
}
console.log(`Listo: ${gz.length} bytes en ${parts} partes.`);
