/* Récords respecto a la referencia cargada. No sustituye alertas oficiales. */
function validReading(d){return !!d && d.nivel!==null && d.nivel!=='' && Number.isFinite(Number(d.nivel)) && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha||'')}
function observedRows(id,cutoff='9999-12-31'){
 const unique=new Map();
 for(const d of historial(id)) if(validReading(d)&&d.fecha<=cutoff&&d.fechaBoletin<=cutoff&&d.fecha<=d.fechaBoletin) unique.set(d.fecha,{...d,fechaBoletin:d.fecha,nivel:Number(d.nivel)});
 return [...unique.values()].sort((a,b)=>a.fecha.localeCompare(b.fecha));
}
function recordExcess(id,d){const ref=HISTORICO[id]?.max;if(!validReading(d)||!ref||!Number.isFinite(ref.nivel)||d.fecha<=ref.fecha)return null;const cm=Math.round(Number(d.nivel)*100)-Math.round(ref.nivel*100);return cm>0?{ref,cm}:null}
function recordEvents(id,cutoff=state.fechaVista){
 const ref=HISTORICO[id]?.max;if(!ref)return [];
 let high=ref.nivel;const result=[];
 for(const d of observedRows(id,cutoff)){
  if(d.fecha<=ref.fecha)continue;
  if(Math.round(d.nivel*100)>Math.round(high*100)){result.push({...d,previous:high,excess:Math.round((d.nivel-ref.nivel)*100)});high=d.nivel;}
 }
 return result;
}
function recordBadge(id,d){if(!validReading(d))return '';const a=stationAnalysis(id,d.fecha);if(!a.first)return '';return `<div class="record-notice"><strong>◆ Máximo histórico superado el ${fmtDate(a.first.fecha)}</strong><span>En la serie disponible, el primer nivel observado por encima del máximo anterior (${m(a.ref.max.nivel)}) fue ${m(a.first.nivel)}. ${a.above?'La lectura del '+fmtDate(d.fecha)+' se mantiene '+a.above.cm+' cm por encima.':'La lectura del '+fmtDate(d.fecha)+' ya no supera ese máximo.'}</span><small>Comparación con el máximo histórico registrado en la base, del ${fmtDate(a.ref.max.fecha)}.</small></div>`;}
function recordBoard(cutoff=state.fechaVista){
 const items=ESTACIONES_BASE.map(s=>({s,events:annualExtremeSummary(s.id,cutoff)})).filter(x=>x.events.length);
 if(!items.length)return '';
 return `<details class="record-disclosure annual-records"><summary><span class="record-beacon" aria-hidden="true"></span><span>Nuevos extremos históricos <b>${items.length}</b><small>Año ${cutoff.slice(0,4)} · hasta ${fmtDate(cutoff)}</small></span></summary><div class="annual-record-body"><p>Mayor récord máximo y menor récord mínimo de cada estación durante el año consultado.</p><div class="annual-record-head"><span>Estación / extremo</span><span>Nivel</span><span>Fecha</span></div>${items.map(({s,events})=>events.map(d=>`<button type="button" class="annual-record-row" data-action="open-station" data-station-id="${s.id}" aria-label="Ver ${s.nombre}, nuevo ${d.kind==='max'?'máximo':'mínimo'} de ${m(d.nivel)} el ${fmtDate(d.fecha)}"><span class="annual-record-station"><strong>${s.nombre}</strong><small class="extreme-${d.kind}">${d.kind==='max'?'◆ Máximo':'◇ Mínimo'}</small></span><span class="annual-record-level extreme-${d.kind}">${m(d.nivel)}</span><time datetime="${d.fecha}">${fmtDate(d.fecha)}</time></button>`).join('')).join('')}<p class="annual-record-note">Se conservan aunque el nivel cambie. No son alertas oficiales.</p></div></details>`;
}

// Comparaciones exactas: nunca sustituir una base faltante por otro día.
function stationAnalysis(id,cutoff=state.fechaVista){
 const rows=observedRows(id,cutoff),last=rows.at(-1),ref=HISTORICO[id];
 if(!last)return {rows,last:null,changes:[],events:[]};
 const changes=[7,15,30].map(n=>{const target=addDays(last.fecha,-n),base=rows.find(d=>d.fecha===target);return {days:n,target,base,delta:base?last.nivel-base.nivel:null}});
 const events=recordEvents(id,cutoff),first=events[0],peak=rows.reduce((a,b)=>b.nivel>a.nivel?b:a);
 const prev=rows.at(-2),daily=prev&&days(prev.fecha,last.fecha)===1?last.nivel-prev.nivel:null;
 let streak=0;const direction=daily==null?null:Math.sign(Math.round(daily*100));
 for(let i=rows.length-1;i>0;i--){if(days(rows[i-1].fecha,rows[i].fecha)!==1||Math.sign(Math.round((rows[i].nivel-rows[i-1].nivel)*100))!==direction)break;streak++;}
 const position=ref?.min&&ref?.max&&ref.max.nivel>ref.min.nivel?100*(last.nivel-ref.min.nivel)/(ref.max.nivel-ref.min.nivel):null;
 return {rows,last,changes,events,first,peak,daily,streak,direction,position,ref,above:recordExcess(id,last)};
}
function evolutionSummary(a){if(!a.last)return 'Sin lecturas disponibles.';const trend=a.daily==null?'No hay lectura del día anterior para evaluar el cambio diario.':`${a.daily>0?'Subió':a.daily<0?'Bajó':'Se mantuvo'} ${formatDelta(a.daily,{absolute:true})} en las últimas 24 h observadas.${a.streak>1?' Acumula '+a.streak+' días consecutivos de '+(a.direction>0?'ascenso':a.direction<0?'descenso':'estabilidad')+'.':''}`;return trend;}
function changesHtml(a,compact=false){return `<div class="change-grid ${compact?'compact':''}">${a.changes.map(c=>`<div><span>Δ ${c.days} días</span><b class="${c.delta===null?'':trendClass(c.delta)}">${c.delta===null?'—':formatDelta(c.delta)}</b><small>${c.base?fmtDate(c.base.fecha)+' → '+fmtDate(a.last.fecha):'Sin lectura del '+fmtDate(c.target)}</small></div>`).join('')}</div>`;}
function positionHtml(a){if(a.position==null)return '';return `<div class="historical-context"><div><span>Posición en el rango histórico</span><b>${a.position.toFixed(1)}%</b></div><div class="position-track"><i style="left:${Math.max(0,Math.min(100,a.position))}%"></i></div><div class="position-extremes"><span>Mín. ${m(a.ref.min.nivel)}</span><span>Máx. anterior ${m(a.ref.max.nivel)}</span></div><small>Ubicación entre los extremos registrados. ${a.position>100?'Supera el extremo superior. ':''}No es probabilidad de inundación ni percentil.</small></div>`;}
function eventSummary(a){if(!a.first)return '';const peak=a.events.at(-1);return `<div class="event-timeline"><div><span>Fecha del primer registro sobre el máximo anterior</span><b>${fmtDate(a.first.fecha)}</b><small>${m(a.first.nivel)} · máximo anterior ${m(a.ref.max.nivel)}</small></div><div><span>Mayor nivel desde la superación</span><b>${m(peak.nivel)}</b><small>${fmtDate(peak.fecha)}</small></div><div><span>Última lectura frente al pico</span><b>${formatDelta(a.last.nivel-peak.nivel)}</b><small>${a.above?'Permanece sobre el máximo anterior':'Ya no supera el máximo anterior'}</small></div></div>`;}

function monthlyRecord(id,cutoff=state.fechaVista){return recordEvents(id,cutoff).some(r=>r.fecha>=cutoff.slice(0,7)+'-01');}
function historicalExtremesHtml(id,cutoff=state.fechaVista){
 const o=OFFICIAL_EXTREMES[id],ref=HISTORICO[id],a=stationAnalysis(id,cutoff);if(!o)return '';
 const card=(label,d)=>`<div class="popup-history-card"><span>${label}</span><div class="popup-value">${m(d.nivel)}</div><div class="popup-date-mini">${fmtDate(d.fecha)}</div></div>`;
 return `<div class="popup-history">${card('Mínimo histórico · DMH',o.min)}${card('Máximo histórico · DMH',o.max)}</div><small>Extremos publicados por la DMH al 20/10/2026; pueden ser posteriores a la fecha consultada.</small>${a.first?`<div class="record-notice"><strong>◆ Récord registrado en la serie</strong><span>${m(a.events.at(-1).nivel)} · ${fmtDate(a.events.at(-1).fecha)} · +${a.events.at(-1).excess} cm respecto del máximo histórico anterior de ${m(ref.max.nivel)} (${fmtDate(ref.max.fecha)}).</span></div>`:''}<a href="https://www.meteorologia.gov.py/nivel-rio/indexconvencional.php" target="_blank" rel="noopener">Consultar extremos en la DMH ↗</a>`;
}

function minimumRecordEvents(id,cutoff=state.fechaVista){
 const ref=HISTORICO[id]?.min;if(!ref)return [];let low=ref.nivel;const result=[];
 for(const d of observedRows(id,cutoff)){if(d.fecha<=ref.fecha)continue;if(Math.round(d.nivel*100)<Math.round(low*100)){result.push({...d,previous:low,excess:Math.round((ref.nivel-d.nivel)*100),kind:'min'});low=d.nivel;}}
 return result;
}
function recentExtremes(id,cutoff=state.fechaVista){const start=addDays(cutoff,-29);return [...recordEvents(id,cutoff).map(d=>({...d,kind:'max'})),...minimumRecordEvents(id,cutoff)].filter(d=>d.fecha>=start).sort((a,b)=>a.fecha.localeCompare(b.fecha));}
function extremeMarkerClass(id){const events=annualExtremes(id);return events.some(d=>d.kind==='max')?'mk-record':events.length?'mk-min-record':'';}
function extremeSummary(id){const events=recentExtremes(id);return ['max','min'].map(kind=>events.filter(d=>d.kind===kind).at(-1)).filter(Boolean);}

function annualExtremes(id,cutoff=state.fechaVista){const start=cutoff.slice(0,4)+'-01-01';return [...recordEvents(id,cutoff).map(d=>({...d,kind:'max'})),...minimumRecordEvents(id,cutoff)].filter(d=>d.fecha>=start).sort((a,b)=>a.fecha.localeCompare(b.fecha));}
function annualExtremeSummary(id,cutoff=state.fechaVista){const events=annualExtremes(id,cutoff);return ['max','min'].map(kind=>events.filter(d=>d.kind===kind).at(-1)).filter(Boolean);}
