#!/usr/bin/env node
// Walks every .html file in the repo and reports broken <img src>,
// broken CSS background-image: url(), and broken internal <a href>.
// Exits non-zero if any broken reference is found.

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['.git', 'node_modules']);

const EXTERNAL_PREFIXES = ['http://', 'https://', '//', 'mailto:', 'tel:', 'javascript:', 'data:'];

function findHtmlFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      findHtmlFiles(full, out);
    } else if (extname(entry) === '.html') {
      out.push(full);
    }
  }
  return out;
}

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, (match) =>
    // preserve newlines inside the comment so later line numbers stay accurate
    match.replace(/[^\n]/g, ' ')
  );
}

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}

function isExternal(url) {
  if (!url) return false;
  return EXTERNAL_PREFIXES.some((p) => url.toLowerCase().startsWith(p));
}

function getBaseDir(rawHtml, fileDir) {
  // Several project pages set <base href="images/<slug>/" /> in <head>, which
  // HTML resolves all relative URLs in the document against (img src, a href,
  // and background-image: url() in inline <style>/style attributes alike).
  const m = rawHtml.match(/<base\b[^>]*\bhref\s*=\s*["']([^"']*)["']/i);
  if (!m) return fileDir;
  const href = m[1].trim();
  if (isExternal(href) || href === '') return fileDir;
  return href.startsWith('/') ? resolve(REPO_ROOT, '.' + href) : resolve(fileDir, href);
}

function resolveInternal(url, baseDir) {
  // strip query string / hash fragment before resolving to a filesystem path
  let clean = url.split('#')[0].split('?')[0];
  if (clean === '') return null; // caller handles empty separately
  // path.resolve() drops trailing slashes, so append index.html before
  // resolving rather than after, or a directory ref like "/projects/"
  // silently resolves to a path with no extension.
  if (clean.endsWith('/')) clean += 'index.html';
  // absolute-path references ignore <base>'s path and resolve from repo root
  const base = clean.startsWith('/') ? REPO_ROOT : baseDir;
  return resolve(base, clean.startsWith('/') ? '.' + clean : clean);
}

function checkExists(target) {
  if (existsSync(target)) return true;
  // directory without trailing slash: try its index.html
  if (existsSync(target + '/index.html')) return true;
  return false;
}

const ATTR_PATTERNS = [
  { kind: 'img', re: /<img\b[^>]*\bsrc\s*=\s*["']([^"']*)["']/gi },
  { kind: 'a', re: /<a\b[^>]*\bhref\s*=\s*["']([^"']*)["']/gi },
  { kind: 'bg', re: /background-image\s*:\s*url\(\s*['"]?([^'")]*)['"]?\s*\)/gi },
];

function checkFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const stripped = stripComments(raw);
  const fileDir = dirname(filePath);
  const baseDir = getBaseDir(stripped, fileDir);
  const relFile = filePath.slice(REPO_ROOT.length + 1);
  const issues = [];

  for (const { kind, re } of ATTR_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(stripped)) !== null) {
      const url = m[1].trim();
      const line = lineNumberAt(stripped, m.index);

      if (url === '') {
        issues.push({ kind, url, line, reason: 'empty' });
        continue;
      }
      if (kind === 'a' && url.startsWith('#')) continue; // in-page anchor
      if (isExternal(url)) continue;

      const target = resolveInternal(url, baseDir);
      if (target && !checkExists(target)) {
        issues.push({ kind, url, line, reason: 'not found' });
      }
    }
  }

  return { relFile, issues };
}

function main() {
  const htmlFiles = findHtmlFiles(REPO_ROOT).sort();
  const results = htmlFiles.map(checkFile).filter((r) => r.issues.length > 0);

  const KIND_LABEL = { img: 'img src', a: 'a href', bg: 'background-image url()' };

  let total = 0;
  for (const { relFile, issues } of results) {
    console.log(`\n${relFile}`);
    for (const { kind, url, line, reason } of issues) {
      total++;
      const shown = url === '' ? '(empty)' : url;
      console.log(`  line ${line}: ${KIND_LABEL[kind]} ${reason} -> ${shown}`);
    }
  }

  console.log(`\n${total} broken reference(s) across ${results.length} file(s), ${htmlFiles.length} file(s) scanned.`);
  process.exit(total > 0 ? 1 : 0);
}

main();
