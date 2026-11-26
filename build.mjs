import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { events, packs } from './prompts.js';

const staticGame = process.argv.includes('--pages');
const output = staticGame ? 'pages-dist' : 'dist';
const pages = ['', 'unlimited/classic', 'archive', 'packs', 'party'];
const html = await readFile('index.html', 'utf8');

for (const page of pages) {
  const dir = page ? output + '/' + page : output;
  await mkdir(dir, {recursive: true});
  let pageHtml = html;
  if (staticGame) {
    const root = page ? '../'.repeat(page.split('/').length) : './';
    pageHtml = html.replace('<html ', '<html data-static-game ')
      .replace('href="/style.css"', 'href="' + root + 'style.css"')
      .replace('src="/game.js"', 'src="' + root + 'game.js"');
  }
  await writeFile(dir + '/index.html', pageHtml);
}

for (const file of ['style.css', 'game.js', 'selection.js', 'vt323.woff2']) {
  try { await copyFile(file, output + '/' + file); }
  catch (error) { if (file !== 'vt323.woff2' || error.code !== 'ENOENT') throw error; }
}

const publicEvents = events.map(([event, entries]) => [event, entries.map(([prompt]) => prompt)]);
await writeFile(output + '/prompts.js', 'export const events = ' + JSON.stringify(publicEvents) + ';\nexport const packs = ' + JSON.stringify(packs) + ';\n');

if (staticGame) {
  await mkdir(output + '/catalog', {recursive: true});
  for (const file of ['prompts.js', 'answer-bank.js','selection.js','expand-catalog.js','topics.js','measurements.js','numerical-prompts.js','matching.js']) {
    await copyFile(file, output + '/catalog/' + file);
  }
  await copyFile('guest-api.js', output + '/guest-api.js');
}
