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

// Editorial scores in canonical-answer order. The 15 and 100 tiers are reserved
// for deliberately selected picks and override general familiarity.
const editorial = [
  [[10, 30, 30, 60, 15], [10, 10, 10, 30, 15, 60, 85, 100]],
  [[10, 30, 60, 30, 15, 85, 60, 100], [10, 15, 30, 30, 60, 60, 85, 85, 85, 85, 100]],
  [[10, 30, 10, 10, 30, 30, 30, 60, 60, 60, 85, 100], [10, 10, 30, 60, 85, 60, 15, 100]],
  [[10, 10, 15, 30, 60], [10, 10, 15, 30, 60]],
  [[15, 10, 30, 30, 60, 85, 85, 60, 100], [10, 10, 10, 30, 30, 60, 85, 60, 60, 100]],
  [[10, 10, 30, 30, 30, 30, 60, 60, 15, 85, 85, 60, 85, 100], [10, 15, 10, 30, 30, 60, 60, 85, 85, 100]],
  [[10, 30, 30, 15, 85, 100], [10, 10, 10, 30, 15, 85]],
];

// Selected anchors for the expanded catalog. Unrated answers use the normal 30-point tier.
const ratings=new Map();
for(const [points,words] of [
  [10,'mean;median;mode;mass;length;width;height;depth;area;pressure;temperature;voltage;current;time;force;weight;speed;lift;drag;wheel;axle;wing;river;lake;ruler;pencil;circle;square;triangle;carbon;hydrogen;oxygen;root;stem;leaf;bone;femur;heart;muscle;brain;water;ice;quartz;slate;marble;beaker;volt;ampere;ohm;watt;joule;second;metre;gram;litre;kelvin;newton;pascal;mole;variable;loop;array;lever;pulley;gear'],
  [15,'hertz;henry;hyoid;iris;stapes;washout;carbon copy;crimp;crib;wedge;zero correlation;terminal flowers;worn edge'],
  [60,'ulna;clavicle;scaphoid;lenticular;hydrometer;trapezoid;delta;median absolute deviation;variance;stratification;cohort study;gauge pressure;concentric;camber;gore;staurolite;wollastonite;blueschist;proline;epistasis;water penny;quantile plot;thermal break;meniscus;emissivity;altimeter;interferometer'],
  [85,'heteroscedasticity;poikilitic;glossopharyngeal;calcaneus;knickpoint;crevasse splay;triquetrum;georeferencing;orthorectification;antepenumbra;dicrotic notch;ramachandran plot;vitrophyric;slenderness ratio;shroud line;modal interval;pigeonhole sort'],
  [100,'henries;inferior nasal concha;intermediate cuneiform;chlorophyll concentration;subophitic;trifid cipher;spherulitic;zygomatic bone;spessartine;quectoampere;quettafarad'],
]){
  for(const word of words.split(';'))ratings.set(normalize(word),points);
}

// Corpus familiarity (wordfreq Zipf scale, see scripts/familiarity.mjs). Like Krillion, the tier is
// fixed before anyone plays: the game knows which answers are obvious, and everything else sinks.
// Scores use the canonical name: aliases are often everyday words with other meanings ("hammer" for
// malleus), and one- or two-letter names (symbols, "Go", "R") are capped for the same reason.
const zipf=name=>{const key=normalize(name),z=familiarity[key]??0;return key.length<3?Math.min(z,3):z};
// Within one prompt, the most familiar ~1% are Plankton and the next ~5% Schoolers, so even a list of
// specialist terms has a few obvious answers. Beyond that, how common the word is in English decides.
function familiarityTiers(entries,obvious,editorChoseObvious){
  if(obvious){
    // An editor's short list replaces the rank-based one; the corpus then only separates Rare from Deep Cut.
    const [plankton,schooler]=obvious.map(list=>new Set(list.split(';').map(name=>normalize(name))));
    return new Map(entries.map(entry=>{
      const key=normalize(entry.canonical);
      return [entry,plankton.has(key)?10:schooler.has(key)?30:zipf(entry.canonical)>=2.6?60:85];
    }));
  }
  const scored=entries.map(entry=>({entry,z:zipf(entry.canonical)}));
  const ranked=[...scored].sort((a,b)=>b.z-a.z);
  const plankton=Math.max(1,Math.round(entries.length*.01)), schooler=Math.max(1,Math.round(entries.length*.05));
  const tiers=new Map();
  ranked.forEach(({entry,z},rank)=>{
    // Plankton comes only from rank, so every prompt has a short list of obvious answers.
    const absolute=z>=4.4?30:z>=2.6?60:85;
    // Where an editor already chose the obvious answers, later additions are never promoted by rank.
    const relative=z<2||editorChoseObvious?85:rank<plankton?10:rank<plankton+schooler?30:85;
    tiers.set(entry,Math.min(absolute,relative));
  });
  return tiers;
}

// Prefer memorable, subject-specific discoveries whenever a filtered bank contains one.
const featured=new Set(('Geneva drive|Callirrhoe|knickpoint|pistil|quicksort|coccyx|hyoid|scytale|Wernicke’s area|Daphnia|trie|Scotch yoke|isothermal|triple point|spinneret|corundum|tuff|cretaceous|turn|gore|Dysnomia|pollen|gutta percha|sublimation|pycnometer|brocken spectre|neutral axis|spill hole|winglet|cepheid|bias|odds ratio|ball and stick model|friction factor|yardang|spiral|pentagram|42|64|128|256').split('|').map(normalize));
function chooseFeatured(bank,prompt){
  // Obvious answers never become the Krillion, even when they have a fun fact.
  const factFor=entry=>entry.points>15?factLookup([entry.canonical,...entry.aliases],prompt):undefined;
  let hash=2166136261;
  for(const c of prompt)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
  // A One in a Krillion should be a fun fact, not merely the most obscure word on the list.
  const priority=entry=>entry.points===100?1000:factFor(entry)?700
    :featured.has(normalize(entry.canonical))?500:({60:300,85:200,30:100,10:50}[entry.points]??0);
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
      const curated=editorial[eventIndex]?.[questionIndex]?.[index]??ratings.get(normalize(canonical));
      bank.push({canonical,aliases,points:curated,names:allowed});
    }
    // Hand-rated answers keep their tier; numeric answers keep the standard tier.
    const numeric=/^\d+$/.test(bank[0]?.canonical??'');
    const computed=numeric?new Map():familiarityTiers(bank.filter(entry=>entry.points==null),obviousAnswers[base],bank.some(entry=>entry.points===10));
    for(const entry of bank){
      entry.points??=computed.get(entry)??30;
      delete entry.names;
    }
    return since?{prompt,bank:chooseFeatured(bank,prompt),since}:{prompt,bank:chooseFeatured(bank,prompt)};
  });
  return [event,rows];
});

export function questionFor(seed, round, first, mode) {
  const [event,index]=selection(questions,seed,round,first,mode);
  return questions[event][1][index];
}
