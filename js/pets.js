/* Pets: catálogo canino estático. No requiere R, Shiny ni base de datos. */
(() => {
  'use strict';
  const base = '../data/pets/';
  const state = { breeds: [], foods: [], visible: 24, selected: null };
  const $ = id => document.getElementById(id);
  const el = (tag, cls, content) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (content !== undefined && content !== null) node.textContent = String(content);
    return node;
  };
  const parseURL = id => base + 'fichas/' + encodeURIComponent(id) + '.json';
  const naturalName = v => String(v || '').replace(/_/g,' ').replace(/\b\w/g, x => x.toUpperCase());
  const format = value => {
    if (value === null || value === undefined || value === '') return 'Sin información';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (Array.isArray(value)) return value.map(format).join(', ');
    if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toLocaleString('es-CL');
    return String(value).replace(/_/g,' ');
  };
  const load = async url => {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return res.json();
  };
  const clean = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-CL');
  function setOptions(select, values, label) {
    const current = select.value;
    select.replaceChildren(el('option','',label));
    select.firstElementChild.value='';
    [...new Set(values.filter(v => v !== null && v !== undefined && String(v).trim()))]
      .sort((a,b) => String(a).localeCompare(String(b),'es', {numeric:true}))
      .forEach(value => { const op=el('option','',String(value)); op.value=String(value); select.append(op); });
    if ([...select.options].some(o=>o.value===current)) select.value=current;
  }
  function setTab(tab) {
    document.querySelectorAll('.pets-tab').forEach(btn => {
      const on=btn.dataset.tab===tab;
      btn.classList.toggle('active',on);
      if (on) btn.setAttribute('aria-current','page'); else btn.removeAttribute('aria-current');
    });
    document.querySelectorAll('.pets-panel').forEach(panel => {panel.hidden=panel.id!=='pets-panel-'+tab;});
    if (tab === 'origen') renderMap().catch(reportError);
    if (tab === 'alimentos') renderFoods();
    if (tab === 'comparar') renderCompare();
  }
  function card(breed) {
    const btn=el('button','pets-card'); btn.type='button'; btn.title=`Abrir ficha de ${breed.nombre}`;
    if (breed.portada) {
      const photo=el('img','pets-card-photo'); photo.src=breed.portada; photo.alt=breed.nombre; photo.loading='lazy';
      photo.decoding='async';btn.append(photo);
    } else btn.append(el('div','pets-photo-empty','Sin fotografía'));
    const info=el('div','pets-card-content');
    info.append(el('h3','',breed.nombre));
    info.append(el('div','pets-card-sub',[breed.pais,breed.grupo?'Grupo FCI '+breed.grupo:null,breed.tamano].filter(Boolean).join(' · ') || 'Estándar de raza'));
    const badge=el('span',`pets-chip ${breed.tipo==='estructurada'?'structured':''}`,breed.tipo==='estructurada'?'Ficha estructurada':'Solo estándar documental');
    info.append(badge);btn.append(info);
    btn.addEventListener('click',()=>openBreed(breed.id));
    return btn;
  }
  function filtered() {
    const q=clean($('pets-search').value),group=$('pets-group').value,size=$('pets-size').value,country=$('pets-country').value,type=$('pets-type').value;
    return state.breeds.filter(b=>
      (!q || clean(b.nombre).includes(q) || clean(b.pais).includes(q)) &&
      (!group || String(b.grupo)===group) && (!size || b.tamano===size) &&
      (!country || b.pais===country) && (!type || b.tipo===type));
  }
  function renderCards() {
    const filteredBreeds=filtered();
    $('pets-result-count').textContent=`${filteredBreeds.length} ${filteredBreeds.length===1?'raza encontrada':'razas encontradas'}`;
    const container=$('pets-cards');container.replaceChildren();
    if (!filteredBreeds.length) container.append(el('p','pets-no-data','No se encontraron razas para estos filtros.'));
    filteredBreeds.slice(0,state.visible).forEach(b=>container.append(card(b)));
    $('pets-more').hidden=filteredBreeds.length<=state.visible;
  }
  const groupKeys = {
    'Identificación':['id_raza','nombre_raza','nombre_cientifico','sinonimos_razas','grupo_fci','pais_origen','especie','nombre_limpio'],
    'Morfología':['tamaño_general','altura_min_cm','altura_max_cm','peso_min_kg','peso_max_kg','longevidad_promedio_anios','forma_craneo','forma_craneo_estandar','proporcion_cuerpo','color_ojos','orejas','cola','morfologia_general','tipo_pelaje','tipo_manto','densidad_pelaje','proteccion_climatica','coloraciones_permitidas','caida_de_pelo','riesgos_craneo'],
    'Temperamento y comportamiento':['temperamento_general','caracteristicas_comportamentales','nivel_inteligencia','capacidad_adiestramiento','nivel_estimulo_mental','nivel_independencia','nivel_energia','nivel_necesidad_ejercicio','nivel_instinto_trabajo','nivel_guardia','nivel_afecto','nivel_apego_duenio','nivel_confianza','nivel_ansiedad','nivel_tolerancia_soledad','nivel_social','nivel_tolerancia_animales','nivel_tolerancia_ninos','actitud_ante_extranos','compatibilidad_tutor','tendencia_ladrar','riesgo_agresividad','propension_estereotipias','riesgo_ansiedad_separacion','observaciones_etologicas'],
    'Salud y controles':['enfermedades_hereditarias','riesgo_displasia_cadera','riesgo_displasia_codo','riesgo_problemas_oculares','riesgo_cardio','riesgo_neurologico','riesgo_dermatologico','riesgo_endocrino','riesgo_obesidad','nivel_sensibilidad_medicamentos','nivel_vigilancia_salud','frecuencia_vacunas','recomendaciones_geneticas','promedio_vida_saludable_anios','frecuencia_chequeos_veterinarios','cuidados_especiales_salud'],
    'Reproducción':['sexo_referencial','madurez_sexual_promedio_meses','edad_madura','edad_retiro_reproductivo','promedio_camadas_anual','promedio_crias_por_camadas','nivel_riesgo_parto','periodo_gestacion_dias','intervalo_entre_celos_meses'],
    'Higiene, ambiente y alimentación':['frecuencia_acicalado','tipo_cepillo_recomendado','cuidados_especiales','nivel_mantenimiento_general','frecuencia_bano_recomendada','frecuencia_cepillado_recomendada','necesita_peluqueria_profesional','recomendaciones_higiene','alimentacion_recomendada','recomendaciones_alimentacion','nivel_requerimiento_nutricional','riesgo_sobrepeso','actividad_fisica_diaria_min','actividad_fisica_diaria_max','recomendaciones_ejercicio_diario','nivel_estimulo_mental_requerido','advertencias_sobreesfuerzo','entorno_ideal','clima_recomendado','adaptacion_departamento','necesidad_espacio_exterior','nivel_tolerancia_ruido','nivel_sociabilidad_urbana','recomendado_para_novatos','recomendaciones_adaptacion','nivel_necesidad_compania','estres_por_soledad','cuidados_emocionales_recomendados','recomendaciones_generales_bienestar'],
    'Historia y aptitudes':['uso_original','uso_actual','uso_en_trabajos','uso_policial_militar','nivel_instinto_caza','capacidad_de_pastoreo','nivel_instinto_guardia','nivel_instinto_rescate','habilidades_especiales','nivel_popularidad_global']
  };
  const labels={
    'id_raza':'Identificador','nombre_raza':'Nombre de raza','nombre_limpio':'Identificador normalizado','nombre_cientifico':'Nombre científico',
    'grupo_fci':'Grupo FCI','pais_origen':'País de origen','tamaño_general':'Tamaño','peso_min_kg':'Peso mínimo (kg)','peso_max_kg':'Peso máximo (kg)',
    'altura_min_cm':'Altura mínima (cm)','altura_max_cm':'Altura máxima (cm)','longevidad_promedio_anios':'Esperanza de vida (años)',
    'periodo_gestacion_dias':'Período de gestación de referencia (días)','riesgo_cardio':'Indicador de riesgo cardiovascular (no validado)',
    'riesgo_neurologico':'Indicador de riesgo neurológico (no validado)','nivel_riesgo_parto':'Indicador de riesgo de parto (no validado)'
  };
  function detailSection(name,items, data, open=false) {
    const available=items.filter(k=>data[k]!==undefined && data[k]!==null && data[k]!=='');
    if (!available.length)return null;
    const d=el('details','pets-data-section');d.open=open;
    d.append(el('summary','',`${name} (${available.length})`));
    const dl=el('dl','pets-data-grid');
    available.forEach(key=>{
      const item=el('div','pets-data-item');
      item.append(el('dt','',labels[key]||naturalName(key)),el('dd','',format(data[key])));dl.append(item);
    });d.append(dl);return d;
  }
  async function openBreed(id) {
    const dialog=$('pets-dialog'),place=$('pets-ficha');
    place.replaceChildren(el('p','pets-muted','Cargando ficha…'));
    dialog.showModal();
    try {
      const fiche=await load(parseURL(id));
      if (!dialog.open || fiche.id!==id) return;
      place.replaceChildren(el('h2','pets-ficha-title',fiche.nombre));
      place.append(el('p','pets-ficha-meta', [fiche.origen.nombre,fiche.datos.grupo_fci?'Grupo FCI '+fiche.datos.grupo_fci:null,fiche.tipo==='documental'?'Solo documentación':'Ficha estructurada'].filter(Boolean).join(' · ')));
      if (fiche.imagenes && fiche.imagenes.length) {
        const gallery=el('div','pets-gallery');
        fiche.imagenes.forEach(src=> {const i=el('img','');i.src=src;i.alt=fiche.nombre;i.loading='lazy';gallery.append(i);});
        place.append(gallery);
      }
      place.append(el('p','pets-ficha-note',fiche.tipo==='documental'
        ? 'Esta raza tiene texto documental, pero no una ficha completa de 123 variables. No se completaron los valores faltantes con suposiciones.'
        : 'Las características y puntuaciones se presentan como registros del conjunto de datos original. No son estimaciones clínicas validadas.'));
      const used=new Set();
      Object.entries(groupKeys).forEach(([group,keys],i)=>{
        keys.forEach(k=>used.add(k));
        const section=detailSection(group,keys,fiche.datos,i===0);
        if (section)place.append(section);
      });
      const others=Object.keys(fiche.datos).filter(k=>!used.has(k));
      const extra=detailSection('Otras variables originales',others,fiche.datos);
      if(extra)place.append(extra);
      if(fiche.estandar?.texto) {
        const details=el('details','pets-data-section');
        details.append(el('summary','','Estándar de raza (texto documental completo)'));
        details.append(el('p','pets-muted','Texto de la documentación de origen, conservado en su idioma original. Requiere verificar atribución y vigencia de la fuente.'));
        details.append(el('pre','pets-standard',fiche.estandar.texto));
        place.append(details);
      }
    } catch(err) {place.replaceChildren(el('p','pets-status','No fue posible cargar la ficha: '+err.message));}
  }
  const compKeys=['pais_origen','grupo_fci','tamaño_general','altura_min_cm','altura_max_cm','peso_min_kg','peso_max_kg','longevidad_promedio_anios','forma_craneo','tipo_pelaje','nivel_energia','nivel_inteligencia','capacidad_adiestramiento','nivel_independencia','nivel_social','nivel_tolerancia_ninos','nivel_tolerancia_animales','actividad_fisica_diaria_min','actividad_fisica_diaria_max','frecuencia_cepillado_recomendada','entorno_ideal'];
  async function renderCompare() {
    const left=$('pets-compare-a').value,right=$('pets-compare-b').value,box=$('pets-comparison');
    if (!left || !right) return;
    box.replaceChildren(el('p','pets-muted','Cargando comparación…'));
    try {
      const [a,b]=await Promise.all([load(parseURL(left)),load(parseURL(right))]);
      if($('pets-compare-a').value!==left || $('pets-compare-b').value!==right) return;
      const table=el('table','pets-compare-table');
      const thead=el('thead','');const tr=el('tr','');
      ['Característica',a.nombre,b.nombre].forEach(v=>tr.append(el('th','',v)));thead.append(tr);table.append(thead);
      const body=el('tbody','');
      compKeys.forEach(key=>{
        const row=el('tr','');
        [labels[key]||naturalName(key),format(a.datos[key]),format(b.datos[key])].forEach(v=>row.append(el('td','',v)));
        body.append(row);
      });table.append(body);box.replaceChildren(table);
    }catch(err){box.replaceChildren(el('p','pets-status','No fue posible comparar: '+err.message));}
  }
  function renderFoods() {
    const q=clean($('pets-food-search').value),out=$('pets-foods');out.replaceChildren();
    const rows=state.foods.filter(f=>clean(Object.values(f).join(' ')).includes(q));
    rows.forEach(food=>{
      const d=el('details','pets-food');const s=el('summary');
      s.append(el('span','',naturalName(food.alimento)),el('span','pets-food-tag',format(food.categoria)));
      d.append(s);
      const info=el('div','pets-food-content');
      [['Clasificación registrada',food.toxicidad],['Sistema afectado',food.sistema_afectado],['Comentario del archivo original',food.comentario],['Recomendación registrada',food.recomendacion]].forEach(([k,v])=>info.append(el('p','',`${k}: ${format(v)}`)));
      d.append(info);out.append(d);
    });
    if (!rows.length)out.append(el('p','pets-no-data','No hay alimentos con ese término.'));
  }
  let mapLoaded=false;
  function polygons(g){return g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];}
  function shapePath(geometry) {
    const xy=point=>[(Number(point[0])+180)/360*960,(90-Number(point[1]))/180*480];
    return polygons(geometry).map(polygon=>polygon.map(ring=>ring.map((point,i)=>{
      const [x,y]=xy(point);return `${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ')+'Z').join(' ')).join(' ');
  }
  async function renderMap() {
    if (mapLoaded)return;
    const host=$('pets-map');
    const geo=await load(base+'mundo.geojson');
    if (!geo.features)throw new Error('GeoJSON incorrecto');
    const stats=new Map();
    for (const breed of state.breeds) {
      if(!breed.iso3 || !breed.pais)continue;
      const cur=stats.get(breed.iso3)||{nombre:breed.pais,count:0};cur.count++;stats.set(breed.iso3,cur);
    }
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 960 480');svg.setAttribute('role','img');svg.setAttribute('aria-label','Mapa de países de origen incluidos en las fichas de Pets');
    const bg=document.createElementNS(svg.namespaceURI,'rect');bg.setAttribute('width','960');bg.setAttribute('height','480');bg.setAttribute('fill','#191724');svg.append(bg);
    for(const feat of geo.features){
      const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',shapePath(feat.geometry));
      const iso=feat.properties.iso3, entry=stats.get(iso);
      if(entry){
        path.dataset.active='true';path.setAttribute('tabindex','0');
        path.setAttribute('aria-label',`${entry.nombre}: ${entry.count} razas estructuradas`);
        const title=document.createElementNS(svg.namespaceURI,'title');title.textContent=`${entry.nombre}: ${entry.count} razas`;path.append(title);
        const choose=()=>{$('pets-country').value=entry.nombre;state.visible=24;renderCards();setTab('catalogo');document.getElementById('pets-panel-catalogo').scrollIntoView({behavior:'smooth'});};
        path.addEventListener('click',choose);path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});
      }
      svg.append(path);
    }
    host.replaceChildren(svg);
    const list=$('pets-country-stats');list.replaceChildren();
    [...stats.values()].sort((a,b)=>b.count-a.count || a.nombre.localeCompare(b.nombre,'es')).forEach(row=>{
      const btn=el('button','pets-origin-row');btn.type='button';btn.append(el('span','',row.nombre),el('strong','',row.count));
      btn.addEventListener('click',()=>{$('pets-country').value=row.nombre;state.visible=24;renderCards();setTab('catalogo');document.getElementById('pets-panel-catalogo').scrollIntoView({behavior:'smooth'});});
      list.append(btn);
    });
    mapLoaded=true;
  }
  function reportError(error){console.error('Pets:',error);$('pets-map').textContent='No se pudo cargar el mapa: '+error.message;}
  async function init() {
    document.querySelectorAll('.pets-tab').forEach(btn=>btn.addEventListener('click',()=>setTab(btn.dataset.tab)));
    $('pets-dialog-close').addEventListener('click',()=>$('pets-dialog').close());
    $('pets-dialog').addEventListener('click',e=>{if(e.target===$('pets-dialog'))$('pets-dialog').close();});
    $('pets-more').addEventListener('click',()=>{state.visible+=24;renderCards();});
    ['pets-search','pets-group','pets-size','pets-country','pets-type'].forEach(id=>$(id).addEventListener(id==='pets-search'?'input':'change',()=>{state.visible=24;renderCards();}));
    $('pets-food-search').addEventListener('input',renderFoods);
    ['pets-compare-a','pets-compare-b'].forEach(id=>$(id).addEventListener('change',renderCompare));
    try {
      [state.breeds,state.foods] = await Promise.all([load(base+'razas-index.json'),load(base+'alimentos.json')]);
      setOptions($('pets-group'),state.breeds.map(b=>b.grupo),'Todos los grupos');
      setOptions($('pets-size'),state.breeds.map(b=>b.tamano),'Todos los tamaños');
      setOptions($('pets-country'),state.breeds.map(b=>b.pais),'Todos los países');
      const names=state.breeds.filter(b=>b.tipo==='estructurada');
      setOptions($('pets-compare-a'),names.map(b=>b.id),'Selecciona una raza');
      setOptions($('pets-compare-b'),names.map(b=>b.id),'Selecciona una raza');
      // Reemplaza ID por un nombre legible conservando el valor para cargar JSON.
      ['pets-compare-a','pets-compare-b'].forEach(id=>{
        [...$(id).options].forEach(o=>{const found=names.find(n=>n.id===o.value);if(found)o.textContent=found.nombre;});
      });
      if(names.length>1){$('pets-compare-a').value=names[0].id;$('pets-compare-b').value=names[1].id;}
      renderCards();
    } catch(err) {
      $('pets-result-count').textContent='Error de carga';
      $('pets-cards').replaceChildren(el('p','pets-no-data','No se pudo abrir el catálogo. Inicia un servidor local, por ejemplo: py -m http.server 8000. Detalle: '+err.message));
    }
  }
  init();
})();
