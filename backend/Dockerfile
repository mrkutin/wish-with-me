FROM ghcr.io/puppeteer/puppeteer:latest AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Production stage
FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY docker-entrypoint-initdb.d/init-db.sh /docker-entrypoint-initdb.d/

RUN npm ci --only=production

EXPOSE 3000

# Wait for CouchDB and run initialization script before starting the app
CMD ["/bin/bash", "-c", "/docker-entrypoint-initdb.d/init-db.sh && node src/index.js"] 