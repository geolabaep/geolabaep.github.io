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
 const sections=[
 ['Fuente y alcance','Niveles hidrométricos de DMH/DINAC incorporados en la base del Observatorio. Las fechas de lectura y de boletín se conservan por separado. Este visor describe observaciones; no calcula pronósticos ni emite alertas oficiales.'],
 ['Nivel del día y antigüedad','En Centro operativo se conserva la última lectura disponible hasta la fecha consultada, aun si falta en el boletín de ese día. Una lectura está actualizada cuando su fecha coincide con la fecha consultada. Las variaciones se calculan desde la fecha real de esa lectura, usando bases exactas de 1, 7, 15 y 30 días. Los valores anteriores conservan su fecha y no se presentan como niveles del día. El análisis se refiere al cierre del período seleccionado; el popup se limita a la fecha consultada en Monitoreo.'],
 ['Serie temporal','El eje horizontal representa días reales y el vertical niveles en metros. Se utiliza una lectura por fecha de observación. Los círculos lilas marcan todas las lecturas que superan el máximo histórico anterior conservado en la base, incluidas las posteriores al pico. Un nuevo récord se identifica además por superar todas las lecturas anteriores disponibles. Los días sin lectura interrumpen la línea: no se interpolan ni se completan con el último valor. El gráfico incluye una tabla y exportación CSV. La escala vertical se ajusta a la selección; su pendiente visual no es comparable entre estaciones.'],
 ['Cambios de 7, 15 y 30 días','Se calcula nivel de cierre menos nivel de exactamente 7, 15 o 30 días antes. Un valor positivo indica ascenso neto; uno negativo, descenso neto. Cada tarjeta informa ambas fechas. Si falta la fecha base, se muestra un guion. No es la suma de los ascensos ni una tasa diaria. En Centro operativo solo se calcula para lecturas del día consultado.'],
 ['Cambio diario y persistencia','El texto de evolución compara con el día calendario anterior, únicamente si existe lectura. La racha cuenta intervalos diarios consecutivos con la misma dirección, a precisión de centímetros, y se interrumpe ante un día sin lectura. Es descriptiva y no anticipa el comportamiento futuro.'],
 ['Máximos históricos y fecha de superación','El máximo histórico anterior es el registrado en HISTORICO, con valor y fecha. La fecha del primer registro sobre el máximo anterior corresponde a la primera lectura posterior que lo excede estrictamente en la serie disponible; igualdad no genera evento. No se conoce la hora exacta del cruce y podría haber ocurrido durante un intervalo sin datos. Cada nuevo récord debe superar también las lecturas previas disponibles.'],
 ['Serie temporal y escala','La serie abre con el máximo y el mínimo históricos publicados por DMH visibles. El menú Período define las fechas: últimos días, un año, todo el historial o Personalizado. En Personalizado, Desde y Hasta actualizan el gráfico automáticamente al contener un rango válido. En Opciones del gráfico, Contexto histórico incluye los extremos; Detalle ajusta el eje vertical a las lecturas, muestra sus límites numéricos y mantiene los extremos en el encabezado. El máximo anterior se presenta en dorado y el nuevo máximo en lila. Para series extensas, el dibujo conserva el primer y último dato y los extremos de cada bloque, sin unir segmentos separados por vacíos; el cursor, los cálculos y el CSV usan todas las lecturas diarias. La tabla se pagina de a 200 registros y el selector por año permite explorar series largas. La cobertura usa todas las fechas del rango elegido, incluidos los días sin lectura al inicio y al final. Las franjas rayadas son vacíos; las líneas no conectan días separados por datos ausentes. Los cambios de 7, 15 y 30 días se calculan desde la última lectura del período, solo si existe una lectura en la fecha exacta de comparación.'],
 ['Récords anuales en Monitoreo','El desplegable, los marcadores y los popups de Monitoreo consideran desde el 1 de enero del año de la fecha consultada hasta esa fecha. Muestran el mayor nuevo máximo y el menor nuevo mínimo observado por estación en ese intervalo. El Centro operativo conserva su ventana de los últimos 30 días. En Análisis/Historial, el detalle del punto se abre al hacer clic; pasar el cursor no abre una ventana.'],
 ['Nuevos mínimos históricos','Un nuevo mínimo requiere una lectura posterior a la fecha del mínimo histórico anterior y estrictamente inferior a ese nivel y a los mínimos posteriores observados. La igualdad no genera récord. Se identifica en rosa, con nivel y fecha, separado de la flecha de tendencia diaria. Los extremos anteriores se conservan en la base; la tabla vigente de DMH puede haberlos reemplazado.'],
 ['Evolución después de la superación','Se muestran la primera fecha observada por encima del máximo anterior, el mayor nivel posterior y el cambio de la última lectura frente a ese pico. El evento permanece visible aunque el río descienda. La línea punteada conserva el máximo anterior para permitir interpretar el episodio. Las fechas se refieren a la serie disponible, no a un inventario completo de crecidas históricas.'],
 ['Posición histórica','Se calcula 100 × (nivel − mínimo histórico) / (máximo histórico anterior − mínimo histórico). El número puede superar 100% o ser negativo; solo el indicador gráfico se limita a los extremos de la barra. No representa percentil, frecuencia, período de retorno, probabilidad de inundación ni umbral oficial. La posición se conserva como contexto complementario al cambio temporal.'],
 ['Calidad, revisiones y límites','Los resultados dependen de la calidad y cobertura de la base. Las lecturas repetidas se deduplican por fecha real; se conserva la última versión disponible de esa fecha. Las revisiones pueden modificar eventos pasados. Se deben contrastar valores extraordinarios con la fuente. Si se reemplazan máximos históricos, es necesario versionarlos para conservar la trazabilidad de eventos.'],
 ['Mapa y comparabilidad','El mapa incluye límites nacionales simplificados de world.geo.json para navegación, no para análisis limítrofe. OpenStreetMap aporta detalle cuando la conexión lo permite. Cada estación tiene una escala hidrométrica local: un nivel absoluto mayor en otra estación no implica mayor riesgo. El lila identifica una lectura que supera el máximo anterior, incluso cuando es de una fecha anterior. El borde discontinuo y la fecha señalan su antigüedad. No reemplaza la clasificación oficial de alertas.']
 ];
 qs('#method-content').innerHTML=`<div class="method-hero"><span class="control-eyebrow">GUÍA DEL OBSERVATORIO</span><h2>Leer el río, entender el dato</h2><p>Cómo interpretar las variaciones, los máximos históricos y la calidad de las observaciones. Actualización operativa: ${fmtDate(DMH_EXTREMES_DATE)}, con fecha real por estación. Auditoría histórica del 20/10/2026: 3.684 lecturas originales cotejadas con DMH; 35 corregidas y 223 lecturas faltantes recuperadas. No se interpolaron los 53 días sin observación. La concordancia con la publicación no certifica la medición física. Los máximos anteriores conservados para detectar récords no se revalidan con la tabla vigente cuando esta ya los reemplazó.</p></div><div class="method-cards"><article><b>01 · Fecha y nivel</b><p>Verificá primero la fecha real de lectura. Un valor anterior no es el nivel del día.</p></article><article><b>02 · Evolución</b><p>Compará la misma estación en 7, 15 y 30 días.</p><span class="up">↑ Sube</span> · <span class="down">↓ Baja</span> · <span class="stable">→ Estable</span></article><article><b>03 · Contexto histórico</b><p>El lila identifica nuevos máximos y el rosa nuevos mínimos históricos en los últimos 30 días hasta la fecha consultada. Las flechas representan el cambio del nivel, independientemente del récord. No equivale a una alerta oficial.</p></article></div><div class="method-manual"><aside><h3>Criterios y cálculos</h3><p>Abrí cada tema para consultar cómo se obtiene y se interpreta cada indicador.</p><a href="https://www.meteorologia.gov.py/nivel-rio/indexconvencional.php" target="_blank" rel="noopener">Fuente DMH ↗</a></aside><div>${sections.map(([title,body],i)=>`<details class="method-topic" ${i===2?'open':''}><summary><span>${String(i+1).padStart(2,'0')}</span>${title}</summary><p>${body}</p></details>`).join('')}</div></div>`;
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

const OPS_VIEW={river:'all',status:'all'};
function renderOps(){
 const all=ESTACIONES_BASE.map(est=>{const a=stationAnalysis(est.id,state.fechaVista),d=a.last;return {est,a,d,e:estadoEstacion(d,state.fechaVista)}});
 const current=all.filter(x=>x.e==='ok');
 const rivers=[...new Set(ESTACIONES_BASE.map(s=>s.rio))];
 const visible=all.filter(x=>(OPS_VIEW.river==='all'||x.est.rio===OPS_VIEW.river)&&(OPS_VIEW.status==='all'||(OPS_VIEW.status==='current'?x.e==='ok':OPS_VIEW.status==='review'?x.e!=='ok':recentExtremes(x.est.id).length>0)));
 const records=all.filter(x=>recentExtremes(x.est.id).some(d=>d.kind==='max'));
 const metric=(label,value,note)=>`<div class="control-metric"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
 const row=x=>{const a=x.a;const h=OFFICIAL_EXTREMES[x.est.id];const extreme=d=>d?`<strong>${m(d.nivel)}</strong><small>${fmtDate(d.fecha)}</small>`:'—';const rec=recentExtremes(x.est.id).length>0;const peaks=extremeSummary(x.est.id);const isMin=peaks.length&&peaks.every(d=>d.kind==='min');return `<tr data-station-row="${x.est.id}" class="${rec?(isMin?'row-min-record':'row-record'):''}"><td><button type="button" class="station-link" data-action="open-station" data-station-id="${x.est.id}">${x.est.nombre} <span>↗</span></button></td><td class="mono">${x.d?m(x.d.nivel):'—'}</td><td class="mono ${a.daily!=null?trendClass(a.daily):''}">${a.daily!=null?formatDelta(a.daily):'—'}</td><td>${x.d?fmtDate(x.d.fecha):'—'}</td><td><span class="data-tag ${x.e==='ok'?'current':'review'}">${x.e==='ok'?'Actualizada':x.e==='sin'?'Sin dato':'Anterior'}</span></td>${a.changes.length?a.changes.map(c=>`<td class="mono ${c.delta!==null?trendClass(c.delta):''}" title="${c.base?fmtDate(c.base.fecha)+' → '+fmtDate(a.last.fecha):'Falta lectura del '+fmtDate(c.target)}">${c.delta!==null?formatDelta(c.delta):'—'}</td>`).join(''):'<td>—</td><td>—</td><td>—</td>'}<td class="extreme-cell">${extreme(h?.min)}</td><td class="extreme-cell">${extreme(h?.max)}</td><td class="extreme-cell record-cell">${peaks.length?peaks.map(d=>`<div class="extreme-${d.kind}"><span>${d.kind==='max'?'◆ Máximo':'◇ Mínimo'}</span>${extreme(d)}</div>`).join(''):'—'}</td></tr>`};
 qs('#ops-content').innerHTML=`<div class="control-heading"><div><span class="control-eyebrow">ESTADO DE LA RED</span><h2>Centro operativo</h2><p>Una vista de todas las estaciones, agrupadas por río.</p></div>${consultedDateControl('ops-date')}</div>
 <div class="control-metrics">${metric('Estaciones de la red',all.length,rivers.length+' ríos')}${metric('Lecturas actualizadas',current.length,fmtDate(state.fechaVista))}${metric('Datos por revisar',all.length-current.length,'Anteriores o sin lectura')}${metric('Nuevos máximos históricos',records.length,'Estaciones · últimos 30 días')}</div>
 <div class="control-filters"><div><label for="ops-river">Río</label><select id="ops-river"><option value="all">Todos los ríos</option>${rivers.map(r=>`<option ${OPS_VIEW.river===r?'selected':''}>${r}</option>`).join('')}</select></div><div><label for="ops-status">Mostrar</label><select id="ops-status">${[['all','Todas las estaciones'],['current','Actualizadas'],['review','Datos por revisar'],['record','Nuevo máximo o mínimo · 30 días']].map(([v,t])=>`<option value="${v}" ${OPS_VIEW.status===v?'selected':''}>${t}</option>`).join('')}</select></div><span>${visible.length} de ${all.length} estaciones visibles</span><button type="button" id="ops-reset" class="btn secondary">Restablecer filtros</button></div>
 <p class="control-caption">Nivel y variaciones corresponden a la última lectura disponible hasta la fecha consultada. Δ 24 h y Δ 7/15/30 días comparan esa lectura con la fecha exacta anterior correspondiente. Si falta esa base, se muestra un guion. Revisá «Fecha de lectura»: un dato anterior no representa el nivel de hoy. Los niveles corresponden a escalas locales.</p>
 ${rivers.map(r=>{const group=visible.filter(x=>x.est.rio===r);if(!group.length)return '';return `<section class="river-section"><div class="river-heading"><h3>${r}</h3><span>${group.length} estaciones · ${group.filter(x=>x.e==='ok').length} actualizadas</span></div><div class="river-table-wrap"><table class="table control-table"><thead><tr><th>Estación</th><th>Último nivel</th><th>Δ 24 h</th><th>Fecha de lectura</th><th>Dato</th><th>Δ 7 días</th><th>Δ 15 días</th><th>Δ 30 días</th><th>Mínimo histórico</th><th>Máximo histórico</th><th title="Máximo o mínimo histórico nuevo, registrado en los últimos 30 días hasta la fecha consultada">Nuevo récord · tipo y fecha</th></tr></thead><tbody>${group.map(row).join('')}</tbody></table></div></section>`}).join('')||'<div class="history-empty">No hay estaciones para estos filtros. Restablecé los filtros para ver la red completa.</div>'}
 <p class="control-caption">◆ Lila: nuevo máximo histórico. ◇ Rosa: nuevo mínimo histórico. Se destacan los eventos de los 30 días hasta la fecha consultada, aunque después haya bajado o su lectura esté desactualizada. Abrí la estación para ver el máximo anterior y la evolución. No es una alerta oficial.</p><p class="control-caption">Mínimos y máximos históricos: publicación DMH consultada el ${fmtDate(DMH_EXTREMES_DATE)}. Incluyen el valor y la fecha del extremo; pueden ser posteriores a una consulta retrospectiva. Nuevo récord distingue máximo y mínimo y muestra el extremo alcanzado y su fecha en los últimos 30 días; puede coincidir con el extremo histórico publicado. Un guion indica que no se identificó un nuevo récord en ese período. El máximo histórico anterior se conserva en el detalle para explicar cada superación.</p>`;
 qs('#ops-river').onchange=e=>{OPS_VIEW.river=e.target.value;renderOps()};qs('#ops-status').onchange=e=>{OPS_VIEW.status=e.target.value;renderOps()};qs('#ops-reset').onclick=()=>{OPS_VIEW.river='all';OPS_VIEW.status='all';renderOps()};
}
