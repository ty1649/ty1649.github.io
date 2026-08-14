#!/usr/bin/env node
// Scaffolds a new project detail page from projects/projtemplate.html: fills in
// the PROJECT_* tokens, keeps only the chosen @module blocks, creates the image
// directory, and appends a metadata entry to projects/projects.json. Output is
// committed static HTML — run tools/build-projects-grid.mjs afterward to add the
// card to projects/index.html, then write the real prose by hand.
//
// Usage:
//   node tools/new-project.mjs --slug=widget --title="Widget" --category=personal \
//     --description="One-line card description." [--affiliation="Club Name"] \
//     [--year=2026] [--cover=/projects/images/widget/widget-cover.png] \
//     [--modules=gallery] [--on-resume]
//
// Available modules: embeds, day-logs, gallery. Omit --modules to keep just
// gallery (the one nearly every project page uses).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CATEGORY_PREFIX = { clubs: 'clubs-', research: 'research-', personal: 'personal-' };
const ALL_MODULES = ['embeds', 'day-logs', 'gallery'];
const DEFAULT_MODULES = ['gallery'];

function parseArgs(argv) {
    const args = {};
    for (const raw of argv) {
        if (!raw.startsWith('--')) continue;
        const eq = raw.indexOf('=');
        if (eq === -1) {
            args[raw.slice(2)] = true;
        } else {
            args[raw.slice(2, eq)] = raw.slice(eq + 1);
        }
    }
    return args;
}

function fail(message) {
    console.error(`Error: ${message}`);
    process.exit(1);
}

function stripModuleBlocks(html, keptModules) {
    let out = html;
    for (const mod of ALL_MODULES) {
        const re = new RegExp(`[ \\t]*<!-- @module:${mod}\\b[\\s\\S]*?-->\\n([\\s\\S]*?)[ \\t]*<!-- @endmodule:${mod} -->\\n?`, 'g');
        out = out.replace(re, (_match, inner) => (keptModules.includes(mod) ? inner : ''));
    }
    return out;
}

function main() {
    const args = parseArgs(process.argv.slice(2));

    const slug = args.slug;
    const title = args.title;
    const category = args.category;
    const description = args.description;

    if (!slug || !title || !category || !description) {
        fail('--slug, --title, --category, and --description are required. See --help via the file header for usage.');
    }
    if (!CATEGORY_PREFIX[category]) {
        fail(`--category must be one of: ${Object.keys(CATEGORY_PREFIX).join(', ')}`);
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
        fail('--slug must be lowercase letters, digits, and hyphens only.');
    }

    const modules = args.modules
        ? String(args.modules).split(',').map((m) => m.trim()).filter(Boolean)
        : DEFAULT_MODULES;
    for (const mod of modules) {
        if (!ALL_MODULES.includes(mod)) fail(`Unknown module "${mod}". Available: ${ALL_MODULES.join(', ')}`);
    }

    const href = `${CATEGORY_PREFIX[category]}${slug}.html`;
    const pagePath = path.join(repoRoot, 'projects', href);
    const imageDir = path.join(repoRoot, 'projects', 'images', slug);
    const projectsJsonPath = path.join(repoRoot, 'projects', 'projects.json');

    if (existsSync(pagePath)) fail(`${href} already exists.`);

    const projectsJson = JSON.parse(readFileSync(projectsJsonPath, 'utf8'));
    if (projectsJson.projects.some((p) => p.slug === slug)) {
        fail(`slug "${slug}" is already in projects.json.`);
    }

    const templatePath = path.join(repoRoot, 'projects', 'projtemplate.html');
    let html = readFileSync(templatePath, 'utf8');

    html = stripModuleBlocks(html, modules);
    html = html
        .replaceAll('PROJECT_TITLE', title)
        .replaceAll('PROJECT_SLUG', slug)
        .replaceAll('PROJECT_DESCRIPTION', description);

    writeFileSync(pagePath, html);

    mkdirSync(imageDir, { recursive: true });
    const gitkeep = path.join(imageDir, '.gitkeep');
    if (!existsSync(path.join(imageDir, `${slug}-cover.png`))) {
        writeFileSync(gitkeep, '');
    }

    const cover = args.cover || `/projects/images/${slug}/${slug}-cover.png`;
    projectsJson.projects.push({
        slug,
        href,
        title,
        category,
        affiliation: args.affiliation || '',
        year: args.year ? String(args.year) : '',
        description,
        cover,
        onResume: Boolean(args['on-resume']),
        skillTags: [],
    });
    writeFileSync(projectsJsonPath, JSON.stringify(projectsJson, null, 2) + '\n');

    console.log(`Created projects/${href}`);
    console.log(`Created projects/images/${slug}/ (add ${slug}-cover.png, any gallery photos, and remove .gitkeep)`);
    console.log(`Added "${slug}" to projects/projects.json (skillTags: [] -- fill in by hand)`);
    console.log('\nNext steps:');
    console.log('  1. Add your real photos to projects/images/' + slug + '/.');
    console.log(`  2. node tools/optimize-images.mjs --slug=${slug}   (the page and the grid both serve from images-optimized/, not images/)`);
    console.log('  3. Replace the remaining PROJECT_* / OUTCOME_* / WHAT_I_DID_* / LOG_* tokens with real prose.');
    console.log('  4. node tools/build-projects-grid.mjs   (regenerates the projects/index.html card grid)');
    console.log('  5. node tools/check-links.mjs           (must exit zero before committing)');
    console.log('  6. node tools/check-template.mjs        (confirm zero schema drift)');
}

main();
