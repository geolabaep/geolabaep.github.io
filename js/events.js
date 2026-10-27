/* Visor público: únicamente navegación, consulta y filtros. */
const EVENT_ACTIONS = Object.freeze({
 'consult-month':node=>{node.closest('.consult-calendar').querySelector('.consult-calendar-body').innerHTML=consultedCalendarMonth(node.dataset.month);},
 'consult-date':node=>{if(node.dataset.date)cambiarFechaMapa(node.dataset.date);},
 'history-period-preset':node=>setHistoryPeriod(node.dataset.period),
  'open-station': node => openStation(node.dataset.stationId),
  'set-tab': node => setTab(node.dataset.tab),
  'panel-filter': node => cambiarFiltroPanel(node.dataset.filter),
  'map-mode': node => setMapMode(node.dataset.mode),
  'map-movement': node => setMapMovement(node.dataset.movement),
  'calendar-date': node => selectCalendarDate(node.dataset.date),
  'calendar-shift': (node,event) => { event.stopPropagation(); shiftDataCalendar(Number(node.dataset.delta)); },
  'calendar-toggle': (_node,event) => toggleDataCalendar(event),
  'stop-propagation': (_node,event) => event.stopPropagation(),
  'history-station': node => renderHistory(node.dataset.stationId),
  'history-custom-apply': () => { HISTORY_VIEW.period='custom'; renderHistory(qs('#histStation')?.value||'asuncion'); }
});
const EVENT_CHANGES = Object.freeze({
 'history-river':node=>{const s=ESTACIONES_BASE.find(s=>s.rio===node.value);if(s)renderHistory(s.id);},
  'view-date': node => cambiarFechaMapa(node.value),
  'map-period': node => setMapTrendPeriod(node.value),
  'history-station': node => renderHistory(node.value),
  'history-period': node => setHistoryPeriod(node.value),
  'history-custom': () => applyHistoryDates(),
  'history-context': node => setHistoryOption('showHistoricalContext',node.checked)
});
document.addEventListener('click',event=>{const tab=event.target.closest?.('[data-tab]');if(tab)return setTab(tab.dataset.tab);const node=event.target.closest?.('[data-action]');const handler=node&&EVENT_ACTIONS[node.dataset.action];if(handler)handler(node,event)});
document.addEventListener('change',event=>{const node=event.target.closest?.('[data-change]');const handler=node&&EVENT_CHANGES[node.dataset.change];if(handler)handler(node,event)});


// El desplegable de récords permite identificar cada estación en el mapa.
function previewExtremeFromRow(event){
 const row=event.target.closest?.('.annual-record-row');
 if(!row||row.contains(event.relatedTarget))return;
 previewExtremeOnMap(row.dataset.stationId);
}
document.addEventListener('mouseover',previewExtremeFromRow);
document.addEventListener('focusin',previewExtremeFromRow);
