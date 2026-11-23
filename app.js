/* Registro de gimnasio — réplica estática para GitHub Pages.
   Vanilla JS, sin dependencias ni CDN. Los datos viven en localStorage.
   Reglas: solo cuentan las series marcadas como hechas (✓).
   Volumen = suma de peso × reps de las series marcadas (reps sin anotar cuentan como 1).
   Pesos tal como están escritos: kg y lb distintos, nunca convertir. */

'use strict';

/* ================= MOTOR PURO (sin DOM: se puede probar en Node) ================= */

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ¿Ejercicio unilateral? (reps por lado: se cuentan al doble en el contador de voz) */
function esUnilateral(nombre) {
  return /individual/i.test(nombre || '');
}

/* Parsea el esquema de un ejercicio.
   Devuelve: { series, repMin, repMax, slowReps, normalReps, totalReps,
               biserie, dropSet, slowPhases, normalPhases, returnSay }.
   slowPhases / normalPhases: [{say, secs}] por repetición.
   Reglas de tempo (del esquema):
   - "N seg abajo"   -> fase lenta de N s bajando.
   - "N seg arriba"  -> N<=2: aguantar N s arriba; N>=3: subir lento N s.
   - "N seg atrás"   -> N<=2: aguantar N s; N>=3: jalar lento N s.
   - "(verbo en N seg, te quedas ... M seg ... por rep)" -> fases en ese orden.
   - "más N rep normales" -> N reps extra a ritmo normal tras las lentas.
   - "6 rep con peso alto, quitas la mitad del peso y sacas 10 rep" (drop set) -> 16 reps. */
function parseEsquema(esquema, nSeries) {
  const txt = (esquema || '').trim();
  const biserie = /biserie/i.test(txt);
  const out = {
    series: nSeries || 3, repMin: null, repMax: null,
    slowReps: 0, normalReps: 0, totalReps: 0,
    biserie, dropSet: false,
    slowPhases: [], normalPhases: [], returnSay: 'Sube',
  };

  // --- drop set: "6 rep con peso alto, quitas la mitad del peso y sacas 10 rep" ---
  const drop = txt.match(/(\d+)\s*rep con peso alto, quitas la mitad del peso y sacas (\d+)(?:-(\d+))?\s*rep/);
  let baseMin = null, baseMax = null;
  if (drop) {
    out.dropSet = true;
    const heavy = parseInt(drop[1], 10);
    const light = parseInt(drop[3] || drop[2], 10);
    out.repMin = heavy + parseInt(drop[2], 10);
    out.repMax = heavy + light;
    // ¿las reps ligeras llevan tempo? ("sacas 10 rep con 2 seg arriba por rep")
    const tempoLight = txt.match(/sacas \d+(?:-\d+)? rep con (\d+)\s*seg (abajo|arriba|atrás)/);
    if (tempoLight) {
      const ph = fasesSimples(parseInt(tempoLight[1], 10), tempoLight[2]);
      out.slowPhases = ph.phases; out.returnSay = ph.returnSay;
      out.slowReps = light; out.normalReps = heavy;
    } else {
      out.slowReps = 0; out.normalReps = out.repMax;
    }
    out.totalReps = out.repMax;
    out.normalPhases = fasesNormales(out.slowPhases, out.returnSay);
    return out;
  }

  // --- reps base: "de M-N rep" / "de M rep" / "de M zancadas" ---
  const mRep = txt.match(/de\s+(\d+)(?:-(\d+))?\s+(?:rep|zancadas)/);
  if (mRep) {
    baseMin = parseInt(mRep[1], 10);
    baseMax = parseInt(mRep[2] || mRep[1], 10);
    out.repMin = baseMin; out.repMax = baseMax;
  }

  // --- "más N rep normales" ---
  const mExtra = txt.match(/más\s+(\d+)(?:-(\d+))?\s+rep normales/);
  const extra = mExtra ? parseInt(mExtra[2] || mExtra[1], 10) : 0;

  // --- tempo entre paréntesis: "(... por rep)" ---
  const mPar = txt.match(/\((.+?por rep)\)/);
  if (mPar) {
    const ph = fasesParentesis(mPar[1]);
    out.slowPhases = ph.phases; out.returnSay = ph.returnSay;
    out.slowReps = baseMax || 0; out.normalReps = extra;
  } else {
    // --- tempo simple: "N seg abajo/arriba/atrás/en isometría" ---
    const mSimple = txt.match(/(\d+)\s+seg\s+(abajo|arriba|atrás|en isometría)/);
    if (mSimple) {
      const ph = fasesSimples(parseInt(mSimple[1], 10), mSimple[2]);
      out.slowPhases = ph.phases; out.returnSay = ph.returnSay;
      out.slowReps = baseMax || 0; out.normalReps = extra;
    } else {
      out.slowReps = 0; out.normalReps = baseMax || 0;
    }
  }

  out.totalReps = out.slowReps + out.normalReps;
  if (out.totalReps === 0 && baseMax) { out.totalReps = baseMax; out.normalReps = baseMax; }
  out.normalPhases = fasesNormales(out.slowPhases, out.returnSay);
  return out;
}

/* Fases para "N seg <dir>" sin paréntesis. */
function fasesSimples(n, dir) {
  if (dir === 'abajo') {
    return { phases: [{ say: n >= 2 ? 'Baja lento' : 'Baja', secs: n }, { say: 'Sube', secs: 1 }], returnSay: 'Sube' };
  }
  if (dir === 'arriba') {
    if (n <= 2) return { phases: [{ say: 'Sube', secs: 1 }, { say: 'Aguanta', secs: n }], returnSay: 'Baja' };
    return { phases: [{ say: 'Sube lento', secs: n }, { say: 'Baja', secs: 1 }], returnSay: 'Baja' };
  }
  if (dir === 'atrás') {
    if (n <= 2) return { phases: [{ say: 'Jala', secs: 1 }, { say: 'Aguanta', secs: n }], returnSay: 'Regresa' };
    return { phases: [{ say: 'Jala lento', secs: n }, { say: 'Regresa', secs: 1 }], returnSay: 'Regresa' };
  }
  // "en isometría" (cross over: cierra y aguanta al frente)
  return { phases: [{ say: 'Cierra', secs: 1 }, { say: 'Aguanta', secs: n }], returnSay: 'Regresa' };
}

/* Fases para "(verbo en N seg, te quedas ... M seg ... por rep)". */
function fasesParentesis(contenido) {
  const verbos = { baja: 'Baja', bajas: 'Baja', sube: 'Sube', cierra: 'Cierra', regresa: 'Regresa', regresas: 'Regresa', empuja: 'Empuja', jala: 'Jala', abre: 'Abre' };
  const partes = contenido.split(/\s*,\s*|\s+y\s+/);
  const phases = [];
  let returnSay = 'Sube';
  for (const p of partes) {
    const hold = p.match(/te quedas/i);
    if (hold) {
      const s = p.match(/(\d+)\s*seg/);
      phases.push({ say: 'Aguanta', secs: s ? parseInt(s[1], 10) : 2 });
      continue;
    }
    const mv = p.match(/([a-záéíóú]+)\s+en\s+(\d+)\s*seg/i);
    if (mv) {
      const verbo = (verbos[mv[1].toLowerCase()] || cap(mv[1].toLowerCase()));
      const secs = parseInt(mv[2], 10);
      phases.push({ say: secs >= 3 ? verbo + ' lento' : verbo, secs });
      returnSay = verbo;
    }
  }
  if (!phases.length) return { phases: [{ say: 'Baja', secs: 1 }, { say: 'Sube', secs: 1 }], returnSay: 'Sube' };
  return { phases, returnSay };
}

/* Fases de las reps normales: las lentas a 1 s, sin "lento" y sin "Aguanta". */
function fasesNormales(slowPhases, returnSay) {
  if (!slowPhases || !slowPhases.length) return [{ say: 'Baja', secs: 1 }, { say: 'Sube', secs: 1 }];
  const norm = slowPhases
    .filter(p => p.say !== 'Aguanta')
    .map(p => ({ say: p.say.replace(/ lento$/, ''), secs: 1 }));
  if (norm.length === 0) return [{ say: 'Baja', secs: 1 }, { say: 'Sube', secs: 1 }];
  if (norm.length === 1) norm.push({ say: returnSay || 'Sube', secs: 1 });
  return norm;
}

/* Construye la lista plana de fases de una serie para el contador de voz.
   Devuelve { fases: [{say, secs, rep, lado}], totalReps }.
   Unilateral: el doble de reps (por lado), con pausa "Cambia de lado" a la mitad. */
function construirFasesSerie(parsed, unilateral, multTempo) {
  const mult = multTempo || 1;
  const fases = [];
  const porLado = parsed.totalReps;
  const lados = unilateral ? 2 : 1;
  for (let lado = 1; lado <= lados; lado++) {
    for (let rep = 1; rep <= parsed.slowReps; rep++) {
      parsed.slowPhases.forEach((ph, i) => {
        fases.push({ say: i === 0 ? rep + '. ' + ph.say : ph.say, secs: Math.max(1, Math.round(ph.secs * mult)), rep, lado });
      });
    }
    for (let rep = parsed.slowReps + 1; rep <= porLado; rep++) {
      parsed.normalPhases.forEach((ph, i) => {
        fases.push({ say: i === 0 ? rep + '. ' + ph.say : ph.say, secs: Math.max(1, Math.round(ph.secs * mult)), rep, lado });
      });
    }
    if (unilateral && lado === 1) {
      fases.push({ say: 'Cambia de lado', secs: 3, rep: porLado, lado: 1, pausa: true });
    }
  }
  return { fases, totalReps: porLado * lados };
}

/* Volumen de una lista de series: solo las marcadas; reps sin anotar cuentan como 1. */
function calcVolumen(filas) {
  let v = 0;
  for (const f of filas) {
    if (f.hecha && f.peso != null) v += f.peso * (f.reps == null ? 1 : f.reps);
  }
  return Math.round(v);
}

/* Peso máximo (solo series marcadas) de un ejercicio en una lista de series. */
function pesoMaxDe(filas) {
  let m = null;
  for (const f of filas) {
    if (f.hecha && f.peso != null && (m == null || f.peso > m)) m = f.peso;
  }
  return m;
}

/* Sugerencia por ejercicio (progresión doble, regla determinista):
   - Última sesión terminada de esa rutina (día).
   - Si el ejercicio completó TODAS sus series en el tope del rango de reps
     -> subir el mínimo (kg +2.5, lb +5).
   - Si no -> repetir el último peso máximo.
   - Sin sesión previa -> peso de referencia (serie 1, primer valor no nulo). */
function sugerenciaPeso(rutina, sesiones, todasSeries) {
  const dia = rutina.dia;
  const previas = sesiones
    .filter(s => s.dia === dia && s.terminada)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const ref = (rutina.pesos || []).find(p => p != null);
  if (!previas.length) return { peso: ref != null ? ref : null, sube: false, razon: 'referencia' };
  const ult = previas[0];
  const filas = todasSeries.filter(r => r.sesionId === ult.id && r.ejercicio === rutina.nombre);
  const marcadas = filas.filter(r => r.hecha);
  if (!marcadas.length) return { peso: ref != null ? ref : null, sube: false, razon: 'sin-datos' };
  const ultimoMax = pesoMaxDe(marcadas);
  const parsed = parseEsquema(rutina.esquema, rutina.series);
  const tope = parsed.totalReps || parsed.repMax || 0;
  const todasAlTope = marcadas.length >= rutina.series &&
    marcadas.every(r => (r.reps == null ? 0 : r.reps) >= tope);
  if (todasAlTope && ultimoMax != null) {
    const inc = rutina.unidad === 'lb' ? 5 : 2.5;
    return { peso: Math.round((ultimoMax + inc) * 2) / 2, sube: true, razon: 'tope' };
  }
  return { peso: ultimoMax, sube: false, razon: 'repetir' };
}

/* Progreso de un ejercicio: por fecha, peso máximo y volumen (solo series marcadas). */
function progresoDe(nombre, sesiones, todasSeries) {
  const porFecha = {};
  for (const s of sesiones) {
    const filas = todasSeries.filter(r => r.sesionId === s.id && r.ejercicio === nombre && r.hecha && r.peso != null);
    if (!filas.length) continue;
    porFecha[s.fecha] = {
      fecha: s.fecha,
      pesoMax: Math.max(...filas.map(r => r.peso)),
      volumen: calcVolumen(filas),
    };
  }
  return Object.values(porFecha).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
}

/* Recomendaciones por reglas al terminar una sesión (sin IA).
   Devuelve { general, porEjercicio: [{nombre, texto, sube, peso, unidad}] }. */
function generarRecomendaciones(sesion, filasSesion, rutinaDia, sesionesPrevias, todasSeries) {
  const porEjercicio = [];
  for (const r of rutinaDia) {
    const filas = filasSesion.filter(f => f.ejercicio === r.nombre);
    const marcadas = filas.filter(f => f.hecha);
    const sug = sugerenciaPeso(r, sesionesPrevias.concat([sesion]), todasSeries.concat(filasSesion));
    if (!marcadas.length) {
      porEjercicio.push({ nombre: r.nombre, texto: 'Sin datos: no se marcó ninguna serie. Regístrala la próxima vez para sugerir peso.', sube: false, peso: null, unidad: r.unidad });
      continue;
    }
    if (sug.sube) {
      porEjercicio.push({ nombre: r.nombre, texto: 'Llegaste al tope del rango en todas las series. Sube a ' + fmtPeso(sug.peso, r.unidad) + ' la próxima vez.', sube: true, peso: sug.peso, unidad: r.unidad });
    } else {
      porEjercicio.push({ nombre: r.nombre, texto: 'Repite ' + fmtPeso(sug.peso, r.unidad) + ' y busca completar todas las repeticiones del rango antes de subir.', sube: false, peso: sug.peso, unidad: r.unidad });
    }
  }
  const hechas = filasSesion.filter(f => f.hecha).length;
  const total = filasSesion.length;
  const vol = calcVolumen(filasSesion);
  const prev = sesionesPrevias.filter(s => s.dia === sesion.dia && s.terminada).sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
  let general = 'Completaste ' + hechas + ' de ' + total + ' series (' + Math.round(hechas / Math.max(1, total) * 100) + '%) con un volumen de ' + vol.toLocaleString('es-MX') + '.';
  if (prev) {
    general += vol > prev.volumen
      ? ' Subiste el volumen frente a ' + prev.volumen.toLocaleString('es-MX') + ' de la sesión anterior.'
      : ' Volumen similar a la sesión anterior (' + prev.volumen.toLocaleString('es-MX') + '): la próxima va de completar mejor las series finales.';
  }
  return { general, porEjercicio };
}

function fmtPeso(p, unidad) {
  if (p == null) return '—';
  const n = (Math.round(p * 10) / 10).toString().replace('.', ',');
  return n + ' ' + unidad;
}

function fmtFecha(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const dt = new Date(y, m - 1, d);
  return dias[dt.getDay()] + ' ' + d + ' ' + meses[m - 1] + ' ' + y;
}

function hoyISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

function diaSemanaDe(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date(y, m - 1, d).getDay()];
}

function fmtTiempo(seg) {
  seg = Math.max(0, Math.round(seg));
  const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = seg % 60;
  if (h > 0) return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

/* Para pruebas en Node (sin DOM). */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseEsquema, construirFasesSerie, esUnilateral, calcVolumen, pesoMaxDe, sugerenciaPeso, progresoDe, generarRecomendaciones, fmtPeso, fmtFecha, hoyISO, diaSemanaDe, fmtTiempo };
}

/* ================= CAPA DE DATOS (navegador) ================= */
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const LS = {
  sesiones: 'rg_sesiones_v1',
  series: 'rg_series_v1',
  notas: 'rg_notas_v1',
  rutinas: 'rg_rutinas_v1',
  config: 'rg_config_v1',
  activa: 'rg_activa_v1',
};

const state = {
  sesiones: [], series: [], notas: {},
  rutinas: [], config: { descanso: 60, prep: 3 },
  activa: null, diaActual: 'Lunes', tab: 'entrenar',
  ejercicioProgreso: null, sesionDetalle: null, editandoEj: null,
};

function lsGet(key, def) {
  try { const v = localStorage.getItem(key); return v == null ? def : JSON.parse(v); }
  catch (e) { return def; }
}
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
function lsDel(key) { try { localStorage.removeItem(key); } catch (e) {} }

function cargarEstado() {
  state.sesiones = lsGet(LS.sesiones, []);
  state.series = lsGet(LS.series, []);
  state.notas = lsGet(LS.notas, {});
  state.config = Object.assign({ descanso: 60, prep: 3 }, lsGet(LS.config, {}));
  state.activa = lsGet(LS.activa, null);
  const override = lsGet(LS.rutinas, null);
  state.rutinas = (override && override.length) ? override : JSON.parse(JSON.stringify(ROUTINES));
}
function guardarEstado() {
  lsSet(LS.sesiones, state.sesiones);
  lsSet(LS.series, state.series);
  lsSet(LS.notas, state.notas);
  lsSet(LS.config, state.config);
  if (state.activa) lsSet(LS.activa, state.activa); else lsDel(LS.activa);
}
function guardarRutinas() { lsSet(LS.rutinas, state.rutinas); }

function rutinasDe(dia) { return state.rutinas.filter(r => r.dia === dia); }
function rutinaPorId(id) { return state.rutinas.find(r => r.id === id); }
function siguienteSesionId() {
  return state.sesiones.reduce((m, s) => Math.max(m, s.id || 0), 0) + 1;
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function $(id) { return document.getElementById(id); }

/* ================= UI GENERAL ================= */
function cambiarTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
  if (tab === 'progreso') renderProgreso();
  if (tab === 'historial') renderHistorial();
  if (tab === 'rutinas') renderRutinas();
  if (tab === 'config') renderConfig();
  if (tab === 'entrenar') renderEntrenar();
}

function renderTop() {
  const hoy = hoyISO();
  $('fechaHoy').textContent = fmtFecha(hoy) + ' · ' + diaSemanaDe(hoy);
  const totalSes = state.sesiones.filter(s => s.terminada).length;
  const totalSeries = state.series.filter(r => r.hecha).length;
  const vol = state.sesiones.filter(s => s.terminada).reduce((a, s) => a + (s.volumen || 0), 0);
  $('topStats').textContent = totalSes + ' sesiones\n' + totalSeries + ' series hechas\nVolumen total: ' + vol.toLocaleString('es-MX');
}

/* ================= ENTRENAR ================= */
function diaDeHoy() {
  const d = new Date().getDay(); // 0 dom .. 6 sáb
  return ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d];
}

function renderEntrenar() {
  const hoy = diaDeHoy();
  const dias = DIAS.map(d => d.dia);
  $('selectorDia').innerHTML = dias.map(d =>
    '<button class="daybtn' + (d === state.diaActual ? ' active' : '') + (d === hoy ? ' today' : '') +
    '" data-dia="' + d + '">' + d.slice(0, 3) + '</button>').join('');
  $('selectorDia').querySelectorAll('.daybtn').forEach(b => {
    b.addEventListener('click', () => { state.diaActual = b.dataset.dia; renderEntrenar(); });
  });

  if (state.activa) { mostrarSesion(); return; }
  $('vistaPrevia').classList.remove('hide');
  $('vistaSesion').classList.add('hide');
  $('vistaCierre').classList.add('hide');

  const rutina = DIAS.find(d => d.dia === state.diaActual).rutina;
  const lista = rutinasDe(state.diaActual);
  $('tituloRutina').textContent = state.diaActual + ' · ' + rutina;
  $('resumenRutina').textContent = lista.length + ' ejercicios · ' +
    lista.reduce((a, r) => a + r.series, 0) + ' series';

  // Banner recordatorio: última sesión terminada de este día
  const previas = state.sesiones.filter(s => s.dia === state.diaActual && s.terminada)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const banner = $('bannerRecordatorio');
  if (previas.length) {
    const ult = previas[0];
    const nota = state.notas[state.diaActual] || ult.notaProxima || '';
    let html = '<b>Recordatorio de tu última sesión (' + fmtFecha(ult.fecha) + ')</b>';
    if (ult.recomendaciones) html += '<div>' + esc(ult.recomendaciones.general || ult.recomendaciones) + '</div>';
    const sube = (ult.recomendaciones && ult.recomendaciones.porEjercicio || [])
      .filter(p => p.sube).map(p => p.nombre + ' → ' + fmtPeso(p.peso, p.unidad));
    if (sube.length) html += '<div>Sube la próxima vez: ' + esc(sube.join(' · ')) + '</div>';
    if (nota) html += '<div>Tu nota: ' + esc(nota) + '</div>';
    banner.innerHTML = html;
    banner.classList.remove('hide');
  } else {
    banner.classList.add('hide');
    banner.innerHTML = '';
  }

  $('listaPrevia').innerHTML = lista.map(r => {
    const sug = sugerenciaPeso(r, state.sesiones, state.series);
    const refTxt = (r.pesos || []).map(p => p == null ? '—' : p).join(' / ');
    const sugTxt = sug.peso == null
      ? '<span class="sug nodata">Sin datos</span>'
      : '<span class="sug">Sugerido: ' + fmtPeso(sug.peso, r.unidad) + (sug.sube ? ' ↑' : '') + '</span>';
    return '<div class="ej-card"><div class="ej-head"><span class="ej-nombre">' + esc(r.nombre) + '</span></div>' +
      '<div class="ej-esquema">' + esc(r.esquema) + ' · Ref: ' + esc(refTxt) + ' ' + r.unidad + '</div>' + sugTxt + '</div>';
  }).join('');
}

function iniciarSesion() {
  const dia = state.diaActual;
  const rutina = DIAS.find(d => d.dia === dia).rutina;
  const lista = rutinasDe(dia);
  const id = siguienteSesionId();
  const filas = [];
  for (const r of lista) {
    const sug = sugerenciaPeso(r, state.sesiones, state.series);
    for (let i = 1; i <= r.series; i++) {
      let peso = null;
      if (sug.peso != null && sug.razon !== 'referencia') peso = sug.peso;
      else peso = (r.pesos || [])[i - 1] != null ? r.pesos[i - 1] : (r.pesos || []).find(p => p != null) || null;
      const parsed = parseEsquema(r.esquema, r.series);
      filas.push({
        sesionId: id, fecha: hoyISO(), dia, rutina, seccion: r.seccion,
        ejercicio: r.nombre, serie: i, peso, reps: parsed.totalReps || null,
        hecha: false, unidad: r.unidad,
      });
    }
  }
  state.activa = {
    id, fecha: hoyISO(), dia, rutina, terminada: false,
    horaInicio: Date.now(), filas,
  };
  guardarEstado();
  mostrarSesion();
}

function mostrarSesion() {
  $('vistaPrevia').classList.add('hide');
  $('vistaCierre').classList.add('hide');
  $('vistaSesion').classList.remove('hide');
  renderSesion();
  iniciarLive();
}

function renderSesion() {
  const act = state.activa;
  if (!act) return;
  const porEj = {};
  for (const f of act.filas) (porEj[f.ejercicio] = porEj[f.ejercicio] || []).push(f);
  const lista = rutinasDe(act.dia);
  const html = [];
  let seccionActual = '';
  for (const r of lista) {
    if (r.seccion !== seccionActual) { seccionActual = r.seccion; html.push('<div class="seccion">' + esc(seccionActual) + '</div>'); }
    const filas = porEj[r.nombre] || [];
    const hechas = filas.filter(f => f.hecha).length;
    const prevMax = pesoMaxDe(state.series.filter(s => s.ejercicio === r.nombre));
    const cls = hechas === filas.length && filas.length ? ' done' : '';
    html.push('<div class="ej-card' + cls + '" data-ej="' + esc(r.nombre) + '">');
    html.push('<div class="ej-head"><span class="ej-nombre">' + esc(r.nombre) + '</span><span class="mini">' + hechas + '/' + filas.length + '</span></div>');
    html.push('<div class="ej-esquema">' + esc(r.esquema) + '</div>');
    filas.forEach((f, idx) => {
      const esRecord = f.hecha && f.peso != null && prevMax != null && f.peso > prevMax;
      html.push('<div class="serie-row"><span class="num">' + f.serie + '</span>' +
        '<span class="stepper"><button data-act="peso-menos" data-idx="' + idx + '" data-ej="' + esc(r.nombre) + '">−</button>' +
        '<input type="number" step="any" inputmode="decimal" value="' + (f.peso == null ? '' : f.peso) + '" data-peso-idx="' + idx + '" data-ej="' + esc(r.nombre) + '" aria-label="Peso serie ' + f.serie + '">' +
        '<span class="unit">' + r.unidad + '</span>' +
        '<button data-act="peso-mas" data-idx="' + idx + '" data-ej="' + esc(r.nombre) + '">+</button></span>' +
        '<span class="stepper"><button data-act="reps-menos" data-idx="' + idx + '" data-ej="' + esc(r.nombre) + '">−</button>' +
        '<input type="number" inputmode="numeric" value="' + (f.reps == null ? '' : f.reps) + '" data-reps-idx="' + idx + '" data-ej="' + esc(r.nombre) + '" aria-label="Reps serie ' + f.serie + '">' +
        '<span class="unit">rep</span>' +
        '<button data-act="reps-mas" data-idx="' + idx + '" data-ej="' + esc(r.nombre) + '">+</button></span>' +
        '<button class="check' + (f.hecha ? ' on' : '') + '" data-check-idx="' + idx + '" data-ej="' + esc(r.nombre) + '" aria-label="Marcar serie ' + f.serie + ' como hecha">' + (f.hecha ? '✓' : '') + '</button>' +
        '<button class="voice-btn" data-voz-idx="' + idx + '" data-ej="' + esc(r.nombre) + '" title="Contar reps con voz">🎙️</button>' +
        (esRecord ? '<span class="record">¡RÉCORD!</span>' : '') +
        '</div>');
    });
    html.push('</div>');
  }
  $('listaSesion').innerHTML = html.join('');

  // Listeners (delegación por contenedor)
  $('listaSesion').querySelectorAll('[data-act]').forEach(b => {
    b.addEventListener('click', () => {
      const ej = b.dataset.ej, idx = +b.dataset.idx;
      const fila = filaActiva(ej, idx);
      if (!fila) return;
      const paso = fila.unidad === 'lb' ? 5 : 2.5;
      if (b.dataset.act === 'peso-mas') fila.peso = (fila.peso == null ? 0 : fila.peso) + paso;
      if (b.dataset.act === 'peso-menos') fila.peso = Math.max(0, (fila.peso == null ? 0 : fila.peso) - paso);
      if (b.dataset.act === 'reps-mas') fila.reps = (fila.reps == null ? 0 : fila.reps) + 1;
      if (b.dataset.act === 'reps-menos') fila.reps = Math.max(0, (fila.reps == null ? 0 : fila.reps) - 1);
      guardarEstado(); renderSesion();
    });
  });
  $('listaSesion').querySelectorAll('[data-peso-idx]').forEach(inp => {
    inp.addEventListener('change', () => {
      const fila = filaActiva(inp.dataset.ej, +inp.dataset.pesoIdx);
      if (!fila) return;
      fila.peso = inp.value === '' ? null : parseFloat(inp.value);
      guardarEstado(); actualizarLive();
    });
  });
  $('listaSesion').querySelectorAll('[data-reps-idx]').forEach(inp => {
    inp.addEventListener('change', () => {
      const fila = filaActiva(inp.dataset.ej, +inp.dataset.repsIdx);
      if (!fila) return;
      fila.reps = inp.value === '' ? null : parseInt(inp.value, 10);
      guardarEstado(); actualizarLive();
    });
  });
  $('listaSesion').querySelectorAll('[data-check-idx]').forEach(b => {
    b.addEventListener('click', () => {
      const fila = filaActiva(b.dataset.ej, +b.dataset.checkIdx);
      if (!fila) return;
      fila.hecha = !fila.hecha;
      guardarEstado(); renderSesion();
    });
  });
  $('listaSesion').querySelectorAll('[data-voz-idx]').forEach(b => {
    b.addEventListener('click', () => abrirVoz(b.dataset.ej, +b.dataset.vozIdx));
  });
  actualizarLive();
}

function filaActiva(ejercicio, idx) {
  if (!state.activa) return null;
  return state.activa.filas.filter(f => f.ejercicio === ejercicio)[idx] || null;
}

/* ---- Panel en vivo ---- */
let liveTimer = null;
function iniciarLive() {
  if (liveTimer) clearInterval(liveTimer);
  liveTimer = setInterval(actualizarLive, 1000);
  actualizarLive();
}
function detenerLive() { if (liveTimer) { clearInterval(liveTimer); liveTimer = null; } }

function actualizarLive() {
  const act = state.activa;
  if (!act || !$('liveTiempo')) return;
  const transcurrido = Math.floor((Date.now() - act.horaInicio) / 1000);
  const total = act.filas.length;
  const hechas = act.filas.filter(f => f.hecha).length;
  const pct = total ? Math.round(hechas / total * 100) : 0;
  $('liveTiempo').textContent = fmtTiempo(transcurrido);
  $('livePct').textContent = pct + '%';
  $('liveBarra').style.width = pct + '%';
  $('liveDetalle').textContent = hechas + ' de ' + total + ' series · Volumen: ' +
    calcVolumen(act.filas).toLocaleString('es-MX');
  // Tiempo restante: ritmo real de hoy; si no, promedio de sesiones terminadas de la rutina; si no, 90 s por serie.
  let segPorSerie = 90;
  if (hechas > 0) segPorSerie = transcurrido / hechas;
  else {
    const previas = state.sesiones.filter(s => s.dia === act.dia && s.terminada && s.duracionSeg);
    if (previas.length) {
      const tot = previas.reduce((a, s) => a + s.duracionSeg, 0);
      const n = previas.reduce((a, s) => a + (s.seriesTotales || 0), 0);
      if (n > 0) segPorSerie = tot / n;
    }
  }
  const restantes = total - hechas;
  if (restantes > 0 && hechas > 0) {
    const resto = Math.round(segPorSerie * restantes);
    $('liveRestante').textContent = '≈ ' + fmtTiempo(resto);
    $('liveFin').textContent = new Date(Date.now() + resto * 1000).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  } else if (restantes === 0) {
    $('liveRestante').textContent = '0:00';
    $('liveFin').textContent = '—';
  } else {
    $('liveRestante').textContent = '≈ ' + fmtTiempo(Math.round(segPorSerie * total));
    $('liveFin').textContent = new Date(Date.now() + segPorSerie * total * 1000).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}

/* ---- Terminar rutina ---- */
function terminarRutina() {
  const act = state.activa;
  if (!act) return;
  detenerLive();
  const rutinaDia = rutinasDe(act.dia);
  const rec = generarRecomendaciones(
    { dia: act.dia, fecha: act.fecha },
    act.filas, rutinaDia, state.sesiones, state.series);
  act.recomendaciones = rec;
  act.volumen = calcVolumen(act.filas);
  act.seriesHechas = act.filas.filter(f => f.hecha).length;
  act.seriesTotales = act.filas.length;
  act.duracionSeg = Math.floor((Date.now() - act.horaInicio) / 1000);
  $('vistaSesion').classList.add('hide');
  $('vistaCierre').classList.remove('hide');
  $('cierreResumen').textContent = act.seriesHechas + ' de ' + act.seriesTotales + ' series · Volumen ' +
    act.volumen.toLocaleString('es-MX') + ' · ' + fmtTiempo(act.duracionSeg);
  $('cierreRecomendaciones').innerHTML =
    '<p>' + esc(rec.general) + '</p>' +
    '<ul>' + rec.porEjercicio.map(p =>
      '<li><b>' + esc(p.nombre) + ':</b> ' + esc(p.texto) + '</li>').join('') + '</ul>';
  $('notaProxima').value = state.notas[act.dia] || '';
}

function guardarCierre() {
  const act = state.activa;
  if (!act) return;
  const nota = $('notaProxima').value.trim();
  if (nota) state.notas[act.dia] = nota;
  const sesion = {
    id: act.id, fecha: act.fecha, dia: act.dia, rutina: act.rutina,
    terminada: true, volumen: act.volumen, seriesHechas: act.seriesHechas,
    seriesTotales: act.seriesTotales, duracionSeg: act.duracionSeg,
    recomendaciones: act.recomendaciones, notaProxima: nota,
  };
  state.sesiones.push(sesion);
  for (const f of act.filas) state.series.push(Object.assign({}, f));
  state.activa = null;
  guardarEstado();
  $('vistaCierre').classList.add('hide');
  renderTop();
  renderEntrenar();
  cambiarTab('historial');
}

/* ================= CONTADOR DE VOZ ================= */
const voz = {
  abierto: false, ejercicio: null, serieIdx: 0, rutina: null, fila: null,
  parsed: null, unilateral: false, fases: [], faseIdx: 0,
  totalReps: 0, repsCompletados: 0,
  estado: 'idle', // idle | prep | serie | descanso | pausa
  estadoPrevio: null, finFase: 0, restanteMs: 0,
  descansoSeg: 60, prepSeg: 3, multTempo: 1,
  aviso7: false, timer: null, wakeLock: null,
};

function hablar(texto) {
  if (!isBrowser || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-MX';
    const voces = window.speechSynthesis.getVoices() || [];
    const v = voces.find(x => (x.lang || '').toLowerCase().startsWith('es-mx')) ||
              voces.find(x => (x.lang || '').toLowerCase().startsWith('es'));
    if (v) u.voice = v;
    u.rate = 1;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

async function pedirWakeLock() {
  try {
    if ('wakeLock' in navigator) voz.wakeLock = await navigator.wakeLock.request('screen');
  } catch (e) {}
}
function liberarWakeLock() {
  try { if (voz.wakeLock) { voz.wakeLock.release(); voz.wakeLock = null; } } catch (e) {}
}

function abrirVoz(ejercicio, serieIdx) {
  if (!state.activa) return;
  const rutina = state.rutinas.find(x => x.nombre === ejercicio && x.dia === state.activa.dia)
    || state.rutinas.find(x => x.nombre === ejercicio);
  if (!rutina) return;
  voz.ejercicio = ejercicio; voz.serieIdx = serieIdx; voz.rutina = rutina;
  voz.fila = filaActiva(ejercicio, serieIdx);
  voz.parsed = parseEsquema(rutina.esquema, rutina.series);
  voz.unilateral = esUnilateral(ejercicio);
  voz.totalReps = voz.parsed.totalReps || 10;
  voz.estado = 'idle';
  $('vozEjercicio').textContent = ejercicio;
  actualizarInfoSerieVoz();
  $('vozRepsObj').value = voz.totalReps;
  $('vozDescanso').value = state.config.descanso;
  $('vozPrep').value = state.config.prep;
  $('vozTempo').value = '1';
  $('vozRepNum').textContent = '0';
  $('vozRepTotal').textContent = voz.totalReps * (voz.unilateral ? 2 : 1);
  $('vozFase').textContent = 'Prepárate';
  $('vozSeg').textContent = '0';
  $('vozBarra').style.width = '0%';
  $('vozAviso').textContent = voz.unilateral
    ? 'Cuenta el doble de reps (por lado). A la mitad escucharás "Cambia de lado".'
    : (voz.parsed.biserie ? 'Biserie: al terminar esta serie sigue la siguiente sin descanso largo.' : '');
  $('vozIniciar').textContent = 'Empezar serie';
  $('vozIniciar').disabled = false;
  $('vozPausa').textContent = 'Pausar';
  $('vozOverlay').classList.remove('hide');
  voz.abierto = true;
  pedirWakeLock();
}

function actualizarInfoSerieVoz() {
  $('vozSerie').textContent = 'Serie ' + (voz.serieIdx + 1) + ' de ' + voz.rutina.series +
    ' · ' + fmtPeso(voz.fila ? voz.fila.peso : null, voz.rutina.unidad) +
    (voz.unilateral ? ' · Unilateral (reps por lado)' : '') +
    (voz.parsed.biserie ? ' · Biserie' : '');
  const sel = $('vozSerieSel');
  if (sel.options.length !== voz.rutina.series) {
    sel.innerHTML = Array.from({ length: voz.rutina.series }, (_, i) =>
      '<option value="' + i + '">Serie ' + (i + 1) + '</option>').join('');
    sel.onchange = () => {
      voz.serieIdx = +sel.value;
      voz.fila = filaActiva(voz.ejercicio, voz.serieIdx);
      actualizarInfoSerieVoz();
    };
  }
  sel.value = String(voz.serieIdx);
}

function cerrarVoz() {
  detenerVozTick();
  liberarWakeLock();
  try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) {}
  voz.abierto = false; voz.estado = 'idle';
  $('vozOverlay').classList.add('hide');
  renderSesion();
}

function leerAjustesVoz() {
  voz.descansoSeg = Math.min(120, Math.max(30, parseInt($('vozDescanso').value, 10) || 60));
  voz.prepSeg = parseInt($('vozPrep').value, 10) || 3;
  voz.multTempo = parseFloat($('vozTempo').value) || 1;
  const obj = parseInt($('vozRepsObj').value, 10);
  if (obj && obj > 0) voz.totalReps = obj;
}

function iniciarSerieVoz() {
  leerAjustesVoz();
  $('vozRepTotal').textContent = voz.totalReps * (voz.unilateral ? 2 : 1);
  const parsed = Object.assign({}, voz.parsed, { totalReps: voz.totalReps, slowReps: Math.min(voz.parsed.slowReps, voz.totalReps) });
  // Si el usuario cambió el objetivo, las lentas no pueden pasar del total.
  parsed.normalReps = Math.max(0, voz.totalReps - parsed.slowReps);
  const built = construirFasesSerie(parsed, voz.unilateral, voz.multTempo);
  voz.fases = built.fases;
  voz.faseIdx = 0; voz.repsCompletados = 0;
  voz.estado = 'prep';
  voz.finFase = Date.now() + voz.prepSeg * 1000;
  $('vozFase').textContent = 'Prepárate';
  $('vozRepNum').textContent = '0';
  $('vozIniciar').disabled = true;
  hablar('Prepárate');
  arrancarVozTick();
}

function arrancarVozTick() {
  detenerVozTick();
  voz.timer = setInterval(tickVoz, 100);
}
function detenerVozTick() { if (voz.timer) { clearInterval(voz.timer); voz.timer = null; } }

function tickVoz() {
  if (!voz.abierto) return;
  const ahora = Date.now();
  if (voz.estado === 'prep') {
    const rest = Math.max(0, Math.ceil((voz.finFase - ahora) / 1000));
    $('vozSeg').textContent = rest;
    $('vozBarra').style.width = '0%';
    if (ahora >= voz.finFase) {
      voz.estado = 'serie';
      voz.finFase = ahora + (voz.fases[0] ? voz.fases[0].secs * 1000 : 0);
      decirFaseActual();
    }
    return;
  }
  if (voz.estado === 'serie') {
    const f = voz.fases[voz.faseIdx];
    if (!f) { finSerieVoz(); return; }
    const rest = Math.max(0, (voz.finFase - ahora) / 1000);
    $('vozSeg').textContent = rest >= 10 ? Math.round(rest) : rest.toFixed(1);
    $('vozBarra').style.width = Math.round(voz.faseIdx / voz.fases.length * 100) + '%';
    if (ahora >= voz.finFase) {
      // ¿se completó una rep? (última fase de esa rep)
      const siguiente = voz.fases[voz.faseIdx + 1];
      if (!siguiente || siguiente.rep !== f.rep || siguiente.lado !== f.lado) {
        // Reps completadas por lado (así se guardan en la sesión).
        if (!f.pausa) voz.repsCompletados = f.rep;
      }
      voz.faseIdx++;
      if (voz.faseIdx >= voz.fases.length) { finSerieVoz(); return; }
      const nf = voz.fases[voz.faseIdx];
      voz.finFase = ahora + nf.secs * 1000;
      decirFaseActual();
    }
    return;
  }
  if (voz.estado === 'descanso') {
    const rest = Math.max(0, Math.ceil((voz.finFase - ahora) / 1000));
    $('vozSeg').textContent = rest;
    $('vozFase').textContent = 'Descanso · siguiente serie en ' + rest + ' s';
    if (rest === 7 && !voz.aviso7) { voz.aviso7 = true; hablar('7 segundos para la siguiente serie'); }
    if (ahora >= voz.finFase) {
      voz.serieIdx++;
      if (voz.serieIdx < voz.rutina.series) {
        voz.fila = filaActiva(voz.ejercicio, voz.serieIdx);
        actualizarInfoSerieVoz();
        $('vozIniciar').disabled = false;
        $('vozIniciar').textContent = 'Empezar serie ' + (voz.serieIdx + 1);
        $('vozFase').textContent = 'Descanso terminado';
        voz.estado = 'idle';
        detenerVozTick();
        hablar('Siguiente serie');
      } else {
        $('vozFase').textContent = 'Ejercicio completado';
        $('vozIniciar').disabled = false;
        $('vozIniciar').textContent = 'Repetir serie';
        voz.estado = 'idle';
        detenerVozTick();
      }
    }
  }
}

function decirFaseActual() {
  const f = voz.fases[voz.faseIdx];
  if (!f) return;
  $('vozFase').textContent = f.say;
  // Número grande: repetición en curso (acumulada por lado en unilateral).
  if (!f.pausa) {
    $('vozRepNum').textContent = (f.lado - 1) * voz.totalReps + f.rep;
  }
  hablar(f.say);
}

function finSerieVoz() {
  detenerVozTick();
  marcarSerieVoz(voz.totalReps);
  $('vozBarra').style.width = '100%';
  $('vozRepNum').textContent = voz.totalReps * (voz.unilateral ? 2 : 1);
  const quedan = voz.rutina.series - (voz.serieIdx + 1);
  if (quedan > 0) {
    voz.estado = 'descanso';
    voz.aviso7 = false;
    voz.finFase = Date.now() + voz.descansoSeg * 1000;
    $('vozFase').textContent = 'Serie completada · Descanso';
    hablar('Serie completada. Descansa.');
    arrancarVozTick();
  } else {
    voz.estado = 'idle';
    $('vozFase').textContent = 'Ejercicio completado';
    $('vozIniciar').disabled = false;
    $('vozIniciar').textContent = 'Repetir serie';
    hablar('Ejercicio completado');
  }
}

function marcarSerieVoz(reps) {
  if (!voz.fila) return;
  voz.fila.hecha = true;
  voz.fila.reps = reps;
  guardarEstado();
  renderSesion();
}

function terminarSerieAqui() {
  detenerVozTick();
  const reps = voz.repsCompletados || 0;
  marcarSerieVoz(reps);
  $('vozFase').textContent = 'Serie terminada con ' + reps + ' reps';
  $('vozIniciar').disabled = false;
  $('vozIniciar').textContent = 'Repetir serie';
  voz.estado = 'idle';
  hablar('Serie terminada');
}

function pausarVoz() {
  if (voz.estado === 'pausa') {
    // Reanudar
    voz.estado = voz.estadoPrevio || 'serie';
    voz.finFase = Date.now() + voz.restanteMs;
    $('vozPausa').textContent = 'Pausar';
    arrancarVozTick();
    return;
  }
  if (voz.estado === 'serie' || voz.estado === 'prep' || voz.estado === 'descanso') {
    voz.estadoPrevio = voz.estado;
    voz.restanteMs = Math.max(0, voz.finFase - Date.now());
    voz.estado = 'pausa';
    detenerVozTick();
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) {}
    $('vozPausa').textContent = 'Seguir';
    $('vozFase').textContent = 'En pausa';
  }
}

/* ================= PROGRESO ================= */
function renderProgreso() {
  const sel = $('selEjercicio');
  if (!sel.options.length || sel.options.length !== state.rutinas.length) {
    const dias = {};
    for (const r of state.rutinas) (dias[r.dia] = dias[r.dia] || []).push(r);
    sel.innerHTML = Object.keys(dias).map(d =>
      '<optgroup label="' + esc(d) + '">' +
      dias[d].map(r => '<option value="' + esc(r.nombre) + '">' + esc(r.nombre) + '</option>').join('') +
      '</optgroup>').join('');
    if (!state.ejercicioProgreso) state.ejercicioProgreso = state.rutinas[0].nombre;
    sel.value = state.ejercicioProgreso;
    sel.onchange = () => { state.ejercicioProgreso = sel.value; renderProgreso(); };
  }
  sel.value = state.ejercicioProgreso || state.rutinas[0].nombre;
  const nombre = sel.value;
  const r = state.rutinas.find(x => x.nombre === nombre);
  const datos = progresoDe(nombre, state.sesiones, state.series);
  const stats = $('progresoStats'), graf = $('progresoGrafica'), tabla = $('progresoTabla');
  if (!datos.length) {
    stats.innerHTML = '';
    graf.innerHTML = '<p class="mini">Sin datos: marca series como hechas (✓) en tus sesiones para ver el progreso de este ejercicio.</p>';
    tabla.innerHTML = '';
    return;
  }
  const maxPeso = Math.max(...datos.map(d => d.pesoMax));
  const ult = datos[datos.length - 1];
  const volTotal = datos.reduce((a, d) => a + d.volumen, 0);
  stats.innerHTML =
    '<div><b>' + fmtPeso(maxPeso, r.unidad) + '</b><span>Peso máximo</span></div>' +
    '<div><b>' + fmtPeso(ult.pesoMax, r.unidad) + '</b><span>Última sesión</span></div>' +
    '<div><b>' + datos.length + '</b><span>Sesiones con datos</span></div>' +
    '<div><b>' + volTotal.toLocaleString('es-MX') + '</b><span>Volumen acumulado</span></div>';
  graf.innerHTML = svgProgreso(datos, r.unidad);
  tabla.innerHTML = '<table><tr><th>Fecha</th><th class="num">Peso máx.</th><th class="num">Volumen</th></tr>' +
    datos.map(d => '<tr><td>' + fmtFecha(d.fecha) + '</td><td class="num">' + fmtPeso(d.pesoMax, r.unidad) +
      '</td><td class="num">' + d.volumen.toLocaleString('es-MX') + '</td></tr>').join('') + '</table>';
}

function svgProgreso(datos, unidad) {
  const W = 720, H = 260, padL = 46, padR = 12, padT = 14, padB = 28;
  const maxVol = Math.max(...datos.map(d => d.volumen), 1);
  const maxPeso = Math.max(...datos.map(d => d.pesoMax), 1);
  const minPeso = Math.min(...datos.map(d => d.pesoMax));
  const rangoPeso = Math.max(1, maxPeso - minPeso);
  const n = datos.length;
  const x = i => padL + (n === 1 ? (W - padL - padR) / 2 : i * (W - padL - padR) / (n - 1));
  const yVol = v => H - padB - (v / maxVol) * (H - padT - padB) * 0.85;
  const yPeso = p => H - padB - ((p - minPeso) / rangoPeso) * (H - padT - padB) * 0.85 - 6;
  let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfica de progreso">';
  // Barras de volumen
  const bw = Math.min(34, (W - padL - padR) / Math.max(1, n) * 0.55);
  datos.forEach((d, i) => {
    s += '<rect x="' + (x(i) - bw / 2).toFixed(1) + '" y="' + yVol(d.volumen).toFixed(1) +
      '" width="' + bw.toFixed(1) + '" height="' + (H - padB - yVol(d.volumen)).toFixed(1) +
      '" fill="#d8c27a" rx="3"><title>' + fmtFecha(d.fecha) + ' · Volumen ' + d.volumen.toLocaleString('es-MX') + '</title></rect>';
  });
  // Línea de peso máximo
  const pts = datos.map((d, i) => x(i).toFixed(1) + ',' + yPeso(d.pesoMax).toFixed(1)).join(' ');
  s += '<polyline points="' + pts + '" fill="none" stroke="#0e1824" stroke-width="2.5" stroke-linejoin="round"/>';
  datos.forEach((d, i) => {
    s += '<circle cx="' + x(i).toFixed(1) + '" cy="' + yPeso(d.pesoMax).toFixed(1) + '" r="4.5" fill="#b4943e" stroke="#fff" stroke-width="1.5">' +
      '<title>' + fmtFecha(d.fecha) + ' · ' + fmtPeso(d.pesoMax, unidad) + '</title></circle>';
    s += '<text x="' + x(i).toFixed(1) + '" y="' + (yPeso(d.pesoMax) - 10).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#0e1824">' + d.pesoMax + '</text>';
    s += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="#667085">' + d.fecha.slice(5) + '</text>';
  });
  s += '<text x="6" y="20" font-size="11" fill="#667085">Peso máx (' + unidad + ')</text>';
  s += '<text x="6" y="34" font-size="11" fill="#b4943e">■ Volumen</text>';
  s += '</svg>';
  return s;
}

/* ================= HISTORIAL ================= */
function renderHistorial() {
  const lista = state.sesiones.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  if (!lista.length) {
    $('listaHistorial').innerHTML = '<p class="mini">Aún no hay sesiones. Termina tu primera rutina para verla aquí, o importa un respaldo en Config.</p>';
    $('detalleSesion').classList.add('hide');
    return;
  }
  $('listaHistorial').innerHTML = lista.map(s =>
    '<div class="hist-item" data-sid="' + s.id + '">' +
    '<div class="f">' + fmtFecha(s.fecha) + ' · ' + esc(s.rutina) + '</div>' +
    '<div class="mini">' + s.seriesHechas + '/' + s.seriesTotales + ' series · Volumen ' +
    (s.volumen || 0).toLocaleString('es-MX') + (s.duracionSeg ? ' · ' + fmtTiempo(s.duracionSeg) : '') + '</div>' +
    '</div>').join('');
  $('listaHistorial').querySelectorAll('.hist-item').forEach(el => {
    el.addEventListener('click', () => mostrarDetalleSesion(+el.dataset.sid));
  });
  if (state.sesionDetalle != null) mostrarDetalleSesion(state.sesionDetalle);
}

function mostrarDetalleSesion(id) {
  state.sesionDetalle = id;
  const s = state.sesiones.find(x => x.id === id);
  const det = $('detalleSesion');
  if (!s) { det.classList.add('hide'); return; }
  const filas = state.series.filter(r => r.sesionId === id);
  const porEj = {};
  for (const f of filas) (porEj[f.ejercicio] = porEj[f.ejercicio] || []).push(f);
  let html = '<h2>' + fmtFecha(s.fecha) + ' · ' + esc(s.rutina) + '</h2>' +
    '<p class="mini">' + s.seriesHechas + '/' + s.seriesTotales + ' series · Volumen ' +
    (s.volumen || 0).toLocaleString('es-MX') + (s.duracionSeg ? ' · Duración ' + fmtTiempo(s.duracionSeg) : '') + '</p>';
  if (s.recomendaciones) {
    const recGeneral = typeof s.recomendaciones === 'string'
      ? s.recomendaciones
      : (s.recomendaciones.general || '');
    html += '<p>' + esc(recGeneral) + '</p>';
    if (s.recomendaciones.porEjercicio) {
      html += '<ul>' + s.recomendaciones.porEjercicio.map(p =>
        '<li><b>' + esc(p.nombre) + ':</b> ' + esc(p.texto) + '</li>').join('') + '</ul>';
    }
  }
  if (s.notaProxima) html += '<p><b>Nota:</b> ' + esc(s.notaProxima) + '</p>';
  html += '<table><tr><th>Ejercicio</th><th class="num">Serie</th><th class="num">Peso</th><th class="num">Reps</th><th>Hecha</th></tr>';
  for (const ej of Object.keys(porEj)) {
    for (const f of porEj[ej]) {
      html += '<tr><td>' + esc(ej) + '</td><td class="num">' + f.serie + '</td><td class="num">' +
        (f.peso == null ? '—' : f.peso + ' ' + f.unidad) + '</td><td class="num">' +
        (f.reps == null ? '—' : f.reps) + '</td><td>' + (f.hecha ? '✓' : '—') + '</td></tr>';
    }
  }
  html += '</table><div class="btnrow"><button class="btn danger" id="btnBorrarSesion">Borrar esta sesión</button></div>';
  det.innerHTML = html;
  det.classList.remove('hide');
  $('btnBorrarSesion').addEventListener('click', () => {
    if (!confirm('¿Borrar la sesión del ' + fmtFecha(s.fecha) + ' con sus ' + filas.length + ' series?')) return;
    state.sesiones = state.sesiones.filter(x => x.id !== id);
    state.series = state.series.filter(r => r.sesionId !== id);
    state.sesionDetalle = null;
    guardarEstado(); renderTop(); renderHistorial();
  });
}

/* ================= RUTINAS ================= */
function renderRutinas() {
  const sel = $('selDiaRutina');
  if (!sel.options.length) {
    sel.innerHTML = DIAS.map(d => '<option value="' + d.dia + '">' + d.dia + ' · ' + d.rutina + '</option>').join('');
    sel.value = state.diaActual;
    sel.addEventListener('change', () => renderRutinas());
  }
  const dia = sel.value;
  const lista = rutinasDe(dia);
  let html = '', seccion = '';
  for (const r of lista) {
    if (r.seccion !== seccion) { seccion = r.seccion; html += '<div class="seccion">' + esc(seccion) + '</div>'; }
    const refTxt = (r.pesos || []).map(p => p == null ? '—' : p).join(' / ');
    html += '<div class="ej-card"><div class="ej-head"><span class="ej-nombre">' + esc(r.nombre) + '</span>' +
      '<span><button class="btn small" data-editar="' + r.id + '">Editar</button> ' +
      '<button class="btn small danger" data-borrar="' + r.id + '">Borrar</button></span></div>' +
      '<div class="ej-esquema">' + esc(r.esquema) + ' · ' + r.series + ' series · Ref: ' + esc(refTxt) + ' ' + r.unidad + '</div></div>';
  }
  $('listaRutinas').innerHTML = html;
  $('listaRutinas').querySelectorAll('[data-editar]').forEach(b => {
    b.addEventListener('click', () => abrirFormEjercicio(b.dataset.editar));
  });
  $('listaRutinas').querySelectorAll('[data-borrar]').forEach(b => {
    b.addEventListener('click', () => {
      const r = rutinaPorId(b.dataset.borrar);
      if (!r || !confirm('¿Borrar "' + r.nombre + '" de la rutina?')) return;
      state.rutinas = state.rutinas.filter(x => x.id !== r.id);
      guardarRutinas(); renderRutinas();
    });
  });
}

function abrirFormEjercicio(id) {
  const dia = $('selDiaRutina').value;
  const form = $('formEjercicio');
  state.editandoEj = id || null;
  if (id) {
    const r = rutinaPorId(id);
    $('formEjercicioTitulo').textContent = 'Editar ejercicio';
    $('fNombre').value = r.nombre; $('fSeccion').value = r.seccion;
    $('fSeries').value = r.series; $('fEsquema').value = r.esquema;
    $('fPesos').value = (r.pesos || []).map(p => p == null ? '' : p).join(', ');
    $('fUnidad').value = r.unidad;
  } else {
    $('formEjercicioTitulo').textContent = 'Agregar ejercicio';
    $('fNombre').value = ''; $('fSeccion').value = '';
    $('fSeries').value = 3; $('fEsquema').value = '';
    $('fPesos').value = ''; $('fUnidad').value = 'kg';
  }
  form.classList.remove('hide');
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function guardarFormEjercicio() {
  const dia = $('selDiaRutina').value;
  const nombre = $('fNombre').value.trim();
  if (!nombre) { alert('Escribe el nombre del ejercicio.'); return; }
  const nSeries = Math.max(1, parseInt($('fSeries').value, 10) || 3);
  const pesos = $('fPesos').value.split(',').map(p => {
    const t = p.trim();
    return t === '' ? null : parseFloat(t);
  });
  while (pesos.length < nSeries) pesos.push(null);
  const datos = {
    dia, rutina: DIAS.find(d => d.dia === dia).rutina,
    seccion: ($('fSeccion').value.trim() || 'GENERAL').toUpperCase(),
    nombre, series: nSeries, esquema: $('fEsquema').value.trim(),
    pesos: pesos.slice(0, nSeries), unidad: $('fUnidad').value,
  };
  if (state.editandoEj) {
    const r = rutinaPorId(state.editandoEj);
    Object.assign(r, datos);
  } else {
    datos.id = 'custom-' + Date.now();
    state.rutinas.push(datos);
  }
  guardarRutinas();
  $('formEjercicio').classList.add('hide');
  state.editandoEj = null;
  renderRutinas();
}

/* ================= CONFIG ================= */
function renderConfig() {
  const bytes = JSON.stringify(state).length;
  $('infoAlmacen').textContent = 'Guardado en este navegador: ' + state.sesiones.length + ' sesiones, ' +
    state.series.length + ' series, ' + Object.keys(state.notas).filter(k => state.notas[k]).length +
    ' notas · aprox. ' + (bytes / 1024).toFixed(0) + ' KB.';
  $('cfgDescanso').value = state.config.descanso;
  $('cfgPrep').value = String(state.config.prep);
}

function descargar(nombre, contenido, tipo) {
  const blob = new Blob([contenido], { type: tipo || 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

function exportarRespaldo() {
  const data = {
    app: 'registro-gimnasio', version: 1, exportedAt: new Date().toISOString(),
    sesiones: state.sesiones, series: state.series, notas: state.notas,
  };
  descargar('respaldo-gimnasio.json', JSON.stringify(data, null, 2));
}

function csvCell(v) {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r\n]/.test(s)) s = "'" + s;
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function exportarCSV() {
  const lineas = [];
  lineas.push('SESIONES');
  lineas.push(['id', 'fecha', 'dia', 'rutina', 'terminada', 'volumen', 'seriesHechas', 'seriesTotales', 'duracionSeg'].map(csvCell).join(','));
  for (const s of state.sesiones) {
    lineas.push([s.id, s.fecha, s.dia, s.rutina, s.terminada ? 'Sí' : 'No', s.volumen, s.seriesHechas, s.seriesTotales, s.duracionSeg || ''].map(csvCell).join(','));
  }
  lineas.push('');
  lineas.push('SERIES');
  lineas.push(['sesionId', 'fecha', 'dia', 'rutina', 'seccion', 'ejercicio', 'serie', 'peso', 'reps', 'hecha', 'unidad'].map(csvCell).join(','));
  for (const r of state.series) {
    lineas.push([r.sesionId, r.fecha, r.dia, r.rutina, r.seccion, r.ejercicio, r.serie, r.peso == null ? '' : r.peso, r.reps == null ? '' : r.reps, r.hecha ? 'Sí' : 'No', r.unidad].map(csvCell).join(','));
  }
  descargar('registro-gimnasio.csv', '\uFEFF' + lineas.join('\r\n'), 'text/csv;charset=utf-8');
}

function importarRespaldo(archivo) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.app !== 'registro-gimnasio' || !Array.isArray(data.sesiones) || !Array.isArray(data.series)) {
        alert('Ese archivo no es un respaldo válido de Registro de gimnasio.');
        return;
      }
      if (!confirm('Importar ' + data.sesiones.length + ' sesiones y ' + data.series.length + ' series? Esto reemplaza los datos actuales.')) return;
      // Normalizar a la forma interna: id numérico, terminada booleana,
      // recomendaciones como {general, porEjercicio} (el respaldo trae el
      // texto de la IA como string) y series con sesionId y hecha booleana.
      state.sesiones = data.sesiones.map(s => ({
        ...s,
        id: s.id != null ? s.id : s.sesionId,
        terminada: s.terminada === true || s.terminada === 'Sí',
        recomendaciones: typeof s.recomendaciones === 'string'
          ? { general: s.recomendaciones, porEjercicio: [] }
          : (s.recomendaciones || null),
      }));
      state.series = data.series.map(f => ({
        ...f,
        hecha: f.hecha === true || f.hecha === 'Sí',
      }));
      state.notas = data.notas || {};
      state.activa = null;
      guardarEstado();
      renderTop(); renderEntrenar(); renderHistorial();
      alert('Respaldo importado: ' + data.sesiones.length + ' sesiones, ' + data.series.length + ' series.');
    } catch (e) {
      alert('No se pudo leer el archivo: ' + e.message);
    }
  };
  reader.readAsText(archivo);
}

/* ================= INICIO ================= */
if (isBrowser) {
  document.addEventListener('DOMContentLoaded', () => {
    cargarEstado();
    const hoy = diaDeHoy();
    state.diaActual = DIAS.some(d => d.dia === hoy) ? hoy : 'Lunes';
    renderTop();
    document.querySelectorAll('.tab').forEach(b => {
      b.addEventListener('click', () => cambiarTab(b.dataset.tab));
    });
    $('btnIniciar').addEventListener('click', iniciarSesion);
    $('btnTerminar').addEventListener('click', terminarRutina);
    $('btnGuardarCierre').addEventListener('click', guardarCierre);
    $('btnCancelarSesion').addEventListener('click', () => {
      if (!confirm('¿Cancelar esta sesión sin guardar?')) return;
      detenerLive();
      state.activa = null;
      guardarEstado();
      renderEntrenar();
    });
    $('btnAgregarEjercicio').addEventListener('click', () => abrirFormEjercicio(null));
    $('btnGuardarEjercicio').addEventListener('click', guardarFormEjercicio);
    $('btnCancelarEjercicio').addEventListener('click', () => {
      $('formEjercicio').classList.add('hide'); state.editandoEj = null;
    });
    $('btnRestablecerRutinas').addEventListener('click', () => {
      if (!confirm('¿Restablecer las 54 rutinas originales? Se pierden los ejercicios agregados o editados.')) return;
      lsDel(LS.rutinas);
      state.rutinas = JSON.parse(JSON.stringify(ROUTINES));
      renderRutinas();
    });
    $('btnExportar').addEventListener('click', exportarRespaldo);
    $('btnExportarCSV').addEventListener('click', exportarCSV);
    $('inputImportar').addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) importarRespaldo(e.target.files[0]);
      e.target.value = '';
    });
    $('cfgDescanso').addEventListener('change', e => {
      state.config.descanso = Math.min(120, Math.max(30, parseInt(e.target.value, 10) || 60));
      guardarEstado();
    });
    $('cfgPrep').addEventListener('change', e => {
      state.config.prep = parseInt(e.target.value, 10) || 3;
      guardarEstado();
    });
    $('btnBorrarTodo').addEventListener('click', () => {
      if (!confirm('¿Borrar TODAS las sesiones, series y notas? Las rutinas se quedan.')) return;
      if (!confirm('¿Seguro? Esta acción no se puede deshacer. Exporta un respaldo primero si quieres conservar los datos.')) return;
      state.sesiones = []; state.series = []; state.notas = {}; state.activa = null;
      guardarEstado();
      renderTop(); renderEntrenar(); renderHistorial();
    });
    // Contador de voz
    $('vozCerrar').addEventListener('click', cerrarVoz);
    $('vozIniciar').addEventListener('click', iniciarSerieVoz);
    $('vozPausa').addEventListener('click', pausarVoz);
    $('vozTerminar').addEventListener('click', terminarSerieAqui);
    $('vozProbar').addEventListener('click', () => hablar('1. Baja lento. Sube. Aguanta.'));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && voz.abierto && voz.estado !== 'idle' && voz.estado !== 'pausa') pedirWakeLock();
    });
    // Service worker (PWA offline)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    renderEntrenar();
  });
}
