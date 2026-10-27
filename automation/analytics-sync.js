'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const b64=value=>Buffer.from(typeof value==='string'?value:JSON.stringify(value)).toString('base64url');
async function main(){
  const property=process.env.GA4_PROPERTY_ID;
  const credentials=process.env.GA4_SERVICE_ACCOUNT_JSON;
  if(!property||!credentials){throw new Error('Configurar GA4_PROPERTY_ID y GA4_SERVICE_ACCOUNT_JSON para publicar estadísticas.');}
  if(!/^\d+$/.test(property))throw new Error('GA4_PROPERTY_ID debe ser el ID numérico de la propiedad.');
  const account=JSON.parse(credentials),now=Math.floor(Date.now()/1000);
  const message=b64({alg:'RS256',typ:'JWT'})+'.'+b64({iss:account.client_email,scope:'https://www.googleapis.com/auth/analytics.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
  const signature=crypto.sign('RSA-SHA256',Buffer.from(message),account.private_key).toString('base64url');
  const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:message+'.'+signature}),signal:AbortSignal.timeout(30000)});
  if(!tokenResponse.ok)throw new Error('No se pudo autenticar la cuenta de lectura de Analytics.');
  const token=(await tokenResponse.json()).access_token;
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Asuncion',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  const date=`${parts.year}-${parts.month}-${parts.day}`;
  const start=days=>new Date(Date.parse(date+'T12:00:00Z')-days*86400000).toISOString().slice(0,10);
  const totals={};
  for(const [name,days] of [['today',0],['week',6],['month',29]]){
    const response=await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({dateRanges:[{startDate:start(days),endDate:date}],metrics:[{name:'screenPageViews'}],dimensionFilter:{filter:{fieldName:'hostName',stringFilter:{matchType:'EXACT',value:'geolabaep.github.io'}}}}),signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error('No se pudo leer el informe de Analytics. Revisar acceso de lector y API habilitada.');
    const report=await response.json();
    if(report.metadata?.subjectToThresholding)throw new Error('Informe sujeto a umbrales; se conserva el último informe completo.');
    const value=report.rows?.[0]?.metricValues?.[0]?.value;
    const total=value===undefined&&Number(report.rowCount||0)===0?0:Number(value);
    if(!Number.isSafeInteger(total)||total<0)throw new Error('Total de visualizaciones inválido.');
    totals[name]=total;
  }
  const file=path.join(__dirname,'../data/visualizaciones.json');
  fs.writeFileSync(file+'.tmp',JSON.stringify({status:'ready',source:'Google Analytics 4',metric:'screenPageViews',date,updatedAt:new Date().toISOString(),...totals},null,2)+'\n');
  fs.renameSync(file+'.tmp',file);
  console.log('Informe público de visualizaciones actualizado.');
}
main().catch(()=>{console.error('No se actualizaron las estadísticas. Se conserva el último informe; revisar configuración y acceso a Analytics.');process.exitCode=1;});
