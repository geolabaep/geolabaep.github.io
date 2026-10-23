(function () {
 const dialog=document.getElementById('views-dialog');
 const open=document.getElementById('open-views-details');
 if(!dialog||!open)return;
 const update=()=>{
   const ids={today:'views-today',week:'views-week',month:'views-month'};
   for(const [key,id] of Object.entries(ids))dialog.querySelector('[data-view-detail="'+key+'"]').textContent=document.getElementById(id)?.textContent||'—';
   document.getElementById('views-detail-status').textContent=document.getElementById('views-status')?.textContent||'Estadísticas pendientes de conexión';
 };
 open.addEventListener('click',()=>{update();dialog.showModal();});
 document.getElementById('close-views-details').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
 dialog.addEventListener('close',()=>open.focus());
 const status=document.getElementById('views-status');
 if(typeof MutationObserver!=='undefined')new MutationObserver(()=>{if(dialog.open)update();}).observe(status,{childList:true,characterData:true,subtree:true});
})();
