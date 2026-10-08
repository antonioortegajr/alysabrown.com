# AGENTS.md

Guidance for AI coding agents working on this repo.

## Project overview

alysabrown.com is a single-page portfolio site for Alysa Brown, a fine artist in Eugene, Oregon.

- Plain static HTML. No build step, no package manager, no framework, no JavaScript.
- All markup and CSS live in `index.html` (styles are in one inline `<style>` block in `<head>`).
- External resources: Google Fonts only (Cormorant Garamond, Jost). Icons are inline SVGs (social links in the header; the `hr.icon` heart is an SVG data URI in CSS). Don't add icon fonts or other render-blocking stylesheets.
- Hosted on GitHub Pages, deployed from the root of `main`; `CNAME` holds the domain. GitHub Pages ignores `.htaccess` and sets its own headers (e.g. a fixed `cache-control: max-age=600`), so cache/header changes can't be made from the repo.

## Layout

```
index.html        # the whole site
README.md         # one-line project description
AGENTS.md         # this file
.htaccess         # Apache headers config; unused on GitHub Pages
CNAME             # alysabrown.com
lighthouserc.json # Lighthouse CI config
.github/workflows/lighthouse.yml  # runs Lighthouse CI on PRs to staging
intex.html        # empty leftover file (typo of index.html); not served or linked
assets/
  IMG_xxxx.jpg    # originals (IMG_0035 is .JPG)
  small/          # IMG_xxxx_small.jpg,  ~300px tall  + webp/IMG_xxxx_small.webp
  medium/         # IMG_xxxx_medium.jpg, ~600px tall  + webp/IMG_xxxx_medium.webp
  large/          # IMG_xxxx_large.jpg,  ~900px tall  + webp/IMG_xxxx_large.webp
```

Portrait images are 300/600/900px tall (about 225/450/675px wide). Exceptions: `IMG_0158` is landscape (400/800/1200px wide), and `IMG_9667`'s original is only 435×580, so its medium and large files are both that size.

Where images appear in `index.html`:

- `.ab-split__art`: the hero image in the header (`IMG_0911`), loaded eagerly. It is the page's LCP image, so never lazy-load it.
- `.gallery`: the artwork grid (3 columns on desktop, 2 at ≤768px, 1 at ≤600px).
- `.centered-image`: one featured landscape piece (`IMG_0158`) below the gallery.
- `.about`: the round artist profile photo (`IMG_0035`).

## Running locally

No install needed. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

There are no unit tests or linters. Verify changes by viewing the page at desktop, tablet (≤768px), and phone (≤600px) widths.

Every PR to `staging` runs Lighthouse CI (`.github/workflows/lighthouse.yml`, config in `lighthouserc.json`): 3 mobile runs against the static files. It fails on accessibility below 90, a lazy-loaded LCP image, or images not served in a modern format; performance, best practices, SEO, render-blocking resources, and image sizing are warnings. Report links appear in the job summary. To run it locally:

```sh
npx @lhci/cli@0.15.1 autorun
```

## Conventions

- Keep everything in `index.html`. Do not add a build system, framework, or separate CSS/JS files unless the issue asks for it.
- Header styles use the `ab-` prefix and CSS custom properties (`--ab-paper`, `--ab-ink`, `--ab-muted`, `--ab-rule`, `--ab-pad`) scoped to `.ab-header`. Reuse them for header changes.
- Indent with 4 spaces in HTML; match surrounding indentation in CSS.
- Respect `prefers-reduced-motion`: any new animation needs a reduced-motion fallback.
- External links use `target="_blank" rel="noopener"`.

## Adding or changing artwork images

1. Put the original in `assets/` as `IMG_xxxx.jpg`.
2. Create `small`, `medium`, and `large` JPG versions (300, 600, and 900px tall) plus matching `.webp` files in each size's `webp/` folder, following the existing names (`IMG_xxxx_small.jpg`, `IMG_xxxx_small.webp`, etc.). On macOS, for example:

   ```sh
   sips --resampleHeight 300 assets/IMG_xxxx.jpg --out assets/small/IMG_xxxx_small.jpg
   cwebp -q 80 assets/small/IMG_xxxx_small.jpg -o assets/small/webp/IMG_xxxx_small.webp
   ```

3. Add a `<picture>` to the `.gallery` section in `index.html`, copying an existing one: a webp `<source>` with `srcset`/`sizes`, a JPG `<img>` fallback, `loading="lazy"`, and a descriptive `alt`.
4. The `w` descriptors in `srcset` must be each file's real pixel width (check with `sips -g pixelWidth <file>`), not a guess. Wrong descriptors make browsers download the wrong size.

## Git and pull requests

- `main` is production. `staging` is where changes are reviewed before going to `main`.
- Agents never commit or open PRs directly against `main`. The maintainer merges `staging` into `main`.
- Branch from `staging`, naming the branch after the issue (e.g. `25-agents-md` or `agent/issue-25`), and open a PR against `staging`.
- Keep each PR scoped to its issue. Do not commit `.DS_Store` or other OS/editor files. `.gitignore` covers `.DS_Store` and `.lighthouseci/`; still check `git status` before committing. (`assets/.DS_Store` is already tracked by mistake; leave it unless an issue asks.)
- PR description format:

  ```md
  ## Summary

  One or two sentences on what changed and why.

  ## Changes

  - Bullet list of specific changes (selectors, files, copy)

  Closes #NN
  ```
