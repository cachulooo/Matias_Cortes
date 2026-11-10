(()=>{
'use strict';

const $ = id => document.getElementById(id);

const normalize = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .toLowerCase()
  .replace(/\s+/g,' ')
  .trim();

const labelMap = new Map([
  ['promedio vida saludable anios', 'Promedio de vida saludable (años)'],
  ['esperanza de vida (anios)', 'Esperanza de vida (años)'],
  ['frecuencia chequeos veterinarios', 'Frecuencia de chequeos veterinarios'],
  ['frecuencia vacunas', 'Frecuencia de vacunación'],
  ['nivel tolerancia frio', 'Tolerancia al frío'],
  ['nivel tolerancia calor', 'Tolerancia al calor'],
  ['nivel adaptacion urbana', 'Adaptación urbana'],
  ['nivel experiencia tutor requerido', 'Experiencia del tutor recomendada'],
  ['recomendaciones manejo', 'Recomendaciones de manejo'],
  ['uso en trabajos', 'Funciones habituales'],
  ['uso policial militar', 'Uso policial o militar'],
  ['nivel instinto caza', 'Instinto de caza'],
  ['nivel instinto guardia', 'Instinto de guardia'],
  ['nivel instinto rescate', 'Instinto de rescate'],
  ['capacidad de pastoreo', 'Capacidad de pastoreo'],
  ['nivel popularidad global', 'Popularidad global'],
  ['riesgo displasia cadera', 'Riesgo de displasia de cadera'],
  ['riesgo displasia codo', 'Riesgo de displasia de codo'],
  ['riesgo problemas oculares', 'Riesgo de problemas oculares'],
  ['riesgo cardio', 'Riesgo cardiovascular'],
  ['riesgo neurologico', 'Riesgo neurológico'],
  ['riesgo dermatologico', 'Riesgo dermatológico'],
  ['riesgo endocrino', 'Riesgo endocrino'],
  ['riesgo obesidad', 'Riesgo de obesidad'],
  ['nivel vigilancia salud', 'Vigilancia de la salud'],
  ['cuidados especiales salud', 'Cuidados especiales de salud'],
  ['riesgos craneo', 'Riesgos craneales'],
  ['forma craneo', 'Forma del cráneo'],
  ['forma craneo estandar', 'Tipo de cráneo'],
  ['proporcion cuerpo', 'Proporción corporal'],
  ['color ojos', 'Color de ojos'],
  ['tipo pelaje', 'Tipo de pelaje'],
  ['tipo manto', 'Tipo de manto'],
  ['densidad pelaje', 'Densidad del pelaje'],
  ['proteccion climatica', 'Protección climática'],
  ['coloraciones permitidas', 'Coloraciones permitidas']
]);

const scoreKeywords = [
  'nivel ', 'riesgo ', 'instinto ', 'tolerancia ', 'sensibilidad',
  'capacidad ', 'popularidad', 'vigilancia', 'adiestramiento',
  'energia', 'sociabilidad', 'social', 'afecto', 'apego',
  'confianza', 'ansiedad', 'guardia', 'rescate', 'pastoreo',
  'obesidad', 'displasia', 'cardiovascular', 'neurologico',
  'dermatologico', 'endocrino', 'independencia'
];

function safeText(value){
  return String(value || '')
    .replace(/\banios\b/gi, 'años')
    .replace(/\bfrio\b/gi, 'frío')
    .replace(/\bcalor\b/gi, 'calor')
    .replace(/\s+/g,' ')
    .trim();
}

function getPrettyLabel(text){
  const key = normalize(text);
  return labelMap.get(key) || text;
}

function scoreFromValue(value){
  const match = String(value || '').trim().match(/^([1-5])(?:\s*\/\s*5)?$/);
  return match ? Number(match[1]) : null;
}

function isScoreField(label, value){
  const score = scoreFromValue(value);
  if(score === null) return false;
  const key = normalize(label);
  return scoreKeywords.some(k => key.includes(k));
}

function bubbleMeter(score){
  let bubbles = '';
  for(let i=1;i<=5;i++){
    bubbles += `<span class="pets-bubble ${i<=score?'is-on':''}" aria-hidden="true"></span>`;
  }
  return `
    <div class="pets-bubble-meter" aria-label="${score} de 5">
      ${bubbles}
      <strong>${score}/5</strong>
    </div>
  `;
}

function splitList(value){
  return String(value || '')
    .split(/[,;]\s*/)
    .map(x => safeText(x))
    .filter(Boolean);
}

function applyVisualReading(){
  const root = $('pets-ficha');
  if(!root) return;

  const items = [...root.querySelectorAll('.pets-data-item')];
  items.forEach(item => {
    const dt = item.querySelector('dt');
    const dd = item.querySelector('dd');
    if(!dt || !dd) return;

    dt.textContent = getPrettyLabel(dt.textContent);
    const label = dt.textContent;
    const rawValue = safeText(dd.textContent);

    dd.classList.remove('is-bubbles','is-chips','is-note');

    if(isScoreField(label, rawValue)){
      const score = scoreFromValue(rawValue);
      dd.innerHTML = bubbleMeter(score);
      dd.classList.add('is-bubbles');
      return;
    }

    const parts = splitList(rawValue);
    if(parts.length >= 2 && parts.length <= 6 && rawValue.length <= 140){
      dd.innerHTML = `<div class="pets-chip-list">${
        parts.map(p => `<span>${p}</span>`).join('')
      }</div>`;
      dd.classList.add('is-chips');
      return;
    }

    if(rawValue.length >= 90){
      dd.innerHTML = `<div class="pets-note-box">${rawValue}</div>`;
      dd.classList.add('is-note');
      return;
    }

    dd.textContent = rawValue;
  });

  // cerrar por defecto la sección menos prioritaria
  [...root.querySelectorAll('details.pets-data-section')].forEach(section => {
    const summary = section.querySelector('summary');
    if(!summary) return;
    const key = normalize(summary.textContent);
    if(key.includes('otras variables originales')){
      section.open = false;
    }
  });
}

function classifyFood(text){
  const key = normalize(text);
  if(key.includes('prohib')) return 'Prohibidos';
  if(key.includes('evitar')) return 'Evitar';
  if(key.includes('moder')) return 'Moderación';
  if(key.includes('permit')) return 'Permitidos';
  return 'Otros';
}

function groupFoods(){
  const root = $('pets-foods');
  if(!root) return;

  const cards = [...root.querySelectorAll('.pets-food')];
  if(!cards.length) return;

  const byGroup = new Map([
    ['Prohibidos', []],
    ['Evitar', []],
    ['Moderación', []],
    ['Permitidos', []],
    ['Otros', []]
  ]);

  cards.forEach(card => {
    const tag = card.querySelector('.pets-food-tag');
    const group = classifyFood(tag ? tag.textContent : '');
    byGroup.get(group).push(card);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'pets-food-groups';

  [...byGroup.entries()].forEach(([title, list]) => {
    if(!list.length) return;

    const section = document.createElement('section');
    section.className = 'pets-food-group';

    const head = document.createElement('div');
    head.className = 'pets-food-group-head';
    head.innerHTML = `
      <h3>${title}</h3>
      <span>${list.length}</span>
    `;

    const grid = document.createElement('div');
    grid.className = 'pets-food-group-grid';

    list.forEach(card => grid.appendChild(card));

    section.append(head, grid);
    wrapper.appendChild(section);
  });

  root.replaceChildren(wrapper);
}

function correctStaticText(){
  const h = $('pets-heading-alimentos');
  if(h) h.textContent = 'Alimentos y riesgos para perros';
}

function boot(){
  correctStaticText();

  const ficha = $('pets-ficha');
  if(ficha){
    const observerFicha = new MutationObserver(() => {
      observerFicha.disconnect();
      applyVisualReading();
      observerFicha.observe(ficha, { childList:true, subtree:true });
    });
    observerFicha.observe(ficha, { childList:true, subtree:true });
    applyVisualReading();
  }

  const foods = $('pets-foods');
  if(foods){
    const observerFoods = new MutationObserver(() => {
      observerFoods.disconnect();
      groupFoods();
      observerFoods.observe(foods, { childList:true, subtree:true });
    });
    observerFoods.observe(foods, { childList:true, subtree:true });
    groupFoods();
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
}else{
  boot();
}
})();