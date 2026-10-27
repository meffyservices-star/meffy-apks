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
- `servidor/recordatorio/index.ts` — copia de la función de Supabase `recordatorio` que manda los avisos (pg_cron la llama cada minuto).

## Cómo hacer cambios

1. Edita lo que necesites en `fuente/` (o directamente `offline.js`, `sw.js` o `index.html` en `publicado/`).
2. Si tocaste `fuente/`, ejecuta `node bolsillito/empaquetar.js`.
3. Sube la carpeta `bolsillito/publicado` a Vercel en el proyecto **bolsillito**: `vercel deploy --prod` desde esa carpeta.

Ojo: los arreglos de `FIX` (en `index.html`) y de `offline.js` buscan textos exactos dentro de `app.js`. Si cambias esas líneas en `fuente/app.js`, revisa que los arreglos sigan aplicando.

## Historial

- **26-oct-2026 (más noche)**
  - Tiendita → Probador: botón **Acomodar la ropa** para todas las usuarias. Se elige la prenda puesta, se arrastra con el dedo sobre la mascota o se mueve con flechitas, y se agranda/achica (40 %–250 %). "Como venía" la deja como la puso la admin.
  - Se guarda por mascota y por prenda en `rincon.equip[mascota].fit` y se ve igual en el cuarto, Cuidar, visitas de amigas y ropa de temporada (`App.accPlace` en `fuente/app.js`). Caché `bolsillito-v38`.
  - El ícono de **Colección** (y de Regalo del día, Crecer, Elegir mascota y las demás pantallas que se abren desde la mascota) ahora se puede cambiar: tocar el ícono junto al título. Los cuadritos de "Más cositas" usan ese ícono si se cambió. Caché `bolsillito-v39`.

- **26-oct-2026 (noche)**
  - Panel → Agregar cosas nuevas: en Mascotas, Muebles, Ropa, Comida, Paredes y Pisos sale **"… que ya vienen en la app"** con botones **Quitar**, **Reemplazar** y **Volver a poner** (por ejemplo Maca, Dony, Gela y Cupi).
  - Quitar: ya no sale en tiendas, adopción ni regalos; quien ya lo tenía lo conserva. Reemplazar: se dibuja o sube el nuevo, el viejo se quita y a quien lo tenía le llega el nuevo (mascota con su cuidado y nivel, ropa puesta, muebles del cuarto, comida de la despensa, pared/piso). Se guarda en la configuración (`catalog.gone` y `catalog.swap`).

- **26-oct-2026**
  - **Compras** nueva (Más → Tu dinero → Compras, en `fuente/compras.js`): varias listas (súper, mercado, farmacia, casa, otra) con presupuesto, plantillas y listas que se repiten cada semana o mes.
  - Cada cosa con cantidad, unidad (und, kg, g, lb, litro, ml, paquete, docena) y precio; subtotal y total en vivo (en el carrito / falta / total). Entiende lo que se escribe o dicta: "2 kg de tomate a $1.20", "leche x3", "media docena de huevos".
  - Se ordena por pasillo con íconos pixel (frutas, verduras, carnes, lácteos, panadería, despensa, bebidas, snacks, limpieza, aseo, farmacia, mascotas). Tachado animado, casilla pixel y la mascota empujando el carrito según lo que vas marcando.
  - Dictar con la voz, pegar una lista de WhatsApp, mandarla por WhatsApp y **lista compartida** con amigas de Visitas (tabla `shared_lists` en Supabase, con cambios en vivo; sin internet se guarda y sube después).
  - **Cerrar compra**: se vuelve un gasto en la cuenta elegida (el saldo se ajusta solo), guarda tienda y precios, actualiza "En casa", +5 estrellitas si cumplió el presupuesto y la primera vez regala el mueble **Carrito de súper** (también está en la tienda del cuarto).
  - **En casa**: lo que hay en casa (hay / queda poco / se acabó) y pasar lo que falta a una lista.
  - **Precios**: último precio de cada cosa, si subió o bajó, historial y en qué tienda sale más barato.
  - **Resumen**: total de la semana y del mes, promedio semanal, proyección del mes, presupuesto mensual de compras, gráfico de 8 semanas, en qué se va y dónde compraste.

- **25-oct-2026**
  - Tablero de sueños: se quitaron las frases "Este es mi año" y "Me lo merezco" (también para quien ya las tenía) y la estrellita, el brillo y el corazón de adorno. Ahora solo muestra las fotos y lo que pone la usuaria.
  - **Recordatorios** nuevos (Más → Recordatorios, en `fuente/recordatorios.js`): pago de tarjeta, suscripciones, servicios, cobrar, cumples, salud y "otra cosita". Cada uno con hora, monto y notita opcionales, repetición (una vez, diario, semanal, mensual, anual) y aviso el mismo día, 1, 3 o 7 días antes. Sugiere avisos para las tarjetas con día de pago y las suscripciones que encuentra.
  - Los recordatorios llegan como **notificación** del celular (con el tono de notificaciones del teléfono, vibran y se quedan hasta tocarlas); al tocarla se abre Recordatorios. Con la app abierta sale además un aviso chiquito. Sin sonidos propios ni cuadro grande de alarma (a pedido de la dueña); el relojito queda solo de decoración junto a la mascota.
  - Al abrir la app, si el celular tiene permiso de avisos, se vuelve a registrar como activo en `push_subs` (antes, apagar el aviso diario en la versión vieja dejaba el celular sin avisos). pg_cron revisa cada minuto.
  - **Tablero de sueños → Decorar con stickers** (`fuente/tablero.js`): stickers pixel, mascotas especiales, regalos de amigas, cintas washi (las de la Tiendita si las compró) y stickers propios que sube la usuaria (quedan guardados en "Los míos"). Se mueven con el dedo, se agrandan/giran con dos dedos o con los botones, se duplican, se traen al frente y se quitan.
  - Despensa: al comprar comida ya no se vuelve a abrir la hoja (no salta arriba); se actualiza el contador, las estrellitas y la despensa de atrás al instante.
  - Más rápido: los personajes ahora se muestran con una referencia corta (blob:) en vez de meter la imagen entera en cada pantalla, así el celular no las vuelve a decodificar al refrescar.
  - Servidor: tabla `reminders` en Supabase, columna `push_subs.daily` (el aviso para anotar ahora es aparte de los avisos del celular) y pg_cron cada minuto.

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
