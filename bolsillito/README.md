# Bolsillito 🐷

App de finanzas personales (gastos, presupuestos, metas y journal). Publicada en Vercel como **bolsillito** → https://bolsillito.vercel.app. Los datos se guardan en Supabase (proyecto `meffy-bolsillito`).

## Carpetas

- `publicado/` — los archivos tal como están en Vercel. Esta es la carpeta que se sube.
  - `index.html` — arranca la app: descarga `p0.bin`…`p5.bin`, los descomprime y aplica la lista `FIX` (pequeños arreglos sobre el código).
  - `offline.js` — modo sin conexión: guarda todo en el celular y lo sube cuando hay internet. También agrega arreglos extra al código (por ejemplo, el campo **Saldo de hoy** al editar una cuenta).
  - `sw.js` — service worker: deja la app guardada en el celular para que abra sin internet.
  - `p0.bin`…`p5.bin` — el código de la app comprimido (gzip partido en 6).
- `fuente/` — el mismo código de `p*.bin`, pero legible: `app.js`, `estilos.css`, `cuerpo.html`.
- `empaquetar.js` — vuelve a crear `p*.bin` desde `fuente/`.

## Cómo hacer cambios

1. Edita lo que necesites en `fuente/` (o directamente `offline.js`, `sw.js` o `index.html` en `publicado/`).
2. Si tocaste `fuente/`, ejecuta `node bolsillito/empaquetar.js`.
3. Sube la carpeta `bolsillito/publicado` a Vercel en el proyecto **bolsillito**: `vercel deploy --prod` desde esa carpeta.

Ojo: los arreglos de `FIX` (en `index.html`) y de `offline.js` buscan textos exactos dentro de `app.js`. Si cambias esas líneas en `fuente/app.js`, revisa que los arreglos sigan aplicando.

## Historial

- **24-oct-2026**
  - Sonidos en Cuidar (burbujas al bañar, luz al dormir y despertar, mimos, "ñam ñam" al comer), en los minijuegos y en el cuarto.
  - Cada mascota tiene su propia vocecita al tocarla en el cuarto (las nuevas del panel reciben una sacada de su nombre).
  - Corazones nuevos, más bonitos y animados, al mimar y tocar a la mascota.
  - La mascota bebé ya no se encoge al terminar un mimo.
  - El fondo de Cuidar es aparte de la Sala: se decora solo desde Cuidar (botón Decorar) y la Sala solo desde Cuarto. Los muebles quedan detrás de los textos.

- **22-oct-2026**
  - Ahora abre sin internet aunque el celular diga que está conectado.
  - Ya no pide iniciar sesión cuando falla la red.
  - Al editar una cuenta se escribe el **Saldo de hoy** y la app ajusta el cálculo sola, como Money+.
