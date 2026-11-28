// Draws the site icons as pixel art in the game's palette: a krill (the One in a Krillion's gold
// sparkle beside it) for the browser tab, and the same krill in the ocean, circled by cyan
// electron orbits like an atom, for the iPhone home screen. Writes icon.svg and apple-touch-icon.png.
// Run with `npm run icons` after changing a sprite or color; no dependencies.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const colors = {
  P: '#ff5d8f', // body (the site's pink)
  D: '#b8336a', // underside and segment lines
  L: '#ffa8c4', // highlight, antennae
  d: '#c94a7c', // legs
  K: '#050a14', // eye
  W: '#e8f1ff', // eye glint
  G: '#ffe588', // One in a Krillion gold
  g: '#b39a45', // sparkle tips
  C: '#4de3ff', // orbit and electron (the site's cyan)
  c: '#2a7f99', // far side of the orbit
};

const krill = [
  '......................',
  'L.....................',
  '.L......LLLLL.........',
  '..L...LLPPPPPLL.......',
  '...LLLPPPPPPPDPLL.....',
  '....KKWPPPPPPDPPDLL...',
  '....KKKPPPPPPDPPDPPL..',
  '.LLLPPPPPPPPPDPPDPPDL.',
  'L....DPPPPPPPDPPDPPDPL',
  '......DDDDDDDDDDDDPDPP',
  '.....d.d.d.d.d.....DPP',
  '....d.d.d.d.d.....LPPD',
  '.................LPPD.',
  '...............LLPPD..',
  '.............LLPPDD...',
  '...........LLPPPDD....',
  '..........LPPLDD......',
  '.........LPDLPD.......',
  '.........DD..DD.......',
];

const sparkle = ['..g..', '..G..', 'gGGGg', '..G..', '..g..'];

const grid = (size, fill = null) => Array.from({ length: size }, () => Array(size).fill(fill));
const stamp = (canvas, sprite, x0, y0) => sprite.forEach((row, y) => [...row].forEach((c, x) => {
  if (colors[c] && canvas[y0 + y]?.[x0 + x] !== undefined) canvas[y0 + y][x0 + x] = colors[c];
}));

// Browser tab: the krill on a dark tile with stepped corners, sparkle top right.
function tabIcon() {
  const size = 24, canvas = grid(size, '#0b1526');
  for (const [x, y] of [[0, 0], [1, 0], [0, 1]]) for (const [cx, cy] of [[x, y], [size - 1 - x, y], [x, size - 1 - y], [size - 1 - x, size - 1 - y]]) canvas[cy][cx] = null;
  stamp(canvas, krill, 1, 4);
  stamp(canvas, sparkle, 18, 1);
  return canvas;
}

// Home screen: ocean bands like the game's dive, two electron orbits around the krill, the sparkle.
function homeIcon() {
  const size = 36, canvas = grid(size);
  const bands = ['#24577f', '#1d4669', '#173753', '#122a42', '#0e2034', '#0b1829', '#091423'];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) canvas[y][x] = bands[Math.min(bands.length - 1, Math.floor(y / 5.2))];
  for (const [x, y] of [[4, 27], [30, 25], [6, 8], [27, 31], [12, 31]]) canvas[y][x] = '#468bb5';
  for (const [x, y] of [[3, 30], [31, 22]]) canvas[y][x] = '#78bce8';
  // Two crossed orbits make an atom with the krill as its nucleus; the far halves pass behind it.
  const orbits = [-0.5, 0.5].map((tilt) => (t) => {
    const cx = 18, cy = 18, rx = 15.5, ry = 5;
    const ex = rx * Math.cos(t), ey = ry * Math.sin(t);
    return [Math.round(cx + ex * Math.cos(tilt) - ey * Math.sin(tilt)), Math.round(cy + ex * Math.sin(tilt) + ey * Math.cos(tilt))];
  });
  const trace = (front) => orbits.forEach((at) => {
    for (let t = 0; t < Math.PI * 2; t += 0.004) {
      if ((Math.sin(t) > 0) !== front) continue;
      const [x, y] = at(t);
      if (canvas[y]?.[x] !== undefined) canvas[y][x] = front ? colors.C : colors.c;
    }
  });
  trace(false);
  stamp(canvas, krill, 7, 9);
  trace(true);
  // An electron on the near side of each orbit.
  for (const [at, t] of [[orbits[0], 2.2], [orbits[1], 0.75]]) {
    const [ex, ey] = at(t);
    for (const [dx, dy, c] of [[0, -2, 'c'], [-2, 0, 'c'], [1, -1, 'c'], [-1, 1, 'c'], [0, 0, 'W'], [-1, -1, 'C'], [0, -1, 'C'], [-1, 0, 'C']]) canvas[ey + dy][ex + dx] = colors[c];
  }
  stamp(canvas, sparkle, 27, 3);
  return canvas;
}

function svg(canvas) {
  const size = canvas.length;
  let body = '';
  canvas.forEach((row, y) => {
    for (let x = 0; x < size;) {
      const color = row[x];
      let run = 1;
      while (x + run < size && row[x + run] === color) run++;
      if (color) body += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${color}"/>`;
      x += run;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${body}</svg>\n`;
}

function png(canvas, scale) {
  const size = canvas.length * scale;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const color = canvas[Math.floor(y / scale)][Math.floor(x / scale)];
      const at = y * (size * 4 + 1) + 1 + x * 4;
      if (color) raw.writeUInt32BE((parseInt(color.slice(1), 16) << 8 | 0xff) >>> 0, at);
    }
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ n >>> 1 : n >>> 1; return n >>> 0; });
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ c >>> 8; return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const out = Buffer.alloc(data.length + 12);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 'ascii');
    data.copy(out, 8);
    out.writeUInt32BE(crc(out.subarray(4, data.length + 8)), data.length + 8);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const root = new URL('../', import.meta.url);
writeFileSync(new URL('icon.svg', root), svg(tabIcon()));
writeFileSync(new URL('apple-touch-icon.png', root), png(homeIcon(), 5));
console.log('Wrote icon.svg (24 px grid) and apple-touch-icon.png (180 px).');
