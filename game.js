import {inject} from '@vercel/analytics';
import {selection} from './selection.js';
import {events,packs} from './client-catalog.js';
import {dailyOnly,modeAllowed} from './features.js';
import {dailyDay,dailyStart,playDay} from './daily-clock.js';

// Initialize Vercel Web Analytics
inject();

const app=document.querySelector('#app');
const dialog=document.querySelector('#panel');
dialog.remove();
const siteRoot=new URL('./',import.meta.url);
const sitePath=path=>new URL(path.slice(1),siteRoot).pathname;
const requestedRoute=('/'+location.pathname.slice(siteRoot.pathname.length)).replace(/\/$/,'')||'/';
// Old Unlimited, Archive, Packs and Party links open the Daily Dive while those modes are paused.
const route=dailyOnly?'/':requestedRoute;
const endless=route==='/unlimited/classic';
const day=dailyDay();
// Saves forwarded from the old GitHub Pages address (pages-redirect/index.html). Only taken from that
// referrer, and only into a browser with nothing saved here yet, so a crafted link can't overwrite a save.
if(location.hash.startsWith('#carry=')){
 try{
  const fresh=!Object.keys(localStorage).some(key=>key.startsWith('scioly-'));
  if(fresh&&document.referrer.startsWith('https://lightningale23.github.io/'))for(const [key,value] of Object.entries(JSON.parse(decodeURIComponent(location.hash.slice(7)))))if(key.startsWith('scioly-')&&typeof value==='string')localStorage.setItem(key,value);
 }catch{}
 history.replaceState(null,'',location.pathname+location.search);
}
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem('scioly-'+key))??fallback}catch{return fallback}};
const save=(key,value)=>{try{localStorage.setItem('scioly-'+key,JSON.stringify(value))}catch{}};
const preferences=read('settings',{sound:false,scan:true,color:'#4de3ff'});
let seed, firstEvent, dive, receipts, profile, timer, round=0, score=0, answers=[], session=[], mode='', state='home', deadline=0;
const chip=(url,label)=>'<a class="chip" href="'+sitePath(url)+'">'+label+'</a>';
const button=(label,action,cls='small')=>'<button class="'+cls+'" data-action="'+action+'">'+label+'</button>';
const help='Each dive visits seven Division C events, with one prompt written from each event\u2019s 2027 rules. Find one accepted answer per event in 25 seconds. Retry missed guesses while the clock runs, and submit a suggested spelling again to confirm it. Answers earn 10, 30, 60, 85, or 100 points by rarity, and each point sinks you 10 meters. The answers an event specialist knows sink deepest. Skip anytime and review the full answer list after each event.';
// Dates shown to players are the dates a Daily is played on (playDay), not its day number.
const diveDate=d=>new Date(playDay(d)*86400000).toLocaleDateString(undefined,{timeZone:'UTC',weekday:'short',month:'short',day:'numeric'});
// Daily dives roll over at midnight Pacific time. Every [data-countdown] element ticks down to the next one.
const untilNext=()=>{const ms=dailyStart(day+1)-Date.now();if(ms<=0)return '00:00:00';const t=Math.floor(ms/1000);return [t/3600,t/60%60,t%60].map(n=>String(Math.floor(n)).padStart(2,'0')).join(':')};
setInterval(()=>{for(const el of document.querySelectorAll('[data-countdown]'))el.textContent=untilNext()},1000);
const shownDate=iso=>/^\d{4}-\d\d-\d\d$/.test(iso)?new Date(playDay(Date.parse(iso+'T00:00:00Z')/86400000)*86400000).toISOString().slice(0,10):iso;
const countdown=()=>'<p class="nextDive">NEXT DIVE IN <b data-countdown>'+untilNext()+'</b></p>';
const escapeText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

const tierNames={10:'Plankton',15:'Too Clever',30:'Schooler',60:'Rare',85:'Deep Cut',100:'One in a Krillion'};
// The Pages build ships prompts only; each row names a JSON file with its scored answers, fetched once
// when a dive starts (or when old results are reviewed). Rows that already carry a bank are used as is.
const decodeBank=rows=>rows.map(([canonical,aliases,points,fact])=>({canonical,aliases,points,...(fact&&{fact})}));
function loadBank(item){
 if(!item||item.bank)return Promise.resolve(item?.bank);
 if(!item.file)return Promise.resolve();
 return item.loading??=fetch(new URL(item.file,import.meta.url)).then(response=>{
   if(!response.ok)throw new Error('Answer list unavailable');
   return response.json();
 }).then(rows=>item.bank=decodeBank(rows)).catch(error=>{item.loading=undefined;throw error});
}
async function api(body){
 if(document.documentElement.hasAttribute('data-static-game')){
   const [{guestApi}]=await Promise.all([import('./guest-api.js'),loadBank(session?.[round])]);
   return guestApi(body,session?.[round]);
 }
 const response=await fetch('/api/dive',body?{
   method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
   signal:AbortSignal.timeout(18000)
 }:{signal:AbortSignal.timeout(6000)});
 const result=await response.json();
 if(!response.ok)throw new Error(result.error);
 return result;
}

const packScenes=['🌿','🪐','⚡','💧','💎'];
const crew=['Puffer','Skate','Squid','Angler','Crab','Nautilus','Jelly','Ray','Isopod'];

function partyPreview(){
 const disabledButtons=labels=>labels.map(label=>'<button class="small" disabled>'+label+'</button>').join('');
 return `<section class="partyPreview">
   <div class="partyIntro"><div class="wordmark" aria-hidden="true">SCIOKRILLION</div><h1>PUFFER PARTY</h1><p>Practice together in a future update.</p><p>Take turns naming an answer and passing the puffer before time runs out.</p><div class="partyFish" role="img" aria-label="Pufferfish">🐡</div></div>
   <div class="partyLayout">
    <div class="partyForms">
     <section class="partyPanel"><div class="partyHeading"><h2>WHO'S PLAYING</h2><h3><button class="small" data-panel="party-help">HOW TO PLAY</button></h3></div>
      <label for="partyName">YOUR NAME</label><input id="partyName" placeholder="Name your diver" disabled>
      <ul class="crew">${crew.map((name,i)=>`<li><span aria-hidden="true">${['🐡','🐟','🦑','🐠','🦀','🐚','🪼','🌊','🦐'][i]}</span>${name}</li>`).join('')}</ul>
     </section>
     <section class="partyPanel"><h2>PLAY NOW</h2><div class="partyChoices">${disabledButtons(['1v1','3 players','4–6','8–10'])}</div></section>
     <div class="partyChoices"><section class="partyPanel"><h2>HOST</h2><button class="small" disabled>Create lobby</button></section><section class="partyPanel"><h2>JOIN BY CODE</h2><button class="small" disabled>Join room</button></section></div>
     <label for="roomCode">ROOM CODE</label><input id="roomCode" placeholder="Enter a code" disabled>
    </div>
    <section class="partyPanel publicRooms"><h2>PUBLIC ROOMS</h2><p>Public lobbies will appear here when multiplayer opens.</p>${chip('/','← TODAY’S DIVE')}</section>
   </div>
 </section>`;
}

function home(){
 state='home';
 document.body.classList.toggle('surface',route==='/'||endless);
 if(route==='/archive'){
   app.innerHTML='<section class="center archive"><div class="sigil" role="img" aria-label="Dive history">⟲</div><h1>THE DIVE ARCHIVE</h1><a class="action archiveAction" href="'+sitePath('/unlimited/classic')+'">OPEN UNLIMITED ∞</a><p>Practice across seven events in the ocean or revisit a past dive here on this device.</p><details><summary>Browse past dives</summary><ul>'+[1,2,3,4,5,6,7].map(i=>'<li>'+button(new Date(playDay(day-i)*86400000).toISOString().slice(0,10),'archive-'+i).replace('<button ', '<button aria-label="Start '+new Date(playDay(day-i)*86400000).toISOString().slice(0,10)+' dive" ')+'</li>').join('')+'</ul></details></section>';
 }else if(route==='/packs'){
   app.innerHTML='<div class="packs"><div class="packHeader"><h1 class="wordmark">SCIOKRILLION</h1><p class="eyebrow">THEMED PACKS · BEYOND THE DAILY DIVE</p></div><div class="cards">'+packs.map(([title,desc,icon,color],i)=>'<button class="card" data-action="pack-'+i+'" style="--accent:'+color+'">'+(i===0?'<span class="packBanner">OPEN PRACTICE <small>Start here with the field notebook</small></span>':'')+'<span class="art art-'+i+'" role="img" aria-label="'+title+' illustration">'+packScenes[i]+'</span><span class="cardText"><strong>'+title+'</strong><small>'+desc+'</small><em>START PRACTICE →</em></span></button>').join('')+'</div><section class="packLinks"><div><h2>Past dives</h2><p>Take another dive and review your answers.</p></div>'+chip('/archive','ARCHIVE ⟲')+'<div><h2>Unlimited practice</h2><p>Start another seven-event dive.</p></div>'+chip('/unlimited/classic','UNLIMITED ∞')+'</section><div class="packReturn">'+chip('/','← TODAY’S DIVE')+'</div></div>';
 }else if(route==='/party'){
   app.innerHTML=partyPreview();
 }else{
   const completed=!endless&&read('daily-'+day,null);
   app.innerHTML='<section class="hero"><h1 class="wordmark">SCIOKRILLION</h1><h2>'+(endless?'THE ENDLESS DIVE':'THE DAILY DIVE')+'</h2>'+(endless?'':'<p class="diveDate">'+escapeText(diveDate(day).toUpperCase())+'</p>')+'<p>7 events · 25 seconds each · rarer answers sink deeper</p></section><section class="launch"><div class="disclosure">'+(endless?button('OPEN THE DIVE LOG ∞','log','logToggle'):'<details class="inlineHelp"><summary>HOW TO PLAY</summary><div class="helpCard"><p>'+help+'</p><ol class="helpSteps"><li>Read the event prompt.</li><li>Type one answer or skip the round.</li><li>Review examples and continue your descent.</li></ol></div></details>')+'<span class="depthLabel">0m · SURFACE ZONE</span></div><div class="launchNote">Sperm whales hunt giant squid in deep water below the surface zone.</div>'+(!endless&&!dailyOnly?'<a class="partyLink" href="'+sitePath('/party')+'"><span role="img" aria-label="Pufferfish">🐡</span> PUFFER PARTY <small>PREVIEW</small></a>':'')+button(completed?'VIEW TODAY’S RESULTS':'▼ BEGIN DESCENT ▼',completed?'today-results':'start','action start')+(completed?countdown():'')+'<div class="foot"><span>'+(endless?'ENDLESS PRACTICE':'2027 RULES · DIVISION C · GRADES 9\u201312')+'</span>'+(dailyOnly?'':'<ul class="links" aria-label="Practice modes"><li>'+chip('/archive','ARCHIVE ⟲')+'</li>'+(endless?'<li>'+chip('/','TODAY’S DIVE')+'</li>':'<li>'+chip('/packs','THEMED PACKS')+'</li><li>'+chip('/unlimited/classic','UNLIMITED ∞')+'</li>')+'</ul>')+'</div></section>';

 }
 draw();
}

function begin(diveSeed,kind,first){
 if(!modeAllowed(kind))return;
 clearInterval(timer);
 state='play'; mode=kind; score=0; round=0; answers=[]; receipts=[];
 seed=diveSeed; firstEvent=first; dive=crypto.randomUUID();
 session=Array.from({length:7},(_,i)=>{
   const [eventIndex,index]=selection(events,seed,i,first,kind);
   const [event,questions]=events[eventIndex];
   const item=questions[index];
   return typeof item==='string'?{event,prompt:item}:{event,...item};
 });
 // Start fetching all seven answer lists now, so judging an answer never waits on the network.
 for(const item of session)loadBank(item).catch(()=>{});
 document.body.classList.remove('surface');
 play();
}
// One line of color for each tier on the reveal card and the results key.
const tierLines={10:'The whole ocean thought of this one.',15:'A sideways answer that still counts.',30:'Swimming with the crowd.',60:'Few divers make it down this far.',85:'Barely any light reaches here.',100:'The answer hidden at the very bottom.'};
// Event types from the rules manual's Event Type Descriptions, shown as badges like the rules' symbols.
const eventTypes={'Anatomy & Physiology':'Core Knowledge',Astronomy:'Core Knowledge',Boomilever:'Build',Botany:'Core Knowledge','Chemistry Lab':'Lab','Circuit Lab':'Lab',Codebusters:'Core Knowledge','Designer Genes':'Core Knowledge','Disease Detectives':'Core Knowledge','Dynamic Planet':'Core Knowledge','Electric Vehicle':'Build','Engineering CAD':'Lab','Experimental Design':'Lab',Forensics:'Lab',Hovercraft:'Build','Mission Possible':'Build','Ping Pong Parachute':'Build','Protein Modeling':'Hybrid','Remote Sensing':'Core Knowledge','Rocks & Minerals':'Core Knowledge',Thermodynamics:'Hybrid','Water Quality':'Hybrid','Wright Stuff':'Build'};
const typeBadge=(event,short)=>{const type=eventTypes[event];if(!type)return '';const key=type.split(' ')[0].toLowerCase();return '<span class="typeBadge" data-type="'+key+'" title="'+type+' event">'+(short?key:type)+'</span>'};
// Tournament-style award for a finished dive, matched to the score bands on the results key.
const medalFor=points=>points>=450?['gold','Gold medal','🥇']:points>=351?['silver','Silver medal','🥈']:points>=251?['bronze','Bronze medal','🥉']:points>=151?['ribbon','Honorable mention','🎗️']:['ribbon','Participation ribbon','🎗️'];
const tierColors={0:'#9aaac1',10:'#a8c3df',15:'#ffca77',30:'#57e3ee',60:'#ff709f',85:'#c1a2ff',100:'#ffe588'};

function diveHud(){
 const marks=session.map((_,i)=>{
   const color=i<answers.length?tierColors[answers[i].points/10]:null;
   return `<i class="${i===round?'current':''}" ${color?'style="background:'+color+'"':''}></i>`;
 }).join('');
 return `<div class="diveHud">
   <div class="gauge"><small>DEPTH</small><b>${score.toLocaleString()} m</b></div>
   <div class="roundTrack"><div aria-hidden="true">${marks}</div>EVENT ${round+1} OF 7</div>
   <div class="gauge"><small>SCORE</small><b>${score/10}</b></div>
 </div>`;
}

function play(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const arrival=reduced?0:3000;
 const readyAt=Date.now()+arrival;
 state=arrival?'descending':'play';
 deadline=readyAt+25000;
 const {event,prompt}=session[round];
 const [question,wordRule]=prompt.split('\n');
 app.innerHTML=`<section class="diveScreen playing">${diveHud()}
   <div class="seaLife" aria-hidden="true"><i></i><i></i><i></i></div>
   <div class="promptStage"><article class="promptCard"><p class="event">EVENT ${round+1} OF 7 · ${event} ${typeBadge(event)}</p><h1>${question}</h1>
   ${wordRule?`<p class="wordRule">${wordRule}</p>`:''}<small>▼ rarer answers sink deeper ▼</small></article></div>
   <span class="srOnly timeWarning" aria-live="polite"></span>
   <div class="arrivalNotice" role="status" ${arrival?'':'hidden'}></div>
   <form class="answerDock" ${arrival?'hidden':''}><output class="guessFeedback" aria-live="polite"></output><span id="clock" role="timer" aria-label="Seconds remaining">25</span>
     <div class="inputMeter"><input class="answer" maxlength="100" required aria-label="Your answer" placeholder="Type one answer…" autocomplete="off"><div id="fill"></div></div>
     <button class="diveSubmit" type="submit">DIVE</button><button class="dockSkip" type="button" data-action="skip">Skip</button>
   </form></section>`;
 app.querySelector('form').onsubmit=e=>{e.preventDefault(); const answer=e.currentTarget.querySelector('input').value.trim(); if(answer)submit(answer)};
 const clock=document.querySelector('#clock'),fill=document.querySelector('#fill');
 const screen=app.querySelector('.diveScreen'),notice=app.querySelector('.arrivalNotice');
 function tick(){
   const now=Date.now();
   if(state==='descending'){
     if(now<readyAt){
       const seconds=Math.ceil((readyAt-now)/1000);
       if(notice.dataset.seconds!==String(seconds)){notice.dataset.seconds=seconds;notice.innerHTML='Descending · the clock starts in <b>'+seconds+'</b>'}
       return;
     }
     state='play';notice.hidden=true;app.querySelector('form').hidden=false;
     if(matchMedia('(pointer:fine)').matches)app.querySelector('input').focus();
     draw();
   }
   const left=Math.max(0,deadline-now);
   if(left<=5000 && !screen.classList.contains('urgent')){
     screen.classList.add('urgent');
     screen.querySelector('.timeWarning').textContent='Five seconds left';
   }
   clock.textContent=Math.ceil(left/1000);
   clock.style.setProperty('--remaining',left/250+'%');
   fill.style.width=left/250+'%';
   if(!left && state!=='skipping')submit('');
 }
 timer=setInterval(tick,75);
 if(!arrival && matchMedia('(pointer:fine)').matches)app.querySelector('input').focus();
 // The first round's surface-to-depth transition is painted every animation frame, eased, rather than
 // on the 75 ms clock tick, which made it stutter at about 13 frames a second.
 if(arrival&&round===0){
   const began=performance.now(),thisDive=dive;
   const frame=now=>{
     if(state!=='descending'||dive!==thisDive||round!==0)return;
     const t=Math.min(1,(now-began)/Math.min(arrival,2200)),eased=t<.5?4*t*t*t:1-(-2*t+2)**3/2;
     draw(score,1-eased);
     if(t<1)requestAnimationFrame(frame);
   };
   draw(score,1);
   requestAnimationFrame(frame);
 }else draw();
 tick();
}
async function submit(answer){
 if(state!=='play' && !(state==='checking' && !answer))return;
 if(Date.now()>=deadline)answer='';
 const question=session[round], activeDive=dive, activeRound=round;
 const form=app.querySelector('form'),input=form.querySelector('input'),feedback=form.querySelector('output');
 state=answer?'checking':'skipping';
 if(!answer)clearInterval(timer);
 input.readOnly=true;
 form.querySelector('[type=submit]').disabled=true;
 feedback.className='guessFeedback';
 feedback.textContent=answer?'Checking…':'';
 let verdict;
 try{
   verdict=await api({action:'validate',seed,round,mode,first:firstEvent,dive,answer,prompt:question.prompt});
 }catch{
   verdict={status:answer?'unverified':'skipped',points:0,examples:[]};
 }
 if(dive!==activeDive || round!==activeRound || state!==(answer?'checking':'skipping'))return;
 if(verdict.status==='catalog_changed'){
   clearInterval(timer);
   state='outdated';
   form.innerHTML='<p role="status">The questions have been updated. Reload to start this dive with the current set.</p><button class="diveSubmit" type="button">Reload dive</button>';
   form.querySelector('button').onclick=()=>location.reload();
   return;
 }
 if(answer && verdict.status!=='valid'){
   state='play';
   if(Date.now()>=deadline){submit('');return;}
   input.readOnly=false;
   form.querySelector('[type=submit]').disabled=false;
   if(verdict.suggestion){
     feedback.innerHTML='<s>'+escapeText(answer)+'</s> → <strong>'+escapeText(verdict.suggestion)+'</strong><small>submit again to confirm · or edit</small>';
     input.value=verdict.suggestion;
   }else{
     feedback.textContent=verdict.status==='unverified'?'Could not verify that answer. Try another.':'No echo on the sonar. Try another answer.';
     (question.misses??=new Set()).add(answer);
     feedback.classList.add('miss');
     input.select();
   }
   input.focus();
   return;
 }
 clearInterval(timer);
 state='reveal';
 const meters=verdict.points*10;
 score+=meters;
 receipts.push(verdict.receipt);
 answers.push({bank:question.bank??verdict.bank,event:question.event,prompt:question.prompt,answer,points:meters,label:verdict.canonical||answer||undefined,judged:verdict.judged||undefined,status:verdict.status});
 tone(meters>0?500:190);
 // Answers accepted by the AI judge (not on the list) say so, since no editor rated them.
 const outcome=meters?tierNames[verdict.points]+(verdict.judged?' · AI-checked':''):verdict.status==='unverified'?'Could not verify':answer?'Not accepted':Date.now()>=deadline?'Time’s up':'Round skipped';
 const examples=verdict.examples.map(escapeText).join(' · ');
 app.innerHTML=`<section class="diveScreen" style="--rarity:${tierColors[verdict.points]}">${diveHud()}
   ${meters?`<div class="sinkingGuess" aria-hidden="true">${escapeText(answer)}</div>`:''}
   <div class="revealStage"><div class="revealCard" role="status">
     <div class="catchMark" aria-hidden="true"><span>${({10:'✧',15:'✶',30:'🐟',60:'🪸',85:'🐙',100:'🦐'})[verdict.points]||'◇'}</span><i></i><i></i><i></i></div>
     <p class="event">${question.event} ${typeBadge(question.event)}</p><h1>${outcome}</h1>
     ${answer?`<p class="catchAnswer">“${escapeText(answer)}”</p>`:''}
     <p class="catchDistance">+${verdict.points} PTS <span>·</span> sink ${meters.toLocaleString()} m</p>
     ${meters?`<p class="catchLine">${tierLines[verdict.points]}</p>`:''}
     ${verdict.fact?`<p class="catchFact"><b>Fun fact</b>${escapeText(verdict.fact)}</p>`:''}
     ${examples?`<details class="catchExamples"><summary>Example answers</summary>${examples}</details>`:''}
     ${question.misses?.size?`<details class="missedGuess"><summary>Suggest a missing answer</summary><p>Open a GitHub draft to review and send.</p>${[...question.misses].map(guess=>{
       const query=new URLSearchParams({title:'Missing answer: '+guess,body:'Event: '+question.event+'\nPrompt: '+question.prompt+'\nAnswer to review: '+guess});
       return '<a class="chip" target="_blank" rel="noopener noreferrer" href="https://github.com/lightningale23/scioly-dive/issues/new?'+escapeText(query.toString())+'">'+escapeText(guess)+' ↗</a>';
     }).join(' ')}</details>`:''}
   </div></div>
   <div class="descendDock">${button(round===6?'SURFACE FOR RESULTS ↑':'DESCEND ▼','next','descend')}</div></section>`;
 app.querySelector('[data-action=next]').focus();
 // The answer drops onto the depth marker (see .sinkingGuess), then the sea scrolls past it. Each tier's
 // line is drawn at its depth below the starting point, so the line that comes to rest under the
 // answer is the tier it earned. Lines stay up briefly after the descent, until the answer fades.
 const began=performance.now(), previous=score-meters, completedRound=round;
 const DROP=260, SINK=950, HOLD=300;
 function descendFrame(now){
   if(state!=='reveal'||dive!==activeDive||round!==completedRound)return;
   const elapsed=now-began, progress=Math.min(1,Math.max(0,(elapsed-DROP)/SINK));
   const eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;
   const depth=Math.round(previous+meters*eased);
   app.querySelector('.gauge b').textContent=depth.toLocaleString()+' m';
   const showLines=elapsed<DROP+SINK+HOLD;
   draw(depth,0,showLines?previous:null);
   if(showLines)requestAnimationFrame(descendFrame);
 }
 if(meters&&!matchMedia('(prefers-reduced-motion: reduce)').matches)requestAnimationFrame(descendFrame);
 else draw();
}
function renderCatch(rounds){
 const list=app.querySelector('#catches');
 for(const [index,roundResult] of rounds.entries()){
   const {prompt,event,answer,label,status,points,judged}=roundResult;
   const item=document.createElement('details');
   item.name='catch-round';
   const scored=points/10;
   // Older saved results kept no text for AI-accepted answers (listed answers always have a label).
   const shown=answer||label||(status==='valid'?'AI-checked answer':status==='unverified'?'Unverified':'Skipped');
   item.innerHTML=`<summary style="--ink:${tierColors[scored]||tierColors[0]}"><span>${index+1}</span><span><small>${escapeText(event)} · ${escapeText(prompt)}</small><b>${escapeText(shown)}${judged?'<i class="aiTag"> · AI-checked</i>':''}</b></span><strong>${scored} pts</strong></summary>`;
   list.append(item);
   item.addEventListener('toggle',async()=>{
     if(!item.open||item.querySelector('.catchPanel'))return;
     const panel=document.createElement('div');panel.className='catchPanel';item.append(panel);
     const catalog=events.find(([name])=>name===event)?.[1];
     const row=catalog?.find(entry=>entry.prompt===prompt);
     let bank=roundResult.bank;
     if(!bank){panel.textContent='Loading answers…';bank=await loadBank(row).catch(()=>undefined)}
     if(!bank){panel.textContent='The answer list for this saved version is unavailable.';return}
     const rows=[...bank];
     if(status==='valid'&&answer&&!label&&!rows.some(row=>row.canonical===answer)){
       rows.push({canonical:answer,aliases:[],points:scored});
     }
     const order=new Intl.Collator('en',{numeric:true});
     rows.sort((a,b)=>b.points-a.points||order.compare(a.canonical,b.canonical));
     const tiers=[...new Set(rows.map(row=>row.points))].sort((a,b)=>b-a);
     const krill=rows.find(row=>row.points===100);
     panel.innerHTML=`${krill?`<p class="catchFact"><b>One in a Krillion: ${escapeText(krill.canonical)}</b>${krill.fact?escapeText(krill.fact):''}</p>`:''}<div class="catchTabs" role="group" aria-label="Filter by rarity"><button type="button" data-tier="all" aria-pressed="true">All ${rows.length}</button>${tiers.map(n=>`<button type="button" data-tier="${n}" aria-pressed="false" style="--ink:${tierColors[n]}">${tierNames[n]} ${rows.filter(row=>row.points===n).length}</button>`).join('')}</div>
       <input type="search" aria-label="Search answers for prompt ${index+1}" placeholder="Search all answers…">
       <ul class="catchList" tabindex="0" aria-label="Accepted answers"></ul><small role="status"></small>`;
     const input=panel.querySelector('input'),results=panel.querySelector('ul'),count=panel.lastElementChild;
     let tier='all';
     const fold=text=>text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim();
     let matches=[],shown=0;
     function appendPage(){
       const page=matches.slice(shown,shown+100);
       results.insertAdjacentHTML('beforeend',page.map(row=>`<li style="--ink:${tierColors[row.points]}"><span>${escapeText(row.canonical)}${row.canonical===(label||answer)?'<em>Your catch</em>':''}</span><b>+${row.points}</b></li>`).join(''));
       shown+=page.length;
       count.textContent=matches.length?shown+' of '+matches.length+' matches'+(shown<matches.length?' · Scroll for more':''):'No matching answers';
     }
     function filter(){
       const find=fold(input.value);
       matches=rows.filter(row=>(tier==='all'||row.points===Number(tier))&&[row.canonical,...row.aliases].some(name=>fold(name).includes(find)));
       shown=0;results.replaceChildren();results.scrollTop=0;appendPage();
     }
     results.onscroll=()=>{if(shown<matches.length&&results.scrollTop+results.clientHeight>=results.scrollHeight-24)appendPage()};
     panel.querySelector('.catchTabs').onclick=e=>{
       const button=e.target.closest('button');if(!button)return;
       tier=button.dataset.tier;
       for(const tab of panel.querySelectorAll('button'))tab.setAttribute('aria-pressed',String(tab===button));
       filter();
     };
     input.oninput=filter;filter();
   });
 }
}

function results(result){
 const dailyLabel=result.mode==='Daily'&&result.date?'Daily · '+diveDate(Date.parse(result.date+'T00:00:00Z')/86400000):result.mode;
 state='results'; score=result.score; document.body.classList.remove('surface');
 const points=result.score/10;
 const bands=[[0,150,'Plankton','Still in the sunlit shallows.'],[151,250,'Schooler','Cruising with the school.'],[251,350,'Rare','Into the twilight zone.'],[351,449,'Deep Cut','Down in the midnight zone.'],[450,700,'One in a Krillion','Scraping the abyssal floor.']];
 const marks=result.answers.map((entry,i)=>{
   const pts=entry.points/10;
   return `<div class="logCast" title="${escapeText(entry.event)} · ${pts} points" style="--drop:${pts}%;--ink:${tierColors[pts]||tierColors[0]}"><i></i><small>${i+1}</small><span class="srOnly">Prompt ${i+1}: ${pts} points</span></div>`;
 }).join('');
 const savedScores=read('log',[]).map(entry=>entry.score/10);
 const bins=Array.from({length:14},()=>0);
 for(const n of savedScores)if(Number.isFinite(n)&&n>=0&&n<=700)bins[Math.min(13,Math.floor(n/50))]++;
 const peak=Math.max(1,...bins);
 app.innerHTML=`<section class="diveResults report"><div class="reportHead"><b>SCIOKRILLION</b><span>${escapeText(dailyLabel)} · DIVE COMPLETE</span></div>
   <div class="scoreLine"><h1>${points} <small>−${result.score.toLocaleString()} m</small></h1><div class="medal" data-medal="${medalFor(points)[0]}" role="img" aria-label="${medalFor(points)[1]}"><i aria-hidden="true"></i><span>${medalFor(points)[1].toUpperCase()}</span></div></div>
   <p>${result.answers.filter(a=>a.points).length} of 7 scored${result.streak?' · '+result.streak+'-day streak':''}</p>
   <div class="localScores" role="img" aria-label="Your last ${savedScores.length} scores on this device. This dive scored ${points} out of 700.">
     ${bins.map(count=>`<i style="height:${count/peak*85}%"></i>`).join('')}
     <b style="left:${points/7}%"></b></div><div class="axisLabels"><span>0</span>YOUR RECENT DIVES<span>700 PTS</span></div>
   <p id="percentile" role="status">${result.global&&result.count>1?'Deeper than '+result.percentile+'% of today’s divers.':''}</p>
   <h2>DIVE LOG <small>DEEPER = RARER</small></h2><div class="logChart"><div class="chartTicks" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>${marks}</div>
   <h2>THE BEARING</h2><ul class="bearings">${bands.map(([lo,hi,name,line])=>`<li class="${points>=lo&&points<=hi?'earned':''}"><small>${hi===700?'450+':lo+'–'+hi}</small><span>${name}. <i>${line}</i></span><em class="bandMedal" data-medal="${medalFor(lo)[0]}">${medalFor(lo)[1]}</em></li>`).join('')}</ul>
   <div class="row reportActions">${button('COPY RESULT','copy','diveSubmit')}${button('SHARE…','share')}</div>
   <p id="shareStatus" role="status"></p>${result.mode==='Daily'?countdown():''}
   <section class="catchBook"><h2>THE CATCH <small>Tap a prompt for every answer</small></h2><div id="catches"></div></section>
   <div class="row reportActions">${dailyOnly?'':chip('/unlimited/classic','KEEP DIVING →')+chip('/archive','ARCHIVE ⟲')}${chip('/','DAILY DIVE')}</div></section>`;
 renderCatch(result.answers);
 // One square per round, colored by rarity tier, so a shared result shows how deep each catch was.
 // It matches the site's tier colors. Emoji has no gray square, so Plankton uses the light one.
 const tierSquares={0:'⬛',10:'⬜',15:'🟧',30:'🟦',60:'🟥',85:'🟪',100:'🟨'};
 const summary='ScioKrillion · '+dailyLabel.replace(' · ',' Dive · ')+'\n'+medalFor(points)[2]+' '+points+' pts · '+result.score.toLocaleString()+' m deep\n'+result.answers.map(a=>tierSquares[a.points/10]??'⬛').join('')+'\n'+siteRoot.href;
 const status=document.querySelector('#shareStatus');
 const copy=async()=>{try{await navigator.clipboard.writeText(summary);status.textContent='Result copied.'}catch{status.textContent=summary}};
 app.querySelector('[data-action=copy]').onclick=copy;
 app.querySelector('[data-action=share]').onclick=async()=>{
   if(!navigator.share){await copy();return}
   try{await navigator.share({text:summary})}catch(error){if(error.name!=='AbortError')await copy()}
 };
 draw();
}
function tone(frequency){
 if(!preferences.sound)return;
 try{const context=new AudioContext(), osc=context.createOscillator(),gain=context.createGain();osc.frequency.value=frequency;gain.gain.value=.06;osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(context.currentTime+.13);osc.onended=()=>context.close()}catch{}
}

function panel(name){
 document.querySelectorAll('header [aria-expanded]').forEach(control=>control.setAttribute('aria-expanded',String(control.dataset.panel===name)));
 const allMenu=[['↓','DAILY DIVE','/'],['∞','UNLIMITED','/unlimited/classic'],['≈','PUFFER PARTY','/party'],['⟲','ARCHIVE','/archive'],['▦','THEMED PACKS','/packs'],['♟','WARDROBE','wardrobe'],['⚙','SETTINGS','settings'],['?','HOW TO PLAY','help'],['≋','DIVE LOG','log']];
 const menu=allMenu.filter(([,,target])=>!dailyOnly||!target.startsWith('/')||target==='/');
 dialog.dataset.view=name;
 let content='';
 if(name==='menu')content='<div class="eyebrow">DIVE IN ─────────────</div><nav class="grid" aria-label="Main menu">'+menu.map(([icon,label,target])=>target.startsWith('/')?'<a class="tile '+(route===target?'active':'')+'" href="'+sitePath(target)+'"><span>'+icon+'</span>'+label+'</a>':'<button class="tile" data-panel="'+target+'"><span>'+icon+'</span>'+label+'</button>').join('')+'</nav>';
 if(name==='settings')content='<div class="options"><label><input type="checkbox" data-pref="sound" '+(preferences.sound?'checked':'')+'> Sound effects</label><label><input type="checkbox" data-pref="scan" '+(preferences.scan?'checked':'')+'> Scanlines</label></div>';
 if(name==='wardrobe')content='<p>Choose a color for your research vessel.</p><div class="grid">'+[['#4de3ff','Cyan'],['#ff5d8f','Pink'],['#ffe08a','Gold'],['#bfa7ff','Violet']].map(([color,label])=>'<button class="tile '+(preferences.color===color?'active':'')+'" data-color="'+color+'"><span style="color:'+color+'">◆</span>'+label+'</button>').join('')+'</div>';
 if(name==='help')content='<p>'+help+'</p><ol class="helpSteps"><li>Read the event prompt.</li><li>Type one answer or skip the round.</li><li>Review examples and continue your descent.</li></ol>';
 if(name==='party-help')content='<p>Name an answer from the prompt, then pass the puffer to the next diver. Multiplayer is coming in a future update.</p>';
 if(name==='log'){const log=read('log',[]);content=log.length?'<ol>'+log.map(item=>'<li>'+shownDate(item.date)+' · '+item.mode+' · '+item.score+'m</li>').join('')+'</ol>':'<p>Finished dives will appear here on this device.</p>'}
 if(name==='account')content='<div id="accountStatus" role="status">Loading account?</div>';
 dialog.innerHTML='<form method="dialog"><button class="small close" aria-label="Close dialog">×</button></form><div class="eyebrow">SCIOKRILLION</div><h2 id="panelTitle">'+({'help':'HOW TO PLAY','party-help':'HOW TO PLAY','log':'DIVE LOG'}[name]||(name==='menu'?'Menu':name.toUpperCase()))+'</h2>'+content;
 dialog.setAttribute('aria-labelledby','panelTitle');
 if(!dialog.isConnected)document.body.append(dialog);
 if(!dialog.open)dialog.showModal();
 if(name==='account')showAccount();
}
async function showAccount(){
 const target=dialog.querySelector('#accountStatus');
 try{profile=await api()}catch{target.textContent='Account service unavailable.';return}
 if(!target.isConnected)return;
 if(profile.signedIn){
   target.innerHTML='<p>Signed in</p>'+button('SIGN OUT','signout')+'<h3>Synced dives</h3><ul>'+profile.history.map(item=>'<li>'+escapeText(shownDate(item.date))+' ? '+escapeText(item.mode)+' ? '+item.score+'m</li>').join('')+'</ul>'+(profile.packs.length?'<p>Unlocked packs: '+profile.packs.map(escapeText).join(', ')+'</p>':'');
 }else if(profile.available){
   target.innerHTML='<form id="accountForm"><label>Username <input name="username" autocomplete="username" required></label><label>Password <input name="password" type="password" minlength="12" maxlength="128" required></label><div class="row"><button class="small" value="signin">SIGN IN</button><button class="small" value="register">CREATE ACCOUNT</button></div></form><p id="accountError" role="status"></p>';
   const form=target.querySelector('form');
   form.onsubmit=async event=>{
     event.preventDefault();
     const {username,password}=Object.fromEntries(new FormData(form));
     const action=event.submitter?.value||'signin';
     for(const button of form.querySelectorAll('button'))button.disabled=true;
     try{await api({action,username,password});showAccount()}
     catch(error){
       target.querySelector('#accountError').textContent=error.message;
       for(const button of form.querySelectorAll('button'))button.disabled=false;
     }
   };
 }else target.textContent='Guest play is available. Accounts are unavailable on this server.';
}
async function finish(){
 const completedSeed=seed, completedDive=dive;
 const result={score,answers,mode,date:new Date((mode==='Daily'?seed:day)*86400000).toISOString().slice(0,10)};
 const saved={...result,answers:answers.map(({answer,bank,...entry})=>document.documentElement.hasAttribute('data-static-game')?entry:{...entry,bank})};
 if(mode==='Daily'){
   const previous=read('streak',null);
   result.streak=saved.streak=previous?.day===seed?previous.count:previous?.day===seed-1?previous.count+1:1;
   save('streak',{day:seed,count:result.streak});
   save('daily-'+seed,saved);
 }
 const logEntry={...saved,answers:saved.answers.map(({bank,...entry})=>entry)};
 save('log',[logEntry,...read('log',[])].slice(0,25));
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   state='surfacing';
   app.innerHTML='<div class="surfaceNotice" role="status">Surfacing with your results…</div>';
   await new Promise(resolve=>setTimeout(resolve,650));
 }
 results(result);
 if(!receipts.every(Boolean))return;
 try{
   const stats=await api({action:'complete',receipts});
   if(result.mode==='Daily'){
     Object.assign(saved,stats);
     save('daily-'+completedSeed,saved);
     const status=app.querySelector('#percentile');
     if(dive===completedDive&&status&&stats.global&&stats.count>1)status.textContent='Deeper than '+stats.percentile+'% of today’s divers.';
   }
 }catch{}
}
function updatePrefs(){
 save('settings',preferences);
 document.querySelector('.scan').hidden=!preferences.scan;
 document.querySelector('#sound').textContent=preferences.sound?'◀))':'◀×';
 document.querySelector('#sound').setAttribute('aria-pressed',preferences.sound);
 draw();
}
document.addEventListener('click',e=>{
 const control=e.target.closest('button');
 if(!control)return;
 if(control.dataset.panel)panel(control.dataset.panel);
 if(control.dataset.color){preferences.color=control.dataset.color;updatePrefs();panel('wardrobe')}
 if(control.id==='sound'){preferences.sound=!preferences.sound;updatePrefs();tone(480)}
 const action=control.dataset.action;
 if(!action)return;
 if(action==='log')panel('log');
 if(action==='start')begin(endless?Math.floor(Math.random()*100001):day,endless?'Unlimited':'Daily');
 if(action==='today-results'){const result=read('daily-'+day,null);if(result)results(result)}
 if(action==='skip')submit('');
 if(action==='signout'){
   control.disabled=true;
   api({action:'signout'}).then(showAccount).catch(()=>{control.disabled=false});
 }
 if(action.startsWith('archive-'))begin(day-Number(action.slice(8)),'Archive');
 if(action.startsWith('pack-')){const i=Number(action.slice(5));begin(day+i,packs[i][0],packs[i][4])}
 if(action==='next'&&state==='reveal'){
   round++;
   if(round<7){play();return}
   finish();
 }
});
dialog.addEventListener('close',()=>{
 dialog.remove();
 document.querySelectorAll('header [aria-expanded]').forEach(control=>control.setAttribute('aria-expanded','false'));
});
dialog.addEventListener('change',e=>{if(e.target.dataset.pref){preferences[e.target.dataset.pref]=e.target.checked;updatePrefs()}});
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

// Sun and pixel clouds never move, so they are painted once per viewport size into an offscreen
// layer instead of thousands of fillRect calls on every animation frame.
let skyCache=null;
function skyLayer(w,h){
 if(skyCache?.w===w&&skyCache?.h===h)return skyCache.canvas;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d');
 const rect=(x,y,a,b,color)=>{g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),Math.ceil(a),Math.ceil(b))};
 const pixel=w<=540?4:w<=768?7:10;
 const sunX=w*.84,sunY=w<=540?h*.426:w<=768?h*.26:0;
 for(let y=-7;y<=7;y++){const side=Math.floor(Math.sqrt(57-y*y));rect(sunX-side*pixel,sunY+y*pixel,(side*2+1)*pixel,pixel,'#f5db8f')}
 const cloud=['       ###          ','     #######        ','   ###########      ','  ##############    ',' #################  ','####################','  #######   ######  '];
  const positions=w<=540?[[.11,.26],[.72,.28],[.10,.41],[.53,.415],[.37,.46],[-.12,.46],[.84,.46]]:w<=768?[[.11,-.03],[.71,-.02],[.10,.23],[.40,.33],[-.09,.32],[.84,.32]]:[[.10,-.013],[.53,-.04],[.37,.105],[-.09,.105],[.85,.105]];
 positions.forEach(([x,y],i)=>cloud.forEach((row,j)=>[...row].forEach((cell,k)=>{if(cell==='#')rect(w*x+k*pixel*(i%3===0?1.65:1.25),h*y+j*pixel,pixel*(i%3===0?1.65:1.25),pixel,j<4?'#f4f8f5':'#dde9e9')})));
 skyCache={w,h,canvas};
 return canvas;
}

function draw(displayDepth=score,arrival=0,descentStart=null){
 const canvas=document.querySelector('#scene');
 const w=innerWidth,h=innerHeight;
 if(canvas.width!==w)canvas.width=w;
 if(canvas.height!==h)canvas.height=h;
 const g=canvas.getContext('2d');
 const homeSurface=document.body.classList.contains('surface');
 const atBoat=state!=='home' && state!=='results' && displayDepth<80;
 if(state==='results'){
   g.fillStyle='#060b16';g.fillRect(0,0,w,h);
   return;
 }
 const surface=homeSurface||atBoat||arrival>0;
 const water=h*(w<=540?.576:w<=768?.553:.545)*(homeSurface?1:Math.max(0,1-displayDepth/80)*.36+arrival*.64);
 const rect=(x,y,a,b,color)=>{g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),Math.ceil(a),Math.ceil(b))};
 const gradient=(top,bottom,stops)=>{const grad=g.createLinearGradient(0,top,0,bottom);for(const [point,color] of stops)grad.addColorStop(point,color);return grad};
 if(surface){
   g.fillStyle=gradient(0,water,[[0,w>768?'#93b9cf':'#54a5ce'],[.55,'#9ecfe0'],[1,'#e7f1ef']]);g.fillRect(0,0,w,water+8);
   g.drawImage(skyLayer(w,h),0,0);
   const s=w<=540?2:w<=768?4:7,x=w*.25,y=water-16*s/2+5;
   const boat=['          P         ','        ffP         ','      ffffP         ','       fffP         ','          P         ','          P         ','          P         ','       PPPPPPPP     ','        P b bP      ','        P b bP  PPPP',' PP     PPPPPPPPPPP ','PPPPPPPPPPPPPPPPPPP ',' PPPPPPPPPPPPPPPPP  '];
   boat.forEach((line,j)=>[...line].forEach((c,k)=>{if(c!==' ')rect(x+k*s,y+(j-6)*s,s,s,c==='P'?'#101e2a':c==='f'?'#ff5d8f':'#7dabb9')}));
   g.fillStyle=gradient(water-5,h,[[0,'#24577f'],[endless?.19:.08,'#12233d'],[endless?.34:.20,'#091423'],[1,'#09111c']]);
   g.beginPath();g.moveTo(0,water);for(let a=0;a<=w+5;a+=5)g.lineTo(a,water+Math.sin(a/53)*2+Math.cos(a/93)*3);g.lineTo(w,h);g.lineTo(0,h);g.fill();
   g.strokeStyle='#7d93b84d';g.beginPath();const ruler=w-Math.max(14,(w-1052)/2+6);g.moveTo(ruler,water);g.lineTo(ruler,h*.9);for(let y=water;y<h*.9;y+=20){g.moveTo(ruler-6,y);g.lineTo(ruler,y)}g.stroke();
   g.font='11px monospace';g.fillStyle='#7d93b8';g.fillText('0m',ruler-30,water+2);
 }else{
   const diving=state!=='home';
   const depth=diving?displayDepth:0;
   const shallow=diving && depth<200;
   g.fillStyle=gradient(0,h,[[0,shallow?'#397491':depth>=1000?'#0b1829':'#102b41'],[.55,shallow?'#16405c':'#0b1827'],[1,'#050b16']]);g.fillRect(0,0,w,h);
   if(diving){
     // Overlapping polygonal shelves darken as the sub moves below the shelf.
     for(const side of [0,1]){
       const edge=side?w:0, dir=side?-1:1;
       const height=h*(depth<200?.29:Math.min(1,.5+depth/4900));
       const count=9, pitch=height/count,span=Math.min(w*.18,210);
       for(let j=0;j<count;j++){
         const y=h-height+j*pitch,curve=.5+.5*Math.sin(side*4+j*2.4);
         const reach=span*(.12+.55*j/count+.35*curve);
         const facet=(vertices,color)=>{
           g.beginPath();vertices.forEach(([x,v],i)=>g[i?'lineTo':'moveTo'](edge+dir*x,y+v*pitch));
           g.closePath();g.fillStyle=color;g.fill();
         };
         facet([[0,-.4],[reach*.6,-.25],[reach,.06],[reach*.86,.72],[reach*.37,1.08],[0,1.2]],j%2?'#101c2c':'#122031');
         facet([[0,-.4],[reach*.6,-.25],[reach,.06],[reach*.54,-.06],[0,-.19]],'#1a2938');
         facet([[reach,.06],[reach*.86,.72],[reach*.37,1.08],[reach*.64,.53]],'#0a1320');
         if(depth>=2400 && j%3===side){
           rect(edge+dir*reach*.42,y+pitch*.35,4,4,j%2?'#377783':'#6b3957');
         }
       }
     }
     if(depth>=200){
       g.font='11px monospace';g.fillStyle='#608495';
       g.fillText(depth>=4000?'ABYSSAL ZONE':depth>=1000?'MIDNIGHT ZONE':'TWILIGHT ZONE',Math.min(w*.08,54),h*.62);
     }
     const zero=Math.floor(depth/100)*100;
     const step=Math.max(46,h*.12), marker=h*.42;
     g.font='11px monospace';g.textAlign='right';
     for(let i=-5;i<7;i++){
       const value=zero+100*i,y=marker+(value-depth)*step/100;
       if(value<0||y<65||y>h-60)continue;
       rect(w-12,y,12,1,'#647e94');g.fillStyle='#93a8be';g.fillText(value+' m',w-17,y+3);
     }
     if(descentStart!==null){
       g.save();
       for(const [points,label] of Object.entries(tierNames).filter(([points])=>points!=='15')){
         const y=marker+(descentStart+Number(points)*10-depth)*step/100;
         if(y<70||y>h-75)continue;
         g.strokeStyle=tierColors[points];g.globalAlpha=.55;g.setLineDash([3,5]);
         g.beginPath();g.moveTo(w*.17,y);g.lineTo(w*.83,y);g.stroke();
         g.fillStyle=tierColors[points];g.fillText(label.toUpperCase()+' · '+points,w*.83,y-5);
       }
       g.restore();
     }
     rect(w-14,marker,14,2,'#ff709f');
     g.textAlign='left';
   }
 }
 if(surface||state!=='home'){
   for(let i=0;i<115;i++){const x=((i*2333+92)%997)/997*w,y=(surface?water:0)+((i*2657+59)%991)/991*(surface?h-water:h);rect(x,y,i%5===0?2:1,i%5===0?2:1,i%7===0?'#78bce852':'#468bb52b')}
   if(surface){const x=w*.66,y=water+h*.11;rect(x,y,11,5,'#5d1938');rect(x+7,y+5,9,7,'#47152f');rect(x+6,y+12,8,4,'#421d38');rect(x,y+15,8,3,'#45142c')}
   if(state!=='home'){const x=Math.max(26,w*.14),y=h*(.15+Math.min(displayDepth,7000)/9800);rect(x,y,28,9,preferences.color);rect(x+6,y-5,10,5,preferences.color);rect(x-5,y+2,5,5,preferences.color);rect(x+17,y+2,4,4,'#101d33')}
 }
}
// Coalesce resize bursts into one repaint per frame.
let resizeQueued=false;
window.addEventListener('resize',()=>{if(resizeQueued)return;resizeQueued=true;requestAnimationFrame(()=>{resizeQueued=false;draw()})});
home();
updatePrefs();



