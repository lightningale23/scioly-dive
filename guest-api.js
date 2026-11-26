import { normalize, questionFor } from './catalog/answer-bank.js';

export function guestApi(body) {
  if (!body) return { signedIn: false, available: false };
  if (body.action !== 'validate') throw new Error('This feature needs the game server.');
  const { bank } = questionFor(body.seed, body.round, body.first);
  const guess = normalize(body.answer);
  const match = bank.find(entry => [entry.canonical, ...entry.aliases].some(alias => normalize(alias) === guess));
  return {
    status: match ? 'valid' : body.answer ? 'unverified' : 'skipped',
    points: match?.points ?? 0,
    canonical: match?.canonical,
    examples: bank.filter(entry => entry !== match).slice(0, 3).map(entry => entry.canonical)
  };
}
