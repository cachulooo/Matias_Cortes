(()=>{
'use strict';
const g={
1:'Perros de pastor y boyeros',
2:'Pinscher, schnauzer, molosoides y boyeros suizos',
3:'Terriers',
4:'Teckels',
5:'Spitz y tipo primitivo',
6:'Sabuesos y perros de rastro',
7:'Perros de muestra',
8:'Cobradores, levantadores y perros de agua',
9:'Perros de compañía',
10:'Lebreles'
};
const $=id=>document.getElementById(id);
const safe=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const gl=n=>g[n]?`${n} · ${g[n]}`:'No registrado';
let breeds=[],foods=[],valid=[],seq=0;

function txt(sel,s){
 const e=document.querySelector(sel);
 if(e)e.textContent=s;
}
function fix(root){
 root.querySelectorAll('.pets-card-sub,.pets-ficha-meta').forEach(e=>{
  const t=e.textContent.replace(/Grupo FCI\s*(\d+)/g,(m,n)=>g[n]||m).replace(/\s*·\s*(?:Ficha estructurada|Solo documentación)/g,'');
  if(t!==e.textContent)e.textContent=t;
 });
 root.querySelectorAll('.pets-data-item').forEach(e=>{
  if(e.querySelector('dt')?.textContent==='Grupo FCI'){
   const d=e.querySelector('dd');
   if(d&&/^\d+$/.test(d.textContent))d.textContent=gl(d.textContent);
  }
 });
 root.querySelectorAll('.pets-compare-table tr').forEach(e=>{
  if(e.cells?.[0]?.textContent==='Grupo FCI')
   [...e.cells].slice(1).forEach(d=>{
    if(/^\d+$/.test(d.textContent))d.textContent=gl(d.textContent);
   });
 });
}
function watch(){
 ['pets-cards','pets-ficha','pets-comparison'].forEach(id=>{
  const e=$(id);
  if(e)new MutationObserver(()=>fix(e)).observe(e,{childList:true,subtree:true});
 });
 const s=$('pets-group');
 if(s){
  const update=()=>[...s.options].forEach(o=>{
   if(g[o.value]&&o.textContent!==gl(o.value))o.textContent=gl(o.value);
  });
  new MutationObserver(update).observe(s,{childList:true,subtree:true});
  update();
 }
}
const rng=(a,b,u)=>a!=null&&b!=null?`${a}–${b} ${u}`:'Sin datos';

function compareCard(b,letter,d){
 const x=d?.datos||{};
 const pairs=[
  ['Peso',rng(b.peso_min,b.peso_max,'kg')],
  ['Altura',rng(b.altura_min,b.altura_max,'cm')],
  ['Energía',x.nivel_energia!=null?x.nivel_energia+' / 5':'Sin datos'],
  ['Sociabilidad',x.nivel_social!=null?x.nivel_social+' / 5':'Sin datos']
 ];
 return `<article class="pets-vcard">
 <img src="${safe(b.portada)}" alt="${safe(b.nombre)}">
 <div><small>RAZA ${letter}</small>
 <h3>${safe(b.nombre)}</h3>
 <p>${safe(b.pais||'Origen no disponible')} · ${safe(g[b.grupo]||'Grupo no registrado')}</p>
 <section>${pairs.map(([k,v])=>`<span><small>${k}</small><strong>${safe(v)}</strong></span>`).join('')}</section>
 </div></article>`;
}
async function compare(){
 const a=breeds.find(b=>b.id===$('pets-compare-a')?.value);
 const b=breeds.find(b=>b.id===$('pets-compare-b')?.value);
 if(!a||!b)return;
 let box=$('pets-versus');
 if(!box){
  box=document.createElement('div');
  box.id='pets-versus';
  box.className='pets-versus';
  $('pets-comparison').before(box);
 }
 const n=++seq;
 const items=await Promise.all([a,b].map(async r=>{
  try{
   const f=await fetch('../data/pets/fichas/'+encodeURIComponent(r.id)+'.json');
   return f.ok?await f.json():null;
  }catch{return null;}
 }));
 if(n!==seq)return;
 box.innerHTML=compareCard(a,'A',items[0])+
 '<strong class="pets-vs">VS</strong>'+compareCard(b,'B',items[1]);
}

function grouped(fn){
 const m=new Map();
 valid.forEach(b=>{
  const k=fn(b);
  if(k!==null&&k!==undefined&&k!=='')
   m.set(String(k),(m.get(String(k))||0)+1);
 });
 return [...m].sort((a,b)=>b[1]-a[1]);
}
function bars(title,rows,kind){
 const max=Math.max(1,...rows.map(x=>x[1]));
 return `<article class="pets-chart"><h3>${safe(title)}</h3>`+
 rows.map(([k,n])=>`<button data-kind="${kind}" data-value="${safe(k)}">
 <span>${safe(kind==='group'?g[k]||k:k)}</span>
 <i><b style="width:${n/max*100}%"></b></i>
 <strong>${n}</strong></button>`).join('')+'</article>';
}
function charts(){
 const map=$('pets-map');
 if(!map)return;
 const box=document.createElement('div');
 box.className='pets-charts';
 box.innerHTML=
 bars('Razas registradas por grupo FCI',grouped(b=>b.grupo).sort((a,b)=>Number(a[0])-Number(b[0])),'group')+
 bars('Países de origen con más razas',grouped(b=>b.pais).slice(0,8),'country')+
 bars('Razas registradas según tamaño',grouped(b=>b.tamano),'size');
 map.before(box);
 box.addEventListener('click',e=>{
  const b=e.target.closest('[data-kind]');
  if(!b)return;
  const id={group:'pets-group',country:'pets-country',size:'pets-size'}[b.dataset.kind];
  const s=$(id);
  if(!s)return;
  ['pets-group','pets-country','pets-size'].forEach(k=>{
   if(k!==id&&$(k))$(k).value='';
  });
  s.value=b.dataset.value;
  s.dispatchEvent(new Event('change'));
  document.querySelector('[data-tab="catalogo"]')?.click();
  $('pets-panel-catalogo')?.scrollIntoView({behavior:'smooth'});
 });
}
async function start(){
 watch();
 try{
  const [r,f]=await Promise.all([
   fetch('../data/pets/razas-index.json'),
   fetch('../data/pets/alimentos.json')
  ]);
  if(!r.ok||!f.ok)throw Error('Archivos no disponibles');
  [breeds,foods]=await Promise.all([r.json(),f.json()]);
  valid=breeds.filter(b=>b.tipo==='estructurada');

  const kpis=$('pets-kpis')?.children;
  const metrics=[
   [breeds.length,'razas para descubrir'],
   [breeds.reduce((n,b)=>n+(Number(b.imagenes)||0),0),'imágenes del catálogo'],
   [valid.length,'razas para comparar'],
   [foods.length,'alimentos consultables']
  ];
  if(kpis?.length===4)metrics.forEach(([n,label],i)=>{
   kpis[i].querySelector('strong').textContent=n;
   kpis[i].querySelector('span').textContent=label;
  });

  txt('.pets-hero>p:not(.pets-eyebrow)','Explora razas de todo el mundo, conoce sus características y compara sus diferencias.');
  txt('#pets-heading-catalogo','Catálogo de 137 razas caninas');
  txt('#pets-heading-comparar','Comparación morfológica y conductual');
  txt('#pets-heading-origen','Distribución geográfica y grupos FCI');
  txt('#pets-panel-comparar>.pets-muted','Elige dos razas y descubre sus similitudes y diferencias.');
  txt('#pets-panel-origen>.pets-muted','Descubre los países de origen de las razas registradas. El mapa muestra orígenes, no la cantidad de perros que vive en cada país.');
  txt('.pets-caution','Guía orientativa de alimentos para perros. Si tu mascota ingirió algo potencialmente tóxico, contacta de inmediato a un veterinario.');
  txt('.pets-disclaimer','Información orientativa. Es necesario revisar las atribuciones y los permisos de uso de fotografías y textos documentales antes de su publicación.');
  txt('.pets-tabs [data-tab="origen"]','Estadísticas de razas');

  fix(document);
  charts();
  ['pets-compare-a','pets-compare-b'].forEach(id=>{
   const s=$(id);
   if(!s)return;
   s.addEventListener('change',compare);
   new MutationObserver(compare).observe(s,{childList:true});
  });
  compare();
 }catch(e){console.error('Mejoras Pets:',e);}
}
if(document.readyState==='loading')
 document.addEventListener('DOMContentLoaded',start);
else start();
})();