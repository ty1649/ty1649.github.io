#!/usr/bin/env node
// Replaces every footer "last updated <date>" string with a date derived
// from git history, so no page ever carries a hand-typed date again.
//
// For each HTML file: if the file has uncommitted changes, stamp today's
// date (the date it will actually be committed). Otherwise, stamp the date
// of the last commit that touched the file.
//
// Usage: node tools/stamp-footer-dates.mjs
// Run this as the last step before committing content changes.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const LAST_UPDATED_RE = /(last updated\s+)([^<\n]*)/;

function sh(args) {
    return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim();
}

function hasUncommittedChanges(relPath) {
    const out = sh(['status', '--porcelain', '--', relPath]);
    return out.length > 0;
}

function lastCommitDate(relPath) {
    return sh(['log', '-1', '--date=format:%b %Y', '--format=%cd', '--', relPath]);
}

function todayFormatted() {
    const d = new Date();
    const month = d.toLocaleString('en-US', { month: 'short' });
    return `${month} ${d.getFullYear()}`;
}

function findHtmlFilesWithFooterDate() {
    const out = sh(['ls-files', '*.html']);
    return out
        .split('\n')
        .filter(Boolean)
        .filter((f) => LAST_UPDATED_RE.test(readFileSync(path.join(repoRoot, f), 'utf8')));
}

function stampFile(relPath) {
    const abs = path.join(repoRoot, relPath);
    const content = readFileSync(abs, 'utf8');
    if (!LAST_UPDATED_RE.test(content)) return null;

    const date = hasUncommittedChanges(relPath) ? todayFormatted() : lastCommitDate(relPath);
    const updated = content.replace(LAST_UPDATED_RE, (_match, prefix) => `${prefix}${date}`);

    if (updated !== content) {
        writeFileSync(abs, updated);
    }
    return date;
}

const files = findHtmlFilesWithFooterDate();
let changed = 0;
for (const relPath of files) {
    const date = stampFile(relPath);
    console.log(`${relPath} -> ${date}`);
    changed += 1;
}
console.log(`\nStamped ${changed} file(s).`);
