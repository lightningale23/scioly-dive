// The Daily draws only prompts with very large answer lists (MIN_DAILY_ANSWERS or more) and skips
// unit and number puzzles. Rows carry their bank; the server build's prompt-only catalog marks
// each row with daily:false instead (see dailyWorthy in answer-bank.js).
export const MIN_DAILY_ANSWERS=60;
export const narrowPuzzle=prompt=>/Unit names and symbols both count|Pick a total|Pick a number|decimal integer|rotates in \d+° steps/.test(prompt);
const dailyRow=entry=>'size' in entry?entry.size>=MIN_DAILY_ANSWERS&&!narrowPuzzle(entry.prompt):entry.daily!==false;
import { featuredDailies, pausedEvents } from './features.js';
const promptOf=entry=>Array.isArray(entry)?entry[0]:entry.prompt??entry;
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
  const daily=mode==='Daily'||mode==='Archive';
  const featured=daily&&featuredDailies[seed]?.[round];
  if(featured){
    const event=events.findIndex(([name])=>name===featured[0]);
    return [event,events[event][1].findIndex(entry=>promptOf(entry)===featured[1])];
  }
  // Daily-style dives use only events that have an eligible prompt; paused events never appear.
  const usable=(entry)=>{
    const since=Array.isArray(entry)?entry[2]:entry.since;
    return !(since>seed) && (!daily||typeof entry==='string'||Array.isArray(entry)||dailyRow(entry));
  };
  const order = events.map((_, index) => index).filter(index=>!pausedEvents.includes(events[index][0])).filter(index=>!daily||events[index][1].some(entry=>usable(entry)&&!(Array.isArray(entry)?entry[0]:entry.prompt??entry).includes('\n')));
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
    // A prompt with a first day joins the pool from that day on, so adding one never changes a live Daily.
    if(!usable(entry))return;
    (prompt.includes('\n')?wordplay:ordinary).push(index);
  });
  const pool=round===wordRound && wordplay.length?wordplay:ordinary;
  return [event,pool[pick(pool.length)]];
}
