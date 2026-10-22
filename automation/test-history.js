'use strict';
const assert=require('assert');
const {emptyHistory,upsertHistory,validateHistory,renderDataFromHistory,paraguayToday,sourceRequestUrl}=require('./dmh-sync');

const station=(nivel,fecha='2026-07-20')=>({nivel,variacion:0,fecha});
const first={fecha:'2026-07-20',estaciones:{puerto_ladario:station(2.56,'2026-07-19'),caceres:station(1.33,'2026-07-19')}};
const corrected={fecha:'2026-07-20',estaciones:{puerto_ladario:station(2.53),caceres:station(1.30)}};
const next={fecha:'2026-07-21',estaciones:{puerto_ladario:station(2.51,'2026-07-21'),caceres:station(1.28,'2026-07-21')}};
const history=emptyHistory();

assert.strictEqual(upsertHistory(history,first).mode,'agregado');
assert.strictEqual(upsertHistory(history,corrected).mode,'corregido');
assert.strictEqual(history.boletines.length,1);
assert.strictEqual(history.boletines[0].estaciones.puerto_ladario.nivel,2.53);
assert.strictEqual(upsertHistory(history,corrected).mode,'sin_cambios');
assert.strictEqual(upsertHistory(history,next).mode,'agregado');
assert.strictEqual(history.boletines.length,2);
const restored=renderDataFromHistory('/* DMH_AUTO_START\nconst DMH_AUTO_SEEDS = [];\n/* DMH_AUTO_END */',history);
assert.match(restored,/2026-07-20/);assert.match(restored,/2026-07-21/);assert.match(restored,/puerto_ladario/);
assert.strictEqual(paraguayToday(new Date('2026-07-21T12:00:00Z')),'2026-07-21');
assert.match(sourceRequestUrl(2),/_observatorio=\d+-2$/);
assert.strictEqual(validateHistory(history,{minimumBulletins:2,minimumStations:2}),true);
assert.throws(()=>validateHistory({...history,boletines:[history.boletines[0]]},{minimumBulletins:2,minimumStations:2}),/reducir/);
assert.throws(()=>upsertHistory(history,{fecha:'2026-07-21',estaciones:{puerto_ladario:station(2.50,'2026-07-21')}}),/bajaría/);
console.log(JSON.stringify({pruebas:13,boletines:history.boletines.length,restauracion:true,anticache:true,proteccionHistorial:true},null,2));


// El boletín automático conserva los extremos para actualizar las tarjetas.
const {bulletinFromParsed}=require('./dmh-sync');
const extrema={nivel:8.45,fecha:'2026-10-22'};
const parsedBulletin=bulletinFromParsed({latestDate:'2026-10-22',observations:[{id:'ita_cora',nivel:8.45,variacion:0.03,fecha:'2026-10-22',maximo:extrema,minimo:{nivel:0.60,fecha:'2021-05-24'}}]});
assert.deepStrictEqual(parsedBulletin.estaciones.ita_cora.maximo,extrema);
assert.match(parsedBulletin.estaciones.ita_cora.source,/meteorologia.gov.py/);
console.log('Extremos históricos y fuente conservados en boletines automáticos.');
