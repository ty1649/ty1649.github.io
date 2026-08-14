#!/usr/bin/env node
// Regenerates projects/index.html's card grid from projects/projects.json,
// writing between the `<!-- projects-grid:start -->` / `<!-- projects-grid:end -->`
// markers and committing the result as static HTML. Kills the hand-maintained
// 13-card block (Phase 4, see CLAUDE.md).
//
// Usage: node tools/build-projects-grid.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectsJsonPath = path.join(repoRoot, 'projects', 'projects.json');
const indexPath = path.join(repoRoot, 'projects', 'index.html');

const CATEGORIES = [
    { key: 'clubs', id: 'clubs-section', heading: 'Extracurricular Clubs' },
    { key: 'research', id: 'research-section', heading: 'Research' },
    { key: 'personal', id: 'personal-section', heading: 'Personal Projects' },
];

function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}

function renderCard(p) {
    const affLine = p.affiliation
        ? `\n                        <p class="project-aff">${escapeHtml(p.affiliation)}</p>`
        : '';
    const star = p.onResume ? '\n                        <span class="resume-star">★</span>' : '';
    // href/cover are repo-controlled filenames, not user text -- left unescaped so an
    // "&" in a slug (clubs-mk10s&c.html) round-trips exactly through check-links.mjs's
    // regex-based (non-entity-decoding) href parser.
    return `                <a href="${p.href}" class="project-link">
                    <div class="project-card" style="background-image: url('${p.cover}')">
                        <span class="project-year">${escapeHtml(p.year)}</span>
                        <h2 class="project-title">${escapeHtml(p.title)}</h2>${affLine}
                        <p class="project-description">${escapeHtml(p.description)}</p>${star}
                    </div>
                </a>`;
}

function renderSection(category, projects) {
    const cards = projects
        .filter((p) => p.category === category.key && p.published !== false)
        .map(renderCard)
        .join('\n');
    return `        <div class="project-section" id="${category.id}">
            <h2>${category.heading}</h2>
            <div class="projects-grid">
${cards}
            </div>
        </div>`;
}

function main() {
    const { projects } = JSON.parse(readFileSync(projectsJsonPath, 'utf8'));
    const grid = CATEGORIES.map((c) => renderSection(c, projects)).join('\n\n');

    const html = readFileSync(indexPath, 'utf8');
    const START = '<!-- projects-grid:start -->';
    const END = '<!-- projects-grid:end -->';
    const startIdx = html.indexOf(START);
    const endIdx = html.indexOf(END);
    if (startIdx === -1 || endIdx === -1) {
        console.error(`Error: could not find ${START} / ${END} markers in projects/index.html`);
        process.exit(1);
    }

    const next = html.slice(0, startIdx + START.length) + '\n' + grid + '\n        ' + html.slice(endIdx);
    if (next !== html) {
        writeFileSync(indexPath, next);
        console.log('projects/index.html grid regenerated.');
    } else {
        console.log('projects/index.html grid already up to date.');
    }
}

main();
