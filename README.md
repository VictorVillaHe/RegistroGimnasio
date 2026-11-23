# Registro de gimnasio — réplica estática

Réplica estática de la app de registro de gimnasio de Victor, para publicar en
GitHub Pages. Vanilla JS y CSS, sin dependencias externas ni CDN: funciona sin
internet en el gimnasio y se puede instalar como PWA.

## Qué hace

- **Entrenar**: elige el día (lunes a viernes; por defecto el de hoy) e inicia
  sesión. Cada serie se pre-carga con el peso sugerido, el último peso real o el
  peso de referencia. Ajusta peso y reps con −/+, marca cada serie como hecha
  (✓) y ve la insignia **¡RÉCORD!** cuando superas tu peso máximo anterior en
  ese ejercicio.
- **Panel en vivo**: tiempo transcurrido, % completado, tiempo restante
  estimado y hora estimada de fin (según tu ritmo de hoy o de sesiones
  anteriores de la misma rutina).
- **Terminar rutina**: calcula volumen y % completado, genera recomendaciones
  por reglas para la próxima vez, guarda tu nota personal y muestra el panel de
  cierre. Al iniciar la siguiente sesión del mismo día aparece un banner con
  esas recomendaciones y tu nota.
- **Contador de voz**: en cada ejercicio, "Contar reps con voz" abre una
  pantalla completa que dice el número de repetición y la dirección de cada
  fase ("1. Baja lento", "Sube", "Aguanta") con la voz del teléfono (es-MX).
  Nunca cuenta atrás 3-2-1; los segundos solo se ven en pantalla. Deriva el
  tempo del esquema de cada ejercicio. Los ejercicios unilaterales (con
  "individual" en el nombre) cuentan el doble de reps (por lado) con el aviso
  "Cambia de lado" a la mitad. Descanso entre series ajustable (30–120 s, por
  defecto 60 s) con aviso de voz 7 segundos antes de la siguiente serie.
  Preparación ajustable (3/5/10/15/20/30 s, por defecto 3 s). Botones: Probar
  voz, Pausar, Terminar serie aquí. Las series completadas se marcan solas en
  la sesión abierta. El reloj va anclado a la hora real y pide wake lock para
  que no se duerma la pantalla.
- **Progreso**: por ejercicio, gráfica SVG del peso máximo por fecha + volumen.
- **Historial**: sesiones con fecha, rutina, series hechas/totales y volumen,
  con detalle por serie y opción de borrar sesión.
- **Rutinas**: los 5 días con ejercicios, esquemas y pesos de referencia.
  Se pueden agregar, editar y borrar ejercicios, y restablecer las 54 rutinas
  originales.
- **Config**: exportar/importar respaldo (JSON), exportar CSV (sesiones y
  series), borrar todo (con confirmación).

## Reglas que respeta

- Pesos exactamente como están anotados, kg y lb distintos, nunca se
  convierten. Un solo peso anotado vale para todas las series (martes y
  viernes, regla confirmada por Victor).
- Solo cuentan las series marcadas como hechas (✓) para peso máximo, reps,
  volumen, récords, recomendaciones y Progreso. Un ejercicio sin series
  marcadas muestra "Sin datos" y no sugiere peso.
- Volumen = suma de peso × reps de las series marcadas (una serie marcada sin
  reps anotadas cuenta como 1 rep, igual que en el registro original).
- Sugerencia por ejercicio (progresión doble, por reglas, sin IA): si en la
  última sesión de esa rutina el ejercicio completó **todas** sus series en el
  tope del rango de reps, sugiere subir el mínimo (kg +2.5, lb +5); si no,
  sugiere repetir el último peso máximo; sin sesión previa, usa el peso de
  referencia.

## Datos y respaldo

- La app arranca **vacía de sesiones**: solo trae las 54 rutinas. El historial
  personal no va embebido en los archivos.
- Los datos se guardan en el navegador (localStorage). No hay sincronización
  entre dispositivos: para mover el historial, exporta el respaldo en un
  dispositivo e impórtalo en el otro.
- `respaldo-gimnasio.json` es el archivo de respaldo importable con el
  historial real: 8 sesiones, 263 series y notas. No va en este repositorio:
  se pasa aparte. Para cargarlo: abre la app → **Config → Importar
  respaldo** → elige el archivo. Las filas de progreso se recalculan solas
  a partir de las series, por eso no van en el respaldo.

## Publicación en GitHub Pages

1. Sube a la raíz del repositorio solo estos archivos: `index.html`,
   `styles.css`, `app.js`, `routines.js`, `manifest.json`, `sw.js`,
   `icon.svg` y este `README.md`. No subas `datos-exportados.json` ni
   `respaldo-gimnasio.json`: contienen el historial personal.
2. En el repositorio: Settings → Pages → Source: Deploy from a branch →
   rama `main`, carpeta `/ (root)`.
3. Abre la URL que te da GitHub Pages. Para instalarla en el teléfono usa
   "Agregar a pantalla de inicio" desde el navegador.

## Pendiente / limitaciones conocidas

- **Sin fotos de ejercicios** en esta versión: no se pudieron extraer del
  registro original. Queda pendiente agregarlas (una imagen por ejercicio).
- **Sin IA**: las recomendaciones nuevas son por reglas (ver arriba). Son más
  conservadoras que las que generaba el registro original con IA: solo suben
  peso cuando el ejercicio completó todas sus series en el tope del rango.
- Los audios del contador dependen de la voz en español del teléfono
  (speechSynthesis). Con la pantalla apagada el navegador puede pausar la voz.
- La elevación individual lateral en polea figura con **4 series** en la
  exportación del registro original, aunque su esquema dice "2 series" y la
  rutina escrita decía "x2" (el 16 nov se registraron 4 series). Se respetó
  el dato de la exportación.
- Los ejercicios con peso en blanco (hiperextensiones, desplante, prensa
  vertical, patada y abducción en máquina) se registran sin peso hasta que
  Victor anote uno.
