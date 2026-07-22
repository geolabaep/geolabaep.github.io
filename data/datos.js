
/* ==========================================================
   CAPA DE DATOS EMBEBIDOS · v3.7.7
   Separada de la lógica de interfaz para facilitar una futura
   migración a CSV/JSON sin cambiar los módulos visuales.
   ========================================================== */
const APP_VERSION = "3.7.7";
const SERIES_DESDE = "2026-06-06";

const ESTACIONES_BASE = [
  { id:"puerto_ladario",   nombre:"Puerto Ladario - Brasil",  rio:"Río Paraguay", lat:-19.0053, lon:-57.5975 },
  { id:"caceres",          nombre:"Cáceres - Brasil",         rio:"Río Paraguay", lat:-16.0742, lon:-57.6786 },
  { id:"puerto_murtinho",  nombre:"Puerto Murtinho - Brasil", rio:"Río Paraguay", lat:-21.7042, lon:-57.8867 },
  { id:"isla_margarita",   nombre:"Isla Margarita",           rio:"Río Paraguay", lat:-20.65,   lon:-58.15 },
  { id:"fuerte_olimpo",    nombre:"Fuerte Olimpo",            rio:"Río Paraguay", lat:-21.0433, lon:-57.8722 },
  { id:"bahia_negra",      nombre:"Bahía Negra",              rio:"Río Paraguay", lat:-20.2333, lon:-58.1667 },
  { id:"vallemi",          nombre:"Vallemi",                  rio:"Río Paraguay", lat:-21.9667, lon:-57.9333 },
  { id:"concepcion",       nombre:"Concepción",               rio:"Río Paraguay", lat:-23.4067, lon:-57.4344 },
  { id:"rosario",          nombre:"Rosario",                  rio:"Río Paraguay", lat:-24.4667, lon:-57.1167 },
  { id:"puerto_antequera", nombre:"Puerto Antequera",         rio:"Río Paraguay", lat:-24.85,   lon:-57.25 },
  { id:"villeta",          nombre:"Villeta",                  rio:"Río Paraguay", lat:-25.5167, lon:-57.5667 },
  { id:"asuncion",         nombre:"Asunción",                 rio:"Río Paraguay", lat:-25.2637, lon:-57.5759 },
  { id:"ita_enramada",     nombre:"Ita Enramada",             rio:"Río Paraguay", lat:-25.35,   lon:-57.62 },
  { id:"humaita",          nombre:"Humaitá",                  rio:"Río Paraguay", lat:-25.90,   lon:-57.90 },
  { id:"alberdi",          nombre:"Alberdi",                  rio:"Río Paraguay", lat:-26.1667, lon:-58.2167 },
  { id:"pilar",            nombre:"Pilar",                    rio:"Río Paraguay", lat:-26.8667, lon:-58.3000 },
  { id:"puerto_tigre",     nombre:"Puerto Tigre",             rio:"Río Paraná", lat:-23.65,   lon:-54.58 },
  { id:"salto_guaira",     nombre:"Salto del Guairá",         rio:"Río Paraná", lat:-24.0733, lon:-54.2833 },
  { id:"cde",              nombre:"Ciudad del Este",          rio:"Río Paraná", lat:-25.5167, lon:-54.6167 },
  { id:"ita_piru",         nombre:"Ita Pirú",                 rio:"Río Paraná", lat:-27.35,   lon:-56.85 },
  { id:"ayolas",           nombre:"Ayolas",                   rio:"Río Paraná", lat:-27.3833, lon:-56.8500 },
  { id:"cerrito",          nombre:"Cerrito",                  rio:"Río Paraná", lat:-27.15,   lon:-55.75 },
  { id:"san_cosme",        nombre:"San Cosme y San Damián",   rio:"Río Paraná", lat:-27.2833, lon:-56.3667 },
  { id:"encarnacion",      nombre:"Encarnación",              rio:"Río Paraná", lat:-27.3333, lon:-55.8667 },
  { id:"paso_patria",      nombre:"Paso de Patria",           rio:"Río Paraná", lat:-27.35,   lon:-58.20 },
  { id:"coratei",          nombre:"Coratei",                  rio:"Río Paraná", lat:-27.30,   lon:-58.15 },
  { id:"ita_cora",         nombre:"Ita Corá",                 rio:"Río Paraná", lat:-27.28,   lon:-58.05 },
  { id:"panchito_lopez",   nombre:"Panchito López",           rio:"Río Paraná", lat:-27.32,   lon:-58.28 },
  { id:"pozo_hondo",       nombre:"Pozo Hondo",               rio:"Río Pilcomayo", lat:-22.3167, lon:-62.3667 },
  { id:"villa_florida",    nombre:"Villa Florida",            rio:"Río Tebicuary", lat:-26.9667, lon:-57.1500 },
  { id:"estacion_arirai",  nombre:"Estación Arirai",          rio:"Río Negro", lat:-20.50,   lon:-59.50 }
];
const STATION_BY_ID = new Map(ESTACIONES_BASE.map(estacion => [estacion.id, estacion]));


/* ---------- Histórico de mínimos y máximos ----------
   Estos valores son los que figuraban en los boletines de referencia
   que me pasaste (capturas de Río Paraná / Pilcomayo / Tebicuary / Negro).
   Solo cubren esas 15 estaciones — para las demás (Río Paraguay y las
   estaciones brasileñas) no tengo un histórico confirmado, así que no
   se muestra ese dato hasta que me pases la fuente correspondiente. */
const HISTORICO = {
  puerto_ladario:   { min:{nivel:-0.68, fecha:"2024-10-16"}, max:{nivel:4.24,  fecha:"2023-07-18"} },
  puerto_murtinho:  { min:{nivel:0.53,  fecha:"2024-10-24"}, max:{nivel:9.75,  fecha:"1982-06-26"} },
  caceres:          { min:{nivel:0.26,  fecha:"2021-09-27"}, max:{nivel:5.47,  fecha:"2023-03-29"} },
  isla_margarita:   { min:{nivel:0.54,  fecha:"2024-10-23"}, max:{nivel:7.70,  fecha:"2018-03-12"} },
  fuerte_olimpo:    { min:{nivel:-1.58, fecha:"1971-10-26"}, max:{nivel:9.60,  fecha:"1988-06-09"} },
  bahia_negra:      { min:{nivel:-1.32, fecha:"1971-09-26"}, max:{nivel:6.95,  fecha:"1982-06-13"} },
  vallemi:          { min:{nivel:0.42,  fecha:"1971-09-24"}, max:{nivel:8.56,  fecha:"1982-06-24"} },
  concepcion:       { min:{nivel:0.34,  fecha:"1968-01-07"}, max:{nivel:8.66,  fecha:"1992-05-20"} },
  rosario:          { min:{nivel:-0.62, fecha:"2024-10-30"}, max:{nivel:8.03,  fecha:"1983-06-03"} },
  puerto_antequera: { min:{nivel:-0.49, fecha:"2024-10-31"}, max:{nivel:6.02,  fecha:"2023-03-17"} },
  villeta:          { min:{nivel:-1.21, fecha:"2024-11-01"}, max:{nivel:8.94,  fecha:"1983-05-30"} },
  asuncion:         { min:{nivel:-1.61, fecha:"2024-11-02"}, max:{nivel:9.01,  fecha:"1983-05-29"} },
  ita_enramada:     { min:{nivel:-1.04, fecha:"2024-11-01"}, max:{nivel:5.80,  fecha:"2023-03-26"} },
  humaita:          { min:{nivel:-0.25, fecha:"2021-10-02"}, max:{nivel:7.74,  fecha:"2019-06-07"} },
  alberdi:          { min:{nivel:-0.77, fecha:"2024-11-08"}, max:{nivel:10.14, fecha:"1992-06-10"} },
  pilar:            { min:{nivel:-0.49, fecha:"1944-10-06"}, max:{nivel:10.05, fecha:"1983-05-29"} },
  puerto_tigre:   { min:{nivel:2.01,  fecha:"2026-04-09"}, max:{nivel:7.81,  fecha:"2023-11-29"} },
  salto_guaira:   { min:{nivel:3.16,  fecha:"2020-12-13"}, max:{nivel:10.03, fecha:"2026-05-09"} },
  cde:            { min:{nivel:2.71,  fecha:"2021-07-05"}, max:{nivel:30.40, fecha:"2023-10-31"} },
  cerrito:        { min:{nivel:-0.40, fecha:"2021-12-29"}, max:{nivel:6.70,  fecha:"2023-11-08"} },
  ita_piru:       { min:{nivel:0.02,  fecha:"2022-02-04"}, max:{nivel:9.94,  fecha:"2021-05-08"} },
  paso_patria:    { min:{nivel:0.01,  fecha:"2022-01-13"}, max:{nivel:9.83,  fecha:"2025-09-20"} },
  ayolas:         { min:{nivel:0.00,  fecha:"2007-09-13"}, max:{nivel:6.65,  fecha:"1997-02-07"} },
  panchito_lopez: { min:{nivel:0.10,  fecha:"2020-10-23"}, max:{nivel:7.04,  fecha:"2023-11-07"} },
  coratei:        { min:{nivel:-0.29, fecha:"2022-02-22"}, max:{nivel:6.35,  fecha:"2023-11-07"} },
  ita_cora:       { min:{nivel:0.60,  fecha:"2021-05-24"}, max:{nivel:8.21,  fecha:"2023-11-09"} },
  san_cosme:      { min:{nivel:0.75,  fecha:"2025-03-28"}, max:{nivel:10.35, fecha:"2023-11-09"} },
  encarnacion:    { min:{nivel:3.10,  fecha:"2026-04-11"}, max:{nivel:12.00, fecha:"2023-12-31"} },
  pozo_hondo:     { min:{nivel:0.00,  fecha:"2024-12-10"}, max:{nivel:5.73,  fecha:"2026-01-24"} },
  villa_florida:  { min:{nivel:-0.01, fecha:"2023-02-14"}, max:{nivel:5.66,  fecha:"2023-11-07"} },
  estacion_arirai:{ min:{nivel:2.06,  fecha:"2024-10-09"}, max:{nivel:6.78,  fecha:"2023-07-29"} }
};

/* ---------- Semilla inicial ----------
   La base propia ya incorpora datos observados desde 06/06/2026
   para estaciones con serie disponible. Villa Florida se conserva como
   registro puntual histórico/desactualizadas, sin construir línea temporal. */
const VILLA_FLORIDA_PUNTUAL = {
  fecha: "2025-02-28",
  estaciones: {
    villa_florida: { nivel:0.32, variacion:0.00, fecha:"2025-02-28", estado:"antiguo", observacion:"Registro puntual disponible; no constituye serie temporal." }
  }
};

const SEEDS = [
{
  fecha: "2026-06-22",
  estaciones: {
    puerto_ladario: { nivel:2.47, variacion:0.00, fecha:"2026-06-22" },
    puerto_murtinho: { nivel:3.39, variacion:0.00, fecha:"2026-06-22" },
    caceres: { nivel:1.68, variacion:0.00, fecha:"2026-06-22" },
    cde: { nivel:10.00, variacion:0.00, fecha:"2026-06-22" }
  }
},
{
  fecha: "2026-06-23",
  estaciones: {
    puerto_ladario: { nivel:2.48, variacion:0.01, fecha:"2026-06-23" },
    puerto_murtinho: { nivel:3.38, variacion:-0.01, fecha:"2026-06-23" },
    caceres: { nivel:1.70, variacion:0.02, fecha:"2026-06-23" },
    cde: { nivel:11.07, variacion:1.07, fecha:"2026-06-23" }
  }
},
{
  fecha: "2026-06-24",
  estaciones: {
    puerto_ladario: { nivel:2.49, variacion:0.01, fecha:"2026-06-24" },
    puerto_murtinho: { nivel:3.37, variacion:-0.01, fecha:"2026-06-24" },
    caceres: { nivel:1.73, variacion:0.03, fecha:"2026-06-24" },
    cde: { nivel:10.35, variacion:-0.72, fecha:"2026-06-24" },
    isla_margarita: { nivel:3.38, variacion:0.00, fecha:"2026-06-24" },
    fuerte_olimpo: { nivel:4.36, variacion:0.00, fecha:"2026-06-24" },
    bahia_negra: { nivel:4.19, variacion:0.00, fecha:"2026-06-24" },
    vallemi: { nivel:3.20, variacion:0.00, fecha:"2026-06-24" },
    concepcion: { nivel:2.65, variacion:0.00, fecha:"2026-06-24" },
    rosario: { nivel:2.52, variacion:0.00, fecha:"2026-06-24" },
    puerto_antequera: { nivel:2.32, variacion:0.00, fecha:"2026-06-24" },
    villeta: { nivel:3.13, variacion:0.00, fecha:"2026-06-24" },
    asuncion: { nivel:2.65, variacion:0.00, fecha:"2026-06-24" },
    ita_enramada: { nivel:3.14, variacion:0.00, fecha:"2026-06-24" },
    humaita: { nivel:2.94, variacion:0.00, fecha:"2026-06-24" },
    alberdi: { nivel:4.57, variacion:0.00, fecha:"2026-06-24" },
    pilar: { nivel:4.18, variacion:0.00, fecha:"2026-06-24" },
    puerto_tigre: { nivel:6.52, variacion:0.00, fecha:"2026-06-24" },
    salto_guaira: { nivel:6.58, variacion:0.00, fecha:"2026-06-24" },
    cerrito: { nivel:0.75, variacion:0.00, fecha:"2026-06-24" },
    ita_piru: { nivel:3.40, variacion:0.00, fecha:"2026-06-24" },
    paso_patria: { nivel:3.15, variacion:0.00, fecha:"2026-06-24" },
    ayolas: { nivel:1.40, variacion:0.00, fecha:"2026-06-24" },
    panchito_lopez: { nivel:2.70, variacion:0.00, fecha:"2026-06-24" },
    coratei: { nivel:1.33, variacion:0.00, fecha:"2026-06-24" },
    ita_cora: { nivel:2.20, variacion:0.00, fecha:"2026-06-24" },
    san_cosme: { nivel:9.85, variacion:0.00, fecha:"2026-06-24" },
    encarnacion: { nivel:10.29, variacion:0.00, fecha:"2026-06-24" },
    pozo_hondo: { nivel:3.02, variacion:0.00, fecha:"2026-06-24" },
    estacion_arirai: { nivel:4.87, variacion:0.00, fecha:"2026-06-24" }
  }
},
{
  fecha: "2026-06-25",
  estaciones: {
    puerto_ladario: { nivel:2.49, variacion:0.00, fecha:"2026-06-25" },
    puerto_murtinho: { nivel:3.36, variacion:-0.01, fecha:"2026-06-25" },
    caceres: { nivel:1.76, variacion:0.03, fecha:"2026-06-25" },
    cde: { nivel:11.35, variacion:1.00, fecha:"2026-06-25" },
    isla_margarita: { nivel:3.37, variacion:-0.01, fecha:"2026-06-25" },
    fuerte_olimpo: { nivel:4.34, variacion:-0.02, fecha:"2026-06-25" },
    bahia_negra: { nivel:4.19, variacion:0.00, fecha:"2026-06-25" },
    vallemi: { nivel:3.20, variacion:0.00, fecha:"2026-06-25" },
    concepcion: { nivel:2.64, variacion:-0.01, fecha:"2026-06-25" },
    rosario: { nivel:2.52, variacion:0.00, fecha:"2026-06-25" },
    puerto_antequera: { nivel:2.31, variacion:-0.01, fecha:"2026-06-25" },
    villeta: { nivel:3.12, variacion:-0.01, fecha:"2026-06-25" },
    asuncion: { nivel:2.63, variacion:-0.02, fecha:"2026-06-25" },
    ita_enramada: { nivel:3.12, variacion:-0.02, fecha:"2026-06-25" },
    humaita: { nivel:3.00, variacion:0.06, fecha:"2026-06-25" },
    alberdi: { nivel:4.58, variacion:0.01, fecha:"2026-06-25" },
    pilar: { nivel:4.20, variacion:0.02, fecha:"2026-06-25" },
    puerto_tigre: { nivel:6.66, variacion:0.14, fecha:"2026-06-25" },
    salto_guaira: { nivel:6.65, variacion:0.07, fecha:"2026-06-25" },
    cerrito: { nivel:1.10, variacion:0.35, fecha:"2026-06-25" },
    ita_piru: { nivel:3.50, variacion:0.10, fecha:"2026-06-25" },
    paso_patria: { nivel:3.15, variacion:0.00, fecha:"2026-06-25" },
    ayolas: { nivel:1.42, variacion:0.02, fecha:"2026-06-25" },
    panchito_lopez: { nivel:2.67, variacion:-0.03, fecha:"2026-06-25" },
    coratei: { nivel:1.33, variacion:0.00, fecha:"2026-06-25" },
    ita_cora: { nivel:2.40, variacion:0.20, fecha:"2026-06-25" },
    san_cosme: { nivel:9.85, variacion:0.00, fecha:"2026-06-25" },
    encarnacion: { nivel:10.16, variacion:-0.13, fecha:"2026-06-25" },
    pozo_hondo: { nivel:3.02, variacion:0.00, fecha:"2026-06-25" },
    estacion_arirai: { nivel:4.87, variacion:0.00, fecha:"2026-06-25" }
  }
},
{
  fecha: "2026-06-26",
  estaciones: {
    puerto_ladario: { nivel:2.50, variacion:0.01, fecha:"2026-06-26" },
    puerto_murtinho: { nivel:3.36, variacion:0.00, fecha:"2026-06-26" },
    caceres: { nivel:1.81, variacion:0.05, fecha:"2026-06-26" },
    cde: { nivel:10.07, variacion:-1.28, fecha:"2026-06-26" },
    isla_margarita: { nivel:3.36, variacion:-0.01, fecha:"2026-06-26" },
    fuerte_olimpo: { nivel:4.33, variacion:-0.01, fecha:"2026-06-26" },
    bahia_negra: { nivel:4.19, variacion:0.00, fecha:"2026-06-26" },
    vallemi: { nivel:3.20, variacion:0.00, fecha:"2026-06-26" },
    concepcion: { nivel:2.64, variacion:0.00, fecha:"2026-06-26" },
    rosario: { nivel:2.51, variacion:-0.01, fecha:"2026-06-26" },
    puerto_antequera: { nivel:2.31, variacion:0.00, fecha:"2026-06-26" },
    villeta: { nivel:3.10, variacion:-0.02, fecha:"2026-06-26" },
    asuncion: { nivel:2.60, variacion:-0.03, fecha:"2026-06-26" },
    ita_enramada: { nivel:3.08, variacion:-0.04, fecha:"2026-06-26" },
    humaita: { nivel:3.10, variacion:0.10, fecha:"2026-06-26" },
    alberdi: { nivel:4.57, variacion:-0.01, fecha:"2026-06-26" },
    pilar: { nivel:4.22, variacion:0.02, fecha:"2026-06-26" },
    puerto_tigre: { nivel:6.74, variacion:0.08, fecha:"2026-06-26" },
    salto_guaira: { nivel:6.76, variacion:0.11, fecha:"2026-06-26" },
    cerrito: { nivel:1.22, variacion:0.12, fecha:"2026-06-26" },
    ita_piru: { nivel:3.80, variacion:0.30, fecha:"2026-06-26" },
    paso_patria: { nivel:3.55, variacion:0.40, fecha:"2026-06-26" },
    ayolas: { nivel:1.50, variacion:0.08, fecha:"2026-06-26" },
    panchito_lopez: { nivel:2.65, variacion:-0.02, fecha:"2026-06-26" },
    coratei: { nivel:1.40, variacion:0.07, fecha:"2026-06-26" },
    ita_cora: { nivel:2.45, variacion:0.05, fecha:"2026-06-26" },
    san_cosme: { nivel:9.90, variacion:0.05, fecha:"2026-06-26" },
    encarnacion: { nivel:10.21, variacion:0.05, fecha:"2026-06-26" },
    pozo_hondo: { nivel:3.02, variacion:0.00, fecha:"2026-06-26" },
    estacion_arirai: { nivel:4.87, variacion:0.00, fecha:"2026-06-26" }
  }
},
{
  fecha: "2026-06-27",
  estaciones: {
    puerto_ladario: { nivel:2.49, variacion:-0.01, fecha:"2026-06-27" },
    puerto_murtinho: { nivel:3.36, variacion:0.00, fecha:"2026-06-27" },
    caceres: { nivel:1.82, variacion:0.01, fecha:"2026-06-27" },
    cde: { nivel:10.96, variacion:0.89, fecha:"2026-06-27" },
    isla_margarita: { nivel:3.36, variacion:0.00, fecha:"2026-06-27" },
    fuerte_olimpo: { nivel:4.32, variacion:-0.01, fecha:"2026-06-27" },
    bahia_negra: { nivel:4.19, variacion:0.00, fecha:"2026-06-27" },
    vallemi: { nivel:3.19, variacion:-0.01, fecha:"2026-06-27" },
    concepcion: { nivel:2.60, variacion:-0.04, fecha:"2026-06-27" },
    rosario: { nivel:2.48, variacion:-0.03, fecha:"2026-06-27" },
    puerto_antequera: { nivel:2.30, variacion:-0.01, fecha:"2026-06-27" },
    villeta: { nivel:3.07, variacion:-0.03, fecha:"2026-06-27" },
    asuncion: { nivel:2.58, variacion:-0.02, fecha:"2026-06-27" },
    ita_enramada: { nivel:3.06, variacion:-0.02, fecha:"2026-06-27" },
    humaita: { nivel:3.16, variacion:0.06, fecha:"2026-06-27" },
    alberdi: { nivel:4.57, variacion:0.00, fecha:"2026-06-27" },
    pilar: { nivel:4.24, variacion:0.02, fecha:"2026-06-27" },
    puerto_tigre: { nivel:6.86, variacion:0.12, fecha:"2026-06-27" },
    salto_guaira: { nivel:6.85, variacion:0.09, fecha:"2026-06-27" },
    cerrito: { nivel:1.27, variacion:0.05, fecha:"2026-06-27" },
    ita_piru: { nivel:3.90, variacion:0.10, fecha:"2026-06-27" },
    paso_patria: { nivel:3.65, variacion:0.10, fecha:"2026-06-27" },
    ayolas: { nivel:1.48, variacion:-0.02, fecha:"2026-06-27" },
    panchito_lopez: { nivel:2.65, variacion:0.00, fecha:"2026-06-27" },
    coratei: { nivel:1.35, variacion:-0.05, fecha:"2026-06-27" },
    ita_cora: { nivel:2.45, variacion:0.00, fecha:"2026-06-27" },
    san_cosme: { nivel:9.90, variacion:0.00, fecha:"2026-06-27" },
    encarnacion: { nivel:10.10, variacion:-0.11, fecha:"2026-06-27" },
    pozo_hondo: { nivel:3.03, variacion:0.01, fecha:"2026-06-27" },
    estacion_arirai: { nivel:4.87, variacion:0.00, fecha:"2026-06-27" }
  }
},
{
  fecha: "2026-06-28",
  estaciones: {
    puerto_ladario: { nivel:2.50, variacion:0.01, fecha:"2026-06-28" },
    puerto_murtinho: { nivel:3.35, variacion:-0.01, fecha:"2026-06-28" },
    caceres: { nivel:1.82, variacion:0.00, fecha:"2026-06-28" },
    cde: { nivel:11.12, variacion:0.16, fecha:"2026-06-28" },
    isla_margarita: { nivel:3.36, variacion:0.00, fecha:"2026-06-28" },
    fuerte_olimpo: { nivel:4.31, variacion:-0.01, fecha:"2026-06-28" },
    bahia_negra: { nivel:4.20, variacion:0.01, fecha:"2026-06-28" },
    vallemi: { nivel:3.19, variacion:0.00, fecha:"2026-06-28" },
    concepcion: { nivel:2.59, variacion:-0.01, fecha:"2026-06-28" },
    rosario: { nivel:2.47, variacion:-0.01, fecha:"2026-06-28" },
    puerto_antequera: { nivel:2.29, variacion:-0.01, fecha:"2026-06-28" },
    villeta: { nivel:3.06, variacion:-0.01, fecha:"2026-06-28" },
    asuncion: { nivel:2.56, variacion:-0.02, fecha:"2026-06-28" },
    ita_enramada: { nivel:3.05, variacion:-0.01, fecha:"2026-06-28" },
    humaita: { nivel:3.20, variacion:0.04, fecha:"2026-06-28" },
    alberdi: { nivel:4.57, variacion:0.00, fecha:"2026-06-28" },
    pilar: { nivel:4.26, variacion:0.02, fecha:"2026-06-28" },
    puerto_tigre: { nivel:6.96, variacion:0.10, fecha:"2026-06-28" },
    salto_guaira: { nivel:6.97, variacion:0.12, fecha:"2026-06-28" },
    cerrito: { nivel:1.27, variacion:0.00, fecha:"2026-06-28" },
    ita_piru: { nivel:3.90, variacion:0.00, fecha:"2026-06-28" },
    paso_patria: { nivel:3.60, variacion:-0.05, fecha:"2026-06-28" },
    ayolas: { nivel:1.38, variacion:-0.10, fecha:"2026-06-28" },
    panchito_lopez: { nivel:2.75, variacion:0.10, fecha:"2026-06-28" },
    coratei: { nivel:1.25, variacion:-0.10, fecha:"2026-06-28" },
    ita_cora: { nivel:2.30, variacion:-0.15, fecha:"2026-06-28" },
    san_cosme: { nivel:9.85, variacion:-0.05, fecha:"2026-06-28" },
    encarnacion: { nivel:10.08, variacion:-0.02, fecha:"2026-06-28" },
    pozo_hondo: { nivel:3.30, variacion:0.27, fecha:"2026-06-28" },
    estacion_arirai: { nivel:4.88, variacion:0.01, fecha:"2026-06-28" }
  }
},
{
  fecha: "2026-06-29",
  estaciones: {
    puerto_ladario: { nivel:2.50, variacion:0.00, fecha:"2026-06-29" },
    puerto_murtinho: { nivel:3.35, variacion:0.00, fecha:"2026-06-29" },
    caceres: { nivel:1.80, variacion:-0.02, fecha:"2026-06-29" },
    cde: { nivel:12.40, variacion:1.28, fecha:"2026-06-29" },
    isla_margarita: { nivel:3.35, variacion:-0.01, fecha:"2026-06-29" },
    fuerte_olimpo: { nivel:4.29, variacion:-0.02, fecha:"2026-06-29" },
    bahia_negra: { nivel:4.20, variacion:0.00, fecha:"2026-06-29" },
    vallemi: { nivel:3.18, variacion:-0.01, fecha:"2026-06-29" },
    concepcion: { nivel:2.58, variacion:-0.01, fecha:"2026-06-29" },
    rosario: { nivel:2.46, variacion:-0.01, fecha:"2026-06-29" },
    puerto_antequera: { nivel:2.28, variacion:-0.01, fecha:"2026-06-29" },
    villeta: { nivel:3.05, variacion:-0.01, fecha:"2026-06-29" },
    asuncion: { nivel:2.56, variacion:0.00, fecha:"2026-06-29" },
    ita_enramada: { nivel:3.05, variacion:0.00, fecha:"2026-06-29" },
    humaita: { nivel:3.22, variacion:0.02, fecha:"2026-06-29" },
    alberdi: { nivel:4.57, variacion:0.00, fecha:"2026-06-29" },
    pilar: { nivel:4.29, variacion:0.03, fecha:"2026-06-29" },
    puerto_tigre: { nivel:7.01, variacion:0.05, fecha:"2026-06-29" },
    salto_guaira: { nivel:7.06, variacion:0.09, fecha:"2026-06-29" },
    cerrito: { nivel:1.30, variacion:0.03, fecha:"2026-06-29" },
    ita_piru: { nivel:4.10, variacion:0.20, fecha:"2026-06-29" },
    paso_patria: { nivel:3.80, variacion:0.20, fecha:"2026-06-29" },
    ayolas: { nivel:1.30, variacion:-0.08, fecha:"2026-06-29" },
    panchito_lopez: { nivel:2.80, variacion:0.05, fecha:"2026-06-29" },
    coratei: { nivel:1.18, variacion:-0.07, fecha:"2026-06-29" },
    ita_cora: { nivel:2.35, variacion:0.05, fecha:"2026-06-29" },
    san_cosme: { nivel:9.87, variacion:0.02, fecha:"2026-06-29" },
    encarnacion: { nivel:10.26, variacion:0.18, fecha:"2026-06-29" },
    pozo_hondo: { nivel:3.07, variacion:-0.23, fecha:"2026-06-29" },
    estacion_arirai: { nivel:4.88, variacion:0.00, fecha:"2026-06-29" }
  }
},
{
  fecha: "2026-06-30",
  estaciones: {
    puerto_ladario: { nivel:2.51, variacion:0.01, fecha:"2026-06-30" },
    puerto_murtinho: { nivel:3.34, variacion:-0.01, fecha:"2026-06-30" },
    caceres: { nivel:1.82, variacion:0.02, fecha:"2026-06-30" },
    cde: { nivel:15.57, variacion:3.17, fecha:"2026-06-30" },
    isla_margarita: { nivel:3.35, variacion:0.00, fecha:"2026-06-30" },
    fuerte_olimpo: { nivel:4.28, variacion:-0.01, fecha:"2026-06-30" },
    bahia_negra: { nivel:4.20, variacion:0.00, fecha:"2026-06-30" },
    vallemi: { nivel:3.17, variacion:-0.01, fecha:"2026-06-30" },
    concepcion: { nivel:2.56, variacion:-0.02, fecha:"2026-06-30" },
    rosario: { nivel:2.46, variacion:0.00, fecha:"2026-06-30" },
    puerto_antequera: { nivel:2.28, variacion:0.00, fecha:"2026-06-30" },
    villeta: { nivel:3.03, variacion:-0.02, fecha:"2026-06-30" },
    asuncion: { nivel:2.55, variacion:-0.01, fecha:"2026-06-30" },
    ita_enramada: { nivel:3.03, variacion:-0.02, fecha:"2026-06-30" },
    humaita: { nivel:3.22, variacion:0.00, fecha:"2026-06-30" },
    alberdi: { nivel:4.58, variacion:0.01, fecha:"2026-06-30" },
    pilar: { nivel:4.29, variacion:0.00, fecha:"2026-06-30" },
    puerto_tigre: { nivel:7.00, variacion:-0.01, fecha:"2026-06-30" },
    salto_guaira: { nivel:7.02, variacion:-0.04, fecha:"2026-06-30" },
    cerrito: { nivel:1.40, variacion:0.10, fecha:"2026-06-30" },
    ita_piru: { nivel:4.60, variacion:0.50, fecha:"2026-06-30" },
    paso_patria: { nivel:3.95, variacion:0.15, fecha:"2026-06-30" },
    ayolas: { nivel:1.80, variacion:0.50, fecha:"2026-06-30" },
    panchito_lopez: { nivel:3.30, variacion:0.50, fecha:"2026-06-30" },
    coratei: { nivel:1.78, variacion:0.60, fecha:"2026-06-30" },
    ita_cora: { nivel:2.40, variacion:0.05, fecha:"2026-06-30" },
    san_cosme: { nivel:9.90, variacion:0.03, fecha:"2026-06-30" },
    encarnacion: { nivel:10.22, variacion:-0.04, fecha:"2026-06-30" },
    pozo_hondo: { nivel:3.06, variacion:-0.01, fecha:"2026-06-30" },
    estacion_arirai: { nivel:4.88, variacion:0.00, fecha:"2026-06-30" }
  }
},
{
  fecha: "2026-07-01",
  estaciones: {
    puerto_ladario: { nivel:2.52, variacion:0.01, fecha:"2026-07-01" },
    puerto_murtinho: { nivel:3.34, variacion:0.00, fecha:"2026-07-01" },
    caceres: { nivel:1.82, variacion:0.00, fecha:"2026-07-01" },
    cde: { nivel:16.79, variacion:1.22, fecha:"2026-07-01" },
    isla_margarita: { nivel:3.34, variacion:-0.01, fecha:"2026-07-01" },
    fuerte_olimpo: { nivel:4.27, variacion:-0.01, fecha:"2026-07-01" },
    bahia_negra: { nivel:4.21, variacion:0.01, fecha:"2026-07-01" },
    vallemi: { nivel:3.17, variacion:0.00, fecha:"2026-07-01" },
    concepcion: { nivel:2.55, variacion:-0.01, fecha:"2026-07-01" },
    rosario: { nivel:2.43, variacion:-0.03, fecha:"2026-07-01" },
    puerto_antequera: { nivel:2.27, variacion:-0.01, fecha:"2026-07-01" },
    villeta: { nivel:3.03, variacion:0.00, fecha:"2026-07-01" },
    asuncion: { nivel:2.53, variacion:-0.02, fecha:"2026-07-01" },
    ita_enramada: { nivel:3.02, variacion:-0.01, fecha:"2026-07-01" },
    humaita: { nivel:3.34, variacion:0.12, fecha:"2026-07-01" },
    alberdi: { nivel:4.58, variacion:0.00, fecha:"2026-07-01" },
    pilar: { nivel:4.33, variacion:0.04, fecha:"2026-07-01" },
    puerto_tigre: { nivel:7.00, variacion:0.00, fecha:"2026-07-01" },
    salto_guaira: { nivel:7.00, variacion:-0.02, fecha:"2026-07-01" },
    cerrito: { nivel:1.80, variacion:0.40, fecha:"2026-07-01" },
    ita_piru: { nivel:4.70, variacion:0.10, fecha:"2026-07-01" },
    paso_patria: { nivel:3.95, variacion:0.00, fecha:"2026-07-01" },
    ayolas: { nivel:2.25, variacion:0.45, fecha:"2026-07-01" },
    panchito_lopez: { nivel:3.35, variacion:0.05, fecha:"2026-07-01" },
    coratei: { nivel:2.15, variacion:0.37, fecha:"2026-07-01" },
    ita_cora: { nivel:3.35, variacion:0.95, fecha:"2026-07-01" },
    san_cosme: { nivel:9.95, variacion:0.05, fecha:"2026-07-01" },
    encarnacion: { nivel:10.11, variacion:-0.11, fecha:"2026-07-01" },
    pozo_hondo: { nivel:3.15, variacion:0.09, fecha:"2026-07-01" },
    estacion_arirai: { nivel:4.89, variacion:0.01, fecha:"2026-07-01" }
  }
},
{
  fecha: "2026-07-02",
  estaciones: {
    puerto_ladario: { nivel:2.53, variacion:0.01, fecha:"2026-07-02" },
    puerto_murtinho: { nivel:3.32, variacion:-0.02, fecha:"2026-07-02" },
    caceres: { nivel:1.80, variacion:-0.02, fecha:"2026-07-02" },
    cde: { nivel:17.67, variacion:0.88, fecha:"2026-07-02" },
    isla_margarita: { nivel:3.34, variacion:0.00, fecha:"2026-07-02" },
    fuerte_olimpo: { nivel:4.27, variacion:0.00, fecha:"2026-07-02" },
    bahia_negra: { nivel:4.21, variacion:0.00, fecha:"2026-07-02" },
    vallemi: { nivel:3.17, variacion:0.00, fecha:"2026-07-02" },
    concepcion: { nivel:2.54, variacion:-0.01, fecha:"2026-07-02" },
    rosario: { nivel:2.41, variacion:-0.02, fecha:"2026-07-02" },
    puerto_antequera: { nivel:2.26, variacion:-0.01, fecha:"2026-07-02" },
    villeta: { nivel:3.03, variacion:0.00, fecha:"2026-07-02" },
    asuncion: { nivel:2.54, variacion:0.01, fecha:"2026-07-02" },
    ita_enramada: { nivel:3.03, variacion:0.01, fecha:"2026-07-02" },
    humaita: { nivel:3.44, variacion:0.10, fecha:"2026-07-02" },
    alberdi: { nivel:4.59, variacion:0.01, fecha:"2026-07-02" },
    pilar: { nivel:4.39, variacion:0.06, fecha:"2026-07-02" },
    puerto_tigre: { nivel:7.00, variacion:0.00, fecha:"2026-07-02" },
    salto_guaira: { nivel:6.98, variacion:-0.02, fecha:"2026-07-02" },
    cerrito: { nivel:2.20, variacion:0.40, fecha:"2026-07-02" },
    ita_piru: { nivel:4.78, variacion:0.08, fecha:"2026-07-02" },
    paso_patria: { nivel:4.05, variacion:0.10, fecha:"2026-07-02" },
    ayolas: { nivel:2.74, variacion:0.49, fecha:"2026-07-02" },
    panchito_lopez: { nivel:3.38, variacion:0.03, fecha:"2026-07-02" },
    coratei: { nivel:2.56, variacion:0.41, fecha:"2026-07-02" },
    ita_cora: { nivel:3.75, variacion:0.40, fecha:"2026-07-02" },
    san_cosme: { nivel:9.95, variacion:0.00, fecha:"2026-07-02" },
    encarnacion: { nivel:10.13, variacion:0.02, fecha:"2026-07-02" },
    pozo_hondo: { nivel:3.15, variacion:0.00, fecha:"2026-07-02" },
    estacion_arirai: { nivel:4.89, variacion:0.00, fecha:"2026-07-02" }
  }
},
{
  fecha: "2026-07-03",
  estaciones: {
    puerto_ladario: { nivel:2.52, variacion:-0.01, fecha:"2026-07-03" },
    puerto_murtinho: { nivel:3.32, variacion:0.00, fecha:"2026-07-03" },
    caceres: { nivel:1.74, variacion:-0.06, fecha:"2026-07-03" },
    cde: { nivel:16.82, variacion:-0.85, fecha:"2026-07-03" },
    isla_margarita: { nivel:3.32, variacion:-0.02, fecha:"2026-07-03" },
    fuerte_olimpo: { nivel:4.25, variacion:-0.02, fecha:"2026-07-03" },
    bahia_negra: { nivel:4.21, variacion:0.00, fecha:"2026-07-03" },
    vallemi: { nivel:3.15, variacion:-0.02, fecha:"2026-07-03" },
    concepcion: { nivel:2.52, variacion:-0.02, fecha:"2026-07-03" },
    rosario: { nivel:2.48, variacion:0.07, fecha:"2026-07-03" },
    puerto_antequera: { nivel:2.25, variacion:-0.01, fecha:"2026-07-03" },
    villeta: { nivel:3.03, variacion:0.00, fecha:"2026-07-03" },
    asuncion: { nivel:2.54, variacion:0.00, fecha:"2026-07-03" },
    ita_enramada: { nivel:3.03, variacion:0.00, fecha:"2026-07-03" },
    humaita: { nivel:3.69, variacion:0.25, fecha:"2026-07-03" },
    alberdi: { nivel:4.61, variacion:0.02, fecha:"2026-07-03" },
    pilar: { nivel:4.48, variacion:0.09, fecha:"2026-07-03" },
    puerto_tigre: { nivel:7.00, variacion:0.00, fecha:"2026-07-03" },
    salto_guaira: { nivel:7.00, variacion:0.02, fecha:"2026-07-03" },
    cerrito: { nivel:2.55, variacion:0.35, fecha:"2026-07-03" },
    ita_piru: { nivel:4.96, variacion:0.18, fecha:"2026-07-03" },
    paso_patria: { nivel:4.30, variacion:0.25, fecha:"2026-07-03" },
    ayolas: { nivel:2.85, variacion:0.11, fecha:"2026-07-03" },
    panchito_lopez: { nivel:3.48, variacion:0.10, fecha:"2026-07-03" },
    coratei: { nivel:2.70, variacion:0.14, fecha:"2026-07-03" },
    ita_cora: { nivel:4.10, variacion:0.35, fecha:"2026-07-03" },
    san_cosme: { nivel:9.90, variacion:-0.05, fecha:"2026-07-03" },
    encarnacion: { nivel:10.15, variacion:0.02, fecha:"2026-07-03" },
    pozo_hondo: { nivel:3.04, variacion:-0.11, fecha:"2026-07-03" },
    estacion_arirai: { nivel:4.89, variacion:0.00, fecha:"2026-07-03" }
  }
},
{
  fecha: "2026-07-04",
  estaciones: {
    puerto_ladario: { nivel:2.53, variacion:0.01, fecha:"2026-07-04" },
    puerto_murtinho: { nivel:3.32, variacion:0.00, fecha:"2026-07-04" },
    caceres: { nivel:1.66, variacion:-0.08, fecha:"2026-07-04" },
    cde: { nivel:16.41, variacion:-0.41, fecha:"2026-07-04" },
    isla_margarita: { nivel:3.32, variacion:0.00, fecha:"2026-07-04" },
    fuerte_olimpo: { nivel:4.24, variacion:-0.01, fecha:"2026-07-04" },
    bahia_negra: { nivel:4.21, variacion:0.00, fecha:"2026-07-04" },
    vallemi: { nivel:3.15, variacion:0.00, fecha:"2026-07-04" },
    concepcion: { nivel:2.49, variacion:-0.03, fecha:"2026-07-04" },
    rosario: { nivel:2.45, variacion:-0.03, fecha:"2026-07-04" },
    puerto_antequera: { nivel:2.24, variacion:-0.01, fecha:"2026-07-04" },
    villeta: { nivel:3.02, variacion:-0.01, fecha:"2026-07-04" },
    asuncion: { nivel:2.53, variacion:-0.01, fecha:"2026-07-04" },
    ita_enramada: { nivel:3.03, variacion:0.00, fecha:"2026-07-04" },
    humaita: { nivel:3.88, variacion:0.19, fecha:"2026-07-04" },
    alberdi: { nivel:4.63, variacion:0.02, fecha:"2026-07-04" },
    pilar: { nivel:4.54, variacion:0.06, fecha:"2026-07-04" },
    puerto_tigre: { nivel:6.92, variacion:-0.08, fecha:"2026-07-04" },
    salto_guaira: { nivel:6.80, variacion:-0.20, fecha:"2026-07-04" },
    cerrito: { nivel:2.70, variacion:0.15, fecha:"2026-07-04" },
    ita_piru: { nivel:5.22, variacion:0.26, fecha:"2026-07-04" },
    paso_patria: { nivel:4.55, variacion:0.25, fecha:"2026-07-04" },
    ayolas: { nivel:2.85, variacion:0.00, fecha:"2026-07-04" },
    panchito_lopez: { nivel:3.58, variacion:0.10, fecha:"2026-07-04" },
    coratei: { nivel:2.70, variacion:0.00, fecha:"2026-07-04" },
    ita_cora: { nivel:4.25, variacion:0.15, fecha:"2026-07-04" },
    san_cosme: { nivel:9.95, variacion:0.05, fecha:"2026-07-04" },
    encarnacion: { nivel:10.21, variacion:0.06, fecha:"2026-07-04" },
    pozo_hondo: { nivel:3.06, variacion:0.02, fecha:"2026-07-04" },
    estacion_arirai: { nivel:4.89, variacion:0.00, fecha:"2026-07-04" }
  }
},
{
  fecha: "2026-07-05",
  estaciones: {
    puerto_ladario: { nivel:2.53, variacion:0.00, fecha:"2026-07-05" },
    puerto_murtinho: { nivel:3.31, variacion:-0.01, fecha:"2026-07-05" },
    caceres: { nivel:1.56, variacion:-0.10, fecha:"2026-07-05" },
    cde: { nivel:14.98, variacion:-1.43, fecha:"2026-07-05" },
    isla_margarita: { nivel:3.32, variacion:0.00, fecha:"2026-07-05" },
    fuerte_olimpo: { nivel:4.24, variacion:0.00, fecha:"2026-07-05" },
    bahia_negra: { nivel:4.22, variacion:0.01, fecha:"2026-07-05" },
    vallemi: { nivel:3.14, variacion:-0.01, fecha:"2026-07-05" },
    concepcion: { nivel:2.49, variacion:0.00, fecha:"2026-07-05" },
    rosario: { nivel:2.42, variacion:-0.03, fecha:"2026-07-05" },
    puerto_antequera: { nivel:2.23, variacion:-0.01, fecha:"2026-07-05" },
    villeta: { nivel:3.01, variacion:-0.01, fecha:"2026-07-05" },
    asuncion: { nivel:2.51, variacion:-0.02, fecha:"2026-07-05" },
    ita_enramada: { nivel:2.98, variacion:-0.05, fecha:"2026-07-05" },
    humaita: { nivel:3.94, variacion:0.06, fecha:"2026-07-05" },
    alberdi: { nivel:4.65, variacion:0.02, fecha:"2026-07-05" },
    pilar: { nivel:4.61, variacion:0.07, fecha:"2026-07-05" },
    puerto_tigre: { nivel:6.90, variacion:-0.02, fecha:"2026-07-05" },
    salto_guaira: { nivel:6.90, variacion:0.10, fecha:"2026-07-05" },
    cerrito: { nivel:2.80, variacion:0.10, fecha:"2026-07-05" },
    ita_piru: { nivel:5.36, variacion:0.14, fecha:"2026-07-05" },
    paso_patria: { nivel:4.65, variacion:0.10, fecha:"2026-07-05" },
    ayolas: { nivel:2.55, variacion:-0.30, fecha:"2026-07-05" },
    panchito_lopez: { nivel:3.60, variacion:0.02, fecha:"2026-07-05" },
    coratei: { nivel:2.50, variacion:-0.20, fecha:"2026-07-05" },
    ita_cora: { nivel:4.45, variacion:0.20, fecha:"2026-07-05" },
    san_cosme: { nivel:9.85, variacion:-0.10, fecha:"2026-07-05" },
    encarnacion: { nivel:10.25, variacion:0.04, fecha:"2026-07-05" },
    pozo_hondo: { nivel:3.08, variacion:0.02, fecha:"2026-07-05" },
    estacion_arirai: { nivel:4.89, variacion:0.00, fecha:"2026-07-05" }
  }
},
{
  fecha: "2026-07-06",
  estaciones: {
    puerto_ladario: { nivel:2.54, variacion:0.01, fecha:"2026-07-06" },
    puerto_murtinho: { nivel:3.29, variacion:-0.02, fecha:"2026-07-06" },
    caceres: { nivel:1.50, variacion:-0.06, fecha:"2026-07-06" },
    cde: { nivel:13.74, variacion:-1.24, fecha:"2026-07-06" },
    isla_margarita: { nivel:3.31, variacion:-0.01, fecha:"2026-07-06" },
    fuerte_olimpo: { nivel:4.23, variacion:-0.01, fecha:"2026-07-06" },
    bahia_negra: { nivel:4.22, variacion:0.00, fecha:"2026-07-06" },
    vallemi: { nivel:3.13, variacion:-0.01, fecha:"2026-07-06" },
    concepcion: { nivel:2.48, variacion:-0.01, fecha:"2026-07-06" },
    rosario: { nivel:2.41, variacion:-0.01, fecha:"2026-07-06" },
    puerto_antequera: { nivel:2.21, variacion:-0.02, fecha:"2026-07-06" },
    villeta: { nivel:2.98, variacion:-0.03, fecha:"2026-07-06" },
    asuncion: { nivel:2.49, variacion:-0.02, fecha:"2026-07-06" },
    ita_enramada: { nivel:2.95, variacion:-0.03, fecha:"2026-07-06" },
    humaita: { nivel:4.02, variacion:0.08, fecha:"2026-07-06" },
    alberdi: { nivel:4.67, variacion:0.02, fecha:"2026-07-06" },
    pilar: { nivel:4.66, variacion:0.05, fecha:"2026-07-06" },
    puerto_tigre: { nivel:6.93, variacion:0.03, fecha:"2026-07-06" },
    salto_guaira: { nivel:6.96, variacion:0.06, fecha:"2026-07-06" },
    cerrito: { nivel:2.65, variacion:-0.15, fecha:"2026-07-06" },
    ita_piru: { nivel:5.40, variacion:0.04, fecha:"2026-07-06" },
    paso_patria: { nivel:4.70, variacion:0.05, fecha:"2026-07-06" },
    ayolas: { nivel:2.30, variacion:-0.25, fecha:"2026-07-06" },
    panchito_lopez: { nivel:3.58, variacion:-0.02, fecha:"2026-07-06" },
    coratei: { nivel:2.35, variacion:-0.15, fecha:"2026-07-06" },
    ita_cora: { nivel:4.49, variacion:0.04, fecha:"2026-07-06" },
    san_cosme: { nivel:9.82, variacion:-0.03, fecha:"2026-07-06" },
    encarnacion: { nivel:10.29, variacion:0.04, fecha:"2026-07-06" },
    pozo_hondo: { nivel:3.08, variacion:0.00, fecha:"2026-07-05" },
    estacion_arirai: { nivel:4.91, variacion:0.02, fecha:"2026-07-06" },
  }
},
{
  fecha: "2026-07-07",
  estaciones: {
    puerto_ladario: { nivel:2.54, variacion:0.00, fecha:"2026-07-06" },
    puerto_murtinho: { nivel:3.29, variacion:0.00, fecha:"2026-07-06" },
    caceres: { nivel:1.50, variacion:0.00, fecha:"2026-07-06" },
    cde: { nivel:13.74, variacion:0.00, fecha:"2026-07-06" },
    isla_margarita: { nivel:3.29, variacion:-0.02, fecha:"2026-07-07" },
    fuerte_olimpo: { nivel:4.21, variacion:-0.02, fecha:"2026-07-07" },
    bahia_negra: { nivel:4.23, variacion:0.01, fecha:"2026-07-07" },
    vallemi: { nivel:3.12, variacion:-0.01, fecha:"2026-07-07" },
    concepcion: { nivel:2.46, variacion:-0.02, fecha:"2026-07-07" },
    rosario: { nivel:2.41, variacion:0.00, fecha:"2026-07-07" },
    puerto_antequera: { nivel:2.18, variacion:-0.03, fecha:"2026-07-07" },
    villeta: { nivel:2.97, variacion:-0.01, fecha:"2026-07-07" },
    asuncion: { nivel:2.47, variacion:-0.02, fecha:"2026-07-07" },
    ita_enramada: { nivel:2.92, variacion:-0.03, fecha:"2026-07-07" },
    humaita: { nivel:4.05, variacion:0.03, fecha:"2026-07-07" },
    alberdi: { nivel:4.69, variacion:0.02, fecha:"2026-07-07" },
    pilar: { nivel:4.69, variacion:0.03, fecha:"2026-07-07" },
    puerto_tigre: { nivel:6.96, variacion:0.03, fecha:"2026-07-07" },
    salto_guaira: { nivel:6.95, variacion:-0.01, fecha:"2026-07-07" },
    cerrito: { nivel:2.55, variacion:-0.10, fecha:"2026-07-07" },
    ita_piru: { nivel:5.38, variacion:-0.02, fecha:"2026-07-07" },
    paso_patria: { nivel:4.65, variacion:-0.05, fecha:"2026-07-07" },
    ayolas: { nivel:2.00, variacion:-0.30, fecha:"2026-07-07" },
    panchito_lopez: { nivel:3.55, variacion:-0.03, fecha:"2026-07-07" },
    coratei: { nivel:2.10, variacion:-0.25, fecha:"2026-07-07" },
    ita_cora: { nivel:4.40, variacion:-0.09, fecha:"2026-07-07" },
    san_cosme: { nivel:9.82, variacion:0.00, fecha:"2026-07-07" },
    encarnacion: { nivel:10.25, variacion:-0.04, fecha:"2026-07-07" },
    pozo_hondo: { nivel:3.10, variacion:0.02, fecha:"2026-07-07" },
    estacion_arirai: { nivel:4.91, variacion:0.00, fecha:"2026-07-07" },
  }
},
{
  fecha: "2026-07-08",
  estaciones: {
    puerto_ladario: { nivel:2.54, variacion:0.00, fecha:"2026-07-06" },
    puerto_murtinho: { nivel:3.29, variacion:0.00, fecha:"2026-07-06" },
    caceres: { nivel:1.50, variacion:0.00, fecha:"2026-07-06" },
    cde: { nivel:13.74, variacion:0.00, fecha:"2026-07-06" },
    isla_margarita: { nivel:3.30, variacion:0.01, fecha:"2026-07-08" },
    fuerte_olimpo: { nivel:4.21, variacion:0.00, fecha:"2026-07-08" },
    bahia_negra: { nivel:4.24, variacion:0.01, fecha:"2026-07-08" },
    vallemi: { nivel:3.12, variacion:0.00, fecha:"2026-07-08" },
    concepcion: { nivel:2.43, variacion:-0.03, fecha:"2026-07-08" },
    rosario: { nivel:2.36, variacion:-0.05, fecha:"2026-07-08" },
    puerto_antequera: { nivel:2.15, variacion:-0.03, fecha:"2026-07-08" },
    villeta: { nivel:2.95, variacion:-0.02, fecha:"2026-07-08" },
    asuncion: { nivel:2.43, variacion:-0.04, fecha:"2026-07-08" },
    ita_enramada: { nivel:2.89, variacion:-0.03, fecha:"2026-07-08" },
    humaita: { nivel:4.02, variacion:-0.03, fecha:"2026-07-08" },
    alberdi: { nivel:4.71, variacion:0.02, fecha:"2026-07-08" },
    pilar: { nivel:4.68, variacion:-0.01, fecha:"2026-07-08" },
    puerto_tigre: { nivel:6.96, variacion:0.00, fecha:"2026-07-08" },
    salto_guaira: { nivel:6.85, variacion:-0.10, fecha:"2026-07-08" },
    cerrito: { nivel:2.40, variacion:-0.15, fecha:"2026-07-08" },
    ita_piru: { nivel:5.30, variacion:-0.08, fecha:"2026-07-08" },
    paso_patria: { nivel:4.60, variacion:-0.05, fecha:"2026-07-08" },
    ayolas: { nivel:1.85, variacion:-0.15, fecha:"2026-07-08" },
    panchito_lopez: { nivel:3.40, variacion:-0.15, fecha:"2026-07-08" },
    coratei: { nivel:2.00, variacion:-0.10, fecha:"2026-07-08" },
    ita_cora: { nivel:4.20, variacion:-0.20, fecha:"2026-07-08" },
    san_cosme: { nivel:9.80, variacion:-0.02, fecha:"2026-07-08" },
    encarnacion: { nivel:10.22, variacion:-0.03, fecha:"2026-07-08" },
    pozo_hondo: { nivel:3.18, variacion:0.08, fecha:"2026-07-08" },
    estacion_arirai: { nivel:4.91, variacion:0.00, fecha:"2026-07-08" },
  }

},
{
  fecha: "2026-07-09",
  estaciones: {
    puerto_ladario: { nivel:2.54, variacion:0.00, fecha:"2026-07-08" },
    puerto_murtinho: { nivel:3.31, variacion:0.02, fecha:"2026-07-08" },
    caceres: { nivel:1.43, variacion:-0.07, fecha:"2026-07-08" },
    isla_margarita: { nivel:3.30, variacion:0.00, fecha:"2026-07-09" },
    fuerte_olimpo: { nivel:4.21, variacion:0.00, fecha:"2026-07-09" },
    bahia_negra: { nivel:4.24, variacion:0.00, fecha:"2026-07-09" },
    vallemi: { nivel:3.12, variacion:0.00, fecha:"2026-07-09" },
    concepcion: { nivel:2.43, variacion:0.00, fecha:"2026-07-09" },
    rosario: { nivel:2.31, variacion:-0.05, fecha:"2026-07-09" },
    puerto_antequera: { nivel:2.12, variacion:-0.03, fecha:"2026-07-09" },
    villeta: { nivel:2.91, variacion:-0.04, fecha:"2026-07-09" },
    asuncion: { nivel:2.40, variacion:-0.03, fecha:"2026-07-09" },
    ita_enramada: { nivel:2.86, variacion:-0.03, fecha:"2026-07-09" },
    humaita: { nivel:3.97, variacion:-0.05, fecha:"2026-07-09" },
    alberdi: { nivel:4.69, variacion:-0.02, fecha:"2026-07-09" },
    pilar: { nivel:4.66, variacion:-0.02, fecha:"2026-07-09" },
    puerto_tigre: { nivel:6.90, variacion:-0.06, fecha:"2026-07-09" },
    salto_guaira: { nivel:6.86, variacion:0.01, fecha:"2026-07-09" },
    cde: { nivel:13.77, variacion:0.03, fecha:"2026-07-08" },
    cerrito: { nivel:2.25, variacion:-0.15, fecha:"2026-07-09" },
    ita_piru: { nivel:5.16, variacion:-0.14, fecha:"2026-07-09" },
    paso_patria: { nivel:4.50, variacion:-0.10, fecha:"2026-07-09" },
    ayolas: { nivel:2.10, variacion:0.25, fecha:"2026-07-09" },
    panchito_lopez: { nivel:3.35, variacion:-0.05, fecha:"2026-07-09" },
    coratei: { nivel:2.00, variacion:0.00, fecha:"2026-07-09" },
    ita_cora: { nivel:4.10, variacion:-0.10, fecha:"2026-07-09" },
    san_cosme: { nivel:9.85, variacion:0.05, fecha:"2026-07-09" },
    encarnacion: { nivel:10.22, variacion:-0.03, fecha:"2026-07-08" },
    pozo_hondo: { nivel:3.08, variacion:-0.10, fecha:"2026-07-09" },
    estacion_arirai: { nivel:4.91, variacion:0.00, fecha:"2026-07-08" }
  }
},
{
  fecha: "2026-07-10",
  estaciones: {
    puerto_ladario: { nivel:2.54, variacion:0.00, fecha:"2026-07-10" },
    puerto_murtinho: { nivel:3.31, variacion:0.00, fecha:"2026-07-10" },
    caceres: { nivel:1.41, variacion:-0.01, fecha:"2026-07-10" },
    isla_margarita: { nivel:3.31, variacion:0.01, fecha:"2026-07-10" },
    fuerte_olimpo: { nivel:4.21, variacion:0.00, fecha:"2026-07-10" },
    bahia_negra: { nivel:4.24, variacion:0.00, fecha:"2026-07-10" },
    vallemi: { nivel:3.12, variacion:0.00, fecha:"2026-07-10" },
    concepcion: { nivel:2.41, variacion:-0.02, fecha:"2026-07-10" },
    rosario: { nivel:2.25, variacion:-0.06, fecha:"2026-07-10" },
    puerto_antequera: { nivel:2.10, variacion:-0.02, fecha:"2026-07-10" },
    villeta: { nivel:2.88, variacion:-0.03, fecha:"2026-07-10" },
    asuncion: { nivel:2.35, variacion:-0.05, fecha:"2026-07-10" },
    ita_enramada: { nivel:2.83, variacion:-0.03, fecha:"2026-07-10" },
    humaita: { nivel:3.88, variacion:-0.09, fecha:"2026-07-10" },
    alberdi: { nivel:4.67, variacion:-0.02, fecha:"2026-07-10" },
    pilar: { nivel:4.64, variacion:-0.02, fecha:"2026-07-10" },
    puerto_tigre: { nivel:6.91, variacion:0.01, fecha:"2026-07-10" },
    salto_guaira: { nivel:6.87, variacion:0.01, fecha:"2026-07-10" },
    cde: { nivel:12.39, variacion:-1.38, fecha:"2026-07-09" },
    cerrito: { nivel:2.20, variacion:-0.05, fecha:"2026-07-10" },
    ita_piru: { nivel:5.00, variacion:-0.16, fecha:"2026-07-10" },
    paso_patria: { nivel:4.40, variacion:-0.10, fecha:"2026-07-10" },
    ayolas: { nivel:2.00, variacion:-0.10, fecha:"2026-07-10" },
    panchito_lopez: { nivel:3.30, variacion:-0.05, fecha:"2026-07-10" },
    coratei: { nivel:2.00, variacion:0.00, fecha:"2026-07-10" },
    ita_cora: { nivel:4.00, variacion:-0.10, fecha:"2026-07-10" },
    san_cosme: { nivel:9.80, variacion:-0.05, fecha:"2026-07-10" },
    encarnacion: { nivel:10.16, variacion:-0.06, fecha:"2026-07-09" },
    pozo_hondo: { nivel:3.08, variacion:0.00, fecha:"2026-07-10" },
    estacion_arirai: { nivel:4.91, variacion:0.00, fecha:"2026-07-10" }
  }
}
,
{
  fecha: "2026-07-11",
  estaciones: {
    puerto_ladario: { nivel:2.54, variacion:0.00, fecha:"2026-07-11" },
    puerto_murtinho: { nivel:3.30, variacion:-0.01, fecha:"2026-07-11" },
    caceres: { nivel:1.39, variacion:-0.02, fecha:"2026-07-11" },
    isla_margarita: { nivel:3.31, variacion:0.00, fecha:"2026-07-11" },
    fuerte_olimpo: { nivel:4.21, variacion:0.00, fecha:"2026-07-11" },
    bahia_negra: { nivel:4.24, variacion:0.00, fecha:"2026-07-11" },
    vallemi: { nivel:3.12, variacion:0.00, fecha:"2026-07-11" },
    concepcion: { nivel:2.41, variacion:0.00, fecha:"2026-07-11" },
    rosario: { nivel:2.25, variacion:0.00, fecha:"2026-07-11" },
    puerto_antequera: { nivel:2.10, variacion:0.00, fecha:"2026-07-11" },
    villeta: { nivel:2.85, variacion:-0.03, fecha:"2026-07-11" },
    asuncion: { nivel:2.32, variacion:-0.03, fecha:"2026-07-11" },
    ita_enramada: { nivel:2.80, variacion:-0.03, fecha:"2026-07-11" },
    humaita: { nivel:3.82, variacion:-0.06, fecha:"2026-07-11" },
    alberdi: { nivel:4.65, variacion:-0.02, fecha:"2026-07-11" },
    pilar: { nivel:4.62, variacion:-0.02, fecha:"2026-07-11" },
    puerto_tigre: { nivel:6.92, variacion:0.01, fecha:"2026-07-11" },
    salto_guaira: { nivel:6.85, variacion:-0.02, fecha:"2026-07-11" },
    cde: { nivel:12.39, variacion:-1.38, fecha:"2026-07-09" },
    cerrito: { nivel:2.20, variacion:0.00, fecha:"2026-07-11" },
    ita_piru: { nivel:5.02, variacion:0.02, fecha:"2026-07-11" },
    paso_patria: { nivel:4.40, variacion:0.00, fecha:"2026-07-11" },
    ayolas: { nivel:2.00, variacion:0.00, fecha:"2026-07-11" },
    panchito_lopez: { nivel:3.25, variacion:-0.05, fecha:"2026-07-11" },
    coratei: { nivel:2.00, variacion:0.00, fecha:"2026-07-11" },
    ita_cora: { nivel:3.85, variacion:-0.15, fecha:"2026-07-11" },
    san_cosme: { nivel:9.90, variacion:0.10, fecha:"2026-07-11" },
    encarnacion: { nivel:10.16, variacion:-0.06, fecha:"2026-07-09" },
    pozo_hondo: { nivel:3.03, variacion:-0.05, fecha:"2026-07-11" },
    estacion_arirai: { nivel:4.91, variacion:0.00, fecha:"2026-07-10" }
  }
},
{
  fecha: "2026-07-12",
  estaciones: {
    puerto_ladario: { nivel:2.54, variacion:0.00, fecha:"2026-07-12" },
    puerto_murtinho: { nivel:3.31, variacion:0.01, fecha:"2026-07-12" },
    caceres: { nivel:1.37, variacion:-0.02, fecha:"2026-07-12" },
    isla_margarita: { nivel:3.30, variacion:-0.01, fecha:"2026-07-12" },
    fuerte_olimpo: { nivel:4.21, variacion:0.00, fecha:"2026-07-12" },
    bahia_negra: { nivel:4.23, variacion:-0.01, fecha:"2026-07-12" },
    vallemi: { nivel:3.14, variacion:0.02, fecha:"2026-07-12" },
    concepcion: { nivel:2.40, variacion:-0.01, fecha:"2026-07-12" },
    rosario: { nivel:2.20, variacion:-0.05, fecha:"2026-07-12" },
    puerto_antequera: { nivel:2.07, variacion:-0.03, fecha:"2026-07-12" },
    villeta: { nivel:2.81, variacion:-0.04, fecha:"2026-07-12" },
    asuncion: { nivel:2.29, variacion:-0.03, fecha:"2026-07-12" },
    ita_enramada: { nivel:2.77, variacion:-0.03, fecha:"2026-07-12" },
    humaita: { nivel:3.81, variacion:-0.01, fecha:"2026-07-12" },
    alberdi: { nivel:4.63, variacion:-0.02, fecha:"2026-07-12" },
    pilar: { nivel:4.58, variacion:-0.04, fecha:"2026-07-12" },
    puerto_tigre: { nivel:6.95, variacion:0.03, fecha:"2026-07-12" },
    salto_guaira: { nivel:6.92, variacion:0.07, fecha:"2026-07-12" },
    cde: { nivel:12.04, variacion:1.54, fecha:"2026-07-12" },
    cerrito: { nivel:2.05, variacion:-0.15, fecha:"2026-07-12" },
    ita_piru: { nivel:4.98, variacion:-0.04, fecha:"2026-07-12" },
    paso_patria: { nivel:4.35, variacion:-0.05, fecha:"2026-07-12" },
    ayolas: { nivel:1.40, variacion:-0.60, fecha:"2026-07-12" },
    panchito_lopez: { nivel:3.20, variacion:-0.05, fecha:"2026-07-12" },
    coratei: { nivel:1.90, variacion:-0.10, fecha:"2026-07-12" },
    ita_cora: { nivel:3.80, variacion:-0.05, fecha:"2026-07-12" },
    san_cosme: { nivel:9.95, variacion:0.05, fecha:"2026-07-12" },
    encarnacion: { nivel:10.00, variacion:0.01, fecha:"2026-07-12" },
    pozo_hondo: { nivel:3.03, variacion:0.00, fecha:"2026-07-12" },
    estacion_arirai: { nivel:4.91, variacion:0.00, fecha:"2026-07-12" }
  }
}
,
{
  fecha: "2026-07-13",
  estaciones: {
    puerto_ladario: { nivel:2.55, variacion:0.01, fecha:"2026-07-13" },
    puerto_murtinho: { nivel:3.30, variacion:-0.01, fecha:"2026-07-13" },
    caceres: { nivel:1.34, variacion:-0.03, fecha:"2026-07-13" },
    isla_margarita: { nivel:3.31, variacion:0.01, fecha:"2026-07-13" },
    fuerte_olimpo: { nivel:4.22, variacion:0.01, fecha:"2026-07-13" },
    bahia_negra: { nivel:4.23, variacion:0.00, fecha:"2026-07-13" },
    vallemi: { nivel:3.12, variacion:-0.02, fecha:"2026-07-13" },
    concepcion: { nivel:2.39, variacion:-0.01, fecha:"2026-07-13" },
    rosario: { nivel:2.15, variacion:-0.05, fecha:"2026-07-13" },
    puerto_antequera: { nivel:2.05, variacion:-0.02, fecha:"2026-07-13" },
    villeta: { nivel:2.77, variacion:-0.04, fecha:"2026-07-13" },
    asuncion: { nivel:2.25, variacion:-0.04, fecha:"2026-07-13" },
    ita_enramada: { nivel:2.73, variacion:-0.04, fecha:"2026-07-13" },
    humaita: { nivel:3.71, variacion:-0.10, fecha:"2026-07-13" },
    alberdi: { nivel:4.59, variacion:-0.04, fecha:"2026-07-13" },
    pilar: { nivel:4.54, variacion:-0.04, fecha:"2026-07-13" },
    puerto_tigre: { nivel:6.94, variacion:-0.01, fecha:"2026-07-13" },
    salto_guaira: { nivel:6.91, variacion:-0.01, fecha:"2026-07-13" },
    cde: { nivel:12.04, variacion:-0.26, fecha:"2026-07-12", observacion:"Último dato disponible publicado para la estación: 12/07/2026." },
    cerrito: { nivel:1.70, variacion:-0.35, fecha:"2026-07-13" },
    ita_piru: { nivel:4.78, variacion:-0.20, fecha:"2026-07-13" },
    paso_patria: { nivel:4.15, variacion:-0.20, fecha:"2026-07-13" },
    ayolas: { nivel:1.30, variacion:-0.10, fecha:"2026-07-13" },
    panchito_lopez: { nivel:3.10, variacion:-0.10, fecha:"2026-07-13" },
    coratei: { nivel:1.70, variacion:-0.20, fecha:"2026-07-13" },
    ita_cora: { nivel:3.60, variacion:-0.20, fecha:"2026-07-13" },
    san_cosme: { nivel:9.90, variacion:-0.05, fecha:"2026-07-13" },
    encarnacion: { nivel:10.10, variacion:0.10, fecha:"2026-07-13" },
    pozo_hondo: { nivel:3.05, variacion:0.02, fecha:"2026-07-13" },
    estacion_arirai: { nivel:4.92, variacion:0.01, fecha:"2026-07-13" }
  }
},
{
  fecha: "2026-07-14",
  estaciones: {
    puerto_ladario: { nivel:2.55, variacion:0.00, fecha:"2026-07-14" },
    puerto_murtinho: { nivel:3.31, variacion:0.01, fecha:"2026-07-14" },
    caceres: { nivel:1.34, variacion:0.00, fecha:"2026-07-14" },
    isla_margarita: { nivel:3.30, variacion:-0.01, fecha:"2026-07-14" },
    fuerte_olimpo: { nivel:4.22, variacion:0.00, fecha:"2026-07-14" },
    bahia_negra: { nivel:4.23, variacion:0.00, fecha:"2026-07-14" },
    vallemi: { nivel:3.12, variacion:0.00, fecha:"2026-07-14" },
    concepcion: { nivel:2.37, variacion:-0.02, fecha:"2026-07-14" },
    rosario: { nivel:2.11, variacion:-0.04, fecha:"2026-07-14" },
    puerto_antequera: { nivel:2.00, variacion:-0.05, fecha:"2026-07-14" },
    villeta: { nivel:2.71, variacion:-0.06, fecha:"2026-07-14" },
    asuncion: { nivel:2.19, variacion:-0.06, fecha:"2026-07-14" },
    ita_enramada: { nivel:2.69, variacion:-0.04, fecha:"2026-07-14" },
    humaita: { nivel:3.56, variacion:-0.15, fecha:"2026-07-14" },
    alberdi: { nivel:4.55, variacion:-0.04, fecha:"2026-07-14" },
    pilar: { nivel:4.46, variacion:-0.08, fecha:"2026-07-14" },
    puerto_tigre: { nivel:6.92, variacion:-0.02, fecha:"2026-07-14" },
    salto_guaira: { nivel:6.85, variacion:-0.06, fecha:"2026-07-14" },
    cde: { nivel:12.84, variacion:0.80, fecha:"2026-07-13", observacion:"Último dato disponible publicado para la estación: 13/07/2026." },
    cerrito: { nivel:1.30, variacion:-0.40, fecha:"2026-07-14" },
    ita_piru: { nivel:4.50, variacion:-0.28, fecha:"2026-07-14" },
    paso_patria: { nivel:3.95, variacion:-0.20, fecha:"2026-07-14" },
    ayolas: { nivel:1.30, variacion:0.00, fecha:"2026-07-14" },
    panchito_lopez: { nivel:3.01, variacion:-0.09, fecha:"2026-07-14" },
    coratei: { nivel:1.50, variacion:-0.20, fecha:"2026-07-14" },
    ita_cora: { nivel:3.20, variacion:-0.40, fecha:"2026-07-14" },
    san_cosme: { nivel:9.90, variacion:0.00, fecha:"2026-07-14" },
    encarnacion: { nivel:10.06, variacion:-0.04, fecha:"2026-07-14" },
    pozo_hondo: { nivel:3.05, variacion:0.00, fecha:"2026-07-14" },
    estacion_arirai: { nivel:4.92, variacion:0.01, fecha:"2026-07-13", observacion:"Último dato disponible publicado para la estación: 13/07/2026." }
  }
}


];
/* Datos históricos adicionales incorporados desde las capturas DMH/DINAC compartidas: páginas 2 de las estaciones, principalmente 06–23/06/2026.
   Estos registros enriquecen el módulo Historial y alimentan también el Centro Operativo. */
const EXTRA_SEEDS = [
{
  fecha: "2026-06-06",
  estaciones: {
    caceres: { nivel:1.74, variacion:0.00, fecha:"2026-06-06" },
    cde: { nivel:9.21, variacion:0.00, fecha:"2026-06-06" },
    puerto_ladario: { nivel:2.38, variacion:0.00, fecha:"2026-06-06" },
    puerto_murtinho: { nivel:3.45, variacion:0.00, fecha:"2026-06-06" }
  }
},
{
  fecha: "2026-06-07",
  estaciones: {
    caceres: { nivel:1.70, variacion:-0.04, fecha:"2026-06-07" },
    cde: { nivel:8.32, variacion:-0.89, fecha:"2026-06-07" },
    puerto_ladario: { nivel:2.38, variacion:0.00, fecha:"2026-06-07" },
    puerto_murtinho: { nivel:3.44, variacion:-0.01, fecha:"2026-06-07" }
  }
},
{
  fecha: "2026-06-08",
  estaciones: {
    caceres: { nivel:1.66, variacion:-0.04, fecha:"2026-06-08" },
    cde: { nivel:8.56, variacion:0.24, fecha:"2026-06-08" },
    puerto_ladario: { nivel:2.39, variacion:0.01, fecha:"2026-06-08" },
    puerto_murtinho: { nivel:3.43, variacion:-0.01, fecha:"2026-06-08" },
    puerto_tigre: { nivel:6.20, variacion:0.00, fecha:"2026-06-08" },
    salto_guaira: { nivel:6.13, variacion:0.00, fecha:"2026-06-08" }
  }
},
{
  fecha: "2026-06-09",
  estaciones: {
    asuncion: { nivel:2.77, variacion:0.00, fecha:"2026-06-09" },
    ayolas: { nivel:0.50, variacion:0.00, fecha:"2026-06-09" },
    bahia_negra: { nivel:4.15, variacion:0.00, fecha:"2026-06-09" },
    cerrito: { nivel:0.40, variacion:0.00, fecha:"2026-06-09" },
    concepcion: { nivel:2.80, variacion:0.00, fecha:"2026-06-09" },
    coratei: { nivel:0.35, variacion:0.00, fecha:"2026-06-09" },
    encarnacion: { nivel:10.07, variacion:0.00, fecha:"2026-06-09" },
    estacion_arirai: { nivel:4.84, variacion:0.00, fecha:"2026-06-09" },
    fuerte_olimpo: { nivel:4.29, variacion:0.00, fecha:"2026-06-09" },
    isla_margarita: { nivel:3.43, variacion:0.00, fecha:"2026-06-09" },
    ita_cora: { nivel:1.90, variacion:0.00, fecha:"2026-06-09" },
    ita_enramada: { nivel:3.25, variacion:0.00, fecha:"2026-06-09" },
    ita_piru: { nivel:3.32, variacion:0.00, fecha:"2026-06-09" },
    panchito_lopez: { nivel:2.45, variacion:0.00, fecha:"2026-06-09" },
    paso_patria: { nivel:3.22, variacion:0.00, fecha:"2026-06-09" },
    pozo_hondo: { nivel:3.00, variacion:0.00, fecha:"2026-06-09" },
    puerto_antequera: { nivel:2.59, variacion:0.00, fecha:"2026-06-09" },
    rosario: { nivel:2.73, variacion:0.00, fecha:"2026-06-09" },
    san_cosme: { nivel:9.80, variacion:0.00, fecha:"2026-06-09" },
    vallemi: { nivel:3.26, variacion:0.00, fecha:"2026-06-09" },
    villeta: { nivel:3.24, variacion:0.00, fecha:"2026-06-09" }
  }
},
{
  fecha: "2026-06-10",
  estaciones: {
    asuncion: { nivel:2.73, variacion:-0.04, fecha:"2026-06-10" },
    ayolas: { nivel:0.85, variacion:0.35, fecha:"2026-06-10" },
    bahia_negra: { nivel:4.15, variacion:0.00, fecha:"2026-06-10" },
    caceres: { nivel:1.59, variacion:-0.07, fecha:"2026-06-10" },
    cde: { nivel:9.84, variacion:1.28, fecha:"2026-06-10" },
    cerrito: { nivel:0.38, variacion:-0.02, fecha:"2026-06-10" },
    concepcion: { nivel:2.76, variacion:-0.04, fecha:"2026-06-10" },
    coratei: { nivel:0.80, variacion:0.45, fecha:"2026-06-10" },
    encarnacion: { nivel:10.05, variacion:-0.02, fecha:"2026-06-10" },
    estacion_arirai: { nivel:4.85, variacion:0.01, fecha:"2026-06-10" },
    fuerte_olimpo: { nivel:4.37, variacion:0.08, fecha:"2026-06-10" },
    isla_margarita: { nivel:3.42, variacion:-0.01, fecha:"2026-06-10" },
    ita_cora: { nivel:1.90, variacion:0.00, fecha:"2026-06-10" },
    ita_enramada: { nivel:3.22, variacion:-0.03, fecha:"2026-06-10" },
    ita_piru: { nivel:3.08, variacion:-0.24, fecha:"2026-06-10" },
    panchito_lopez: { nivel:2.50, variacion:0.05, fecha:"2026-06-10" },
    paso_patria: { nivel:3.00, variacion:-0.22, fecha:"2026-06-10" },
    pozo_hondo: { nivel:3.03, variacion:0.03, fecha:"2026-06-10" },
    puerto_antequera: { nivel:2.55, variacion:-0.04, fecha:"2026-06-10" },
    puerto_ladario: { nivel:2.42, variacion:0.03, fecha:"2026-06-10" },
    puerto_murtinho: { nivel:3.41, variacion:-0.02, fecha:"2026-06-10" },
    puerto_tigre: { nivel:6.02, variacion:-0.18, fecha:"2026-06-10" },
    rosario: { nivel:2.70, variacion:-0.03, fecha:"2026-06-10" },
    salto_guaira: { nivel:5.90, variacion:-0.23, fecha:"2026-06-10" },
    san_cosme: { nivel:9.77, variacion:-0.03, fecha:"2026-06-10" },
    vallemi: { nivel:3.25, variacion:-0.01, fecha:"2026-06-10" },
    villeta: { nivel:3.21, variacion:-0.03, fecha:"2026-06-10" }
  }
},
{
  fecha: "2026-06-11",
  estaciones: {
    asuncion: { nivel:2.70, variacion:-0.03, fecha:"2026-06-11" },
    ayolas: { nivel:1.00, variacion:0.15, fecha:"2026-06-11" },
    bahia_negra: { nivel:4.15, variacion:0.00, fecha:"2026-06-11" },
    caceres: { nivel:1.56, variacion:-0.03, fecha:"2026-06-11" },
    cde: { nivel:10.45, variacion:0.61, fecha:"2026-06-11" },
    cerrito: { nivel:0.50, variacion:0.12, fecha:"2026-06-11" },
    concepcion: { nivel:2.75, variacion:-0.01, fecha:"2026-06-11" },
    coratei: { nivel:0.95, variacion:0.15, fecha:"2026-06-11" },
    encarnacion: { nivel:10.03, variacion:-0.02, fecha:"2026-06-11" },
    estacion_arirai: { nivel:4.85, variacion:0.00, fecha:"2026-06-11" },
    fuerte_olimpo: { nivel:4.36, variacion:-0.01, fecha:"2026-06-11" },
    isla_margarita: { nivel:3.41, variacion:-0.01, fecha:"2026-06-11" },
    ita_cora: { nivel:1.95, variacion:0.05, fecha:"2026-06-11" },
    ita_enramada: { nivel:3.19, variacion:-0.03, fecha:"2026-06-11" },
    ita_piru: { nivel:3.14, variacion:0.06, fecha:"2026-06-11" },
    panchito_lopez: { nivel:2.60, variacion:0.10, fecha:"2026-06-11" },
    paso_patria: { nivel:3.10, variacion:0.10, fecha:"2026-06-11" },
    pozo_hondo: { nivel:3.02, variacion:-0.01, fecha:"2026-06-11" },
    puerto_antequera: { nivel:2.52, variacion:-0.03, fecha:"2026-06-11" },
    puerto_ladario: { nivel:2.40, variacion:-0.02, fecha:"2026-06-11" },
    puerto_murtinho: { nivel:3.41, variacion:0.00, fecha:"2026-06-11" },
    puerto_tigre: { nivel:5.94, variacion:-0.08, fecha:"2026-06-11" },
    rosario: { nivel:2.67, variacion:-0.03, fecha:"2026-06-11" },
    salto_guaira: { nivel:5.84, variacion:-0.06, fecha:"2026-06-11" },
    san_cosme: { nivel:9.75, variacion:-0.02, fecha:"2026-06-11" },
    vallemi: { nivel:3.24, variacion:-0.01, fecha:"2026-06-11" },
    villeta: { nivel:3.20, variacion:-0.01, fecha:"2026-06-11" }
  }
},
{
  fecha: "2026-06-12",
  estaciones: {
    asuncion: { nivel:2.66, variacion:-0.04, fecha:"2026-06-12" },
    ayolas: { nivel:0.30, variacion:-0.70, fecha:"2026-06-12" },
    bahia_negra: { nivel:4.16, variacion:0.01, fecha:"2026-06-12" },
    caceres: { nivel:1.54, variacion:-0.02, fecha:"2026-06-12" },
    cde: { nivel:9.92, variacion:-0.53, fecha:"2026-06-12" },
    cerrito: { nivel:0.80, variacion:0.30, fecha:"2026-06-12" },
    concepcion: { nivel:2.78, variacion:0.03, fecha:"2026-06-12" },
    coratei: { nivel:1.00, variacion:0.05, fecha:"2026-06-12" },
    encarnacion: { nivel:10.13, variacion:0.10, fecha:"2026-06-12" },
    estacion_arirai: { nivel:4.85, variacion:0.00, fecha:"2026-06-12" },
    fuerte_olimpo: { nivel:4.35, variacion:-0.01, fecha:"2026-06-12" },
    isla_margarita: { nivel:3.41, variacion:0.00, fecha:"2026-06-12" },
    ita_cora: { nivel:2.05, variacion:0.10, fecha:"2026-06-12" },
    ita_enramada: { nivel:3.15, variacion:-0.04, fecha:"2026-06-12" },
    ita_piru: { nivel:3.32, variacion:0.18, fecha:"2026-06-12" },
    panchito_lopez: { nivel:2.70, variacion:0.10, fecha:"2026-06-12" },
    paso_patria: { nivel:3.25, variacion:0.15, fecha:"2026-06-12" },
    pozo_hondo: { nivel:3.01, variacion:-0.01, fecha:"2026-06-12" },
    puerto_antequera: { nivel:2.49, variacion:-0.03, fecha:"2026-06-12" },
    puerto_ladario: { nivel:2.42, variacion:0.02, fecha:"2026-06-12" },
    puerto_murtinho: { nivel:3.41, variacion:0.00, fecha:"2026-06-12" },
    puerto_tigre: { nivel:5.82, variacion:-0.12, fecha:"2026-06-12" },
    rosario: { nivel:2.64, variacion:-0.03, fecha:"2026-06-12" },
    salto_guaira: { nivel:5.74, variacion:-0.10, fecha:"2026-06-12" },
    san_cosme: { nivel:9.80, variacion:0.05, fecha:"2026-06-12" },
    vallemi: { nivel:3.24, variacion:0.00, fecha:"2026-06-12" },
    villeta: { nivel:3.14, variacion:-0.06, fecha:"2026-06-12" }
  }
},
{
  fecha: "2026-06-13",
  estaciones: {
    asuncion: { nivel:2.63, variacion:-0.03, fecha:"2026-06-13" },
    ayolas: { nivel:0.80, variacion:0.50, fecha:"2026-06-13" },
    bahia_negra: { nivel:4.17, variacion:0.01, fecha:"2026-06-13" },
    caceres: { nivel:1.55, variacion:0.01, fecha:"2026-06-13" },
    cde: { nivel:10.67, variacion:0.75, fecha:"2026-06-13" },
    cerrito: { nivel:0.90, variacion:0.10, fecha:"2026-06-13" },
    concepcion: { nivel:2.75, variacion:-0.03, fecha:"2026-06-13" },
    coratei: { nivel:1.05, variacion:0.05, fecha:"2026-06-13" },
    encarnacion: { nivel:10.02, variacion:-0.11, fecha:"2026-06-13" },
    estacion_arirai: { nivel:4.87, variacion:0.02, fecha:"2026-06-13" },
    fuerte_olimpo: { nivel:4.35, variacion:0.00, fecha:"2026-06-13" },
    isla_margarita: { nivel:3.41, variacion:0.00, fecha:"2026-06-13" },
    ita_cora: { nivel:2.20, variacion:0.15, fecha:"2026-06-13" },
    ita_enramada: { nivel:3.11, variacion:-0.04, fecha:"2026-06-13" },
    ita_piru: { nivel:3.54, variacion:0.22, fecha:"2026-06-13" },
    panchito_lopez: { nivel:2.75, variacion:0.05, fecha:"2026-06-13" },
    paso_patria: { nivel:3.45, variacion:0.20, fecha:"2026-06-13" },
    pozo_hondo: { nivel:3.00, variacion:-0.01, fecha:"2026-06-13" },
    puerto_antequera: { nivel:2.46, variacion:-0.03, fecha:"2026-06-13" },
    puerto_ladario: { nivel:2.42, variacion:0.00, fecha:"2026-06-13" },
    puerto_murtinho: { nivel:3.41, variacion:0.00, fecha:"2026-06-13" },
    puerto_tigre: { nivel:5.80, variacion:-0.02, fecha:"2026-06-13" },
    rosario: { nivel:2.62, variacion:-0.02, fecha:"2026-06-13" },
    salto_guaira: { nivel:5.74, variacion:0.00, fecha:"2026-06-13" },
    san_cosme: { nivel:9.78, variacion:-0.02, fecha:"2026-06-13" },
    vallemi: { nivel:3.24, variacion:0.00, fecha:"2026-06-13" },
    villeta: { nivel:3.11, variacion:-0.03, fecha:"2026-06-13" }
  }
},
{
  fecha: "2026-06-14",
  estaciones: {
    asuncion: { nivel:2.60, variacion:-0.03, fecha:"2026-06-14" },
    ayolas: { nivel:1.58, variacion:0.78, fecha:"2026-06-14" },
    bahia_negra: { nivel:4.18, variacion:0.01, fecha:"2026-06-14" },
    caceres: { nivel:1.54, variacion:-0.01, fecha:"2026-06-14" },
    cde: { nivel:9.79, variacion:-0.88, fecha:"2026-06-14" },
    cerrito: { nivel:1.05, variacion:0.15, fecha:"2026-06-14" },
    concepcion: { nivel:2.77, variacion:0.02, fecha:"2026-06-14" },
    coratei: { nivel:1.10, variacion:0.05, fecha:"2026-06-14" },
    encarnacion: { nivel:10.08, variacion:0.06, fecha:"2026-06-14" },
    estacion_arirai: { nivel:4.88, variacion:0.01, fecha:"2026-06-14" },
    fuerte_olimpo: { nivel:4.37, variacion:0.02, fecha:"2026-06-14" },
    isla_margarita: { nivel:3.41, variacion:0.00, fecha:"2026-06-14" },
    ita_cora: { nivel:2.30, variacion:0.10, fecha:"2026-06-14" },
    ita_enramada: { nivel:3.08, variacion:-0.03, fecha:"2026-06-14" },
    ita_piru: { nivel:3.63, variacion:0.09, fecha:"2026-06-14" },
    panchito_lopez: { nivel:2.75, variacion:0.00, fecha:"2026-06-14" },
    paso_patria: { nivel:3.50, variacion:0.05, fecha:"2026-06-14" },
    pozo_hondo: { nivel:3.06, variacion:0.06, fecha:"2026-06-14" },
    puerto_antequera: { nivel:2.42, variacion:-0.04, fecha:"2026-06-14" },
    puerto_ladario: { nivel:2.44, variacion:0.02, fecha:"2026-06-14" },
    puerto_murtinho: { nivel:3.40, variacion:-0.01, fecha:"2026-06-14" },
    puerto_tigre: { nivel:5.74, variacion:-0.06, fecha:"2026-06-14" },
    rosario: { nivel:2.60, variacion:-0.02, fecha:"2026-06-14" },
    salto_guaira: { nivel:5.71, variacion:-0.03, fecha:"2026-06-14" },
    san_cosme: { nivel:9.80, variacion:0.02, fecha:"2026-06-14" },
    vallemi: { nivel:3.25, variacion:0.01, fecha:"2026-06-14" },
    villeta: { nivel:3.08, variacion:-0.03, fecha:"2026-06-14" }
  }
},
{
  fecha: "2026-06-15",
  estaciones: {
    asuncion: { nivel:2.57, variacion:-0.03, fecha:"2026-06-15" },
    ayolas: { nivel:1.00, variacion:-0.58, fecha:"2026-06-15" },
    bahia_negra: { nivel:4.18, variacion:0.00, fecha:"2026-06-15" },
    caceres: { nivel:1.54, variacion:0.00, fecha:"2026-06-15" },
    cde: { nivel:9.56, variacion:-0.23, fecha:"2026-06-15" },
    cerrito: { nivel:1.00, variacion:-0.05, fecha:"2026-06-15" },
    concepcion: { nivel:2.76, variacion:-0.01, fecha:"2026-06-15" },
    coratei: { nivel:0.80, variacion:-0.30, fecha:"2026-06-15" },
    encarnacion: { nivel:10.16, variacion:0.08, fecha:"2026-06-15" },
    estacion_arirai: { nivel:4.89, variacion:0.01, fecha:"2026-06-15" },
    fuerte_olimpo: { nivel:4.37, variacion:0.00, fecha:"2026-06-15" },
    isla_margarita: { nivel:3.40, variacion:-0.01, fecha:"2026-06-15" },
    ita_cora: { nivel:2.27, variacion:-0.03, fecha:"2026-06-15" },
    ita_enramada: { nivel:3.05, variacion:-0.03, fecha:"2026-06-15" },
    ita_piru: { nivel:3.66, variacion:0.03, fecha:"2026-06-15" },
    panchito_lopez: { nivel:2.70, variacion:-0.05, fecha:"2026-06-15" },
    paso_patria: { nivel:3.50, variacion:0.00, fecha:"2026-06-15" },
    pozo_hondo: { nivel:3.04, variacion:-0.02, fecha:"2026-06-15" },
    puerto_antequera: { nivel:2.40, variacion:-0.02, fecha:"2026-06-15" },
    puerto_ladario: { nivel:2.46, variacion:0.02, fecha:"2026-06-15" },
    puerto_murtinho: { nivel:3.40, variacion:0.00, fecha:"2026-06-15" },
    puerto_tigre: { nivel:5.89, variacion:0.15, fecha:"2026-06-15" },
    rosario: { nivel:2.58, variacion:-0.02, fecha:"2026-06-15" },
    salto_guaira: { nivel:5.90, variacion:0.19, fecha:"2026-06-15" },
    san_cosme: { nivel:9.84, variacion:0.04, fecha:"2026-06-15" },
    vallemi: { nivel:3.24, variacion:-0.01, fecha:"2026-06-15" },
    villeta: { nivel:3.03, variacion:-0.05, fecha:"2026-06-15" }
  }
},
{
  fecha: "2026-06-16",
  estaciones: {
    asuncion: { nivel:2.55, variacion:-0.02, fecha:"2026-06-16" },
    ayolas: { nivel:0.65, variacion:-0.35, fecha:"2026-06-16" },
    bahia_negra: { nivel:4.18, variacion:0.00, fecha:"2026-06-16" },
    caceres: { nivel:1.48, variacion:-0.06, fecha:"2026-06-16" },
    cde: { nivel:10.30, variacion:0.74, fecha:"2026-06-16" },
    cerrito: { nivel:0.60, variacion:-0.40, fecha:"2026-06-16" },
    concepcion: { nivel:2.75, variacion:-0.01, fecha:"2026-06-16" },
    coratei: { nivel:0.40, variacion:-0.40, fecha:"2026-06-16" },
    encarnacion: { nivel:10.17, variacion:0.01, fecha:"2026-06-16" },
    estacion_arirai: { nivel:4.89, variacion:0.00, fecha:"2026-06-16" },
    fuerte_olimpo: { nivel:4.38, variacion:0.01, fecha:"2026-06-16" },
    isla_margarita: { nivel:3.40, variacion:0.00, fecha:"2026-06-16" },
    ita_cora: { nivel:2.20, variacion:-0.07, fecha:"2026-06-16" },
    ita_enramada: { nivel:3.02, variacion:-0.03, fecha:"2026-06-16" },
    ita_piru: { nivel:3.60, variacion:-0.06, fecha:"2026-06-16" },
    panchito_lopez: { nivel:2.70, variacion:0.00, fecha:"2026-06-16" },
    paso_patria: { nivel:3.25, variacion:-0.25, fecha:"2026-06-16" },
    pozo_hondo: { nivel:3.04, variacion:0.00, fecha:"2026-06-16" },
    puerto_antequera: { nivel:2.37, variacion:-0.03, fecha:"2026-06-16" },
    puerto_ladario: { nivel:2.45, variacion:-0.01, fecha:"2026-06-16" },
    puerto_murtinho: { nivel:3.40, variacion:0.00, fecha:"2026-06-16" },
    puerto_tigre: { nivel:5.95, variacion:0.06, fecha:"2026-06-16" },
    rosario: { nivel:2.57, variacion:-0.01, fecha:"2026-06-16" },
    salto_guaira: { nivel:6.00, variacion:0.10, fecha:"2026-06-16" },
    san_cosme: { nivel:9.86, variacion:0.02, fecha:"2026-06-16" },
    vallemi: { nivel:3.23, variacion:-0.01, fecha:"2026-06-16" },
    villeta: { nivel:3.02, variacion:-0.01, fecha:"2026-06-16" }
  }
},
{
  fecha: "2026-06-17",
  estaciones: {
    asuncion: { nivel:2.52, variacion:-0.03, fecha:"2026-06-17" },
    ayolas: { nivel:0.90, variacion:0.25, fecha:"2026-06-17" },
    bahia_negra: { nivel:4.19, variacion:0.01, fecha:"2026-06-17" },
    caceres: { nivel:1.58, variacion:0.10, fecha:"2026-06-17" },
    cde: { nivel:11.15, variacion:0.85, fecha:"2026-06-17" },
    cerrito: { nivel:0.60, variacion:0.00, fecha:"2026-06-17" },
    concepcion: { nivel:2.74, variacion:-0.01, fecha:"2026-06-17" },
    coratei: { nivel:0.70, variacion:0.30, fecha:"2026-06-17" },
    encarnacion: { nivel:10.13, variacion:-0.04, fecha:"2026-06-17" },
    estacion_arirai: { nivel:4.89, variacion:0.00, fecha:"2026-06-17" },
    fuerte_olimpo: { nivel:4.38, variacion:0.00, fecha:"2026-06-17" },
    isla_margarita: { nivel:3.40, variacion:0.00, fecha:"2026-06-17" },
    ita_cora: { nivel:2.00, variacion:-0.20, fecha:"2026-06-17" },
    ita_enramada: { nivel:2.97, variacion:-0.05, fecha:"2026-06-17" },
    ita_piru: { nivel:3.60, variacion:0.00, fecha:"2026-06-17" },
    panchito_lopez: { nivel:2.64, variacion:-0.06, fecha:"2026-06-17" },
    paso_patria: { nivel:3.25, variacion:0.00, fecha:"2026-06-17" },
    pozo_hondo: { nivel:3.04, variacion:0.00, fecha:"2026-06-17" },
    puerto_antequera: { nivel:2.37, variacion:0.00, fecha:"2026-06-17" },
    puerto_ladario: { nivel:2.46, variacion:0.01, fecha:"2026-06-17" },
    puerto_murtinho: { nivel:3.40, variacion:0.00, fecha:"2026-06-17" },
    puerto_tigre: { nivel:6.01, variacion:0.06, fecha:"2026-06-17" },
    rosario: { nivel:2.57, variacion:0.00, fecha:"2026-06-17" },
    salto_guaira: { nivel:5.96, variacion:-0.04, fecha:"2026-06-17" },
    san_cosme: { nivel:9.86, variacion:0.00, fecha:"2026-06-17" },
    vallemi: { nivel:3.23, variacion:0.00, fecha:"2026-06-17" },
    villeta: { nivel:2.98, variacion:-0.04, fecha:"2026-06-17" }
  }
},
{
  fecha: "2026-06-18",
  estaciones: {
    asuncion: { nivel:2.48, variacion:-0.04, fecha:"2026-06-18" },
    ayolas: { nivel:1.40, variacion:0.50, fecha:"2026-06-18" },
    bahia_negra: { nivel:4.19, variacion:0.00, fecha:"2026-06-18" },
    caceres: { nivel:1.63, variacion:0.05, fecha:"2026-06-18" },
    cde: { nivel:11.68, variacion:0.53, fecha:"2026-06-18" },
    cerrito: { nivel:0.80, variacion:0.20, fecha:"2026-06-18" },
    concepcion: { nivel:2.71, variacion:-0.03, fecha:"2026-06-18" },
    coratei: { nivel:1.30, variacion:0.60, fecha:"2026-06-18" },
    encarnacion: { nivel:10.08, variacion:-0.05, fecha:"2026-06-18" },
    estacion_arirai: { nivel:4.89, variacion:0.00, fecha:"2026-06-18" },
    fuerte_olimpo: { nivel:4.38, variacion:0.00, fecha:"2026-06-18" },
    isla_margarita: { nivel:3.40, variacion:0.00, fecha:"2026-06-18" },
    ita_cora: { nivel:2.20, variacion:0.20, fecha:"2026-06-18" },
    ita_enramada: { nivel:2.97, variacion:0.00, fecha:"2026-06-18" },
    ita_piru: { nivel:2.35, variacion:-1.25, fecha:"2026-06-18" },
    panchito_lopez: { nivel:2.60, variacion:-0.04, fecha:"2026-06-18" },
    paso_patria: { nivel:3.25, variacion:0.00, fecha:"2026-06-18" },
    pozo_hondo: { nivel:3.04, variacion:0.00, fecha:"2026-06-18" },
    puerto_antequera: { nivel:2.34, variacion:-0.03, fecha:"2026-06-18" },
    puerto_ladario: { nivel:2.46, variacion:0.00, fecha:"2026-06-18" },
    puerto_murtinho: { nivel:3.40, variacion:0.00, fecha:"2026-06-18" },
    puerto_tigre: { nivel:5.96, variacion:-0.05, fecha:"2026-06-18" },
    rosario: { nivel:2.57, variacion:0.00, fecha:"2026-06-18" },
    salto_guaira: { nivel:5.96, variacion:0.00, fecha:"2026-06-18" },
    san_cosme: { nivel:9.82, variacion:-0.04, fecha:"2026-06-18" },
    vallemi: { nivel:3.22, variacion:-0.01, fecha:"2026-06-18" },
    villeta: { nivel:2.95, variacion:-0.03, fecha:"2026-06-18" }
  }
},
{
  fecha: "2026-06-19",
  estaciones: {
    asuncion: { nivel:2.50, variacion:0.02, fecha:"2026-06-19" },
    ayolas: { nivel:1.50, variacion:0.10, fecha:"2026-06-19" },
    bahia_negra: { nivel:4.20, variacion:0.01, fecha:"2026-06-19" },
    caceres: { nivel:1.62, variacion:-0.01, fecha:"2026-06-19" },
    cde: { nivel:10.82, variacion:-0.86, fecha:"2026-06-19" },
    cerrito: { nivel:1.15, variacion:0.35, fecha:"2026-06-19" },
    concepcion: { nivel:2.70, variacion:-0.01, fecha:"2026-06-19" },
    coratei: { nivel:1.37, variacion:0.07, fecha:"2026-06-19" },
    encarnacion: { nivel:10.03, variacion:-0.05, fecha:"2026-06-19" },
    estacion_arirai: { nivel:4.89, variacion:0.00, fecha:"2026-06-19" },
    fuerte_olimpo: { nivel:4.37, variacion:-0.01, fecha:"2026-06-19" },
    isla_margarita: { nivel:3.40, variacion:0.00, fecha:"2026-06-19" },
    ita_cora: { nivel:2.50, variacion:0.30, fecha:"2026-06-19" },
    ita_enramada: { nivel:2.97, variacion:0.00, fecha:"2026-06-19" },
    ita_piru: { nivel:3.50, variacion:1.15, fecha:"2026-06-19" },
    panchito_lopez: { nivel:2.60, variacion:0.00, fecha:"2026-06-19" },
    paso_patria: { nivel:3.40, variacion:0.15, fecha:"2026-06-19" },
    pozo_hondo: { nivel:3.06, variacion:0.02, fecha:"2026-06-19" },
    puerto_antequera: { nivel:2.34, variacion:0.00, fecha:"2026-06-19" },
    puerto_ladario: { nivel:2.46, variacion:0.00, fecha:"2026-06-19" },
    puerto_murtinho: { nivel:3.40, variacion:0.00, fecha:"2026-06-19" },
    puerto_tigre: { nivel:5.92, variacion:-0.04, fecha:"2026-06-19" },
    rosario: { nivel:2.55, variacion:-0.02, fecha:"2026-06-19" },
    salto_guaira: { nivel:5.90, variacion:-0.06, fecha:"2026-06-19" },
    san_cosme: { nivel:9.80, variacion:-0.02, fecha:"2026-06-19" },
    vallemi: { nivel:3.23, variacion:0.01, fecha:"2026-06-19" },
    villeta: { nivel:2.98, variacion:0.03, fecha:"2026-06-19" }
  }
},
{
  fecha: "2026-06-20",
  estaciones: {
    asuncion: { nivel:2.65, variacion:0.15, fecha:"2026-06-20" },
    ayolas: { nivel:1.50, variacion:0.00, fecha:"2026-06-20" },
    bahia_negra: { nivel:4.18, variacion:-0.02, fecha:"2026-06-20" },
    caceres: { nivel:1.66, variacion:0.04, fecha:"2026-06-20" },
    cde: { nivel:10.28, variacion:-0.54, fecha:"2026-06-20" },
    cerrito: { nivel:1.30, variacion:0.15, fecha:"2026-06-20" },
    concepcion: { nivel:2.70, variacion:0.00, fecha:"2026-06-20" },
    coratei: { nivel:1.27, variacion:-0.10, fecha:"2026-06-20" },
    encarnacion: { nivel:10.08, variacion:0.05, fecha:"2026-06-20" },
    estacion_arirai: { nivel:4.86, variacion:-0.03, fecha:"2026-06-20" },
    fuerte_olimpo: { nivel:4.37, variacion:0.00, fecha:"2026-06-20" },
    isla_margarita: { nivel:3.40, variacion:0.00, fecha:"2026-06-20" },
    ita_cora: { nivel:2.60, variacion:0.10, fecha:"2026-06-20" },
    ita_enramada: { nivel:3.12, variacion:0.15, fecha:"2026-06-20" },
    ita_piru: { nivel:3.75, variacion:0.25, fecha:"2026-06-20" },
    panchito_lopez: { nivel:2.65, variacion:0.05, fecha:"2026-06-20" },
    paso_patria: { nivel:3.55, variacion:0.15, fecha:"2026-06-20" },
    pozo_hondo: { nivel:3.06, variacion:0.00, fecha:"2026-06-20" },
    puerto_antequera: { nivel:2.33, variacion:-0.01, fecha:"2026-06-20" },
    puerto_ladario: { nivel:2.48, variacion:0.02, fecha:"2026-06-20" },
    puerto_murtinho: { nivel:3.40, variacion:0.00, fecha:"2026-06-20" },
    puerto_tigre: { nivel:5.92, variacion:0.00, fecha:"2026-06-20" },
    rosario: { nivel:2.55, variacion:0.00, fecha:"2026-06-20" },
    salto_guaira: { nivel:5.90, variacion:0.00, fecha:"2026-06-20" },
    san_cosme: { nivel:9.80, variacion:0.00, fecha:"2026-06-20" },
    vallemi: { nivel:3.23, variacion:0.00, fecha:"2026-06-20" },
    villeta: { nivel:3.10, variacion:0.12, fecha:"2026-06-20" }
  }
},
{
  fecha: "2026-06-21",
  estaciones: {
    asuncion: { nivel:2.68, variacion:0.03, fecha:"2026-06-21" },
    ayolas: { nivel:1.10, variacion:-0.40, fecha:"2026-06-21" },
    bahia_negra: { nivel:4.18, variacion:0.00, fecha:"2026-06-21" },
    caceres: { nivel:1.66, variacion:0.00, fecha:"2026-06-21" },
    cde: { nivel:9.89, variacion:-0.39, fecha:"2026-06-21" },
    cerrito: { nivel:1.22, variacion:-0.08, fecha:"2026-06-21" },
    concepcion: { nivel:2.67, variacion:-0.03, fecha:"2026-06-21" },
    coratei: { nivel:0.78, variacion:-0.49, fecha:"2026-06-21" },
    encarnacion: { nivel:10.20, variacion:0.12, fecha:"2026-06-21" },
    estacion_arirai: { nivel:4.88, variacion:0.02, fecha:"2026-06-21" },
    fuerte_olimpo: { nivel:4.37, variacion:0.00, fecha:"2026-06-21" },
    isla_margarita: { nivel:3.40, variacion:0.00, fecha:"2026-06-21" },
    ita_cora: { nivel:2.70, variacion:0.10, fecha:"2026-06-21" },
    ita_enramada: { nivel:3.15, variacion:0.03, fecha:"2026-06-21" },
    ita_piru: { nivel:3.90, variacion:0.15, fecha:"2026-06-21" },
    panchito_lopez: { nivel:2.65, variacion:0.00, fecha:"2026-06-21" },
    paso_patria: { nivel:3.55, variacion:0.00, fecha:"2026-06-21" },
    pozo_hondo: { nivel:3.05, variacion:-0.01, fecha:"2026-06-21" },
    puerto_antequera: { nivel:2.33, variacion:0.00, fecha:"2026-06-21" },
    puerto_ladario: { nivel:2.47, variacion:-0.01, fecha:"2026-06-21" },
    puerto_murtinho: { nivel:3.40, variacion:0.00, fecha:"2026-06-21" },
    puerto_tigre: { nivel:6.19, variacion:0.27, fecha:"2026-06-21" },
    rosario: { nivel:2.55, variacion:0.00, fecha:"2026-06-21" },
    salto_guaira: { nivel:6.25, variacion:0.35, fecha:"2026-06-21" },
    san_cosme: { nivel:9.85, variacion:0.05, fecha:"2026-06-21" },
    vallemi: { nivel:3.23, variacion:0.00, fecha:"2026-06-21" },
    villeta: { nivel:3.14, variacion:0.04, fecha:"2026-06-21" }
  }
},
{
  fecha: "2026-06-22",
  estaciones: {
    asuncion: { nivel:2.68, variacion:0.00, fecha:"2026-06-22" },
    ayolas: { nivel:1.25, variacion:0.15, fecha:"2026-06-22" },
    bahia_negra: { nivel:4.17, variacion:-0.01, fecha:"2026-06-22" },
    cerrito: { nivel:0.90, variacion:-0.32, fecha:"2026-06-22" },
    concepcion: { nivel:2.65, variacion:-0.02, fecha:"2026-06-22" },
    coratei: { nivel:0.90, variacion:0.12, fecha:"2026-06-22" },
    encarnacion: { nivel:10.24, variacion:0.04, fecha:"2026-06-22" },
    estacion_arirai: { nivel:4.87, variacion:-0.01, fecha:"2026-06-22" },
    fuerte_olimpo: { nivel:4.37, variacion:0.00, fecha:"2026-06-22" },
    isla_margarita: { nivel:3.40, variacion:0.00, fecha:"2026-06-22" },
    ita_cora: { nivel:2.55, variacion:-0.15, fecha:"2026-06-22" },
    ita_enramada: { nivel:3.16, variacion:0.01, fecha:"2026-06-22" },
    ita_piru: { nivel:3.75, variacion:-0.15, fecha:"2026-06-22" },
    panchito_lopez: { nivel:2.68, variacion:0.03, fecha:"2026-06-22" },
    paso_patria: { nivel:3.55, variacion:0.00, fecha:"2026-06-22" },
    pozo_hondo: { nivel:3.05, variacion:0.00, fecha:"2026-06-22" },
    puerto_antequera: { nivel:2.32, variacion:-0.01, fecha:"2026-06-22" },
    puerto_tigre: { nivel:6.38, variacion:0.19, fecha:"2026-06-22" },
    rosario: { nivel:2.54, variacion:-0.01, fecha:"2026-06-22" },
    salto_guaira: { nivel:6.34, variacion:0.09, fecha:"2026-06-22" },
    san_cosme: { nivel:9.90, variacion:0.05, fecha:"2026-06-22" },
    vallemi: { nivel:3.23, variacion:0.00, fecha:"2026-06-22" },
    villeta: { nivel:3.16, variacion:0.02, fecha:"2026-06-22" }
  }
},
{
  fecha: "2026-06-23",
  estaciones: {
    asuncion: { nivel:2.66, variacion:-0.02, fecha:"2026-06-23" },
    ayolas: { nivel:1.30, variacion:0.05, fecha:"2026-06-23" },
    bahia_negra: { nivel:4.18, variacion:0.01, fecha:"2026-06-23" },
    cerrito: { nivel:0.65, variacion:-0.25, fecha:"2026-06-23" },
    concepcion: { nivel:2.67, variacion:0.02, fecha:"2026-06-23" },
    coratei: { nivel:0.95, variacion:0.05, fecha:"2026-06-23" },
    encarnacion: { nivel:10.27, variacion:0.03, fecha:"2026-06-23" },
    estacion_arirai: { nivel:4.88, variacion:0.01, fecha:"2026-06-23" },
    fuerte_olimpo: { nivel:4.36, variacion:-0.01, fecha:"2026-06-23" },
    isla_margarita: { nivel:3.39, variacion:-0.01, fecha:"2026-06-23" },
    ita_cora: { nivel:2.35, variacion:-0.20, fecha:"2026-06-23" },
    ita_enramada: { nivel:3.15, variacion:-0.01, fecha:"2026-06-23" },
    ita_piru: { nivel:3.50, variacion:-0.25, fecha:"2026-06-23" },
    panchito_lopez: { nivel:2.70, variacion:0.02, fecha:"2026-06-23" },
    paso_patria: { nivel:3.15, variacion:-0.40, fecha:"2026-06-23" },
    pozo_hondo: { nivel:3.74, variacion:0.69, fecha:"2026-06-23" },
    puerto_antequera: { nivel:2.32, variacion:0.00, fecha:"2026-06-23" },
    puerto_tigre: { nivel:6.52, variacion:0.14, fecha:"2026-06-23" },
    rosario: { nivel:2.54, variacion:0.00, fecha:"2026-06-23" },
    salto_guaira: { nivel:6.48, variacion:0.14, fecha:"2026-06-23" },
    san_cosme: { nivel:9.90, variacion:0.00, fecha:"2026-06-23" },
    vallemi: { nivel:3.22, variacion:-0.01, fecha:"2026-06-23" },
    villeta: { nivel:3.14, variacion:-0.02, fecha:"2026-06-23" }
  }
}
];

/* ==========================================================
   ACTUALIZACIONES DMH · 15 al 20 de julio de 2026
   Las fechas internas conservan la fecha real del dato por estación.
   ========================================================== */
SEEDS.push(
{
  fecha: "2026-07-15",
  estaciones: {
    puerto_ladario:{nivel:2.55,variacion:0.00,fecha:"2026-07-14"},
    puerto_murtinho:{nivel:3.31,variacion:0.01,fecha:"2026-07-14"},
    caceres:{nivel:1.34,variacion:0.00,fecha:"2026-07-14"},
    isla_margarita:{nivel:3.30,variacion:0.00,fecha:"2026-07-15"},
    fuerte_olimpo:{nivel:4.22,variacion:0.00,fecha:"2026-07-15"},
    bahia_negra:{nivel:4.24,variacion:0.01,fecha:"2026-07-15"},
    vallemi:{nivel:3.12,variacion:0.00,fecha:"2026-07-15"},
    concepcion:{nivel:2.36,variacion:-0.01,fecha:"2026-07-15"},
    rosario:{nivel:2.08,variacion:-0.03,fecha:"2026-07-15"},
    puerto_antequera:{nivel:2.00,variacion:-0.05,fecha:"2026-07-14"},
    villeta:{nivel:2.66,variacion:-0.05,fecha:"2026-07-15"},
    asuncion:{nivel:2.13,variacion:-0.06,fecha:"2026-07-15"},
    ita_enramada:{nivel:2.65,variacion:-0.04,fecha:"2026-07-15"},
    humaita:{nivel:3.42,variacion:-0.14,fecha:"2026-07-15"},
    alberdi:{nivel:4.50,variacion:-0.05,fecha:"2026-07-15"},
    pilar:{nivel:4.39,variacion:-0.07,fecha:"2026-07-15"},
    puerto_tigre:{nivel:6.89,variacion:-0.03,fecha:"2026-07-15"},
    salto_guaira:{nivel:6.76,variacion:-0.09,fecha:"2026-07-15"},
    cde:{nivel:13.81,variacion:0.97,fecha:"2026-07-14"},
    cerrito:{nivel:1.50,variacion:0.20,fecha:"2026-07-15"},
    ita_piru:{nivel:3.20,variacion:-1.30,fecha:"2026-07-15"},
    paso_patria:{nivel:3.95,variacion:0.00,fecha:"2026-07-15"},
    ayolas:{nivel:1.90,variacion:0.60,fecha:"2026-07-15"},
    panchito_lopez:{nivel:2.90,variacion:-0.11,fecha:"2026-07-15"},
    coratei:{nivel:1.75,variacion:0.25,fecha:"2026-07-15"},
    ita_cora:{nivel:3.15,variacion:-0.05,fecha:"2026-07-15"},
    san_cosme:{nivel:9.85,variacion:-0.05,fecha:"2026-07-15"},
    encarnacion:{nivel:10.05,variacion:-0.01,fecha:"2026-07-15"},
    pozo_hondo:{nivel:3.02,variacion:-0.03,fecha:"2026-07-15"},
    estacion_arirai:{nivel:4.92,variacion:0.00,fecha:"2026-07-15"},
    villa_florida:{nivel:0.32,variacion:0.32,fecha:"2025-02-28",estado:"antiguo"}
  }
},
{
  fecha: "2026-07-16",
  estaciones: {
    puerto_ladario:{nivel:2.55,variacion:0.00,fecha:"2026-07-15"},
    puerto_murtinho:{nivel:3.29,variacion:-0.02,fecha:"2026-07-15"},
    caceres:{nivel:1.36,variacion:0.02,fecha:"2026-07-15"},
    isla_margarita:{nivel:3.29,variacion:-0.01,fecha:"2026-07-16"},
    fuerte_olimpo:{nivel:4.22,variacion:0.00,fecha:"2026-07-16"},
    bahia_negra:{nivel:4.24,variacion:0.00,fecha:"2026-07-16"},
    vallemi:{nivel:3.12,variacion:0.00,fecha:"2026-07-16"},
    concepcion:{nivel:2.35,variacion:-0.01,fecha:"2026-07-16"},
    rosario:{nivel:2.02,variacion:-0.06,fecha:"2026-07-16"},
    puerto_antequera:{nivel:2.00,variacion:-0.05,fecha:"2026-07-14"},
    villeta:{nivel:2.59,variacion:-0.07,fecha:"2026-07-16"},
    asuncion:{nivel:2.08,variacion:-0.05,fecha:"2026-07-16"},
    ita_enramada:{nivel:2.61,variacion:-0.04,fecha:"2026-07-16"},
    humaita:{nivel:3.32,variacion:-0.10,fecha:"2026-07-16"},
    alberdi:{nivel:4.44,variacion:-0.06,fecha:"2026-07-16"},
    pilar:{nivel:4.37,variacion:-0.02,fecha:"2026-07-16"},
    puerto_tigre:{nivel:6.75,variacion:-0.14,fecha:"2026-07-16"},
    salto_guaira:{nivel:6.71,variacion:-0.05,fecha:"2026-07-16"},
    cde:{nivel:14.19,variacion:0.38,fecha:"2026-07-15"},
    cerrito:{nivel:1.72,variacion:0.22,fecha:"2026-07-16"},
    ita_piru:{nivel:3.30,variacion:0.10,fecha:"2026-07-16"},
    paso_patria:{nivel:4.00,variacion:0.05,fecha:"2026-07-16"},
    ayolas:{nivel:1.55,variacion:-0.35,fecha:"2026-07-16"},
    panchito_lopez:{nivel:2.90,variacion:0.00,fecha:"2026-07-16"},
    coratei:{nivel:1.40,variacion:-0.35,fecha:"2026-07-16"},
    ita_cora:{nivel:3.30,variacion:0.15,fecha:"2026-07-16"},
    san_cosme:{nivel:9.87,variacion:0.02,fecha:"2026-07-16"},
    encarnacion:{nivel:10.08,variacion:0.03,fecha:"2026-07-16"},
    pozo_hondo:{nivel:3.03,variacion:0.01,fecha:"2026-07-16"},
    estacion_arirai:{nivel:4.91,variacion:-0.01,fecha:"2026-07-16"},
    villa_florida:{nivel:0.32,variacion:0.32,fecha:"2025-02-28",estado:"antiguo"}
  }
},
{
  fecha: "2026-07-17",
  estaciones: {
    puerto_ladario:{nivel:2.55,variacion:0.00,fecha:"2026-07-17"},
    puerto_murtinho:{nivel:3.28,variacion:-0.01,fecha:"2026-07-17"},
    caceres:{nivel:1.37,variacion:0.01,fecha:"2026-07-17"},
    isla_margarita:{nivel:3.31,variacion:0.02,fecha:"2026-07-17"},
    fuerte_olimpo:{nivel:4.20,variacion:-0.02,fecha:"2026-07-17"},
    bahia_negra:{nivel:4.22,variacion:-0.02,fecha:"2026-07-17"},
    vallemi:{nivel:3.11,variacion:-0.01,fecha:"2026-07-17"},
    concepcion:{nivel:2.35,variacion:0.00,fecha:"2026-07-17"},
    rosario:{nivel:2.02,variacion:0.00,fecha:"2026-07-17"},
    puerto_antequera:{nivel:2.00,variacion:-0.05,fecha:"2026-07-14"},
    villeta:{nivel:2.52,variacion:-0.07,fecha:"2026-07-17"},
    asuncion:{nivel:2.00,variacion:-0.08,fecha:"2026-07-17"},
    ita_enramada:{nivel:2.57,variacion:-0.04,fecha:"2026-07-17"},
    humaita:{nivel:3.32,variacion:-0.10,fecha:"2026-07-16"},
    alberdi:{nivel:4.43,variacion:-0.01,fecha:"2026-07-17"},
    pilar:{nivel:4.36,variacion:-0.01,fecha:"2026-07-17"},
    puerto_tigre:{nivel:6.78,variacion:0.03,fecha:"2026-07-17"},
    salto_guaira:{nivel:6.68,variacion:-0.03,fecha:"2026-07-17"},
    cde:{nivel:13.21,variacion:-0.98,fecha:"2026-07-16"},
    cerrito:{nivel:1.67,variacion:-0.05,fecha:"2026-07-17"},
    ita_piru:{nivel:3.40,variacion:0.10,fecha:"2026-07-17"},
    paso_patria:{nivel:4.07,variacion:0.07,fecha:"2026-07-17"},
    ayolas:{nivel:1.60,variacion:0.05,fecha:"2026-07-17"},
    panchito_lopez:{nivel:2.91,variacion:0.01,fecha:"2026-07-17"},
    coratei:{nivel:1.75,variacion:0.35,fecha:"2026-07-17"},
    ita_cora:{nivel:3.35,variacion:0.05,fecha:"2026-07-17"},
    san_cosme:{nivel:9.87,variacion:0.00,fecha:"2026-07-17"},
    encarnacion:{nivel:10.12,variacion:0.04,fecha:"2026-07-17"},
    pozo_hondo:{nivel:2.99,variacion:-0.04,fecha:"2026-07-17"},
    estacion_arirai:{nivel:4.89,variacion:-0.02,fecha:"2026-07-17"},
    villa_florida:{nivel:0.32,variacion:0.32,fecha:"2025-02-28",estado:"antiguo"}
  }
},
{
  fecha:"2026-07-18",
  estaciones:{
    puerto_ladario:{nivel:2.53,variacion:-0.02,fecha:"2026-07-18"},
    puerto_murtinho:{nivel:3.29,variacion:0.01,fecha:"2026-07-18"},
    caceres:{nivel:1.36,variacion:-0.01,fecha:"2026-07-18"},
    isla_margarita:{nivel:3.28,variacion:-0.03,fecha:"2026-07-18"},
    fuerte_olimpo:{nivel:4.18,variacion:-0.02,fecha:"2026-07-18"},
    bahia_negra:{nivel:4.20,variacion:-0.02,fecha:"2026-07-18"},
    vallemi:{nivel:3.11,variacion:0.00,fecha:"2026-07-18"},
    concepcion:{nivel:2.35,variacion:0.00,fecha:"2026-07-18"},
    rosario:{nivel:2.02,variacion:0.00,fecha:"2026-07-18"},
    puerto_antequera:{nivel:2.00,variacion:-0.05,fecha:"2026-07-14"},
    villeta:{nivel:2.46,variacion:-0.06,fecha:"2026-07-18"},
    asuncion:{nivel:1.94,variacion:-0.06,fecha:"2026-07-18"},
    ita_enramada:{nivel:2.53,variacion:-0.04,fecha:"2026-07-18"},
    humaita:{nivel:3.39,variacion:0.07,fecha:"2026-07-18"},
    alberdi:{nivel:4.30,variacion:-0.13,fecha:"2026-07-18"},
    pilar:{nivel:4.33,variacion:-0.03,fecha:"2026-07-18"},
    puerto_tigre:{nivel:6.71,variacion:-0.07,fecha:"2026-07-18"},
    salto_guaira:{nivel:6.67,variacion:-0.01,fecha:"2026-07-18"},
    cde:{nivel:12.24,variacion:-0.97,fecha:"2026-07-17"},
    cerrito:{nivel:1.77,variacion:0.10,fecha:"2026-07-18"},
    ita_piru:{nivel:3.45,variacion:0.05,fecha:"2026-07-18"},
    paso_patria:{nivel:4.05,variacion:-0.02,fecha:"2026-07-18"},
    ayolas:{nivel:1.50,variacion:-0.10,fecha:"2026-07-18"},
    panchito_lopez:{nivel:2.85,variacion:-0.06,fecha:"2026-07-18"},
    coratei:{nivel:1.70,variacion:-0.05,fecha:"2026-07-18"},
    ita_cora:{nivel:3.30,variacion:-0.05,fecha:"2026-07-18"},
    san_cosme:{nivel:9.90,variacion:0.03,fecha:"2026-07-18"},
    encarnacion:{nivel:10.09,variacion:-0.03,fecha:"2026-07-18"},
    pozo_hondo:{nivel:3.05,variacion:0.06,fecha:"2026-07-18"},
    estacion_arirai:{nivel:4.87,variacion:-0.02,fecha:"2026-07-18"},
    villa_florida:{nivel:0.32,variacion:0.32,fecha:"2025-02-28",estado:"antiguo"}
  }
},
{
  fecha:"2026-07-19",
  estaciones:{
    puerto_ladario:{nivel:2.56,variacion:0.03,fecha:"2026-07-19"},
    puerto_murtinho:{nivel:3.26,variacion:-0.03,fecha:"2026-07-19"},
    caceres:{nivel:1.33,variacion:-0.03,fecha:"2026-07-19"},
    isla_margarita:{nivel:3.29,variacion:0.01,fecha:"2026-07-19"},
    fuerte_olimpo:{nivel:4.16,variacion:-0.02,fecha:"2026-07-19"},
    bahia_negra:{nivel:4.19,variacion:-0.01,fecha:"2026-07-19"},
    vallemi:{nivel:3.10,variacion:-0.01,fecha:"2026-07-19"},
    concepcion:{nivel:2.34,variacion:-0.01,fecha:"2026-07-19"},
    rosario:{nivel:2.01,variacion:-0.01,fecha:"2026-07-19"},
    puerto_antequera:{nivel:2.00,variacion:-0.05,fecha:"2026-07-14"},
    villeta:{nivel:2.48,variacion:0.02,fecha:"2026-07-19"},
    asuncion:{nivel:1.89,variacion:-0.05,fecha:"2026-07-19"},
    ita_enramada:{nivel:2.48,variacion:-0.05,fecha:"2026-07-19"},
    humaita:{nivel:3.40,variacion:0.01,fecha:"2026-07-19"},
    alberdi:{nivel:4.26,variacion:-0.04,fecha:"2026-07-19"},
    pilar:{nivel:4.29,variacion:-0.04,fecha:"2026-07-19"},
    puerto_tigre:{nivel:6.73,variacion:0.02,fecha:"2026-07-19"},
    salto_guaira:{nivel:6.68,variacion:0.01,fecha:"2026-07-19"},
    cde:{nivel:11.80,variacion:-0.44,fecha:"2026-07-18"},
    cerrito:{nivel:1.80,variacion:0.03,fecha:"2026-07-19"},
    ita_piru:{nivel:3.42,variacion:-0.03,fecha:"2026-07-19"},
    paso_patria:{nivel:4.03,variacion:-0.02,fecha:"2026-07-19"},
    ayolas:{nivel:1.90,variacion:0.40,fecha:"2026-07-19"},
    panchito_lopez:{nivel:2.80,variacion:-0.05,fecha:"2026-07-19"},
    coratei:{nivel:1.80,variacion:0.10,fecha:"2026-07-19"},
    ita_cora:{nivel:3.40,variacion:0.10,fecha:"2026-07-19"},
    san_cosme:{nivel:9.90,variacion:0.00,fecha:"2026-07-19"},
    encarnacion:{nivel:10.07,variacion:-0.02,fecha:"2026-07-19"},
    pozo_hondo:{nivel:3.05,variacion:0.06,fecha:"2026-07-18"},
    estacion_arirai:{nivel:4.86,variacion:-0.01,fecha:"2026-07-19"},
    villa_florida:{nivel:0.32,variacion:0.32,fecha:"2025-02-28",estado:"antiguo"}
  }
},
{
  fecha:"2026-07-20",
  estaciones:{
    puerto_ladario:{nivel:2.56,variacion:0.03,fecha:"2026-07-19"},
    puerto_murtinho:{nivel:3.26,variacion:-0.03,fecha:"2026-07-19"},
    caceres:{nivel:1.33,variacion:-0.03,fecha:"2026-07-19"},
    isla_margarita:{nivel:3.26,variacion:-0.03,fecha:"2026-07-20"},
    fuerte_olimpo:{nivel:4.16,variacion:0.00,fecha:"2026-07-20"},
    bahia_negra:{nivel:4.18,variacion:-0.01,fecha:"2026-07-20"},
    vallemi:{nivel:3.08,variacion:-0.02,fecha:"2026-07-20"},
    concepcion:{nivel:2.34,variacion:0.00,fecha:"2026-07-20"},
    rosario:{nivel:2.00,variacion:-0.01,fecha:"2026-07-20"},
    puerto_antequera:{nivel:2.00,variacion:-0.05,fecha:"2026-07-14"},
    villeta:{nivel:2.38,variacion:-0.10,fecha:"2026-07-20"},
    asuncion:{nivel:1.88,variacion:-0.01,fecha:"2026-07-20"},
    ita_enramada:{nivel:2.43,variacion:-0.05,fecha:"2026-07-20"},
    humaita:{nivel:3.38,variacion:-0.02,fecha:"2026-07-20"},
    alberdi:{nivel:4.23,variacion:-0.03,fecha:"2026-07-20"},
    pilar:{nivel:4.23,variacion:-0.06,fecha:"2026-07-20"},
    puerto_tigre:{nivel:6.78,variacion:0.05,fecha:"2026-07-20"},
    salto_guaira:{nivel:6.72,variacion:0.04,fecha:"2026-07-20"},
    cde:{nivel:10.26,variacion:-1.54,fecha:"2026-07-19"},
    cerrito:{nivel:1.73,variacion:-0.07,fecha:"2026-07-20"},
    ita_piru:{nivel:3.42,variacion:0.00,fecha:"2026-07-20"},
    paso_patria:{nivel:4.03,variacion:0.00,fecha:"2026-07-20"},
    ayolas:{nivel:1.70,variacion:-0.20,fecha:"2026-07-20"},
    panchito_lopez:{nivel:2.80,variacion:0.00,fecha:"2026-07-20"},
    coratei:{nivel:1.40,variacion:-0.40,fecha:"2026-07-20"},
    ita_cora:{nivel:3.35,variacion:-0.05,fecha:"2026-07-20"},
    san_cosme:{nivel:9.88,variacion:-0.02,fecha:"2026-07-20"},
    encarnacion:{nivel:10.02,variacion:-0.05,fecha:"2026-07-20"},
    pozo_hondo:{nivel:3.05,variacion:0.00,fecha:"2026-07-20"},
    estacion_arirai:{nivel:4.86,variacion:-0.01,fecha:"2026-07-19"},
    villa_florida:{nivel:0.32,variacion:0.32,fecha:"2025-02-28",estado:"antiguo"}
  }
}
);

/* DMH_AUTO_START
   Bloque derivado de data/historico-dmh.json. No editar manualmente. */
const DMH_AUTO_SEEDS = [
  {
    fecha: "2026-07-20",
    estaciones: {
      puerto_ladario: {
        nivel: 2.53,
        variacion: -0.03,
        fecha: "2026-07-20"
      },
      puerto_murtinho: {
        nivel: 3.25,
        variacion: -0.01,
        fecha: "2026-07-20"
      },
      caceres: {
        nivel: 1.3,
        variacion: -0.03,
        fecha: "2026-07-20"
      },
      isla_margarita: {
        nivel: 3.26,
        variacion: -0.03,
        fecha: "2026-07-20"
      },
      fuerte_olimpo: {
        nivel: 4.16,
        variacion: 0,
        fecha: "2026-07-20"
      },
      bahia_negra: {
        nivel: 4.18,
        variacion: -0.01,
        fecha: "2026-07-20"
      },
      vallemi: {
        nivel: 3.08,
        variacion: -0.02,
        fecha: "2026-07-20"
      },
      concepcion: {
        nivel: 2.34,
        variacion: 0,
        fecha: "2026-07-20"
      },
      rosario: {
        nivel: 2,
        variacion: -0.01,
        fecha: "2026-07-20"
      },
      puerto_antequera: {
        nivel: 2,
        variacion: -0.05,
        fecha: "2026-07-14"
      },
      villeta: {
        nivel: 2.38,
        variacion: -0.1,
        fecha: "2026-07-20"
      },
      asuncion: {
        nivel: 1.88,
        variacion: -0.01,
        fecha: "2026-07-20"
      },
      ita_enramada: {
        nivel: 2.43,
        variacion: -0.05,
        fecha: "2026-07-20"
      },
      humaita: {
        nivel: 3.38,
        variacion: -0.02,
        fecha: "2026-07-20"
      },
      alberdi: {
        nivel: 4.23,
        variacion: -0.03,
        fecha: "2026-07-20"
      },
      pilar: {
        nivel: 4.23,
        variacion: -0.06,
        fecha: "2026-07-20"
      },
      puerto_tigre: {
        nivel: 6.78,
        variacion: 0.05,
        fecha: "2026-07-20"
      },
      salto_guaira: {
        nivel: 6.72,
        variacion: 0.04,
        fecha: "2026-07-20"
      },
      cde: {
        nivel: 10.26,
        variacion: -1.54,
        fecha: "2026-07-19"
      },
      cerrito: {
        nivel: 1.73,
        variacion: -0.07,
        fecha: "2026-07-20"
      },
      ita_piru: {
        nivel: 3.42,
        variacion: 0,
        fecha: "2026-07-20"
      },
      paso_patria: {
        nivel: 4.03,
        variacion: 0,
        fecha: "2026-07-20"
      },
      ayolas: {
        nivel: 1.7,
        variacion: -0.2,
        fecha: "2026-07-20"
      },
      panchito_lopez: {
        nivel: 2.8,
        variacion: 0,
        fecha: "2026-07-20"
      },
      coratei: {
        nivel: 1.4,
        variacion: -0.4,
        fecha: "2026-07-20"
      },
      ita_cora: {
        nivel: 3.35,
        variacion: -0.05,
        fecha: "2026-07-20"
      },
      san_cosme: {
        nivel: 9.88,
        variacion: -0.02,
        fecha: "2026-07-20"
      },
      encarnacion: {
        nivel: 10.02,
        variacion: -0.05,
        fecha: "2026-07-20"
      },
      pozo_hondo: {
        nivel: 3.05,
        variacion: 0,
        fecha: "2026-07-20"
      },
      villa_florida: {
        nivel: 0.32,
        variacion: 0.32,
        fecha: "2025-02-28",
        estado: "antiguo"
      },
      estacion_arirai: {
        nivel: 4.85,
        variacion: -0.01,
        fecha: "2026-07-20"
      }
    }
  },
  {
    fecha: "2026-07-21",
    estaciones: {
      puerto_ladario: {
        nivel: 2.54,
        variacion: 0.01,
        fecha: "2026-07-21"
      },
      puerto_murtinho: {
        nivel: 3.26,
        variacion: 0.01,
        fecha: "2026-07-21"
      },
      caceres: {
        nivel: 1.27,
        variacion: -0.03,
        fecha: "2026-07-21"
      },
      isla_margarita: {
        nivel: 3.25,
        variacion: -0.01,
        fecha: "2026-07-21"
      },
      fuerte_olimpo: {
        nivel: 4.16,
        variacion: 0,
        fecha: "2026-07-21"
      },
      bahia_negra: {
        nivel: 4.16,
        variacion: -0.02,
        fecha: "2026-07-21"
      },
      vallemi: {
        nivel: 3.07,
        variacion: -0.01,
        fecha: "2026-07-21"
      },
      concepcion: {
        nivel: 2.34,
        variacion: 0,
        fecha: "2026-07-21"
      },
      rosario: {
        nivel: 2,
        variacion: 0,
        fecha: "2026-07-21"
      },
      puerto_antequera: {
        nivel: 2,
        variacion: -0.05,
        fecha: "2026-07-14"
      },
      villeta: {
        nivel: 2.35,
        variacion: -0.03,
        fecha: "2026-07-21"
      },
      asuncion: {
        nivel: 1.86,
        variacion: -0.02,
        fecha: "2026-07-21"
      },
      ita_enramada: {
        nivel: 2.38,
        variacion: -0.05,
        fecha: "2026-07-21"
      },
      humaita: {
        nivel: 3.32,
        variacion: -0.06,
        fecha: "2026-07-21"
      },
      alberdi: {
        nivel: 4.14,
        variacion: -0.09,
        fecha: "2026-07-21"
      },
      pilar: {
        nivel: 4.17,
        variacion: -0.06,
        fecha: "2026-07-21"
      },
      puerto_tigre: {
        nivel: 6.71,
        variacion: -0.07,
        fecha: "2026-07-21"
      },
      salto_guaira: {
        nivel: 6.69,
        variacion: -0.03,
        fecha: "2026-07-21"
      },
      cde: {
        nivel: 10.81,
        variacion: 0.55,
        fecha: "2026-07-20"
      },
      cerrito: {
        nivel: 1.52,
        variacion: -0.21,
        fecha: "2026-07-21"
      },
      ita_piru: {
        nivel: 3.38,
        variacion: -0.04,
        fecha: "2026-07-21"
      },
      paso_patria: {
        nivel: 4.03,
        variacion: 0,
        fecha: "2026-07-21"
      },
      ayolas: {
        nivel: 1.9,
        variacion: 0.2,
        fecha: "2026-07-21"
      },
      panchito_lopez: {
        nivel: 2.79,
        variacion: -0.01,
        fecha: "2026-07-21"
      },
      coratei: {
        nivel: 1.7,
        variacion: 0.3,
        fecha: "2026-07-21"
      },
      ita_cora: {
        nivel: 3.2,
        variacion: -0.15,
        fecha: "2026-07-21"
      },
      san_cosme: {
        nivel: 9.85,
        variacion: -0.03,
        fecha: "2026-07-21"
      },
      encarnacion: {
        nivel: 9.91,
        variacion: -0.11,
        fecha: "2026-07-21"
      },
      pozo_hondo: {
        nivel: 3.05,
        variacion: 0,
        fecha: "2026-07-20"
      },
      villa_florida: {
        nivel: 0.32,
        variacion: 0.32,
        fecha: "2025-02-28",
        estado: "antiguo"
      },
      estacion_arirai: {
        nivel: 4.84,
        variacion: -0.01,
        fecha: "2026-07-21"
      }
    }
  },
  {
    fecha: "2026-07-22",
    estaciones: {
      puerto_ladario: {
        nivel: 2.54,
        variacion: 0,
        fecha: "2026-07-22"
      },
      puerto_murtinho: {
        nivel: 3.24,
        variacion: -0.02,
        fecha: "2026-07-22"
      },
      caceres: {
        nivel: 1.23,
        variacion: -0.04,
        fecha: "2026-07-22"
      },
      isla_margarita: {
        nivel: 3.26,
        variacion: 0.01,
        fecha: "2026-07-22"
      },
      fuerte_olimpo: {
        nivel: 4.16,
        variacion: 0,
        fecha: "2026-07-22"
      },
      bahia_negra: {
        nivel: 4.16,
        variacion: 0,
        fecha: "2026-07-22"
      },
      vallemi: {
        nivel: 3.07,
        variacion: 0,
        fecha: "2026-07-22"
      },
      concepcion: {
        nivel: 2.32,
        variacion: -0.02,
        fecha: "2026-07-22"
      },
      rosario: {
        nivel: 1.99,
        variacion: -0.01,
        fecha: "2026-07-22"
      },
      puerto_antequera: {
        nivel: 2,
        variacion: -0.05,
        fecha: "2026-07-14"
      },
      villeta: {
        nivel: 2.34,
        variacion: -0.01,
        fecha: "2026-07-22"
      },
      asuncion: {
        nivel: 1.85,
        variacion: -0.01,
        fecha: "2026-07-22"
      },
      ita_enramada: {
        nivel: 2.34,
        variacion: -0.04,
        fecha: "2026-07-22"
      },
      humaita: {
        nivel: 3.28,
        variacion: -0.04,
        fecha: "2026-07-22"
      },
      alberdi: {
        nivel: 4.09,
        variacion: -0.05,
        fecha: "2026-07-22"
      },
      pilar: {
        nivel: 4.13,
        variacion: -0.04,
        fecha: "2026-07-22"
      },
      puerto_tigre: {
        nivel: 6.63,
        variacion: -0.08,
        fecha: "2026-07-22"
      },
      salto_guaira: {
        nivel: 6.62,
        variacion: -0.07,
        fecha: "2026-07-22"
      },
      cde: {
        nivel: 11.32,
        variacion: 0.51,
        fecha: "2026-07-21"
      },
      cerrito: {
        nivel: 1.7,
        variacion: 0.18,
        fecha: "2026-07-22"
      },
      ita_piru: {
        nivel: 3.43,
        variacion: 0.05,
        fecha: "2026-07-22"
      },
      paso_patria: {
        nivel: 4.05,
        variacion: 0.02,
        fecha: "2026-07-22"
      },
      ayolas: {
        nivel: 2,
        variacion: 0.1,
        fecha: "2026-07-22"
      },
      panchito_lopez: {
        nivel: 3,
        variacion: 0.21,
        fecha: "2026-07-22"
      },
      coratei: {
        nivel: 1.9,
        variacion: 0.2,
        fecha: "2026-07-22"
      },
      ita_cora: {
        nivel: 3.25,
        variacion: 0.05,
        fecha: "2026-07-22"
      },
      san_cosme: {
        nivel: 9.85,
        variacion: 0,
        fecha: "2026-07-22"
      },
      encarnacion: {
        nivel: 9.93,
        variacion: 0.02,
        fecha: "2026-07-22"
      },
      pozo_hondo: {
        nivel: 3.07,
        variacion: -0.02,
        fecha: "2026-07-22"
      },
      villa_florida: {
        nivel: 0.32,
        variacion: 0.32,
        fecha: "2025-02-28",
        estado: "antiguo"
      },
      estacion_arirai: {
        nivel: 4.84,
        variacion: 0,
        fecha: "2026-07-22"
      }
    }
  }
];
/* DMH_AUTO_END */

window.OBSERVATORIO_DATA_INFO = Object.freeze({
  version: APP_VERSION,
  seriesDesde: SERIES_DESDE,
  estaciones: ESTACIONES_BASE.length,
  semillas: SEEDS.length + EXTRA_SEEDS.length + DMH_AUTO_SEEDS.length + 1,
  ultimaFecha: [...SEEDS,...DMH_AUTO_SEEDS].at(-1)?.fecha || null
});
