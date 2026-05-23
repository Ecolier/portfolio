FROM node:22-alpine AS base
RUN corepack enable pnpm && corepack prepare pnpm@10.33.0 --activate

# --- Prune monorepo ---
FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm dlx turbo@2.9.14 prune @portfolio/web --docker

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
