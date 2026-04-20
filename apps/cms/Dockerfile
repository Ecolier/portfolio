FROM node:22-alpine AS base
RUN corepack enable pnpm

# --- Prune monorepo ---
FROM base AS pruner
RUN npm i -g turbo@latest
WORKDIR /app
COPY . .
RUN turbo prune @portfolio/cms --docker

# --- Install & Build ---
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @portfolio/cms build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN mkdir -p apps/cms/.next apps/cms/media && \
    chown nextjs:nodejs apps/cms/.next apps/cms/media

COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/.next/static ./apps/cms/.next/static

USER nextjs
EXPOSE 3001
ENV PORT=3001

CMD ["node", "apps/cms/server.js"]
