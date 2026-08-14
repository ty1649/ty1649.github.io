# Maintaining this site

This is Terry Yu's personal portfolio (`ty1649.github.io`) — a hand-written, static
HTML/CSS/JS site with a small set of Node scripts in `tools/` that generate parts of it
(the project grid, template scaffolding, image optimization, drift checks). The
hand-written HTML stays the source of truth; nothing here introduces a framework or a
build step that changes what gets deployed. See `CLAUDE.md` at the repo root for the
full history of decisions behind the current structure — this doc is the "how do I do
X" companion to that.

## Site structure

```
index.html                   Homepage
notes/                        Notes section (index.html + note pages)
projects/
  index.html                  Project grid, generated from projects.json
  projects.json                Per-project metadata (title, cover, category, tags, ...)
  projtemplate.html            Canonical template new pages are scaffolded from
  personal-*.html, clubs-*.html, research-*.html
                                Individual project detail pages
  images/                      Original project photos, grouped by project slug
  images-optimized/            WebP + resized originals, generated — never hand-edited
styles/
  site.css                     Shared tokens, reset, sidenav, footer, theme toggle
  project-styles.css           Project-detail-page additions layered on site.css
scripts/
  theme-toggle.js              Shared light/dark toggle, linked by every page
tools/                         Node scripts described below (dev-only, not deployed)
  partials/                    sidenav.html / footer.html source used by apply-partials.mjs
Terry_Yu_resume.pdf            Served resume PDF, linked from the header resume button
sitemap.xml, robots.txt, favicon.svg/.ico, apple-touch-icon.png
```

`tools/` is dev tooling only — `package.json` describes it as "Build/authoring tooling
for the portfolio site. Not part of the deployed static output." Its only dependency is
`sharp`, used by `optimize-images.mjs`.

## Adding a new project

1. Scaffold the page from the template:

   ```
   node tools/new-project.mjs --slug=widget --title="Widget" --category=personal \
     --description="One-line card description." [--affiliation="Club Name"] \
     [--year=2026] [--cover=/projects/images/widget/widget-cover.png] \
     [--modules=gallery] [--on-resume]
   ```

   This fills in the `PROJECT_*` tokens in `projects/projtemplate.html`, keeps only the
   chosen `@module` blocks, creates `projects/images/widget/`, and appends a metadata
   entry to `projects/projects.json`. Available modules: `embeds` (Mk 11-style Google
   Slides/PDF viewer, lives inside Outcome), `day-logs` (PIGLR-style dated entries), and
   `gallery` (the column image grid nearly every page uses — the default if
   `--modules` is omitted).

2. Write the real prose by hand into the scaffolded sections — the schema is
   **title → italic intro line → Outcome → What I did → Images**, documented in full in
   `CLAUDE.md` under "Project page schema." Never invent a metric, date, or result; if
   you don't have a real number, leave an HTML comment stub instead of writing plausible
   filler.

3. Drop real photos into `projects/images/<slug>/`, then regenerate optimized copies:

   ```
   node tools/optimize-images.mjs --slug=widget
   ```

   This resizes to a ~2000px long edge, emits WebP with an original-format fallback,
   and writes to `projects/images-optimized/` — it never touches or overwrites
   `projects/images/` originals. Omit `--slug` to re-run for every project (slow; only
   do this after a bulk change to originals).

4. Regenerate the project grid so the new card shows up on `projects/index.html`:

   ```
   node tools/build-projects-grid.mjs
   ```

   This writes between the `<!-- projects-grid:start -->` / `<!-- projects-grid:end -->`
   markers in `projects/index.html`, driven entirely by `projects/projects.json`. Don't
   hand-edit the grid markup directly — edit `projects.json` and regenerate.

5. Run the checks below before committing.

To pull a project out of the grid without deleting it, set `"published": false` on its
`projects.json` entry and re-run `build-projects-grid.mjs` — this is how
`personal-pw.html` was excluded pending the Phase 6 decision before it was deleted.

## Running the tools

All commands run from the repo root with plain Node (no build step, no dev server):

| Command | What it does |
|---|---|
| `node tools/check-links.mjs` | Walks every HTML file and reports broken `<img src>`, broken `background-image: url()`, and broken internal `<a href>`. Exits non-zero on any broken reference — run before every commit. |
| `node tools/check-template.mjs` | Reports which project pages declare which `data-template-version` and which have drifted from the canonical section schema (leftover `Summary`/`Lessons Learned`/`Best Visual` headings or ids). Report-only, never rewrites a page. |
| `node tools/build-projects-grid.mjs` | Regenerates `projects/index.html`'s card grid from `projects/projects.json`. |
| `node tools/new-project.mjs --slug=... --title=... --category=... --description=...` | Scaffolds a new project page — see "Adding a new project" above for full usage. |
| `node tools/optimize-images.mjs [--slug=widget] [--max-dimension=2000] [--quality=82]` | Resizes and converts project images to WebP under `projects/images-optimized/`, never touching originals. |
| `node tools/apply-partials.mjs` | Injects the shared `tools/partials/sidenav.html` and `tools/partials/footer.html` into every page's `<nav class="sidenav">` and `<footer class="footer">` blocks. Idempotent — safe to re-run after editing a partial to re-normalize every page. Preserves each page's existing "last updated" text; it owns structure, not the date. |
| `node tools/stamp-footer-dates.mjs` | Replaces every footer "last updated ⟨date⟩" string with a real date: today's date for files with uncommitted changes, otherwise the date of the last commit that touched the file. Run this last, right before committing content changes, so the stamped date matches the commit. |

Typical order when editing an existing page's structure or footer: make your content
edits, run `apply-partials.mjs` if you touched the sidenav/footer, run
`stamp-footer-dates.mjs` last, then `check-links.mjs` before committing.

## Deployment

This is a `<username>.github.io` user-page repository — GitHub Pages serves the
contents of the `main` branch root directly, with no build step, no `gh-pages` branch,
and no `CNAME` (the site is served at the default `ty1649.github.io` domain). Pushing to
`main` is the deploy: whatever HTML/CSS/JS is committed there is what's live, generally
within a minute or two. There is no CI/deploy workflow in `.github/` — none is needed
because the repo already contains committed static output.

Work happens on `overhaul/phase-N-*` branches per `CLAUDE.md`'s phased-overhaul
convention (or any feature branch for smaller changes) and merges into `main` when
ready. Since `main` is what's served, avoid merging partially-finished work into it.

## Known follow-up: resume PDF date mismatch

`Terry_Yu_resume.pdf` — the file actually committed in this repo and linked from the
header resume button — currently reads **"May 2026 – Present"** for Terry's current
role, while the up-to-date resume reads **"May 2026 – Aug 2026"**. The served PDF needs
to be refreshed with the current version before this is accurate. This is a content fix
(swap the PDF file), not a code change — flagged here so it doesn't get lost.
