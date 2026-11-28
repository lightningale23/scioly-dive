// Prints the Daily Dive prompts for the coming days with every accepted answer.
// Usage: npm run upcoming -- [days=7] [--compact]
import {questionFor, questions} from '../answer-bank.js';
import { dailyDay, playDay } from '../daily-clock.js';

const days = Number(process.argv.find(arg => /^\d+$/.test(arg)) ?? 7);
const compact = process.argv.includes('--compact');
const today = dailyDay();
const seen = new Set();
for (let d = 0; d < days; d++) {
  console.log('\n== ' + new Date(playDay(today + d) * 86400000).toISOString().slice(0, 10) + ' (Daily ' + (today + d) + ')');
  for (let round = 0; round < 7; round++) {
    const question = questionFor(today + d, round, undefined, 'Daily');
    const event = questions.find(([, rows]) => rows.includes(question))[0];
    const base = question.prompt.split('\n')[0];
    console.log('- [' + event + '] ' + question.prompt.replace('\n', ' ') + ' (' + question.bank.length + ' answers)');
    // Huge, unit and number banks are generated and need no hand curation.
    if (compact || seen.has(base) || question.bank.length > 400 || /Unit names|Pick a|^\D*\d+°|decimal integer/.test(base)) continue;
    seen.add(base);
    console.log('  ' + question.bank.map(entry => entry.canonical).join('; '));
  }
}
