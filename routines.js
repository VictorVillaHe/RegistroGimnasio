// Rutinas de Victor (29 junio 2025) — 54 ejercicios.
// Pesos exactamente como están escritos; kg y lb distintos, nunca convertir.
// Regla confirmada: un solo peso anotado vale para todas las series (martes y viernes).
// Generado a partir de la exportación real del registro.
const ROUTINES = [
  {
    "id": "lun-01",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Press con mancuernas, sentado en banco con respaldo",
    "series": 3,
    "esquema": "3 series de 6 rep con 3 seg abajo por rep, más 6 rep normales",
    "pesos": [
      50,
      50,
      50
    ],
    "unidad": "lb"
  },
  {
    "id": "lun-02",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Elevación frontal con disco",
    "series": 3,
    "esquema": "3 series de 10 rep con 2 seg arriba por rep, más 10 rep normales (biserie)",
    "pesos": [
      15,
      15,
      15
    ],
    "unidad": "kg"
  },
  {
    "id": "lun-03",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Elevación frontal en polea con barrita Z, agarre supinación",
    "series": 2,
    "esquema": "2 series de 15 rep con 2 seg arriba por rep",
    "pesos": [
      27,
      23
    ],
    "unidad": "kg"
  },
  {
    "id": "lun-04",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Pájaros con mancuernas",
    "series": 3,
    "esquema": "3 series de 10 rep con 2 seg arriba por rep, más 10 rep normales",
    "pesos": [
      20,
      20,
      null
    ],
    "unidad": "lb"
  },
  {
    "id": "lun-05",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Pull face con soga",
    "series": 3,
    "esquema": "3 series de 10 rep con 2 seg atrás por rep, más 10 rep normales (biserie)",
    "pesos": [
      57,
      57,
      52.5
    ],
    "unidad": "kg"
  },
  {
    "id": "lun-06",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Posteriores con cables en polea baja (agarre cruzado)",
    "series": 2,
    "esquema": "2 series de 20 rep",
    "pesos": [
      7.5,
      7.5
    ],
    "unidad": "kg"
  },
  {
    "id": "lun-07",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Elevaciones laterales con mancuernas",
    "series": 3,
    "esquema": "3 series de 10 rep con 2 seg arriba por rep, más 10 rep normales",
    "pesos": [
      20,
      20,
      20
    ],
    "unidad": "lb"
  },
  {
    "id": "lun-08",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Encogimientos de hombros con mancuernas, en banco inclinado, ponerse boca abajo",
    "series": 3,
    "esquema": "3 series de 20 rep con 2 seg arriba por rep (biserie)",
    "pesos": [
      45,
      45,
      45
    ],
    "unidad": "lb"
  },
  {
    "id": "lun-09",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Elevaciones laterales en máquina",
    "series": 3,
    "esquema": "3 series de 10 rep con 2 seg arriba por rep, más 10 rep normales",
    "pesos": [
      60,
      60,
      60
    ],
    "unidad": "lb"
  },
  {
    "id": "lun-10",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Encogimientos de hombros con barrita recta en polea",
    "series": 3,
    "esquema": "3 series de 20 rep con 2 seg arriba por rep (biserie)",
    "pesos": [
      92.5,
      92.5,
      92.5
    ],
    "unidad": "kg"
  },
  {
    "id": "lun-11",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "HOMBRO",
    "nombre": "Elevación individual lateral en polea",
    "series": 4,
    "esquema": "2 series de 10-12 rep con 2 seg arriba por rep",
    "pesos": [
      7.5,
      7.5,
      null,
      null
    ],
    "unidad": "kg"
  },
  {
    "id": "lun-12",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "PANTORRILLA",
    "nombre": "Silla costurera",
    "series": 3,
    "esquema": "3 series de 10 rep con 4 seg arriba por rep, más 10 rep normales",
    "pesos": [
      30,
      30,
      30
    ],
    "unidad": "kg"
  },
  {
    "id": "lun-13",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "PANTORRILLA",
    "nombre": "Press en prensa 45°",
    "series": 3,
    "esquema": "3 series de 10 rep con 4 seg arriba por rep, más 10 rep normales",
    "pesos": [
      190,
      190,
      190
    ],
    "unidad": "kg"
  },
  {
    "id": "lun-14",
    "dia": "Lunes",
    "rutina": "Hombro y pantorrilla",
    "seccion": "PANTORRILLA",
    "nombre": "Elevación de talones en máquina o barra smith",
    "series": 3,
    "esquema": "3 series de 10 rep con 4 seg arriba por rep, más 10 rep normales",
    "pesos": [
      175,
      175,
      175
    ],
    "unidad": "kg"
  },
  {
    "id": "mar-15",
    "dia": "Martes",
    "rutina": "Pierna",
    "seccion": "PIERNA",
    "nombre": "Aductor en máquina",
    "series": 3,
    "esquema": "3 series de 15 rep (cierra en 1 seg y regresa en 3 seg por rep)",
    "pesos": [
      160,
      160,
      160
    ],
    "unidad": "kg"
  },
  {
    "id": "mar-16",
    "dia": "Martes",
    "rutina": "Pierna",
    "seccion": "PIERNA",
    "nombre": "Curl femoral sentado",
    "series": 3,
    "esquema": "3 series de 15-20 rep (baja en 1 seg y regresa en 3 seg por rep) (biserie)",
    "pesos": [
      130,
      130,
      130
    ],
    "unidad": "kg"
  },
  {
    "id": "mar-17",
    "dia": "Martes",
    "rutina": "Pierna",
    "seccion": "PIERNA",
    "nombre": "Curl femoral acostado",
    "series": 3,
    "esquema": "3 series de 15 rep (sube en 1 seg y baja en 3 seg por rep)",
    "pesos": [
      13,
      13,
      13
    ],
    "unidad": "kg"
  },
  {
    "id": "mar-18",
    "dia": "Martes",
    "rutina": "Pierna",
    "seccion": "PIERNA",
    "nombre": "Curl femoral individual (de pie)",
    "series": 3,
    "esquema": "3 series de 10-12 rep (sube en 1 seg y baja en 3 seg por rep)",
    "pesos": [
      40,
      40,
      40
    ],
    "unidad": "kg"
  },
  {
    "id": "mar-19",
    "dia": "Martes",
    "rutina": "Pierna",
    "seccion": "PIERNA",
    "nombre": "Prensa 45°",
    "series": 3,
    "esquema": "3 series de 15 rep (baja en 4 seg y sube en 1 seg por rep)",
    "pesos": [
      370,
      370,
      370
    ],
    "unidad": "kg"
  },
  {
    "id": "mar-20",
    "dia": "Martes",
    "rutina": "Pierna",
    "seccion": "PIERNA",
    "nombre": "Sentadilla en barra smith, pies alineados a las caderas y puntas rectas",
    "series": 3,
    "esquema": "3 series de 12 rep con 2 seg abajo por rep",
    "pesos": [
      40,
      40,
      40
    ],
    "unidad": "kg"
  },
  {
    "id": "mar-21",
    "dia": "Martes",
    "rutina": "Pierna",
    "seccion": "PIERNA",
    "nombre": "Prensa horizontal, pies alineados a las caderas y puntas rectas",
    "series": 3,
    "esquema": "3 series de 12-15 rep (baja en 3 seg y sube en 1 seg por rep)",
    "pesos": [
      235,
      235,
      235
    ],
    "unidad": "kg"
  },
  {
    "id": "mar-22",
    "dia": "Martes",
    "rutina": "Pierna",
    "seccion": "PIERNA",
    "nombre": "Extensiones",
    "series": 3,
    "esquema": "6 rep con peso alto, quitas la mitad del peso y sacas 10 rep. 3 series",
    "pesos": [
      130,
      130,
      130
    ],
    "unidad": "kg"
  },
  {
    "id": "mié-23",
    "dia": "Miércoles",
    "rutina": "Tríceps y pecho",
    "seccion": "TRÍCEPS",
    "nombre": "Copa a dos manos con mancuerna",
    "series": 3,
    "esquema": "3 series de 6 rep con 3 seg arriba por rep, más 6 rep normales",
    "pesos": [
      60,
      65,
      65
    ],
    "unidad": "lb"
  },
  {
    "id": "mié-24",
    "dia": "Miércoles",
    "rutina": "Tríceps y pecho",
    "seccion": "TRÍCEPS",
    "nombre": "Extensión en polea con barrita",
    "series": 3,
    "esquema": "3 series de 6 rep con 3 seg abajo por rep, más 6-10 rep normales (biserie)",
    "pesos": [
      52,
      52,
      42
    ],
    "unidad": "kg"
  },
  {
    "id": "mié-25",
    "dia": "Miércoles",
    "rutina": "Tríceps y pecho",
    "seccion": "TRÍCEPS",
    "nombre": "Extensión en polea con soga, tras la cabeza",
    "series": 3,
    "esquema": "3 series de 6 rep con 3 seg arriba por rep, más 6-10 rep normales",
    "pesos": [
      42,
      42,
      37
    ],
    "unidad": "kg"
  },
  {
    "id": "mié-26",
    "dia": "Miércoles",
    "rutina": "Tríceps y pecho",
    "seccion": "TRÍCEPS",
    "nombre": "Patada individual en polea (polea a nivel de tu cintura)",
    "series": 3,
    "esquema": "3 series de 10-12 rep con 2 seg atrás por rep",
    "pesos": [
      9,
      9,
      9
    ],
    "unidad": "kg"
  },
  {
    "id": "mié-27",
    "dia": "Miércoles",
    "rutina": "Tríceps y pecho",
    "seccion": "PECHO",
    "nombre": "Press en banco horizontal con barra",
    "series": 3,
    "esquema": "3 series de 10-12 rep (baja en 3 seg, te quedas abajo 2 seg y sube en 1 seg por rep)",
    "pesos": [
      20,
      20,
      20
    ],
    "unidad": "kg"
  },
  {
    "id": "mié-28",
    "dia": "Miércoles",
    "rutina": "Tríceps y pecho",
    "seccion": "PECHO",
    "nombre": "Press con mancuernas en banco inclinado, agarre neutro",
    "series": 3,
    "esquema": "3 series de 10-12 rep (baja en 3 seg, te quedas abajo 2 seg y sube en 1 seg por rep)",
    "pesos": [
      40,
      40,
      40
    ],
    "unidad": "lb"
  },
  {
    "id": "mié-29",
    "dia": "Miércoles",
    "rutina": "Tríceps y pecho",
    "seccion": "PECHO",
    "nombre": "Press en máquina hammer recta (la de peso con discos)",
    "series": 3,
    "esquema": "3 series de 10-12 rep (empuja en 1 seg, te quedas en isometría 2 seg (al frente) y regresas en 4 seg por rep)",
    "pesos": [
      10,
      10,
      10
    ],
    "unidad": "kg"
  },
  {
    "id": "mié-30",
    "dia": "Miércoles",
    "rutina": "Tríceps y pecho",
    "seccion": "PECHO",
    "nombre": "Press en máquina inclinada (la de peso integrado, peso con placas*), agarre neutro",
    "series": 3,
    "esquema": "3 series de 10-12 rep (sube en 1 seg, te quedas arriba 2 seg y bajas en 4 seg por rep)",
    "pesos": [
      90,
      100,
      100
    ],
    "unidad": "kg"
  },
  {
    "id": "mié-31",
    "dia": "Miércoles",
    "rutina": "Tríceps y pecho",
    "seccion": "PECHO",
    "nombre": "Peck deck",
    "series": 3,
    "esquema": "3 series de 10-12 rep (cierra en 1 seg, te quedas en isometría 2 seg (al frente) y regresas en 3 seg por rep)",
    "pesos": [
      75,
      75,
      75
    ],
    "unidad": "kg"
  },
  {
    "id": "mié-32",
    "dia": "Miércoles",
    "rutina": "Tríceps y pecho",
    "seccion": "PECHO",
    "nombre": "Cross over en poleas (poner las poleas a nivel de la cabeza), agarre pronación",
    "series": 3,
    "esquema": "3 series de 12-15 rep con 2 seg en isometría (al frente)",
    "pesos": [
      35,
      35,
      35
    ],
    "unidad": "kg"
  },
  {
    "id": "jue-33",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "BÍCEPS",
    "nombre": "Curl con barra recta",
    "series": 3,
    "esquema": "3 series de 12-15 rep con 2 seg arriba por rep",
    "pesos": [
      35,
      40,
      40
    ],
    "unidad": "kg"
  },
  {
    "id": "jue-34",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "BÍCEPS",
    "nombre": "Curl martillos con mancuernas (sentado)",
    "series": 3,
    "esquema": "3 series de 12-15 rep con 2 seg arriba por rep",
    "pesos": [
      25,
      25,
      20
    ],
    "unidad": "lb"
  },
  {
    "id": "jue-35",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "BÍCEPS",
    "nombre": "Curl en polea baja con soga",
    "series": 3,
    "esquema": "3 series de 12-15 rep con 2 seg arriba por rep (biserie)",
    "pesos": [
      42.5,
      42.5,
      42.5
    ],
    "unidad": "kg"
  },
  {
    "id": "jue-36",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "BÍCEPS",
    "nombre": "Predicador en máquina",
    "series": 3,
    "esquema": "6 rep con peso alto, quitas la mitad del peso y sacas 10 rep con 2 seg arriba por rep",
    "pesos": [
      70,
      70,
      70
    ],
    "unidad": "kg"
  },
  {
    "id": "jue-37",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "ESPALDA",
    "nombre": "Remo con barra recta, agarre pronación",
    "series": 3,
    "esquema": "3 series de 10-12 rep (sube en 1 seg y baja en 3 seg por rep)",
    "pesos": [
      80,
      60,
      60
    ],
    "unidad": "kg"
  },
  {
    "id": "jue-38",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "ESPALDA",
    "nombre": "Hiperextensiones (espalda baja)",
    "series": 3,
    "esquema": "3 series de 25-30 rep (biserie)",
    "pesos": [
      null,
      null,
      null
    ],
    "unidad": "kg"
  },
  {
    "id": "jue-39",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "ESPALDA",
    "nombre": "Jalón en polea al pecho con barra, agarre abierto y en pronación",
    "series": 3,
    "esquema": "3 series de 10-12 rep (jala en 1 seg y regresa en 3 seg por rep)",
    "pesos": [
      68,
      55,
      55
    ],
    "unidad": "kg"
  },
  {
    "id": "jue-40",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "ESPALDA",
    "nombre": "Remo sentado con maneral tipo murciélago, agarre supinación",
    "series": 3,
    "esquema": "3 series de 10-12 rep (jala en 1 seg y regresa en 3 seg por rep) (biserie)",
    "pesos": [
      68,
      48,
      48
    ],
    "unidad": "kg"
  },
  {
    "id": "jue-41",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "ESPALDA",
    "nombre": "Remo en máquina T",
    "series": 3,
    "esquema": "3 series de 10-12 rep (sube en 1 seg y baja en 3 seg por rep)",
    "pesos": [
      15,
      15,
      15
    ],
    "unidad": "kg"
  },
  {
    "id": "jue-42",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "ESPALDA",
    "nombre": "Remo en polea baja con triángulo",
    "series": 3,
    "esquema": "3 series de 10-12 rep (jala en 1 seg y regresa en 3 seg por rep) (biserie)",
    "pesos": [
      72,
      72,
      72
    ],
    "unidad": "kg"
  },
  {
    "id": "jue-43",
    "dia": "Jueves",
    "rutina": "Bíceps y espalda",
    "seccion": "ESPALDA",
    "nombre": "Jalón al pecho en máquina articulada, agarre neutro o supinación",
    "series": 3,
    "esquema": "3 series de 10-12 rep (jala en 1 seg y regresa en 3 seg por rep)",
    "pesos": [
      50,
      50,
      50
    ],
    "unidad": "kg"
  },
  {
    "id": "vie-44",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "PANTORRILLA",
    "nombre": "Silla costurera",
    "series": 3,
    "esquema": "3 series de 20 rep (sube en 1 seg y baja en 3 seg por rep)",
    "pesos": [
      35,
      35,
      35
    ],
    "unidad": "kg"
  },
  {
    "id": "vie-45",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "PANTORRILLA",
    "nombre": "Press en prensa 45°",
    "series": 3,
    "esquema": "3 series de 20 rep (sube en 1 seg y baja en 3 seg por rep)",
    "pesos": [
      120,
      120,
      120
    ],
    "unidad": "kg"
  },
  {
    "id": "vie-46",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "PANTORRILLA",
    "nombre": "Elevación de talones en máquina o barra smith",
    "series": 3,
    "esquema": "3 series de 20 rep (sube en 1 seg y baja en 3 seg por rep)",
    "pesos": [
      175,
      175,
      175
    ],
    "unidad": "kg"
  },
  {
    "id": "vie-47",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "GLÚTEO-FEMORAL",
    "nombre": "Sentadilla perfecta en máquina (profunda), pies abiertos y en V",
    "series": 3,
    "esquema": "3 series de 6 rep con 3 seg abajo por rep, más 6-8 rep normales",
    "pesos": [
      100,
      100,
      100
    ],
    "unidad": "kg"
  },
  {
    "id": "vie-48",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "GLÚTEO-FEMORAL",
    "nombre": "Curl femoral sentado",
    "series": 3,
    "esquema": "3 series de 10 rep con 2 seg abajo por rep, más 10 rep normales (biserie)",
    "pesos": [
      70,
      70,
      70
    ],
    "unidad": "kg"
  },
  {
    "id": "vie-49",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "GLÚTEO-FEMORAL",
    "nombre": "Sentadilla sumo con mancuerna",
    "series": 3,
    "esquema": "3 series de 6 rep con 3 seg abajo por rep, más 6-8 rep normales",
    "pesos": [
      50,
      50,
      50
    ],
    "unidad": "lb"
  },
  {
    "id": "vie-50",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "GLÚTEO-FEMORAL",
    "nombre": "Curl femoral acostado",
    "series": 3,
    "esquema": "3 series de 6 rep con 3 seg arriba por rep, más 6-10 rep normales (biserie)",
    "pesos": [
      70,
      70,
      70
    ],
    "unidad": "kg"
  },
  {
    "id": "vie-51",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "GLÚTEO-FEMORAL",
    "nombre": "Desplante con barra o mancuernas",
    "series": 3,
    "esquema": "3 series de 20 zancadas entre las dos piernas",
    "pesos": [
      null,
      null,
      null
    ],
    "unidad": "kg"
  },
  {
    "id": "vie-52",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "GLÚTEO-FEMORAL",
    "nombre": "Prensa vertical",
    "series": 3,
    "esquema": "3 series de 15-20 rep (biserie)",
    "pesos": [
      null,
      null,
      null
    ],
    "unidad": "kg"
  },
  {
    "id": "vie-53",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "GLÚTEO-FEMORAL",
    "nombre": "Patada en máquina",
    "series": 3,
    "esquema": "3 series de 10-12 rep con 2 seg arriba por rep",
    "pesos": [
      null,
      null,
      null
    ],
    "unidad": "kg"
  },
  {
    "id": "vie-54",
    "dia": "Viernes",
    "rutina": "Glúteo y femoral",
    "seccion": "GLÚTEO-FEMORAL",
    "nombre": "Abducción en máquina (la que abres)",
    "series": 3,
    "esquema": "3 series de 15 rep (abre en 1 seg y regresa en 3 seg por rep) (biserie)",
    "pesos": [
      null,
      null,
      null
    ],
    "unidad": "kg"
  }
];

const DIAS = [
  { dia: "Lunes", rutina: "Hombro y pantorrilla" },
  { dia: "Martes", rutina: "Pierna" },
  { dia: "Miércoles", rutina: "Tríceps y pecho" },
  { dia: "Jueves", rutina: "Bíceps y espalda" },
  { dia: "Viernes", rutina: "Glúteo y femoral" },
];

if (typeof module !== 'undefined') module.exports = { ROUTINES, DIAS };
