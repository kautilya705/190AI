#!/usr/bin/env node
/**
 * Copies built app from dist/ to public/ so Vercel can serve it when
 * Framework is detected as "Other" (Vercel prioritizes public/ in that case).
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(distDir)) {
  console.error('copy-dist-to-public: dist/ not found');
  process.exit(1);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy index.html to public so root request can be served from public/
const distIndex = path.join(distDir, 'index.html');
if (fs.existsSync(distIndex)) {
  fs.copyFileSync(distIndex, path.join(publicDir, 'index.html'));
}

// Copy assets to public/assets/
const distAssets = path.join(distDir, 'assets');
if (fs.existsSync(distAssets)) {
  const publicAssets = path.join(publicDir, 'assets');
  if (fs.existsSync(publicAssets)) fs.rmSync(publicAssets, { recursive: true });
  copyRecursive(distAssets, publicAssets);
}

// #region agent log
const LOG_PATH = path.join(__dirname, '..', '.cursor', 'debug.log');
try {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const publicIndexExists = fs.existsSync(path.join(publicDir, 'index.html'));
  fs.appendFileSync(LOG_PATH, JSON.stringify({ sessionId: 'debug-session', runId: 'build', hypothesisId: 'H2', location: 'scripts/copy-dist-to-public.js', message: 'Post-fix: built app copied to public/', data: { publicIndexExists, outputDir: 'public' }, timestamp: Date.now() }) + '\n');
} catch (_) {}
// #endregion
