import {matchAnswer} from '../matching.js';
import { normalize, questionFor } from '../answer-bank.js';
import { packs } from '../prompts.js';
import { modeAllowed } from '../features.js';
import { account, data, durable, equal, hash, passwordHash, salt, sign, today, verify } from '../dive-storage.js';
import { AI_POINTS, judgeAnswer } from '../judge.js';

async function validate(body) {
  const { seed, round, mode, answer, first, dive } = body;
  if (!Number.isInteger(seed) || seed < 0 || seed > 100000 ||
      !Number.isInteger(round) || round < 0 || round > 6 ||
      typeof dive !== 'string' || !/^[\da-f-]{36}$/.test(dive) ||
      typeof answer !== 'string' || answer.length > 100 ||
      !['Daily', 'Archive', 'Unlimited', ...packs.map(pack => pack[0])].includes(mode) || !modeAllowed(mode) ||
      (mode === 'Daily' && (seed !== today() || first != null)) ||
      (first != null && (!Number.isInteger(first) || first < 0 || first > 6))) return null;

  const { prompt, bank } = questionFor(seed, round, first, mode);
  if (body.prompt!==undefined && body.prompt!==prompt) return {status:'catalog_changed'};
  const normalized = normalize(answer);
  const {match,suggestion}=matchAnswer(bank,answer,prompt);
  if(suggestion)return {status:'suggestion',suggestion};
  let points = match?.points ?? 0;
  let status = answer ? 'invalid' : 'skipped';
  if (match) status = 'valid';
  else if (normalized && !/^\d+$/.test(bank[0].canonical)) {
    const key = 'judgment:' + hash(JSON.stringify([prompt, normalized]));
    try {
      let verdict = await data('GET', key);
      if (verdict == null) {
        const valid = await judgeAnswer(prompt, answer);
        if (valid != null) {
          await data('SET', key, valid ? 'valid' : 'invalid', 'NX');
          verdict = await data('GET', key) ?? (valid ? 'valid' : 'invalid');
        }
      }
      status = verdict ?? 'unverified';
      if (status === 'valid') points = AI_POINTS;
    } catch {
      status = 'unverified';
    }
  }
  if (mode !== 'Daily' && normalized) {
    await data('SET', 'practice:' + hash(JSON.stringify([prompt, normalized])),
      JSON.stringify({ prompt, answer: normalized, status, points })).catch(() => {});
  }
  if(answer && status!=='valid')return {status};
  return {
    points, status, canonical: match?.canonical, fact: match?.points === 100 ? match.fact : undefined,
    bank,
    examples: bank.filter(entry => entry !== match).slice(0, 3).map(entry => entry.canonical),
    receipt: sign({ type: 'round', seed, round, mode, points, dive }),
  };
}

async function complete(body, user) {
  if (!Array.isArray(body.receipts) || body.receipts.length !== 7) return null;
  const rounds = body.receipts.map(verify);
  const first = rounds[0];
  if (!first || !rounds.every((item, index) => item?.type === 'round' && item.round === index &&
      item.seed === first.seed && item.mode === first.mode && item.dive === first.dive)) return null;
  const score = rounds.reduce((sum, item) => sum + item.points * 10, 0);
  const { mode, dive, seed } = first;
  const date = new Date((mode === 'Daily' ? seed : today()) * 86400000).toISOString().slice(0, 10);
  if (user) {
    const record = JSON.stringify({ score, date, mode });
    await data('ZADD', 'history:' + user, 'NX', Date.now(), dive + ':' + record);
    if (packs.some(pack => pack[0] === mode)) await data('SET', 'pack:' + user + ':' + mode, '1');
  }
  if (mode !== 'Daily') return { score };
  const key = 'scores:' + seed;
  const anonymousId = hash(sign({ type: 'score', seed, id: user || dive }));
  await data('ZADD', key, 'NX', score, anonymousId);
  const recordedScore = Number(await data('ZSCORE', key, anonymousId));
  const [count, below] = await Promise.all([data('ZCARD', key), data('ZCOUNT', key, '-inf', '(' + recordedScore)]);
  return { score, percentile: Math.round(100 * below / count), count, global: durable };
}

async function profile(user) {
  if (!user) return { signedIn: false, available: durable && Boolean(process.env.DIVE_SECRET) };
  const history = await data('ZREVRANGE', 'history:' + user, 0, 24);
  const unlocked = await Promise.all(packs.map(async ([title]) => await data('GET', 'pack:' + user + ':' + title) ? title : null));
  return { signedIn: true, history: history.map(entry => JSON.parse(entry.slice(entry.indexOf(':') + 1))), packs: unlocked.filter(Boolean) };
}

export default async function handler(req, res) {
  const reply = (code, value) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(value));
  };
  try {
    const user = account(req);
    if (req.method === 'GET') return reply(200, await profile(user));
    if (req.method !== 'POST') return reply(405, { error: 'Method unavailable' });
    if (!(req.headers['content-type'] || '').startsWith('application/json')) return reply(415, { error: 'JSON required' });
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    if (!body || typeof body !== 'object') return reply(400, { error: 'Invalid request' });
    if (body.action === 'validate' || body.action === 'complete') {
      const result = await (body.action === 'validate' ? validate(body) : complete(body, user));
      return reply(result ? 200 : 400, result ?? { error: 'Invalid dive request' });
    }
    const secure = process.env.VERCEL ? '; Secure' : '';
    const cookie = 'dive_account=';
    const flags = '; Path=/; HttpOnly; SameSite=Strict' + secure;
    if (body.action === 'signout') {
      res.setHeader('Set-Cookie', cookie + '; Max-Age=0' + flags);
      return reply(200, await profile(null));
    }
    if (!durable || !process.env.DIVE_SECRET) return reply(503, { error: 'Accounts are unavailable on this server.' });
    const { username, password } = body;
    if (!['register', 'signin'].includes(body.action) || typeof username !== 'string' || !/^[a-z0-9_]{3,32}$/i.test(username) ||
        typeof password !== 'string' || password.length < 12 || password.length > 128) {
      return reply(400, { error: 'Use a 3–32 character username and a password of at least 12 characters.' });
    }
    const id = hash(username.toLowerCase());
    const key = 'account:' + id;
    if (body.action === 'register') {
      const uniqueSalt = salt();
      const stored = await data('SET', key, JSON.stringify({ salt: uniqueSalt, digest: passwordHash(password, uniqueSalt) }), 'NX');
      if (!stored) return reply(409, { error: 'That username is unavailable.' });
    } else {
      const stored = JSON.parse(await data('GET', key) ?? 'null');
      const digest = passwordHash(password, stored?.salt ?? id);
      if (!equal(stored?.digest, digest)) return reply(401, { error: 'Username or password is incorrect.' });
    }
    const expires = Date.now() + 30 * 86400000;
    res.setHeader('Set-Cookie', cookie + sign({ type: 'account', id, expires }) + '; Max-Age=2592000' + flags);
    return reply(200, await profile(id));
  } catch {
    return reply(503, { error: 'Dive service temporarily unavailable.' });
  }
}
