const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src', 'db');
const distDir = path.join(projectRoot, 'dist', 'db');

function copySqlFiles() {
  if (!fs.existsSync(srcDir)) {
    console.warn('Source DB directory not found, skipping SQL copy:', srcDir);
    return;
  }

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.sql'));
  if (files.length === 0) {
    console.warn('No .sql files found in', srcDir);
    return;
  }

  for (const file of files) {
    const src = path.join(srcDir, file);
    const dest = path.join(distDir, file);
    fs.copyFileSync(src, dest);
    console.log('Copied', src, '->', dest);
  }
}

try {
  copySqlFiles();
} catch (err) {
  console.error('Failed to copy SQL files:', err);
  process.exit(1);
}
