# ZJU Mirror frontend

The ZJU Mirror portal is a statically generated Astro site with small React
islands for live mirror status, search, and interactive MirrorZ guides.

## Development

The supported toolchain is Node.js 22.23.2 and pnpm 10.15.1.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Run the complete source and artifact contract with:

```sh
pnpm run ci
```

The production image is an unprivileged NGINX server on port 8080. Build it
with `docker build -t mirror-front .`.

A successful CI run for a push to `main` publishes an immutable GHCR image,
scans it, and attaches provenance and an SBOM. Image selection and deployment
are deliberately outside this repository.

## Content and runtime data

- ZJU announcements remain under `news/`.
- Shared mirror guides come from the pinned `vendor/mirrorz-docs` submodule;
  the exact commit and license are recorded in `mirrorz-docs.lock.json`.
- The browser reads the same-origin `/api/v2/mirrorgo.json` compatibility
  endpoint and normalizes it through `src/lib/api-contract/`.
- Mirror file links use `https://mirrors.zju.edu.cn`.
- `fancy-index/before.html` and `fancy-index/after.html` are first-class build
  products consumed by origin NGINX.

## Special Thanks

UI Designer: [Rynco Maekawa](https://github.com/lynzrand)
