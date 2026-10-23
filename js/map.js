/* Mapa, filtros espaciales y panel de monitoreo. */
const PARAGUAY_BOUNDS=[[-27.75,-62.75],[-19.15,-54.15]];
function applyInitialMapView(map){
 if(window.matchMedia('(max-width:760px)').matches)map.fitBounds(PARAGUAY_BOUNDS,{padding:[10,10],maxZoom:6,animate:false});
 else map.setView([-24.4,-57.6],6);
}
function initMap(){
 const target=qs('#map');if(!target)return false;
 if(typeof window.L==='undefined'){target.innerHTML='<div class="map-fallback">No se pudo iniciar el motor del mapa. Abrí el archivo descargado en Chrome o Edge.</div>';return false}
 try{
 state.map=L.map('map');applyInitialMapView(state.map);
 // Cartografía vectorial incluida: estaciones y límites no dependen de las teselas.
 state.map.createPane('fallbackBase');state.map.getPane('fallbackBase').style.zIndex='150';
 L.geoJSON(MAP_BASE,{pane:'fallbackBase',style:f=>({color:'#93aab5',weight:1,fillColor:f.properties.name==='Paraguay'?'#edf2e8':'#f7f5ee',fillOpacity:1}),interactive:false}).addTo(state.map);
 const tile=(url,attribution)=>L.tileLayer(url,{maxNativeZoom:18,maxZoom:19,attribution,updateWhenIdle:true});
 const IncludedTiles=L.TileLayer.extend({getTileUrl(coords){return INCLUDED_MAP_TILES[coords.z+'/'+coords.x+'/'+coords.y]||L.Util.emptyImageUrl;}});
 const included=new IncludedTiles('',{minNativeZoom:5,maxNativeZoom:8,maxZoom:19,noWrap:true,bounds:[[-29,-64],[-14,-52]],attribution:'Mapa regional incluido · Esri, HERE, Garmin, USGS and contributors'});
 state.baseMaps={
  streets:{label:'Localidades y ríos · Esri',layers:[tile('https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}','Tiles © Esri, HERE, Garmin, USGS and contributors')]},
  osm:{label:'Calles · OpenStreetMap',layers:[tile('https://tile.openstreetmap.org/{z}/{x}/{y}.png','© OpenStreetMap contributors')]},
  satellite:{label:'Satélite con localidades',layers:[tile('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}','Imagery © Esri, Maxar, Earthstar Geographics and contributors'),tile('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}','Labels © Esri and contributors')]},
  included:{label:'Mapa regional · sin conexión',layers:[included]}
 };
 const control=L.control({position:'topright'});control.onAdd=()=>{const box=L.DomUtil.create('div','basemap-picker');box.innerHTML='<label for="basemap-select">Mapa base</label><select id="basemap-select">'+Object.entries(state.baseMaps).map(([key,item])=>'<option value="'+key+'">'+item.label+'</option>').join('')+'</select><div class="basemap-status" role="status">Cargando cartografía…</div>';L.DomEvent.disableClickPropagation(box);L.DomEvent.disableScrollPropagation(box);state.mapStatus=box.querySelector('.basemap-status');state.baseMapSelect=box.querySelector('select');state.baseMapSelect.onchange=e=>setBasemap(e.target.value);return box;};control.addTo(state.map);
 for(const [key,item] of Object.entries(state.baseMaps))for(const layer of item.layers){layer.on('tileload',()=>{if(state.activeBasemap===key){state.baseMapLoaded=true;if(state.mapStatus)state.mapStatus.textContent=key==='included'?'Localidades incluidas · detalle regional':'Visible: '+item.label;}});layer.on('tileerror',()=>{if(state.activeBasemap===key&&state.mapStatus)state.mapStatus.textContent=state.baseMapLoaded?'Algunas imágenes no cargaron. Probá otra base.':'Sin acceso al mapa en línea. Elegí Mapa regional · sin conexión.';});}
 setBasemap('included');
 renderMarkers();addMapLegend();
 if(typeof ResizeObserver!=='undefined'){state.mapResizeObserver?.disconnect();state.mapResizeObserver=new ResizeObserver(()=>state.map?.invalidateSize(false));state.mapResizeObserver.observe(target)}
 setTimeout(()=>{state.map?.invalidateSize(false);applyInitialMapView(state.map)},150);return true;
 }catch(error){console.error('[Observatorio] Error de mapa',error);if(state.mapStatus)state.mapStatus.textContent='Error al dibujar estaciones: '+error.message;return false}
}
function setBasemap(key){
 const chosen=state.baseMaps?.[key];if(!chosen||!state.map)return;
 for(const base of Object.values(state.baseMaps))for(const layer of base.layers)if(state.map.hasLayer(layer))state.map.removeLayer(layer);
 state.activeBasemap=key;state.baseMapLoaded=false;
 if(state.baseMapSelect)state.baseMapSelect.value=key;
 if(state.mapStatus)state.mapStatus.textContent=key==='included'?'Localidades incluidas · detalle regional':'Cargando: '+chosen.label+'…';
 chosen.layers.forEach((layer,i)=>{layer.setZIndex?.(i+1);layer.addTo(state.map);});
 state.map.invalidateSize(false);
}
function addMapLegend(){const legend=L.control({position:'bottomleft'});legend.onAdd=function(){const div=L.DomUtil.create('div','map-legend');state.mapLegendEl=div;L.DomEvent.disableClickPropagation(div);updateMapLegend();return div};legend.addTo(state.map)}
function updateMapLegend(){if(!state.mapLegendEl)return;const contexto=state.mapMode==='daily'?'Frente al registro anterior':`Frente a ${state.mapTrendPeriod} días atrás`;state.mapLegendEl.innerHTML=`<div class="map-legend-head"><div class="map-legend-kicker">Cambio observado</div><div class="map-legend-title">${contexto}</div></div><div class="map-legend-section"><div class="map-legend-section-title">Dirección</div><div class="map-legend-directions"><div class="map-legend-direction"><span class="map-legend-arrow up">↑</span><span>Sube</span></div><div class="map-legend-direction"><span class="map-legend-arrow down">↓</span><span>Baja</span></div><div class="map-legend-direction"><span class="map-legend-arrow stable">→</span><span>Estable</span></div></div></div><div class="map-legend-section"><div class="map-legend-section-title">Actualidad del dato</div><div class="map-legend-quality"><div class="map-legend-quality-row" title="La lectura corresponde a la fecha consultada"><span class="legend-state-dot current"></span><span>Actualizada</span></div><div class="map-legend-quality-row" title="Dato anterior de hasta 10 días; conserva la última dirección conocida"><span class="legend-state-dot recent"></span><span>Anterior ≤10 días</span></div><div class="map-legend-quality-row" title="Han pasado más de 10 días sin una nueva lectura"><span class="legend-state-question">?</span><span>Más de 10 días</span></div><div class="map-legend-quality-row" title="No existe una lectura utilizable"><span class="legend-state-dot empty"></span><span>Sin dato</span></div></div></div><div class="map-legend-section legend-records-bottom"><div class="record-legend"><b>Récord histórico · año ${state.fechaVista.slice(0,4)}</b><div class="extreme-max">◆ Lila: nuevo máximo</div><div class="extreme-min">◇ Rosa: nuevo mínimo</div><small>El color conserva el evento aunque el nivel cambie. La flecha indica la tendencia.</small></div></div>`}
function staleDays(d,fecha=state.fechaVista){return d?.fecha?Math.max(0,days(d.fecha,fecha)):9999}
function markerClassFromSignal(d,fecha,signal){const e=estadoEstacion(d,fecha);if(e==='sin')return'mk-empty';if(e==='anterior'||e==='antiguo')return'mk-old';if(signal==null)return'mk-old';return signal>0?'mk-up':signal<0?'mk-down':'mk-stable'}
function markerClass(d,fecha){return markerClassFromSignal(d,fecha,d?.variacion)}
function mapSignalForStation(s,d){if(!d)return null;const e=estadoEstacion(d,state.fechaVista);if(e!=='ok'&&staleDays(d)>10)return null;if(state.mapMode==='daily')return (d.variacion==null?null:Number(d.variacion));const period=variacionPeriodoEstacion(s.id,Number(state.mapTrendPeriod)||7);return period?Number(period.delta):null}
function markerSymbol(d,signal){if(!d)return'·';if(estadoEstacion(d,state.fechaVista)!=='ok'&&staleDays(d)>10)return'?';return signal==null?'?':trendIcon(signal)}
function mapMovementMatches(signal){if(state.mapMovement==='all')return true;if(signal==null)return false;if(state.mapMovement==='up')return signal>0;if(state.mapMovement==='down')return signal<0;if(state.mapMovement==='stable')return signal===0;return true}
function setMapMode(mode){state.mapMode=mode==='trend'?'trend':'daily';state.mapMovement='all';renderAll()}
function setMapTrendPeriod(days){state.mapTrendPeriod=Number(days)===30?30:7;renderAll()}
function setMapMovement(movement){state.mapMovement=state.mapMovement===movement&&movement!=='all'?'all':movement;renderAll()}
function mapFilterCounts(){const out={all:0,up:0,down:0,stable:0,noBase:0};ESTACIONES_BASE.forEach(s=>{const d=stationData(s.id);if(estadoEstacion(d,state.fechaVista)!=='ok')return;const signal=mapSignalForStation(s,d);if(signal==null){out.noBase++;return}out.all++;if(signal>0)out.up++;else if(signal<0)out.down++;else out.stable++});return out}
function popupEstadoLabel(e){return labelEstado(e)}
function popupFechaTexto(d,e){if(e==='ok')return `Dato de la fecha consultada: <b>${fmtDate(d.fecha)}</b>`;if(e==='anterior')return `Último dato disponible: <b>${fmtDate(d.fecha)}</b>`;return `Dato: <b>${fmtDate(d.fecha)}</b>`}
function popupHtml(s,d){
 const a=stationAnalysis(s.id,state.fechaVista);
 if(!a.last)return `<div class="popup-card popup-clean"><div class="popup-body"><h3>${s.nombre}</h3><p>Sin lecturas disponibles hasta ${fmtDate(state.fechaVista)}.</p></div></div>`;
 const official=OFFICIAL_EXTREMES[s.id],events=annualExtremeSummary(s.id);
 const daily=a.daily==null?'Sin lectura del día anterior':`${trendIcon(a.daily)} ${formatDelta(a.daily,{absolute:true})} en 24 h`;
 const extreme=(label,r)=>r?`<div><span>${label}</span><strong>${m(r.nivel)}</strong><small>${fmtDate(r.fecha)}</small></div>`:'';
 return `<div class="popup-card popup-clean"><div class="popup-top"><div class="popup-river">${s.rio}</div><h3>${s.nombre}</h3></div><div class="popup-body"><div class="popup-reading"><span>Último nivel observado</span><strong>${m(a.last.nivel)}</strong><span>${fmtDate(a.last.fecha)}${a.last.fecha!==state.fechaVista?' · Dato anterior a la consulta':''}</span></div><div class="popup-daily ${a.daily==null?'':trendClass(a.daily)}">${daily}</div>${events.map(event=>`<div class="popup-record popup-record-${event.kind}"><span>${event.kind==='max'?'◆ NUEVO MÁXIMO HISTÓRICO':'◇ NUEVO MÍNIMO HISTÓRICO'}</span><strong>${m(event.nivel)} <small>· ${fmtDate(event.fecha)}</small></strong><p>Registrado en el año ${state.fechaVista.slice(0,4)} hasta la fecha consultada.${a.last.fecha>event.fecha?' La última lectura es '+m(a.last.nivel)+'.':''}</p></div>`).join('')}<div class="popup-extremes">${extreme('Mínimo histórico',official?.min)}${extreme('Máximo histórico',official?.max)}</div><div class="popup-source">Extremos publicados por DMH · ${fmtDate(DMH_EXTREMES_DATE)}</div><details class="popup-more"><summary>Evolución y comparación histórica</summary>${popupSparkline(s.id)}${changesHtml(a,true)}${events.map(event=>{const ref=a.ref[event.kind];return `<p>${event.kind==='max'?'Máximo':'Mínimo'} histórico anterior: <b>${m(ref.nivel)}</b> (${fmtDate(ref.fecha)}). Nuevo registro: <b>${event.excess} cm ${event.kind==='max'?'por encima':'por debajo'}</b>.</p>`}).join('')}${positionHtml(a)}<p>Los extremos de DMH pueden ser posteriores a la fecha consultada.</p><a href="https://www.meteorologia.gov.py/nivel-rio/indexconvencional.php" target="_blank" rel="noopener">Consultar fuente DMH ↗</a></details><button type="button" class="popup-action" data-action="open-station" data-station-id="${s.id}">Ver serie temporal completa ↗</button></div></div>`;
}

function popupSparkline(id){
 const a=stationAnalysis(id,state.fechaVista);if(!a.last)return '';
 const rows=a.rows.filter(d=>d.fecha>=addDays(a.last.fecha,-29));
 if(rows.length<2)return '<p class="popup-note">Sin lecturas suficientes para graficar 30 días.</p>';
 const lo=Math.min(...rows.map(d=>d.nivel)),hi=Math.max(...rows.map(d=>d.nivel)),span=hi-lo||1;
 const start=rows[0].fecha,end=rows.at(-1).fecha;
 const x=d=>12+days(start,d.fecha)/Math.max(1,days(start,end))*272,y=d=>70-(d.nivel-lo)/span*50;
 const path=rows.map((d,i)=>`${i&&days(rows[i-1].fecha,d.fecha)===1?'L':'M'}${x(d)},${y(d)}`).join(' ');
 return `<div class="popup-mini-trend"><div class="popup-mini-trend-head"><b>Últimos 30 días</b><span>${rows.length} lecturas</span></div><svg viewBox="0 0 296 92" role="img" aria-label="Evolución observada en 30 días"><path d="${path}" fill="none" stroke="#73c6c1" stroke-width="2"/>${rows.map(d=>`<circle cx="${x(d)}" cy="${y(d)}" r="${recordExcess(id,d)?3:1.5}" fill="${recordExcess(id,d)?'#d8b4fe':'#73c6c1'}"><title>${fmtDate(d.fecha)} · ${m(d.nivel)}</title></circle>`).join('')}<text x="12" y="12" fill="#bdcbd4" font-size="10">${m(lo)} — ${m(hi)}</text><text x="12" y="88" fill="#bdcbd4" font-size="9">${fmtDate(start)}</text><text x="284" y="88" text-anchor="end" fill="#bdcbd4" font-size="9">${fmtDate(end)}</text></svg></div>`;
}
function renderMarkers(){if(!state.map)return;Object.values(state.marcador).forEach(m=>m.remove());state.marcador={};ESTACIONES_BASE.forEach(s=>{const d=stationData(s.id);const e=estadoEstacion(d,state.fechaVista);if(!estadoCoincideFiltro(e))return;const signal=mapSignalForStation(s,d);if(!mapMovementMatches(signal))return;const html=`<div class="marker-dot ${markerClassFromSignal(d,state.fechaVista,signal)} ${extremeMarkerClass(s.id)}">${markerSymbol(d,signal)}</div>`;const icon=L.divIcon({html,className:'',iconSize:[24,24],iconAnchor:[12,12]});const m=L.marker([s.lat,s.lon],{icon}).addTo(state.map);m.bindPopup(popupHtml(s,d),{closeButton:true,offset:[0,-8],maxWidth:360,autoPanPadding:[12,12]});m.bindTooltip(s.nombre,{direction:'top'});state.marcador[s.id]=m});updateMapLegend()}
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
function textoInformeDiario(){const c=estadoConteoV2();const actualizadas=estacionesActualizadasOperativas();const subidas=actualizadas.filter(x=>x.d.variacion>0).sort((a,b)=>b.d.variacion-a.d.variacion);const bajadas=actualizadas.filter(x=>x.d.variacion<0).sort((a,b)=>a.d.variacion-b.d.variacion);const revisar=estacionesRevisionOperativa();let partes=[];partes.push(`Fecha consultada hidrológico del ${fmtDate(state.fechaVista)}.`);partes.push(`El Observatorio registra ${c.actualizadas} de ${c.total} estaciones actualizadas para la fecha seleccionada.`);if(c.fechaAnterior||0||c.pendientes||c.sinDato){partes.push(`Requieren revisión ${c.desactualizadas+c.sinDato} estaciones: ${c.desactualizadas} desactualizadas y ${c.sinDato} sin dato.`)}else{partes.push('No se registran estaciones pendientes de revisión para esta fecha consultada.')}if(subidas.length){partes.push(`Las principales subidas se observan en ${subidas.slice(0,3).map(x=>`${x.est.nombre} (${formatDelta(x.d.variacion,{absolute:true,icon:true})})`).join(', ')}.`)}if(bajadas.length){partes.push(`Las principales bajadas se observan en ${bajadas.slice(0,3).map(x=>`${x.est.nombre} (${formatDelta(x.d.variacion,{absolute:true,icon:true})})`).join(', ')}.`)}if(!subidas.length&&!bajadas.length){partes.push('No se observan variaciones relevantes en las estaciones actualizadas.')}return partes.join('\n\n')}
function renderSidebar(){
 const r=resumen();const pct=Math.round(r.ok/r.total*100);const existe=!!boletin(state.fechaVista);const c=contarEstadosPanel();const mc=mapFilterCounts();
 const contextLabel=state.mapMode==='daily'?'cambio diario':`cambio observado frente a ${state.mapTrendPeriod} días`;
 let html=`<div class="side-head"><div class="row"><div><b>Fecha consultada ${fmtDate(state.fechaVista)}</b><div class="small">${existe?`<strong>${c.actualizadas}/${c.total}</strong> actualizadas · ${pct}% de cobertura`:'Fecha pendiente de carga'}</div></div><span class="pill">Consulta pública</span></div><div class="date-controls"><div><label>Fecha consultada</label><input type="date" value="${state.fechaVista}" data-change="view-date"></div><div><label>Fechas disponibles</label><select data-change="view-date">${opcionesFecha()}</select></div></div>${!existe?'<div class="pending-note">No existe un boletín publicado para esta fecha.</div>':''}<div class="progress"><div class="bar" style="width:${pct}%"></div></div><div class="metrics compact-metrics"><div class="metric mini total filterable${claseFiltroPanel('todos')}" data-action="panel-filter" data-filter="todos"><b>${c.total}</b><span>Total</span></div><div class="metric mini ok filterable${claseFiltroPanel('actualizadas')}" data-action="panel-filter" data-filter="actualizadas"><b>${c.actualizadas}</b><span>Actualizadas</span></div><div class="metric mini previous filterable${claseFiltroPanel('fechaAnterior')}" data-action="panel-filter" data-filter="fechaAnterior"><b>${c.fechaAnterior}</b><span>Desactualizadas</span></div><div class="metric mini empty filterable${claseFiltroPanel('sinDato')}" data-action="panel-filter" data-filter="sinDato"><b>${c.sinDato}</b><span>Sin dato</span></div></div><div class="filter-note">Estado de datos: <b>${textoFiltroPanel()}</b>${state.filtroPanel!=='todos'?` · <button type="button" data-action="panel-filter" data-filter="todos">ver todas</button>`:''}</div>
 <div class="map-filter-box"><div class="map-filter-title">Visualización del mapa</div><div class="map-mode-row"><button type="button" class="map-filter-btn ${state.mapMode==='daily'?'active':''}" data-action="map-mode" data-mode="daily">Cambio diario</button><button type="button" class="map-filter-btn ${state.mapMode==='trend'?'active':''}" data-action="map-mode" data-mode="trend">Comparación temporal</button></div>${state.mapMode==='trend'?`<div class="map-period-row"><span>Periodo de comparación</span><select data-change="map-period"><option value="7" ${state.mapTrendPeriod===7?'selected':''}>Frente a 7 días atrás</option><option value="30" ${state.mapTrendPeriod===30?'selected':''}>Frente a 30 días atrás</option></select></div>`:''}<div class="map-movement-row"><button type="button" class="map-filter-btn ${state.mapMovement==='all'?'active':''}" data-action="map-movement" data-movement="all">Todas ${mc.all}</button><button type="button" class="map-filter-btn up ${state.mapMovement==='up'?'active':''}" data-action="map-movement" data-movement="up">↑ ${mc.up}</button><button type="button" class="map-filter-btn down ${state.mapMovement==='down'?'active':''}" data-action="map-movement" data-movement="down">↓ ${mc.down}</button><button type="button" class="map-filter-btn stable ${state.mapMovement==='stable'?'active':''}" data-action="map-movement" data-movement="stable">→ ${mc.stable}</button></div><div class="map-filter-summary">Mostrando estaciones por <b>${contextLabel}</b>.${state.mapMode==='trend'&&mc.noBase?` ${mc.noBase} sin base comparable.`:''}</div></div></div><div class="station-list compact">`;
 const groups={};ESTACIONES_BASE.forEach(s=>{const d=stationData(s.id);const e=estadoEstacion(d,state.fechaVista);if(!estadoCoincideFiltro(e))return;const signal=mapSignalForStation(s,d);if(!mapMovementMatches(signal))return;(groups[s.rio]??=[]).push(s)});
 const riosVisibles=Object.keys(groups);if(!riosVisibles.length){html+=`<div class="sin-dato">No hay estaciones para los filtros seleccionados.</div>`}for(const rio of riosVisibles){html+=`<div class="rio-title compact-title">${rio}</div>`;groups[rio].forEach(s=>{const d=stationData(s.id);const e=estadoEstacion(d,state.fechaVista);const signal=mapSignalForStation(s,d);const trend=signal==null?'empty':trendClass(signal);const varTxt=signal==null?'—':formatDelta(signal,{absolute:true,icon:true});const nivel=d?d.nivel.toFixed(2):'—';const meta=d?compactStatusText(e,d.fecha,state.fechaVista):'Sin dato';html+=`<div class="station-row ${extremeMarkerClass(s.id)==='mk-record'?'station-record':extremeMarkerClass(s.id)?'station-min-record':''}" data-action="open-station" data-station-id="${s.id}"><span class="station-dot ${dotClass(e)}"></span><div class="station-main"><div class="station-name">${s.nombre}</div><div class="station-meta ${e}">${meta}</div></div><div class="station-value">${nivel}${d?' m':''}</div><div class="station-change ${trend}" title="${contextLabel}">${varTxt}</div></div>`})}
 html+='</div>';qs('#sidebar-monitor').innerHTML=recordBoard()+html}
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

