'use strict';

const STATION_ALIASES = Object.freeze({
  'puerto ladario brasil':'puerto_ladario','puerto murtinho brasil':'puerto_murtinho','caceres brasil':'caceres',
  'isla margarita':'isla_margarita','fuerte olimpo':'fuerte_olimpo','bahia negra':'bahia_negra','vallemi':'vallemi',
  'concepcion':'concepcion','rosario':'rosario','puerto antequera':'puerto_antequera','villeta':'villeta','asuncion':'asuncion',
  'ita enramada':'ita_enramada','humaita':'humaita','alberdi':'alberdi','pilar':'pilar','puerto tigre':'puerto_tigre',
  'salto del guaira':'salto_guaira','ciudad del este':'cde','cerrito':'cerrito','ita piru':'ita_piru',
  'paso de patria':'paso_patria','ayolas':'ayolas','panchito lopez':'panchito_lopez','coratei':'coratei',
  'ita cora':'ita_cora','san cosme y san damian':'san_cosme','encarnacion':'encarnacion','pozo hondo':'pozo_hondo',
  'villa florida':'villa_florida','estacion arirai':'estacion_arirai'
});

function decodeEntities(value=''){
  return value.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
    .replace(/&nbsp;/gi,' ').replace(/&aacute;/gi,'á').replace(/&eacute;/gi,'é').replace(/&iacute;/gi,'í')
    .replace(/&oacute;/gi,'ó').replace(/&uacute;/gi,'ú').replace(/&ntilde;/gi,'ñ').replace(/&amp;/gi,'&')
    .replace(/&quot;/gi,'"').replace(/&#39;/g,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>');
}
function text(html=''){
  return decodeEntities(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
}
function normalize(value=''){
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
function isoDate(value){
  const match=String(value).match(/^(\d{2})-(\d{2})-(\d{4})$/);if(!match)return null;
  const iso=`${match[3]}-${match[2]}-${match[1]}`;
  return Number.isNaN(Date.parse(`${iso}T00:00:00Z`))?null:iso;
}
function numeric(value){const match=String(value).replace(',','.').match(/-?\d+(?:\.\d+)?/);return match?Number(match[0]):null;}
function historical(value){const level=numeric(value),match=String(value).match(/(\d{2}-\d{2}-\d{4})/);return level==null||!match?null:{nivel:level,fecha:isoDate(match[1])};}

function parseDmhHtml(html){
  if(typeof html!=='string'||html.length<1000)throw new Error('Respuesta DMH vacía o demasiado corta.');
  if(!/ESTACIONES\s+CONVENCIONALES/i.test(text(html)))throw new Error('La página no contiene el encabezado esperado de estaciones convencionales.');
  const observations=[],unknown=[];
  for(const body of html.matchAll(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi)){
    for(const row of body[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
      const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(cell=>text(cell[1]));
      if(cells.length<6)continue;
      const nombre=cells[0],id=STATION_ALIASES[normalize(nombre)];
      if(!id){unknown.push(nombre);continue;}
      const fecha=isoDate(cells[1]),nivel=numeric(cells[2]),cm=numeric(cells[3]);
      if(!fecha||nivel==null||cm==null)throw new Error(`Fila DMH inválida para ${nombre}.`);
      observations.push({id,nombre,fecha,nivel,variacion:Math.round(cm)/100,minimo:historical(cells[4]),maximo:historical(cells[5])});
    }
  }
  const rows=[...new Map(observations.map(item=>[item.id,item])).values()];
  if(rows.length<30)throw new Error(`Cobertura DMH insuficiente: ${rows.length} estaciones reconocidas (mínimo 30).`);
  if(rows.some(row=>row.nivel < -5 || row.nivel > 50 || Math.abs(row.variacion)>5))throw new Error('Se detectaron niveles o variaciones fuera de los límites de seguridad.');
  return {observations:rows,unknown:[...new Set(unknown)],latestDate:rows.map(row=>row.fecha).sort().at(-1)};
}

module.exports={STATION_ALIASES,normalize,isoDate,numeric,parseDmhHtml};
