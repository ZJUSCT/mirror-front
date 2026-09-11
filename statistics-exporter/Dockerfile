# syntax=docker/dockerfile:1.7
FROM node:22-alpine

LABEL org.opencontainers.image.source="https://github.com/ZJUSCT/mirror-front"

WORKDIR /app
COPY --chmod=644 exporter.mjs ./exporter.mjs

# Match the unprivileged NGINX UID used by mirror-front.
RUN mkdir /output && chown 101:101 /output
USER 101:101

ENTRYPOINT ["node", "/app/exporter.mjs"]
