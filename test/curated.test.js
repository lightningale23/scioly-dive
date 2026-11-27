import test from 'node:test';
import assert from 'node:assert/strict';
import {events} from '../prompts.js';
import {questions} from '../answer-bank.js';
import {additions} from '../coverage.js';
import {curatedAnswers} from '../catalog-data/curated-answers.js';
import {matchAnswer} from '../matching.js';

const basePrompts=new Set(events.flatMap(([,rows])=>rows.map(([prompt])=>prompt.split('\n')[0])));

test('every curated key and addition prefix reaches a published prompt',()=>{
  for(const prompt of Object.keys(curatedAnswers))assert(basePrompts.has(prompt),'No prompt: '+prompt);
  for(const [start] of additions)assert([...basePrompts].some(p=>p.startsWith(start)),'No prompt starts with: '+start);
});

test('curated spellings are accepted for their prompt',()=>{
  for(const [prompt,raw] of Object.entries(curatedAnswers)){
    const {bank}=questions.flatMap(([,rows])=>rows).find(row=>row.prompt===prompt);
    for(const group of raw.split(';'))for(const name of group.trim().split('|')){
      assert(name && name===name.trim(),'Untrimmed spelling in '+prompt+': '+JSON.stringify(name));
      assert(matchAnswer(bank,name,prompt).match,prompt+' → '+name);
    }
  }
});

test('every obvious answer is an accepted canonical answer of its prompt',async()=>{
  const {obviousAnswers}=await import('../catalog-data/obvious-answers.js');
  for(const [prompt,lists] of Object.entries(obviousAnswers)){
    const row=questions.flatMap(([,rows])=>rows).find(r=>r.prompt===prompt);
    assert(row,'No prompt: '+prompt);
    const names=new Set(row.bank.map(entry=>entry.canonical.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'')));
    for(const name of lists.join(';').split(';'))assert(names.has(name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'')),prompt+' → '+name.trim());
  }
});

test('every Krillion fact belongs to an accepted answer, and facts reach the Krillion pick',async()=>{
  const {factAnswers}=await import('../catalog-data/krillion-facts.js');
  const {normalize}=await import('../matching.js');
  const rows=questions.flatMap(([,r])=>r);
  const spellings=new Set(rows.flatMap(r=>r.bank.flatMap(e=>[e.canonical,...e.aliases].map(normalize))));
  for(const answer of factAnswers)assert(spellings.has(normalize(answer)),'No answer for fact: '+answer);
  for(const row of rows){
    const winner=row.bank.find(e=>e.points===100);
    if(winner.fact)assert.equal(typeof winner.fact,'string');
  }
  assert(rows.filter(r=>r.bank.find(e=>e.points===100).fact).length>100);
});
