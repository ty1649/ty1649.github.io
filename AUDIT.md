# AUDIT.md — ty1649.github.io baseline

Generated as Phase 0 of the site overhaul described in `CLAUDE.md`. This is a
read-only snapshot: file inventory, internal link graph, orphaned pages,
broken references, and per-directory image sizes, as of this commit. No
content or markup was changed to produce this file.

Regenerate the broken-reference section anytime with:

```
node tools/check-links.mjs
```

---

## 1. File inventory

186 tracked files outside `.git` (plus this `AUDIT.md` and `tools/check-links.mjs`,
added by this commit). By top-level area:

| Area | Contents |
|---|---|
| `index.html` | Homepage |
| `images/` | 8 homepage images (about photos, profile photos, misc) |
| `notes/` | `index.html` + `pdfs/` (12 course-note PDFs) |
| `projects/` | 13 live project detail pages + `index.html` (grid) + `inprogress.html`, `personal-pw.html`, `projtemplate.html` (orphaned, see §2) + `old_layout/` (7 legacy pages, orphaned) + `images/` (per-project image folders) |
| `scripts/` | `theme-toggle.js` (the one canonical copy — see §4) |
| `styles/` | `project-styles.css` only — no site-wide stylesheet yet |
| `css/` | **empty directory**, no files, not referenced anywhere — dead |
| `tools/` | `check-links.mjs` (added by this commit) |

Full flat listing (`find . -type f -not -path './.git/*' | sort`):

```
./.DS_Store
./CLAUDE.md
./README.md
./Terry_Yu_resume.pdf
./images/about-backpacking.png
./images/about-car.png
./images/about-music.png
./images/about-waffles.png
./images/notes.png
./images/pfp.png
./images/pfp2.png
./images/proj1.png
./images/projects.png
./index.html
./notes/.DS_Store
./notes/index.html
./notes/pdfs/apcsrev.pdf
./notes/pdfs/calc1.pdf
./notes/pdfs/calc2.pdf
./notes/pdfs/calc3.pdf
./notes/pdfs/diffeq.pdf
./notes/pdfs/ee100.pdf
./notes/pdfs/linalg.pdf
./notes/pdfs/physics1.pdf
./notes/pdfs/physics2.pdf
./notes/pdfs/physics4c.pdf
./notes/pdfs/physicsprobs.pdf
./notes/pdfs/stats.pdf
./notes/pdfs/workenergyeqsheet.pdf
./projects/clubs-hfc.html
./projects/clubs-mk10s&c.html
./projects/clubs-mk11dt.html
./projects/clubs-mk9cb.html
./projects/images/.DS_Store
./projects/images/cb/ (cb-cover.png, im1–im16.png — 17 files)
./projects/images/egk/ (egk-cover.png, im1–im14.png — 15 files)
./projects/images/fdu/ (fdu-cover.png, im1.png — 2 files)
./projects/images/hfc/ (hfc-cover.png, im1–im19.png — 20 files)
./projects/images/lr/ (step1.png, step2.png, step3.png — 3 files, no step4)
./projects/images/misc/ (pointcloudmodeling.png, windupcar.png — 2 files)
./projects/images/mk10s&c/.DS_Store
./projects/images/mk10s&c/ (mk10s&c-cover.png, im1–im11.png — 12 files)
./projects/images/mk11dt/ (mk11dt-cover.png, mk11dt.pdf, im1–im26.png — 28 files)
./projects/images/pdmsch/ (pdmsch-cover.png, im1–im9.png — 10 files)
./projects/images/piglr/ (piglr-cover.png, im1–im4.png — 5 files)
./projects/images/pp/ (pp-cover.png, step1–step4.png, im1–im5.png — 10 files)
./projects/images/pw/ (pw-cover.png — 1 file)
./projects/images/sbr/ (sbr-cover.png, im1–im3.png — 4 files)
./projects/index.html
./projects/inprogress.html
./projects/old_layout/clubs-hfc.html
./projects/old_layout/clubs-mk10s&c.html
./projects/old_layout/clubs-mk9cb.html
./projects/old_layout/personal-egk.html
./projects/old_layout/personal-fdu.html
./projects/old_layout/personal-pp.html
./projects/old_layout/research-pdmsch.html
./projects/personal-egk.html
./projects/personal-fdu.html
./projects/personal-lr.html
./projects/personal-misc.html
./projects/personal-piglr.html
./projects/personal-pp.html
./projects/personal-pw.html
./projects/personal-sbr.html
./projects/projtemplate.html
./projects/research-pdmsch.html
./scripts/theme-toggle.js
./styles/project-styles.css
```

(Image subfolders shown collapsed with counts above; every filename was
individually verified by the link checker in §3.)

---

## 2. Internal link graph & orphaned pages

Computed by resolving every `<a href>` in every `.html` file (respecting
`<base href>` where a page sets one — see §4) and doing a BFS from the three
real entry points: `index.html`, `notes/index.html`, `projects/index.html`.

**Reachable (15 pages):** `index.html`, `notes/index.html`,
`projects/index.html`, and the 12 live project pages linked from its grid
(`clubs-hfc`, `clubs-mk10s&c`, `clubs-mk11dt`, `clubs-mk9cb`, `personal-egk`,
`personal-fdu`, `personal-lr`, `personal-misc`, `personal-piglr`,
`personal-pp`, `personal-sbr`, `research-pdmsch`). `personal-pp.html` also
links out to `personal-lr.html` in its body text.

**Orphaned (10 pages, unreachable from any entry point, but publicly
reachable by direct URL since GitHub Pages serves any committed path):**

- `projects/inprogress.html` — titled "Under Construction," no incoming links at all.
- `projects/personal-pw.html` — Portfolio Website project; its card in
  `projects/index.html` is commented out (lines 596–603).
- `projects/projtemplate.html` — the authoring template; expected to be
  orphaned (it's not meant to be a real project page).
- `projects/old_layout/*.html` (7 files) — **these are not distinct
  content.** Each basename exactly matches a currently-live page:
  `clubs-hfc`, `clubs-mk10s&c`, `clubs-mk9cb`, `personal-egk`,
  `personal-fdu`, `personal-pp`, `research-pdmsch`. They are superseded
  earlier drafts of the same 7 projects, not separate orphaned content. This
  matters for Q8 (Phase 6): deleting them loses no unique content, only
  earlier revisions already preserved in git history.

---

## 3. Broken references (`node tools/check-links.mjs` output)

18 broken references across 7 files, out of 25 HTML files scanned:

```
index.html
  line 788: a href empty -> (empty)

projects/index.html
  line 553: background-image url() empty -> (empty)      [PIGLR card]
  line 606: background-image url() not found -> /images/personal-project.jpg   [Linear Rails card]
  line 614: background-image url() not found -> /images/personal-project.jpg   [Misc card]

projects/old_layout/clubs-mk10s&c.html
  line 393: img src not found -> path_to_image.jpg

projects/old_layout/personal-fdu.html
  line 61: img src not found -> /api/placeholder/800/400

projects/personal-lr.html
  line 83: img src not found -> step4.png

projects/personal-misc.html
  line 372: img src not found -> /api/placeholder/400/320
  line 408: img src not found -> /api/placeholder/400/320
  line 423: img src not found -> /api/placeholder/400/320
  line 454: img src not found -> /api/placeholder/400/320
  line 474: img src not found -> /api/placeholder/400/320

projects/projtemplate.html
  line 72: img src not found -> pp-cover.png
  line 75: img src not found -> im1.png
  line 80: img src not found -> im4.png
  line 83: img src not found -> im5.png
  line 88: img src not found -> im2.png
  line 93: img src not found -> im3.png
```

Notes on items CLAUDE.md described that turned out different in practice:

- **PIGLR's empty `background-image: url('')`** — real and confirmed at
  `projects/index.html:553` (an earlier scan of this pass initially flagged
  this as not-found; it is in fact present).
- **`personal-misc.html` placeholder count** — of its 7
  `/api/placeholder/400/320` `<img>` tags, 2 (`windupcar.png`,
  `pointcloudmodeling.png` at lines 392/438) have already been pointed at
  real files and are no longer placeholders. 5 remain broken, matching
  CLAUDE.md's count but not its original explanation.
- `projects/old_layout/*` broken images are pre-existing breakage in
  orphaned legacy pages — not gating anything, listed for completeness.

**Not caught by the tool (different class of defect, needs manual fix):**

- `projects/clubs-mk11dt.html` — a stray, live (uncommented) `</section>` at
  line 501 has no matching live opening tag. The real opener,
  `<section class="sneak-peek-section">` at line 469, is inside an HTML
  comment along with the rest of that block's preamble, while the closing
  tag at line 501 was left live. Browsers silently discard unmatched close
  tags, so this doesn't currently break rendering, but the markup is
  invalid and should be balanced in Phase 1.
- `projects/index.html` — exactly 13 empty `<div class="tags-container"></div>`
  elements (one per project card).
- Placeholder alt text: `alt="asdf"` (`index.html:754`), `alt="Hasdf"`
  (`index.html:758`), `alt="filler"` (7×, all in `personal-misc.html`), and
  `alt="Image"` used generically across nearly every project gallery — 26
  occurrences in `clubs-mk11dt.html` alone, and dozens more spread across
  `clubs-hfc.html`, `clubs-mk9cb.html`, `personal-pp.html`, `personal-egk.html`,
  `research-pdmsch.html`, `personal-lr.html`, `personal-sbr.html`,
  `projtemplate.html`.
- Footer "last updated" dates are hardcoded and inconsistent: `index.html`
  → Oct 2024; `projects/index.html` → Mar 2025; `personal-piglr.html` →
  2026; most project pages → Nov 2024; but `clubs-mk10s&c.html` and
  `personal-sbr.html` → Mar 2025 (a fifth variant CLAUDE.md didn't name);
  `projtemplate.html` → literal `20XX` placeholder text.
- `im22.png` and `im7.png` in `projects/images/mk11dt/` are JPEG data
  (4284×5712) saved with a `.png` extension — confirmed via `file`/`sips`.
  Sizes: `im22.png` = 10,177,550 bytes (~9.7 MB), `im7.png` = 7,083,982
  bytes (~6.8 MB).

---

## 4. Theme / CSS drift (relevant to Phase 3, confirmed present now)

- `:root` custom-property values for `--text-color-light`,
  `--text-color-dark`, and `--border-color` are duplicated with two
  different value sets: `#000000`/`#ffffff`/`#000` in `index.html` and
  `notes/index.html`, versus `#333333`/`#dddddd`/`#e0e0e0` in
  `styles/project-styles.css`, `projects/index.html`, and every individual
  project page (~15 files total carry their own copy of one family or the
  other).
- Content widths in use: 1200px (`index.html`, `notes/index.html`), 1000px
  (`projects/index.html`), 1100px (`styles/project-styles.css`). Left
  padding: 100px (`index.html`, `notes/index.html`, `projects/index.html`),
  150px (`styles/project-styles.css`) — CLAUDE.md's stated 90px fourth value
  wasn't found; actual set is {100, 100, 100, 150}.
- `scripts/theme-toggle.js` is the one canonical file, linked correctly by
  most project pages, but `index.html` and `projects/index.html` each carry
  an inline `<script>` that duplicates its logic byte-for-byte (plus extra
  page-specific code in `index.html`'s case). Its actual behavior: `mouseover`
  toggles dark mode, `mouseout` toggles it back, and `click` sets a
  `cantoggle = false` latch for ~160ms so a click "sticks" the current state
  — confirmed exactly as CLAUDE.md's Q10 describes.
- `projects/personal-misc.html` links `scripts/theme-toggle.js` but has its
  own inline `<style>` block (starting line 8) redefining the same tokens,
  rather than linking `styles/project-styles.css`.

---

## 5. Per-project image byte totals (`du -sh`, `projects/images/*/`)

| Project | Size |
|---|---|
| mk11dt | 66M |
| egk | 36M |
| hfc | 33M |
| pdmsch | 24M |
| cb | 24M |
| pp | 13M |
| misc | 7.2M |
| sbr | 6.6M |
| mk10s&c | 5.6M |
| fdu | 5.4M |
| piglr | 4.2M |
| pw | 988K |
| lr | 220K |

Plus: top-level `images/` (homepage) = 14M, `notes/pdfs/` = 17M.
`projects/images/` total = 226M. Repo working tree (excluding `.git`) ≈
257M; `.git` itself is a separate 265M.

---

## 6. Other findings worth flagging before Phase 1 begins

- Four `.DS_Store` files are **tracked and committed** in git (`./.DS_Store`,
  `notes/.DS_Store`, `projects/images/.DS_Store`,
  `projects/images/mk10s&c/.DS_Store`) — one commit is literally titled
  "Update .DS_Store". Phase 6 will need `git rm` for these, not just an
  add-to-`.gitignore`, since they're already committed.
- `css/` is an empty, unreferenced directory — dead weight, not mentioned in
  CLAUDE.md at all.
- `git` upstream tracking for `main` is currently broken ("upstream is
  gone") — unrelated to this audit but worth fixing before any future push.
- `README.md` is exactly as CLAUDE.md describes: 4 lines, contains the typo
  "webstie".
- `Terry_Yu_resume.pdf`'s internal date text wasn't parsed here (out of
  scope for a read-only HTML/link audit); Phase 6 should verify it directly
  rather than relying on this document.
