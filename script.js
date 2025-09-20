// script.js - Alineador tipo FIFA (click player -> click posición)
// players.json must be in same folder

const playersJsonUrl = 'players.json';
const MAX_PLAYERS = 11;

const formationTemplates = {
  "4-4-2": [
    {id:"GK", label:"GK", y:88, x:50},
    {id:"CB1", label:"CB", y:70, x:20},
    {id:"CB2", label:"CB", y:70, x:80},
    {id:"LB", label:"LB", y:68, x:6},
    {id:"RB", label:"RB", y:68, x:94},
    {id:"LM", label:"LM", y:48, x:18},
    {id:"CM1", label:"CM", y:50, x:38},
    {id:"CM2", label:"CM", y:50, x:62},
    {id:"RM", label:"RM", y:48, x:82},
    {id:"ST1", label:"ST", y:26, x:35},
    {id:"ST2", label:"ST", y:26, x:65}
  ],
  "4-3-3":[
    {id:"GK", label:"GK", y:88, x:50},
    {id:"CB1", label:"CB", y:70, x:18},
    {id:"CB2", label:"CB", y:70, x:50},
    {id:"CB3", label:"CB", y:70, x:82},
    {id:"LB", label:"LB", y:64, x:6},
    {id:"RB", label:"RB", y:64, x:94},
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
    {id:"CB1", label:"CB", y:72, x:8},
    {id:"CB2", label:"CB", y:72, x:30},
    {id:"CB3", label:"CB", y:72, x:50},
    {id:"CB4", label:"CB", y:72, x:70},
    {id:"CB5", label:"CB", y:72, x:92},
    {id:"CM1", label:"CM", y:50, x:35},
    {id:"CM2", label:"CM", y:50, x:50},
    {id:"CM3", label:"CM", y:50, x:65},
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
const toast = (msg) => {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(()=> t.classList.remove('show'), 2000);
};

// load players.json
async function loadPlayers(){
  try {
    const r = await fetch(playersJsonUrl);
    if(!r.ok) throw new Error('players.json no encontrado');
    players = await r.json();
  } catch(e){
    console.error(e);
    // fallback
    players = [
      {"id":1,"name":"Tsubasa Ozora","position":"Delantero","rating":95},
      {"id":2,"name":"Kojiro Hyuga","position":"Delantero","rating":92},
      {"id":3,"name":"Genzo Wakabayashi","position":"Portero","rating":94},
      {"id":4,"name":"Taro Misaki","position":"Mediocentro","rating":90},
      {"id":5,"name":"Mark Lenders","position":"Delantero","rating":91},
      {"id":6,"name":"Hikaru Matsuyama","position":"Defensa","rating":85},
      {"id":7,"name":"Ryo Ishizaki","position":"Defensa","rating":80},
      {"id":8,"name":"Jun Misugi","position":"Mediocentro","rating":89},
      {"id":9,"name":"Roberto Hongo","position":"Entrenador","rating":99},
      {"id":10,"name":"Carlos Santana","position":"Mediocentro","rating":87}
    ];
  }
}

// persistence
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

// render players pool
function renderPlayers(){
  const container = $('#playersList');
  container.innerHTML = '';
  players.forEach(p => {
    const div = document.createElement('div');
    div.className = 'player';
    div.innerHTML = `
      <div class="left">
        <div class="avatar">${getInitials(p.name)}</div>
        <div>
          <div class="pname">${p.name}</div>
          <div class="meta">${p.position} • ${p.rating}</div>
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

  // bind select buttons
  $$('.btn-small').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const p = players.find(x=>x.id===id);
      if(isInTeam(id)) {
        toast('El jugador ya está en el equipo. Para moverlo, haz click en la posición donde está y luego elige otro.');
        return;
      }
      selectedPlayer = p;
      toast(`Jugador seleccionado: ${p.name} → ahora haz clic en la posición en el campo`);
    };
  });
}

// formation rendering
function renderFormation(formationKey){
  const template = formationTemplates[formationKey];
  const pitch = $('#pitch');
  pitch.innerHTML = ''; // clear
  template.forEach(pos => {
    const div = document.createElement('div');
    div.className = 'pos placeholder';
    div.dataset.pos = pos.id;
    div.style.left = `calc(${pos.x}% - 55px)`; // center by width/2
    div.style.top = `calc(${pos.y}% - 20px)`;
    div.innerHTML = `<div class="label">${pos.label}</div>`;
    // click handler: assign selectedPlayer or remove
    div.onclick = (e) => {
      const posId = div.dataset.pos;
      if(selectedPlayer){
        assignPlayerToPos(selectedPlayer, posId);
        selectedPlayer = null;
        renderPlayers();
        renderFormation(currentFormation); // re-render to show name
        toast('Jugador asignado');
        return;
      }
      // if no selected player, toggle remove or show details
      if(currentTeam[posId]){
        // remove
        if(confirm(`Quitar a ${currentTeam[posId].name} de ${pos.label}?`)){
          removePlayerFromPos(posId);
          renderPlayers();
          renderFormation(currentFormation);
          toast('Jugador quitado');
        }
      } else {
        toast('No hay jugador seleccionado. Haz click en un jugador a la derecha para seleccionarlo.');
      }
    };

    // if there's a player already in this pos, show it
    const p = currentTeam[pos.id];
    if(p){
      div.classList.remove('placeholder');
      div.innerHTML = `<div class="name">${p.name}</div><div class="small">${p.position}</div><button class="removeBtn" aria-label="Quitar">✕</button>`;
      const removeBtn = div.querySelector('.removeBtn');
      removeBtn.style.display = 'block';
      removeBtn.onclick = (ev) => {
        ev.stopPropagation();
        if(confirm(`Quitar a ${p.name}?`)) {
          removePlayerFromPos(pos.id);
          renderPlayers();
          renderFormation(currentFormation);
          toast('Jugador quitado');
        }
      }
    }

    pitch.appendChild(div);
  });

  // update counter
  updateCounter();
}

// helpers assign/remove
function assignPlayerToPos(player, posId){
  // if player is already in other pos, remove from there (swap)
  const existingPos = findPlayerPos(player.id);
  if(existingPos){
    // swap: remove from existingPos
    delete currentTeam[existingPos];
  }
  // if the pos already had a player, put that player back to pool (delete mapping)
  const displaced = currentTeam[posId];
  if(displaced){
    // just overwrite; displaced will become unassigned
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
  $('#counter').textContent = `${cnt} / ${MAX_PLAYERS}`;
}

// formation change
let currentFormation = '4-4-2';
function initFormation(){
  const sel = $('#formationSelect');
  sel.value = currentFormation;
  sel.onchange = () => {
    currentFormation = sel.value;
    renderFormation(currentFormation);
  };
  renderFormation(currentFormation);
}

// export lineup
function exportLineup(){
  const lineup = { formation: currentFormation, lineup: currentTeam };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lineup,null,2));
  const dl = document.createElement('a');
  dl.setAttribute('href', dataStr);
  dl.setAttribute('download', 'lineup.json');
  dl.click();
  toast('Lineup exportado');
}

// clear team
function clearTeam(){
  if(confirm('Vaciar el equipo?')){
    currentTeam = {};
    saveState();
    renderPlayers();
    renderFormation(currentFormation);
    toast('Equipo vaciado');
  }
}

// initials util
function getInitials(name){
  return name.split(' ').map(n=>n.charAt(0)).slice(0,2).join('').toUpperCase();
}

// init app
(async function(){
  await loadPlayers();
  loadState();
  renderPlayers();
  initFormation();
  updateCounter();

  $('#exportBtn').onclick = exportLineup;
  $('#clearTeam').onclick = clearTeam;
})();
