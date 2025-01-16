# -- BUILDER
FROM node:22.9.0-bullseye-slim AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY . .
RUN npm install

# Build project
RUN npx prisma generate
RUN npm run build

# -- RUNNER
FROM node:22.9.0-bullseye-slim AS base
WORKDIR /usr/src/app

# Update apt and install security updates
RUN apt update && \
    apt upgrade -y && \
    apt install -y ca-certificates && \
    apt clean

# Install required packages
RUN apt install -y wget xz-utils procps

# Download and install ffmpeg based on the architecture
# More files can be found here : https://johnvansickle.com/ffmpeg/
RUN if [ "$(uname -m)" = "x86_64" ]; then \
        wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -O ffmpeg.tar.xz; \
    else \
        wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-arm64-static.tar.xz -O ffmpeg.tar.xz; \
    fi && \
    tar xJf ffmpeg.tar.xz --strip-components=1 -C /usr/local/bin && \
    rm ffmpeg.tar.xz

# Install production-only dependencies (this will ignore devDependencies)
COPY ./package.json ./
COPY ./package-lock.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Playwright's dependencies
RUN npx playwright install chromium --with-deps

# Copy project specific files
COPY --from=builder /usr/src/app/dist ./dist
COPY ./prisma ./prisma

# Generate Prisma
RUN npx prisma generate

ENV NODE_ENV=production
CMD npm run start
