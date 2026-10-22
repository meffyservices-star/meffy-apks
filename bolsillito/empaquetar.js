// Vuelve a crear publicado/p0.bin … p5.bin a partir de fuente/ (app.js, estilos.css, cuerpo.html).
// Uso: node bolsillito/empaquetar.js
// Después, sube a Vercel la carpeta bolsillito/publicado (por ejemplo: vercel deploy --prod).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = __dirname;
const src = path.join(dir, 'fuente');
const out = path.join(dir, 'publicado');

const payload = JSON.stringify({
  css: fs.readFileSync(path.join(src, 'estilos.css'), 'utf8'),
  body: fs.readFileSync(path.join(src, 'cuerpo.html'), 'utf8'),
  js: fs.readFileSync(path.join(src, 'app.js'), 'utf8'),
});
const gz = zlib.gzipSync(Buffer.from(payload, 'utf8'), { level: 9 });

// index.html siempre pide 6 partes (p0.bin … p5.bin)
const parts = 6;
const size = Math.ceil(gz.length / parts);
for (let i = 0; i < parts; i++) {
  fs.writeFileSync(path.join(out, `p${i}.bin`), gz.subarray(i * size, (i + 1) * size));
}
console.log(`Listo: ${gz.length} bytes en ${parts} partes.`);
