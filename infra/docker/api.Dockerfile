FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api-server/package.json ./apps/api-server/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY apps/api-server ./apps/api-server
COPY tsconfig.base.json ./

# Build
WORKDIR /app/apps/api-server
RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/index.js"]
