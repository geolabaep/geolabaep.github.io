/* Arranque coordinado y contrato mínimo de regresión. */
function runRegressionChecks(){
 const checks=[];
 const assert=(name,condition)=>checks.push({name,ok:Boolean(condition)});
 assert('nivel en metros',FORMATTERS.level(2.5)==='2.50 m');
 assert('delta menor a un metro en cm',FORMATTERS.delta(0.05)==='+5 cm');
 assert('delta negativo en cm',FORMATTERS.delta(-0.06)==='−6 cm');
 assert('delta de un metro o más en m',FORMATTERS.delta(1.38)==='+1.38 m');
 assert('límite exacto de un metro',FORMATTERS.delta(1)==='+1.00 m');
 assert('límite negativo de un metro',FORMATTERS.delta(-1)==='−1.00 m');
 assert('redondeo flotante evita 100 cm',FORMATTERS.delta(0.999999999)==='+1.00 m');
 assert('delta con icono',FORMATTERS.delta(-0.05,{absolute:true,icon:true})==='↓ 5 cm');
 assert('estado de movimiento',CALCULATIONS.movement(0)==='stable'&&CALCULATIONS.movement(1)==='up');
 assert('motor analítico disponible',typeof analyzeHydrology==='function');
 assert('índice por fecha disponible',DATA_INDEX.byDate instanceof Map&&DATA_INDEX.dates.length===state.boletines.length);
 assert('serie indexada disponible',Array.isArray(historial('asuncion')));
 assert('racha consecutiva disponible',typeof consecutiveMovement==='function');
 assert('fechas indexadas válidas',DATA_INDEX.dates.every(fecha=>/^\d{4}-\d{2}-\d{2}$/.test(fecha)));
 assert('boletines con estructura válida',state.boletines.every(b=>b&&b.estaciones&&typeof b.estaciones==='object'));
 assert('última actualización disponible',latest()?.fecha===window.OBSERVATORIO_DATA_INFO?.ultimaFecha);
 assert('red operativa completa',Object.keys(latest()?.estaciones||{}).length>=30);
 assert('fecha local estable',todayISO(new Date(2026,6,20,23,30))==='2026-07-20');
 const failed=checks.filter(test=>!test.ok);
 if(failed.length)console.error('[Observatorio] Fallaron pruebas de regresión:',failed);
 else console.info(`[Observatorio] ${checks.length} pruebas de regresión superadas.`);
 return {total:checks.length,failed};
}

load();
runRegressionChecks();
initMap();
renderAll();
