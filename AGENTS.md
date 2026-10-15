# AGENTS.md

Guidance for AI coding agents working on this repo.

## Project overview

alysabrown.com is a portfolio site for Alysa Brown, a fine artist in Oregon.

- Plain static HTML. No build step, no package manager, no framework, no JavaScript.
- Markup and CSS live in `index.html` and `commissions.html` (each with one inline `<style>` block in `<head>`).
- External resources: Google Fonts only (Cormorant Garamond, Jost). Icons are inline SVGs (social links in the header; the `hr.icon` heart is an SVG data URI in CSS). Don't add icon fonts or other render-blocking stylesheets.
- Hosted on GitHub Pages, deployed from the root of `main`; `CNAME` holds the domain. GitHub Pages ignores `.htaccess` and sets its own headers (e.g. a fixed `cache-control: max-age=600`), so cache/header changes can't be made from the repo.

## Layout

```
index.html        # home page
commissions.html  # commissions page
README.md         # one-line project description
AGENTS.md         # this file
.htaccess         # Apache headers config; unused on GitHub Pages
CNAME             # alysabrown.com
lighthouserc.json # Lighthouse CI config for PRs
lighthouserc.live.json  # Lighthouse CI config for the live site (warn-only)
.github/workflows/lighthouse.yml       # runs Lighthouse CI on PRs to staging
.github/workflows/lighthouse-live.yml  # runs Lighthouse on the live site after each Pages deploy
assets/
  descriptive-name.jpg    # originals, human-readable names, lowercase .jpg
  small/          # descriptive-name_small.jpg,  ~300px tall  + webp/descriptive-name_small.webp
  medium/         # descriptive-name_medium.jpg, ~600px tall  + webp/descriptive-name_medium.webp
  mid/            # descriptive-name_mid.jpg, phone-sized (see below) + webp/descriptive-name_mid.webp
  large/          # descriptive-name_large.jpg,  ~900px tall  + webp/descriptive-name_large.webp
```

Portrait images are 300/600/900px tall (about 225/450/675px wide). `mid/` exists so phones (Lighthouse emulates 1.75x DPR) get a file just over what they need: 510px wide for gallery, hero, and featured images (290px slot × 1.75 ≈ 508), and 300px wide for the 150px profile photo. Keep `mid` files at least that wide, or the browser skips them for the next size up. Exceptions: `fox-and-roses-diptych` is landscape (400/800/1200px wide), and `woman-in-profile-eyes-closed`'s original is only 435×580, so its medium and large files are both that size.

Where images appear in `index.html`:

- `.ab-split__art`: the hero image in the header (`bearded-man-with-cat-and-ivy`), loaded eagerly. It is the page's LCP image, so never lazy-load it.
- `.gallery`: the artwork grid (3 columns on desktop, 2 at ≤768px, 1 at ≤600px).
- `.centered-image`: one featured landscape piece (`fox-and-roses-diptych`) below the gallery.
- `.about`: the round artist profile photo (`alysa-brown-painting-in-studio`).

Where images appear in `commissions.html`:

- `.gallery`: the commissions examples grid (3 columns on desktop, 2 at ≤768px, 1 at ≤600px).

## Running locally

No install needed. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

There are no unit tests or linters. Verify changes by viewing the page at desktop, tablet (≤768px), and phone (≤600px) widths.

Every PR to `staging` runs Lighthouse CI (`.github/workflows/lighthouse.yml`, config in `lighthouserc.json`): 3 mobile runs against the static files. It fails on accessibility below 90, a lazy-loaded LCP image, images not served in a modern format, or images larger than they display (`uses-responsive-images`); performance, best practices, SEO, and render-blocking resources are warnings. Report links appear in the job summary.

After each successful GitHub Pages deploy of `main`, `.github/workflows/lighthouse-live.yml` runs Lighthouse 3 times against https://alysabrown.com/ using `lighthouserc.live.json`. It is report-only (all assertions warn) and puts the median scores and a report link in the job summary. It can also be run by hand from the Actions tab (`workflow_dispatch`).

To run the PR check locally:

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

1. Put the original in `assets/` with a human-readable, lowercase `.jpg` name describing the artwork (e.g. `bearded-man-with-cat-and-ivy.jpg`).
2. Create `small`, `medium`, `mid`, and `large` JPG versions (300px tall, 600px tall, 510px wide, 900px tall) plus matching `.webp` files in each size's `webp/` folder, following the existing names (`descriptive-name_small.jpg`, `descriptive-name_small.webp`, etc.). On macOS, for example:

   ```sh
   sips --resampleHeight 300 assets/descriptive-name.jpg --out assets/small/descriptive-name_small.jpg
   sips -s format jpeg -s formatOptions 70 --resampleWidth 510 assets/descriptive-name.jpg --out assets/mid/descriptive-name_mid.jpg
   cwebp -q 80 assets/small/descriptive-name_small.jpg -o assets/small/webp/descriptive-name_small.webp
   ```

3. Embed creator and copyright metadata in every JPG and WebP (all sizes, plus the original) with `exiftool`. `sips` and `cwebp` strip or don't write it, so re-run this whenever images are regenerated. `IPTC` fields apply to JPEG only; WebP keeps the XMP and EXIF fields:

   ```sh
   exiftool -api Compact=NoPadding \
     -IPTC:By-line="Alysa Brown" -IPTC:Credit="Alysa Brown" -IPTC:CopyrightNotice="© Alysa Brown" \
     -EXIF:Artist="Alysa Brown" -EXIF:Copyright="© Alysa Brown" \
     -XMP-dc:Creator="Alysa Brown" -XMP-photoshop:Credit="Alysa Brown" -XMP-dc:Rights="© Alysa Brown" \
     -overwrite_original <files>
   ```

   `-api Compact=NoPadding` drops XMP padding so each file grows by about 1 KB. Verify with `exiftool -a -G1 <file>`.

4. Add a `<picture>` to the `.gallery` section in `index.html`, copying an existing one: a webp `<source>` with `srcset`/`sizes`, a JPG `<img>` fallback, `loading="lazy"`, and a descriptive `alt`.
5. The `w` descriptors in `srcset` must be each file's real pixel width (check with `sips -g pixelWidth <file>`), not a guess. Wrong descriptors make browsers download the wrong size.

## Git and pull requests

- `main` is production. `staging` is where changes are reviewed before going to `main`.
- Agents never commit or open PRs directly against `main`. The maintainer merges `staging` into `main`.
- Branch from `staging`, naming the branch after the issue (e.g. `25-agents-md` or `agent/issue-25`), and open a PR against `staging`.
- Keep each PR scoped to its issue. Do not commit `.DS_Store` or other OS/editor files. `.gitignore` covers `.DS_Store` and `.lighthouseci/`; still check `git status` before committing.
- PR description format:

  ```md
  ## Summary

  One or two sentences on what changed and why.

  ## Changes

  - Bullet list of specific changes (selectors, files, copy)

  Closes #NN
  ```
