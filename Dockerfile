# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22.23.2
ARG PNPM_VERSION=10.15.1

FROM node:${NODE_VERSION}-bookworm-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 AS build

ARG PNPM_VERSION
ENV ASTRO_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH

WORKDIR /app

RUN corepack enable && corepack prepare "pnpm@${PNPM_VERSION}" --activate

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm run ci
RUN chmod -R a=rX dist

FROM nginxinc/nginx-unprivileged:1.31.0-alpine@sha256:3707417e3304492667a63c90ac0103465330437f9cdfaa38f8cd19f9975cbeed AS runtime

COPY --chmod=644 deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1:8080/healthz || exit 1
