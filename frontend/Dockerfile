# -- BUILDER
FROM node:22.9.0-bullseye-slim as builder
WORKDIR /usr/src/app
ENV NODE_ENV=development
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Install dependencies
COPY . .
RUN npm install

# Build project
RUN npm run build

# -- RUNNER
FROM node:22.9.0-bullseye-slim AS base
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Update apt and install security updates
RUN apt update && \
    apt upgrade -y && \
    apt install -y ca-certificates && \
    apt clean

# Install production-only dependencies (this will ignore devDependencies because NODE_ENV is set to production)
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install

# Copy project specific files
COPY --from=builder /usr/src/app/.next ./.next
COPY ./next.config.mjs ./next.config.mjs
COPY ./public ./public

CMD npm run start