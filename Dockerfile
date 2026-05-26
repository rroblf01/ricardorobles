# Stage 1: Build
FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Stage 2: Production
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/ /usr/share/nginx/html/

RUN find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" -o -name "*.svg" -o -name "*.xml" -o -name "*.txt" \) \
    -exec gzip -9 -k {} \;

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
