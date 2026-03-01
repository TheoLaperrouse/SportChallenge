FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install all deps (dev + prod) needed to compile TypeScript
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/back/package.json ./packages/back/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter back --store-dir /pnpm/store

# Install production-only deps for the runner
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/back/package.json ./packages/back/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter back --prod --store-dir /pnpm/store

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/back/node_modules ./packages/back/node_modules
COPY packages/back ./packages/back
COPY package.json pnpm-workspace.yaml ./
RUN pnpm --filter back build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/packages/back/node_modules ./packages/back/node_modules
COPY --from=build /app/packages/back/dist ./packages/back/dist
COPY packages/back/package.json ./packages/back/
COPY packages/back/drizzle.config.ts ./packages/back/
COPY packages/back/src/db/migrations ./packages/back/src/db/migrations

WORKDIR /app/packages/back
EXPOSE 3000
CMD ["node", "dist/index.js"]
