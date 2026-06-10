# ── Stage 1: Builder ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifests first — this is the layer caching trick you know from Stage 3.
# If package.json hasn't changed, Docker reuses the cached npm ci layer.
# Only if package.json changes does it re-run npm ci.
COPY package*.json ./
RUN npm ci

# Now copy source AFTER installing deps (so code changes don't bust the cache)
COPY . .

# Compile TypeScript → dist/
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# In this repo typescript/ts-node are in dependencies (not devDeps),
# so --omit=dev won't remove them. That's fine — they just sit unused.
# A clean prod image would move them to devDependencies, but that's a
# separate cleanup. This still works correctly.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only the compiled output from the builder — source .ts files never
# enter the production image. This is the whole point of multi-stage.
COPY --from=builder /app/dist ./dist

# Tell Docker this container listens on 3001 (documentation — doesn't actually
# open the port, that's done at runtime with -p or in compose)
EXPOSE 3001

# Use the same command as your package.json start script
CMD ["node", "dist/server.js"]