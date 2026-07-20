'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {parseDmhHtml}=require('./dmh-parser');

const SOURCE='https://www.meteorologia.gov.py/nivel-rio/indexconvencional.php';
const root=path.resolve(__dirname,'..');
const dataArg=process.argv.find(value=>value.startsWith('--data='));
const htmlArg=process.argv.find(value=>value.startsWith('--html='));
const dataFile=dataArg?path.resolve(process.cwd(),dataArg.slice(7)):path.join(root,'data','datos.js');

function readDataContext(source){
  const sandbox={window:{},console};sandbox.window=sandbox;vm.createContext(sandbox);
  vm.runInContext(`${source}\nwindow.__DMH_SYNC__={SEEDS,EXTRA_SEEDS,DMH_AUTO_SEEDS,VILLA_FLORIDA_PUNTUAL};`,sandbox,{timeout:3000});
  return sandbox.__DMH_SYNC__;
}
function comparable(item){return {nivel:Number(item.nivel),variacion:Number(item.variacion),fecha:item.fecha};}
function sameBulletin(existing,next){
  if(!existing)return false;const a=existing.estaciones||{},b=next.estaciones||{};
  return Object.keys(b).every(id=>a[id]&&JSON.stringify(comparable(a[id]))===JSON.stringify(comparable(b[id])));
}
function formatSeeds(seeds){return JSON.stringify(seeds,null,2).replace(/"([a-z_]+)":/g,'$1:');}
function updateSource(source,parsed){
  const data=readDataContext(source),bulletin={fecha:parsed.latestDate,estaciones:{}};
  for(const row of parsed.observations){
    bulletin.estaciones[row.id]={nivel:row.nivel,variacion:row.variacion,fecha:row.fecha};
    if(row.id==='villa_florida'&&row.fecha<parsed.latestDate)bulletin.estaciones[row.id].estado='antiguo';
  }
  const all=[data.VILLA_FLORIDA_PUNTUAL,...data.SEEDS,...data.EXTRA_SEEDS,...data.DMH_AUTO_SEEDS];
  const current=[...all].reverse().find(seed=>seed.fecha===bulletin.fecha);
  if(sameBulletin(current,bulletin))return {source,changed:false,date:bulletin.fecha,count:Object.keys(bulletin.estaciones).length};
  const seeds=data.DMH_AUTO_SEEDS.filter(seed=>seed.fecha!==bulletin.fecha);seeds.push(bulletin);seeds.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const replacement=`/* DMH_AUTO_START\n   Este bloque es mantenido exclusivamente por automation/dmh-sync.js.\n   No editar manualmente: cada entrada conserva la fecha real de su estación. */\nconst DMH_AUTO_SEEDS = ${formatSeeds(seeds)};\n/* DMH_AUTO_END */`;
  const updated=source.replace(/\/\* DMH_AUTO_START[\s\S]*?\/\* DMH_AUTO_END \*\//,replacement);
  if(updated===source)throw new Error('No se encontró el bloque DMH_AUTO en datos.js.');
  return {source:updated,changed:true,date:bulletin.fecha,count:Object.keys(bulletin.estaciones).length};
}
async function fetchHtml(){
  if(htmlArg)return fs.readFileSync(path.resolve(process.cwd(),htmlArg.slice(7)),'utf8');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{
    const response=await fetch(SOURCE,{signal:controller.signal,headers:{'user-agent':'GEOlab-Observatorio-Hidrologico/3.7 (+https://geolabaep.github.io/)','accept':'text/html'}});
    if(!response.ok)throw new Error(`DMH respondió HTTP ${response.status}.`);return await response.text();
  }finally{clearTimeout(timer);}
}
async function main(){
  if(!fs.existsSync(dataFile))throw new Error(`No existe el archivo de datos: ${dataFile}`);
  const parsed=parseDmhHtml(await fetchHtml()),original=fs.readFileSync(dataFile,'utf8'),result=updateSource(original,parsed);
  if(result.changed){const temporary=`${dataFile}.tmp`;fs.writeFileSync(temporary,result.source);fs.renameSync(temporary,dataFile);}
  console.log(JSON.stringify({fuente:SOURCE,fecha:result.date,estaciones:result.count,desconocidas:parsed.unknown,actualizado:result.changed},null,2));
}
if(require.main===module)main().catch(error=>{console.error(`[DMH] ${error.message}`);process.exitCode=1;});
module.exports={readDataContext,sameBulletin,updateSource};
