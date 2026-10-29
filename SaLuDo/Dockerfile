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

# Backend origins allowed by the Content-Security-Policy connect-src.
# Override at runtime, e.g. API_ORIGIN=https://api.example.com API_WS_ORIGIN=wss://api.example.com
ENV API_ORIGIN=http://localhost:3000 \
    API_WS_ORIGIN=ws://localhost:3000

# Templates are rendered with envsubst into /etc/nginx/conf.d at startup
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY security-headers.inc /etc/nginx/templates/security-headers.inc.template
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
