# -----------------------------
# 🧱 Base stage
# -----------------------------
FROM node:18 AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY turbo.json ./

# Copy package.json files for workspaces only (not full source)
COPY apps/web/package.json ./apps/web/
COPY packages/server/package.json ./packages/server/

# -----------------------------
# 🧪 Development stage
# -----------------------------
FROM base AS development

# Install all dependencies
RUN pnpm install

# Copy full source code
COPY . .

EXPOSE 4000

CMD ["pnpm", "--filter", "server", "dev"]

# -----------------------------
# 📦 Dependencies stage (production only)
# -----------------------------
FROM base AS deps

RUN pnpm install --prod --frozen-lockfile

# -----------------------------
# 🏗️ Build stage (if applicable)
# -----------------------------
FROM base AS builder

RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter=server build || echo "No build script found, skipping build"

# -----------------------------
# 🚀 Production stage
# -----------------------------
FROM node:18-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 server

# Copy built server
COPY --from=builder --chown=server:nodejs /app/packages/server ./packages/server
COPY --from=deps --chown=server:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=server:nodejs /app/packages/server/node_modules ./packages/server/node_modules

USER server

EXPOSE 4000

ENV NODE_ENV=production

CMD ["pnpm", "--filter", "server", "start"]
