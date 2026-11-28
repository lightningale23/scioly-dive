import {expandedGroups} from './coverage.js';
import {selection} from './selection.js';
import { events } from './prompts.js';

export const tiers = [10, 15, 30, 60, 85, 100];
export const tierNames = { 10: 'Plankton', 15: 'Too Clever', 30: 'Schooler', 60: 'Rare', 85: 'Deep Cut', 100: 'One in a Krillion' };
import { normalize } from './matching.js';
import { familiarity } from './catalog-data/familiarity.js';
import { factFor as factLookup } from './catalog-data/krillion-facts.js';
import { obviousAnswers } from './catalog-data/obvious-answers.js';
import { krillionLocks } from './catalog-data/krillion-locks.js';
export { normalize };

// Corpus familiarity (wordfreq Zipf scale, see scripts/familiarity.mjs). Like Krillion, the tier is
// fixed before anyone plays: the game knows which answers are obvious, and everything else sinks.
// Scores use the canonical name: aliases are often everyday words with other meanings ("hammer" for
// malleus), and one- or two-letter names (symbols, "Go", "R") are capped for the same reason.
const zipf=name=>{const key=normalize(name),z=familiarity[key]??0;return key.length<3?Math.min(z,3):z};
// Tiers come from each question, not from a formula on the list's length: how many answers are obvious
// depends on the question, so the editor's lists for that prompt set them (catalog-data/obvious-answers.js):
//   Plankton = answers that repeat the prompt's own words, plus the prompt's Plankton list
//   Schooler = the prompt's Schooler list
//   Rare     = the prompt's Rare list (answers specialists know well that the corpus underrates, such as
//              "ulexite"), plus every other answer the corpus knows at least as well as this prompt's own
//              less familiar obvious answers (the lower quartile of their familiarity, kept between Zipf 1.5 and 3)
//   Deep Cut = everything else
// Short hand-judged prompts skip the corpus: their lists name Plankton, Schooler and Deep Cut answers, and
// every other answer is Rare.
// So a prompt with many obvious answers has a big Plankton and Schooler, a prompt whose obvious answers
// are everyday words sets a high bar for Rare, and a technical prompt sets a low one. Prompts without
// an obvious list (or whose list is not flagged no-fill) also let the corpus pick obvious answers by
// familiarity: Plankton from Zipf 5 and Schooler from Zipf 4.
const nameSet=list=>new Set((typeof list==='string'?list:'').split(';').map(name=>normalize(name)).filter(Boolean));
export function rareBar(obviousZipfs){
  if(!obviousZipfs.length)return 2.5;
  const sorted=[...obviousZipfs].sort((a,b)=>a-b);
  return Math.min(3,Math.max(1.5,sorted[Math.floor(0.25*(sorted.length-1))]));
}
// An answer that just repeats words from its own prompt ("epidemiology" for "Name an epidemiology
// term...") is as obvious as an answer can be, so it is Plankton. Matches that begin with a small word
// ("Of star" inside "type of star") don't count.
const promptWords=text=>' '+text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').trim()+' ';
const smallWords=/^(a|an|the|of|or|and|to|in|on|for|from|by|with|at)$/;
function echoesPrompt(entry,base){
  const words=promptWords(base);
  return [entry.canonical,...entry.aliases].some(name=>{
    const phrase=promptWords(name);
    return phrase.trim().length>2&&!smallWords.test(phrase.trim().split(' ')[0])&&words.includes(phrase);
  });
}
function familiarityTiers(bank,obvious,base=''){
  const [listed10,listed30,,listed60]=[0,1,2,3].map(i=>nameSet(obvious?.[i]));
  const tiers=new Map(), key=entry=>normalize(entry.canonical);
  for(const entry of bank){
    if(base&&echoesPrompt(entry,base)||listed10.has(key(entry)))tiers.set(entry,10);
    else if(listed30.has(key(entry)))tiers.set(entry,30);
  }
  if(!obvious?.[2])for(const entry of bank)if(!tiers.has(entry)){
    const z=zipf(entry.canonical);
    if(z>=5)tiers.set(entry,10);else if(z>=4)tiers.set(entry,30);
  }
  // A hand-judged prompt ('judged' as the third element) lists its Deep Cuts too; every other answer is
  // Rare, with no corpus guesswork. Word frequency misjudges short technical lists ("key", "calorie").
  if(obvious?.[2]==='judged'){
    const listed85=nameSet(obvious[4]);
    for(const entry of bank)if(!tiers.has(entry))tiers.set(entry,listed85.has(key(entry))?85:60);
    return tiers;
  }
  const bar=rareBar([...tiers.keys()].map(entry=>zipf(entry.canonical)));
  for(const entry of bank)if(!tiers.has(entry))tiers.set(entry,listed60.has(key(entry))||zipf(entry.canonical)>=bar?60:85);
  return tiers;
}

function chooseFeatured(bank,prompt,obvious){
  // The One in a Krillion is a genuine deep cut: never an answer on the prompt's Plankton, Schooler or
  // Rare lists, and never one the corpus rates Rare while a Deep Cut exists. Among Deep Cuts, one with
  // a fun fact wins, then the least familiar; a stable hash of the prompt breaks ties.
  const listed=new Set([0,1,3].flatMap(i=>[...nameSet(obvious?.[i])]));
  const factFor=entry=>entry.points>30&&!listed.has(normalize(entry.canonical))?factLookup([entry.canonical,...entry.aliases],prompt):undefined;
  let hash=2166136261;
  for(const c of prompt)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
  const priority=entry=>listed.has(normalize(entry.canonical))?0:entry.points===85?(factFor(entry)?3:2):entry.points===60?1:0;
  const best=bank.reduce((n,entry)=>Math.max(n,priority(entry)),0);
  const pool=bank.filter(entry=>priority(entry)===best), lowest=Math.min(...pool.map(entry=>zipf(entry.canonical)));
  const candidates=pool.filter(entry=>zipf(entry.canonical)===lowest);
  // Once a prompt has been played, its Krillion is locked (catalog-data/krillion-locks.js), so
  // growing the answer list never changes the answer at the bottom of a live or past Daily.
  const locked=Object.hasOwn(krillionLocks,prompt)?bank.find(entry=>entry.canonical===krillionLocks[prompt]):undefined;
  const winner=locked??candidates[hash%candidates.length];
  const fact=locked?factLookup([winner.canonical,...winner.aliases],prompt):factFor(winner);
  return bank.map(entry=>entry===winner?{...entry,points:100,...(fact&&{fact})}:entry);
}

// Rows are built eagerly with only what selection needs (prompt and answer count); each row's scored
// bank (tiers, Krillion and fact) is computed the first time it is read. A dive reads seven, so the
// page no longer tiers every prompt in the catalog before it can start.
function scoredBank(allowedGroups,base,prompt){
  const bank=allowedGroups.map(([canonical,...aliases])=>({canonical,aliases,points:null}));
  const computed=familiarityTiers(bank,obviousAnswers[base],base);
  for(const entry of bank)entry.points=computed.get(entry);
  return chooseFeatured(bank,prompt,obviousAnswers[base]);
}
export const questions=events.map(([event,entries])=>{
  const bases=new Map();
  const rows=entries.map(([prompt,raw,since])=>{
    const [base,rule]=prompt.split('\n');
    let groups=bases.get(base);
    if(!groups){
      groups=expandedGroups(base,raw);
      bases.set(base,groups);
    }
    let allowedGroups=groups;
    if(rule){
      const letter=rule.at(-2).toLowerCase();
      const fits=rule.startsWith('Start')?spelling=>spelling.startsWith(letter):rule.startsWith('End')?spelling=>spelling.endsWith(letter):spelling=>spelling.includes(letter);
      allowedGroups=groups.map(names=>names.filter(name=>fits(normalize(name)))).filter(names=>names.length);
    }
    const row={prompt,size:allowedGroups.length,...(since&&{since})};
    let bank;
    Object.defineProperty(row,'bank',{enumerable:true,get:()=>bank??=scoredBank(allowedGroups,base,prompt)});
    return row;
  });
  return [event,rows];
});


// Prompt-only catalog for the server build: the client needs each row's first day and Daily eligibility.
import { MIN_DAILY_ANSWERS, narrowPuzzle } from './selection.js';
export const dailyWorthy=row=>row.size>=MIN_DAILY_ANSWERS&&!narrowPuzzle(row.prompt);
export const publicEvents=questions.map(([event,rows])=>[event,rows.map(row=>({prompt:row.prompt,...(row.since&&{since:row.since}),...(!dailyWorthy(row)&&{daily:false})}))]);

export function questionFor(seed, round, first, mode) {
  const [event,index]=selection(questions,seed,round,first,mode);
  return questions[event][1][index];
}
