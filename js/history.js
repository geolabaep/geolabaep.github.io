// Reduce only the drawing, preserving each bucket's first, last, minimum and maximum.
function seriesDisplayRows(rows,budget=1000){
 let segment=0;const indexed=rows.map((d,i)=>{if(i&&days(rows[i-1].fecha,d.fecha)!==1)segment++;return {...d,sourceIndex:i,segment};});
 if(rows.length<=budget)return indexed;
 const size=Math.ceil(rows.length/(budget/4)),result=[];
 for(let start=0;start<indexed.length;start+=size){const bucket=indexed.slice(start,start+size);const lo=bucket.reduce((a,b)=>a.nivel<=b.nivel?a:b),hi=bucket.reduce((a,b)=>a.nivel>=b.nivel?a:b);const chosen=[...new Map([bucket[0],lo,hi,bucket.at(-1)].map(d=>[d.sourceIndex,d])).values()].sort((a,b)=>a.sourceIndex-b.sourceIndex);result.push(...chosen);}
 return result;
}
function renderReadingTable(rows,page=0){
 const size=200,pages=Math.max(1,Math.ceil(rows.length/size));page=Math.max(0,Math.min(pages-1,page));
 const start=rows.length-page*size,end=Math.max(0,start-size);
 qs('#history-reading-table').innerHTML=`<div class="table-page-controls"><button class="btn secondary" id="table-page-prev" ${page===0?'disabled':''}>Más recientes</button><span>Página ${page+1}/${pages} · ${rows.length} lecturas</span><button class="btn secondary" id="table-page-next" ${page===pages-1?'disabled':''}>Más antiguas</button></div><div class="history-table-scroll"><table class="table"><thead><tr><th>Fecha</th><th>Nivel</th><th>Cambio entre lecturas</th><th>Intervalo</th></tr></thead><tbody>${rows.slice(end,start).reverse().map((d,i)=>{const prev=rows[start-i-2];return `<tr><td>${fmtDate(d.fecha)}</td><td>${m(d.nivel)}</td><td>${prev?formatDelta(d.nivel-prev.nivel):'—'}</td><td>${prev?days(prev.fecha,d.fecha)+' día(s)':'—'}</td></tr>`}).join('')}</tbody></table></div>`;
 qs('#table-page-prev').onclick=()=>renderReadingTable(rows,page-1);qs('#table-page-next').onclick=()=>renderReadingTable(rows,page+1);
}
/* Historial, estadísticas por estación y gráficos SVG. */
function historyStats(rows, filtered, id){
 const clean=rows.filter(x=>x&&x.nivel!=null&&!Number.isNaN(Number(x.nivel)));
 const visible=filtered.filter(x=>x&&x.nivel!=null&&!Number.isNaN(Number(x.nivel)));
 const latestRow=clean.at(-1)||null;
 const prevRow=clean.length>1?clean.at(-2):null;
 const vals=clean.map(x=>Number(x.nivel));
 const maxRow=clean.length?clean.reduce((a,b)=>Number(b.nivel)>Number(a.nivel)?b:a):null;
 const minRow=clean.length?clean.reduce((a,b)=>Number(b.nivel)<Number(a.nivel)?b:a):null;
 const avg=clean.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
 const range=(maxRow&&minRow)?(Number(maxRow.nivel)-Number(minRow.nivel)):0;
 const pos=(latestRow&&range)?Math.max(0,Math.min(100,((Number(latestRow.nivel)-Number(minRow.nivel))/range)*100)):null;
 const deltaPrev=(latestRow&&prevRow)?Number(latestRow.nivel)-Number(prevRow.nivel):null;
 const weekBack=latestRow?findLastOnOrBefore(clean,addDays(latestRow.fechaBoletin,-7),Math.max(0,clean.length-1)):null;
 const monthBack=latestRow?findLastOnOrBefore(clean,addDays(latestRow.fechaBoletin,-30),Math.max(0,clean.length-1)):null;
 return {clean,visible,latestRow,prevRow,maxRow,minRow,avg,pos,deltaPrev,weekBack,monthBack,range};
}
function addDays(iso,days){const d=new Date(iso+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)}
// Compatibilidad pública: todos los módulos delegan al núcleo compartido.
function formatDelta(v,options={}){return FORMATTERS.delta(v,options)}
function m(v){return FORMATTERS.level(v)}
function historicoRef(id){return HISTORICO[id]||null}
function historicoPct(id,nivel){const h=historicoRef(id);if(!h||!h.min||!h.max||nivel==null)return null;const span=h.max.nivel-h.min.nivel;if(!span)return null;return Math.max(0,Math.min(100,((Number(nivel)-h.min.nivel)/span)*100))}
function historicoTextoCorto(id,nivel){const h=historicoRef(id);const pct=historicoPct(id,nivel);if(!h)return 'Referencia histórica pendiente';return `Hist.: mín. ${m(h.min.nivel)} (${fmtDate(h.min.fecha)}) · máx. ${m(h.max.nivel)} (${fmtDate(h.max.fecha)})${pct!=null?' · posición '+Math.round(pct)+'%':''}`}
function historicoInterpretacion(pct){
 const p=Math.max(0,Math.min(100,Math.round(pct)));
 if(p<=20)return {cls:'muy-bajo',label:'Muy bajo',desc:'Cercano al mínimo histórico registrado.'};
 if(p<=40)return {cls:'bajo',label:'Bajo',desc:'Por debajo del comportamiento medio histórico.'};
 if(p<=60)return {cls:'normal',label:'Normal',desc:'Dentro del rango medio histórico de la estación.'};
 if(p<=80)return {cls:'alto',label:'Alto',desc:'Superior al comportamiento medio histórico.'};
 return {cls:'muy-alto',label:'Muy alto',desc:'Cercano al máximo histórico registrado.'};
}
function historicoMiniCard(id,nivel){const h=historicoRef(id);const pct=historicoPct(id,nivel);if(!h)return '<div class="ops-hist-pending">Referencia histórica pendiente</div>';const p=pct==null?0:Math.max(0,Math.min(100,Math.round(pct)));const hi=pct==null?null:historicoInterpretacion(pct);const ayuda='Indica dónde se ubica el nivel actual respecto al mínimo y máximo históricos de referencia de la estación. 0% corresponde al mínimo histórico y 100% al máximo histórico.';return `<div class="ops-hist-grid"><div class="ops-hist-mini"><div class="ops-hist-mini-title">Mín. histórico</div><div class="ops-hist-mini-value">${m(h.min.nivel)}</div><div class="ops-hist-mini-date">${fmtDate(h.min.fecha)}</div></div><div class="ops-hist-mini"><div class="ops-hist-mini-title">Máx. histórico</div><div class="ops-hist-mini-value">${m(h.max.nivel)}</div><div class="ops-hist-mini-date">${fmtDate(h.max.fecha)}</div></div></div>${pct!=null?`<div class="ops-hist-position"><div class="ops-hist-position-head"><span>Posición histórica <span class="ops-hist-help" title="${ayuda}">?</span></span><b>${p}%</b></div><div class="ops-hist-track" title="${ayuda}"><div class="ops-hist-marker" style="left:${p}%"></div></div><div class="ops-hist-scale"><span>Mín. 0%</span><span>Máx. 100%</span></div><div class="ops-hist-interpretation"><span class="ops-hist-badge ${hi.cls}">${hi.label}</span></div><div class="ops-hist-desc">${hi.desc} El nivel actual está en el ${p}% del rango observado entre el mínimo y máximo histórico.</div></div>`:''}`}
function historyReading(st,stats){
 if(!stats.latestRow)return `No existen registros cargados para ${st.nombre}.`;
 if(stats.clean.length===1)return `Existe un único registro cargado para ${st.nombre}. No se calcula la evolución observada ni la línea temporal hasta incorporar nuevas observaciones.`;
 const parts=[];
 const trend=stats.deltaPrev==null?'sin comparación previa':stats.deltaPrev>0?'con ascenso respecto al registro anterior':stats.deltaPrev<0?'con descenso respecto al registro anterior':'sin variación respecto al registro anterior';
 parts.push(`La estación ${st.nombre} registra ${m(stats.latestRow.nivel)} y se encuentra ${trend}.`);
 if(stats.avg!=null){parts.push(Number(stats.latestRow.nivel)>=stats.avg?`El nivel actual está por encima del promedio de la serie cargada (${m(stats.avg)}).`:`El nivel actual está por debajo del promedio de la serie cargada (${m(stats.avg)}).`)}
 const hp=historicoPct(st.id,stats.latestRow.nivel);
 if(recordExcess(st.id,stats.latestRow))parts.push('Supera el máximo histórico registrado; ver el aviso lila.');
 else if(hp!=null)parts.push(`Frente a los extremos históricos de referencia, se ubica aproximadamente en el ${Math.round(hp)}% del rango registrado.`);
 return parts.join(' ');
}
function historyObservation(x,i,arr){
 if(!x||x.nivel==null)return 'Sin lectura';
 if(i===0)return 'Primer registro disponible';
 const prev=arr[i-1];
 if(!prev||prev.nivel==null)return 'Registro con antecedente incompleto';
 const diff=x.nivel-prev.nivel;
 if(Math.abs(diff)<0.01)return 'Sin cambio relevante';
 if(diff>0.3)return 'Ascenso marcado';
 if(diff>0)return 'Ascenso leve';
 if(diff<-0.3)return 'Descenso marcado';
 return 'Descenso leve';
}

function stationContext(st,id,stats){
 const totalAll=historial(id).filter(x=>x&&x.nivel!=null).length;
 const coords=(st.lat&&st.lon)?`${Math.abs(st.lat).toFixed(4)}° ${st.lat<0?'S':'N'} · ${Math.abs(st.lon).toFixed(4)}° ${st.lon<0?'O':'E'}`:'—';
 const hist=OFFICIAL_EXTREMES[id]||{};
 const period=stats.clean.length?`${fmtDate(stats.clean[0].fechaBoletin)} – ${fmtDate(stats.clean.at(-1).fechaBoletin)}`:'—';
 const country=st.nombre.includes('Brasil')?'Brasil':'Paraguay';
 return `<div class="history-meta-grid"><div><b>País</b><span>${country}</span></div><div><b>Coordenadas</b><span>${coords}</span></div><div><b>Período de registro cargado</b><span>${period}</span></div><div><b>Serie cargada</b><span>${totalAll} observaciones</span></div><div><b>Máximo histórico</b><span>${hist.max?m(hist.max.nivel)+' · '+fmtDate(hist.max.fecha):'pendiente'}</span></div><div><b>Mínimo histórico</b><span>${hist.min?m(hist.min.nivel)+' · '+fmtDate(hist.min.fecha):'pendiente'}</span></div></div>`;
}
function stationPager(id){
 const idx=ESTACIONES_BASE.findIndex(s=>s.id===id);
 const prev=ESTACIONES_BASE[(idx-1+ESTACIONES_BASE.length)%ESTACIONES_BASE.length];
 const next=ESTACIONES_BASE[(idx+1)%ESTACIONES_BASE.length];
 return `<div class="history-pager"><button type="button" class="btn secondary" data-action="history-station" data-station-id="${prev.id}">◀ ${prev.nombre}</button><button type="button" class="btn secondary" data-action="history-station" data-station-id="${next.id}">${next.nombre} ▶</button></div>`;
}
/* Estado mínimo del visor histórico: solo conserva opciones que afectan el render. */
const HISTORY_VIEW={period:'30',showHistoricalContext:true,detailScale:false};
function historyPeriodStart(rows,period){
 if(!rows.length||period==='all'||period==='custom')return '';
 const days=Number(period);
 if(!Number.isFinite(days))return '';
 return addDays(rows.at(-1).fechaBoletin,-days+1);
}
function setHistoryPeriod(value){
 const id=qs('#histStation')?.value||'asuncion',rows=observedRows(id);
 if(value.startsWith('year:')){const year=value.slice(5);HISTORY_VIEW.period='custom';HISTORY_VIEW.customStart=year+'-01-01';HISTORY_VIEW.customEnd=year+'-12-31';}
 else {HISTORY_VIEW.period=value;if(value==='custom'){HISTORY_VIEW.customStart=HISTORY_VIEW.customStart||historyPeriodStart(rows,'30');HISTORY_VIEW.customEnd=HISTORY_VIEW.customEnd||rows.at(-1)?.fecha||'';}}
 renderHistory(id);
}
function applyHistoryDates(){
 const start=qs('#histDesde')?.value,end=qs('#histHasta')?.value;
 if(!start||!end||start>end){qs('#history-range-error').textContent='Elegí una fecha inicial anterior o igual a la final.';return;}
 HISTORY_VIEW.period='custom';HISTORY_VIEW.customStart=start;HISTORY_VIEW.customEnd=end;renderHistory(qs('#histStation')?.value||'asuncion');
}
function setHistoryOption(key,value){HISTORY_VIEW[key]=value;renderHistory(qs('#histStation')?.value||'asuncion')}
function historyPeriodLabel(v){return v==='all'?'Todo el historial':v==='7'?'Últimos 7 días':v==='15'?'Últimos 15 días':v==='30'?'Últimos 30 días':v==='90'?'Últimos 90 días':v==='365'?'Último año':v==='1826'?'Últimos 5 años':'Rango personalizado'}
function renderHistory(preselect){
 const defaultId='asuncion';
 const current=qs('#histStation')?.value;
 const id=preselect||current||defaultId;
 const rows=observedRows(id);
 let desdeVal=HISTORY_VIEW.customStart||'';
 let hastaVal=HISTORY_VIEW.customEnd||'';
 if(HISTORY_VIEW.period!=='custom'){
  desdeVal=historyPeriodStart(rows,HISTORY_VIEW.period);
  hastaVal=rows.length?rows.at(-1).fechaBoletin:'';
 }
 const selectedRiver=STATION_BY_ID.get(id)?.rio;
 const riverOptions=[...new Set(ESTACIONES_BASE.map(s=>s.rio))].map(r=>`<option ${r===selectedRiver?'selected':''}>${r}</option>`).join('');
 const opts=ESTACIONES_BASE.filter(s=>s.rio===selectedRiver).map(s=>`<option value="${s.id}" ${s.id===id?'selected':''}>${s.nombre} · ${s.rio}</option>`).join('');
 const st=STATION_BY_ID.get(id)||STATION_BY_ID.get(defaultId)||ESTACIONES_BASE[0];
 const filtered=rows.filter(x=>(!desdeVal||x.fechaBoletin>=desdeVal)&&(!hastaVal||x.fechaBoletin<=hastaVal));
 if(desdeVal&&hastaVal&&desdeVal>hastaVal){qs('#history-content').innerHTML='<div class="history-empty">La fecha Desde debe ser anterior o igual a Hasta. <button type="button" class="btn" data-action="history-station" data-station-id="'+id+'">Volver a la estación</button></div>';HISTORY_VIEW.period='30';return;}
 const stats=historyStats(rows,filtered,id);
 const latest=filtered.at(-1)||null;
 const estado=latest?estadoEstacion(latest,latest.fechaBoletin):'sin';
 const weekDelta=stats.weekBack&&latest?Number(latest.nivel)-Number(stats.weekBack.nivel):null;
 const monthDelta=stats.monthBack&&latest?Number(latest.nivel)-Number(stats.monthBack.nivel):null;
 const periodAvg=filtered.length?filtered.reduce((a,x)=>a+Number(x.nivel),0)/filtered.length:null;
 let html=`<div class="control-heading"><div><span class="control-eyebrow">EXPLORACIÓN POR ESTACIÓN</span><h2>Análisis e historial</h2></div><span class="small">${st.rio}</span></div>
 <div class="panel history-query-panel"><div class="history-controls-simple"><div><label for="histRiver">Río</label><select id="histRiver" data-change="history-river">${riverOptions}</select></div><div><label for="histStation">Estación</label><select id="histStation" data-change="history-station">${opts}</select></div><div><label for="history-period-select">Período</label><select id="history-period-select" data-change="history-period">${[['7','Últimos 7 días'],['15','Últimos 15 días'],['30','Últimos 30 días'],['90','Últimos 90 días'],['365','Último año'],['1826','Últimos 5 años'],['all','Todo el historial'],['custom','Personalizado']].map(([v,label])=>`<option value="${v}" ${HISTORY_VIEW.period===v?'selected':''}>${label}</option>`).join('')}<optgroup label="Consultar un año">${[...new Set(rows.map(d=>d.fecha.slice(0,4)))].reverse().map(year=>`<option value="year:${year}">${year}</option>`).join('')}</optgroup></select></div></div>${HISTORY_VIEW.period==='custom'?`<div class="history-custom-dates"><div><label for="histDesde">Desde</label><input type="date" id="histDesde" value="${desdeVal}" data-change="history-custom"></div><div><label for="histHasta">Hasta</label><input type="date" id="histHasta" value="${hastaVal}" data-change="history-custom"></div><span>El gráfico se actualiza al cambiar las fechas.</span></div><p id="history-range-error" role="status"></p>`:''}<p class="history-selected-range">Mostrando ${desdeVal?fmtDate(desdeVal):fmtDate(rows[0]?.fecha)} — ${hastaVal?fmtDate(hastaVal):'sin lecturas'}${HISTORY_VIEW.period!=='custom'?' · hasta la última lectura disponible':''}</p></div>
 <div class="panel primary-series"><div class="history-chart-head"><div><h3>${st.nombre} · Niveles diarios</h3><span class="small">${latest?'Última lectura: '+fmtDate(latest.fecha)+' · '+m(latest.nivel):'Sin lecturas disponibles'}</span></div></div><div class="history-chart-viewport"><div class="chart" id="chart"></div></div><div class="chart-hint" id="chart-hint"></div></div>
 ${dataQualityHtml(id)}
 <details class="control-details"><summary>Ficha de estación y contexto histórico</summary><div class="detail-content">${stationContext(st,id,stats)}${stationPager(id)}</div></details>
 <details class="control-details"><summary>Tabla de lecturas · ${filtered.length} registros</summary><div id="history-reading-table"></div></details>`;
 qs('#history-content').innerHTML=html;
 renderReadingTable(filtered);

 setTimeout(()=>drawChart(filtered,stats,id,{...HISTORY_VIEW,rangeStart:desdeVal||rows[0]?.fecha,rangeEnd:hastaVal||rows.at(-1)?.fecha}),0)
}
function drawChart(data,stats,id,view=HISTORY_VIEW){
 const el=qs('#chart'),hint=qs('#chart-hint');if(!el)return;
 el._seriesResizeObserver?.disconnect();
 const rows=data.filter(validReading),firstBound=view.rangeStart||rows[0]?.fecha,lastBound=view.rangeEnd||rows.at(-1)?.fecha;
 if(!rows.length){el.innerHTML='<div class="history-empty">No hay lecturas en el rango seleccionado. Probá ampliar las fechas.</div>';if(hint)hint.textContent='No se completan fechas con valores estimados.';return;}
 const first=firstBound||rows[0].fecha,last=lastBound||rows.at(-1).fecha,span=Math.max(1,days(first,last));
 const w=Math.max(280,Math.min(1000,(el.clientWidth||1024)-24)),compact=w<600,h=compact?330:390,left=compact?46:70,right=compact?18:28,top=38,bottom=48;
 const official=OFFICIAL_EXTREMES[id],ref=HISTORICO[id],analysis=stationAnalysis(id,rows.at(-1).fecha);
 const high=rows.reduce((a,b)=>a.nivel>=b.nivel?a:b),low=rows.reduce((a,b)=>a.nivel<=b.nivel?a:b);
 const maxEvents=new Set(recordEvents(id,last).map(d=>d.fecha)),minEvents=new Set(minimumRecordEvents(id,last).map(d=>d.fecha));
 const newMax=analysis.events.at(-1),newMin=minimumRecordEvents(id,last).at(-1);
 const refs=[];if(view.showHistoricalContext){
 const add=(d,label,color)=>{if(d)refs.push({v:d.nivel,label,color,fecha:d.fecha});};
 add(newMin?ref?.min:official?.min,newMin?'Mínimo histórico anterior':'Mínimo histórico DMH','#a5b8c7');
 if(newMin)add(newMin,'Nuevo mínimo histórico','#efa0c6');
 add(newMax?ref?.max:official?.max,newMax?'Máximo histórico anterior':'Máximo histórico DMH','#e3bd70');
 if(newMax)add(newMax,'Nuevo máximo histórico','#d8b4fe');
 }
 const values=rows.map(d=>d.nivel),scale=values.concat(view.detailScale?[]:refs.map(r=>r.v));
 const pad=Math.max(.1,(Math.max(...scale)-Math.min(...scale))*.15),min=Math.min(...scale)-pad,max=Math.max(...scale)+pad;
 const x=d=>first===last?(left+w-right)/2:left+days(first,d.fecha)/span*(w-left-right),y=n=>h-bottom-(n-min)/(max-min)*(h-top-bottom);
 const points=rows.map(d=>({x:x(d),y:y(d.nivel)}));
 const displayRows=seriesDisplayRows(rows),displayPoints=displayRows.map(d=>({...d,x:x(d),y:y(d.nivel)}));
 const path=displayPoints.map((p,i)=>`${i&&displayPoints[i-1].segment===p.segment?'L':'M'}${p.x},${p.y}`).join(' ');
 const ticks=Array.from({length:6},(_,i)=>{const n=min+(max-min)*i/5;return `<line x1="${left}" x2="${w-right}" y1="${y(n)}" y2="${y(n)}" stroke="#ffffff16"/><text x="${left-10}" y="${y(n)+4}" text-anchor="end" fill="#b8c8d5" font-size="10">${n.toFixed(2)}</text>`}).join('');
 const tickDates=first===last?[first]:[...new Set(Array.from({length:Math.min(compact?3:6,span+1)},(_,i)=>addDays(first,Math.round(i*span/Math.max(1,Math.min(compact?3:6,span+1)-1)))))];
 const labels=tickDates.map(fecha=>`<text x="${x({fecha})}" y="${h-18}" text-anchor="middle" fill="#b8c8d5" font-size="10">${span>365?fmtDate(fecha).slice(3):fmtDate(fecha).slice(0,5)}</text>`).join('');
 const seen=new Set(rows.map(d=>d.fecha)),missingDates=[];for(let date=first;date<=last;date=addDays(date,1))if(!seen.has(date))missingDates.push(date);
 const gaps=[];for(const date of missingDates){const previous=gaps.at(-1);if(previous&&days(previous.end,date)===1)previous.end=date;else gaps.push({start:date,end:date});}
 const dayWidth=(w-left-right)/span;
 const shades=gaps.map(g=>{const start=Math.max(left,x({fecha:g.start})-dayWidth/2),end=Math.min(w-right,x({fecha:g.end})+dayWidth/2);return `<rect x="${start}" y="${top}" width="${Math.max(1,end-start)}" height="${h-top-bottom}" fill="url(#gap-hatch)"><title>Sin lectura: ${fmtDate(g.start)}${g.end!==g.start?' — '+fmtDate(g.end):''}</title></rect>`}).join('');
 const marks=displayRows.map((d)=>{const kind=maxEvents.has(d.fecha)?'max':minEvents.has(d.fecha)?'min':null;return `<circle cx="${x(d)}" cy="${y(d.nivel)}" r="${kind?5:2.5}" fill="${kind==='max'?'#d8b4fe':kind==='min'?'#efa0c6':'#6ed5ce'}"></circle>`}).join('');
 let lastLabelY=top-18;const refLines=refs.filter(r=>r.v>=min&&r.v<=max).sort((a,b)=>b.v-a.v).map(r=>({...r,labelY:(lastLabelY=Math.max(y(r.v)-8,lastLabelY+16))})).map(r=>`<line x1="${left}" x2="${w-right}" y1="${y(r.v)}" y2="${y(r.v)}" stroke="${r.color}" stroke-dasharray="7 5"/><text x="${left+8}" y="${r.labelY}" fill="${r.color}" font-size="10">${r.label} · ${m(r.v)}</text>`).join('');
 const total=days(first,last)+1,coverage=Math.round(100*rows.length/total),closing=rows.at(-1),opening=rows[0];
 const extCard=(kind)=>{const newRecord=kind==='max'?newMax:newMin,r=newRecord||official?.[kind],previous=ref?.[kind];if(!r)return '';const type=kind==='max'?'Máximo':'Mínimo';return `<div class="history-extreme ${newRecord?'new-'+kind:'known-'+kind}"><h4>${type} histórico</h4>${newRecord?`<div class="extreme-comparison"><div><span>Anterior</span><b class="previous-extreme">${m(previous.nivel)}</b><small>${fmtDate(previous.fecha)}</small></div><div><span>Nuevo ${type.toLowerCase()}</span><strong>${m(r.nivel)}</strong><small>${fmtDate(r.fecha)}</small></div></div><p>${m(newRecord.excess/100)} ${kind==='max'?'por encima':'por debajo'} del anterior</p>`:`<strong>${m(r.nivel)}</strong><small>${fmtDate(r.fecha)}${r.fecha>last?' · posterior al período':''}</small><p>Publicado por DMH</p>`}</div>`;};
 const metric=(label,value,note)=>`<div><span>${label}</span><b>${value}</b><small>${note}</small></div>`;
 const periodRecords=rows.filter(d=>maxEvents.has(d.fecha)||minEvents.has(d.fecha));
 el.innerHTML=`<div class="series-context-band">${extCard('min')}<div class="history-extreme last"><span>Último nivel del período</span><strong>${m(closing.nivel)}</strong><small>${fmtDate(closing.fecha)}${closing.fecha<last?' · faltan lecturas hasta el cierre':''}</small></div>${extCard('max')}</div><details class="series-display-options"><summary>Opciones del gráfico · ${view.detailScale?'detalle de variaciones':'contexto histórico'}</summary><div class="series-scale-row"><label for="series-detail-scale">Escala vertical<select id="series-detail-scale"><option value="full" ${!view.detailScale?'selected':''}>Contexto histórico · ver extremos</option><option value="detail" ${view.detailScale?'selected':''}>Detalle · ver cambios pequeños</option></select></label><span><b>${m(min)} a ${m(max)}</b><br>${view.detailScale?'Se amplía el eje vertical; no cambian los datos ni las fechas. Los extremos fuera de escala siguen arriba.':'Incluye los extremos históricos. Las variaciones pequeñas pueden verse comprimidas.'}</span></div></details>${displayRows.length<rows.length?`<p class="series-resolution">Vista resumida: ${rows.length.toLocaleString('es-PY')} lecturas diarias. Se conservan máximos y mínimos de cada bloque; el cursor y el CSV mantienen todos los datos. Elegí un año o un rango menor para ver más detalle.</p>`:''}<div class="series-plot"><svg viewBox="0 0 ${w} ${h}" class="decision-chart" tabindex="0" role="img" aria-label="Serie de niveles de ${STATION_BY_ID.get(id)?.nombre}. ${missingDates.length} días sin lectura."><defs><pattern id="gap-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0,8 L8,0" stroke="#b2bbc028" stroke-width="2"/></pattern></defs><text x="10" y="20" fill="#b8c8d5" font-size="10">Nivel (m)</text>${shades}${ticks}${refLines}<path d="${path}" fill="none" stroke="#6ed5ce" stroke-width="3" stroke-linejoin="round"/>${marks}${labels}<line id="series-cursor" x1="0" x2="0" y1="${top}" y2="${h-bottom}" stroke="#f2efe9" stroke-dasharray="3 4"/><circle id="series-point" r="6" fill="#fff" stroke="#15384b" stroke-width="3"/><g id="series-tooltip" visibility="hidden" pointer-events="none"><rect width="240" height="70" rx="8" fill="#f7fafc" stroke="#bdccd6"/><foreignObject x="212" y="4" width="24" height="24" style="pointer-events:all"><button xmlns="http://www.w3.org/1999/xhtml" type="button" id="series-tooltip-close" class="series-tooltip-close" aria-label="Cerrar detalle de la lectura" title="Cerrar detalle" hidden>×</button></foreignObject><text id="series-tooltip-text" x="12" y="20" fill="#193a4c" font-size="10"></text></g></svg></div><p class="series-click-help">Tocá un punto o hacé clic en el gráfico para consultar una lectura. Cerrá el detalle con × o Escape.</p><div class="sr-only" id="series-inspector" aria-live="polite"></div><div class="series-scrubber"><label for="series-slider">Explorar fecha y nivel</label><input id="series-slider" type="range" min="0" max="${rows.length-1}" value="${rows.length-1}" step="1" aria-label="Lectura de la serie"><button type="button" class="btn secondary" id="series-export">Descargar CSV</button></div><div class="series-reading"><b>Qué muestra el período</b><p>${evolutionSummary(analysis)}</p></div>${changesHtml(analysis)}<div class="decision-strip period-metrics">${metric('Máximo del período',m(high.nivel),fmtDate(high.fecha))}${metric('Mínimo del período',m(low.nivel),fmtDate(low.fecha))}${metric('Cambio neto',formatDelta(closing.nivel-opening.nivel),fmtDate(opening.fecha)+' → '+fmtDate(closing.fecha))}${metric('Cobertura del rango',coverage+'%',rows.length+'/'+total+' días · '+missingDates.length+' sin lectura')}</div>${gaps.length?`<details class="control-details"><summary>Ver ${gaps.length} intervalo(s) sin datos</summary><p>${gaps.map(g=>fmtDate(g.start)+(g.start===g.end?'':' — '+fmtDate(g.end))).join(' · ')}</p></details>`:''}${periodRecords.length?`<details class="control-details"><summary>Récords históricos en el período · ${periodRecords.length} registros</summary><div class="series-events">${periodRecords.map(d=>`<div class="extreme-${maxEvents.has(d.fecha)?'max':'min'}"><b>${maxEvents.has(d.fecha)?'◆ Nuevo máximo':'◇ Nuevo mínimo'}</b><span>${m(d.nivel)} · ${fmtDate(d.fecha)}</span></div>`).join('')}</div><p>Comparados con los extremos históricos anteriores conservados en la base y las lecturas previas disponibles.</p></details>`:''}<details class="control-details"><summary>Posición en el rango histórico anterior</summary>${positionHtml(analysis)}</details>`;
 const select=(i,reveal=false)=>{const d=rows[i],p=points[i],all=analysis.rows,index=all.findIndex(r=>r.fecha===d.fecha),prev=all[index-1],interval=prev?days(prev.fecha,d.fecha):0;qs('#series-inspector').textContent=`${fmtDate(d.fecha)} · ${m(d.nivel)}${prev?' · '+formatDelta(d.nivel-prev.nivel)+(interval===1?' en 24 h':' desde la lectura de hace '+interval+' días'):''}${maxEvents.has(d.fecha)?' · ◆ Nuevo máximo histórico':minEvents.has(d.fecha)?' · ◇ Nuevo mínimo histórico':''}`;qs('#series-cursor').setAttribute('x1',p.x);qs('#series-cursor').setAttribute('x2',p.x);qs('#series-point').setAttribute('cx',p.x);qs('#series-point').setAttribute('cy',p.y);qs('#series-slider').value=i;qs('#series-slider').setAttribute('aria-valuetext',fmtDate(d.fecha)+': '+m(d.nivel));const tip=qs('#series-tooltip');tip.setAttribute('visibility',reveal?'visible':'hidden');qs('#series-tooltip-close').hidden=!reveal;qs('#series-cursor').setAttribute('visibility',reveal?'visible':'hidden');qs('#series-point').setAttribute('visibility',reveal?'visible':'hidden');tip.setAttribute('transform',`translate(${Math.max(4,Math.min(w-244,p.x+14))},${Math.max(top,Math.min(h-bottom-70,p.y-80))})`);qs('#series-tooltip-text').innerHTML=`<tspan x="12" dy="0" font-weight="700">${fmtDate(d.fecha)} · ${m(d.nivel)}</tspan><tspan x="12" dy="18">${prev?formatDelta(d.nivel-prev.nivel)+' en '+interval+' día(s)':'Sin lectura anterior disponible'}</tspan><tspan x="12" dy="18" fill="${maxEvents.has(d.fecha)?'#8150ae':minEvents.has(d.fecha)?'#a84070':'#526c7b'}">${maxEvents.has(d.fecha)?'◆ Nuevo máximo histórico':minEvents.has(d.fecha)?'◇ Nuevo mínimo histórico':'Lectura diaria observada'}</tspan>`;};
 qs('#series-slider').oninput=e=>select(Number(e.target.value));
 qs('#series-detail-scale').onchange=e=>{HISTORY_VIEW.detailScale=e.target.value==='detail';drawChart(data,stats,id,{...view,detailScale:HISTORY_VIEW.detailScale});};
 const inspect=e=>{const box=e.currentTarget.getBoundingClientRect(),pos=(e.clientX-box.left)/box.width*w;let lo=0,hi=points.length-1;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(points[mid].x<pos)lo=mid+1;else hi=mid;}let nearest=lo;if(lo&&Math.abs(points[lo-1].x-pos)<Math.abs(points[lo].x-pos))nearest=lo-1;select(nearest,true);};
 qs('.decision-chart').onpointermove=null;qs('.decision-chart').onclick=inspect;
 const hideDetail=()=>{qs('#series-tooltip').setAttribute('visibility','hidden');qs('#series-cursor').setAttribute('visibility','hidden');qs('#series-point').setAttribute('visibility','hidden');qs('#series-tooltip-close').hidden=true;};
 qs('#series-tooltip-close').onclick=e=>{e.stopPropagation();hideDetail();};qs('.decision-chart').onkeydown=e=>{if(e.target!==e.currentTarget)return;if(e.key==='Escape')hideDetail();if(e.key==='Enter')select(Number(qs('#series-slider').value),true);};
 qs('#series-export').onclick=()=>{const csv='fecha,nivel_m,tipo_record,fuente\n'+rows.map(d=>`${d.fecha},${d.nivel.toFixed(2)},${maxEvents.has(d.fecha)?'maximo':minEvents.has(d.fecha)?'minimo':''},${d.source||''}`).join('\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`${id}_${first}_${last}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 select(rows.length-1);
 if(typeof ResizeObserver!=='undefined'){const measuredWidth=el.clientWidth;el._seriesResizeObserver=new ResizeObserver(()=>{if(el.isConnected&&el.clientWidth>0&&Math.abs(el.clientWidth-measuredWidth)>8){el._seriesResizeObserver.disconnect();drawChart(data,stats,id,view);}});el._seriesResizeObserver.observe(el);}
 if(hint)hint.innerHTML='<span>● Nivel observado · <b class="extreme-max">◆ Nuevo máximo</b> · <b class="extreme-min">◇ Nuevo mínimo</b> · Franja rayada: sin lectura.</span><span>Dorado: máximo anterior o máximo DMH sin nuevo récord. Lila: nuevo máximo. Extremos DMH consultados el '+fmtDate(DMH_EXTREMES_DATE)+'; pueden ser posteriores al rango elegido. No son umbrales de alerta. No se interpolan datos.</span>';
}

function dataQualityHtml(id){const a=DMH_AUDIT.stations.find(s=>s.id===id);if(!a)return '';return `<details class="control-details"><summary>Calidad de la serie · ${a.added} lecturas recuperadas${a.conflicts?' · '+a.conflicts+' valores corregidos con DMH':''}</summary><div class="quality-note">Se consultó el historial de la DMH el ${fmtDate(DMH_AUDIT.retrieved)} y se completaron únicamente fechas ausentes, hasta el ${fmtDate(DMH_AUDIT.through)}. No se interpolaron valores. Quedan ${a.remaining.length} fechas sin lectura verificada. ${a.errors.length?'La consulta tuvo limitaciones de acceso.':''}${DMH_AUDIT.conflicts.filter(c=>c.id===id).map(c=>`<p>${fmtDate(c.fecha)}: base original ${m(c.original)} · DMH ${m(c.nivel)}. <a href="${c.source}" target="_blank" rel="noopener">Ver fuente ↗</a></p>`).join('')}<p>Los valores discrepantes se corrigieron con la tabla de la DMH. Se conserva aquí el valor original para trazabilidad. Esta verificación comprueba concordancia con lo publicado, no certifica la medición del instrumento.</p></div></details>`;}
