(()=>{
'use strict';

const $ = id => document.getElementById(id);
const norm = s => String(s || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .toLowerCase()
  .replace(/\s+/g,' ')
  .trim();

function createEl(tag, cls, html){
  const el = document.createElement(tag);
  if(cls) el.className = cls;
  if(html !== undefined) el.innerHTML = html;
  return el;
}

function textValue(root, possibleLabels){
  const items = [...root.querySelectorAll('.pets-data-item')];
  for(const item of items){
    const dt = item.querySelector('dt');
    const dd = item.querySelector('dd');
    if(!dt || !dd) continue;
    const k = norm(dt.textContent);
    if(possibleLabels.some(label => k.includes(norm(label)))){
      return dd.textContent.trim();
    }
  }
  return '';
}

function scoreValue(root, possibleLabels){
  const raw = textValue(root, possibleLabels);
  const m = String(raw).match(/([1-5])/);
  return m ? Number(m[1]) : null;
}

function metricCard(label, value){
  return `
    <article class="pets-mini-card">
      <span>${label}</span>
      <strong>${value || 'Sin dato'}</strong>
    </article>
  `;
}

function barItem(label, score){
  const pct = Math.max(0, Math.min(100, score * 20));
  return `
    <div class="pets-score-item">
      <div class="pets-score-head">
        <span>${label}</span>
        <strong>${score}/5</strong>
      </div>
      <div class="pets-score-track">
        <div class="pets-score-fill" style="width:${pct}%"></div>
      </div>
    </div>
  `;
}

function enhanceFicha(){
  const root = $('pets-ficha');
  if(!root) return;
  const title = root.querySelector('h2');
  if(!title) return;

  root.querySelector('.pets-summary-visual')?.remove();

  const origen = textValue(root, ['País de origen']) || textValue(root, ['pais de origen']);
  const grupo = textValue(root, ['Grupo FCI']) || textValue(root, ['grupo fci']);
  const tamano = textValue(root, ['Tamaño']) || textValue(root, ['tamano']);
  const pesoMin = textValue(root, ['Peso mínimo (kg)']) || textValue(root, ['peso minimo']);
  const pesoMax = textValue(root, ['Peso máximo (kg)']) || textValue(root, ['peso maximo']);
  const altMin  = textValue(root, ['Altura mínima (cm)']) || textValue(root, ['altura minima']);
  const altMax  = textValue(root, ['Altura máxima (cm)']) || textValue(root, ['altura maxima']);
  const vida = textValue(root, ['Esperanza de vida (años)']) || textValue(root, ['longevidad promedio anios']);

  const peso = (pesoMin || pesoMax) ? `${pesoMin || '?'}–${pesoMax || '?'} kg` : '';
  const altura = (altMin || altMax) ? `${altMin || '?'}–${altMax || '?'} cm` : '';

  const energia = scoreValue(root, ['nivel energia']);
  const social  = scoreValue(root, ['nivel social']);
  const adies   = scoreValue(root, ['capacidad adiestramiento']);
  const indep   = scoreValue(root, ['nivel independencia']);
  const ninos   = scoreValue(root, ['nivel tolerancia ninos']);
  const animales= scoreValue(root, ['nivel tolerancia animales']);

  const summary = createEl('section','pets-summary-visual');
  summary.innerHTML = `
    <div class="pets-summary-head">
      <p class="pets-eyebrow">RESUMEN DE LA RAZA</p>
      <h3>Lectura rápida del perfil</h3>
    </div>

    <div class="pets-summary-grid">
      ${metricCard('Origen', origen)}
      ${metricCard('Grupo FCI', grupo)}
      ${metricCard('Tamaño', tamano)}
      ${metricCard('Peso', peso)}
      ${metricCard('Altura', altura)}
      ${metricCard('Esperanza de vida', vida ? `${vida} años` : '')}
    </div>

    <div class="pets-score-panel">
      <div class="pets-score-title">
        <h4>Perfil conductual</h4>
        <p>Resumen visual de algunas variables comparables registradas en la ficha.</p>
      </div>
      <div class="pets-score-list">
        ${energia  ? barItem('Energía', energia) : ''}
        ${social   ? barItem('Sociabilidad', social) : ''}
        ${adies    ? barItem('Adiestramiento', adies) : ''}
        ${indep    ? barItem('Independencia', indep) : ''}
        ${ninos    ? barItem('Tolerancia con niños', ninos) : ''}
        ${animales ? barItem('Tolerancia con animales', animales) : ''}
      </div>
    </div>
  `;

  const gallery = root.querySelector('.pets-gallery');
  const meta = root.querySelector('.pets-ficha-meta');

  if(gallery){
    gallery.insertAdjacentElement('afterend', summary);
  } else if(meta){
    meta.insertAdjacentElement('afterend', summary);
  } else {
    root.prepend(summary);
  }

  // Colapsar la sección "Otras variables originales" para que no robe protagonismo
  [...root.querySelectorAll('details.pets-data-section')].forEach(d => {
    const s = d.querySelector('summary');
    if(!s) return;
    const t = norm(s.textContent);
    if(t.includes('otras variables originales')){
      d.open = false;
    }
  });
}

function classifyFood(label){
  const t = norm(label);
  if(t.includes('prohib')) return 'prohibido';
  if(t.includes('evitar')) return 'evitar';
  if(t.includes('moder')) return 'moderar';
  if(t.includes('permit')) return 'permitido';
  return 'informativo';
}

function humanFoodTitle(){
  const h2 = $('pets-heading-alimentos');
  if(h2) h2.textContent = 'Alimentos y riesgos para perros';
}

function enhanceFoods(){
  const root = $('pets-foods');
  if(!root) return;

  document.querySelector('.pets-food-overview')?.remove();

  const cards = [...root.querySelectorAll('.pets-food')];
  const counts = {
    permitido: 0,
    moderar: 0,
    evitar: 0,
    prohibido: 0,
    informativo: 0
  };

  cards.forEach(card => {
    const tag = card.querySelector('.pets-food-tag');
    const level = classifyFood(tag ? tag.textContent : '');
    card.dataset.level = level;
    counts[level] = (counts[level] || 0) + 1;
  });

  const overview = createEl('section','pets-food-overview');
  overview.innerHTML = `
    <article class="pets-food-kpi permitido">
      <span>Permitidos</span>
      <strong>${counts.permitido}</strong>
    </article>
    <article class="pets-food-kpi moderar">
      <span>Moderación</span>
      <strong>${counts.moderar}</strong>
    </article>
    <article class="pets-food-kpi evitar">
      <span>Evitar</span>
      <strong>${counts.evitar}</strong>
    </article>
    <article class="pets-food-kpi prohibido">
      <span>Prohibidos</span>
      <strong>${counts.prohibido}</strong>
    </article>
  `;

  root.before(overview);
  humanFoodTitle();
}

function boot(){
  const ficha = $('pets-ficha');
  if(ficha){
    const observador = new MutationObserver(() => {
      observador.disconnect();
      enhanceFicha();
      observador.observe(ficha, {childList:true,subtree:true});
    });
    observador.observe(ficha, {childList:true,subtree:true});
    enhanceFicha();
  }

  const foods = $('pets-foods');
  if(foods){
    new MutationObserver(() => enhanceFoods()).observe(foods,{childList:true,subtree:true});
    enhanceFoods();
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
}else{
  boot();
}
})();