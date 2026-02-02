#!/usr/bin/env node
/**
 * Post-build script: logs dist/ contents and vercel.json presence for debug.
 * Writes NDJSON to .cursor/debug.log for hypothesis testing (H1,H2,H4,H5).
 */
const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '..', '.cursor', 'debug.log');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const VERCEL_JSON = path.join(__dirname, '..', 'vercel.json');

function listDir(dir, base = '') {
  const entries = [];
  try {
    const names = fs.readdirSync(dir);
    for (const name of names) {
      const full = path.join(dir, name);
      const rel = base ? base + '/' + name : name;
      const stat = fs.statSync(full);
      entries.push(stat.isDirectory() ? rel + '/' : rel);
      if (stat.isDirectory()) entries.push(...listDir(full, rel));
    }
  } catch (e) {
    entries.push('ERROR: ' + e.message);
  }
  return entries;
}

function appendLog(obj) {
  try {
    const dir = path.dirname(LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(LOG_PATH, JSON.stringify(obj) + '\n');
  } catch (e) {
    console.error('postbuild-log: could not write log', e.message);
  }
}

const distExists = fs.existsSync(DIST_DIR);
const distFiles = distExists ? listDir(DIST_DIR) : ['dist folder missing'];
const indexHtmlExists = distExists && fs.existsSync(path.join(DIST_DIR, 'index.html'));
const vercelJsonExists = fs.existsSync(VERCEL_JSON);
let vercelJsonContent = null;
if (vercelJsonExists) {
  try {
    vercelJsonContent = JSON.parse(fs.readFileSync(VERCEL_JSON, 'utf8'));
  } catch (_) {
    vercelJsonContent = 'parse error';
  }
}

// #region agent log
appendLog({
  sessionId: 'debug-session',
  runId: 'build',
  hypothesisId: 'H1',
  location: 'scripts/postbuild-log.js',
  message: 'Build completed; dist exists and index.html check',
  data: { distExists, indexHtmlExists, distFileCount: distFiles.length, distFiles: distFiles.slice(0, 20) },
  timestamp: Date.now()
});
appendLog({
  sessionId: 'debug-session',
  runId: 'build',
  hypothesisId: 'H2',
  location: 'scripts/postbuild-log.js',
  message: 'Output directory contents (for Vercel output dir comparison)',
  data: { outputDir: 'dist', distRootFiles: distFiles.filter(f => !f.includes('/')) },
  timestamp: Date.now()
});
appendLog({
  sessionId: 'debug-session',
  runId: 'build',
  hypothesisId: 'H4',
  location: 'scripts/postbuild-log.js',
  message: 'index.html at dist root',
  data: { indexHtmlAtRoot: indexHtmlExists, distFilesSample: distFiles.slice(0, 10) },
  timestamp: Date.now()
});
appendLog({
  sessionId: 'debug-session',
  runId: 'build',
  hypothesisId: 'H5',
  location: 'scripts/postbuild-log.js',
  message: 'vercel.json present and content',
  data: { vercelJsonExists, hasRewrites: vercelJsonContent?.rewrites?.length > 0, outputDirInConfig: vercelJsonContent?.outputDirectory },
  timestamp: Date.now()
});
// #endregion
