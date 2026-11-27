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
