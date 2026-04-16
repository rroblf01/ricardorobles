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

EXPOSE 80

# Healthcheck to ensure the container is running correctly
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
