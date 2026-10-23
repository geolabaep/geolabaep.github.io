/* Totales públicos exportados por Analytics; nunca cuenta visitas locales. */
(async function () {
  const status = document.getElementById('views-status');
  if (!status) return;
  try {
    const response = await fetch('data/visualizaciones.json', {cache:'no-store'});
    if (!response.ok) throw new Error('Unavailable');
    const data = await response.json();
    if (data.status !== 'ready') return;
    const entries = [['views-today','today'],['views-week','week'],['views-month','month']];
    if (!entries.every(([,key]) => Number.isSafeInteger(data[key]) && data[key] >= 0) || !Number.isFinite(Date.parse(data.updatedAt)) || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error('Invalid report');
    for (const [id,key] of entries) document.getElementById(id).textContent = data[key].toLocaleString('es-PY');
    const updated = new Date(data.updatedAt).toLocaleString('es-PY',{timeZone:'America/Asuncion',dateStyle:'short',timeStyle:'short'});
    status.textContent = 'Google Analytics · corte '+updated+'. Incluye visitas repetidas.';
    const today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Asuncion',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    if (data.date !== today) status.textContent = 'Último informe: '+data.date+' · '+status.textContent;
  } catch (_) {
    status.textContent = 'Estadísticas no disponibles por el momento';
  }
})();
