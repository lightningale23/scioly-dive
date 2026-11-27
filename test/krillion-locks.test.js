import test from 'node:test';
import assert from 'node:assert/strict';
import {questions, questionFor} from '../answer-bank.js';
import {krillionLocks} from '../catalog-data/krillion-locks.js';

const rows = new Map(questions.flatMap(([, entries]) => entries).map(row => [row.prompt, row]));
test('every Krillion lock names an answer that is still on its prompt', () => {
  for (const [prompt, answer] of Object.entries(krillionLocks)) {
    assert(rows.has(prompt), 'locked prompt was removed or reworded: ' + prompt);
    const winner = rows.get(prompt).bank.find(entry => entry.points === 100);
    assert.equal(winner.canonical, answer, 'locked Krillion moved: ' + prompt);
  }
});
test('every Daily played so far has its Krillions locked (run npm run lock-krillions)', () => {
  const today = Math.floor(Date.now() / 86400000);
  for (let day = 20784; day <= today; day++) for (let round = 0; round < 7; round++) {
    const {prompt} = questionFor(day, round, undefined, 'Daily');
    assert(Object.hasOwn(krillionLocks, prompt), 'unlocked prompt on day ' + day + ': ' + prompt);
  }
});
