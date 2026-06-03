# Stage 1: dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: production
FROM node:20-alpine
RUN apk add --no-cache wget
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

USER node

CMD ["node", "src/server.js"]
