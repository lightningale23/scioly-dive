import { normalize } from './matching.js';

// Everyday names that players type for an answer, added wherever that answer appears.
const aliases={
 patella:'kneecap',clavicle:'collarbone',scapula:'shoulder blade',mandible:'lower jawbone|lower jaw',maxilla:'upper jaw',sternum:'breastbone',femur:'thighbone',tibia:'shinbone',humerus:'upper arm bone',coccyx:'tailbone',calcaneus:'heel bone',malleus:'hammer',incus:'anvil',stapes:'stirrup',
 mean:'average|arithmetic mean',median:'50th percentile',variance:'statistical variance','standard deviation':'SD','interquartile range':'IQR','confidence interval':'CI','body mass':'body weight',
 'phase angle':'phase difference',current:'electric current|electrical current',frequency:'signal frequency',resistance:'electrical resistance',voltage:'electric potential difference',
 'case control study':'case control', 'cohort study':'cohort design', 'randomized trial':'randomized controlled trial|RCT','sample size':'number of samples',
 'Ohm law':"Ohm’s law|U=RI|I=V/R|R=V/I",'Kirchhoff current law':"Kirchhoff’s first law|Kirchhoff’s junction rule",'Kirchhoff voltage law':"Kirchhoff’s second law|Kirchhoff’s loop rule",
 'increase temperature':'raise the temperature|increase the temperature|heat it up|heat the reactants','add a catalyst':'adding a catalyst|add catalyst|catalysis','increase surface area':'increase the surface area|powder the solid',
 'binary search tree':'BST','priority queue':'min priority queue|max priority queue','hash table':'hashtable|hashmap','merge sort':'mergesort','quick sort':'quicksort','leaf blade':'lamina',
 precipitation:'rain|rainfall|snowfall',evaporation:'evaporating',condensation:'condensing',sublimation:'subliming',
 brainstem:'brain stem',pons:'pons Varolii','medulla oblongata':'medulla', 'field of view':'FOV', 'water flea':'Daphnia', crayfish:'crawfish|crawdad', 'water lily':'waterlily',
 orthoclase:'orthoclase feldspar','round seeds':'round seed|round', 'wrinkled seeds':'wrinkled seed|wrinkled'
};
export function expandedGroups(prompt,original){
 // A group that shares any spelling with an earlier answer joins that answer, so one answer never
 // appears twice (e.g. "font|typeface" added where "typeface" already exists).
 const groups=[], owner=new Map();
 for(const group of [...original.split(';').map(s=>s.trim()),]){
   const [canonical,...other]=group.split('|');
   const spellings=[canonical,...other,...(Object.hasOwn(aliases,canonical)?aliases[canonical]:'').split('|')].filter(Boolean);
   let names=spellings.map(name=>owner.get(normalize(name))).find(Boolean);
   if(!names){names=new Set();groups.push(names)}
   for(const name of spellings){names.add(name);if(!owner.has(normalize(name)))owner.set(normalize(name),names)}
 }
 return groups.map(names=>[...names]);
}
