import {matchAnswer} from './matching.js';

export function guestApi(body,question) {
  if (!body) return { signedIn: false, available: false };
  if (body.action !== 'validate') throw new Error('This feature needs the game server.');
  if (!question || question.prompt !== body.prompt) return {status:'catalog_changed'};
  const {bank}=question;
  const {match,suggestion}=matchAnswer(bank,body.answer,question.prompt);
  if(suggestion)return {status:'suggestion',suggestion};
  if(body.answer&&!match)return {status:'invalid'};
  return {
    status: match ? 'valid' : body.answer ? 'unverified' : 'skipped',
    points: match?.points ?? 0,
    canonical: match?.canonical,
    fact: match?.points === 100 ? match.fact : undefined,
    examples: bank.filter(entry => entry !== match).slice(0, 3).map(entry => entry.canonical)
  };
}
