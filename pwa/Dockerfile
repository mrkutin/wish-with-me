# Build stage
FROM node:20.11-alpine as build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY ./ .

# Add debug command
RUN ls -la node_modules/.bin/tsx
RUN ls -la node_modules/tsx/dist/

# Build the app
RUN npm run build

# Production stage
FROM node:20.11-alpine as production-stage
WORKDIR /app
RUN npm install -g serve
COPY --from=build-stage /app/dist .
EXPOSE 3001
CMD ["serve", "-l", "3001", "-s", "."]

