# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# System deps for better-sqlite3 native build
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.base.json ./
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/src ./backend/src

RUN npm ci
RUN npm run build:backend


# ---- Runtime stage ----
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Runtime libs for better-sqlite3
RUN apk add --no-cache libstdc++

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Persistent database volume
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV PORT=3000
ENV DB_PATH=/app/data/taskmaster.db
EXPOSE 3000

CMD ["node", "dist/backend/server.js"]
