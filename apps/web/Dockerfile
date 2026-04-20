FROM node:22-alpine AS base
RUN corepack enable pnpm

# --- Prune monorepo ---
FROM base AS pruner
RUN npm i -g turbo@latest
WORKDIR /app
COPY . .
RUN turbo prune @portfolio/web --docker

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/ .
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @portfolio/web build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 app

COPY --from=builder --chown=app:app /app/apps/web/dist ./dist

USER app
EXPOSE 3000

CMD ["node", "dist/server/server.js"]
