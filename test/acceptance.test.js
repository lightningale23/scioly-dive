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
test('specialist answers, aliases and plurals are accepted on Pages',()=>{
  const cases=[
    ['Name a rock or mineral on the 2027','rhodochrosite'],['Name a rock or mineral on the 2027','TV rock'],['Name a rock or mineral on the 2027','fool’s gold'],
    ['Name a disease or disorder of the respiratory','COPD'],['Name a disease or disorder of the respiratory','Crohns disease'],
    ['Name a digital logic gate','K-map'],['Name a digital logic gate','an inverter'],
    ['Name a concept, law, or quantity from gas','PV=nRT'],['Name an enzyme, technique, or molecule','qPCR'],
    ['Name a type of star','Wolf-Rayet stars'],['Name an epidemiology term','R0'],
    ['Name a thermodynamics law','zeroth law'],['Name a coral reef organism','Diadema'],
  ];
  for(const [start,answer] of cases){
    const q=rows.find(row=>row.prompt.startsWith(start)&&!row.prompt.includes('\n'));
    assert.equal(submit(q,answer).status,'valid',answer);
  }
});
test('every official event has a specialist base prompt with a large answer list',()=>{
  for(const [,entries] of questions){
    const base=entries.filter(q=>!q.prompt.includes('\n'));
    assert(base.length>=1);
    for(const q of base)assert(q.bank.length>=55,q.prompt);
  }
  assert.equal(questions.length,23);
});
test('a dropped possessive still matches ("Koch postulates", "Boyle law")',()=>{
  const dd=rows.find(q=>q.prompt.startsWith('Name an epidemiology term')&&!q.prompt.includes('\n'));
  assert.equal(submit(dd,'Koch postulates').status,'valid');
  const chem=rows.find(q=>q.prompt.startsWith('Name a concept, law, or quantity from gas')&&!q.prompt.includes('\n'));
  assert.equal(submit(chem,'Boyle law').status,'valid');
});
test('a dropped possessive cannot dodge a letter rule',()=>{
  const chem=rows.find(q=>q.prompt.startsWith('Name a concept, law, or quantity from gas')&&q.prompt.endsWith('Include the letter S.'));
  if(!chem)return;
  assert(chem.bank.some(e=>e.canonical==='Boyle’s law'));
  assert.notEqual(submit(chem,'Boyle law').status,'valid');
  assert.equal(submit(chem,'Boyles law').status,'valid');
});
