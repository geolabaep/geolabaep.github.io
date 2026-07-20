
/* ==========================================================
   CONFIGURACIÓN CENTRAL · v3.7.1
   Núcleo compartido: estado, persistencia, índices y utilidades.
   Mantiene compatibilidad de almacenamiento con versiones anteriores.
   ========================================================== */
const APP_CONFIG = Object.freeze({
  version: '3.7.1',
  staleDataDays: 10,
  storageKey: 'rios_py_boletines_publicacion',
  defaultTrendPeriod: 7,
  movementTolerance: 0
});
const UMBRAL_DESACTUALIZADO_DIAS = APP_CONFIG.staleDataDays;
const STORAGE_KEY = APP_CONFIG.storageKey;

let state = {
  boletines: [],
  fechaVista: null,
  filtroCarga: 'todos',
  filtroPanel: 'todos',
  busqueda: '',
  marcador: {},
  map: null,
  mapLegendEl: null,
  mapPanoramaEl: null,
  mapMode: 'daily',
  mapTrendPeriod: APP_CONFIG.defaultTrendPeriod,
  mapMovement: 'all',
  calendarMonth: null
};
/* Utilidades base: sin dependencias de interfaz */
function qs(selector){ return document.querySelector(selector); }
function qsa(selector){ return Array.from(document.querySelectorAll(selector)); }
function fmtDate(iso){
  if(!iso) return '—';
  const [year,month,day] = iso.split('-');
  return `${day}/${month}/${year}`;
}
function todayISO(date=new Date()){
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function days(from,to){
  if(!from||!to) return 9999;
  return Math.round((new Date(to)-new Date(from))/86400000);
}
function trendClass(value){ return value>0?'up':value<0?'down':'stable'; }
function trendIcon(value){ return value>0?'↑':value<0?'↓':'→'; }
function num(value){
  if(value===''||value==null) return null;
  const parsed = Number(String(value).replace(',','.'));
  return Number.isNaN(parsed) ? null : parsed;
}
function readStoredBulletins(){ return []; }
function writeStoredBulletins(){ return false; }

/* ==========================================================
   NÚCLEO COMPARTIDO DE FORMATO Y CÁLCULO
   Una sola fuente de verdad para unidades y comparaciones.
   ========================================================== */
const FORMATTERS = Object.freeze({
  level(value){
    return value==null||Number.isNaN(Number(value)) ? '—' : `${Number(value).toFixed(2)} m`;
  },
  delta(value,{absolute=false,icon=false}={}){
    if(value==null||Number.isNaN(Number(value)))return '—';
    const n=Number(value);
    const magnitude=Math.abs(n);
    // Se redondea primero a centímetros para evitar resultados como 100 cm
    // causados por imprecisiones de coma flotante (p. ej. 0.999999999 m).
    const roundedCm=Math.round(magnitude*100);
    const sign=absolute?'':(n>0?'+':n<0?'−':'');
    const formatted=roundedCm>=100
      ? `${(roundedCm/100).toFixed(2)} m`
      : `${roundedCm} cm`;
    return `${icon?trendIcon(n)+' ':''}${sign}${formatted}`;
  },
  date: fmtDate
});
const CALCULATIONS = Object.freeze({
  periodDelta(id,periodDays,viewDate=state.fechaVista){
    const current=stationData(id,viewDate);
    if(!current||current.nivel==null||estadoEstacion(current,viewDate)!=='ok')return null;
    const rows=historial(id);if(!rows.length)return null;
    const viewIdx=rows.findIndex(row=>row.fechaBoletin===viewDate);
    const end=viewIdx>=0?viewIdx+1:rows.length;
    const base=findLastOnOrBefore(rows,addDays(viewDate,-periodDays),end);
    if(!base||base.nivel==null)return null;
    return {delta:Number(current.nivel)-Number(base.nivel),base,current};
  },
  movement(value){ return value>0?'up':value<0?'down':'stable'; }
});

// Índices y cachés derivados: evitan recorrer y ordenar toda la base en cada render.
const DATA_INDEX={byDate:new Map(),dates:[],series:new Map(),revision:0};
const DERIVED_CACHE={summary:new Map(),coverage:new Map(),analysis:new Map()};
function clearDerivedCaches(){DERIVED_CACHE.summary.clear();DERIVED_CACHE.coverage.clear();DERIVED_CACHE.analysis.clear()}
function rebuildDataIndex(){
 DATA_INDEX.byDate=new Map();DATA_INDEX.series=new Map();
 state.boletines.sort((a,b)=>a.fecha.localeCompare(b.fecha));
 state.boletines.forEach(b=>{
  DATA_INDEX.byDate.set(b.fecha,b);
  Object.entries(b.estaciones||{}).forEach(([id,d])=>{
   if(!DATA_INDEX.series.has(id))DATA_INDEX.series.set(id,[]);
   DATA_INDEX.series.get(id).push({fechaBoletin:b.fecha,...d});
  });
 });
 DATA_INDEX.dates=state.boletines.map(b=>b.fecha);
 DATA_INDEX.revision++;clearDerivedCaches();
}
function mergeSeedBulletin(existing,seed){
 const merged={...seed,...existing,estaciones:{...(seed.estaciones||{})}};
 Object.entries(existing.estaciones||{}).forEach(([id,d])=>{
  const isUserEntry=d&&(d.estado==='actualizada'||d.observacion);
  if(isUserEntry||!merged.estaciones[id])merged.estaciones[id]=d;
 });
 return merged;
}
function load(){
 state.boletines=[VILLA_FLORIDA_PUNTUAL,...SEEDS,...EXTRA_SEEDS,...DMH_AUTO_SEEDS]
  .filter(seed=>seed&&typeof seed.fecha==='string'&&seed.estaciones&&typeof seed.estaciones==='object')
  .map(seed=>{const base=JSON.parse(JSON.stringify(seed));base.estado='publicado';return base});
 state.boletines.forEach(b=>{if(b.fecha!=='2025-02-28'&&b.estaciones?.villa_florida)delete b.estaciones.villa_florida});
 rebuildDataIndex();
 state.fechaVista=boletin(todayISO())?todayISO():(DATA_INDEX.dates.at(-1)||todayISO());
}
function save(){ return false; }
function boletin(fecha=state.fechaVista){return DATA_INDEX.byDate.get(fecha)||null}
function latest(){return DATA_INDEX.byDate.get(DATA_INDEX.dates.at(-1))||null}
function stationData(id,fecha=state.fechaVista){return DATA_INDEX.byDate.get(fecha)?.estaciones?.[id]||null}
/* Consultas compartidas por el visor público y el maestro. Deben vivir en el
   núcleo: el módulo update.js no se publica porque contiene edición. */
function historial(id){return DATA_INDEX.series.get(id)||[]}
function openStation(id){
 setTab('history');
 setTimeout(()=>{
  const select=qs('#histStation');
  if(select)select.value=id;
  renderHistory(id);
 },0);
}
function findLastOnOrBefore(rows,target,endExclusive=rows.length){let lo=0,hi=Math.min(endExclusive,rows.length)-1,ans=-1;while(lo<=hi){const mid=(lo+hi)>>1;if(rows[mid].fechaBoletin<=target){ans=mid;lo=mid+1}else hi=mid-1}return ans>=0?rows[ans]:null}
function estadoEstacion(d,fecha){
  if(!d||d.nivel==null)return'sin';
  if(d.fecha!==fecha)return'anterior';
  return'ok'
}
function labelEstado(e){return{ok:'Actualizada',anterior:'Desactualizada',pendiente:'Desactualizada',antiguo:'Desactualizada',sin:'Sin dato'}[e]||'Sin dato'}
function clsEstado(e){return e==='ok'?'st-ok':e==='sin'?'st-empty':'st-anterior'}
function resumen(fecha=state.fechaVista){const key=`${DATA_INDEX.revision}:${fecha}`;if(DERIVED_CACHE.summary.has(key))return DERIVED_CACHE.summary.get(key);const b=boletin(fecha);let r={total:ESTACIONES_BASE.length,ok:0,pend:0,old:0,sin:0,anterior:0};ESTACIONES_BASE.forEach(s=>{const e=estadoEstacion(b?.estaciones?.[s.id],fecha);if(e==='ok')r.ok++;else if(e==='sin')r.sin++;else {r.pend++;r.anterior++}});DERIVED_CACHE.summary.set(key,r);return r}
function setTab(t){const order={monitor:0,ops:1,history:2,method:3};const screen=qs(`#screen-${t}`),tab=qsa('.tab')[order[t]];if(!screen||!tab)return;qsa('.tab').forEach(x=>x.classList.remove('active'));qsa('.screen').forEach(x=>x.classList.remove('active'));screen.classList.add('active');tab.classList.add('active');if(t==='history')renderHistory();if(t==='ops')renderOps();if(t==='method')renderMethodology();setTimeout(()=>state.map?.invalidateSize(),100)}
