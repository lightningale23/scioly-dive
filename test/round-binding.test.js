import test from 'node:test';
import assert from 'node:assert/strict';
import {guestApi} from '../guest-api.js';
import {questions,questionFor} from '../answer-bank.js';
import handler from '../api/dive.js';
import {today} from '../dive-storage.js';
import {dailyOnly} from '../features.js';

test('Pages uses the painted question for examples, acceptance and corrections',()=>{
  const rows=questions.flatMap(([,entries])=>entries);
  for(const question of rows){
    const body={action:'validate',prompt:question.prompt,answer:question.bank[0].canonical};
    const result=guestApi(body,question);
    assert.equal(result.status,'valid',question.prompt);
    assert(result.examples.every(example=>question.bank.some(entry=>entry.canonical===example)));
    assert.equal(guestApi({...body,prompt:'old release'},question).status,'catalog_changed');
  }
  const logic=rows.find(q=>q.prompt.includes('logic gate you could find'));
  for(const answer of ['AND gate','inverter','exclusive OR gate']){
    assert.equal(guestApi({action:'validate',prompt:logic.prompt,answer},logic).status,'valid');
  }
  assert.equal(guestApi({action:'validate',prompt:logic.prompt,answer:'tibia'},logic).status,'invalid');
});
test('Node refuses a different displayed prompt before grading even a correct scheduled answer',async()=>{
  const mode='Daily',seed=today(),round=0;
  const question=questionFor(seed,round,undefined,mode);
  let result;
  await handler({method:'POST',headers:{'content-type':'application/json'},body:{
    action:'validate',seed,round,mode,dive:'00000000-0000-4000-8000-000000000000',prompt:'Other prompt',answer:question.bank[0].canonical
  }},{setHeader(){},end(s){result=JSON.parse(s)}});
  assert.deepEqual(result,{status:'catalog_changed'});
});

test('paused modes are refused by the server while the site is Daily-only',async()=>{
  if(!dailyOnly)return;
  for(const mode of ['Unlimited','Archive','Field Notebook']){
    let result;
    await handler({method:'POST',headers:{'content-type':'application/json'},body:{
      action:'validate',seed:42,round:0,mode,dive:'00000000-0000-4000-8000-000000000000',answer:'x'
    }},{setHeader(){},end(s){result=JSON.parse(s)}});
    assert.equal(result.error,'Invalid dive request',mode);
  }
});
