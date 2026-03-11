# ============================================================
# IWA-SPA Root Dockerfile (delegates to docker/Dockerfile)
# ============================================================

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN npm install --workspace=apps/frontend --workspace=packages/shared
COPY apps/frontend ./apps/frontend
COPY packages/shared ./packages/shared
RUN npm run build --workspace=apps/frontend

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN npm install --workspace=apps/backend --workspace=packages/shared
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared
COPY --from=frontend-builder /app/apps/backend/build ./apps/backend/build
RUN npm run build --workspace=apps/backend

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN npm install --workspace=apps/backend --workspace=packages/shared --omit=dev

COPY --from=backend-builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=backend-builder /app/apps/backend/build ./apps/backend/build
COPY apps/backend/src/db/schema.sql ./apps/backend/dist/db/schema.sql
COPY apps/backend/src/db/seed.sql ./apps/backend/dist/db/seed.sql

# INTENTIONAL: .env baked into image
COPY .env.example .env

ENV PORT=3000
ENV NODE_ENV=production
ENV DB_PATH=/app/apps/backend/database/pharmacy.db
ENV JWT_SECRET=insecure-jwt-secret-do-not-use-in-production

RUN mkdir -p /app/apps/backend/database /app/apps/backend/public/uploads

EXPOSE 3000

CMD sh -c "node -e \"require('./apps/backend/dist/db/init.js').default()\" && node apps/backend/dist/index.js"
