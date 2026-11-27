import {expandedGroups} from './coverage.js';
import {selection} from './selection.js';
import { events } from './prompts.js';

export const tiers = [10, 15, 30, 60, 85, 100];
export const tierNames = { 10: 'Plankton', 15: 'Too Clever', 30: 'Schooler', 60: 'Rare', 85: 'Deep Cut', 100: 'One in a Krillion' };
import { normalize } from './matching.js';
import { familiarity } from './catalog-data/familiarity.js';
import { factFor as factLookup } from './catalog-data/krillion-facts.js';
import { obviousAnswers } from './catalog-data/obvious-answers.js';
export { normalize };

// Corpus familiarity (wordfreq Zipf scale, see scripts/familiarity.mjs). Like Krillion, the tier is
// fixed before anyone plays: the game knows which answers are obvious, and everything else sinks.
// Scores use the canonical name: aliases are often everyday words with other meanings ("hammer" for
// malleus), and one- or two-letter names (symbols, "Go", "R") are capped for the same reason.
const zipf=name=>{const key=normalize(name),z=familiarity[key]??0;return key.length<3?Math.min(z,3):z};
// Tier sizes follow the size of the whole answer list, the way they do in a real crowd: a handful of
// answers stay obvious however long the list gets, so obvious answers are a large share of a short list
// and a tiny share of a list of thousands (Krillion's ~0.5% Plankton and ~5% Schooler come from lists of
// over a thousand answers). For a list of n answers:
//   Plankton ~ 1.1 ln n   (5 of 100, 8 of 1,500, 10 of 10,000)
//   Schooler ~ 1.6 sqrt n (16 of 100, 62 of 1,500, 160 of 10,000)
//   Rare     ~ a third of the list, taken next in order of familiarity, if the corpus knows the word
// Everything else is a Deep Cut. Answers are ranked by corpus familiarity; an editor's obvious list,
// where one exists, replaces the Plankton and Schooler picks so homonyms ("Go", "Red") never count as obvious.
export function tierSizes(n){
  return {plankton:Math.max(1,Math.round(1.1*Math.log(Math.max(n,2)))),schooler:Math.round(1.6*Math.sqrt(n)),rare:Math.round(n/3)};
}
function familiarityTiers(entries,bank,obvious){
  // Hand-rated answers count toward each quota; listed obvious answers come next; the corpus fills the
  // rest unless the list says its names double as everyday words (third element true).
  const size=bank.length, quota=tierSizes(size);
  for(const entry of bank){if(entry.points===10)quota.plankton--;else if(entry.points===30)quota.schooler--;else if(entry.points===60)quota.rare--;}
  const tiers=new Map(), ranked=entries.map(entry=>({entry,z:zipf(entry.canonical)})).sort((a,b)=>b.z-a.z);
  const [listed10,listed30]=(obvious??['','']).slice(0,2).map(list=>new Set(list.split(';').map(name=>normalize(name)).filter(Boolean)));
  for(const {entry} of ranked){
    const key=normalize(entry.canonical);
    if(listed10.has(key)){tiers.set(entry,10);quota.plankton--}
    else if(listed30.has(key)){tiers.set(entry,30);quota.schooler--}
  }
  let open=ranked.filter(item=>!tiers.has(item.entry));
  if(!obvious?.[2]){
    // Corpus-picked obvious answers must at least be familiar words.
    for(const item of open.filter(item=>item.z>=2)){
      if(quota.plankton>0){tiers.set(item.entry,10);quota.plankton--}
      else if(quota.schooler>0){tiers.set(item.entry,30);quota.schooler--}
      else break;
    }
    open=open.filter(item=>!tiers.has(item.entry));
  }
  for(const item of open.filter(item=>item.z>=1.2)){if(quota.rare--<=0)break;tiers.set(item.entry,60)}
  for(const item of open)if(!tiers.has(item.entry))tiers.set(item.entry,85);
  return tiers;
}

function chooseFeatured(bank,prompt){
  // Obvious answers never become the Krillion, even when they have a fun fact.
  const factFor=entry=>entry.points>15?factLookup([entry.canonical,...entry.aliases],prompt):undefined;
  let hash=2166136261;
  for(const c of prompt)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
  // A One in a Krillion should be a fun fact, not merely the most obscure word on the list.
  const priority=entry=>entry.points===100?1000:factFor(entry)?700
    :({60:300,85:200,30:100,10:50}[entry.points]??0);
  const best=bank.reduce((n,entry)=>Math.max(n,priority(entry)),-1);
  const candidates=bank.filter(entry=>priority(entry)===best);
  const winner=candidates[hash%candidates.length];
  const fact=factFor(winner);
  return bank.map(entry=>entry===winner?{...entry,points:100,...(fact&&{fact})}:entry.points===100?{...entry,points:85}:entry);
}

export const questions=events.map(([event,entries],eventIndex)=>{
  const bases=new Map();
  const rows=entries.map(([prompt,raw,since],questionIndex)=>{
    const [base,rule]=prompt.split('\n');
    let groups=bases.get(base);
    if(!groups){
      groups=expandedGroups(base,raw);
      bases.set(base,groups);
    }
    const bank=[];
    for(const [index,names] of groups.entries()){
      let allowed=names;
      if(rule){
        const letter=rule.at(-2).toLowerCase();
        allowed=names.filter(name=>{
          const spelling=normalize(name);
          if(rule.startsWith('Start'))return spelling.startsWith(letter);
          if(rule.startsWith('End'))return spelling.endsWith(letter);
          return spelling.includes(letter);
        });
      }
      if(!allowed.length)continue;
      const [canonical,...aliases]=allowed;
      bank.push({canonical,aliases,points:null,names:allowed});
    }
    // Tiers come from the obvious-answer lists and corpus familiarity.
    const numeric=/^\d+$/.test(bank[0]?.canonical??'');
    const computed=numeric?new Map():familiarityTiers(bank.filter(entry=>entry.points==null),bank,obviousAnswers[base]);
    for(const entry of bank){
      entry.points??=computed.get(entry)??30;
      delete entry.names;
    }
    return since?{prompt,bank:chooseFeatured(bank,prompt),since}:{prompt,bank:chooseFeatured(bank,prompt)};
  });
  return [event,rows];
});

// Prompt-only catalog for the server build: the client needs each row's first day and Daily eligibility.
import { MIN_DAILY_ANSWERS, narrowPuzzle } from './selection.js';
export const dailyWorthy=row=>row.bank.length>=MIN_DAILY_ANSWERS&&!narrowPuzzle(row.prompt);
export const publicEvents=questions.map(([event,rows])=>[event,rows.map(row=>({prompt:row.prompt,...(row.since&&{since:row.since}),...(!dailyWorthy(row)&&{daily:false})}))]);

export function questionFor(seed, round, first, mode) {
  const [event,index]=selection(questions,seed,round,first,mode);
  return questions[event][1][index];
}
