# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY frontend/tsconfig.json ./frontend/tsconfig.json
COPY frontend/index.html ./frontend/index.html
COPY frontend/src ./frontend/src

RUN npm ci --ignore-scripts
RUN npm run build:frontend


# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runner

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/frontend /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
