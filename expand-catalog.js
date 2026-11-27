// Adds the optional letter-rule variants ("Include the letter E.") to every prompt with a large
// enough answer list. A dive uses at most one of these.
export function expandCatalog(events) {
  const letters = word => word.toLowerCase().normalize('NFKD').replace(/[^a-z]/g,'');
  for (const [,entries] of events) {
    for (const [prompt,bank] of [...entries]) {
      const groups = bank.split(';').map(item => item.trim().split('|'));
      if (groups.length < 18) continue;
      for (const [phrase,test] of [
        ['Start with',(word,c)=>word.startsWith(c)],
        ['End with',(word,c)=>word.endsWith(c)],
        ['Include',(word,c)=>word.includes(c)],
      ]) {
        for (const c of 'abcdefghijklmnopqrstuvwxyz') {
          const matches = groups.map(names=>names.filter(n=>test(letters(n),c))).filter(names=>names.length);
          // Keep a meaningful choice of answers and discard nearly redundant constraints.
          if (matches.length < 8 || matches.length >= groups.length*.9) continue;
          entries.push([prompt+'\n'+phrase+' the letter '+c.toUpperCase()+'.', matches.map(names=>names.join('|')).join('; ')]);
        }
      }
    }
  }
}
