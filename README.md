![cover](https://raw.githubusercontent.com/RalXYZ/repo-pictures/main/mirror-front/cover.png)

# ZJU Mirror Front-end

The ZJU Mirror portal is a statically generated Astro site with small React
islands for live mirror status, search, and interactive MirrorZ guides. Back-end JSON format: [mirrorz-json](https://github.com/mirrorz-org/mirrorz#data-format-v15-draft)

## Development

Development runs entirely in Docker with Node.js 22 and pnpm 10.15.1.
Generated files and dependencies stay in Docker volumes and images.

```sh
export DEV_UID="$(id -u)" DEV_GID="$(id -g)"
docker compose build dev
docker compose run --rm dev git submodule update --init --recursive
docker compose run --rm dev pnpm install --frozen-lockfile
docker compose run --rm --service-ports dev
```

The development server listens on `0.0.0.0:4321`. Type checking and optional
formatting can also be run locally with the same image:

```sh
docker compose run --rm dev pnpm check
docker compose run --rm dev pnpm format
```

For local UI review without live back-end endpoints, run:

```sh
docker compose run --rm --service-ports dev pnpm dev:review
```

It serves the populated `dev/fixtures/mirrorz.json` catalog and reports an
on-campus IPv4 connection so campus-only UI can be inspected.

The deployment marker is configured at build time. Production defaults to
`DEPLOYMENT_ENV=production`; set it to `staging` to add a fixed strip to every
page:

```sh
docker compose run --rm -e DEPLOYMENT_ENV=staging dev pnpm build
```

The production Dockerfile accepts the same name as a build argument, so the
equivalent image build uses `--build-arg DEPLOYMENT_ENV=staging`.

Build the unprivileged production image, or start its production-style preview
on `0.0.0.0:8080`:

```sh
docker build --tag mirror-front .
docker compose up --detach --build preview
```

Cluster-specific NGINX configuration can be mounted under
`/etc/nginx/mirror-front/http.d` and `/etc/nginx/mirror-front/server.d` for the
HTTP and server contexts, respectively. The portal supports both plain HTTP and
HTTPS behind the gateway. Keep directory redirects relative and omit HSTS and
CSP `upgrade-insecure-requests` so HTTP resources and same-site navigation are
not silently upgraded by the browser. MirrorZ links and generated guides may
still recommend HTTPS explicitly.

Run `docker compose down` when the preview is no longer needed; named development
caches are retained.

CI builds both images. The frontend build runs Astro/TypeScript checks, and
the exporter build runs its two focused tests. Pushes to `main` also
publish both GHCR images as `latest` and their seven-character commit
abbreviation. Registry cleanup retains the ten newest commit-tagged images
and removes unneeded untagged images.

A separate workflow lints and packages changes under `charts/mirror-front/`,
and publishes the OCI chart on pushes to `main`. It uses the version in
`Chart.yaml`; no Git release tags are needed. Chart-only changes skip image
builds.

## Kubernetes deployment

The [Helm chart](charts/mirror-front/) manages the frontend, optional
standalone statistics exporter (single-replica Deployment and Service), their
configuration, Services, and an optional Gateway API HTTPRoute.
Configuration is in [values.yaml](charts/mirror-front/values.yaml).

## Content and runtime data

- ZJU announcements remain under `news/`.
- Generic interface glyphs primarily use Google Material Icons' baseline
  family; brand marks use Iconify Logos or Simple Icons, while institutional
  artwork remains in the local `resource/icons/` collection.
- The About, History, FAQ, Container Images, and Statistics pages live in
  `src/content/special-pages/`, with
  one MDX file per page and locale. Their frontmatter supplies the page title
  and lead; the shared layout and presentation remain in
  `src/components/static/SpecialPage.astro`. Keep matching `zh/` and `en/`
  files when adding or renaming a page.
- The Statistics page reads `/statistics-data/manifest.json` and static PNGs
  generated hourly by the standalone [statistics exporter](statistics-exporter/README.md)
  and proxied by an NGINX snippet the chart injects when statistics are
  enabled. Its source, image build, configuration example, and deployment
  contract live under `statistics-exporter/`. Grafana panel selection is
  runtime configuration; changing it does not require rebuilding the frontend.
- Shared mirror guides come from the pinned `vendor/mirrorz-docs` submodule.
  The parent repository's gitlink is the authoritative content pin;
  `mirrorz-docs.lock.json` repeats the commit and license as build-time
  provenance because Docker builds do not receive Git metadata. Update the
  gitlink and manifest commit together when updating the guides. Every guide
  in the submodule is rendered unconditionally: route generation never
  consults the live `mirrorz.json` catalog, so a mirror that is temporarily
  absent from it (for example mid-migration while its publish deployment is
  not Ready) keeps its guide page, and a guide without a hosted mirror still
  gets one. The mirror status island links to a guide only when one exists.
- The browser consumes the same-origin `/mirrorz.json` endpoint directly as
  [MirrorZ Data Format v1.7](https://github.com/mirrorz-org/mirrorz#data-format-v17).
  MirrorZ governs this public data contract.
- Mirror file links are resolved from `site.url` and each native `mirrors.url`
  value in that document.
- `autoindex/index.html` is a shared directory-listing shell. Hashed styles,
  fonts, images, and JavaScript remain under `/_astro/`, independently cacheable
  across mirrors and directories. Script hashes and integrity attributes limit
  executable code to the build output; mirrored files are not trusted scripts.

### Responsive page widths

`SiteLayout` uses a centered 58rem reading area by default. The header,
article title, body, actions, and footer share the same content edges while
section backgrounds remain full-width. Home and directory listings use the
`wide` layout (96rem); Statistics uses `statistics` (88rem). These are maximum
content widths, with responsive gutters on smaller viewports. Guide and
directory watermarks belong to their title sections, not the viewport.
Keep long code blocks and tables horizontally scrollable within the content
area instead of widening the page.

### Markdown guide exports

Every shared guide at `/docs/<id>/` also has a static Markdown export at
`/docs/<id>.md`. Both language interfaces link to that same Chinese document;
the English interface does not imply an English translation. `/llms.txt`
indexes all exported guides with absolute URLs and identifies `/mirrorz.json`
as the source for the current mirror catalog and status. Guide publication is
independent of that runtime catalog.

“Copy page” exports the current release, endpoint, protocol, and command
selections. “View as Markdown” uses the documented defaults. Both include
source provenance, license, file paths, and append instructions. Clipboard
failures fall back to selectable text, including on plain HTTP. Exported links
use the canonical production origin even when reviewing the site locally.

The compiler retains Markdown with template placeholders alongside HTML.
Both renderers resolve block-local and global inputs with the same semantics;
hidden HTML comments are excluded. Do not generate exports from the browser
DOM or maintain a separate copy of the guide content.

Run `docker compose run --rm dev pnpm test:docs` to check all vendored guides
and exercise template scoping, link conversion, and file instructions. The
production image build runs these tests before generating static pages.

### Directory-listing HTTP contract

- Directory URLs serve the HTML shell regardless of `Accept`. JSON is available
  only through `/<mirror>/.mirror-index/<relative-directory>/`, for example:

  ```sh
  curl https://mirrors.zju.edu.cn/debian/.mirror-index/
  curl https://mirrors.zju.edu.cn/debian/.mirror-index/pool/main/
  ```

- The reserved API namespace returns the full NGINX autoindex JSON array.
  Directory paths must end with `/`; file requests through this API return 404.
  NGINX omits entries whose names start with a dot. The old Accept-based API is
  deliberately removed.
- The frontend sorts the full array but renders at most 200 entries per page.
  This bounds DOM work, not network transfer: large directories still download
  the complete array. There is no search feature or generated catalog.
- Directory links within a mirror update browser history and fetch only JSON.
  Back/forward navigation works, superseded requests are canceled, and downloads,
  portal links, modifier clicks, and new tabs keep ordinary browser behavior.
  Requests allow up to 180 seconds for a first, uncached directory scan.
- For a local production-style demo, mount a readable sample tree under
  `/usr/share/nginx/html/sample` (without its own `index.html`), then open
  `/sample/` or request `/sample/.mirror-index/`. The bundled demo config uses
  the same API, without production's snapshot-scoped response cache.
- A standalone publish origin routes ordinary directories to the shell at
  `/autoindex/index.html`, proxies the reserved API to cached NGINX autoindex,
  and leaves `/_astro/` routed to the portal. Deploy backend and frontend together:
  the API change is breaking. Old shells/assets are not kept across releases;
  a tab from a previous release may need reloading after an upgrade.

## Special Thanks

UI Designer: [Rynco Maekawa](https://github.com/lynzrand)
