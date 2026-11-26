import {mkdir,copyFile,writeFile,readFile} from 'node:fs/promises';
import {events,packs} from './prompts.js';
const pages=['','unlimited/classic','archive','packs','party'];
const html=await readFile('index.html','utf8');
for(const page of pages){
  await mkdir('dist/'+page,{recursive:true});
  await writeFile('dist/'+page+'/index.html',html);
}
for(const file of ['style.css','game.js','vt323.woff2']){
  try { await copyFile(file,'dist/'+file); }
  catch(error){ if(file!=='vt323.woff2'||error.code!=='ENOENT') throw error; }
}

const publicEvents = events.map(([event, entries]) => [event, entries.map(([prompt]) => prompt)]);
await writeFile('dist/prompts.js', 'export const events = '+JSON.stringify(publicEvents)+';\nexport const packs = '+JSON.stringify(packs)+';\n');
