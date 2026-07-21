'use strict';
const assert=require('assert');
const {emptyHistory,upsertHistory,renderDataFromHistory}=require('./dmh-sync');

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
console.log(JSON.stringify({pruebas:8,boletines:history.boletines.length,restauracion:true},null,2));
