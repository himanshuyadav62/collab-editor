FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy all source files first
COPY . .

# Install dependencies (including devDependencies for build)
RUN pnpm install --no-frozen-lockfile

# Build packages in dependency order
RUN pnpm --filter @collab-editor/collab build && \
    pnpm --filter @collab-editor/ui build && \
    pnpm --filter @collab-editor/editor build && \
    pnpm --filter @collab-editor/web build

# Production image
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
