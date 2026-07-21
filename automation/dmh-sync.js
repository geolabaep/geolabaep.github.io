'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {parseDmhHtml}=require('./dmh-parser');

const SOURCE='https://www.meteorologia.gov.py/nivel-rio/indexconvencional.php';
const SCHEMA_VERSION=1;
const root=path.resolve(__dirname,'..');
const argument=name=>process.argv.find(value=>value.startsWith(`--${name}=`))?.slice(name.length+3);
const dataFile=path.resolve(process.cwd(),argument('data')||path.join(root,'data','datos.js'));
const historyFile=path.resolve(process.cwd(),argument('history')||path.join(root,'data','historico-dmh.json'));
const indexFile=path.resolve(process.cwd(),argument('index')||path.join(root,'index.html'));
const htmlFile=argument('html');
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));

function paraguayToday(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Asuncion',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const value=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}
function sourceRequestUrl(attempt=1){
  const separator=SOURCE.includes('?')?'&':'?';
  return `${SOURCE}${separator}_observatorio=${Date.now()}-${attempt}`;
}

function readDataContext(source){
  const sandbox={window:{},console};sandbox.window=sandbox;vm.createContext(sandbox);
  vm.runInContext(`${source}\nwindow.__DMH_SYNC__={DMH_AUTO_SEEDS};`,sandbox,{timeout:3000});
  return sandbox.__DMH_SYNC__;
}
function comparable(item){return {nivel:Number(item.nivel),variacion:Number(item.variacion),fecha:item.fecha,estado:item.estado||undefined};}
function sameBulletin(existing,next){
  if(!existing)return false;const a=existing.estaciones||{},b=next.estaciones||{},ids=Object.keys(b);
  return ids.length===Object.keys(a).length&&ids.every(id=>a[id]&&JSON.stringify(comparable(a[id]))===JSON.stringify(comparable(b[id])));
}
function validBulletin(seed){return seed&&/^\d{4}-\d{2}-\d{2}$/.test(seed.fecha)&&seed.estaciones&&typeof seed.estaciones==='object';}
function emptyHistory(){return {schemaVersion:SCHEMA_VERSION,fuente:SOURCE,actualizadoEn:null,boletines:[]};}
function readHistory(dataSource){
  let history=emptyHistory();
  if(fs.existsSync(historyFile)){
    history=JSON.parse(fs.readFileSync(historyFile,'utf8'));
    if(history.schemaVersion!==SCHEMA_VERSION||!Array.isArray(history.boletines))throw new Error('El historial DMH tiene un formato incompatible.');
  }
  const migrated=readDataContext(dataSource).DMH_AUTO_SEEDS||[];
  const byDate=new Map(history.boletines.filter(validBulletin).map(seed=>[seed.fecha,seed]));
  for(const seed of migrated.filter(validBulletin))if(!byDate.has(seed.fecha))byDate.set(seed.fecha,seed);
  history.boletines=[...byDate.values()].sort((a,b)=>a.fecha.localeCompare(b.fecha));
  history.fuente=SOURCE;
  return history;
}
function bulletinFromParsed(parsed){
  const bulletin={fecha:parsed.latestDate,estaciones:{}};
  for(const row of parsed.observations){
    bulletin.estaciones[row.id]={nivel:row.nivel,variacion:row.variacion,fecha:row.fecha};
    if(row.id==='villa_florida'&&row.fecha<parsed.latestDate)bulletin.estaciones[row.id].estado='antiguo';
  }
  return bulletin;
}
function upsertHistory(history,bulletin){
  const index=history.boletines.findIndex(seed=>seed.fecha===bulletin.fecha);
  if(index>=0&&sameBulletin(history.boletines[index],bulletin))return {changed:false,mode:'sin_cambios'};
  if(index>=0)history.boletines[index]=bulletin;else history.boletines.push(bulletin);
  history.boletines.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  history.actualizadoEn=new Date().toISOString();
  return {changed:true,mode:index>=0?'corregido':'agregado'};
}
function formatSeeds(seeds){return JSON.stringify(seeds,null,2).replace(/"([a-z_]+)":/g,'$1:');}
function renderDataFromHistory(source,history){
  const replacement=`/* DMH_AUTO_START\n   Bloque derivado de data/historico-dmh.json. No editar manualmente. */\nconst DMH_AUTO_SEEDS = ${formatSeeds(history.boletines)};\n/* DMH_AUTO_END */`;
  const updated=source.replace(/\/\* DMH_AUTO_START[\s\S]*?\/\* DMH_AUTO_END \*\//,replacement);
  if(updated===source&&!source.includes(replacement))throw new Error('No se encontró el bloque DMH_AUTO en datos.js.');
  return updated;
}
function updateIndexCacheKey(source,date){
  const key=`dmh-${date.replaceAll('-','')}-${Date.now()}`;
  return source.replace(/data\/datos\.js\?v=[^"']+/g,`data/datos.js?v=${key}`);
}
function writeAtomic(filename,content){
  fs.mkdirSync(path.dirname(filename),{recursive:true});const temporary=`${filename}.tmp`;
  fs.writeFileSync(temporary,content);fs.renameSync(temporary,filename);
}
async function fetchHtml(attempt=1){
  if(htmlFile)return fs.readFileSync(path.resolve(process.cwd(),htmlFile),'utf8');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{
    const response=await fetch(sourceRequestUrl(attempt),{signal:controller.signal,cache:'no-store',headers:{
      'user-agent':'GEOlab-Observatorio-Hidrologico/3.7 (+https://geolabaep.github.io/)',
      'accept':'text/html','cache-control':'no-cache, no-store, max-age=0','pragma':'no-cache'
    }});
    if(!response.ok)throw new Error(`DMH respondió HTTP ${response.status}.`);return await response.text();
  }finally{clearTimeout(timer);}
}
async function fetchLatestParsed(){
  if(htmlFile)return parseDmhHtml(await fetchHtml());
  const expected=paraguayToday();let parsed=null;
  for(let attempt=1;attempt<=3;attempt++){
    parsed=parseDmhHtml(await fetchHtml(attempt));
    if(parsed.latestDate>=expected)return parsed;
    if(attempt<3){
      console.warn(`[DMH] La fuente respondió con ${parsed.latestDate}; se esperaba ${expected}. Reintento ${attempt}/2 sin caché.`);
      await wait(attempt*5000);
    }
  }
  return parsed;
}
async function main(){
  if(!fs.existsSync(dataFile))throw new Error(`No existe el archivo de datos: ${dataFile}`);
  const parsed=await fetchLatestParsed(),originalData=fs.readFileSync(dataFile,'utf8');
  const history=readHistory(originalData),bulletin=bulletinFromParsed(parsed),result=upsertHistory(history,bulletin);
  const renderedData=renderDataFromHistory(originalData,history);
  const historyText=JSON.stringify(history,null,2)+'\n';
  const historyChanged=!fs.existsSync(historyFile)||fs.readFileSync(historyFile,'utf8')!==historyText;
  const dataChanged=renderedData!==originalData;
  if(historyChanged)writeAtomic(historyFile,historyText);
  if(dataChanged)writeAtomic(dataFile,renderedData);
  let indexChanged=false;
  if((historyChanged||dataChanged)&&fs.existsSync(indexFile)){
    const originalIndex=fs.readFileSync(indexFile,'utf8'),updatedIndex=updateIndexCacheKey(originalIndex,bulletin.fecha);
    indexChanged=updatedIndex!==originalIndex;if(indexChanged)writeAtomic(indexFile,updatedIndex);
  }
  const report={fuente:SOURCE,fecha:bulletin.fecha,fechaEsperada:paraguayToday(),estaciones:Object.keys(bulletin.estaciones).length,
    boletinesGuardados:history.boletines.length,operacion:result.mode,archivos:{historial:historyChanged,datos:dataChanged,index:indexChanged},
    desconocidas:parsed.unknown,actualizado:historyChanged||dataChanged||indexChanged};
  console.log(JSON.stringify(report,null,2));
  if(process.env.GITHUB_STEP_SUMMARY){
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Resultado de la consulta DMH\n\n- Fecha leída: **${report.fecha}**\n- Fecha esperada en Paraguay: **${report.fechaEsperada}**\n- Estaciones reconocidas: **${report.estaciones}**\n- Operación: **${report.operacion}**\n- Archivos modificados: **${report.actualizado?'sí':'no'}**\n`);
  }
}
if(require.main===module)main().catch(error=>{console.error(`[DMH] ${error.message}`);process.exitCode=1;});
module.exports={readDataContext,sameBulletin,emptyHistory,readHistory,bulletinFromParsed,upsertHistory,renderDataFromHistory,updateIndexCacheKey,paraguayToday,sourceRequestUrl};
