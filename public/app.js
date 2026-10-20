const KEY = "mmf_v1_data";
const defaultLeagues = [
  "South Sudan Premier League",
  "Juba Local Football Association (Konyokonyo League) First Division",
  "Juba Local Football Association Second Division",
  "Juba Local Football Association Third Division",
  "Central Equatoria State League (Juba)",
  "Eastern Equatoria State League (Torit)",
  "Jonglei State League (Bor)",
  "Lakes State League (Rumbek)",
  "Northern Bahr el Ghazal State League (Aweil)",
  "Unity State League (Bentiu)",
  "Upper Nile State League (Malakal)",
  "Warrap State League (Kuajok)",
  "Western Bahr el Ghazal State League (Wau)",
  "Western Equatoria State League (Yambio)",
  "Yei Local Football Association"
];
const associations = [
  {name:"Juba Local Football Association",detail:"First Division · Second Division · Third Division"},
  {name:"Yei Local Football Association",detail:"Teams · Fixtures · Results · League table"},
  {name:"Yambio Local Football Association",detail:"Teams · Fixtures · Results · League table"},
  {name:"Rumbek Local Football Association",detail:"Teams · Fixtures · Results · League table"},
  {name:"Aweil Local Football Association",detail:"Teams · Fixtures · Results · League table"},
  {name:"Wau Local Football Association",detail:"Teams · Fixtures · Results · League table"}
];
const defaultClubs = Array.from({length:14},(_,i)=>({id:i+1,name:`Club ${String(i+1).padStart(2,"0")} — update name`,association:"South Sudan Premier League",logo:"",short:`${i+1}`}));
const seed = {
  clubs: defaultClubs,
  leagues: defaultLeagues,
  leagueCatalogVersion: 2,
  leagueLogos: {},
  leagueLogo: "",
  followedClubIds: [],
  initialStandings: [],
  matches: [],
  players: [],
  news: [
    {id:1,title:"Welcome to M.MissionFootball",category:"Platform News",summary:"Your home for South Sudan Premier League football, local associations, clubs, players, fixtures and results.",date:new Date().toISOString()},
    {id:2,title:"League and club information",category:"League News",summary:"Administrators can add verified club names, official logos, fixtures and results through the dashboard.",date:new Date().toISOString()},
    {id:3,title:"Local football matters",category:"Community Football",summary:"Follow football associations in Juba, Yei, Yambio, Rumbek, Aweil and Wau.",date:new Date().toISOString()}
  ]
};
function loadData(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&Array.isArray(d.clubs)&&Array.isArray(d.matches)&&Array.isArray(d.news)){const leagues=Array.isArray(d.leagues)?d.leagues.slice():[];if(d.leagueCatalogVersion!==2)defaultLeagues.forEach(league=>{if(!leagues.includes(league))leagues.push(league);});return{...d,players:Array.isArray(d.players)?d.players:[],leagues,leagueCatalogVersion:2,leagueLogos:d.leagueLogos&&typeof d.leagueLogos==="object"?d.leagueLogos:{},followedClubIds:Array.isArray(d.followedClubIds)?d.followedClubIds.map(Number).filter(Number.isFinite):[],initialStandings:Array.isArray(d.initialStandings)?d.initialStandings.filter(entry=>entry&&typeof entry==="object"):[]};}}catch(e){}return structuredClone(seed);}
let data=loadData();
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(data));renderAll();return true;}
 catch(error){
  console.error("Could not save M.MissionFootball data to this browser.",error);
  data=loadData();
  renderAll();
  document.getElementById("adminMessage").textContent="Could not save changes. The browser may not have enough storage; try a smaller logo image.";
  return false;
 }
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function initials(name){return String(name||"?").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();}
function clubName(id){return data.clubs.find(c=>c.id===Number(id))?.name||"Club to be confirmed";}
function fmtDate(d){if(!d)return"Date to be confirmed";const date=new Date(d);return isNaN(date)?d:date.toLocaleString(undefined,{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});}
function clubLogo(c){return c.logo?`<img src="${esc(c.logo)}" alt="${esc(c.name)} logo" onerror="this.style.display='none'">`:esc(initials(c.name));}
function leagueOptions(){return [...new Set(["South Sudan Premier League",...data.leagues,...data.clubs.map(c=>c.association).filter(Boolean),...data.matches.map(m=>m.league).filter(Boolean)])];}
function leagueLogo(name){return data.leagueLogos[name]||"";}
function associationOptions(){return [...new Set([...leagueOptions(),...associations.map(a=>a.name),"Juba First Division","Juba Second Division","Juba Third Division"])];}
function matchLeague(match){return match.league||data.clubs.find(c=>c.id===Number(match.homeId))?.association||"South Sudan Premier League";}
function localDateTimeValue(date){const d=new Date(date);if(Number.isNaN(d.getTime()))return"";return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}T${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;}
function dateKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}
function startOfDay(date){return new Date(date.getFullYear(),date.getMonth(),date.getDate());}
function weekMonday(date){const day=startOfDay(date);day.setDate(day.getDate()-((day.getDay()+6)%7));return day;}
function standings(selectedLeague){
 const clubs=selectedLeague==="all"?data.clubs:data.clubs.filter(club=>club.association===selectedLeague);
 const rows=clubs.map(c=>({id:c.id,name:c.name,logo:c.logo,played:0,won:0,draw:0,lost:0,gf:0,ga:0,pts:0}));
 (data.initialStandings||[]).filter(entry=>selectedLeague==="all"||entry.league===selectedLeague).forEach(entry=>{
  const row=rows.find(item=>item.id===Number(entry.clubId));if(!row)return;
  ["played","won","draw","lost","gf","ga","pts"].forEach(stat=>{row[stat]+=Number(entry[stat])||0;});
 });
 data.matches.filter(m=>m.status==="Finished"&&m.homeScore!==""&&m.awayScore!==""&&m.homeScore!=null&&m.awayScore!=null&&(selectedLeague==="all"||matchLeague(m)===selectedLeague)).forEach(m=>{
  const h=rows.find(r=>r.id===Number(m.homeId)),a=rows.find(r=>r.id===Number(m.awayId));if(!h||!a||h.id===a.id)return;
  const hs=Number(m.homeScore),as=Number(m.awayScore);if(!Number.isInteger(hs)||!Number.isInteger(as)||hs<0||as<0)return;h.played++;a.played++;h.gf+=hs;h.ga+=as;a.gf+=as;a.ga+=hs;
  if(hs>as){h.won++;a.lost++;h.pts+=3;}else if(hs<as){a.won++;h.lost++;a.pts+=3;}else{h.draw++;a.draw++;h.pts++;a.pts++;}
 });
 return rows.map(r=>({...r,lost:r.lost,gd:r.gf-r.ga})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name));
}
function renderClubs(){
 const orderedClubs=data.clubs.slice().sort((a,b)=>Number(a.id)-Number(b.id));
 document.getElementById("clubGrid").innerHTML=orderedClubs.map(c=>{const following=data.followedClubIds.includes(Number(c.id));return `<article class="club-card" title="Club profile: ${esc(c.name)}"><div class="club-logo">${clubLogo(c)}</div><strong>${esc(c.name)}</strong><button class="follow-club" type="button" data-follow-club="${c.id}" aria-pressed="${following}" aria-label="${following?"Unfollow":"Follow"} ${esc(c.name)}">${following?"★ Following":"☆ Follow"}</button></article>`;}).join("");
 const count=data.clubs.length;
 document.getElementById("clubCountHero").textContent=`${count} CLUB SLOTS`;
 document.getElementById("clubCountIntro").textContent=count;
 document.getElementById("leagueClubCount").textContent=`${count} CLUBS`;
 const selects=["homeTeam","awayTeam","playerClub"];
 selects.forEach(id=>{const el=document.getElementById(id);if(!el)return;const old=el.value;el.innerHTML=orderedClubs.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");if(old)el.value=old;});
 const matchEditor=document.getElementById("matchToEdit");
 if(matchEditor){const old=matchEditor.value;matchEditor.innerHTML=`<option value="">Add a new fixture</option>${data.matches.map(match=>`<option value="${match.id}">${esc(clubName(match.homeId))} vs ${esc(clubName(match.awayId))} · ${esc(fmtDate(match.date))}</option>`).join("")}`;if(data.matches.some(match=>String(match.id)===old))matchEditor.value=old;}
 const editor=document.getElementById("clubToEdit");
 if(editor){const old=editor.value;editor.innerHTML=`<option value="">Add a new club</option>${orderedClubs.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("")}`;if(data.clubs.some(c=>String(c.id)===old))editor.value=old;}
 const options=leagueOptions();
 [["fixtureLeagueFilter","all","All leagues"],["matchLeague",null,null]].forEach(([id,allValue,allLabel])=>{
  const select=document.getElementById(id);if(!select)return;
  const old=select.value;select.innerHTML=(allValue?`<option value="${allValue}">${allLabel}</option>`:"")+options.map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join("");
  if(options.includes(old))select.value=old;
 });
 const associationSelect=document.getElementById("clubAssociation");
 if(associationSelect){const old=associationSelect.value;associationSelect.innerHTML=associationOptions().map(name=>`<option>${esc(name)}</option>`).join("");if(associationOptions().includes(old))associationSelect.value=old;}
 const standingsSelect=document.getElementById("standingsLeagueFilter");
 if(standingsSelect){const old=standingsSelect.value;standingsSelect.innerHTML=leagueOptions().map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join("");if(leagueOptions().includes(old))standingsSelect.value=old;else standingsSelect.value=leagueOptions()[0]||"";}
 const leagueEditor=document.getElementById("leagueToEdit");
 if(leagueEditor){const old=leagueEditor.value;leagueEditor.innerHTML=`<option value="">Add a new league</option>${leagueOptions().map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join("")}`;if(leagueOptions().includes(old))leagueEditor.value=old;}
 const assignSelect=document.getElementById("leagueAssignSelect");
 if(assignSelect){const old=assignSelect.value;assignSelect.innerHTML=leagueOptions().map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join("");if(leagueOptions().includes(old))assignSelect.value=old;}
 const clubAssign=document.getElementById("leagueClubSelect");
 if(clubAssign){const old=clubAssign.value;clubAssign.innerHTML=orderedClubs.map(club=>`<option value="${club.id}">${esc(club.name)}</option>`).join("");if(orderedClubs.some(club=>String(club.id)===old))clubAssign.value=old;}
 renderInitialStandingsForm();
 renderLeagueList();
}
function renderLeagueList(){
 const list=document.getElementById("leagueList");
 if(!list)return;
 list.innerHTML=leagueOptions().map(league=>{
  const clubs=data.clubs.filter(club=>club.association===league);
  const logo=leagueLogo(league);
  return `<article class="league-list-item"><div class="league-list-item-heading"><span class="league-list-logo">${logo?`<img src="${esc(logo)}" alt="${esc(league)} logo" onerror="this.remove()">`:esc(initials(league))}</span><button type="button" data-edit-league="${esc(league)}">${esc(league)}</button></div>${clubs.length?`<ul>${clubs.map(club=>`<li>${esc(club.name)}</li>`).join("")}</ul>`:`<span class="muted">No clubs assigned</span>`}</article>`;
 }).join("");
}
function renderLeagueLogo(){
 const elements=["featuredLeagueLogo","leagueSectionLogo"];
 elements.forEach(id=>{
  const element=document.getElementById(id);
  if(element)element.innerHTML=data.leagueLogo?`<img src="${esc(data.leagueLogo)}" alt="South Sudan Premier League logo">`:"SSPL";
 });
 const preview=document.getElementById("leagueLogoPreview");
 if(preview)preview.innerHTML=data.leagueLogo?`<img src="${esc(data.leagueLogo)}" alt="Current league logo">`:"SSPL";
}
let preservedClubLogo="";
function resetClubForm(){
 const form=document.getElementById("clubForm");
 form.reset();
 document.getElementById("clubToEdit").value="";
 document.getElementById("saveClubButton").textContent="Add club";
 document.getElementById("removeClubButton").disabled=true;
 preservedClubLogo="";
}
function selectClubForEdit(id){
 const club=data.clubs.find(c=>String(c.id)===id);
 if(!club){resetClubForm();return;}
 document.getElementById("clubToEdit").value=String(club.id);
 document.getElementById("clubName").value=club.name;
 document.getElementById("clubAssociation").value=club.association;
 preservedClubLogo=club.logo&&club.logo.startsWith("data:")?club.logo:"";
 document.getElementById("clubLogo").value=preservedClubLogo?"":club.logo||"";
 document.getElementById("clubLogoFile").value="";
 document.getElementById("saveClubButton").textContent="Update club";
 document.getElementById("removeClubButton").disabled=false;
}
function renderStandings(){const league=document.getElementById("standingsLeagueFilter").value;const rows=standings(league);document.getElementById("standingsBody").innerHTML=rows.map((r,i)=>`<tr><td>${i+1}</td><td><div class="standing-club"><span class="standing-club-logo">${esc(initials(r.name))}${r.logo?`<img src="${esc(r.logo)}" alt="" onerror="this.remove()">`:""}</span><strong>${esc(r.name)}</strong></div></td><td>${r.played}</td><td>${r.won}</td><td>${r.draw}</td><td>${r.lost}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gd>0?"+":""}${r.gd}</td><td><strong>${r.pts}</strong></td></tr>`).join("")||`<tr><td colspan="10">No clubs assigned to this league yet.</td></tr>`;}
function renderInitialStandingsForm(){
 const leagueSelect=document.getElementById("initialStandingsLeague");
 const clubSelect=document.getElementById("initialStandingsClub");
 if(!leagueSelect||!clubSelect)return;
 const previousLeague=leagueSelect.value,previousClub=clubSelect.value;
 const leagues=leagueOptions();
 leagueSelect.innerHTML=leagues.map(league=>`<option value="${esc(league)}">${esc(league)}</option>`).join("");
 leagueSelect.value=leagues.includes(previousLeague)?previousLeague:(leagues[0]||"");
 const clubs=data.clubs.filter(club=>club.association===leagueSelect.value).slice().sort((a,b)=>a.name.localeCompare(b.name));
 clubSelect.innerHTML=clubs.map(club=>`<option value="${club.id}">${esc(club.name)}</option>`).join("");
 clubSelect.disabled=!clubs.length;
 clubSelect.value=clubs.some(club=>String(club.id)===previousClub)?previousClub:(clubs[0]?String(clubs[0].id):"");
 loadInitialStandingsEntry();
}
function loadInitialStandingsEntry(){
 const league=document.getElementById("initialStandingsLeague").value;
 const clubId=Number(document.getElementById("initialStandingsClub").value);
 const entry=(data.initialStandings||[]).find(item=>item.league===league&&Number(item.clubId)===clubId);
 [["played","initialPlayed"],["won","initialWon"],["draw","initialDraw"],["lost","initialLost"],["gf","initialGoalsFor"],["ga","initialGoalsAgainst"],["pts","initialPoints"]].forEach(([stat,id])=>{document.getElementById(id).value=entry?Number(entry[stat])||0:0;});
 document.getElementById("initialGoalDifference").value=entry?(Number(entry.gf)||0)-(Number(entry.ga)||0):0;
}
function renderAssociations(){document.getElementById("associationGrid").innerHTML=associations.map((a,i)=>`<article class="association-card"><div class="association-icon">${["⚽","◈","◉","◆","✦","◎"][i]}</div><h3>${esc(a.name)}</h3><p>${esc(a.detail)}</p></article>`).join("");}
const today=new Date();
let fixtureFilter="today";
let selectedFixtureDate=startOfDay(today);
let displayedWeek=weekMonday(today);
function renderMatches(){
 const live=data.matches.filter(m=>m.status==="Live");
 const upcoming=data.matches.filter(m=>m.status==="Scheduled").sort((a,b)=>new Date(a.date)-new Date(b.date));
 const picks=[...live,...upcoming].slice(0,3);
 document.getElementById("liveMatches").innerHTML=picks.length?picks.map(m=>`<article class="match-card"><div class="match-card-top"><span>${esc(fmtDate(m.date))}</span><span class="status ${m.status==="Live"?"live":""}">${esc(m.status)}</span></div><div class="match-teams"><div class="match-team"><div class="team-crest">${esc(initials(clubName(m.homeId)))}</div>${esc(clubName(m.homeId))}</div><div class="score">${m.homeScore!==""&&m.homeScore!=null?esc(m.homeScore):"–"} : ${m.awayScore!==""&&m.awayScore!=null?esc(m.awayScore):"–"}</div><div class="match-team"><div class="team-crest">${esc(initials(clubName(m.awayId)))}</div>${esc(clubName(m.awayId))}</div></div><div class="match-footer"><span>SSPL · Match centre</span><span>${m.status==="Finished"?"Full time":"Match details →"}</span></div></article>`).join(""):`<article class="match-card"><div class="match-card-top"><span>SSPL · 2026–2027</span><span class="status">NO MATCHES YET</span></div><div class="match-teams"><div class="match-team"><div class="team-crest">SS</div>South Sudan football</div><div class="versus">VS</div><div class="match-team"><div class="team-crest">⚽</div>Your next match</div></div><div class="match-footer"><span>Fixtures will appear here</span><button class="text-link" onclick="openAdmin()">Add fixture →</button></div></article>`;
 const week=document.getElementById("fixtureWeek");
 week.innerHTML=`<button class="week-nav" type="button" data-week-shift="-7" aria-label="Previous week">‹</button>${Array.from({length:7},(_,i)=>{const day=new Date(displayedWeek);day.setDate(day.getDate()+i);const active=dateKey(day)===dateKey(selectedFixtureDate);const matchesForDay=data.matches.filter(match=>!Number.isNaN(new Date(match.date).getTime())&&dateKey(startOfDay(new Date(match.date)))===dateKey(day));const leaguesForDay=[...new Set(matchesForDay.map(matchLeague))];const leagueText=leaguesForDay.length?`${leaguesForDay.length} league${leaguesForDay.length===1?"":"s"}`:"No leagues";return `<button type="button" data-week-date="${dateKey(day)}" class="${active?"active":""}" aria-pressed="${active}" aria-label="${day.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}: ${leaguesForDay.join(", ")||"no leagues"}" title="${esc(leaguesForDay.join(", ")||"No leagues scheduled")}"><span>${day.toLocaleDateString(undefined,{weekday:"long"})}</span>${day.getDate()}<small>${esc(leagueText)}</small></button>`;}).join("")}<button class="week-nav" type="button" data-week-shift="7" aria-label="Next week">›</button>`;
 document.querySelectorAll("#fixtureQuickFilters button").forEach(button=>button.classList.toggle("active",button.dataset.range===fixtureFilter));
 const leagueFilter=document.getElementById("fixtureLeagueFilter").value;
 const clubFilter=document.getElementById("fixtureClubFilter").value;
 let list=data.matches.filter(match=>{
  const matchDate=new Date(match.date);
  if(Number.isNaN(matchDate.getTime()))return fixtureFilter==="all";
  const matchDay=startOfDay(matchDate),todayStart=startOfDay(new Date());
  const offset=Math.round((matchDay-todayStart)/86400000);
  if(fixtureFilter==="day"&&dateKey(matchDay)!==dateKey(selectedFixtureDate))return false;
  if(fixtureFilter==="yesterday"&&offset!==-1)return false;
  if(fixtureFilter==="today"&&offset!==0)return false;
  if(fixtureFilter==="tomorrow"&&offset!==1)return false;
  if(fixtureFilter==="upcoming"&&(offset<0||!["Scheduled","Live"].includes(match.status)))return false;
  if(fixtureFilter==="live"&&match.status!=="Live")return false;
  if(fixtureFilter==="results"&&match.status!=="Finished")return false;
  if(leagueFilter!=="all"&&matchLeague(match)!==leagueFilter)return false;
  if(clubFilter==="following"&&!data.followedClubIds.some(id=>id===Number(match.homeId)||id===Number(match.awayId)))return false;
  return true;
 }).sort((a,b)=>new Date(a.date)-new Date(b.date));
 const heading=fixtureFilter==="day"?selectedFixtureDate.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}):({today:"Today",yesterday:"Yesterday",tomorrow:"Tomorrow",live:"Live matches",upcoming:"All upcoming",results:"Results",all:"All matches"}[fixtureFilter]||"Fixtures");
 const groupedMatches=[...new Set(list.map(matchLeague))].map(league=>({league,matches:list.filter(match=>matchLeague(match)===league)}));
 document.getElementById("fixtureList").innerHTML=list.length?`<p class="muted">${esc(heading)} · ${list.length} match${list.length===1?"":"es"} · ${groupedMatches.length} league${groupedMatches.length===1?"":"s"}</p>`+groupedMatches.map(group=>`<section class="fixture-league-group"><h3>${leagueLogo(group.league)?`<img class="fixture-league-logo" src="${esc(leagueLogo(group.league))}" alt="">`:""}${esc(group.league)}</h3>${group.matches.map(m=>`<div class="fixture-row"><div class="fixture-date">${esc(fmtDate(m.date))}</div><div class="fixture-match">${esc(clubName(m.homeId))} <span class="muted">vs</span> ${esc(clubName(m.awayId))}</div><div class="fixture-score">${m.homeScore!==""&&m.homeScore!=null?esc(m.homeScore)+" – "+esc(m.awayScore):"—"}</div><span class="fixture-status">${esc(m.status)}</span></div>`).join("")}</section>`).join(""):`<div class="fixture-row"><div class="fixture-date">No matches</div><div class="fixture-match">${clubFilter==="following"&&!data.followedClubIds.length?"Follow clubs in the league list to see their fixtures here.":`No matches for ${esc(heading.toLowerCase())} with the selected filters.`}</div><div></div><span class="fixture-status">Awaiting data</span></div>`;
}
function renderNews(){document.getElementById("newsGrid").innerHTML=data.news.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6).map(n=>`<article class="news-card"><div class="news-visual">MISSION<br>FOOTBALL</div><div class="news-body"><span class="news-category">${esc(n.category)}</span><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p><small class="muted">${esc(fmtDate(n.date))}</small></div></article>`).join("");}
function renderAll(){renderClubs();renderLeagueLogo();renderStandings();renderAssociations();renderMatches();renderNews();}
let adminTabAfterLogin="clubForm";
function showAdminTab(tabId){
 document.querySelectorAll(".admin-tab").forEach(button=>button.classList.toggle("active",button.dataset.adminTab===tabId));
 document.querySelectorAll(".admin-form").forEach(form=>form.hidden=form.id!==tabId);
}
function openAdmin(tabId="clubForm"){
 adminTabAfterLogin=tabId;
 document.getElementById("adminModal").hidden=false;
 if(!document.getElementById("dashboardPanel").hidden)showAdminTab(tabId);
}
window.openAdmin=openAdmin;
document.getElementById("openAdmin").addEventListener("click",openAdmin);
document.getElementById("manageClubsButton").addEventListener("click",openAdmin);
document.getElementById("updateResultsButton").addEventListener("click",()=>openAdmin("matchForm"));
document.getElementById("enterPreviousStandingsButton").addEventListener("click",()=>openAdmin("initialStandingsForm"));
document.getElementById("closeAdmin").addEventListener("click",()=>document.getElementById("adminModal").hidden=true);
document.getElementById("adminModal").addEventListener("click",e=>{if(e.target.id==="adminModal")e.currentTarget.hidden=true;});
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("mainNav").classList.remove("open")));
document.getElementById("fixtureQuickFilters").addEventListener("click",e=>{
 const button=e.target.closest("button[data-range]");
 if(!button)return;
 fixtureFilter=button.dataset.range;
 if(["today","yesterday","tomorrow"].includes(fixtureFilter)){
  selectedFixtureDate=startOfDay(new Date());
  selectedFixtureDate.setDate(selectedFixtureDate.getDate()+({yesterday:-1,today:0,tomorrow:1}[fixtureFilter]));
  displayedWeek=weekMonday(selectedFixtureDate);
 }
 renderMatches();
});
document.getElementById("fixtureWeek").addEventListener("click",e=>{
 const nav=e.target.closest("button[data-week-shift]");
 if(nav){
  const shift=Number(nav.dataset.weekShift);
  displayedWeek.setDate(displayedWeek.getDate()+shift);
  if(fixtureFilter==="day")selectedFixtureDate.setDate(selectedFixtureDate.getDate()+shift);
  renderMatches();
  return;
 }
 const day=e.target.closest("button[data-week-date]");
 if(day){const [year,month,date]=day.dataset.weekDate.split("-").map(Number);selectedFixtureDate=new Date(year,month-1,date);fixtureFilter="day";renderMatches();}
});
document.getElementById("fixtureLeagueFilter").addEventListener("change",renderMatches);
document.getElementById("fixtureClubFilter").addEventListener("change",renderMatches);
document.getElementById("clubGrid").addEventListener("click",e=>{
 const button=e.target.closest("button[data-follow-club]");
 if(!button)return;
 const id=Number(button.dataset.followClub);
 data.followedClubIds=data.followedClubIds.includes(id)?data.followedClubIds.filter(clubId=>clubId!==id):[...data.followedClubIds,id];
 save();
});
function resetLeagueForm(){
 document.getElementById("leagueForm").reset();
 document.getElementById("leagueToEdit").value="";
 document.getElementById("saveLeagueButton").textContent="Add league";
 document.getElementById("deleteLeagueButton").disabled=true;
 document.getElementById("removeSingleLeagueLogoButton").disabled=true;
 preservedLeagueLogo="";
 document.getElementById("leagueFormLogoPreview").textContent="LG";
}
let preservedLeagueLogo="";
let pendingLeagueLogo="";
function selectLeagueForEdit(name){
 document.getElementById("leagueToEdit").value=name;
 document.getElementById("leagueName").value=name;
 const logo=leagueLogo(name);
 preservedLeagueLogo=logo.startsWith("data:")?logo:"";
 document.getElementById("leagueLogoUrlInput").value=preservedLeagueLogo?"":logo;
 document.getElementById("leagueLogoFileInput").value="";
 const preview=document.getElementById("leagueFormLogoPreview");
 preview.innerHTML=logo?`<img src="${esc(logo)}" alt="${esc(name)} logo preview">`:esc(initials(name));
 document.getElementById("saveLeagueButton").textContent="Update league";
 document.getElementById("deleteLeagueButton").disabled=false;
 document.getElementById("removeSingleLeagueLogoButton").disabled=!logo;
}
document.getElementById("leagueList").addEventListener("click",e=>{
 const button=e.target.closest("button[data-edit-league]");
 if(button)selectLeagueForEdit(button.dataset.editLeague);
});
document.getElementById("leagueToEdit").addEventListener("change",e=>{
 if(e.target.value)selectLeagueForEdit(e.target.value);
 else resetLeagueForm();
});
document.getElementById("newLeagueButton").addEventListener("click",()=>{
 resetLeagueForm();
 document.getElementById("adminMessage").textContent="";
});
document.getElementById("leagueForm").addEventListener("submit",e=>{
 e.preventDefault();
 const name=document.getElementById("leagueName").value.trim();
 if(!name)return;
 const previousName=document.getElementById("leagueToEdit").value;
 const logoUrl=document.getElementById("leagueLogoUrlInput").value.trim();
 const logoFile=document.getElementById("leagueLogoFileInput").files[0];
 if(leagueOptions().some(league=>league.toLocaleLowerCase()===name.toLocaleLowerCase()&&league!==previousName)){
  document.getElementById("adminMessage").textContent="That league is already in the list.";
  return;
 }
 if(logoFile&&!logoFile.type.startsWith("image/")){
  document.getElementById("adminMessage").textContent="Choose a valid image file for the league logo.";
  return;
 }
 if(logoFile&&logoFile.size>1024*1024){
  document.getElementById("adminMessage").textContent="League logo files must be 1 MB or smaller.";
  return;
 }
 const setLogo=logo=>{if(logo)data.leagueLogos[name]=logo;else delete data.leagueLogos[name];};
 const saveLeague=()=>{
  if(previousName&&previousName!==name){
   data.leagues=data.leagues.filter(league=>league!==previousName);
   if(!data.leagues.includes(name))data.leagues.push(name);
   data.clubs.forEach(club=>{if(club.association===previousName)club.association=name;});
   data.matches.forEach(match=>{if(match.league===previousName)match.league=name;});
    data.initialStandings.forEach(entry=>{if(entry.league===previousName)entry.league=name;});
   if(data.leagueLogos[previousName]&&!data.leagueLogos[name])data.leagueLogos[name]=data.leagueLogos[previousName];
   delete data.leagueLogos[previousName];
   document.getElementById("adminMessage").textContent=`${previousName} updated to ${name}.`;
  }else if(!previousName){
   data.leagues.push(name);
   document.getElementById("adminMessage").textContent=`${name} added to the league list.`;
  }else document.getElementById("adminMessage").textContent=`${name} updated.`;
  if(logoFile||logoUrl)setLogo(logoFile?pendingLeagueLogo:logoUrl);
  else if(!previousName)setLogo("");
  if(!save())return;
  const savedName=name;
  resetLeagueForm();
  selectLeagueForEdit(savedName);
 };
 if(logoFile){
  const reader=new FileReader();
  reader.onload=()=>{pendingLeagueLogo=String(reader.result);saveLeague();};
  reader.onerror=()=>{console.error("Could not read league logo.",reader.error);document.getElementById("adminMessage").textContent="Could not read the league logo. Choose another image.";};
  reader.readAsDataURL(logoFile);
  return;
 }
 setLogo(logoUrl||preservedLeagueLogo);
 saveLeague();
});
document.getElementById("leagueLogoFileInput").addEventListener("change",e=>{
 const file=e.target.files[0];
 if(!file)return;
 if(!file.type.startsWith("image/")||file.size>1024*1024)return;
 const reader=new FileReader();
 reader.onload=()=>{document.getElementById("leagueFormLogoPreview").innerHTML=`<img src="${esc(String(reader.result))}" alt="Selected league logo preview">`;};
 reader.readAsDataURL(file);
});
document.getElementById("removeSingleLeagueLogoButton").addEventListener("click",()=>{
 const name=document.getElementById("leagueToEdit").value;
 if(!name)return;
 delete data.leagueLogos[name];
 if(!save())return;
 selectLeagueForEdit(name);
 document.getElementById("adminMessage").textContent=`Logo removed from ${name}.`;
});
document.getElementById("deleteLeagueButton").addEventListener("click",()=>{
 const name=document.getElementById("leagueToEdit").value;
 if(!name)return;
 const clubs=data.clubs.filter(club=>club.association===name);
 const matches=data.matches.filter(match=>match.league===name);
 const fallback=leagueOptions().find(league=>league!==name)||(name==="South Sudan Premier League"?"Unassigned League":"South Sudan Premier League");
 if(!confirm(`Delete ${name}? ${clubs.length} club(s) and ${matches.length} fixture(s) will be reassigned to ${fallback}; the clubs and fixtures will be kept.`))return;
 if(!data.leagues.includes(fallback))data.leagues.push(fallback);
 data.leagues=data.leagues.filter(league=>league!==name);
 delete data.leagueLogos[name];
 clubs.forEach(club=>{club.association=fallback;});
 matches.forEach(match=>{match.league=fallback;});
 const movedStandings=data.initialStandings.filter(entry=>entry.league===name);
 data.initialStandings=data.initialStandings.filter(entry=>entry.league!==name);
 movedStandings.forEach(entry=>{
  const existing=data.initialStandings.find(item=>item.league===fallback&&Number(item.clubId)===Number(entry.clubId));
  if(existing)Object.assign(existing,entry,{league:fallback});
  else data.initialStandings.push({...entry,league:fallback});
 });
 if(!save())return;
 resetLeagueForm();
 document.getElementById("adminMessage").textContent=`${name} deleted. Its clubs and fixtures were kept under ${fallback}.`;
});
document.getElementById("assignClubButton").addEventListener("click",()=>{
 const club=data.clubs.find(item=>item.id===Number(document.getElementById("leagueClubSelect").value));
 const league=document.getElementById("leagueAssignSelect").value;
 if(!club||!league)return;
 const previous=club.association;
 club.association=league;
 if(!save())return;
 document.getElementById("adminMessage").textContent=`${club.name} added to ${league}${previous===league?" (already assigned).":"."}`;
});
document.getElementById("loginForm").addEventListener("submit",e=>{e.preventDefault();const u=document.getElementById("adminUsername").value,p=document.getElementById("adminPassword").value;if(u==="admin"&&p==="Mission2026!"){document.getElementById("loginPanel").hidden=true;document.getElementById("dashboardPanel").hidden=false;document.getElementById("loginError").textContent="";renderClubs();resetClubForm();showAdminTab(adminTabAfterLogin);adminTabAfterLogin="clubForm";}else document.getElementById("loginError").textContent="Incorrect demo username or password.";});
document.getElementById("logoutAdmin").addEventListener("click",()=>{document.getElementById("dashboardPanel").hidden=true;document.getElementById("loginPanel").hidden=false;document.getElementById("adminPassword").value="";});
document.querySelectorAll(".admin-tab").forEach(b=>b.addEventListener("click",()=>showAdminTab(b.dataset.adminTab)));
document.getElementById("clubToEdit").addEventListener("change",e=>{selectClubForEdit(e.target.value);document.getElementById("adminMessage").textContent="";});
document.getElementById("newClubButton").addEventListener("click",()=>{resetClubForm();document.getElementById("adminMessage").textContent="";});
document.getElementById("removeClubLogoButton").addEventListener("click",()=>{preservedClubLogo="";document.getElementById("clubLogo").value="";document.getElementById("clubLogoFile").value="";document.getElementById("adminMessage").textContent="Logo cleared. Save the club to apply this change.";});
document.getElementById("clubForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const name=document.getElementById("clubName").value.trim();
 if(!name)return;
 const association=document.getElementById("clubAssociation").value;
 let logo=document.getElementById("clubLogo").value.trim();
 const selectedId=document.getElementById("clubToEdit").value;
 const file=document.getElementById("clubLogoFile").files[0];
 if(!logo&&!file)logo=preservedClubLogo;
 if(file){
  if(!file.type.startsWith("image/")){document.getElementById("adminMessage").textContent="Choose a valid image file for the club logo.";return;}
  if(file.size>1024*1024){document.getElementById("adminMessage").textContent="Logo files must be 1 MB or smaller.";return;}
  try{logo=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error||new Error("Logo file could not be read."));reader.readAsDataURL(file);});}
  catch(error){console.error("Could not read club logo.",error);document.getElementById("adminMessage").textContent="Could not read the logo image. Choose another file.";return;}
 }
 let club;
 if(selectedId){
  club=data.clubs.find(c=>String(c.id)===selectedId);
  if(!club){document.getElementById("adminMessage").textContent="That club no longer exists. Select another club.";resetClubForm();return;}
  if(club.association!==association)data.initialStandings.forEach(entry=>{if(Number(entry.clubId)===Number(club.id)&&entry.league===club.association)entry.league=association;});
  Object.assign(club,{name,association,logo,short:initials(name)});
 }else{
  club=data.clubs.find(c=>/update name/.test(c.name));
  if(club)Object.assign(club,{name,association,logo,short:initials(name)});
  else{club={id:Math.max(0,...data.clubs.map(c=>c.id))+1,name,association,logo,short:initials(name)};data.clubs.push(club);}
 }
 if(!save())return;
 document.getElementById("clubToEdit").value=String(club.id);
 selectClubForEdit(String(club.id));
 document.getElementById("adminMessage").textContent=selectedId?"Club updated.":"Club saved.";
});
document.getElementById("leagueLogoForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const url=document.getElementById("leagueLogoUrl").value.trim();
 const file=document.getElementById("leagueLogoFile").files[0];
 if(file){
  if(!file.type.startsWith("image/")){document.getElementById("adminMessage").textContent="Choose a valid image file for the league logo.";return;}
  if(file.size>1024*1024){document.getElementById("adminMessage").textContent="League logo files must be 1 MB or smaller.";return;}
  try{data.leagueLogo=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error||new Error("League logo could not be read."));reader.readAsDataURL(file);});}
  catch(error){console.error("Could not read the league logo.",error);document.getElementById("adminMessage").textContent="Could not read the logo image. Choose another file.";return;}
 }else if(url)data.leagueLogo=url;
 if(!save())return;
 document.getElementById("leagueLogoUrl").value="";
 document.getElementById("leagueLogoFile").value="";
 document.getElementById("adminMessage").textContent="League logo saved.";
});
document.getElementById("removeLeagueLogoButton").addEventListener("click",()=>{
 data.leagueLogo="";
 if(save())document.getElementById("adminMessage").textContent="League logo removed.";
});
document.getElementById("removeClubButton").addEventListener("click",()=>{
 const id=Number(document.getElementById("clubToEdit").value);
 const club=data.clubs.find(c=>c.id===id);
 if(!club)return;
 const linkedMatches=data.matches.filter(m=>Number(m.homeId)===id||Number(m.awayId)===id).length;
 const linkedPlayers=data.players.filter(p=>Number(p.clubId)===id).length;
 if(!confirm(`Remove ${club.name}? This will also remove ${linkedMatches} linked match(es) and ${linkedPlayers} player(s) assigned to this club.`))return;
 data.clubs=data.clubs.filter(c=>c.id!==id);
 data.matches=data.matches.filter(m=>Number(m.homeId)!==id&&Number(m.awayId)!==id);
 data.players=data.players.filter(p=>Number(p.clubId)!==id);
 data.followedClubIds=data.followedClubIds.filter(clubId=>clubId!==id);
 data.initialStandings=data.initialStandings.filter(entry=>Number(entry.clubId)!==id);
 if(!save())return;
 resetClubForm();
 document.getElementById("adminMessage").textContent="Club removed.";
});
function resetMatchForm(){
 document.getElementById("matchForm").reset();
 document.getElementById("matchToEdit").value="";
 document.getElementById("saveMatchButton").textContent="Save fixture";
}
function selectMatchForEdit(id){
 const match=data.matches.find(item=>String(item.id)===id);
 if(!match){resetMatchForm();return;}
 document.getElementById("matchToEdit").value=String(match.id);
 document.getElementById("matchLeague").value=matchLeague(match);
 document.getElementById("homeTeam").value=String(match.homeId);
 document.getElementById("awayTeam").value=String(match.awayId);
 document.getElementById("matchDate").value=localDateTimeValue(match.date);
 document.getElementById("matchStatus").value=match.status;
 document.getElementById("homeScore").value=match.homeScore??"";
 document.getElementById("awayScore").value=match.awayScore??"";
 document.getElementById("saveMatchButton").textContent="Update match";
}
document.getElementById("matchToEdit").addEventListener("change",e=>selectMatchForEdit(e.target.value));
document.getElementById("newMatchButton").addEventListener("click",resetMatchForm);
document.getElementById("standingsLeagueFilter").addEventListener("change",renderStandings);
document.getElementById("initialStandingsLeague").addEventListener("change",renderInitialStandingsForm);
document.getElementById("initialStandingsClub").addEventListener("change",loadInitialStandingsEntry);
document.getElementById("initialGoalsFor").addEventListener("input",updateInitialGoalDifference);
document.getElementById("initialGoalsAgainst").addEventListener("input",updateInitialGoalDifference);
document.getElementById("initialStandingsForm").addEventListener("submit",e=>{
 e.preventDefault();
 const league=document.getElementById("initialStandingsLeague").value;
 const clubId=Number(document.getElementById("initialStandingsClub").value);
 const club=data.clubs.find(item=>item.id===clubId&&item.association===league);
 if(!club){document.getElementById("adminMessage").textContent="Choose a club assigned to the selected league.";return;}
 const fields={played:"initialPlayed",won:"initialWon",draw:"initialDraw",lost:"initialLost",gf:"initialGoalsFor",ga:"initialGoalsAgainst",pts:"initialPoints"};
 const values={};
 for(const [stat,id] of Object.entries(fields)){
  const value=Number(document.getElementById(id).value);
  if(!Number.isSafeInteger(value)||value<0){document.getElementById("adminMessage").textContent="Enter whole numbers of zero or higher for all table totals.";return;}
  values[stat]=value;
 }
 const entry={league,clubId,...values};
 const index=data.initialStandings.findIndex(item=>item.league===league&&Number(item.clubId)===clubId);
 if(index<0)data.initialStandings.push(entry);
 else data.initialStandings[index]=entry;
 if(!save())return;
 document.getElementById("adminMessage").textContent=`Starting standings saved for ${club.name}. New finished match results will be added to these totals.`;
});
document.getElementById("clearInitialStandingsButton").addEventListener("click",()=>{
 const league=document.getElementById("initialStandingsLeague").value;
 const clubId=Number(document.getElementById("initialStandingsClub").value);
 const club=data.clubs.find(item=>item.id===clubId&&item.association===league);
 if(!club)return;
 data.initialStandings=data.initialStandings.filter(item=>item.league!==league||Number(item.clubId)!==clubId);
 if(!save())return;
 document.getElementById("adminMessage").textContent=`Starting stats cleared for ${club.name}.`;
});
function updateInitialGoalDifference(){
 const gf=Number(document.getElementById("initialGoalsFor").value)||0;
 const ga=Number(document.getElementById("initialGoalsAgainst").value)||0;
 document.getElementById("initialGoalDifference").value=gf-ga;
}
document.getElementById("matchForm").addEventListener("submit",e=>{
 e.preventDefault();
 const homeId=Number(document.getElementById("homeTeam").value),awayId=Number(document.getElementById("awayTeam").value);
 if(homeId===awayId){alert("Choose two different clubs.");return;}
 const status=document.getElementById("matchStatus").value;
 const homeScore=document.getElementById("homeScore").value,awayScore=document.getElementById("awayScore").value;
 if(status==="Finished"&&(homeScore===""||awayScore==="")){alert("Enter both scores for a finished match.");return;}
 const scores=[homeScore,awayScore].filter(value=>value!=="");
 if(scores.some(value=>!Number.isInteger(Number(value))||Number(value)<0)){alert("Scores must be whole numbers of zero or higher.");return;}
 const selectedId=document.getElementById("matchToEdit").value;
 const matchData={homeId,awayId,date:document.getElementById("matchDate").value,league:document.getElementById("matchLeague").value,status,homeScore,awayScore};
 if(selectedId){
  const match=data.matches.find(item=>String(item.id)===selectedId);
  if(!match){document.getElementById("adminMessage").textContent="That match no longer exists. Select another match.";resetMatchForm();return;}
  Object.assign(match,matchData);
 }else data.matches.push({id:Date.now(),...matchData});
 if(!save())return;
 resetMatchForm();
 document.getElementById("adminMessage").textContent=selectedId?"Match updated. Standings recalculated automatically.":"Fixture/result saved. Standings recalculated automatically.";
});
document.getElementById("playerForm").addEventListener("submit",e=>{e.preventDefault();data.players.push({id:Date.now(),name:document.getElementById("playerName").value.trim(),clubId:Number(document.getElementById("playerClub").value),position:document.getElementById("playerPosition").value,number:document.getElementById("playerNumber").value});save();e.target.reset();document.getElementById("adminMessage").textContent="Player saved.";});
document.getElementById("newsForm").addEventListener("submit",e=>{e.preventDefault();data.news.push({id:Date.now(),title:document.getElementById("newsTitle").value.trim(),category:document.getElementById("newsCategory").value,summary:document.getElementById("newsSummary").value.trim(),date:new Date().toISOString()});save();e.target.reset();document.getElementById("adminMessage").textContent="News published.";});
document.getElementById("exportData").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="m-missionfootball-data.json";a.click();URL.revokeObjectURL(a.href);});
function doSearch(){const q=document.getElementById("searchInput").value.trim().toLowerCase(),out=document.getElementById("searchResults");if(!q){out.innerHTML="";return;}const items=[...data.clubs.map(c=>({title:c.name,type:"Club"})),...data.players.map(p=>({title:p.name,type:"Player · "+clubName(p.clubId)})),...data.news.map(n=>({title:n.title,type:"News · "+n.category}))].filter(x=>(x.title+" "+x.type).toLowerCase().includes(q));out.innerHTML=items.length?items.slice(0,12).map(x=>`<div class="search-result"><strong>${esc(x.title)}</strong><span class="muted"> — ${esc(x.type)}</span></div>`).join(""):`<div class="search-result">No results found.</div>`;}
document.getElementById("searchButton").addEventListener("click",doSearch);document.getElementById("searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")doSearch();});
document.getElementById("year").textContent=new Date().getFullYear();
renderAll();
fetch("/api/health").catch(()=>{});
