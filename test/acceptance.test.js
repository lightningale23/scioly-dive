import test from 'node:test';
import assert from 'node:assert/strict';
import {questions} from '../answer-bank.js';
import {guestApi} from '../guest-api.js';

const rows=questions.flatMap(([,entries])=>entries);
const submit=(question,answer)=>guestApi({action:'validate',prompt:question.prompt,answer},question);
test('every prompt awards exactly one obtainable Krillion',()=>{
  for(const q of rows){
    const winners=q.bank.filter(a=>a.points===100);
    assert.equal(winners.length,1,q.prompt);
    assert.equal(submit(q,winners[0].canonical).points,100,q.prompt);
  }
});
test('new factual entries, aliases and scientific notation work on Pages',()=>{
  const cases=[
    ['Name a mineral,','aragonite'],['Name a mineral,','abelloemringerite'],['Name a mineral,','mica'],
    ['Name a moon in','Callirrhoe'],['Name a moon in','S/1999 J1'],
    ['Name a bone','the kneecap'],['Name a bone','femurs'],
    ['What might you find living','a bullfrog'],['How could you visit','breadth first search (BFS)'],
    ['An ammeter','µA'],['An ammeter','milliamp'],['Give an SI energy unit','kJ'],
    ['What term might you hear in Earth and space','S/1999 J1']
  ];
  for(const [start,answer] of cases){
    const q=rows.find(row=>row.prompt.startsWith(start)&&!row.prompt.includes('\n'));
    assert.equal(submit(q,answer).status,'valid',answer);
  }
  const current=rows.find(q=>q.prompt.startsWith('An ammeter'));
  assert.equal(submit(current,'MA').canonical,'megaampere');
  assert.equal(submit(current,'mA').canonical,'milliampere');
  assert.notEqual(submit(current,'mV').status,'valid');
});
