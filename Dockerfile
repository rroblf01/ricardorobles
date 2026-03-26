# Stage 1: Build
FROM oven/bun:1.3.11-alpine AS builder

WORKDIR /app

COPY bun.lock package.json package-lock.json ./
RUN bun install

COPY . .
RUN bun run build --source-map

# Stage 2: Production
FROM nginx:alpine

COPY --from=builder /app/dist/ricardo-portafolios/browser /usr/share/nginx/html

EXPOSE 80
