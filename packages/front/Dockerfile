FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/front/package.json ./packages/front/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter front --store-dir /pnpm/store

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/front/node_modules ./packages/front/node_modules
COPY packages/front ./packages/front
COPY package.json pnpm-workspace.yaml ./
RUN pnpm --filter front build:docker

FROM nginx:alpine AS runner
COPY packages/front/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/front/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
