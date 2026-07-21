/* Centro operativo, metodología y motor de análisis hidrológico. */
function estacionesConDatos(fecha=state.fechaVista){return ESTACIONES_BASE.map(est=>{const d=stationData(est.id,fecha);const e=estadoEstacion(d,fecha);const hist=historial(est.id);const prev=hist.filter(x=>x.fechaBoletin<fecha).at(-1);return {est,d,e,prev}})}
function rankingCambios(tipo='subida'){return estacionesConDatos().filter(x=>x.d&&x.d.variacion!=null).sort((a,b)=>tipo==='subida'?b.d.variacion-a.d.variacion:a.d.variacion-b.d.variacion)}
function estadoConteoV2(){const c={total:ESTACIONES_BASE.length,actualizadas:0,desactualizadas:0,sinDato:0};ESTACIONES_BASE.forEach(est=>{const d=stationData(est.id,state.fechaVista);const e=estadoEstacion(d,state.fechaVista);if(e==='ok')c.actualizadas++;else if(e==='sin')c.sinDato++;else c.desactualizadas++;});c.fechaAnterior=c.desactualizadas;c.fechaDistinta=c.desactualizadas;c.pendientes=0;return c}
function renderMiniSpark(data){if(!data||data.length<2)return '<div class="ops-note">Sin datos suficientes para mostrar la evolución observada.</div>';const w=220,h=44,p=4;const vals=data.map(x=>x.nivel),min=Math.min(...vals),max=Math.max(...vals),span=(max-min)||1;const pts=data.map((d,i)=>[p+i*(w-2*p)/Math.max(1,data.length-1),h-p-(d.nivel-min)/span*(h-2*p)]);const path=pts.map((pt,i)=>(i?'L':'M')+pt[0]+','+pt[1]).join(' ');return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${path}" fill="none" stroke="#4fb3a9" stroke-width="3"/><g>${pts.map(pt=>`<circle cx="${pt[0]}" cy="${pt[1]}" r="2.3" fill="#e8a33d"/>`).join('')}</g></svg>`}

function estacionesActualizadasOperativas(){return estacionesConDatos().filter(x=>x.e==='ok'&&x.d)}
function estacionesRevisionOperativa(){return estacionesConDatos().filter(x=>x.e==='anterior'||x.e==='antiguo'||x.e==='sin'||x.e==='pendiente')}
function opsReviewBadge(e){if(e==='sin')return '<span class="ops-review-tag empty">Sin dato</span>';return '<span class="ops-review-tag old">Desactualizada</span>'}
function extremosActualizados(){const actualizadas=estacionesActualizadasOperativas();const conNivel=actualizadas.filter(x=>x.d&&x.d.nivel!=null);const mayorNivel=conNivel.slice().sort((a,b)=>b.d.nivel-a.d.nivel)[0];const menorNivel=conNivel.slice().sort((a,b)=>a.d.nivel-b.d.nivel)[0];const mayorSubida=actualizadas.filter(x=>x.d.variacion>0).sort((a,b)=>b.d.variacion-a.d.variacion)[0];const mayorBajada=actualizadas.filter(x=>x.d.variacion<0).sort((a,b)=>a.d.variacion-b.d.variacion)[0];return {mayorNivel,menorNivel,mayorSubida,mayorBajada}}

function variacionPeriodoEstacion(id,dias){
 const result=CALCULATIONS.periodDelta(id,dias);
 if(!result)return null;
 const est=STATION_BY_ID.get(id);
 return {est,d:result.current,base:result.base,delta:result.delta,dias};
}
function extremosPeriodo(dias){
 const rows=ESTACIONES_BASE.map(e=>variacionPeriodoEstacion(e.id,dias)).filter(Boolean);
 const subidas=rows.filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta);
 const bajadas=rows.filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta);
 return {mayorSubida:subidas[0]||null,mayorBajada:bajadas[0]||null,rows};
}


function opsDonutHtml(c){const total=c.total||1;const ok=(c.actualizadas/total)*360;const des=((c.actualizadas+c.desactualizadas)/total)*360;return `<div class="ops-donut-wrap"><div class="ops-donut" data-label="${c.actualizadas}/${c.total}" style="--okDeg:${ok}deg;--pendDeg:${des}deg;--oldDeg:${des}deg"></div><div class="ops-donut-legend"><div><span>Actualizadas</span><b>${c.actualizadas}</b></div><div><span>Desactualizadas</span><b>${c.desactualizadas}</b></div><div><span>Sin dato</span><b>${c.sinDato}</b></div></div></div>`}
function renderMethodology(){
 const riosResumen={};
 ESTACIONES_BASE.forEach(est=>{riosResumen[est.rio]=(riosResumen[est.rio]||0)+1});
 const riosHtml=Object.entries(riosResumen).map(([rio,total])=>`<div class="method-v101-metric"><b>${total}</b><span>${rio}</span></div>`).join('');
 const html=`<div class="history-intro"><div><h2 class="history-title">Metodología</h2><div class="history-subtitle">Marco operativo y analítico del Observatorio: fuentes, tratamiento, indicadores, exploración histórica, calidad de datos y criterios de ingeniería.</div></div><div class="pill">Versión <strong>v3.0.0</strong></div></div>
 <div class="method-v101-layout">
  <div class="method-v101-section method-v101-wide"><h3>1. Objetivo y alcance</h3><p>El Observatorio integra niveles hidrométricos de estaciones convencionales para apoyar el monitoreo diario, el análisis temporal y la priorización de revisión técnica. Los resultados son herramientas de contexto y no constituyen pronóstico, alerta oficial ni sustituyen la validación de especialistas.</p></div>
  <div class="method-v101-section"><h3>2. Fuente de datos</h3><div class="method-v101-dict"><div class="method-v101-item"><div class="method-v101-term">DMH / DINAC</div><div class="method-v101-desc">Fuente operativa principal de niveles diarios, fechas reales de lectura y extremos históricos de referencia.</div></div><div class="method-v101-item"><div class="method-v101-term">Carga operativa</div><div class="method-v101-desc">Los datos pueden incorporarse de forma individual o masiva. La variación se recalcula contra el último registro anterior disponible.</div></div><div class="method-v101-item"><div class="method-v101-term">Trazabilidad</div><div class="method-v101-desc">Se conserva la fecha consultada y la fecha real del dato para distinguir lecturas actuales de datos arrastrados.</div></div></div></div>
  <div class="method-v101-section"><h3>3. Estado y calidad del dato</h3><div class="method-v101-dict"><div class="method-v101-item"><div class="method-v101-term">Actualizada</div><div class="method-v101-desc">La fecha real de la lectura coincide con la fecha consultada.</div></div><div class="method-v101-item"><div class="method-v101-term">Desactualizada</div><div class="method-v101-desc">La última lectura disponible pertenece a una fecha anterior. Hasta 10 días conserva la última dirección conocida; con mayor antigüedad se marca como información insuficiente.</div></div><div class="method-v101-item"><div class="method-v101-term">Sin dato</div><div class="method-v101-desc">No existe una observación utilizable en la base operativa.</div></div></div></div>
  <div class="method-v101-section method-v101-wide"><h3>4. Procesamiento e indicadores</h3><div class="method-v101-mini-grid"><div class="method-v101-mini"><b>Nivel</b><span>Lectura hidrométrica expresada siempre en metros.</span></div><div class="method-v101-mini"><b>Variación diaria</b><span>Diferencia contra el registro anterior. Cambios menores a 1 m se muestran en cm; cambios iguales o mayores a 1 m, en m.</span></div><div class="method-v101-mini"><b>Cambio observado en 7 días</b><span>Comparación con el registro disponible más cercano a siete días antes.</span></div><div class="method-v101-mini"><b>Cambio observado en 30 días</b><span>Comparación con el registro disponible más cercano a treinta días antes.</span></div><div class="method-v101-mini"><b>Días consecutivos</b><span>Cuenta la persistencia de ascensos, descensos o estabilidad a partir de observaciones consecutivas.</span></div><div class="method-v101-mini"><b>Posición histórica</b><span>Ubicación porcentual del nivel actual entre el mínimo y máximo históricos de referencia.</span></div></div></div>
  <div class="method-v101-section"><h3>5. Motor analítico</h3><p>El motor aplica reglas transparentes para resumir el comportamiento de la red.</p><div class="method-v101-dict"><div class="method-v101-item"><div class="method-v101-term">Panorama nacional</div><div class="method-v101-desc">Resume cobertura, dirección predominante y cambios destacados de la fecha consultada.</div></div><div class="method-v101-item"><div class="method-v101-term">Lectura por río</div><div class="method-v101-desc">Agrupa ascensos, descensos y estabilidad para identificar señales regionales.</div></div><div class="method-v101-item"><div class="method-v101-term">Cambios desde la fecha anterior</div><div class="method-v101-desc">Identifica variaciones relevantes, cambios en cobertura y estaciones sin actualización.</div></div></div><div class="method-v101-note">Las conclusiones son descriptivas y no representan un pronóstico hidrológico.</div></div>
  <div class="method-v101-section"><h3>6. Índice Hidrológico Nacional</h3><p>Indicador experimental que sintetiza cobertura, variabilidad, persistencia y contexto histórico de la red.</p><div class="method-v101-note"><b>Interpretación:</b> sirve para comparar el estado operativo de distintas fechas. No es un índice oficial, no define umbrales de inundación y no debe emplearse como alerta.</div></div>
  <div class="method-v101-section method-v101-wide"><h3>7. Análisis / Historial</h3><div class="method-v101-mini-grid"><div class="method-v101-mini"><b>Períodos rápidos</b><span>La vista inicial muestra los últimos 30 días. También permite consultar 90 días, un año, todo el historial o un rango personalizado.</span></div><div class="method-v101-mini"><b>Contexto histórico opcional</b><span>La comparación con el máximo y mínimo históricos permanece apagada por defecto para preservar la lectura de las variaciones recientes. Se activa solo cuando el análisis requiere contexto de largo plazo.</span></div><div class="method-v101-mini"><b>Escala y desplazamiento</b><span>La separación entre observaciones se ajusta automáticamente. El visor incorpora desplazamiento horizontal solo cuando la serie supera el ancho disponible.</span></div><div class="method-v101-mini"><b>Tabla histórica</b><span>Posee scroll vertical independiente y encabezado fijo para revisar series extensas.</span></div><div class="method-v101-mini"><b>Resumen del período</b><span>Muestra registros, fechas inicial y final, variación acumulada, promedio y una interpretación automática del período.</span></div></div></div>
  <div class="method-v101-section"><h3>8. Posición histórica</h3><p>Se calcula como la proporción del nivel actual dentro del rango entre el mínimo y máximo históricos de referencia.</p><div class="method-v101-scale-wrap"><div class="method-v101-scale"><div class="method-v101-marker"></div></div><div class="method-scale"><span>0% · mínimo</span><span>50% · rango medio</span><span>100% · máximo</span></div></div><div class="method-v101-note">No representa percentil estadístico, probabilidad, período de retorno ni nivel de alerta.</div></div>
  <div class="method-v101-section"><h3>9. Convenciones</h3><div class="method-v101-dict"><div class="method-v101-item"><div class="method-v101-term">↑ Ascenso</div><div class="method-v101-desc">El nivel aumenta respecto a la base de comparación.</div></div><div class="method-v101-item"><div class="method-v101-term">↓ Descenso</div><div class="method-v101-desc">El nivel disminuye respecto a la base de comparación.</div></div><div class="method-v101-item"><div class="method-v101-term">• Estable</div><div class="method-v101-desc">No se registra una variación cuantificable.</div></div></div></div>
  <div class="method-v101-section"><h3>10. Red de estaciones</h3><p>Distribución actual de estaciones por río.</p><div class="method-v101-metrics">${riosHtml}</div></div>
  <div class="method-v101-section method-v101-wide"><h3>11. Limitaciones operativas</h3><p>La calidad de las conclusiones depende de la continuidad, vigencia y consistencia de las observaciones. El Observatorio no reemplaza controles de campo, validación de la DMH, modelos hidrológicos o hidráulicos, pronósticos meteorológicos, protocolos institucionales ni comunicaciones oficiales de gestión del riesgo.</p><div class="method-v101-tags"><span class="method-v101-tag">Monitoreo</span><span class="method-v101-tag">Análisis descriptivo</span><span class="method-v101-tag">Control de calidad</span><span class="method-v101-tag">No alerta oficial</span></div></div>
 </div>`;
 qs('#method-content').innerHTML=html;
}

function opsTendenciaPredominante(actualizadas){
 const up=actualizadas.filter(x=>x.d&&x.d.variacion>0).length;
 const down=actualizadas.filter(x=>x.d&&x.d.variacion<0).length;
 const stable=actualizadas.length-up-down;
 if(!actualizadas.length)return {texto:'Sin datos',detalle:'Sin estaciones actualizadas',tipo:'stable'};
 if(up>down&&up>=stable)return {texto:'Ascenso',detalle:`${up} estaciones en ascenso`,tipo:'up'};
 if(down>up&&down>=stable)return {texto:'Descenso',detalle:`${down} estaciones en descenso`,tipo:'down'};
 return {texto:'Estable',detalle:`${stable} estaciones sin cambio relevante`,tipo:'stable'};
}
function opsSituacionGeneral(c,actualizadas){
 const cobertura=(c.actualizadas/(c.total||1))*100;
 const maxAbs=Math.max(0,...actualizadas.map(x=>Math.abs((x.d&&x.d.variacion)||0)));
 const altos=actualizadas.filter(x=>historicoPct(x.est.id,x.d.nivel)!=null && historicoPct(x.est.id,x.d.nivel)>=80).length;
 if(cobertura<70 || altos>=3 || maxAbs>=0.50)return {texto:'Atención',cls:'attention'};
 if(cobertura<90 || altos>=1 || maxAbs>=0.30)return {texto:'Vigilancia',cls:'attention'};
 return {texto:'Normal',cls:''};
}
function opsPhotoMetric(label,value,name,cls=''){
 return `<div class="ops-photo-metric"><div class="ops-photo-label">${label}</div><div class="ops-photo-value ${cls}">${value}</div><div class="ops-photo-name">${name||''}</div></div>`;
}


function calcDeltaPeriodo(id,dias){const r=CALCULATIONS.periodDelta(id,dias);return r?{delta:r.delta,base:r.base}:null}
function tendenciaResumenPorEstacion(){
 return estacionesActualizadasOperativas().map(x=>{
  const sem=calcDeltaPeriodo(x.est.id,7);
  const men=calcDeltaPeriodo(x.est.id,30);
  return {...x,sem,men};
 }).sort((a,b)=>{
  const av=Math.max(Math.abs(a.sem?.delta||0),Math.abs(a.men?.delta||0),Math.abs(a.d.variacion||0));
  const bv=Math.max(Math.abs(b.sem?.delta||0),Math.abs(b.men?.delta||0),Math.abs(b.d.variacion||0));
  return bv-av;
 });
}
function fmtDeltaM(delta){return FORMATTERS.delta(delta,{absolute:true,icon:true})}
function claseDelta(delta){return delta==null?'':trendClass(delta)}
function tendenciaTablaHtml(){
 const rows=tendenciaResumenPorEstacion();
 if(!rows.length)return '<div class="ops-v4-empty">No hay estaciones actualizadas para calcular cambios entre períodos.</div>';
 const signal=(delta)=>{
  if(delta==null)return {txt:'Sin base',cls:'revisar',icon:'•'};
  const cm=Math.round(delta*100);
  if(cm>=5)return {txt:'Ascenso',cls:'ascenso',icon:'▲'};
  if(cm<=-5)return {txt:'Descenso',cls:'descenso',icon:'▼'};
  return {txt:'Estable',cls:'estable',icon:'▬'};
 };
 const lectura=(x)=>{
  const d=signal(x.d.variacion), s=signal(x.sem?.delta), m=signal(x.men?.delta);
  const absD=Math.abs(Math.round((x.d.variacion||0)*100));
  const absS=Math.abs(Math.round((x.sem?.delta||0)*100));
  const absM=Math.abs(Math.round((x.men?.delta||0)*100));
  let txt='Evolución mixta', cls='mixto', prioridad='Media';
  if(s.cls==='ascenso' && m.cls==='ascenso'){txt='Ascenso sostenido';cls='ascenso';prioridad='Alta'}
  else if(s.cls==='descenso' && m.cls==='descenso'){txt='Descenso sostenido';cls='descenso';prioridad='Alta'}
  else if(d.cls==='ascenso' && (s.cls==='descenso'||m.cls==='descenso')){txt='Rebote reciente';cls='mixto';prioridad='Media'}
  else if(d.cls==='descenso' && (s.cls==='ascenso'||m.cls==='ascenso')){txt='Cambio reciente';cls='mixto';prioridad='Media'}
  else if(d.cls==='ascenso'){txt='Subida puntual';cls='ascenso';prioridad=absD>=10?'Media':'Normal'}
  else if(d.cls==='descenso'){txt='Bajada puntual';cls='descenso';prioridad=absD>=10?'Media':'Normal'}
  else if(s.cls==='estable' && m.cls==='estable'){txt='Sin cambios relevantes';cls='estable';prioridad='Normal'}
  if(Math.max(absD,absS,absM)>=50)prioridad='Alta';
  return {txt,cls,prioridad,score:Math.max(absD*1.2,absS,absM)};
 };
 const fmtBase=(periodo,base)=>base?`Base ${periodo}: ${fmtDate(base.fechaBoletin)}`:`Sin base ${periodo}`;
 const enriched=rows.map(x=>({...x,lect:lectura(x)})).sort((a,b)=>{
  const peso={Alta:0,Media:1,Normal:2};
  return (peso[a.lect.prioridad]-peso[b.lect.prioridad]) || (b.lect.score-a.lect.score);
 });
 const topAsc=enriched.filter(x=>x.sem?.delta>0||x.men?.delta>0).sort((a,b)=>Math.max(b.sem?.delta||0,b.men?.delta||0)-Math.max(a.sem?.delta||0,a.men?.delta||0))[0];
 const topDes=enriched.filter(x=>x.sem?.delta<0||x.men?.delta<0).sort((a,b)=>Math.min(a.sem?.delta||0,a.men?.delta||0)-Math.min(b.sem?.delta||0,b.men?.delta||0))[0];
 const sostenidos=enriched.filter(x=>x.lect.txt.includes('sostenido')).length;
 const mixtos=enriched.filter(x=>x.lect.cls==='mixto').length;
 const summary=`<div class="ops-trend-summary">
  <div class="ops-trend-summary-card"><div class="ops-trend-summary-label">Cambios sostenidos</div><div class="ops-trend-summary-value">${sostenidos}</div><div class="ops-trend-summary-name">Señal semanal y mensual en la misma dirección</div></div>
  <div class="ops-trend-summary-card"><div class="ops-trend-summary-label">Señales mixtas</div><div class="ops-trend-summary-value">${mixtos}</div><div class="ops-trend-summary-name">Rebotes, cambios recientes o comportamiento no consolidado</div></div>
  <div class="ops-trend-summary-card"><div class="ops-trend-summary-label">Mayor ascenso ampliado</div><div class="ops-trend-summary-value ${topAsc?trendClass(Math.max(topAsc.sem?.delta||0,topAsc.men?.delta||0)):''}">${topAsc?fmtDeltaM(Math.max(topAsc.sem?.delta||0,topAsc.men?.delta||0)):'—'}</div><div class="ops-trend-summary-name">${topAsc?topAsc.est.nombre:'Sin cálculo'}</div></div>
  <div class="ops-trend-summary-card"><div class="ops-trend-summary-label">Mayor descenso ampliado</div><div class="ops-trend-summary-value ${topDes?trendClass(Math.min(topDes.sem?.delta||0,topDes.men?.delta||0)):''}">${topDes?fmtDeltaM(Math.min(topDes.sem?.delta||0,topDes.men?.delta||0)):'—'}</div><div class="ops-trend-summary-name">${topDes?topDes.est.nombre:'Sin cálculo'}</div></div>
 </div>`;
 const help=`<div class="ops-matrix-help">
  <div class="ops-matrix-help-card"><div class="ops-matrix-help-title">Cómo leer la matriz</div><div class="ops-matrix-help-text"><b>Cambio diario</b> corresponde a la variación de la fecha consultada frente al registro anterior disponible. <b>7 días</b> y <b>30 días</b> comparan el nivel actual con una base temporal previa para distinguir señales recientes, sostenidas o mixtas. Las estaciones se presentan agrupadas por río y, dentro de cada grupo, la columna <b>prioridad</b> ordena cuáles conviene revisar primero.</div></div>
  <div class="ops-matrix-help-card"><div class="ops-matrix-help-title">Lectura operativa</div><div class="ops-matrix-help-text">Un ascenso o descenso sostenido indica que la señal semanal y mensual apuntan en la misma dirección. Una señal mixta indica posible reversión, rebote o comportamiento irregular. Esta lectura sirve para revisión técnica y no equivale a alerta hidrológica.</div><div class="ops-matrix-legend"><span>↑ aumento</span><span>↓ descenso</span><span>▬ estable</span><span>Alta = revisar primero</span></div></div>
 </div>`;
 const riverOrder=[...new Set(ESTACIONES_BASE.map(e=>e.rio))];
 const grouped=new Map(riverOrder.map(r=>[r,[]]));
 enriched.forEach(x=>{if(!grouped.has(x.est.rio))grouped.set(x.est.rio,[]);grouped.get(x.est.rio).push(x)});
 const rowHtml=[...grouped.entries()].filter(([,items])=>items.length).map(([rio,items])=>{
  const groupHead=`<tr class="ops-river-group-row"><td colspan="7">${rio}<span class="ops-river-group-meta">${items.length} estación${items.length===1?'':'es'}</span></td></tr>`;
  const groupRows=items.map(x=>{
   const prCls=x.lect.prioridad==='Alta'?'alta':x.lect.prioridad==='Media'?'media':'normal';
   return `<tr data-action="open-station" data-station-id="${x.est.id}">
    <td class="station-col"><b>${x.est.nombre}</b></td>
    <td class="num">${x.d.nivel.toFixed(2)} m</td>
    <td class="num ${trendClass(x.d.variacion)}">${fmtDeltaM(x.d.variacion)}</td>
    <td class="num ${claseDelta(x.sem?.delta)}" title="${fmtBase('7 días',x.sem?.base)}">${fmtDeltaM(x.sem?.delta)}</td>
    <td class="num ${claseDelta(x.men?.delta)}" title="${fmtBase('30 días',x.men?.base)}">${fmtDeltaM(x.men?.delta)}</td>
    <td><span class="ops-signal-pill ${x.lect.cls}">${x.lect.txt}</span></td>
    <td class="center"><span class="ops-priority-badge ${prCls}">${x.lect.prioridad}</span></td>
   </tr>`;
  }).join('');
  return groupHead+groupRows;
 }).join('');
 return `${summary}${help}<div class="ops-decision-matrix-wrap"><table class="ops-decision-matrix"><colgroup><col class="station"><col class="level"><col class="daily"><col class="week"><col class="month"><col class="reading"><col class="priority"></colgroup><thead><tr><th>Estación</th><th>Nivel actual</th><th>Cambio diario</th><th>Cambio en 7 días</th><th>Cambio en 30 días</th><th>Lectura operativa</th><th>Prioridad</th></tr></thead><tbody>${rowHtml}</tbody></table></div><div class="ops-decision-note"><span>Alta: cambio sostenido o variación ampliada ≥ 50 cm.</span><span>7/30 días usan el dato disponible igual o anterior al período de comparación.</span><span>La matriz prioriza revisión técnica; no reemplaza umbrales oficiales ni pronósticos.</span></div>`;
}


function previousAvailableDate(fecha=state.fechaVista){
 return state.boletines.filter(b=>b.fecha<fecha&&Object.values(b.estaciones||{}).some(d=>d&&d.nivel!=null)).sort((a,b)=>a.fecha.localeCompare(b.fecha)).at(-1)?.fecha||null;
}
function movementSnapshot(fecha){
 if(!fecha)return {up:0,down:0,stable:0,total:0};
 const rows=ESTACIONES_BASE.map(est=>({est,d:stationData(est.id,fecha)})).filter(x=>x.d&&x.d.nivel!=null&&estadoEstacion(x.d,fecha)==='ok');
 return rows.reduce((a,x)=>{a.total++;if(x.d.variacion>0)a.up++;else if(x.d.variacion<0)a.down++;else a.stable++;return a},{up:0,down:0,stable:0,total:0});
}
function consecutiveMovement(id,fecha=state.fechaVista){
 const h=historial(id).filter(x=>x.fechaBoletin<=fecha&&x.nivel!=null).sort((a,b)=>a.fechaBoletin.localeCompare(b.fechaBoletin));
 if(h.length<2)return {direction:'stable',count:0,start:null,latest:h.at(-1)||null};
 const deltas=[];
 for(let i=1;i<h.length;i++)deltas.push({fecha:h[i].fechaBoletin,delta:Number((h[i].nivel-h[i-1].nivel).toFixed(4))});
 const last=deltas.at(-1);const dir=last.delta>0?'up':last.delta<0?'down':'stable';let count=0,start=last.fecha;
 for(let i=deltas.length-1;i>=0;i--){const d=deltas[i];const ddir=d.delta>0?'up':d.delta<0?'down':'stable';if(ddir!==dir)break;count++;start=d.fecha}
 return {direction:dir,count,start,latest:h.at(-1)};
}
function computeHydrologyAnalysis(){
 const c=estadoConteoV2();const rows=estacionesActualizadasOperativas();const prevDate=previousAvailableDate();const prev=movementSnapshot(prevDate);
 const counts=rows.reduce((a,x)=>{if(x.d.variacion>0)a.up++;else if(x.d.variacion<0)a.down++;else a.stable++;a.sum+=x.d.variacion||0;a.abs+=Math.abs(x.d.variacion||0);return a},{up:0,down:0,stable:0,sum:0,abs:0});
 const avg=rows.length?counts.sum/rows.length:0;const avgAbs=rows.length?counts.abs/rows.length:0;
 const river={};rows.forEach(x=>{const r=river[x.est.rio]||(river[x.est.rio]={up:0,down:0,stable:0,sum:0,total:0});r.total++;r.sum+=x.d.variacion||0;if(x.d.variacion>0)r.up++;else if(x.d.variacion<0)r.down++;else r.stable++});
 const streaks=rows.map(x=>({...x,streak:consecutiveMovement(x.est.id)})).filter(x=>x.streak.count>0).sort((a,b)=>b.streak.count-a.streak.count);
 const strongestUp=streaks.filter(x=>x.streak.direction==='up')[0]||null;const strongestDown=streaks.filter(x=>x.streak.direction==='down')[0]||null;const strongestStable=streaks.filter(x=>x.streak.direction==='stable')[0]||null;
 const histExtreme=rows.filter(x=>{const h=historicoRef(x.est.id);if(!h)return false;const pos=(x.d.nivel-h.min.nivel)/(h.max.nivel-h.min.nivel||1);return pos<=.10||pos>=.90}).length;
 const sustained=streaks.filter(x=>x.streak.count>=3).length;
 const coverage=c.total?c.actualizadas/c.total:0;
 const intensity=Math.min(1,avgAbs/.35);const persistence=rows.length?Math.min(1,sustained/rows.length*3):0;const extremity=rows.length?Math.min(1,histExtreme/rows.length*3):0;
 const ihn=Math.round(100*(.25*intensity+.30*persistence+.25*extremity+.20*(1-coverage)));
 const ihnLabel=ihn<25?'Dinámica baja':ihn<50?'Dinámica moderada':ihn<75?'Dinámica alta':'Dinámica muy alta';
 const dominant=counts.down>counts.up&&counts.down>counts.stable?'Predominan descensos':counts.up>counts.down&&counts.up>counts.stable?'Predominan ascensos':'Comportamiento mixto o estable';
 const riverStatements=Object.entries(river).sort((a,b)=>b[1].total-a[1].total).map(([name,r])=>{const dir=r.down>r.up?'descensos':r.up>r.down?'ascensos':'señales mixtas o estables';return `<b>${name}</b>: predominan ${dir} (${r.up} suben, ${r.down} bajan, ${r.stable} estables).`});
 const changes=[];
 if(prevDate){const du=counts.up-prev.up,dd=counts.down-prev.down,ds=counts.stable-prev.stable;changes.push(`Respecto al ${fmtDate(prevDate)}, las estaciones en ascenso ${du===0?'se mantienen':du>0?`aumentan en ${du}`:`disminuyen en ${Math.abs(du)}`}.`);changes.push(`Las estaciones en descenso ${dd===0?'se mantienen':dd>0?`aumentan en ${dd}`:`disminuyen en ${Math.abs(dd)}`}.`);if(ds!==0)changes.push(`Las estaciones estables ${ds>0?`aumentan en ${ds}`:`disminuyen en ${Math.abs(ds)}`}.`)}
 const notable=rows.filter(x=>Math.abs(x.d.variacion)>=.30).sort((a,b)=>Math.abs(b.d.variacion)-Math.abs(a.d.variacion));
 notable.slice(0,3).forEach(x=>changes.push(`<b>${x.est.nombre}</b> presenta un cambio diario destacado de ${formatDelta(x.d.variacion,{absolute:true,icon:true})}.`));
 const narrative=`${dominant} en la red actualizada. ${counts.down} estaciones bajan, ${counts.up} suben y ${counts.stable} permanecen estables. La variación media es ${formatDelta(avg,{icon:true})} por estación.`;
 return {c,rows,counts,prevDate,prev,avg,avgAbs,river,riverStatements,streaks,strongestUp,strongestDown,strongestStable,histExtreme,sustained,ihn,ihnLabel,dominant,changes,narrative};
}
function analyzeHydrology(){const key=`${DATA_INDEX.revision}:${state.fechaVista}`;if(!DERIVED_CACHE.analysis.has(key))DERIVED_CACHE.analysis.set(key,computeHydrologyAnalysis());return DERIVED_CACHE.analysis.get(key)}
function analyticalDashboardHtml(a){
 const deltaCount=a.prevDate?`${a.counts.down-a.prev.down>=0?'+':''}${a.counts.down-a.prev.down}`:'—';
 return `<div class="ops-analytics-grid"><div class="ops-analytics-lead"><div class="ops-analytics-kicker">Motor analítico</div><div class="ops-analytics-title">${a.dominant}</div><p class="ops-analytics-copy">${a.narrative}</p></div><div class="ops-analytics-kpi"><div class="ops-analytics-kicker">Suben</div><div class="ops-analytics-value up">${a.counts.up}</div><div class="ops-analytics-name">de ${a.rows.length} estaciones actualizadas</div></div><div class="ops-analytics-kpi"><div class="ops-analytics-kicker">Bajan</div><div class="ops-analytics-value down">${a.counts.down}</div><div class="ops-analytics-name">Cambio vs. fecha anterior: ${deltaCount}</div></div><div class="ops-analytics-kpi"><div class="ops-analytics-kicker">Estables</div><div class="ops-analytics-value stable">${a.counts.stable}</div><div class="ops-analytics-name">sin cambio diario</div></div><div class="ops-analytics-kpi"><div class="ops-analytics-kicker">IHN experimental</div><div class="ops-analytics-value">${a.ihn}</div><div class="ops-analytics-name">${a.ihnLabel}</div><div class="ihn-meter"><span style="width:${a.ihn}%"></span></div></div></div>`;
}
function analyticalDetailHtml(a){
 const item=(icon,text)=>`<div class="ops-analysis-item"><span>${icon}</span><div>${text}</div></div>`;
 const streak=(label,x)=>x?`<div class="ops-streak-card" data-action="open-station" data-station-id="${x.est.id}"><small>${label}</small><b>${x.est.nombre}</b><span class="${x.streak.direction==='up'?'up':x.streak.direction==='down'?'down':'stable'}">${x.streak.direction==='up'?'↑':x.streak.direction==='down'?'↓':'→'} ${x.streak.count} día${x.streak.count===1?'':'s'} consecutivo${x.streak.count===1?'':'s'}</span></div>`:`<div class="ops-streak-card"><small>${label}</small><b>Sin señal</b><span>—</span></div>`;
 const changes=a.changes.length?a.changes.map(x=>item('•',x)).join(''):item('•','No se identifican cambios relevantes respecto a la actualización anterior.');
 return `<div class="ops-analysis-card"><div class="ops-analysis-head"><div><h3>Lectura analítica nacional</h3><div class="ops-compact-sub">Interpretación automática mediante reglas transparentes; no constituye pronóstico ni alerta oficial.</div></div><span class="ops-analysis-tag">Experimental</span></div><div class="ops-analysis-columns"><div><div class="ops-synthesis-label">Comportamiento por río</div><div class="ops-analysis-list">${a.riverStatements.map(x=>item('•',x)).join('')}</div></div><div><div class="ops-synthesis-label">Qué cambió desde la fecha anterior</div><div class="ops-analysis-list">${changes}</div></div></div><div class="ops-synthesis-label" style="margin-top:11px">Persistencia de la señal</div><div class="ops-streak-grid">${streak('Ascenso más persistente',a.strongestUp)}${streak('Descenso más persistente',a.strongestDown)}${streak('Estabilidad más persistente',a.strongestStable)}</div></div>`;
}

function opsSynthesisHtml(c,pct,trendTxt,ex,semanal,mensual,revisar,subidas,bajadas,rios){
 const reviewTotal=c.desactualizadas+c.sinDato;
 const chipClass=pct<60?'critical':pct<80?'review':'';
 const chipText=pct>=80?'Cobertura operativa':pct>=60?'Revisión parcial':'Cobertura baja';
 const hallazgo=(label,x,value,cls='')=>`<div class="ops-synthesis-finding"><small>${label}</small><b class="${cls}">${value}</b><span>${x?x.est.nombre:'Sin cálculo'}</span></div>`;
 const dailyUp=ex.mayorSubida?formatDelta(ex.mayorSubida.d.variacion,{absolute:true,icon:true}):'—';
 const dailyDown=ex.mayorBajada?formatDelta(ex.mayorBajada.d.variacion,{absolute:true,icon:true}):'—';
 const high=ex.mayorNivel?`${ex.mayorNivel.d.nivel.toFixed(2)} m`:'—';
 const low=ex.menorNivel?`${ex.menorNivel.d.nivel.toFixed(2)} m`:'—';
 const riosTxt=Object.entries(rios).map(([rio,v])=>{
   const dir=v.up>v.down?'predominan ascensos':v.down>v.up?'predominan descensos':'comportamiento mixto o estable';
   return `<div class="ops-synthesis-bullet"><span>•</span><div><b>${rio}:</b> ${dir}. ${v.ok}/${v.total} estaciones actualizadas.</div></div>`;
 }).join('');
 const pri=revisar.slice(0,5).map(x=>`<span>${x.est.nombre}</span>`).join('') || '<span>Sin estaciones pendientes</span>';
 const recomendacion=reviewTotal>0
  ? `Revisar primero las estaciones desactualizadas o sin dato antes de cerrar la lectura operativa. Para la interpretación hidrológica, priorizar las estaciones con variaciones semanales o mensuales sostenidas.`
  : `La red consultada no presenta pendientes de datos para la fecha seleccionada. Mantener seguimiento sobre las estaciones con mayor variación diaria y señales sostenidas de 7/30 días.`;
 const cambios=[];
 if(ex.mayorSubida)cambios.push(`<div class="ops-synthesis-bullet"><span>↑</span><div><b>${ex.mayorSubida.est.nombre}</b> registra la mayor subida de la fecha consultada (${dailyUp.replace('▲ ','')}).</div></div>`);
 if(ex.mayorBajada)cambios.push(`<div class="ops-synthesis-bullet"><span>↓</span><div><b>${ex.mayorBajada.est.nombre}</b> registra la mayor bajada de la fecha consultada (${dailyDown.replace('▼ ','')}).</div></div>`);
 if(semanal.mayorSubida)cambios.push(`<div class="ops-synthesis-bullet"><span>7d</span><div><b>${semanal.mayorSubida.est.nombre}</b> concentra el mayor ascenso semanal (${fmtDeltaM(semanal.mayorSubida.delta).replace('▲ ','')}).</div></div>`);
 return `<div class="ops-synthesis-box">
  <div class="ops-synthesis-head"><div><h3 class="ops-synthesis-title">Síntesis operativa</h3><div class="ops-synthesis-date">Resumen ejecutivo de la fecha consultada · ${fmtDate(state.fechaVista)}</div></div><span class="ops-synthesis-chip ${chipClass}">${chipText}</span></div>
  <div class="ops-synthesis-section"><div class="ops-synthesis-label">Situación hidrológica</div><p class="ops-synthesis-text">Comportamiento predominante: <b>${trendTxt}</b>. La lectura integra variación diaria y comparación 7/30 días.</p><div class="ops-synthesis-bullets">${riosTxt}</div></div>
  <div class="ops-synthesis-section"><div class="ops-synthesis-label">Hallazgos de la fecha consultada</div><div class="ops-synthesis-findings">${hallazgo('Mayor subida',ex.mayorSubida,dailyUp,'up')}${hallazgo('Mayor bajada',ex.mayorBajada,dailyDown,'down')}${hallazgo('Nivel máximo',ex.mayorNivel,high)}${hallazgo('Nivel mínimo',ex.menorNivel,low)}</div></div>
  <div class="ops-synthesis-section"><div class="ops-synthesis-label">Qué cambió hoy</div><div class="ops-synthesis-bullets">${cambios.join('')||'<div class="ops-synthesis-bullet"><span>•</span><div>No se identifican variaciones destacadas para la fecha consultada.</div></div>'}</div></div>
  <div class="ops-synthesis-section"><div class="ops-synthesis-label">Estaciones a revisar</div><div class="ops-synthesis-priority">${pri}</div></div>
  <div class="ops-synthesis-section"><div class="ops-synthesis-label">Recomendación técnica</div><div class="ops-recommendation">${recomendacion}</div></div>
 </div>`;
}

function renderOps(){
 const analysis=analyzeHydrology();
 const c=estadoConteoV2();const pct=Math.round(c.actualizadas/c.total*100)||0;
 const actualizadas=estacionesActualizadasOperativas();
 const subidas=actualizadas.filter(x=>x.d.variacion>0).sort((a,b)=>b.d.variacion-a.d.variacion);
 const bajadas=actualizadas.filter(x=>x.d.variacion<0).sort((a,b)=>a.d.variacion-b.d.variacion);
 const revisar=estacionesRevisionOperativa().sort((a,b)=>{const peso={antiguo:0,sin:1,pendiente:2,anterior:3};return (peso[a.e]??9)-(peso[b.e]??9)});
 const rios={};estacionesConDatos().forEach(x=>{const k=x.est.rio;(rios[k]??={total:0,ok:0,rev:0,old:0,up:0,down:0,stable:0}).total++;if(x.e==='ok')rios[k].ok++;else rios[k].rev++;if(x.e==='antiguo')rios[k].old++;if(x.d){if(x.d.variacion>0)rios[k].up++;else if(x.d.variacion<0)rios[k].down++;else rios[k].stable++;}});
 const ex=extremosActualizados();
 const semanal=extremosPeriodo(7);
 const mensual=extremosPeriodo(30);
 const reviewTotal=c.fechaAnterior+c.sinDato;
 const tendencia=opsTendenciaPredominante(actualizadas);
 const trendTxt=tendencia?tendencia.texto:'Sin señal';
 const dailySub=ex.mayorSubida?`${ex.mayorSubida.est.nombre} ${formatDelta(ex.mayorSubida.d.variacion)}`:'—';
 const dailyDown=ex.mayorBajada?`${ex.mayorBajada.est.nombre} ${formatDelta(ex.mayorBajada.d.variacion)}`:'—';
 const fmtMiniDelta=(x,tipo)=>{if(!x)return '—'; if(tipo==='nivel')return `${x.d.nivel.toFixed(2)} m`; return formatDelta(x.d.variacion,{absolute:true,icon:true});};
 const miniFocus=(label,x,tipo='delta')=>{if(!x)return `<div class="ops-mini-focus-card"><div class="ops-mini-label">${label}</div><div class="ops-mini-value">—</div><div class="ops-mini-meta">Sin datos actualizados</div></div>`;return `<div class="ops-mini-focus-card" data-action="open-station" data-station-id="${x.est.id}"><div class="ops-mini-label">${label}</div><div class="ops-mini-value ${trendClass(x.d.variacion)}">${fmtMiniDelta(x,tipo)}</div><div class="ops-mini-name">${x.est.nombre}</div><div class="ops-mini-meta">${x.est.rio} · ${fmtDate(x.d.fecha)}</div></div>`};
 const periodMini=(label,x)=>{if(!x)return `<div class="ops-mini-focus-card"><div class="ops-mini-label">${label}</div><div class="ops-mini-value">—</div><div class="ops-mini-meta">Sin base comparable</div></div>`;return `<div class="ops-mini-focus-card" data-action="open-station" data-station-id="${x.est.id}"><div class="ops-mini-label">${label}</div><div class="ops-mini-value ${trendClass(x.delta)}">${fmtDeltaM(x.delta)}</div><div class="ops-mini-name">${x.est.nombre}</div><div class="ops-mini-meta">Base ${x.base?fmtDate(x.base.fechaBoletin):'sin fecha'}</div></div>`};
 const compactRow=x=>`<div class="ops-compact-row" data-action="open-station" data-station-id="${x.est.id}"><div><div class="ops-compact-row-name">${x.est.nombre}</div><div class="ops-compact-row-meta">${x.est.rio} · ${x.d.nivel.toFixed(2)} m</div></div><div class="ops-compact-row-value ${trendClass(x.d.variacion)}">${formatDelta(x.d.variacion,{absolute:true,icon:true})}</div></div>`;
 const reviewRow=x=>{const d=x.d;return `<div class="ops-compact-row" data-action="open-station" data-station-id="${x.est.id}"><div><div class="ops-compact-row-name">${x.est.nombre}</div><div class="ops-compact-row-meta">${d?`${fmtDate(d.fecha)} · ${d.nivel.toFixed(2)} m`:'Sin registro cargado'}</div></div>${opsReviewBadge(x.e)}</div>`};
 const riverCard=([rio,v])=>{const p=Math.round(v.ok/v.total*100)||0;return `<div class="ops-compact-river"><div class="ops-compact-river-title"><span>${rio}</span><span class="mono">${v.ok}/${v.total}</span></div><div class="progress"><div class="bar" style="width:${p}%"></div></div><div class="ops-compact-river-note">${v.rev} por revisar · ${v.up} suben · ${v.down} bajan</div></div>`};
 let html=`<div class="ops-compact-toolbar"><div><label>Fecha consultada</label><input type="date" value="${state.fechaVista}" data-change="view-date"></div><div><label>Fechas disponibles</label><select data-change="view-date">${opcionesFecha()}</select></div><div><button type="button" class="btn secondary" data-action="set-tab" data-tab="method">Metodología</button></div></div>`;
 html+=`<div class="ops-compact-hero slim"><div class="ops-compact-head"><div><h2 class="ops-compact-title">Centro operativo</h2><div class="ops-compact-date"><b>${fmtDate(state.fechaVista)}</b> · fuente operativa DMH/DINAC · ${c.actualizadas}/${c.total} estaciones actualizadas</div></div><span class="ops-photo-state ${pct<60?'critical':pct<80?'attention':''}">${pct}% cobertura</span></div></div>`
 html+=analyticalDashboardHtml(analysis);
 html+=`<div class="ops-v12-layout"><div class="ops-v12-main">`;
 html+=analyticalDetailHtml(analysis);
 const focusCard=(label,x,kind,help)=>{if(!x)return `<div class="ops-focus-card empty"><div class="ops-focus-label">${label}</div><div class="ops-focus-help">${help}</div><div class="ops-focus-value">—</div><div class="ops-focus-meta">Sin datos actualizados para calcular este indicador.</div></div>`;const value=kind==='level'?`${x.d.nivel.toFixed(2)} m`:formatDelta(x.d.variacion,{absolute:true,icon:true});return `<div class="ops-focus-card" data-action="open-station" data-station-id="${x.est.id}"><div class="ops-focus-label">${label}</div><div class="ops-focus-help">${help}</div><div class="ops-focus-value ${kind==='level'?'':trendClass(x.d.variacion)}">${value}</div><div class="ops-focus-name">${x.est.nombre}</div><div class="ops-focus-meta">${x.est.rio} · ${fmtDate(x.d.fecha)}</div>${historicoMiniCard(x.est.id,x.d.nivel)}</div>`};
 const focusPeriodCard=(label,x,help)=>{if(!x)return `<div class="ops-focus-card empty"><div class="ops-focus-label">${label}</div><div class="ops-focus-help">${help}</div><div class="ops-focus-value">—</div><div class="ops-focus-meta">No hay base comparable suficiente.</div></div>`;const nivelActual=stationData(x.est.id)?.nivel;return `<div class="ops-focus-card" data-action="open-station" data-station-id="${x.est.id}"><div class="ops-focus-label">${label}</div><div class="ops-focus-help">${help}</div><div class="ops-focus-value ${trendClass(x.delta)}">${fmtDeltaM(x.delta)}</div><div class="ops-focus-name">${x.est.nombre}</div><div class="ops-focus-meta">Nivel actual ${nivelActual!=null?nivelActual.toFixed(2)+' m':'—'} · base ${x.base?fmtDate(x.base.fechaBoletin):'—'}</div></div>`};
 html+=`<div class="ops-compact-card"><h3>Foco hidrológico</h3><div class="ops-compact-sub">Indicadores calculados con estaciones actualizadas en la fecha consultada. Cada tarjeta muestra el valor operativo y su contexto histórico para no interpretar el nivel de forma aislada.</div><div class="ops-focus-section"><div class="ops-focus-title">Variación de la fecha consultada</div><div class="ops-focus-grid">${[
  focusCard('Mayor subida de la fecha consultada',ex.mayorSubida,'delta','Aumento diario más importante respecto al registro inmediatamente anterior disponible para esa estación.'),
  focusCard('Mayor bajada de la fecha consultada',ex.mayorBajada,'delta','Descenso diario más importante respecto al registro inmediatamente anterior disponible para esa estación.'),
  focusCard('Mayor nivel de la fecha consultada',ex.mayorNivel,'level','Estación con el nivel observado más alto dentro de la red actualizada de la fecha consultada.'),
  focusCard('Menor nivel de la fecha consultada',ex.menorNivel,'level','Estación con el nivel observado más bajo dentro de la red actualizada de la fecha consultada.')
 ].join('')}</div></div><div class="ops-focus-section"><div class="ops-focus-title">Comparación temporal</div><div class="ops-focus-grid periods">${[
  focusPeriodCard('Mayor subida semanal',semanal.mayorSubida,'Variación frente al dato disponible igual o anterior a 7 días.'),
  focusPeriodCard('Mayor bajada semanal',semanal.mayorBajada,'Variación frente al dato disponible igual o anterior a 7 días.'),
  focusPeriodCard('Mayor subida mensual',mensual.mayorSubida,'Variación frente al dato disponible igual o anterior a 30 días.'),
  focusPeriodCard('Mayor bajada mensual',mensual.mayorBajada,'Variación frente al dato disponible igual o anterior a 30 días.')
 ].join('')}</div></div><div class="ops-focus-note"><span><b>Variación de la fecha consultada:</b> cambio diario calculado contra el registro anterior disponible.</span><span><b>Comparación temporal:</b> las variaciones de 7 y 30 días muestran continuidad o reversión reciente.</span><span><b>Uso operativo:</b> comparación contextual, no reemplaza umbrales oficiales ni pronósticos.</span></div></div>`;
 html+=`<div class="ops-compact-card"><h3>Matriz operativa de cambios observados</h3><div class="ops-compact-sub">Compara el cambio de la fecha consultada con señales de 7 y 30 días para priorizar revisión técnica.</div>${tendenciaTablaHtml()}</div>`;
 html+=`</div><aside class="ops-synthesis-panel"><div class="ops-compact-stack">`;
 html+=`<div class="ops-compact-card ops-data-card"><h3>Estado de datos</h3><div class="ops-compact-state">${opsDonutHtml(c)}</div><div class="ops-compact-note"><span>${c.actualizadas}/${c.total} actualizadas</span><span>${c.fechaAnterior} desactualizadas</span><span>${c.sinDato} sin dato</span></div></div>`;
 html+=`</div>${opsSynthesisHtml(c,pct,trendTxt,ex,semanal,mensual,revisar,subidas,bajadas,rios)}<div class="ops-compact-stack">`;
 html+=`<div class="ops-compact-card"><h3>Control de calidad</h3><div class="ops-compact-sub">Estaciones que conviene revisar antes del cierre operativo.</div><div class="ops-compact-review ops-compact-list">${revisar.length?revisar.map(reviewRow).join(''):'<div class="ops-v4-empty">No hay estaciones pendientes de revisión.</div>'}</div></div>`;
 html+=`<div class="ops-compact-card"><h3>Resumen por río</h3><div class="ops-compact-rivers">${Object.entries(rios).map(riverCard).join('')}</div></div>`;
 html+=`</div></aside></div>`;
 qs('#ops-content').innerHTML=html;
}
