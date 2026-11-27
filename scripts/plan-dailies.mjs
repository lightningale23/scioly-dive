// Pins upcoming Dailies without anyone choosing prompts by hand. For each unpinned day up to
// [days] days from now (default 14), it picks seven different events, taking each event's prompt
// that has gone longest without a Daily (never-used first) and preferring a Krillion with a fun fact.
// Events used in the previous two days are picked last.
// Pinned days are never changed. Usage: npm run plan-dailies -- [days]
// Run npm run lock-krillions afterwards (the weekly workflow does both).
import {readFileSync, writeFileSync} from 'node:fs';
import {questions, dailyWorthy} from '../answer-bank.js';
import {featuredDailies, pausedEvents} from '../features.js';

const ahead = Number(process.argv[2] ?? 14);
const today = Math.floor(Date.now() / 86400000);
const hash = text => { let h = 2166136261; for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };

const lastUsed = new Map(), eventLastUsed = new Map();
const use = (map, key, day) => map.set(key, Math.max(map.get(key) ?? -Infinity, day));
for (const [day, rounds] of Object.entries(featuredDailies)) for (const [event, prompt] of rounds) { use(lastUsed, prompt, Number(day)); use(eventLastUsed, event, Number(day)); }
const candidates = questions.filter(([event]) => !pausedEvents.includes(event))
  .map(([event, rows]) => [event, rows.filter(row => !row.prompt.includes('\n') && dailyWorthy(row))
    .map(row => ({prompt: row.prompt, since: row.since, fact: Boolean(row.bank.find(entry => entry.points === 100)?.fact)}))])
  .filter(([, rows]) => rows.length);

const planned = [];
const lastPinned = Math.max(...Object.keys(featuredDailies).map(Number));
for (let day = Math.max(lastPinned + 1, today + 1); day <= today + ahead; day++) {
  const staleness = row => lastUsed.get(row.prompt) ?? -1e9;
  const picks = candidates.map(([event, rows]) => {
    const usable = rows.filter(row => !(row.since > day));
    usable.sort((a, b) => staleness(a) - staleness(b) || Number(b.fact) - Number(a.fact) || hash(a.prompt + day) - hash(b.prompt + day));
    return [event, usable[0]];
  }).filter(([, row]) => row);
  // Events seen in the last two days rest first, so a day's lineup changes from one day to the next.
  const resting = event => Number((eventLastUsed.get(event) ?? -Infinity) >= day - 2);
  picks.sort(([ea, a], [eb, b]) => resting(ea) - resting(eb) || staleness(a) - staleness(b) || hash(ea + day) - hash(eb + day));
  const rounds = picks.slice(0, 7).sort(([a], [b]) => hash(a + ':' + day) - hash(b + ':' + day));
  if (rounds.length < 7) throw new Error('Fewer than seven events have an eligible prompt on day ' + day);
  for (const [event, row] of rounds) { lastUsed.set(row.prompt, day); eventLastUsed.set(event, day); }
  planned.push([day, rounds.map(([event, row]) => [event, row.prompt])]);
}

if (!planned.length) { console.log('Every day through', new Date((today + ahead) * 86400000).toISOString().slice(0, 10), 'is already pinned.'); process.exit(0); }
const file = new URL('../features.js', import.meta.url);
const source = readFileSync(file, 'utf8');
const end = source.lastIndexOf('};');
const entries = planned.map(([day, rounds]) => '  // ' + new Date(day * 86400000).toISOString().slice(0, 10) + ' (planned by scripts/plan-dailies.mjs)\n  '
  + day + ': [\n' + rounds.map(pair => '    ' + JSON.stringify(pair) + ',\n').join('') + '  ],\n').join('');
writeFileSync(file, source.slice(0, end) + entries + source.slice(end));
for (const [day, rounds] of planned) console.log(new Date(day * 86400000).toISOString().slice(0, 10), rounds.map(([event]) => event).join(', '));
