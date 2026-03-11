# ── Dockerfile — Production best practices ───────────────────────────────────
#
# 1. Multi-stage build — the final image has ZERO Node.js or node_modules.
#    Only the compiled static files go into production. Smaller, safer image.
# 2. npm ci instead of npm install — ci is deterministic (uses package-lock.json
#    exactly), faster, and fails if lock file is out of sync. Always use in CI/CD.
# 3. Non-root user — containers should never run as root. This limits blast
#    radius if the container is ever compromised.
# 4. .dockerignore (see separate file) keeps node_modules out of the build context.

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS build

LABEL stage="build"

WORKDIR /app

# Build args — passed from docker-compose at build time, baked into the JS bundle
# .env is gitignored and dockerignored, so we pass values explicitly here instead
ARG VITE_API_URL=/api
ARG VITE_ADMIN_PASSWORD=admin123
ARG VITE_OPERATOR_PASSWORD=operator123

# Make them available to Vite as environment variables during build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMIN_PASSWORD=$VITE_ADMIN_PASSWORD
ENV VITE_OPERATOR_PASSWORD=$VITE_OPERATOR_PASSWORD

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

LABEL maintainer="Asset Guardian"

# Replace default nginx config with our hardened version
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the compiled output — no Node.js, no source code, no secrets
COPY --from=build /app/dist /usr/share/nginx/html

# Run nginx as non-root user (nginx user exists in the official image).
# We grant ownership of every path nginx needs to write at runtime:
#   /usr/share/nginx/html  - static files
#   /var/cache/nginx       - proxy/fastcgi cache
#   /var/log/nginx         - access + error logs
#   /var/run/nginx.pid     - PID file (must pre-exist so nginx can write it)
#   /etc/nginx/conf.d      - our config was copied here
RUN chown -R nginx:nginx /usr/share/nginx/html \
  && chown -R nginx:nginx /var/cache/nginx \
  && chown -R nginx:nginx /var/log/nginx \
  && chown -R nginx:nginx /etc/nginx/conf.d \
  && touch /var/run/nginx.pid \
  && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

# Healthcheck — Docker/orchestrators know if the container is actually serving
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
