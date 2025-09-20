// script.js - Alineador tipo FIFA (click player -> click posición)
// players.json must be in same folder

const playersJsonUrl = 'players.json';
const MAX_PLAYERS = 11;

const formationTemplates = {
  "4-4-2": [
    {id:"GK", label:"GK", y:88, x:50},
    {id:"CB1", label:"CB", y:70, x:35},
    {id:"CB2", label:"CB", y:70, x:65},
    {id:"LB", label:"LB", y:68, x:10},
    {id:"RB", label:"RB", y:68, x:90},
    {id:"LM", label:"LM", y:48, x:18},
    {id:"CM1", label:"CM", y:50, x:38},
    {id:"CM2", label:"CM", y:50, x:62},
    {id:"RM", label:"RM", y:48, x:82},
    {id:"ST1", label:"ST", y:26, x:35},
    {id:"ST2", label:"ST", y:26, x:65}
  ],
  "4-3-3":[
    {id:"GK", label:"GK", y:88, x:50},
    {id:"CB1", label:"CB", y:70, x:30},
    {id:"CB2", label:"CB", y:70, x:70},
    {id:"LB", label:"LB", y:64, x:10},
    {id:"RB", label:"RB", y:64, x:90},
    {id:"CM1", label:"CM", y:50, x:28},
    {id:"CM2", label:"CM", y:50, x:50},
    {id:"CM3", label:"CM", y:50, x:72},
    {id:"LW", label:"LW", y:28, x:18},
    {id:"ST", label:"ST", y:24, x:50},
    {id:"RW", label:"RW", y:28, x:82}
  ],
  "3-5-2":[
    {id:"GK", label:"GK", y:88, x:50},
    {id:"CB1", label:"CB", y:72, x:20},
    {id:"CB2", label:"CB", y:72, x:50},
    {id:"CB3", label:"CB", y:72, x:80},
    {id:"LM", label:"LM", y:54, x:12},
    {id:"CM1", label:"CM", y:54, x:34},
    {id:"CM2", label:"CM", y:40, x:50},
    {id:"CM3", label:"CM", y:54, x:66},
    {id:"RM", label:"RM", y:54, x:88},
    {id:"ST1", label:"ST", y:22, x:36},
    {id:"ST2", label:"ST", y:22, x:64}
  ],
  "5-3-2":[
    {id:"GK", label:"GK", y:88, x:50},
    {id:"CB1", label:"CB", y:72, x:10},
    {id:"CB2", label:"CB", y:72, x:30},
    {id:"CB3", label:"CB", y:72, x:50},
    {id:"CB4", label:"CB", y:72, x:70},
    {id:"CB5", label:"CB", y:72, x:90},
    {id:"CM1", label:"CM", y:50, x:30},
    {id:"CM2", label:"CM", y:50, x:50},
    {id:"CM3", label:"CM", y:50, x:70},
    {id:"ST1", label:"ST", y:24, x:38},
    {id:"ST2", label:"ST", y:24, x:62}
  ]
};

// state
let players = [];
let currentTeam = {}; // mapping posId -> player object
let selectedPlayer = null; // player selected from pool

// helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// toast NO-OP (sin notificaciones)
const toast = () => { /* no-op */ };

/* ---------------------------
   Load players
   --------------------------- */
async function loadPlayers(){
  try {
    const r = await fetch(playersJsonUrl);
    if(!r.ok) throw new Error('players.json no encontrado');
    players = await r.json();
  } catch(e){
    console.error(e);
    // fallback (lista de ejemplo)
    players = [
      {"id":1,"name":"Tsubasa Ozora","team":"Japón","rating":10},
      {"id":2,"name":"Kojiro Hyuga","team":"Japón","rating":9},
      {"id":3,"name":"Genzo Wakabayashi","team":"Japón","rating":1},
      {"id":4,"name":"Taro Misaki","team":"Japón","rating":11},
      {"id":5,"name":"Shun Nitta","team":"Japón","rating":12},
      {"id":6,"name":"Hikaru Matsuyama","team":"Japón","rating":5},
      {"id":7,"name":"Ryo Ishizaki","team":"Japón","rating":3},
      {"id":8,"name":"Jun Misugi","team":"Japón","rating":4},
      {"id":9,"name":"Roberto Hongo","team":"Brazil","rating":10},
      {"id":10,"name":"Carlos Santana","team":"Brazil","rating":11},
      {"id":11,"name":"Rivaul","team":"Brazil","rating":10},
      {"id":12,"name":"Natureza","team":"Brazil","rating":0},
      {"id":13,"name":"Senaldo","team":"Brazil","rating":5},
      {"id":14,"name":"Radunga","team":"Brazil","rating":3},
      {"id":15,"name":"Casa Grande","team":"Brazil","rating":4},
      {"id":16,"name":"Salinas","team":"Brazil","rating":1},
      {"id":17,"name":"Leo","team":"Brazil","rating":7},
      {"id":18,"name":"Pépe","team":"Brazil","rating":13},
      {"id":19,"name":"Schneider","team":"Alemania","rating":11},
      {"id":20,"name":"Schester","team":"Alemania","rating":10},
      {"id":21,"name":"Muller","team":"Alemania","rating":1},
      {"id":22,"name":"Kaltz","team":"Alemania","rating":5},
      {"id":23,"name":"Margus","team":"Alemania","rating":9},
      {"id":24,"name":"Mario Goete","team":"Alemania","rating":3},
      {"id":25,"name":"Teigerbran","team":"Alemania","rating":4},
      {"id":26,"name":"Eric Schmidt","team":"Alemania","rating":6},
      {"id":27,"name":"Kevin Schmidt","team":"Alemania","rating":7},
      {"id":28,"name":"Juan Diaz","team":"Argentina","rating":10},
      {"id":29,"name":"Pascal","team":"Argentina","rating":11},
      {"id":30,"name":"Galvan","team":"Argentina","rating":5},
      {"id":31,"name":"Pierre","team":"Francia","rating":10},
      {"id":32,"name":"Napoleón","team":"Francia","rating":9},
      {"id":33,"name":"Amoros","team":"Francia","rating":1},
      {"id":34,"name":"Hugo","team":"Mexico","rating":10},
      {"id":35,"name":"Ricardo Espadas","team":"Mexico","rating":1},
      {"id":36,"name":"Micael","team":"España","rating":10},
      {"id":37,"name":"Rafael","team":"España","rating":11}
    ];
  }

  // Normalize: ensure every player has a `team` property.
  players = players.map(p => ({ ...p, team: (p.team || p.position || '—') }));
}

/* ---------------------------
   persistence
   --------------------------- */
function saveState(){
  localStorage.setItem('mdt_lineup', JSON.stringify(currentTeam));
}
function loadState(){
  const raw = localStorage.getItem('mdt_lineup');
  if(raw) {
    try {
      currentTeam = JSON.parse(raw);
    } catch(e) { currentTeam = {} }
  } else currentTeam = {};
}

/* ---------------------------
   render players pool (robusto)
   --------------------------- */
function renderPlayers(){
  const container = $('#playersList');
  if(!container) return;
  container.innerHTML = '';
  players.forEach(p => {
    const div = document.createElement('div');
    div.className = 'player';
    div.innerHTML = `
      <div class="left">
        <div class="avatar">${getInitials(p.name)}</div>
        <div>
          <div class="pname">${p.name}</div>
          <div class="meta">${p.team} • ${p.rating}</div>
        </div>
      </div>
      <div>
        <button class="btn-small ${isInTeam(p.id) ? 'ghost' : ''}" data-id="${p.id}">
          ${isInTeam(p.id) ? 'En equipo' : 'Seleccionar'}
        </button>
      </div>
    `;
    container.appendChild(div);
  });

  // attach handlers robustly: clone to remove old listeners, then add click+touch
  const btns = Array.from(container.querySelectorAll('.btn-small'));
  btns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = Number(newBtn.dataset.id);
      if (!isInTeam(id)) {
        const p = players.find(x=>x.id===id);
        if(p) selectedPlayer = p;
      }
    }, {passive:false});
    newBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      const id = Number(newBtn.dataset.id);
      if (!isInTeam(id)) {
        const p = players.find(x=>x.id===id);
        if(p) selectedPlayer = p;
      }
    }, {passive:false});
  });
}

/* ---------------------------
   render formation and positions
   --------------------------- */
function renderFormation(formationKey){
  const template = formationTemplates[formationKey];
  const pitch = $('#pitch');
  if(!pitch) return;
  pitch.innerHTML = ''; // clear
  template.forEach(pos => {
    const div = document.createElement('div');
    div.className = 'pos placeholder';
    div.dataset.pos = pos.id;
    div.style.setProperty('--x', pos.x + '%');
    div.style.setProperty('--y', pos.y + '%');

    // wrapper para el contenido (para manejo visual)
    const content = document.createElement('div');
    content.className = 'pos-content';
    div.appendChild(content);

    // click handler: assign selectedPlayer or expand / show details
    div.addEventListener('click', (e) => {
      const posId = div.dataset.pos;

      // If user is assigning a player, do that first
      if(selectedPlayer){
        assignPlayerToPos(selectedPlayer, posId);
        selectedPlayer = null;
        renderPlayers();
        renderFormation(currentFormation);
        return;
      }

      // If there's a player in this pos, toggle expansion to show details
      const hasPlayer = !!currentTeam[posId];
      if(hasPlayer){
        const isExpanded = div.classList.contains('expanded');
        document.querySelectorAll('.pos.expanded').forEach(el => { if(el !== div) el.classList.remove('expanded'); });
        if(isExpanded) div.classList.remove('expanded');
        else div.classList.add('expanded');
        return;
      }
      // otherwise silent
    }, {passive:false});

    // if there's a player already in this pos, show it (compact by default)
    const p = currentTeam[pos.id];
    if(p){
      div.classList.remove('placeholder');
      div.classList.add('filled');

      content.innerHTML = `
        <div class="compact">
          <div class="name-compact">${p.name}</div>
        </div>
        <div class="full" aria-hidden="true">
          <div class="name-full">${p.name}</div>
          <div class="meta">${p.team}</div>
          <div class="meta">#${p.rating ?? ''}</div>
          <button class="removeBtn" aria-label="Quitar">✕</button>
        </div>
      `;

      // --- instant remove button binding (NO confirm) ---
      const removeBtn = content.querySelector('.removeBtn');
      if(removeBtn){
        const newBtn = removeBtn.cloneNode(true);
        removeBtn.parentNode.replaceChild(newBtn, removeBtn);

        const handler = (ev) => {
          ev.preventDefault?.();
          ev.stopPropagation?.();

          // remove immediately without any confirmation
          removePlayerFromPos(pos.id);
          renderPlayers();
          renderFormation(currentFormation);
        };

        newBtn.addEventListener('click', handler, {passive:false});
        newBtn.addEventListener('touchend', handler, {passive:false});
      }
      // --- end instant remove binding ---
    } else {
      // no player: show placeholder label
      content.innerHTML = `<div class="label">${pos.label}</div>`;
    }

    pitch.appendChild(div);
  });

  // update counter
  updateCounter();
}

/* ---------------------------
   assign / remove helpers
   --------------------------- */
function assignPlayerToPos(player, posId){
  const existingPos = findPlayerPos(player.id);
  if(existingPos){
    delete currentTeam[existingPos];
  }
  currentTeam[posId] = player;
  saveState();
}

function removePlayerFromPos(posId){
  if(currentTeam[posId]) {
    delete currentTeam[posId];
    saveState();
  }
}

function findPlayerPos(playerId){
  return Object.keys(currentTeam).find(k => currentTeam[k] && currentTeam[k].id === playerId);
}

function isInTeam(playerId){
  return !!findPlayerPos(playerId);
}

function updateCounter(){
  const cnt = Object.keys(currentTeam).length;
  const el = $('#counter');
  if(el) el.textContent = `${cnt} / ${MAX_PLAYERS}`;
}

/* ---------------------------
   migration logic
   --------------------------- */
function migrateTeamToFormation(oldTeam, newTemplate){
  const newTeam = {};
  const slotOrder = newTemplate.map(p => p.id);

  // keep same-slot players
  slotOrder.forEach(slotId => {
    if(oldTeam[slotId]) newTeam[slotId] = oldTeam[slotId];
  });

  // leftover from oldTeam whose slot doesn't exist anymore
  const leftoverPlayers = [];
  Object.keys(oldTeam).forEach(oldPosId => {
    if(!slotOrder.includes(oldPosId)){
      leftoverPlayers.push(oldTeam[oldPosId]);
    }
  });

  // fill empty slots with leftovers
  const emptySlots = slotOrder.filter(slotId => !newTeam[slotId]);
  for(let i = 0; i < emptySlots.length && i < leftoverPlayers.length; i++){
    newTeam[ emptySlots[i] ] = leftoverPlayers[i];
  }

  currentTeam = newTeam;
  saveState();
  return currentTeam;
}

/* ---------------------------
   formation change
   --------------------------- */
let currentFormation = '4-4-2';
function initFormation(){
  const sel = $('#formationSelect');
  if(!sel) return;
  sel.value = currentFormation;
  sel.addEventListener('change', () => {
    const newFormation = sel.value;
    const newTemplate = formationTemplates[newFormation];
    if(!newTemplate) {
      currentFormation = newFormation;
      renderFormation(currentFormation);
      return;
    }
    migrateTeamToFormation(currentTeam, newTemplate);
    currentFormation = newFormation;
    renderPlayers();
    renderFormation(currentFormation);
  }, {passive:false});
  renderFormation(currentFormation);
}

/* ---------------------------
   export
   --------------------------- */
function exportLineup(){
  const lineup = { formation: currentFormation, lineup: currentTeam };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lineup,null,2));
  const dl = document.createElement('a');
  dl.setAttribute('href', dataStr);
  dl.setAttribute('download', 'lineup.json');
  dl.click();
}

/* ---------------------------
   clear team (instant, NO confirm)
   --------------------------- */
function clearTeam(){
  // remove immediately without confirmation
  currentTeam = {};
  saveState();
  renderPlayers();
  renderFormation(currentFormation);
}

/* ---------------------------
   util
   --------------------------- */
function getInitials(name){
  return name.split(' ').map(n=>n.charAt(0)).slice(0,2).join('').toUpperCase();
}

/* ---------------------------
   init app
   --------------------------- */
(async function(){
  await loadPlayers();
  loadState();
  renderPlayers();
  initFormation();
  updateCounter();

  const exportBtn = $('#exportBtn');
  if(exportBtn) {
    exportBtn.addEventListener('click', (e)=>{ e.preventDefault(); exportLineup(); }, {passive:false});
    exportBtn.addEventListener('touchend', (e)=>{ e.preventDefault(); exportLineup(); }, {passive:false});
  }

  // bind clear button robustamente (instant clear)
  const clearBtn = $('#clearTeam');
  if(clearBtn) {
    const newBtn = clearBtn.cloneNode(true);
    clearBtn.parentNode.replaceChild(newBtn, clearBtn);
    newBtn.addEventListener('click', (e)=>{ e.preventDefault(); clearTeam(); }, {passive:false});
    newBtn.addEventListener('touchend', (e)=>{ e.preventDefault(); clearTeam(); }, {passive:false});
  }
})();
