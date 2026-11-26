import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import handler from './api/dive.js';

const pages = new Set(['/', '/unlimited/classic', '/archive', '/packs', '/party']);
const assets = new Map([['/style.css', 'text/css'], ['/game.js', 'text/javascript'], ['/prompts.js', 'text/javascript'], ['/vt323.woff2', 'font/woff2']]);
createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '') || '/';
  if (path === '/api/dive') {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 16384) {
        res.writeHead(413).end();
        return;
      }
      chunks.push(chunk);
    }
    req.body = Buffer.concat(chunks).toString();
    return handler(req, res);
  }
  try {
    const page = pages.has(path);
    if (!page && !assets.has(path)) throw new Error('Unknown path');
    const file = page ? '/index.html' : path;
    const contents = await readFile(new URL('./dist' + file, import.meta.url));
    res.writeHead(200, { 'Content-Type': page ? 'text/html; charset=utf-8' : assets.get(path) + (path.endsWith('.woff2') ? '' : '; charset=utf-8') }).end(contents);
  } catch {
    res.writeHead(404).end();
  }
}).listen(Number(process.env.PORT || 4173));
