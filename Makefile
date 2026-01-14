.PHONY: help lint lint-fix type-check qa start stop build prisma-generate prisma-migrate-generate prisma-migrate-deploy prisma-migrate-diff cli

COMPOSE := docker compose
NPM := $(COMPOSE) exec frontend npm
POSTGRES_TEST_URL := postgresql://lunisoft:ChangeMe@postgres-test:5432/test

##———————————— Commands

help: ## Show this help page
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' Makefile | awk 'BEGIN {FS = ":.*?##"}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

##———————————— Environment Management

start: ## Start the development environment
	$(COMPOSE) up --renew-anon-volumes

stop: ## Stop the development environment
	$(COMPOSE) down

build: ## Build the project
	$(COMPOSE) build

##———————————— Code Quality

lint: ## Launch ESLint
	$(NPM) lint

lint-fix: ## Launch ESLint with autofix
	$(NPM) lint --fix

type-check: ## Launch TypeScript type checking
	$(NPM) type-check

qa: lint-fix type-check ## Launch quality automation (lint, type checking...)

##———————————— Prisma Database

prisma-g: ## Generate Prisma Client files
	cd backend && npx prisma generate
	$(COMPOSE) exec backend npx prisma generate
	$(COMPOSE) restart backend

prisma-m-g: ## Automatically generate new Prisma migration
	$(COMPOSE) exec backend npx prisma migrate dev --create-only

prisma-m-deploy: ## Apply the latest Prisma migrations
	$(COMPOSE) exec backend npx prisma migrate deploy
	cd backend && npx prisma generate
	$(COMPOSE) exec backend npx prisma generate
	$(COMPOSE) restart backend

prisma-m-diff: ## Check if database is up to date with schema file
	$(COMPOSE) exec backend npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script

##———————————— Testing

test: ## Run unit tests
	$(COMPOSE) exec -e NODE_ENV=test backend npm test

test-watch: ## Run tests in watch mode
	$(COMPOSE) exec -e NODE_ENV=test backend npm run test:watch	

test-e2e: ## Run tests (migrate test database and run E2E tests)
	$(COMPOSE) exec -e NODE_ENV=test -e APP_DATABASE_CONNECTION_URL=$(POSTGRES_TEST_URL) backend npx prisma migrate reset --force
	$(COMPOSE) exec -e NODE_ENV=test backend npm run test:e2e

##———————————— Container Management

bb: ## Run bash in the backend container
	$(COMPOSE) exec backend bash

bf: ## Run bash in the frontend container
	$(COMPOSE) exec frontend bash
