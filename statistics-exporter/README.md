# Statistics exporter

This sidecar periodically renders selected Grafana panels to PNG files for
mirror-front's `/statistics/` and `/en/statistics/` pages. It uses Node.js 22 with
no additional packages. Visitors only request static files; they never trigger
Grafana queries.

## Configuration

Mount a JSON configuration at `/etc/statistics-exporter/panels.json`. Start with
[`panels.example.json`](panels.example.json) and replace the dashboard UID and
panel ID with the panels you want to publish. `width`, `height`, `lookback`, and
`timezone` apply to all panels. `lookback` is a positive integer followed by `h`.
Panel variables accept either a single value or a list of values. Use distinct
`id` values to export the same Grafana panel with different variables.

Both light and dark images are generated. Titles in the page follow its
language; text inside the PNG comes from the Grafana panel itself.

Configure authentication with these environment variables:

| Variable | Value |
| --- | --- |
| `GRAFANA_URL` | Required Grafana base URL, normally its internal Service URL |
| `GRAFANA_USERNAME_FILE` | Defaults to `/etc/grafana-credentials/admin-user` |
| `GRAFANA_PASSWORD_FILE` | Defaults to `/etc/grafana-credentials/admin-password` |
| `GRAFANA_TOKEN_FILE` | Optional service-account token file; uses Bearer authentication instead of username/password |

Mount the existing Grafana admin username and password as files **only in the
exporter container**. Files are read verbatim, so do not append newlines to
credentials. The configuration and credentials are re-read for each export.
Grafana's remote image renderer must already be deployed and working.

The exporter runs immediately, using the most recent hour boundary. For a
24-hour lookback, starting at 13:14 renders yesterday 13:00 through today 13:00.
The next run starts at 14:00. Every panel and theme in a batch uses the same
absolute timestamps. Renders run sequentially; if a batch runs past the next
hour, the following batch starts immediately using the latest hour boundary.

## Sidecar deployment

Each mirror-front Pod runs one exporter and shares an `emptyDir` with NGINX:

| Container | Mount | Access |
| --- | --- | --- |
| Exporter | `/output` | Read/write |
| mirror-front NGINX | `/usr/share/nginx/html/statistics-data` | Read-only |

No PVC, distribution service, or Falcon changes are needed. Each replica
generates its own copies; two replicas with N panels make 4N render requests per
hour, accounting for both themes. A new Pod regenerates its files on startup.

The exporter image runs as UID/GID `101:101`, matching mirror-front's NGINX.
Set the Pod's `fsGroup: 101` so the shared `emptyDir` is writable. The exporter
supports a read-only root filesystem, dropped capabilities, and no Kubernetes
API token. Mount its ConfigMap and Secret separately from the public output
directory. Kubernetes Secrets must exist in the same namespace as the Pod.

Output consists of fixed filenames (`<id>-light.png`, `<id>-dark.png`) and
`manifest.json`. The manifest contains shared dimensions, Unix-millisecond
`from`/`to` timestamps, and panel IDs, bilingual titles, and image filenames.
It excludes credentials, Grafana URLs, dashboard UIDs, and query variables.

Files are overwritten directly. Publication is best-effort, not transactional;
readers can briefly see an incomplete file or images from different batches.
The exporter checks HTTP success and the PNG signature before writing an image.
A failed render stops that batch, logs the error, and waits for the next hour.
The manifest is written after all images complete. There are no retries,
version histories, or persistent backups.

The frontend refreshes the manifest and image URLs every five minutes, using
cache busting for the fixed PNG names. It shows a placeholder until the first
manifest is available. The existing mirror-front NGINX configuration can serve
the mounted directory without additional routes.

## Build and verification

From the repository root:

```sh
docker compose run --rm dev node --test statistics-exporter/exporter.test.mjs
docker build --tag mirror-front-statistics-exporter statistics-exporter
```

The executable accepts `--config PATH`, `--output PATH`, and `--once`. `--once`
performs one export and exits with a nonzero status if it fails; it is useful
for checking a configuration before enabling the sidecar.

CI tests, builds, and scans the exporter image alongside the frontend image.
Successful pushes to `main` publish
`ghcr.io/zjusct/mirror-front-statistics-exporter` with `latest` and the same
seven-character commit tag as `ghcr.io/zjusct/mirror-front`.
