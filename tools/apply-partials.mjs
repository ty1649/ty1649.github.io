#!/usr/bin/env node
// Injects the shared sidenav and footer partials (tools/partials/*.html) into
// every page, so those blocks stop being hand copy-pasted across the site.
// Idempotent: re-running just re-normalizes every page to match the partial.
//
// Existing footer "last updated <date>" text is preserved (stamp-footer-dates.mjs
// owns the date, this script only owns structure). Pages with no <footer> at all
// get one inserted before the theme-toggle script tag.
//
// Usage: node tools/apply-partials.mjs

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const partialsDir = join(repoRoot, 'tools', 'partials');

const sidenavPartial = readFileSync(join(partialsDir, 'sidenav.html'), 'utf8').replace(/\n$/, '');
const footerPartial = readFileSync(join(partialsDir, 'footer.html'), 'utf8').replace(/\n$/, '');

const SIDENAV_RE = /[ \t]*<nav class="sidenav">[\s\S]*?<\/nav>/;
const FOOTER_RE = /[ \t]*<footer class="footer">[\s\S]*?<\/footer>/;
const LAST_UPDATED_RE = /last updated\s+([^<\n]*)/;
const THEME_SCRIPT_RE = /([ \t]*)<script src="\/scripts\/theme-toggle\.js"><\/script>/;

function findHtmlFiles(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        if (entry === '.git' || entry === 'node_modules') continue;
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
            if (full.startsWith(join(repoRoot, 'projects', 'old_layout'))) continue;
            findHtmlFiles(full, out);
        } else if (extname(entry) === '.html') {
            out.push(full);
        }
    }
    return out;
}

function applyToFile(filePath) {
    let content = readFileSync(filePath, 'utf8');
    let changed = false;

    if (SIDENAV_RE.test(content)) {
        const next = content.replace(SIDENAV_RE, sidenavPartial);
        if (next !== content) changed = true;
        content = next;
    } else {
        return { changed: false, skipped: true };
    }

    if (FOOTER_RE.test(content)) {
        const existingDate = content.match(FOOTER_RE)[0].match(LAST_UPDATED_RE);
        const date = existingDate ? existingDate[1].trim() : 'TBD';
        const footerWithDate = footerPartial.replace('last updated TBD', `last updated ${date}`);
        const next = content.replace(FOOTER_RE, footerWithDate);
        if (next !== content) changed = true;
        content = next;
    } else if (THEME_SCRIPT_RE.test(content)) {
        content = content.replace(THEME_SCRIPT_RE, (match, indent) => `${footerPartial}\n\n${indent}<script src="/scripts/theme-toggle.js"></script>`);
        changed = true;
    }

    return { changed, content };
}

const files = findHtmlFiles(repoRoot).sort();
let touched = 0;
for (const file of files) {
    const result = applyToFile(file);
    if (result.skipped) continue;
    if (result.changed) {
        writeFileSync(file, result.content);
        console.log(`updated ${file.slice(repoRoot.length + 1)}`);
        touched += 1;
    }
}
console.log(`\n${touched} file(s) updated.`);
