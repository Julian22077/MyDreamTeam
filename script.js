
const playersJsonUrl = 'players.json'; // coloca players.json en la misma carpeta
const MAX_PLAYERS = 11;

function $(sel){ return document.querySelector(sel) }
function $all(sel){ return Array.from(document.querySelectorAll(sel)) }

function loadPlayersJson(){
  return fetch(playersJsonUrl)
    .then(r => { if(!r.ok) throw new Error('No se pudo cargar players.json'); return r.json() })
    .catch(err => {
      console.error('Error cargando players.json:', err);
      // fallback mínimo
      return [
        {"id":1,"name":"Tsubasa Ozora","position":"Delantero","rating":95},
        {"id":2,"name":"Kojiro Hyuga","position":"Delantero","rating":92},
        {"id":3,"name":"Genzo Wakabayashi","position":"Portero","rating":94}
      ];
    });
}

function loadTeam(){
  try{
    const raw = localStorage.getItem('mydreamteam_team');
    return raw ? JSON.parse(raw) : [];
  }catch(e){ console.error(e); return [] }
}

function saveTeam(team){
  localStorage.setItem('mydreamteam_team', JSON.stringify(team));
  renderCounter(team);
}

function renderCounter(team){
  const counter = $('#counter');
  counter.textContent = `${team.length} / ${MAX_PLAYERS}`;
}

function renderTeam(team){
  const el = $('#teamList');
  if(!team || team.length === 0){
    el.innerHTML = '<div class="empty">No hay jugadores en el equipo. Añade desde la lista.</div>';
    return;
  }
  el.innerHTML = '';
  team.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-inner">
        <div class="avatar">${getInitials(p.name)}</div>
        <div class="player-info">
          <div class="player-name">${p.name}</div>
          <div class="player-meta">${p.position} • Rating: ${p.rating}</div>
        </div>
      </div>
      <div class="actions">
        <button class="small-btn remove-btn">Quitar</button>
      </div>
    `;
    div.querySelector('.remove-btn').addEventListener('click', () => {
      const newTeam = loadTeam().filter(x => x.id !== p.id);
      saveTeam(newTeam);
      renderTeam(newTeam);
      renderPlayers(window._players || [], newTeam);
    });
    el.appendChild(div);
  });
}

function renderPlayers(players, team){
  window._players = players; // cache global simple
  const el = $('#playersList');
  el.innerHTML = '';
  players.forEach(p => {
    const inTeam = team.some(x => x.id === p.id);
    const div = document.createElement('div');
    div.className = 'card';
    const actionBtn = inTeam ? `<button class="small-btn ghost remove-btn">Quitar</button>` : `<button class="small-btn add-btn">Agregar</button>`;
    div.innerHTML = `
      <div class="card-inner">
        <div class="avatar">${getInitials(p.name)}</div>
        <div class="player-info">
          <div class="player-name">${p.name}</div>
          <div class="player-meta">${p.position} • Rating: ${p.rating}</div>
        </div>
      </div>
      <div class="actions">${actionBtn}</div>
    `;

    if(!inTeam){
      div.querySelector('.add-btn').addEventListener('click', () => {
        const current = loadTeam();
        if(current.length >= MAX_PLAYERS){ alert('El equipo ya tiene 11 jugadores'); return; }
        if(current.some(x=>x.id===p.id)){ alert('El jugador ya está en el equipo'); return; }
        current.push(p);
        saveTeam(current);
        renderTeam(current);
        renderPlayers(players, current);
      });
    } else {
      div.querySelector('.remove-btn').addEventListener('click', () => {
        const newTeam = loadTeam().filter(x => x.id !== p.id);
        saveTeam(newTeam);
        renderTeam(newTeam);
        renderPlayers(players, newTeam);
      });
    }

    el.appendChild(div);
  });

  if(players.length === 0){
    el.innerHTML = '<div class="empty">No hay jugadores disponibles.</div>';
  }
}

function getInitials(name){
  return name.split(' ').map(n=>n.charAt(0)).slice(0,2).join('').toUpperCase();
}

// Clear team
$('#clearTeam').addEventListener('click', () => {
  if(confirm('¿Vaciar equipo?')) {
    saveTeam([]);
    renderTeam([]);
    renderPlayers(window._players || [], []);
  }
});

// Init
(async function init(){
  const players = await loadPlayersJson();
  const team = loadTeam();
  renderCounter(team);
  renderTeam(team);
  renderPlayers(players, team);
})();