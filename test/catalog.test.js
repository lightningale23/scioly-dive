import test from 'node:test';
import assert from 'node:assert/strict';
import {events} from '../prompts.js';
import {questions, questionFor, tiers, publicEvents} from '../answer-bank.js';
import {selection} from '../selection.js';
import {matchAnswer, normalize} from '../matching.js';

test('public prompts and scored banks agree across modes and historical seeds',()=>{
  const published=publicEvents;
  for(const mode of ['Daily','Archive','Unlimited','Field Notebook']){
    for(const seed of [0,1234,20782,20783,20784,99999]){
      const names=new Set(), first=mode==='Field Notebook'?2:undefined;
      for(let round=0;round<7;round++){
        const [event,index]=selection(published,seed,round,first,mode);
        const entry=published[event][1][index];
        assert.equal(entry.prompt??entry,questionFor(seed,round,first,mode).prompt);
        names.add(event);
        if(seed===20782 && mode==='Archive')assert.deepEqual([event,index],[(seed%7+round)%7,(Math.floor(seed/7)+round)%2]);
      }
      assert.equal(names.size,7);
    }
  }
});

test('all canonical answers and aliases match and respect their letter constraint',()=>{
  for(const [,rows] of questions)for(const {prompt,bank} of rows){
    const rule=prompt.match(/\n(Start with|End with|Include) the letter ([A-Z])\./);
    for(const entry of bank){
      assert(tiers.includes(entry.points));
      for(const word of [entry.canonical,...entry.aliases]){
        assert(matchAnswer(bank,word).match,prompt+' '+word);
        if(rule){
          const spelling=normalize(word),letter=rule[2].toLowerCase();
          assert(rule[1]==='Include'?spelling.includes(letter):rule[1]==='Start with'?spelling.startsWith(letter):spelling.endsWith(letter));
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
test('a dive can have zero or one spelling challenge across seven different events',()=>{
  const counts=new Set();
  for(let seed=0;seed<500;seed++){
    const selected=Array.from({length:7},(_,r)=>selection(events,seed,r,undefined,'Unlimited'));
    assert.equal(new Set(selected.map(([event])=>event)).size,7);
    const count=selected.filter(([event,index])=>events[event][1][index][0].includes('\n')).length;
    assert(count<=1);
    counts.add(count);
  }
  assert.deepEqual([...counts].sort(),[0,1]);
});

test('featured Dailies name real prompts in seven different events, and paused events never appear',async()=>{
  const {featuredDailies,pausedEvents}=await import('../features.js');
  for(const [day,rounds] of Object.entries(featuredDailies)){
    assert.equal(rounds.length,7);
    assert.equal(new Set(rounds.map(([event])=>event)).size,7);
    rounds.forEach(([event,prompt],round)=>{
      assert.equal(questionFor(Number(day),round,undefined,'Daily').prompt,prompt,event);
      assert(!pausedEvents.includes(event));
    });
  }
  for(const mode of ['Daily','Unlimited'])for(let seed=20783;seed<20983;seed++)for(let round=0;round<7;round++){
    const [event]=selection(publicEvents,seed,round,undefined,mode);
    assert(!pausedEvents.includes(publicEvents[event][0]),seed+' '+round);
  }
});

test('every obvious answer is an accepted canonical answer of its prompt, and every fact has an answer',async()=>{
  const {obviousAnswers}=await import('../catalog-data/obvious-answers.js');
  const {factAnswers}=await import('../catalog-data/krillion-facts.js');
  const rows=questions.flatMap(([,r])=>r);
  for(const [prompt,lists] of Object.entries(obviousAnswers)){
    const row=rows.find(r=>r.prompt===prompt);
    assert(row,'No prompt: '+prompt);
    const names=new Set(row.bank.map(entry=>normalize(entry.canonical)));
    for(const name of lists.slice(0,2).join(';').split(';'))assert(names.has(normalize(name)),prompt+' → '+name.trim());
  }
  const spellings=new Set(rows.flatMap(r=>r.bank.flatMap(e=>[e.canonical,...e.aliases].map(normalize))));
  for(const answer of factAnswers)assert(spellings.has(normalize(answer)),'No answer for fact: '+answer);
});

test('every closed list names a real base prompt', async () => {
  const {closedLists} = await import('../catalog-data/closed-lists.js');
  const prompts = new Set(questions.flatMap(([, rows]) => rows.map(row => row.prompt)));
  for (const prompt of closedLists) assert(prompts.has(prompt), 'closed list is not a prompt: ' + prompt);
});
