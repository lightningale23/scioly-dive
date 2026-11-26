import pluralize from 'pluralize';
export const normalize=value=>value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');

// Optimal string alignment distance also recognizes a single adjacent transposition.
function distance(a,b) {
  let previous=Array.from({length:b.length+1},(_,i)=>i), older=previous;
  for(let i=1;i<=a.length;i++){
    const row=[i];
    for(let j=1;j<=b.length;j++){
      row[j]=Math.min(previous[j]+1,row[j-1]+1,previous[j-1]+Number(a[i-1]!==b[j-1]));
      if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])row[j]=Math.min(row[j],older[j-2]+1);
    }
    older=previous;previous=row;
  }
  return previous[b.length];
}

const indexes=new WeakMap();
function indexFor(bank){
  let index=indexes.get(bank);
  if(index)return index;
  const exact=new Map(), byLength=new Map();
  for(const entry of bank){
    for(const name of [entry.canonical,...entry.aliases]){
      const key=normalize(name);
      if(!exact.has(key))exact.set(key,entry);
      if(!byLength.has(key.length))byLength.set(key.length,[]);
      byLength.get(key.length).push([key,entry]);
    }
  }
  for(const entry of bank)exact.set(normalize(entry.canonical),entry);
  index={exact,byLength};indexes.set(bank,index);return index;
}
const unitNames={A:'ampere',F:'farad',H:'henry','Ω':'ohm',S:'siemens',V:'volt',W:'watt',C:'coulomb',N:'newton',Pa:'pascal',m:'metre',g:'gram',s:'second',J:'joule',K:'kelvin',Hz:'hertz',T:'tesla',rad:'radian',mol:'mole',L:'litre',l:'litre'};
const prefixNames={'':'',Q:'quetta',R:'ronna',Y:'yotta',Z:'zetta',E:'exa',P:'peta',T:'tera',G:'giga',M:'mega',k:'kilo',h:'hecto',da:'deca',d:'deci',c:'centi',m:'milli',μ:'micro',u:'micro',n:'nano',p:'pico',f:'femto',a:'atto',z:'zepto',y:'yocto',r:'ronto',q:'quecto'};
const unitSymbols=new Map();
for(const [unit,name] of Object.entries(unitNames)){
  for(const [prefix,full] of Object.entries(prefixNames))unitSymbols.set(prefix+unit,full+name);
}
export function matchAnswer(bank,answer,prompt=''){
  if(/^\d+$/.test(bank[0].canonical)){
    let typed=answer.trim().toLowerCase().replace(/\s+/g,' ');
    const number=typed.match(/^\+?(\d+)(?:\.0+)?( degrees?|°)?$/);
    if(number)typed=String(Number(number[1]))+(number[2]?.replace(/^ degree$/,' degrees')??'');
    return {match:bank.find(entry=>[entry.canonical,...entry.aliases].includes(typed))};
  }
  const typed=answer.trim().replace(/^(?:a|an|the)\s+/i,'');
  if(prompt.endsWith('Unit names and symbols both count.')){
    const symbol=unitSymbols.get(typed.normalize('NFKC'));
    if(symbol)return {match:indexFor(bank).exact.get(symbol)};
  }
  // Accept a term written together with its recognized abbreviation.
  const gloss=typed.match(/^(.+?)\s*\(([^()]+)\)$/);
  if(gloss){
    const {exact}=indexFor(bank);
    const full=exact.get(normalize(gloss[1]));
    if(full && full===exact.get(normalize(gloss[2])))return {match:full};
  }
  const guess=normalize(typed);
  if(!guess)return {};
  const {exact,byLength}=indexFor(bank);
  const direct=exact.get(normalize(answer))??exact.get(guess);
  if(direct)return {match:direct};
  const rule=prompt.match(/\n(Start with|End with|Include) the letter ([A-Z])/);
  const letter=rule?.[2].toLowerCase();
  const fits=!rule||(rule[1]==='Start with'?guess.startsWith(letter):rule[1]==='End with'?guess.endsWith(letter):guess.includes(letter));
  if(fits){
    const equivalents=[pluralize.singular(typed),typed.replace(/colour/gi,'color').replace(/centre/gi,'center').replace(/fibre/gi,'fiber')];
    for(const variant of equivalents){
      const match=exact.get(normalize(variant));
      if(match)return {match};
    }
  }
  const threshold=guess.length<4?0:guess.length<8?1:2;
  if(!threshold)return {};
  let best=threshold+1,suggestion,ambiguous=false;
  for(let length=Math.max(4,guess.length-threshold);length<=guess.length+threshold;length++){
    for(const [key,entry] of byLength.get(length)??[]){
      const d=distance(guess,key);
      if(d>threshold)continue;
      if(d<best){best=d;suggestion=entry;ambiguous=false;}
      else if(d===best && suggestion!==entry)ambiguous=true;
    }
  }
  return {suggestion:ambiguous?undefined:suggestion?.canonical};
}
