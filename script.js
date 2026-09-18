/* SAAC V4 — Supabase */
const SUPABASE_URL = "https://selnuwzcdzkjmbjthxwv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_4vd7mYjgt1hkmEsivXpk9g_Z5IndKqL";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let localEvents = [
  {name:'SESSION SPEEDSOFT',time:'20:30',desc:'5v5 • manches courtes • élimination'},
  {name:'OPÉRATION CQB',time:'21:30',desc:'Attaque / défense • objectif central'},
  {name:'GREEN SHIELD',time:'20:00',desc:'Protection VIP • escorte • extraction'}
];

function toast(s){
  const t=document.getElementById('toast');
  if(!t)return;
  t.textContent=s;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
}

function setDbStatus(ok, text){
  const el=document.getElementById('dbStatus');
  if(!el)return;
  el.textContent=(ok?'● ':'● ')+text;
  el.classList.toggle('online',ok);
}

function formatTime(t){
  if(!t) return '--:--';
  return String(t).slice(0,5);
}

function renderEvents(events){
  const list=document.getElementById('eventList');
  if(!list)return;
  if(!events.length){
    list.innerHTML='<div class="empty">Aucun événement publié pour le moment.</div>';
    return;
  }
  list.innerHTML=events.map(e=>`
    <div class="event">
      <time>${formatTime(e.start_time || e.time)}</time>
      <div>
        <small>SAAC EVENT</small>
        <h3>${e.title || e.name}</h3>
        <p>${e.description || e.desc || ''}</p>
      </div>
      <button onclick="registerEvent(${Number(e.id)||0}, '${String(e.title||e.name||'Événement').replaceAll("'","\\\\'")}')">S'INSCRIRE</button>
    </div>`).join('');
}

async function loadEvents(){
  const {data,error}=await db
    .from('events')
    .select('id,title,event_type,event_date,start_time,description,location,max_places,status')
    .eq('status','open')
    .order('event_date',{ascending:true})
    .order('start_time',{ascending:true});

  if(error){
    setDbStatus(false,'SUPABASE HORS LIGNE');
    renderEvents(localEvents);
    return;
  }
  setDbStatus(true,'SUPABASE CONNECTÉ');
  renderEvents(data || []);
  document.getElementById('statEvents').textContent=(data||[]).length;
}

async function registerEvent(eventId,eventName){
  if(!eventId){
    toast('Cet événement est encore en mode démonstration');
    return;
  }
  const name=prompt('Nom / pseudo :');
  if(!name)return;
  const discord=prompt('Discord (facultatif) :') || null;
  const equipment=confirm('Tu demandes du matériel Gruppe 6 ?') ? 'Location Gruppe 6' : 'Matériel personnel';

  const {error}=await db.from('registrations').insert({
    event_id:eventId,
    name:name.trim(),
    discord,
    equipment,
    status:'pending'
  });
  if(error){
    toast('Inscription impossible pour le moment');
    return;
  }
  toast('Inscription envoyée : '+eventName);
}

async function loadRanking(){
  const list=document.getElementById('rankingList');
  if(!list)return;
  const {data,error}=await db.from('matches')
    .select('player_name,matches_played,wins,losses,points')
    .order('points',{ascending:false});
  if(error || !data || !data.length){
    list.innerHTML='<div class="empty">Aucun résultat pour le moment — le classement sera alimenté après les prochaines compétitions.</div>';
    document.getElementById('statRanking').textContent='0';
    return;
  }
  list.innerHTML=data.map((p,i)=>`
    <div class="tr"><span>${i+1}</span><strong>${p.player_name}</strong>
    <span>${p.matches_played}</span><span>${p.wins}</span><span>${p.losses}</span>
    <strong>${p.points}</strong></div>`).join('');
  document.getElementById('statRanking').textContent=data.length;
}

async function loadNews(){
  // Reserved for the news section in the next site revision.
  await db.from('news').select('id,title,content,image_url,created_at').eq('published',true).order('created_at',{ascending:false});
}


async function init(){
  await loadEvents();
  await loadRanking();
  await loadNews();
}
init();
