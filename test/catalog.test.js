import test from 'node:test';
import assert from 'node:assert/strict';
import {events} from '../prompts.js';
import {questions, questionFor, tiers} from '../answer-bank.js';
import {selection} from '../selection.js';
import {matchAnswer, normalize} from '../matching.js';

test('public prompts and scored banks agree across modes and historical seeds',()=>{
  const published=events.map(([name,items])=>[name,items.map(([prompt])=>prompt)]);
  for(const mode of ['Daily','Archive','Unlimited','Field Notebook']){
    for(const seed of [0,1234,20782,20783,20784,99999]){
      const names=new Set(), first=mode==='Field Notebook'?2:undefined;
      for(let round=0;round<7;round++){
        const [event,index]=selection(published,seed,round,first,mode);
        assert.equal(published[event][1][index],questionFor(seed,round,first,mode).prompt);
        names.add(event);
        if(seed===20782 && mode==='Archive')assert.deepEqual([event,index],[(seed%7+round)%7,(Math.floor(seed/7)+round)%2]);
      }
      assert.equal(names.size,7);
    }
  }
});

test('all canonical answers and aliases match and respect their letter constraint',()=>{
  for(const [,rows] of questions)for(const {prompt,bank} of rows){
    const rule=prompt.match(/Your answer (starts with|ends with|contains) “(.)”/);
    for(const entry of bank){
      assert(tiers.includes(entry.points));
      for(const word of [entry.canonical,...entry.aliases]){
        assert(matchAnswer(bank,word).match,prompt+' '+word);
        if(rule){
          const spelling=normalize(word),letter=rule[2].toLowerCase();
          assert(rule[1]==='contains'?spelling.includes(letter):rule[1]==='starts with'?spelling.startsWith(letter):spelling.endsWith(letter));
        }
      }
    }
  }
});

test('corrections require a unique close spelling, and numeric punctuation matters',()=>{
  const bank=['quartz','slate','plate','ion'].map(canonical=>({canonical,aliases:[]}));
  assert.equal(matchAnswer(bank,'qaurtz').suggestion,'quartz');
  assert.equal(matchAnswer(bank,'qaurtz').match,undefined);
  assert.equal(matchAnswer(bank,'qlate').suggestion,undefined);
  assert.equal(matchAnswer(bank,'iron').suggestion,undefined);
  assert.equal(matchAnswer([{canonical:'12',aliases:[]}],'-12').match,undefined);
  assert.equal(matchAnswer([{canonical:'12',aliases:[]}],'1.2').match,undefined);
});
