import {matchAnswer} from './catalog/matching.js';
import { questionFor } from './catalog/answer-bank.js';

export function guestApi(body) {
  if (!body) return { signedIn: false, available: false };
  if (body.action !== 'validate') throw new Error('This feature needs the game server.');
  const { bank } = questionFor(body.seed, body.round, body.first, body.mode);
  const {match,suggestion}=matchAnswer(bank,body.answer);
  if(suggestion)return {status:'suggestion',suggestion};
  if(body.answer&&!match)return {status:'invalid'};
  return {
    status: match ? 'valid' : body.answer ? 'unverified' : 'skipped',
    points: match?.points ?? 0,
    canonical: match?.canonical,
    examples: bank.filter(entry => entry !== match).slice(0, 3).map(entry => entry.canonical)
  };
}
