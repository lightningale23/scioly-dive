import test from 'node:test';
import assert from 'node:assert/strict';
import {questions} from '../answer-bank.js';
import {pagesCatalog} from '../pages-catalog.mjs';
import {selection} from '../selection.js';

test('the Pages build ships every scored bank as its own file, and selection agrees without banks', () => {
  const {events, files} = pagesCatalog();
  events.forEach(([event, rows], i) => rows.forEach((row, j) => {
    const source = questions[i][1][j];
    assert.equal(row.prompt, source.prompt);
    const decoded = JSON.parse(files.get(row.file)).map(([canonical, aliases, points, fact]) => ({canonical, aliases, points, ...(fact && {fact})}));
    assert.deepEqual(decoded, source.bank.map(({canonical, aliases, points, fact}) => ({canonical, aliases, points, ...(fact && {fact})})), event + ': ' + row.prompt);
  }));
  for (const seed of [20784, 20790, 20830]) for (let round = 0; round < 7; round++)
    assert.deepEqual(selection(events, seed, round, undefined, 'Daily'), selection(questions, seed, round, undefined, 'Daily'));
});
