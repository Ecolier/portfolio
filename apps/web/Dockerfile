FROM node:22-alpine AS base
RUN corepack enable pnpm

# --- Prune monorepo ---
FROM base AS pruner
RUN npm i -g turbo@latest
WORKDIR /app
COPY . .
RUN turbo prune @portfolio/web --docker

# --- Install & Build ---
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @portfolio/web build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.output ./

RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 app && \
    chown -R app:app /app

USER app
EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", "server/index.mjs"]
