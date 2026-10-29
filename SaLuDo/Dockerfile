# Build static assets with Vite
# Node 24 is the active LTS (Node 20 reached end of life on 2026-04-30)
FROM node:24-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=http://localhost:3000/api/
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Serve with the unprivileged nginx image (runs as a non-root user, listens on 8080)
FROM nginxinc/nginx-unprivileged:1.28-alpine AS runner

# Templates are rendered with envsubst into /etc/nginx/conf.d at startup
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY security-headers.inc /etc/nginx/templates/security-headers.inc.template

# The CSP connect-src must allow the backend. Its origins default to the same
# VITE_API_URL the bundle was built with (https://x/api/ -> https://x and wss://x),
# so no extra configuration is needed; API_ORIGIN / API_WS_ORIGIN can still be
# overridden at runtime.
ARG VITE_API_URL=http://localhost:3000/api/
ENV VITE_API_URL=${VITE_API_URL}
COPY --chmod=755 derive-api-origin.envsh /docker-entrypoint.d/15-derive-api-origin.envsh
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
