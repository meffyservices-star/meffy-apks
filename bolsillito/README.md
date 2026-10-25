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
  - Personajes nuevos en toda la app: Ale (pudín), Gochi, Shey, Yaki (rollito de canela) y el chanchito de ahorro (también en el juego de atrapar monedas). Están en `fuente/personajes.js`: son las imágenes originales tal cual (360 px, sin redibujar), y `Pix.sprite` las entrega con el tamaño de un dibujo de 20x20. Los colores especiales (fresa, menta, noche, chocolate) se tiñen solos. La ropa se reacomodó a los dibujos nuevos.
  - Ícono nuevo de la app con la nueva Ale (web y Android). El ícono del APK cambia cuando se vuelve a generar el APK.
  - Editor pixel del panel (mascotas, muebles, ropa, etc.): botón **Pantalla grande** junto al dibujo. Abre solo el cuadro de dibujo ocupando toda la pantalla, con las herramientas en una fila arriba, la vista previa en pequeño y los colores abajo. Se acerca con dos dedos (pellizco), con los botones − / + o la rueda del mouse; se mueve con dos dedos o con la herramienta Mover. "Ver todo" vuelve al tamaño completo y "Listo" regresa al formulario.
  - Los textos de la mascota de Inicio ahora usan el nombre y el dibujito de la mascota que tenga cada usuaria (Ale, Pandy o la que elija): el consejo "Soy … y cuido tu dinerito", el cierre del día (título, tarjeta, frase de la noche y aviso) y los textos de recompensas. En el panel, las **Frases de la noche** aceptan `{nombre}` (y "Ale" también se cambia solo).
  - Cruzar la calle tiene sonido de ambiente propio por escenario (pajaritos, tráfico y bocinas, olas y gaviotas, viento y campanitas, cajita musical) y sonidos cercanos: el carro que pasa a tu lado, el río y el tren. Va bajito y se apaga si la usuaria quitó los sonidos.
  - Juego nuevo **Cruzar la calle** (estilo Crossy Road), en `fuente/calle.js`: calles con carros, ríos con troncos y nenúfares, vías de tren con aviso, y 5 escenarios que cambian cada 34 pasos (Pradera, Ciudad pastel, Playa, Bosque nevado, Dulcelandia). Lo que se atrapa son estrellitas para la tienda. Si te quedas quieta, la nubecita te alcanza.
  - Personajes del juego: Pandy de inicio, selector dentro del juego y máquina gacha (30 estrellitas; los repetidos devuelven 10). Trae 6 personajes pixel propios (Pollito, Ranita, Gatito, Pingüino, Conejita, Unicornio) y la admin agrega más en el panel → Agregar cosas nuevas → **Personaje** (máquina gacha con rareza, con estrellitas o gratis).
  - La música de "Atrapar comidita (despensa)" en el panel se reemplazó por la de Cruzar la calle.
  - Tarjetas de la sección Juegos más delgadas: portada, nombre en una línea, récord en insignia y botón Jugar pixelado.
  - Vercel ahora publica desde la carpeta `bolsillito/publicado` (rootDirectory del proyecto); antes una subida desde git publicó la carpeta equivocada y salía "page doesn't exist".
  - Juego de saltar: siempre hay una plataforma alcanzable. Las que se rompen ahora son trampas extra (no reemplazan a la plataforma que te deja seguir) y el hueco máximo entre plataformas útiles quedó por debajo de lo que sube un salto.
  - Música para los juegos: en el panel de admin (Música de los juegos) se sube una canción por juego, con volumen y prendido/apagado. Se guarda en Supabase Storage, bucket `music` (solo la admin puede subir).
  - Sonidos en Cuidar (burbujas al bañar, luz al dormir y despertar, mimos, "ñam ñam" al comer), en los minijuegos y en el cuarto.
  - Cada mascota tiene su propia vocecita al tocarla en el cuarto (las nuevas del panel reciben una sacada de su nombre).
  - Corazones nuevos, más bonitos y animados, al mimar y tocar a la mascota.
  - La mascota bebé ya no se encoge al terminar un mimo.
  - El fondo de Cuidar es aparte de la Sala: se decora solo desde Cuidar (botón Decorar) y la Sala solo desde Cuarto. Los muebles quedan detrás de los textos.

- **22-oct-2026**
  - Ahora abre sin internet aunque el celular diga que está conectado.
  - Ya no pide iniciar sesión cuando falla la red.
  - Al editar una cuenta se escribe el **Saldo de hoy** y la app ajusta el cálculo sola, como Money+.
