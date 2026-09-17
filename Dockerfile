# syntax=docker/dockerfile:1

# ---- Stage 1: build the frontend (Vite) ----
FROM node:20.19-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Production build emits relative API URLs (single-origin) via import.meta.env.PROD.
RUN npm run build

# ---- Stage 2: build the backend (TypeScript + Prisma client) ----
FROM node:20.19-alpine AS backend-build
# openssl/libc6-compat are required by Prisma's engines on Alpine (musl).
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate && npm run build

# ---- Stage 3: runtime image ----
FROM node:20.19-alpine AS runtime
# openssl/libc6-compat are required by Prisma's engines on Alpine (musl).
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production
ENV SERVE_FRONTEND=true
WORKDIR /app

# Backend build output, dependencies (incl. Prisma CLI for migrate/seed) and schema.
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/prisma ./prisma
COPY --from=backend-build /app/backend/package.json ./package.json
COPY backend/tsconfig.json ./tsconfig.json

# Built frontend served as static files at the same origin (see src/index.ts).
COPY --from=frontend-build /app/frontend/dist ./public

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/index.js"]
