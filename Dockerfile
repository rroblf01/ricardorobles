# Stage 1: Build
FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun run build
RUN ls -la /app/dist && test -f /app/dist/index.html

# Precompress text assets so gofly serves .gz directly (precompressed: true)
RUN find /app/dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" -o -name "*.svg" -o -name "*.xml" -o -name "*.txt" -o -name "*.webmanifest" \) \
    -exec gzip -9 -k {} \;

COPY --from=ghcr.io/rroblf01/gofly:1.1.1 /gofly /gofly
RUN /gofly -convert nginx.conf > /config.json && /gofly -t -config /config.json

# Stage 2: Production
FROM debian:trixie-slim
COPY --from=ghcr.io/rroblf01/gofly:1.1.1 /gofly /gofly

COPY --from=builder /config.json /etc/gofly/config.json
COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["/gofly","-config","/etc/gofly/config.json"]
