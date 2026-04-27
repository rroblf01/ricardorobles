# Stage 1: Build
FROM oven/bun:1.3.11-alpine AS builder

WORKDIR /app

# Copy lock files and package.json for better caching
COPY bun.lock package.json package-lock.json ./
RUN bun install

# Copy source code
COPY . .

# Build for production without source maps
RUN bun run build --no-source-map

# Stage 2: Production
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist/ricardo-portafolios/browser /usr/share/nginx/html

# Pre-compress static assets for gzip_static
RUN find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" -o -name "*.svg" -o -name "*.xml" -o -name "*.txt" \) \
    -exec gzip -9 -k {} \;

EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]
