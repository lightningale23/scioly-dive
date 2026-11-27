// Lists answers the AI judge accepted, grouped by prompt, so good ones can be added to the answer lists.
// Usage: REVIEW_TOKEN=... npm run accepted -- https://<project>.vercel.app [day=today]
const [base, dayArg] = process.argv.slice(2);
if (!base || !process.env.REVIEW_TOKEN) { console.log('Usage: REVIEW_TOKEN=... npm run accepted -- https://<project>.vercel.app [day]'); process.exit(1); }
const day = Number(dayArg ?? Math.floor(Date.now() / 86400000));
const response = await fetch(new URL('/api/judge?day=' + day, base), {headers: {Authorization: 'Bearer ' + process.env.REVIEW_TOKEN}});
if (!response.ok) throw new Error('Review request failed: ' + response.status);
const byPrompt = new Map();
for (const {prompt, answer, points} of (await response.json()).accepted) byPrompt.set(prompt, [...(byPrompt.get(prompt) ?? []), answer + (points ? ' (' + points + ')' : '')]);
if (!byPrompt.size) console.log('No AI-accepted answers on day', day);
for (const [prompt, answers] of byPrompt) console.log('\n' + prompt.replace('\n', ' ') + '\n  ' + answers.join('; '));
