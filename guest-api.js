import {matchAnswer} from './matching.js';
import {judgeUrl} from './features.js';
import {isClosedList} from './catalog-data/closed-lists.js';

// An answer missing from the list goes to the AI judge when one is configured (features.js judgeUrl).
async function askJudge(prompt,answer){
  try{
    const response=await fetch(judgeUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,answer}),signal:AbortSignal.timeout(15000)});
    return response.ok?await response.json():{status:'unverified'};
  }catch{return {status:'unverified'}}
}

export function guestApi(body,question) {
  if (!body) return { signedIn: false, available: false };
  if (body.action !== 'validate') throw new Error('This feature needs the game server.');
  if (!question || question.prompt !== body.prompt) return {status:'catalog_changed'};
  const {bank}=question;
  const {match,suggestion}=matchAnswer(bank,body.answer,question.prompt);
  if(suggestion)return {status:'suggestion',suggestion};
  if(body.answer&&!match){
    // Fixed official lists (catalog-data/closed-lists.js) never go to the AI judge.
    if(!judgeUrl||isClosedList(question.prompt))return {status:'invalid'};
    // Only this path is asynchronous; api() in game.js awaits either kind of result.
    return askJudge(question.prompt,body.answer).then(verdict=>verdict.status!=='valid'
      ?{status:verdict.status==='unverified'?'unverified':'invalid'}
      :{status:'valid',points:verdict.points,canonical:verdict.canonical,judged:verdict.judged,examples:bank.slice(0,3).map(entry=>entry.canonical)});
  }
  return {
    status: match ? 'valid' : body.answer ? 'unverified' : 'skipped',
    points: match?.points ?? 0,
    canonical: match?.canonical,
    fact: match?.points === 100 ? match.fact : undefined,
    examples: bank.filter(entry => entry !== match).slice(0, 3).map(entry => entry.canonical)
  };
}
