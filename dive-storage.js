import { createHash, createHmac, randomBytes, timingSafeEqual, scryptSync } from 'node:crypto';

const secret = process.env.DIVE_SECRET || randomBytes(32);
export const today = () => Math.floor(Date.now() / 86400000);
export const hash = value => createHash('sha256').update(value).digest('hex');
export const passwordHash = (password, salt) => scryptSync(password, salt, 64).toString('hex');
export const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export const salt = () => randomBytes(16).toString('hex');
export function sign(value) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
  return payload + '.' + createHmac('sha256', secret).update(payload).digest('hex');
}
export function verify(token) {
  if (typeof token !== 'string' || !/^[\w-]+\.[a-f0-9]{64}$/.test(token)) return null;
  const [payload, signature] = token.split('.');
  if (!equal(signature, createHmac('sha256', secret).update(payload).digest('hex'))) return null;
  return JSON.parse(Buffer.from(payload, 'base64url').toString());
}
export function account(req) {
  const token = /(?:^|;\s*)dive_account=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  const session = verify(token);
  return session?.type === 'account' && session.expires > Date.now() ? session.id : null;
}

export const durable = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const memory = new Map();
export async function data(command, key, ...args) {
  key = 'scioly:v1:' + key;
  if (durable) {
    const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
      method: 'POST', headers: { Authorization: 'Bearer ' + process.env.UPSTASH_REDIS_REST_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify([command, key, ...args]), signal: AbortSignal.timeout(3000),
    });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error('Storage request failed');
    return result.result;
  }
  if (command === 'GET') return memory.get(key) ?? null;
  if (command === 'SET') {
    if (args.includes('NX') && memory.has(key)) return null;
    if (memory.size < 10000 || memory.has(key)) memory.set(key, args[0]);
    return 'OK';
  }
  if (command === 'ZADD') {
    if (!memory.has(key)) memory.set(key, new Map());
    const scores = memory.get(key);
    if (scores.has(args[2])) return 0;
    scores.set(args[2], args[1]);
    return 1;
  }
  if (command === 'ZSCORE') return memory.get(key)?.get(args[0]) ?? null;
  const scores = [...(memory.get(key)?.values() ?? [])];
  if (command === 'ZCARD') return scores.length;
  if (command === 'ZCOUNT') return scores.filter(score => score < Number(args[1].slice(1))).length;
  throw new Error('Unsupported storage command');
}
