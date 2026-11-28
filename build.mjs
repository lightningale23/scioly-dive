import { mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { events, packs } from './prompts.js';

const staticGame = process.argv.includes('--pages');
const output = staticGame ? 'pages-dist' : 'dist';
let gameFile='game.js';
// Start clean so old hashed bundles do not pile up between builds.
await rm(output,{recursive:true,force:true});
if(staticGame){
  // One immutable module owns the view, schedule, validator and catalog for the whole dive.
  const {build}=await import('esbuild');
  // The bundle carries only prompts; each prompt's answers are a separate file fetched during the dive.
  const {pagesCatalog}=await import('./pages-catalog.mjs');
  const catalog=pagesCatalog();
  const promptOnly={name:'prompt-only-catalog',setup(b){
    b.onResolve({filter:/\/client-catalog\.js$/},()=>({path:'client-catalog',namespace:'pages-catalog'}));
    b.onLoad({filter:/.*/,namespace:'pages-catalog'},()=>({contents:catalog.source,loader:'js'}));
  }};
  const bundle=await build({
    entryPoints:['game.js'],bundle:true,format:'esm',platform:'browser',target:'es2022',
    outdir:output,entryNames:'game-[hash]',metafile:true,minify:true,plugins:[promptOnly],
  });
  await mkdir(output+'/banks',{recursive:true});
  for(const [file,json] of catalog.files)await writeFile(output+'/'+file,json);
  gameFile=Object.keys(bundle.metafile.outputs).find(file=>file.endsWith('.js')).split('/').pop();
  await copyFile('catalog-data/SOURCES.md',output+'/catalog-sources.txt');
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
      .replace('href="/vt323.woff2"', 'href="' + root + 'vt323.woff2"')
      .replace('src="/game.js"', 'src="' + root + gameFile + '"');
  }
  await writeFile(dir + '/index.html', pageHtml);
}

const assets=['style.css','vt323.woff2','vt323.ttf','VT323-LICENSE.txt'];
if(!staticGame){
  // Bundle game.js to include @vercel/analytics and other dependencies. Without a NODE_ENV the
  // analytics package assumes development and loads its debug script, which only logs to the
  // console and never sends page views, so Vercel builds (VERCEL is set there) say production.
  const {build}=await import('esbuild');
  await build({
    entryPoints:['game.js'],bundle:true,format:'esm',platform:'browser',target:'es2022',
    outfile:output+'/game.js',minify:false,
    define:{'process.env.NODE_ENV':JSON.stringify(process.env.VERCEL?'production':'development')},
  });
  assets.push('selection.js','features.js');
}else{
  // For static build, game.js is already bundled
}
for(const file of assets) await copyFile(file,output+'/'+file);
if(!staticGame){
  const {publicEvents}=await import('./answer-bank.js');
  await writeFile(output+'/client-catalog.js',"export {events,packs} from './prompts.js';\n");
  await writeFile(output+'/prompts.js','export const events = '+JSON.stringify(publicEvents)+';\nexport const packs = '+JSON.stringify(packs)+';\n');
}
