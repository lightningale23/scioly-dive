import {expandedGroups} from './coverage.js';
import {selection} from './selection.js';
import { events } from './prompts.js';

export const tiers = [10, 15, 30, 60, 85, 100];
export const tierNames = { 10: 'Plankton', 15: 'Too Clever', 30: 'Schooler', 60: 'Rare', 85: 'Deep Cut', 100: 'One in a Krillion' };
import { normalize } from './matching.js';
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

// Optional precomputed corpus data, expressed as occurrences per million.
const familiarity = JSON.parse(globalThis.process?.env?.ANSWER_FAMILIARITY_JSON || '{}');

// Prefer memorable, subject-specific discoveries whenever a filtered bank contains one.
const featured=new Set(('Geneva drive|Callirrhoe|knickpoint|pistil|quicksort|coccyx|hyoid|scytale|Wernicke’s area|Daphnia|trie|Scotch yoke|isothermal|triple point|spinneret|corundum|tuff|cretaceous|turn|gore|Dysnomia|pollen|gutta percha|sublimation|pycnometer|brocken spectre|neutral axis|spill hole|winglet|cepheid|bias|odds ratio|ball and stick model|friction factor|yardang|spiral|pentagram|42|64|128|256').split('|').map(normalize));
function chooseFeatured(bank,prompt){
  let hash=2166136261;
  for(const c of prompt)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
  const priority=entry=>entry.points===100?1000:featured.has(normalize(entry.canonical))?500:entry.points===15?0:entry.points;
  const best=bank.reduce((n,entry)=>Math.max(n,priority(entry)),-1);
  const candidates=bank.filter(entry=>priority(entry)===best);
  const winner=candidates[hash%candidates.length];
  return bank.map(entry=>entry===winner?{...entry,points:100}:entry.points===100?{...entry,points:85}:entry);
}

export const questions=events.map(([event,entries],eventIndex)=>{
  const bases=new Map();
  const rows=entries.map(([prompt,raw],questionIndex)=>{
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
      const curated=editorial[eventIndex]?.[questionIndex]?.[index]??ratings.get(normalize(canonical))??30;
      const frequency=familiarity[normalize(canonical)];
      const points=!Number.isFinite(frequency)||curated===15||curated===100?curated
        :frequency>=50?10:frequency>=5?30:frequency>=0.5?60:85;
      bank.push({canonical,aliases,points});
    }
    return {prompt,bank:chooseFeatured(bank,prompt)};
  });
  return [event,rows];
});

export function questionFor(seed, round, first, mode) {
  const [event,index]=selection(questions,seed,round,first,mode);
  return questions[event][1][index];
}
