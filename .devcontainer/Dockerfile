FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

ENV TZ=Asia/Shanghai \
    ASTRO_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/home/node/.local/share/pnpm \
    PATH=/home/node/.local/share/pnpm:$PATH

RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
