import test from 'node:test';
import assert from 'node:assert/strict';
import {questionFor} from '../answer-bank.js';
import {today} from '../dive-storage.js';

// Calls api/judge.js the way Vercel would, with Gemini's HTTP API replaced by a stub.
async function call(handler, body, origin = 'https://lightningale23.github.io') {
  const headers = {}, res = {statusCode: 0, setHeader: (k, v) => { headers[k] = v; }, end: text => { res.body = text; }};
  await handler({method: 'POST', headers: {origin, 'x-forwarded-for': '203.0.113.9'}, body: JSON.stringify(body), url: '/api/judge'}, res);
  return {status: res.statusCode, headers, json: JSON.parse(res.body)};
}

test('the AI judge only rules on unlisted answers to current Dailies, once per answer', async () => {
  process.env.GEMINI_API_KEY = 'test-key';
  const realFetch = globalThis.fetch;
  const asked = [];
  globalThis.fetch = async (url, options) => {
    const {answer} = JSON.parse(JSON.parse(options.body).contents[0].parts[0].text);
    asked.push(answer);
    return new Response(JSON.stringify({candidates: [{content: {parts: [{text: JSON.stringify({valid: answer === 'bronchogenic cyst'})}]}}]}));
  };
  try {
    const {default: handler} = await import('../api/judge.js');
    const question = questionFor(today(), 0, undefined, 'Daily');
    const listed = question.bank.find(entry => entry.points === 85);

    const inList = await call(handler, {prompt: question.prompt, answer: listed.canonical});
    assert.deepEqual([inList.json.status, inList.json.points], ['valid', 85]);
    assert.equal(inList.headers['Access-Control-Allow-Origin'], 'https://lightningale23.github.io');

    const first = await call(handler, {prompt: question.prompt, answer: 'bronchogenic cyst'});
    const again = await call(handler, {prompt: question.prompt, answer: 'Bronchogenic Cyst'});
    assert.deepEqual([first.json.status, first.json.points, first.json.judged], ['valid', 60, true]);
    assert.equal(again.json.status, 'valid');
    const rejected = await call(handler, {prompt: question.prompt, answer: 'pizza'});
    assert.equal(rejected.json.status, 'invalid');
    assert.deepEqual(asked, ['bronchogenic cyst', 'pizza'], 'listed answers and repeat answers never reach the AI');

    const stranger = await call(handler, {prompt: 'Name a country.', answer: 'France'});
    assert.equal(stranger.status, 400);
    const otherSite = await call(handler, {prompt: question.prompt, answer: listed.canonical}, 'https://example.com');
    assert.equal(otherSite.headers['Access-Control-Allow-Origin'], undefined);
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.GEMINI_API_KEY;
  }
});
