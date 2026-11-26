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

export function matchAnswer(bank,answer){
  // Punctuation carries meaning for numbers: -16 and 1.6 must never become 16.
  if(/^\d+$/.test(bank[0].canonical)){
    const typed=answer.trim().toLowerCase().replace(/\s+/g,' ');
    return {match:bank.find(entry=>[entry.canonical,...entry.aliases].includes(typed))};
  }
  const guess=normalize(answer);
  if(!guess)return {};
  for(const entry of bank){
    if([entry.canonical,...entry.aliases].some(name=>normalize(name)===guess))return {match:entry};
  }
  const threshold=guess.length<4?0:guess.length<8?1:2;
  let best=threshold+1,suggestion,ambiguous=false;
  for(const entry of bank){
    for(const name of [entry.canonical,...entry.aliases]){
      const key=normalize(name);
      if(!threshold || key.length<4 || Math.abs(key.length-guess.length)>threshold)continue;
      const d=distance(guess,key);
      if(d>threshold)continue;
      if(d<best){best=d;suggestion=entry;ambiguous=false;}
      else if(d===best && suggestion!==entry)ambiguous=true;
    }
  }
  return {suggestion:ambiguous?undefined:suggestion?.canonical};
}
