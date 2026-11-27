// AI judging for the static Pages site. The browser calls this only when an answer isn't in the
// prompt's list. It accepts only prompts from the Dailies around today, enforces letter rules
// locally, caches every verdict (each answer is judged once per prompt, and every player gets the
// same ruling), limits calls per visitor and per day, and logs accepted answers for review.
// Environment: GEMINI_API_KEY (see judge.js), ALLOWED_ORIGINS (comma-separated; defaults to the
// GitHub Pages origin), JUDGE_DAILY_LIMIT (default 900 new judgments a day), JUDGE_VISITOR_LIMIT
// (default 60 a day), REVIEW_TOKEN (lets scripts/accepted-answers.mjs read the accepted log).
// Durable caching needs Upstash Redis (UPSTASH_REDIS_REST_URL and _TOKEN); without it, the cache and
// limits live in memory and reset when the function restarts.
import {matchAnswer} from '../matching.js';
import {normalize, questionFor} from '../answer-bank.js';
import {data, durable, hash, today} from '../dive-storage.js';
import {cachedPoints, judgeAnswer, judgeConfigured} from '../judge.js';

const origins = (process.env.ALLOWED_ORIGINS || 'https://lightningale23.github.io').split(',').map(origin => origin.trim());
const dailyLimit = Number(process.env.JUDGE_DAILY_LIMIT || 900);
const visitorLimit = Number(process.env.JUDGE_VISITOR_LIMIT || 60);

function dailyQuestion(prompt) {
  for (const day of [today(), today() - 1, today() + 1]) for (let round = 0; round < 7; round++) {
    const question = questionFor(day, round, undefined, 'Daily');
    if (question.prompt === prompt) return question;
  }
  return null;
}
function fitsLetterRule(prompt, answer) {
  const rule = prompt.match(/\n(Start with|End with|Include) the letter ([A-Z])\./);
  if (!rule) return true;
  const spelling = normalize(answer), letter = rule[2].toLowerCase();
  return rule[1] === 'Include' ? spelling.includes(letter) : rule[1] === 'Start with' ? spelling.startsWith(letter) : spelling.endsWith(letter);
}
// Counts toward a limit; returns false once the limit is passed.
async function underLimit(key, limit) {
  const count = Number(await data('INCR', key));
  if (count === 1) await data('EXPIRE', key, 172800);
  return count <= limit;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  const reply = (code, value) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(value));
  };
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  try {
    if (req.method === 'GET' && new URL(req.url, 'http://local').searchParams.has('health')) {
      // Says whether judging can run, without revealing any key. ?health=deep also makes one test call.
      const health = {configured: judgeConfigured(), provider: process.env.GEMINI_API_KEY ? 'gemini' : judgeConfigured() ? 'azure' : null,
        model: process.env.GEMINI_API_KEY ? process.env.GEMINI_MODEL || 'gemini-flash-lite-latest' : undefined, durableStorage: durable};
      if (new URL(req.url, 'http://local').searchParams.get('health') === 'deep' && health.configured) {
        try { health.testJudgment = await judgeAnswer('Name a noble gas.', 'neon'); } catch (error) { health.error = String(error.message).slice(0, 200); }
      }
      if (new URL(req.url, 'http://local').searchParams.get('health') === 'models' && process.env.GEMINI_API_KEY) {
        const list = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {headers: {'x-goog-api-key': process.env.GEMINI_API_KEY}});
        health.models = ((await list.json()).models ?? []).filter(model => model.supportedGenerationMethods?.includes('generateContent')).map(model => model.name.replace('models/', ''));
      }
      return reply(200, health);
    }
    if (req.method === 'GET') {
      // Accepted-answer log for review: GET /api/judge?day=20784 with Authorization: Bearer REVIEW_TOKEN.
      const token = process.env.REVIEW_TOKEN;
      if (!token || req.headers.authorization !== 'Bearer ' + token) return reply(403, {error: 'Review token required'});
      const day = Number(new URL(req.url, 'http://local').searchParams.get('day') ?? today());
      const entries = await data('ZRANGE', 'accepted:' + day, 0, -1);
      return reply(200, {day, accepted: (entries ?? []).map(entry => JSON.parse(entry))});
    }
    if (req.method !== 'POST') return reply(405, {error: 'Method unavailable'});
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const {prompt, answer} = body ?? {};
    if (typeof prompt !== 'string' || typeof answer !== 'string' || !answer.trim() || answer.length > 80) return reply(400, {error: 'Invalid request'});
    const question = dailyQuestion(prompt);
    if (!question) return reply(400, {error: 'Not a current Daily prompt'});
    const {match} = matchAnswer(question.bank, answer, prompt);
    if (match) return reply(200, {status: 'valid', points: match.points, canonical: match.canonical});
    if (!fitsLetterRule(prompt, answer)) return reply(200, {status: 'invalid'});
    if (!judgeConfigured()) return reply(200, {status: 'unverified'});

    const normalized = normalize(answer);
    const key = 'judgment:' + hash(JSON.stringify([prompt, normalized]));
    let verdict = await data('GET', key);
    if (verdict == null) {
      const visitor = hash(String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'unknown');
      if (!await underLimit('judge-day:' + today(), dailyLimit) || !await underLimit('judge-visitor:' + today() + ':' + visitor, visitorLimit))
        return reply(200, {status: 'unverified'});
      const points = await judgeAnswer(prompt, answer);
      await data('SET', key, String(points), 'NX');
      verdict = await data('GET', key) ?? String(points);
      if (cachedPoints(verdict)) await data('ZADD', 'accepted:' + today(), 'NX', Date.now(), JSON.stringify({prompt, answer: answer.trim(), points: cachedPoints(verdict)}));
    }
    const points = cachedPoints(verdict);
    return reply(200, points ? {status: 'valid', points, judged: true} : {status: 'invalid'});
  } catch (error) {
    console.error('AI judge failed:', error.message);
    // A short reason (no secrets) shows in the browser's network panel, which helps diagnose outages.
    return reply(200, {status: 'unverified', reason: String(error.message).slice(0, 120)});
  }
}
