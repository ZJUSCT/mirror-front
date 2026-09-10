![cover](https://raw.githubusercontent.com/RalXYZ/repo-pictures/main/mirror-front/cover.png)

# ZJU Mirror Front-end

The ZJU Mirror portal is a statically generated Astro site with small React
islands for live mirror status, search, and interactive MirrorZ guides. Back-end JSON format: [mirrorz-json](https://github.com/mirrorz-org/mirrorz#data-format-v15-draft)

## Development

Development runs entirely in Docker with Node.js 22, pnpm 10.15.1, and the
Chromium version bundled for Playwright 1.62.1. Generated files, dependencies,
and browser downloads stay in Docker volumes and images.

```sh
export DEV_UID="$(id -u)" DEV_GID="$(id -g)"
docker compose build dev
docker compose run --rm dev git submodule update --init --recursive
docker compose run --rm dev pnpm install --frozen-lockfile
docker compose run --rm --service-ports dev
```

The development server listens on `0.0.0.0:4321`. Run formatting or the full
source and build contract with the same image:

```sh
docker compose run --rm dev pnpm format
docker compose run --rm dev pnpm run ci
```

For local UI review without live back-end endpoints, run `pnpm dev:review`.
It serves the populated `test/fixtures/review-mirrorz.json` catalog and reports
an on-campus IPv4 connection so campus-only UI can be inspected.

Build the unprivileged production image, or start its production-style preview
on `0.0.0.0:8080` and run the browser acceptance suite against it:

```sh
docker build --tag mirror-front .
docker compose up --detach --build preview
docker compose run --rm browser
```

Cluster-specific NGINX configuration can be mounted under
`/etc/nginx/mirror-front/http.d` and `/etc/nginx/mirror-front/server.d` for the
HTTP and server contexts, respectively. Run `docker compose down` when the
preview is no longer needed; named development caches are retained.

A successful CI run for a push to `main` scans and publishes a GHCR image as
`latest` and its seven-character commit abbreviation. Registry cleanup retains
the ten newest commit-tagged images and removes unneeded untagged images.

## Content and runtime data

- ZJU announcements remain under `news/`.
- Generic interface glyphs primarily use Google Material Icons' baseline
  family; brand marks use Iconify Logos or Simple Icons, while institutional
  artwork remains in the local `resource/icons/` collection.
- The About, History, FAQ, and Container Images pages live in
  `src/content/special-pages/`, with
  one MDX file per page and locale. Their frontmatter supplies the page title
  and lead; the shared layout and presentation remain in
  `src/components/static/SpecialPage.astro`. Keep matching `zh/` and `en/`
  files when adding or renaming a page.
- Shared mirror guides come from the pinned `vendor/mirrorz-docs` submodule.
  The parent repository's gitlink is the authoritative content pin;
  `mirrorz-docs.lock.json` repeats the commit and license as build-time
  provenance because Docker builds do not receive Git metadata. Update the
  gitlink and manifest commit together—the test suite rejects drift between
  them and the checked-out submodule.
- The browser consumes the same-origin `/mirrorz.json` endpoint directly as
  [MirrorZ Data Format v1.7](https://github.com/mirrorz-org/mirrorz#data-format-v17).
  MirrorZ governs this public data contract.
- Mirror file links are resolved from `site.url` and each native `mirrors.url`
  value in that document.
- `autoindex/index.html` is the single first-class build product: a
  self-contained directory-listing shell. The bundled NGINX configuration
  serves normal Astro `index.html` pages first, then internally redirects HTML
  requests for other directories to that shell (URL unchanged). The shell's
  same-origin `fetch(location.pathname)` explicitly requests
  `application/json`, which NGINX answers using `autoindex on;` and
  `autoindex_format json;` before the page safely renders and sorts the entries.

### Directory-listing HTTP contract

- A directory request whose `Accept` header contains `text/html` receives the
  shell. `Accept: application/json`, curl's default `*/*`, and requests without
  an `Accept` header receive NGINX's JSON array. Responses include
  `Vary: Accept` so shared caches keep the representations separate.
- Scripted consumers can request a listing directly, for example:

  ```sh
  curl -H 'Accept: application/json' https://mirrors.zju.edu.cn/debian/
  ```

- NGINX's built-in autoindex intentionally omits entries whose names start
  with a dot. This differs from the previous directory-listing behavior and is
  part of the new public contract.
- For a local production-style demo, mount a readable sample tree at a path
  below `/usr/share/nginx/html` that does not contain an `index.html`, for
  example `/usr/share/nginx/html/sample`. The bundled configuration then serves
  `/sample/` through the same HTML/JSON negotiation. A fixture
  `mirrorz.json` can be mounted at `/usr/share/nginx/html/mirrorz.json` so the
  shell can display status metadata for the sample's first path segment.
- A standalone publish origin should use the same `map $http_accept` contract
  and `index` variable, enable `autoindex_format json`, and serve or proxy the
  shell at the exact internal redirect target `/autoindex/index.html`. Its
  mirror data root normally has no content pages, so it can omit the leading
  `index.html` fallback used by the combined portal image.

## Special Thanks

UI Designer: [Rynco Maekawa](https://github.com/lynzrand)
