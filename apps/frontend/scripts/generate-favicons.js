const fs = require('fs');
const { PNG } = require('pngjs');
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule && pngToIcoModule.default ? pngToIcoModule.default : pngToIcoModule;

function createPng(size, outPath) {
  const png = new PNG({ width: size, height: size });
  // Colors
  const green = { r: 30, g: 143, b: 89, a: 255 };
  const white = { r: 255, g: 255, b: 255, a: 255 };

  // fill background green
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = green.r;
      png.data[idx + 1] = green.g;
      png.data[idx + 2] = green.b;
      png.data[idx + 3] = green.a;
    }
  }

  // draw white cross (centered)
  const thickness = Math.max(2, Math.floor(size * 0.18));
  const arm = Math.floor(size * 0.45);
  const cx = Math.floor(size / 2);
  const cy = Math.floor(size / 2);

  // vertical
  for (let y = cy - arm; y <= cy + arm; y++) {
    for (let x = cx - Math.floor(thickness / 2); x <= cx + Math.floor(thickness / 2); x++) {
      if (x < 0 || x >= size || y < 0 || y >= size) continue;
      const idx = (size * y + x) << 2;
      png.data[idx] = white.r;
      png.data[idx + 1] = white.g;
      png.data[idx + 2] = white.b;
      png.data[idx + 3] = white.a;
    }
  }

  // horizontal
  for (let y = cy - Math.floor(thickness / 2); y <= cy + Math.floor(thickness / 2); y++) {
    for (let x = cx - arm; x <= cx + arm; x++) {
      if (x < 0 || x >= size || y < 0 || y >= size) continue;
      const idx = (size * y + x) << 2;
      png.data[idx] = white.r;
      png.data[idx + 1] = white.g;
      png.data[idx + 2] = white.b;
      png.data[idx + 3] = white.a;
    }
  }

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outPath, buffer);
  console.log('Wrote', outPath);
}

async function run() {
  const outDir = __dirname + '/..';
  const png64 = outDir + '/favicon-64.png';
  const png32 = outDir + '/favicon-32.png';
  createPng(64, png64);
  createPng(32, png32);
  const icoBuffer = await pngToIco([png64, png32]);
  fs.writeFileSync(outDir + '/favicon.ico', icoBuffer);
  console.log('Wrote', outDir + '/favicon.ico');
}

run().catch(err => { console.error(err); process.exitCode = 1; });
