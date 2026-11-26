import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { events, packs } from './prompts.js';

const staticGame = process.argv.includes('--pages');
const output = staticGame ? 'pages-dist' : 'dist';
let gameFile='game.js';
if(staticGame){
  // One immutable module owns the view, schedule, validator and catalog for the whole dive.
  const {build}=await import('esbuild');
  const bundle=await build({
    entryPoints:['game.js'],bundle:true,format:'esm',platform:'browser',target:'es2022',
    outdir:output,entryNames:'game-[hash]',metafile:true,minify:true,
  });
  gameFile=Object.keys(bundle.metafile.outputs)[0].split('/').pop();
  // Old cached HTML still requests this entry point.
  await copyFile(output+'/'+gameFile,output+'/game.js');
}
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
      .replace('src="/game.js"', 'src="' + root + gameFile + '"');
  }
  await writeFile(dir + '/index.html', pageHtml);
}

const assets=['style.css','vt323.ttf','VT323-LICENSE.txt'];
if(!staticGame) assets.push('game.js','selection.js');
for(const file of assets) await copyFile(file,output+'/'+file);
if(!staticGame){
  const publicEvents=events.map(([event,entries])=>[event,entries.map(([prompt])=>prompt)]);
  await writeFile(output+'/client-catalog.js',"export {events,packs} from './prompts.js';\n");
  await writeFile(output+'/prompts.js','export const events = '+JSON.stringify(publicEvents)+';\nexport const packs = '+JSON.stringify(packs)+';\n');
}
