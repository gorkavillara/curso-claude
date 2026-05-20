# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# System deps for better-sqlite3 native build
RUN apk add --no-cache python3
RUN apk add --no-cache make
RUN apk add --no-cache g++

# Copy everything first (cache-busting problem: any code change invalidates npm install)
COPY . .

RUN npm ci
RUN npm run build:backend


# ---- Runtime stage ----
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Runtime libs for better-sqlite3
RUN apk add --no-cache libstdc++

COPY package*.json ./
RUN npm ci --omit=dev
RUN npm cache clean --force

COPY --from=builder /app/dist ./dist

# Persistent database volume
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV PORT=3000
ENV DATABASE_URL=/app/data/taskmaster.db
EXPOSE 3000

CMD ["node", "dist/backend/server.js"]
