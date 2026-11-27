// One-command review of a prompt, so checking a new or edited answer list needs no ad-hoc code.
// Usage: npm run check-prompt -- "<any part of the prompt>"
// Prints the size, tier counts, Krillion (fact, lock), obvious answers, suspicious aliases, answer
// groups that a shared spelling folded together, and a sample of Rare and Deep Cut answers.
import {questions} from '../answer-bank.js';
import {events} from '../prompts.js';
import {krillionLocks} from '../catalog-data/krillion-locks.js';
import {featuredDailies} from '../features.js';
import {normalize} from '../matching.js';

const needle = (process.argv[2] ?? '').toLowerCase();
const rows = questions.flatMap(([event, entries]) => entries.map(row => [event, row])).filter(([, row]) => !row.prompt.includes('\n'));
const hits = rows.filter(([, row]) => row.prompt.toLowerCase().includes(needle));
if (hits.length !== 1) {
  console.log(hits.length ? 'Several prompts match; be more specific:' : 'No prompt matches. Prompts:');
  for (const [event, row] of hits.length ? hits : rows) console.log('  [' + event + '] ' + row.prompt);
  process.exit(hits.length ? 1 : 2);
}
const [event, row] = hits[0];
const bank = row.bank, by = points => bank.filter(entry => entry.points === points);
const names = list => list.map(entry => entry.canonical).join('; ');
const krill = by(100)[0];
console.log(`[${event}] ${row.prompt}`);
console.log(`${bank.length} answers: ${[10, 30, 60, 85].map(p => by(p).length + ' × ' + p).join(', ')}${row.since ? ', joins on day ' + row.since : ''}`);
console.log(`Krillion: ${krill.canonical} ${krill.fact ? '(fact)' : '(NO FACT)'} ${Object.hasOwn(krillionLocks, row.prompt) ? '(locked)' : '(not locked yet)'}`);
console.log('Plankton:', names(by(10)));
console.log('Schooler:', names(by(30)));
const days = Object.entries(featuredDailies).filter(([, rounds]) => rounds.some(([, prompt]) => prompt === row.prompt)).map(([day]) => new Date(day * 86400000).toISOString().slice(0, 10));
console.log('Pinned on:', days.join(', ') || 'none');
// Groups that came from more than one raw group: a shared spelling folded them together.
const raw = events.find(([name]) => name === event)[1].find(([prompt]) => prompt === row.prompt)[1];
const owner = new Map(), folds = [];
for (const group of raw.split(';').map(part => part.trim()).filter(Boolean)) {
  const spellings = group.split('|'), into = spellings.map(name => owner.get(normalize(name))).find(Boolean);
  if (into && normalize(into) !== normalize(spellings[0])) folds.push(spellings[0] + ' -> ' + into);
  for (const name of spellings) if (!owner.has(normalize(name))) owner.set(normalize(name), into ?? spellings[0]);
}
console.log('Folded together:', folds.join('; ') || 'none');
const short = bank.flatMap(entry => entry.aliases.filter(alias => normalize(alias).length <= 2).map(alias => alias + ' (' + entry.canonical + ')'));
console.log('Aliases of 1-2 characters:', short.join('; ') || 'none');
const sample = (list, n) => list.filter((_, i) => i % Math.max(1, Math.floor(list.length / n)) === 0).slice(0, n);
console.log('Rare sample:', names(sample(by(60), 15)));
console.log('Deep Cut sample:', names(sample(by(85), 15)));
