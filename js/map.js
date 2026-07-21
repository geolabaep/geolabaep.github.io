/* Mapa, filtros espaciales y panel de monitoreo. */
function initMap(){const target=qs('#map');if(!target)return false;if(typeof window.L==='undefined'){target.innerHTML='<div class="map-fallback"><b>Mapa no disponible</b><span>No se pudo cargar Leaflet. El panel de estaciones y los demás módulos siguen operativos.</span></div>';return false}try{state.map=L.map('map').setView([-24.4,-57.6],6);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(state.map);renderMarkers();addMapLegend();return true}catch(error){console.error('[Observatorio] No fue posible iniciar el mapa.',error);target.innerHTML='<div class="map-fallback"><b>Mapa no disponible</b><span>El panel de estaciones y los demás módulos siguen operativos.</span></div>';state.map=null;return false}}
function addMapLegend(){const legend=L.control({position:'bottomleft'});legend.onAdd=function(){const div=L.DomUtil.create('div','map-legend');state.mapLegendEl=div;L.DomEvent.disableClickPropagation(div);updateMapLegend();return div};legend.addTo(state.map)}
function updateMapLegend(){if(!state.mapLegendEl)return;const contexto=state.mapMode==='daily'?'Frente al registro anterior':`Frente a ${state.mapTrendPeriod} días atrás`;state.mapLegendEl.innerHTML=`<div class="map-legend-head"><div class="map-legend-kicker">Cambio observado</div><div class="map-legend-title">${contexto}</div></div><div class="map-legend-section"><div class="map-legend-section-title">Dirección</div><div class="map-legend-directions"><div class="map-legend-direction"><span class="map-legend-arrow up">↑</span><span>Sube</span></div><div class="map-legend-direction"><span class="map-legend-arrow down">↓</span><span>Baja</span></div><div class="map-legend-direction"><span class="map-legend-arrow stable">→</span><span>Estable</span></div></div></div><div class="map-legend-section"><div class="map-legend-section-title">Actualidad del dato</div><div class="map-legend-quality"><div class="map-legend-quality-row" title="La lectura corresponde a la fecha consultada"><span class="legend-state-dot current"></span><span>Actualizada</span></div><div class="map-legend-quality-row" title="Dato anterior de hasta 10 días; conserva la última dirección conocida"><span class="legend-state-dot recent"></span><span>Anterior ≤10 días</span></div><div class="map-legend-quality-row" title="Han pasado más de 10 días sin una nueva lectura"><span class="legend-state-question">?</span><span>Más de 10 días</span></div><div class="map-legend-quality-row" title="No existe una lectura utilizable"><span class="legend-state-dot empty"></span><span>Sin dato</span></div></div></div>`}
function staleDays(d,fecha=state.fechaVista){return d?.fecha?Math.max(0,days(d.fecha,fecha)):9999}
function markerClassFromSignal(d,fecha,signal){const e=estadoEstacion(d,fecha);if(e==='sin')return'mk-empty';if(e==='anterior'||e==='antiguo')return'mk-old';if(signal==null)return'mk-old';return signal>0?'mk-up':signal<0?'mk-down':'mk-stable'}
function markerClass(d,fecha){return markerClassFromSignal(d,fecha,d?.variacion)}
function mapSignalForStation(s,d){if(!d)return null;const e=estadoEstacion(d,state.fechaVista);if(e!=='ok'&&staleDays(d)>10)return null;if(state.mapMode==='daily')return Number(d.variacion||0);const period=variacionPeriodoEstacion(s.id,Number(state.mapTrendPeriod)||7);return period?Number(period.delta):Number(d.variacion||0)}
function markerSymbol(d,signal){if(!d)return'·';if(estadoEstacion(d,state.fechaVista)!=='ok'&&staleDays(d)>10)return'?';return signal==null?'?':trendIcon(signal)}
function mapMovementMatches(signal){if(state.mapMovement==='all')return true;if(signal==null)return false;if(state.mapMovement==='up')return signal>0;if(state.mapMovement==='down')return signal<0;if(state.mapMovement==='stable')return signal===0;return true}
function setMapMode(mode){state.mapMode=mode==='trend'?'trend':'daily';state.mapMovement='all';renderAll()}
function setMapTrendPeriod(days){state.mapTrendPeriod=Number(days)===30?30:7;renderAll()}
function setMapMovement(movement){state.mapMovement=state.mapMovement===movement&&movement!=='all'?'all':movement;renderAll()}
function mapFilterCounts(){const out={all:0,up:0,down:0,stable:0,noBase:0};ESTACIONES_BASE.forEach(s=>{const d=stationData(s.id);if(estadoEstacion(d,state.fechaVista)!=='ok')return;const signal=mapSignalForStation(s,d);if(signal==null){out.noBase++;return}out.all++;if(signal>0)out.up++;else if(signal<0)out.down++;else out.stable++});return out}
function popupEstadoLabel(e){return labelEstado(e)}
function popupFechaTexto(d,e){if(e==='ok')return `Dato de la fecha consultada: <b>${fmtDate(d.fecha)}</b>`;if(e==='anterior')return `Último dato disponible: <b>${fmtDate(d.fecha)}</b>`;return `Dato: <b>${fmtDate(d.fecha)}</b>`}
function popupHtml(s,d){
 const e=estadoEstacion(d,state.fechaVista);const cls=d?trendClass(d.variacion):'';const mk=markerClass(d,state.fechaVista);const h=HISTORICO[s.id];
 const coords=`${Math.abs(s.lat).toFixed(4)}° ${s.lat<0?'S':'N'} · ${Math.abs(s.lon).toFixed(4)}° ${s.lon<0?'O':'E'}`;
 const histRows=historial(s.id).filter(x=>x&&x.nivel!=null);
 const avg=histRows.length?histRows.reduce((a,b)=>a+Number(b.nivel),0)/histRows.length:null;
 const pct=d?historicoPct(s.id,d.nivel):null;const hi=pct!=null?historicoInterpretacion(pct):null;
 const dias=d?days(d.fecha,state.fechaVista):null;
 const historico=h?`<div class="popup-history"><div class="popup-history-card"><div class="popup-label">Máximo histórico</div><div class="popup-value">${h.max.nivel.toFixed(2)} m</div><div class="popup-date-mini">${fmtDate(h.max.fecha)}</div></div><div class="popup-history-card"><div class="popup-label">Mínimo histórico</div><div class="popup-value">${h.min.nivel.toFixed(2)} m</div><div class="popup-date-mini">${fmtDate(h.min.fecha)}</div></div></div>`:`<div class="popup-note">Histórico máximo/mínimo pendiente de carga.</div>`;
 const extra=`<div class="popup-extra"><div class="popup-extra-card"><div class="popup-label">Coordenadas</div><div class="popup-coords">${coords}</div></div><div class="popup-extra-card"><div class="popup-label">Promedio serie</div><div class="popup-value">${avg!=null?avg.toFixed(2)+' m':'—'}</div></div>${pct!=null?`<div class="popup-extra-card"><div class="popup-label">Posición hist.</div><div class="popup-value">${Math.round(pct)}%</div><div class="popup-date-mini">${hi.label}</div></div>`:''}${dias!=null?`<div class="popup-extra-card"><div class="popup-label">Antigüedad</div><div class="popup-value">${dias} día(s)</div></div>`:''}</div>`;
 if(!d){return `<div class="popup-card"><div class="popup-top"><div class="popup-river">${s.rio}</div><div class="popup-title">${s.nombre}</div><div class="popup-badge ${mk}">·</div></div><div class="popup-empty">No hay datos cargados para esta estación en la fecha consultada.</div><div class="popup-body">${extra}${historico}<button type="button" class="popup-action" data-action="open-station" data-station-id="${s.id}">Ver estación</button></div></div>`}
 const nota=e==='anterior'?`<div class="popup-note">ℹ Dato desactualizado hace ${staleDays(d)} día(s). ${staleDays(d)<=10?'La flecha conserva la dirección de la última lectura registrada.':'Han pasado más de 10 días; no se presenta una dirección operativa confiable.'}</div>`:'';
 return `<div class="popup-card"><div class="popup-top"><div class="popup-river">${s.rio}</div><div class="popup-title">${s.nombre}</div><div class="popup-badge ${mk}">${markerSymbol(d,Number(d.variacion||0))}</div></div><div class="popup-body"><div class="popup-kpis"><div class="popup-kpi"><div class="popup-label">Nivel</div><div class="popup-value">${d.nivel.toFixed(2)} m</div></div><div class="popup-kpi"><div class="popup-label">Variación</div><div class="popup-value trend ${cls}">${formatDelta(d.variacion,{absolute:true,icon:true})}</div></div></div><div class="popup-date"><span>${popupFechaTexto(d,e)}</span><span class="popup-status ${clsEstado(e)}">${popupEstadoLabel(e)}</span></div>${popupSparkline(s.id)}${extra}${historico}${nota}<button type="button" class="popup-action" data-action="open-station" data-station-id="${s.id}">Ver historial</button></div></div>`}
function renderMarkers(){if(!state.map)return;Object.values(state.marcador).forEach(m=>m.remove());state.marcador={};ESTACIONES_BASE.forEach(s=>{const d=stationData(s.id);const e=estadoEstacion(d,state.fechaVista);if(!estadoCoincideFiltro(e))return;const signal=mapSignalForStation(s,d);if(!mapMovementMatches(signal))return;const html=`<div class="marker-dot ${markerClassFromSignal(d,state.fechaVista,signal)}">${markerSymbol(d,signal)}</div>`;const icon=L.divIcon({html,className:'',iconSize:[24,24],iconAnchor:[12,12]});const m=L.marker([s.lat,s.lon],{icon}).addTo(state.map);m.bindPopup(popupHtml(s,d),{closeButton:false,offset:[0,-8],maxWidth:320});state.marcador[s.id]=m});updateMapLegend()}
function fechasDisponibles(){const set=new Set(state.boletines.map(b=>b.fecha));set.add(todayISO());if(state.fechaVista)set.add(state.fechaVista);return Array.from(set).sort((a,b)=>b.localeCompare(a))}
function opcionesFecha(){return fechasDisponibles().map(f=>`<option value="${f}" ${f===state.fechaVista?'selected':''}>${fmtDate(f)}${boletin(f)?'':' · pendiente'}</option>`).join('')}
function cambiarFechaMapa(fecha){if(!fecha)return;state.fechaVista=fecha;renderAll()}
function dotClass(e){if(e==='ok')return 'dot-ok'; if(e==='sin')return 'dot-empty'; return 'dot-old'}
function compactStatusText(e,fechaDato,fechaConsultada){
  const fecha = fechaDato ? fmtDate(fechaDato) : '—';
  if(e==='ok') return `Actualizada · ${fecha}`;
  if(e==='anterior') return `Desactualizada · ${fecha}`;
  return 'Sin dato';
}

function contarEstadosPanel(){
  const c={total:ESTACIONES_BASE.length,actualizadas:0,fechaAnterior:0,sinDato:0};
  ESTACIONES_BASE.forEach(st=>{
    const d=stationData(st.id);
    const e=estadoEstacion(d,state.fechaVista);
    if(e==='ok') c.actualizadas++;
    else if(e==='sin') c.sinDato++;
    else c.fechaAnterior++;
  });
  return c;
}

function estadoCoincideFiltro(e){
  if(state.filtroPanel==='todos') return true;
  if(state.filtroPanel==='actualizadas') return e==='ok';
  if(state.filtroPanel==='fechaAnterior'||state.filtroPanel==='fechaDistinta'||state.filtroPanel==='desactualizadas'||state.filtroPanel==='pendientes') return e==='anterior';
  if(state.filtroPanel==='sinDato') return e==='sin';
  return true;
}
function cambiarFiltroPanel(filtro){
  state.filtroPanel = state.filtroPanel===filtro ? 'todos' : filtro;
  renderAll();
}
function claseFiltroPanel(filtro){return state.filtroPanel===filtro?' active':''}
function textoFiltroPanel(){
  return {todos:'Todas las estaciones',actualizadas:'Actualizadas',fechaAnterior:'Desactualizadas',fechaDistinta:'Desactualizadas',desactualizadas:'Desactualizadas',pendientes:'Desactualizadas',sinDato:'Sin dato'}[state.filtroPanel] || 'Todas las estaciones';
}


function fmtDateCorta(iso){if(!iso)return '—';const [y,m,d]=iso.split('-');return `${d}/${m}`}
function popupSparkline(id){const serie=historial(id).slice(-10);if(!serie||serie.length<2)return '<div class="popup-mini-trend"><div class="popup-mini-trend-title">Evolución observada</div><div class="popup-note">Sin datos suficientes para graficar.</div></div>';return `<div class="popup-mini-trend"><div class="popup-mini-trend-head"><div class="popup-mini-trend-title">Evolución observada</div><div class="popup-mini-trend-range">${serie.length} registros</div></div>${renderMiniSpark(serie)}</div>`}
function textoInformeDiario(){const c=estadoConteoV2();const actualizadas=estacionesActualizadasOperativas();const subidas=actualizadas.filter(x=>x.d.variacion>0).sort((a,b)=>b.d.variacion-a.d.variacion);const bajadas=actualizadas.filter(x=>x.d.variacion<0).sort((a,b)=>a.d.variacion-b.d.variacion);const revisar=estacionesRevisionOperativa();let partes=[];partes.push(`Fecha consultada hidrológico del ${fmtDate(state.fechaVista)}.`);partes.push(`El Observatorio registra ${c.actualizadas} de ${c.total} estaciones actualizadas para la fecha seleccionada.`);if(c.fechaAnterior||0||c.pendientes||c.sinDato){partes.push(`Requieren revisión ${c.desactualizadas+c.sinDato} estaciones: ${c.desactualizadas} desactualizadas y ${c.sinDato} sin dato.`)}else{partes.push('No se registran estaciones pendientes de revisión para esta fecha consultada.')}if(subidas.length){partes.push(`Las principales subidas se observan en ${subidas.slice(0,3).map(x=>`${x.est.nombre} (${formatDelta(x.d.variacion,{absolute:true,icon:true})})`).join(', ')}.`)}if(bajadas.length){partes.push(`Las principales bajadas se observan en ${bajadas.slice(0,3).map(x=>`${x.est.nombre} (${formatDelta(x.d.variacion,{absolute:true,icon:true})})`).join(', ')}.`)}if(!subidas.length&&!bajadas.length){partes.push('No se observan variaciones relevantes en las estaciones actualizadas.')}return partes.join('\n\n')}
function renderSidebar(){
 const r=resumen();const pct=Math.round(r.ok/r.total*100);const existe=!!boletin(state.fechaVista);const c=contarEstadosPanel();const mc=mapFilterCounts();
 const contextLabel=state.mapMode==='daily'?'cambio diario':`cambio observado frente a ${state.mapTrendPeriod} días`;
 let html=`<div class="side-head"><div class="row"><div><b>Fecha consultada ${fmtDate(state.fechaVista)}</b><div class="small">${existe?`<strong>${c.actualizadas}/${c.total}</strong> actualizadas · ${pct}% de cobertura`:'Fecha pendiente de carga'}</div></div><span class="pill">Consulta pública</span></div><div class="date-controls"><div><label>Fecha consultada</label><input type="date" value="${state.fechaVista}" data-change="view-date"></div><div><label>Fechas disponibles</label><select data-change="view-date">${opcionesFecha()}</select></div></div>${!existe?'<div class="pending-note">No existe un boletín publicado para esta fecha.</div>':''}<div class="progress"><div class="bar" style="width:${pct}%"></div></div><div class="metrics compact-metrics"><div class="metric mini total filterable${claseFiltroPanel('todos')}" data-action="panel-filter" data-filter="todos"><b>${c.total}</b><span>Total</span></div><div class="metric mini ok filterable${claseFiltroPanel('actualizadas')}" data-action="panel-filter" data-filter="actualizadas"><b>${c.actualizadas}</b><span>Actualizadas</span></div><div class="metric mini previous filterable${claseFiltroPanel('fechaAnterior')}" data-action="panel-filter" data-filter="fechaAnterior"><b>${c.fechaAnterior}</b><span>Desactualizadas</span></div><div class="metric mini empty filterable${claseFiltroPanel('sinDato')}" data-action="panel-filter" data-filter="sinDato"><b>${c.sinDato}</b><span>Sin dato</span></div></div><div class="filter-note">Estado de datos: <b>${textoFiltroPanel()}</b>${state.filtroPanel!=='todos'?` · <button type="button" data-action="panel-filter" data-filter="todos">ver todas</button>`:''}</div>
 <div class="map-filter-box"><div class="map-filter-title">Visualización del mapa</div><div class="map-mode-row"><button type="button" class="map-filter-btn ${state.mapMode==='daily'?'active':''}" data-action="map-mode" data-mode="daily">Cambio diario</button><button type="button" class="map-filter-btn ${state.mapMode==='trend'?'active':''}" data-action="map-mode" data-mode="trend">Comparación temporal</button></div>${state.mapMode==='trend'?`<div class="map-period-row"><span>Periodo de comparación</span><select data-change="map-period"><option value="7" ${state.mapTrendPeriod===7?'selected':''}>Frente a 7 días atrás</option><option value="30" ${state.mapTrendPeriod===30?'selected':''}>Frente a 30 días atrás</option></select></div>`:''}<div class="map-movement-row"><button type="button" class="map-filter-btn ${state.mapMovement==='all'?'active':''}" data-action="map-movement" data-movement="all">Todas ${mc.all}</button><button type="button" class="map-filter-btn up ${state.mapMovement==='up'?'active':''}" data-action="map-movement" data-movement="up">↑ ${mc.up}</button><button type="button" class="map-filter-btn down ${state.mapMovement==='down'?'active':''}" data-action="map-movement" data-movement="down">↓ ${mc.down}</button><button type="button" class="map-filter-btn stable ${state.mapMovement==='stable'?'active':''}" data-action="map-movement" data-movement="stable">→ ${mc.stable}</button></div><div class="map-filter-summary">Mostrando estaciones por <b>${contextLabel}</b>.${state.mapMode==='trend'&&mc.noBase?` ${mc.noBase} sin base comparable.`:''}</div></div></div><div class="station-list compact">`;
 const groups={};ESTACIONES_BASE.forEach(s=>{const d=stationData(s.id);const e=estadoEstacion(d,state.fechaVista);if(!estadoCoincideFiltro(e))return;const signal=mapSignalForStation(s,d);if(!mapMovementMatches(signal))return;(groups[s.rio]??=[]).push(s)});
 const riosVisibles=Object.keys(groups);if(!riosVisibles.length){html+=`<div class="sin-dato">No hay estaciones para los filtros seleccionados.</div>`}for(const rio of riosVisibles){html+=`<div class="rio-title compact-title">${rio}</div>`;groups[rio].forEach(s=>{const d=stationData(s.id);const e=estadoEstacion(d,state.fechaVista);const signal=mapSignalForStation(s,d);const trend=signal==null?'empty':trendClass(signal);const varTxt=signal==null?'—':formatDelta(signal,{absolute:true,icon:true});const nivel=d?d.nivel.toFixed(2):'—';const meta=d?compactStatusText(e,d.fecha,state.fechaVista):'Sin dato';html+=`<div class="station-row" data-action="open-station" data-station-id="${s.id}"><span class="station-dot ${dotClass(e)}"></span><div class="station-main"><div class="station-name">${s.nombre}</div><div class="station-meta ${e}">${meta}</div></div><div class="station-value">${nivel}${d?' m':''}</div><div class="station-change ${trend}" title="${contextLabel}">${varTxt}</div></div>`})}
 html+='</div>';qs('#sidebar-monitor').innerHTML=html}
let uiRenderFrame=null;
const uiRenderQueue=new Set();
function requestUIUpdate(scope='all'){
 uiRenderQueue.add(scope);
 if(uiRenderFrame!=null)return;
 const schedule=window.requestAnimationFrame||((cb)=>setTimeout(cb,0));
 uiRenderFrame=schedule(flushUIUpdate);
}
function flushUIUpdate(){
 uiRenderFrame=null;
 const scopes=new Set(uiRenderQueue);uiRenderQueue.clear();
 const all=scopes.has('all');
 if(all||scopes.has('monitor')){renderSidebar();renderMarkers();}
 if((all||scopes.has('history'))&&qs('#screen-history')?.classList.contains('active'))renderHistory();
 if((all||scopes.has('ops'))&&qs('#screen-ops')?.classList.contains('active'))renderOps();
 if((all||scopes.has('method'))&&qs('#screen-method')?.classList.contains('active'))renderMethodology();
}
function renderAll(){requestUIUpdate('all')}

function coberturaFecha(fecha){
 const key=`${DATA_INDEX.revision}:${fecha}`;if(DERIVED_CACHE.coverage.has(key))return DERIVED_CACHE.coverage.get(key);
 const b=boletin(fecha),total=ESTACIONES_BASE.length;
 if(!b){const empty={existe:false,directos:0,total,estado:'vacio',porcentaje:0};DERIVED_CACHE.coverage.set(key,empty);return empty}
 let directos=0;ESTACIONES_BASE.forEach(s=>{const d=b.estaciones?.[s.id];if(d&&d.nivel!=null&&d.fecha===fecha)directos++});
 const porcentaje=total?Math.round(directos/total*100):0,estado=directos===0?'vacio':directos===total?'completo':'parcial';
 const result={existe:directos>0,directos,total,estado,porcentaje};DERIVED_CACHE.coverage.set(key,result);return result;
}
function rangoCalendarioOperativo(){
 const validas=state.boletines.filter(b=>{
  let n=0;ESTACIONES_BASE.forEach(s=>{const d=b.estaciones?.[s.id];if(d&&d.nivel!=null&&d.fecha===b.fecha)n++});return n>=5;
 }).map(b=>b.fecha).sort();
 return {min:validas[0]||DATA_INDEX.dates[0]||todayISO(),max:todayISO()};
}
function calendarMonthLabel(ym){const [y,m]=ym.split('-').map(Number);return new Intl.DateTimeFormat('es-PY',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));}
function renderDataCalendar(){
 const box=qs('#dataCalendar');if(!box)return;
 const selected=state.fechaVista||todayISO();
 const ym=state.calendarMonth||selected.slice(0,7);state.calendarMonth=ym;
 const [y,m]=ym.split('-').map(Number),first=new Date(y,m-1,1),last=new Date(y,m,0),start=(first.getDay()+6)%7;
 const range=rangoCalendarioOperativo();
 let cells='';
 for(let i=0;i<start;i++)cells+='<button type="button" class="data-day outside" tabindex="-1"></button>';
 for(let d=1;d<=last.getDate();d++){
  const iso=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const c=coberturaFecha(iso);const inRange=iso>=range.min&&iso<=range.max;const future=iso>range.max;
  const cls=future?'future':!inRange?'outside':c.estado==='completo'?'has-data':c.estado==='parcial'?'partial-data':'missing-data';
  const title=future?'Fecha futura':!inRange?'Fuera del período operativo':c.estado==='completo'?`Cobertura completa: ${c.directos}/${c.total}`:c.estado==='parcial'?`Cobertura parcial: ${c.directos}/${c.total}`:'Sin datos cargados para esta fecha';
  const disabled=(future||!inRange)?'disabled':'';
  cells+=`<button type="button" class="data-day ${cls} ${iso===selected?'selected':''}" ${disabled} title="${title}" data-action="calendar-date" data-date="${iso}">${d}</button>`;
 }
 box.innerHTML=`<div class="data-calendar-head"><button type="button" class="data-calendar-nav" data-action="calendar-shift" data-delta="-1">‹</button><div class="data-calendar-title">${calendarMonthLabel(ym)}</div><button type="button" class="data-calendar-nav" data-action="calendar-shift" data-delta="1">›</button></div><div class="data-calendar-week"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div><div class="data-calendar-grid">${cells}</div><div class="data-calendar-legend"><span><i class="cal-dot ok"></i>Completo</span><span><i class="cal-dot partial"></i>Parcial</span><span><i class="cal-dot missing"></i>Sin datos</span></div>`;
}
function toggleDataCalendar(ev){if(ev)ev.stopPropagation();const box=qs('#dataCalendar');if(!box)return;const open=!box.classList.contains('open');qsa('.data-calendar.open').forEach(x=>x.classList.remove('open'));if(open){box.classList.add('open');renderDataCalendar()}}
function closeDataCalendar(){qs('#dataCalendar')?.classList.remove('open')}
function shiftDataCalendar(delta){const [y,m]=(state.calendarMonth||state.fechaVista.slice(0,7)).split('-').map(Number);const d=new Date(y,m-1+delta,1);state.calendarMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;renderDataCalendar()}
function selectCalendarDate(fecha){state.fechaVista=fecha;state.calendarMonth=fecha.slice(0,7);closeDataCalendar();renderAll()}
document.addEventListener('click',e=>{if(!e.target.closest('.data-date-picker'))closeDataCalendar()});
