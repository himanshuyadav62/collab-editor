FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy all source files first
COPY . .

# Install dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Build packages in dependency order
RUN pnpm --filter @collab-editor/collab build && \
    pnpm --filter @collab-editor/collab-server build

# Production image
FROM node:20-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/collab-server/package.json ./apps/collab-server/
COPY --from=builder /app/apps/collab-server/dist ./apps/collab-server/dist
COPY --from=builder /app/packages/collab/package.json ./packages/collab/
COPY --from=builder /app/packages/collab/dist ./packages/collab/dist
COPY --from=builder /app/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

EXPOSE 1234
CMD ["node", "apps/collab-server/dist/index.js"]
