.PHONY: help lint lint-fix type-check qa start stop build prisma-generate prisma-migrate-generate prisma-migrate-deploy prisma-migrate-diff cli

EXEC_FRONTEND := docker compose exec ts-starter-frontend
EXEC_BACKEND := docker compose exec ts-starter-backend
POSTGRES_TEST_URL := postgresql://lunisoft:ChangeMe@postgres-test:5432/test

##———————————— Commands

help: ## Show this help page
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' Makefile | awk 'BEGIN {FS = ":.*?##"}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

##———————————— Environment Management

start: ## Start the development environment
	docker compose up --renew-anon-volumes

stop: ## Stop the development environment
	docker compose down

build: ## Build the project
	docker compose build

db-reset: ## Reset database to the initial state
	docker compose down -v && docker compose up -d

redis-flush: ## Flush Redis database
	docker compose exec ts-starter-redis redis-cli FLUSHDB

##———————————— Code Quality

lint: ## Launch ESLint
	$(EXEC_FRONTEND) npm run lint
	$(EXEC_BACKEND) npm run lint

lint-fix: ## Launch ESLint with autofix
	$(EXEC_FRONTEND) npm run lint --fix
	$(EXEC_BACKEND) npm run lint --fix

type-check: ## Launch TypeScript type checking
	cd backend && npm run type-check

qa: lint-fix type-check ## Launch quality automation (lint, type checking...)

##———————————— Prisma Database

prisma-g: ## Generate Prisma Client files
	cd backend && npx prisma generate
	$(EXEC_BACKEND) npx prisma generate
	docker compose restart ts-starter-backend

prisma-m-g: ## Automatically generate new Prisma migration
	$(EXEC_BACKEND) npx prisma migrate dev --create-only

prisma-m-deploy: ## Apply the latest Prisma migrations
	$(EXEC_BACKEND) npx prisma migrate deploy
	cd backend && npx prisma generate
	$(EXEC_BACKEND) npx prisma generate
	docker compose restart ts-starter-backend

prisma-m-diff: ## Check if database is up to date with schema file
	$(EXEC_BACKEND) npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script

##———————————— Testing

test: ## Run unit tests
	docker compose exec -e NODE_ENV=test ts-starter-backend npm test

test-e2e: ## Run tests (migrate test database and run E2E tests)
	docker compose exec -e NODE_ENV=test -e APP_DATABASE_CONNECTION_URL=$(POSTGRES_TEST_URL) ts-starter-backend npx prisma migrate reset --force
	docker compose exec -e NODE_ENV=test ts-starter-backend npm run test:e2e

##———————————— Container Management

bb: ## Run bash in the backend container
	$(EXEC_BACKEND) bash

bf: ## Run bash in the frontend container
	$(EXEC_FRONTEND) bash
