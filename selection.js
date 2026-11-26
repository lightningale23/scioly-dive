export function selection(events, seed, round, first, mode) {
  if ((mode === 'Daily' || mode === 'Archive') && seed < 20783) {
    return [(seed % 7 + round) % 7, (Math.floor(seed / 7) + round) % 2];
  }
  // Mix adjacent calendar dates before drawing the event permutation.
  let state = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
  state = Math.imul(state ^ (state >>> 16), 0x45d9f3b);
  state = (state ^ (state >>> 16)) >>> 0;
  function pick(limit) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return Math.floor(state / 4294967296 * limit);
  }
  const order = events.map((_, index) => index);
  if (first != null) [order[0], order[first]] = [order[first], order[0]];
  for (let i = first == null ? 0 : 1; i < 7; i++) {
    const j = i + pick(order.length - i);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const event = order[round];
  // One optional word challenge per dive. A roll of seven or higher skips it.
  const wordRound=pick(12);
  for(let i=0;i<round;i++)pick(1);
  const entries=events[event][1];
  const ordinary=[],wordplay=[];
  entries.forEach((entry,index)=>{
    const prompt=Array.isArray(entry)?entry[0]:entry.prompt??entry;
    (prompt.includes('\n')?wordplay:ordinary).push(index);
  });
  const pool=round===wordRound && wordplay.length?wordplay:ordinary;
  return [event,pool[pick(pool.length)]];
}
