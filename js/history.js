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
function addDays(iso,days){const d=new Date(iso+'T00:00:00');d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
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
 if(hp!=null)parts.push(`Frente a los extremos históricos de referencia, se ubica aproximadamente en el ${Math.round(hp)}% del rango registrado.`);
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
 const hist=HISTORICO[id]||{};
 const period=stats.clean.length?`${fmtDate(stats.clean[0].fechaBoletin)} – ${fmtDate(stats.clean.at(-1).fechaBoletin)}`:'—';
 const country=st.nombre.includes('Brasil')?'Brasil':'Paraguay';
 return `<div class="history-meta-grid"><div><b>País</b><span>${country}</span></div><div><b>Coordenadas</b><span>${coords}</span></div><div><b>Período de registro cargado</b><span>${period}</span></div><div><b>Serie cargada</b><span>${totalAll} observaciones</span></div><div><b>Máx. de referencia</b><span>${hist.max?m(hist.max.nivel)+' · '+fmtDate(hist.max.fecha):'pendiente'}</span></div><div><b>Mín. de referencia</b><span>${hist.min?m(hist.min.nivel)+' · '+fmtDate(hist.min.fecha):'pendiente'}</span></div></div>`;
}
function stationPager(id){
 const idx=ESTACIONES_BASE.findIndex(s=>s.id===id);
 const prev=ESTACIONES_BASE[(idx-1+ESTACIONES_BASE.length)%ESTACIONES_BASE.length];
 const next=ESTACIONES_BASE[(idx+1)%ESTACIONES_BASE.length];
 return `<div class="history-pager"><button type="button" class="btn secondary" data-action="history-station" data-station-id="${prev.id}">◀ ${prev.nombre}</button><button type="button" class="btn secondary" data-action="history-station" data-station-id="${next.id}">${next.nombre} ▶</button></div>`;
}
/* Estado mínimo del visor histórico: solo conserva opciones que afectan el render. */
const HISTORY_VIEW={period:'30',showHistoricalContext:false};
function historyPeriodStart(rows,period){
 if(!rows.length||period==='all'||period==='custom')return '';
 const days=Number(period);
 if(!Number.isFinite(days))return '';
 return addDays(rows.at(-1).fechaBoletin,-days+1);
}
function setHistoryPeriod(value){
 HISTORY_VIEW.period=value;
 const id=qs('#histStation')?.value||'asuncion';
 const rows=historial(id);
 if(value!=='custom'){
  const start=historyPeriodStart(rows,value);
  const end=rows.length?rows.at(-1).fechaBoletin:'';
  const desde=qs('#histDesde'),hasta=qs('#histHasta');
  if(desde)desde.value=start;
  if(hasta)hasta.value=end;
 }
 renderHistory(id);
}
function setHistoryOption(key,value){HISTORY_VIEW[key]=value;renderHistory(qs('#histStation')?.value||'asuncion')}
function historyPeriodLabel(v){return v==='all'?'Todo el historial':v==='7'?'Últimos 7 días':v==='30'?'Últimos 30 días':v==='90'?'Últimos 90 días':v==='365'?'Último año':'Rango personalizado'}
function renderHistory(preselect){
 const defaultId='asuncion';
 const current=qs('#histStation')?.value;
 const id=preselect||current||defaultId;
 const rows=historial(id);
 let desdeVal=qs('#histDesde')?.value||'';
 let hastaVal=qs('#histHasta')?.value||'';
 if(HISTORY_VIEW.period!=='custom'){
  desdeVal=historyPeriodStart(rows,HISTORY_VIEW.period);
  hastaVal=rows.length?rows.at(-1).fechaBoletin:'';
 }
 const opts=ESTACIONES_BASE.map(s=>`<option value="${s.id}" ${s.id===id?'selected':''}>${s.nombre} · ${s.rio}</option>`).join('');
 const st=STATION_BY_ID.get(id)||STATION_BY_ID.get(defaultId)||ESTACIONES_BASE[0];
 const filtered=rows.filter(x=>(!desdeVal||x.fechaBoletin>=desdeVal)&&(!hastaVal||x.fechaBoletin<=hastaVal));
 const stats=historyStats(rows,filtered,id);
 const latest=stats.latestRow;
 const estado=latest?estadoEstacion(latest,latest.fechaBoletin):'sin';
 const weekDelta=stats.weekBack&&latest?Number(latest.nivel)-Number(stats.weekBack.nivel):null;
 const monthDelta=stats.monthBack&&latest?Number(latest.nivel)-Number(stats.monthBack.nivel):null;
 const periodAvg=filtered.length?filtered.reduce((a,x)=>a+Number(x.nivel),0)/filtered.length:null;
 let html=`<div class="history-intro"><div><h2 class="history-title">Análisis / Historial</h2><div class="history-subtitle">Exploración temporal por estación. La vista inicial presenta los últimos 30 días y permite ampliar el período cuando sea necesario.</div></div><div class="pill">Estación inicial: <strong>Asunción</strong></div></div>`;
 html+=`<div class="panel history-query-panel"><div class="history-toolbar"><div class="history-station-control"><label>Estación</label><select id="histStation" data-change="history-station">${opts}</select></div><div class="history-custom-control"><label>Desde</label><input type="date" id="histDesde" value="${desdeVal}" data-change="history-custom"></div><div class="history-custom-control"><label>Hasta</label><input type="date" id="histHasta" value="${hastaVal}" data-change="history-custom"></div><button type="button" class="btn history-custom-apply" data-action="history-custom-apply">Consultar</button></div></div>`;
 const href=historicoRef(id);const hpct=latest?historicoPct(id,latest.nivel):null;
 html+=`<div class="history-station-grid"><div class="history-profile"><div class="history-profile-river">${st.rio}</div><div class="history-profile-name">${st.nombre}</div><div class="history-profile-status"><span class="status ${clsEstado(estado)}">${latest?labelEstado(estado):'Sin dato'}</span><span class="small">Último registro: ${latest?fmtDate(latest.fechaBoletin):'—'}</span></div><div class="history-current">${latest?Number(latest.nivel).toFixed(2):'—'} <span>m</span></div><div class="history-profile-note">${historyReading(st,stats)}</div>${stationContext(st,id,stats)}${stationPager(id)}</div>`;
 html+=`<div class="history-kpi-grid"><div class="history-kpi"><div class="history-kpi-label">Variación reciente</div><div class="history-kpi-value ${trendClass(stats.deltaPrev||0)}">${stats.deltaPrev==null?'—':formatDelta(stats.deltaPrev,{absolute:true,icon:true})}</div><div class="history-kpi-detail">respecto al registro anterior</div></div><div class="history-kpi"><div class="history-kpi-label">Máximo histórico</div><div class="history-kpi-value">${href?.max?m(href.max.nivel):'—'}</div><div class="history-kpi-detail">${href?.max?fmtDate(href.max.fecha):'referencia pendiente'}</div></div><div class="history-kpi"><div class="history-kpi-label">Mínimo histórico</div><div class="history-kpi-value">${href?.min?m(href.min.nivel):'—'}</div><div class="history-kpi-detail">${href?.min?fmtDate(href.min.fecha):'referencia pendiente'}</div></div><div class="history-kpi"><div class="history-kpi-label">Promedio serie cargada</div><div class="history-kpi-value">${stats.avg!=null?m(stats.avg):'—'}</div><div class="history-kpi-detail">${stats.clean.length} registro(s)</div></div><div class="history-kpi"><div class="history-kpi-label">Variación semanal</div><div class="history-kpi-value ${trendClass(weekDelta||0)}">${weekDelta==null?'—':formatDelta(weekDelta,{absolute:true,icon:true})}</div><div class="history-kpi-detail">comparación aproximada 7 días</div></div><div class="history-kpi"><div class="history-kpi-label">Variación mensual</div><div class="history-kpi-value ${trendClass(monthDelta||0)}">${monthDelta==null?'—':formatDelta(monthDelta,{absolute:true,icon:true})}</div><div class="history-kpi-detail">comparación aproximada 30 días</div></div></div></div>`;
 html+=`<div class="history-analysis"><div class="history-analysis-card"><h3>Posición dentro del historial de referencia</h3><p>${latest&&hpct!=null?`El nivel actual se ubica en el ${Math.round(hpct)}% del rango entre el mínimo y máximo histórico de referencia.`:'Se necesitan extremos históricos de referencia para calcular esta posición.'}</p><div class="history-range-track"><div class="history-range-marker" style="left:${hpct==null?0:Math.round(hpct)}%"></div></div><div class="history-position-explain">0% representa el mínimo histórico de referencia y 100% el máximo histórico. Es un indicador de contexto, no un umbral oficial de alerta.</div></div><div class="history-analysis-card"><h3>Lectura para decisión</h3><p>${historyReading(st,stats)}</p></div></div>`;
 html+=`<div class="panel"><div class="history-chart-head"><div><div class="history-chart-title">Serie temporal de niveles</div><div class="small">Filtrá el período y las referencias visuales. El gráfico usa desplazamiento horizontal cuando la cantidad de observaciones supera el ancho disponible.</div></div><div class="small">${filtered.length} registro(s) visibles</div></div>`;
 html+=`<div class="history-chart-tools history-chart-tools-clean"><div><label>Período visible</label><select data-change="history-period"><option value="30" ${HISTORY_VIEW.period==='30'?'selected':''}>Últimos 30 días</option><option value="90" ${HISTORY_VIEW.period==='90'?'selected':''}>Últimos 90 días</option><option value="365" ${HISTORY_VIEW.period==='365'?'selected':''}>Último año</option><option value="all" ${HISTORY_VIEW.period==='all'?'selected':''}>Todo el historial</option><option value="custom" ${HISTORY_VIEW.period==='custom'?'selected':''}>Rango personalizado</option></select></div><div class="history-visible-range"><span>Desde <b>${filtered.length?fmtDate(filtered[0].fechaBoletin):'—'}</b></span><span>Hasta <b>${filtered.length?fmtDate(filtered.at(-1).fechaBoletin):'—'}</b></span></div><div class="history-chart-options"><label class="history-check history-context-toggle"><input type="checkbox" ${HISTORY_VIEW.showHistoricalContext?'checked':''} data-change="history-context"> Comparar con máximo y mínimo históricos</label></div><div class="history-period-note">La vista abre con los últimos 30 días y una escala ajustada a los niveles recientes. Activá el contexto histórico únicamente cuando necesites comparar la serie con los extremos de referencia.</div></div>`;
 const periodDelta=filtered.length>1?Number(filtered.at(-1).nivel)-Number(filtered[0].nivel):null;
 const periodText=filtered.length>1?`${periodDelta>0?'aumentó':periodDelta<0?'disminuyó':'se mantuvo sin cambio neto'} ${formatDelta(periodDelta,{absolute:true,icon:false})}`:'no posee registros suficientes para calcular una variación acumulada';
 const positionText=latest&&hpct!=null?`El último nivel se ubica en el ${Math.round(hpct)}% del rango histórico de referencia.`:'No se dispone de referencias suficientes para calcular la posición histórica.';
 html+=`<div class="history-period-summary"><span class="history-period-chip">Registros: <b>${filtered.length}</b></span><span class="history-period-chip">Primer dato: <b>${filtered.length?fmtDate(filtered[0].fechaBoletin):'—'}</b></span><span class="history-period-chip">Último dato: <b>${filtered.length?fmtDate(filtered.at(-1).fechaBoletin):'—'}</b></span><span class="history-period-chip">Variación acumulada: <b>${periodDelta==null?'—':formatDelta(periodDelta,{absolute:true,icon:true})}</b></span><span class="history-period-chip">Promedio: <b>${periodAvg==null?'—':m(periodAvg)}</b></span></div><div class="history-period-interpretation"><b>Lectura del período:</b> En ${historyPeriodLabel(HISTORY_VIEW.period).toLowerCase()}, el nivel ${periodText}. ${positionText}</div><div class="history-chart-viewport"><div class="chart" id="chart"></div></div><div class="chart-hint" id="chart-hint"></div>`;
 if(!filtered.length){html+=`<div class="history-empty" style="margin-top:12px">No hay registros para la estación y el rango seleccionado.</div>`}else{const firstLevel=Number(filtered[0].nivel);html+=`<div class="history-table-scroll"><table class="table"><thead><tr><th>Fecha consultada</th><th>Nivel</th><th>Variación</th><th>Variación acumulada</th><th>Posición histórica</th><th>Observación</th></tr></thead><tbody>`;filtered.slice().reverse().forEach(x=>{const originalIndex=filtered.findIndex(y=>y.fechaBoletin===x.fechaBoletin&&y.fecha===x.fecha);const accumulated=Number(x.nivel)-firstLevel;const pos=historicoPct(id,Number(x.nivel));html+=`<tr><td>${fmtDate(x.fechaBoletin)}</td><td class="mono">${x.nivel.toFixed(2)} m</td><td class="mono ${trendClass(x.variacion)}">${formatDelta(x.variacion,{absolute:true,icon:true})}</td><td class="mono ${trendClass(accumulated)}">${formatDelta(accumulated,{absolute:true,icon:true})}</td><td>${pos==null?'—':Math.round(pos)+'%'}</td><td>${x.observacion||historyObservation(x,originalIndex,filtered)}</td></tr>`});html+=`</tbody></table></div>`}
 html+=`</div>`;
 qs('#history-content').innerHTML=html;
 setTimeout(()=>drawChart(filtered,stats,id,HISTORY_VIEW),0)
}
function drawChart(data,stats,id,view=HISTORY_VIEW){
 const el=qs('#chart');
 const hint=qs('#chart-hint');
 if(!el)return;
 if(hint)hint.innerHTML='';
 if(!data.length){el.innerHTML='<div class="small" style="padding:20px">Sin datos para graficar.</div>';return}
 const viewport=el.closest('.history-chart-viewport');
 const measuredW=(viewport?.clientWidth||el.clientWidth||360)-2;
 const containerW=Math.max(300,measuredW);
 const compact=containerW<560;
 const pointGap=data.length>180?32:data.length>90?38:data.length>45?46:(compact?52:68);
 const needsScroll=data.length>Math.max(8,Math.floor(containerW/pointGap));
 const w=needsScroll?Math.max(containerW+180,data.length*pointGap+90):containerW;
 const h=250,p=38;
 const vals=data.map(d=>Number(d.nivel));
 const href=historicoRef(id);
 const scaleVals=[...vals];
 if(view.showHistoricalContext&&href?.max&&Number.isFinite(Number(href.max.nivel)))scaleVals.push(Number(href.max.nivel));
 if(view.showHistoricalContext&&href?.min&&Number.isFinite(Number(href.min.nivel)))scaleVals.push(Number(href.min.nivel));
 const min=Math.min(...scaleVals),max=Math.max(...scaleVals),avg=vals.reduce((a,b)=>a+b,0)/vals.length,span=(max-min)||1;
 const pad=Math.max(span*0.08,0.05),scaleMin=min-pad,scaleMax=max+pad,scaleSpan=(scaleMax-scaleMin)||1;
 const y=v=>h-p-(v-scaleMin)/scaleSpan*(h-2*p);
 if(data.length===1){const pt=[containerW/2,h/2];el.innerHTML=`<svg width="100%" height="270" viewBox="0 0 ${containerW} 270"><text x="${p}" y="28" fill="#aebdc5" font-size="12">Registro puntual: no se genera línea temporal.</text><circle cx="${pt[0]}" cy="${pt[1]}" r="7" fill="#e8a33d"><title>${fmtDate(data[0].fechaBoletin)} · ${data[0].nivel.toFixed(2)} m</title></circle><text x="${pt[0]}" y="${pt[1]-14}" text-anchor="middle" fill="#f2efe9" font-size="13" font-weight="700">${data[0].nivel.toFixed(2)} m</text><text x="${pt[0]}" y="${pt[1]+26}" text-anchor="middle" fill="#aebdc5" font-size="11">${fmtDate(data[0].fechaBoletin)}</text></svg>`;return}
 const pts=data.map((d,i)=>[p+i*(w-2*p)/Math.max(1,data.length-1),y(Number(d.nivel))]);
 const path=pts.map((pt,i)=>(i?'L':'M')+pt[0]+','+pt[1]).join(' ');
 const refs=[];
 if(view.showHistoricalContext&&href?.max&&Number.isFinite(Number(href.max.nivel))){const v=Number(href.max.nivel);refs.push(`<line x1="${p}" x2="${w-p}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(230,93,79,.8)" stroke-width="2" stroke-dasharray="7 5" vector-effect="non-scaling-stroke"/><rect x="${p+4}" y="${Math.max(4,y(v)-22)}" width="168" height="18" rx="5" fill="rgba(8,29,44,.9)"/><text x="${p+12}" y="${Math.max(17,y(v)-9)}" fill="#f3b0a8" font-size="11" font-weight="700">Máx. histórico ${v.toFixed(2)} m</text>`)}
 if(view.showHistoricalContext&&href?.min&&Number.isFinite(Number(href.min.nivel))){const v=Number(href.min.nivel);const labelY=Math.min(h-4,y(v)+7);refs.push(`<line x1="${p}" x2="${w-p}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(79,179,169,.85)" stroke-width="2" stroke-dasharray="7 5" vector-effect="non-scaling-stroke"/><rect x="${p+4}" y="${Math.min(h-22,Math.max(4,labelY-14))}" width="166" height="18" rx="5" fill="rgba(8,29,44,.9)"/><text x="${p+12}" y="${Math.min(h-8,Math.max(17,labelY-1))}" fill="#8ad8cf" font-size="11" font-weight="700">Mín. histórico ${v.toFixed(2)} m</text>`)}
 const htxt=id?historicoTextoCorto(id,data.at(-1)?.nivel):'';
 const step=Math.max(1,Math.ceil(data.length/16));
 const xLabels=data.map((d,i)=>i%step===0||i===data.length-1?`<text x="${pts[i][0]}" y="266" text-anchor="middle" fill="#aebdc5" font-size="10" transform="rotate(-35 ${pts[i][0]} 266)">${fmtDate(d.fechaBoletin).slice(0,5)}</text>`:'').join('');
 const circles=pts.map((pt,i)=>`<circle cx="${pt[0]}" cy="${pt[1]}" r="4" fill="#e8a33d"><title>${fmtDate(data[i].fechaBoletin)} · ${data[i].nivel.toFixed(2)} m</title></circle>`).join('');
 const svg=`<svg class="chart-canvas" width="${w}" height="285" viewBox="0 0 ${w} 285" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Serie temporal de ${STATION_BY_ID.get(id)?.nombre||'la estación'}">${refs.join('')}<text x="${w-p}" y="24" text-anchor="end" fill="#aebdc5" font-size="10">${htxt}</text><path d="${path}" fill="none" stroke="#4fb3a9" stroke-width="3" vector-effect="non-scaling-stroke"/><g>${circles}</g>${xLabels}</svg>`;
 el.innerHTML=`<div class="chart-scroll" id="chart-scroll" style="width:${w}px">${svg}</div>`;
 const sc=viewport;
 if(sc&&needsScroll){requestAnimationFrame(()=>{sc.scrollLeft=sc.scrollWidth-sc.clientWidth});let down=false,startX=0,startLeft=0;sc.style.cursor='grab';sc.onmousedown=e=>{down=true;startX=e.pageX;startLeft=sc.scrollLeft;sc.style.cursor='grabbing'};window.addEventListener('mouseup',()=>{down=false;if(sc)sc.style.cursor='grab'},{once:false});sc.onmousemove=e=>{if(!down)return;e.preventDefault();sc.scrollLeft=startLeft-(e.pageX-startX)}}
 if(hint)hint.innerHTML=needsScroll?`<span><strong>Desplazamiento activo:</strong> usá la barra inferior o arrastrá horizontalmente para recorrer la serie.</span><span>La tabla inferior posee scroll vertical independiente.</span>`:`<span>La serie visible cabe completa en el visor. La tabla inferior posee scroll vertical independiente.</span>`;
}
