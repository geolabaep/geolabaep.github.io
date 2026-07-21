'use strict';

const fs=require('fs');
const path=require('path');
const {readDataContext,validateHistory}=require('./dmh-sync');

const root=path.resolve(__dirname,'..');
const read=filename=>fs.readFileSync(path.join(root,filename),'utf8');
const fail=message=>{throw new Error(message);};

const history=JSON.parse(read('data/historico-dmh.json'));
validateHistory(history,{minimumBulletins:1,minimumStations:30});

const dataSource=read('data/datos.js');
const seeds=readDataContext(dataSource).DMH_AUTO_SEEDS||[];
if(JSON.stringify(seeds)!==JSON.stringify(history.boletines))fail('datos.js y historico-dmh.json no contienen los mismos boletines.');

const index=read('index.html');
if(/data:image\/(?:png|jpeg|webp);base64/i.test(index))fail('index.html todavía contiene imágenes base64 embebidas.');
for(const filename of ['assets/logo-aep.png','assets/logo-geolab.png','css/observatorio.css','data/datos.js','js/bootstrap.js']){
  if(!fs.existsSync(path.join(root,filename)))fail(`Falta el archivo requerido ${filename}.`);
}

const version=JSON.parse(read('version.json')).version;
if(!index.includes(`data-app-version="${version}"`))fail(`La versión ${version} no coincide con index.html.`);

const dates=history.boletines.map(item=>item.fecha);
console.log(JSON.stringify({ok:true,version,boletines:dates.length,desde:dates[0],hasta:dates.at(-1),estacionesUltimoBoletin:Object.keys(history.boletines.at(-1).estaciones).length},null,2));
