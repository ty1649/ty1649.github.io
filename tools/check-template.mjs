#!/usr/bin/env node
// Reports which project pages declare which template version (data-template-version
// on <html>) and which have drifted from the canonical section schema defined in
// CLAUDE.md ("Project page schema": title -> italic intro line -> Outcome (visual
// proof folds in here, no separate Best Visual) -> What I did -> Images).
// Report-only -- never rewrites a page.
//
// Usage: node tools/check-template.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectsDir = join(repoRoot, 'projects');

// "images" is the canonical id for the gallery section. "best-visual" and
// "design-review" are legacy: Best Visual no longer gets its own section -- its
// content (slides/poster/demo video) lives inside Outcome instead. The rest are
// leftover ids from schemas this site no longer uses (Description/Summary/Images
// and Problem Statement/My Work/Results/Lessons Learned).
const BANNED_SECTION_IDS = new Set([
    'problem', 'summary', 'work', 'results', 'lessons', 'best-visual', 'design-review',
]);
const BANNED_HEADINGS = ['summary', 'lessons learned', 'best visual'];

function findProjectPages() {
    return readdirSync(projectsDir)
        .filter((f) => extname(f) === '.html')
        .filter((f) => f !== 'projtemplate.html' && f !== 'index.html')
        .sort()
        .map((f) => join(projectsDir, f));
}

function stripComments(html) {
    // Commented-out sections (e.g. content deliberately held back, see
    // personal-piglr.html) aren't live schema drift -- don't flag them.
    return html.replace(/<!--[\s\S]*?-->/g, '');
}

function checkFile(filePath) {
    const raw = readFileSync(filePath, 'utf8');
    const html = stripComments(raw);
    const relFile = filePath.slice(repoRoot.length + 1);
    const drift = [];

    const versionMatch = raw.match(/<html[^>]*\bdata-template-version="([^"]*)"/);
    const version = versionMatch ? versionMatch[1] : null;

    const sections = [...html.matchAll(/<section\s+id="([^"]+)"/g)].map((m) => ({
        id: m[1],
        index: m.index,
    }));
    for (const { id } of sections) {
        if (BANNED_SECTION_IDS.has(id)) {
            drift.push(`legacy section id "${id}"`);
        }
    }

    const headingMatches = [...html.matchAll(/<h2 class="section-title">([^<]*)<\/h2>/g)].map((m) => m[1].trim().toLowerCase());
    for (const heading of headingMatches) {
        if (BANNED_HEADINGS.includes(heading)) {
            drift.push(`banned heading "${heading}"`);
        }
    }

    const introMatch = html.match(/class="project-intro"/);
    if (!introMatch) {
        drift.push('missing intro line (.project-intro)');
    } else {
        const firstSection = sections[0];
        if (firstSection && firstSection.index < introMatch.index) {
            drift.push('intro line (.project-intro) should come before the first <section>');
        }
    }

    const outcomeIndex = sections.find((s) => s.id === 'outcome')?.index;
    const whatIDidIndex = sections.find((s) => s.id === 'what-i-did')?.index;
    if (outcomeIndex !== undefined && whatIDidIndex !== undefined && outcomeIndex > whatIDidIndex) {
        drift.push('"outcome" section should come before "what-i-did"');
    }
    if (outcomeIndex !== undefined && sections[0]?.id !== 'outcome') {
        drift.push('"outcome" should be the first section on the page');
    }

    if (/class="skills-section"/.test(html)) {
        drift.push('skill-tag block (.skills-section) should be removed -- see CLAUDE.md schema rules');
    }

    return { relFile, version, drift };
}

function main() {
    const results = findProjectPages().map(checkFile);

    console.log('Template version by page:');
    for (const { relFile, version } of results) {
        console.log(`  ${version ? `v${version}` : '(none declared)'.padEnd(15)}  ${relFile}`);
    }

    const drifted = results.filter((r) => r.drift.length > 0);
    console.log(`\nSchema drift (${drifted.length}/${results.length} page(s)):`);
    if (drifted.length === 0) {
        console.log('  none -- every page matches the canonical schema.');
    } else {
        for (const { relFile, drift } of drifted) {
            console.log(`\n  ${relFile}`);
            for (const issue of drift) console.log(`    - ${issue}`);
        }
    }

    process.exit(drifted.length > 0 ? 1 : 0);
}

main();
